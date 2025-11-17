import prisma from '../config/database'

/**
 * Servicio de notificaciones
 */
export class NotificationService {
  /**
   * Obtener notificaciones del usuario
   */
  async getUserNotifications(userId: string, page = 1, limit = 20, unreadOnly = false) {
    const skip = (page - 1) * limit

    const where: any = { userId }
    if (unreadOnly) {
      where.isRead = false
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ])

    return {
      notifications,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Crear notificación
   */
  async create(data: {
    userId: string
    title: string
    message: string
    type: string
    relatedTo?: string
    relatedId?: string
  }) {
    const notification = await prisma.notification.create({
      data,
    })

    return notification
  }

  /**
   * Crear notificaciones para múltiples usuarios
   * Optimizado para usar batch insert cuando hay múltiples usuarios
   */
  async createMany(
    userIds: string[],
    data: {
      title: string
      message: string
      type: string
      relatedTo?: string
      relatedId?: string
    }
  ) {
    if (userIds.length === 0) {
      return []
    }

    // Si hay un solo usuario, usar create normal
    if (userIds.length === 1) {
      const notification = await prisma.notification.create({
        data: {
          userId: userIds[0],
          ...data,
        },
      })
      return [notification]
    }

    // Para múltiples usuarios, usar createMany de Prisma (mucho más eficiente)
    // Prisma createMany no retorna los registros, pero es mucho más rápido
    // Agrupamos en batches de 100 para evitar límites de la base de datos
    const BATCH_SIZE = 100
    const batches: string[][] = []
    
    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      batches.push(userIds.slice(i, i + BATCH_SIZE))
    }

    // Usar createMany de Prisma para cada batch (mucho más eficiente que múltiples creates)
    for (const batch of batches) {
      await prisma.notification.createMany({
        data: batch.map((userId) => ({
          userId,
          title: data.title,
          message: data.message,
          type: data.type,
          relatedTo: data.relatedTo,
          relatedId: data.relatedId,
          isRead: false,
        })),
        skipDuplicates: true, // Evitar errores si hay duplicados
      })
    }

    // Retornar array vacío ya que createMany no retorna los registros
    // Esto es aceptable porque las notificaciones se pueden consultar después si es necesario
    return []
  }

  /**
   * Cache de administradores activos (se actualiza cada 5 minutos)
   */
  private adminCache: { userIds: string[]; timestamp: number } | null = null
  private readonly ADMIN_CACHE_TTL = 5 * 60 * 1000 // 5 minutos

  /**
   * Obtener IDs de administradores activos (con caché)
   */
  private async getAdminIds(): Promise<string[]> {
    const now = Date.now()
    
    // Si el caché es válido, usarlo
    if (this.adminCache && (now - this.adminCache.timestamp) < this.ADMIN_CACHE_TTL) {
      return this.adminCache.userIds
    }

    // Obtener administradores de la base de datos
    const admins = await prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          name: 'Administrador',
        },
      },
      select: { id: true },
    })

    const adminIds = admins.map((u) => u.id)
    
    // Actualizar caché
    this.adminCache = {
      userIds: adminIds,
      timestamp: now,
    }

    return adminIds
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      throw new Error('Notificación no encontrada')
    }

    if (notification.userId !== userId) {
      throw new Error('No tiene permisos para marcar esta notificación')
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return updated
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return { message: 'Todas las notificaciones marcadas como leídas' }
  }

  /**
   * Eliminar notificación
   */
  async delete(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      throw new Error('Notificación no encontrada')
    }

    if (notification.userId !== userId) {
      throw new Error('No tiene permisos para eliminar esta notificación')
    }

    await prisma.notification.delete({
      where: { id },
    })

    return { message: 'Notificación eliminada' }
  }

  /**
   * Eliminar todas las notificaciones leídas
   */
  async deleteAllRead(userId: string) {
    await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    })

    return { message: 'Notificaciones leídas eliminadas' }
  }

  // ============ NOTIFICACIONES AUTOMÁTICAS ============

  /**
   * Notificar sobre nuevo ingreso de vehículo
   */
  async notifyVehicleEntry(entryId: string) {
    if (!entryId) return

    const entry = await prisma.vehicleEntry.findUnique({
      where: { id: entryId },
      include: {
        vehicle: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        workshop: {
          include: {
            users: {
              where: {
                isActive: true,
                role: {
                  name: { in: ['Jefe de Taller', 'Recepcionista'] },
                },
              },
              select: { id: true },
            },
          },
        },
      },
    })

    if (!entry) return

    // Obtener usuarios del taller (Jefe de Taller y Recepcionista)
    const workshopUserIds = entry.workshop.users.map((u) => u.id)
    
    // Obtener administradores (con caché)
    const adminIds = await this.getAdminIds()
    
    // Combinar todos los IDs, eliminando duplicados
    const userIds = [...new Set([...workshopUserIds, ...adminIds])]
    
    // Obtener nombre del actor responsable
    const actorName = entry.createdBy
      ? `${entry.createdBy.firstName} ${entry.createdBy.lastName}`.trim()
      : 'Sistema'

    if (userIds.length > 0) {
      await this.createMany(userIds, {
        title: 'Nuevo ingreso de vehículo',
        message: `Vehículo ${entry.vehicle.licensePlate} ingresado por ${actorName} - Código: ${entry.entryCode}`,
        type: 'vehicle_entry',
        relatedTo: 'vehicle-entries',
        relatedId: entry.id,
      })
    }
  }

  /**
   * Notificar sobre nueva orden de trabajo
   */
  async notifyWorkOrderCreated(workOrderId: string) {
    if (!workOrderId) return

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        vehicle: true,
        assignedTo: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!workOrder) return

    // Obtener nombre del actor responsable
    const actorName = workOrder.createdBy
      ? `${workOrder.createdBy.firstName} ${workOrder.createdBy.lastName}`.trim()
      : 'Sistema'

    const userIds: string[] = []

    // Notificar al usuario asignado si existe
    if (workOrder.assignedToId) {
      userIds.push(workOrder.assignedToId)
    }

    // Obtener administradores (con caché)
    const adminIds = await this.getAdminIds()
    
    // Combinar todos los IDs, eliminando duplicados
    const allUserIds = [...new Set([...userIds, ...adminIds])]

    if (allUserIds.length > 0) {
      await this.createMany(allUserIds, {
        title: workOrder.assignedToId 
          ? 'Nueva orden de trabajo asignada'
          : 'Nueva orden de trabajo creada',
        message: workOrder.assignedToId
          ? `Se le ha asignado la orden ${workOrder.orderNumber} para ${workOrder.vehicle.licensePlate} por ${actorName}`
          : `Se ha creado la orden ${workOrder.orderNumber} para ${workOrder.vehicle.licensePlate} por ${actorName}`,
        type: 'work_order_assigned',
        relatedTo: 'work-orders',
        relatedId: workOrder.id,
      })
    }
  }

  /**
   * Notificar sobre orden de trabajo completada
   */
  async notifyWorkOrderCompleted(workOrderId: string) {
    if (!workOrderId) return

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        vehicle: true,
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        workshop: {
          include: {
            users: {
              where: {
                isActive: true,
                role: {
                  name: 'Recepcionista',
                },
              },
              select: { id: true },
            },
          },
        },
      },
    })

    if (!workOrder) return

    const userIds: string[] = []

    // Obtener recepcionistas del taller
    const receptionistIds = workOrder.workshop.users.map((u) => u.id)
    userIds.push(...receptionistIds)

    // Obtener administradores (con caché)
    const adminIds = await this.getAdminIds()
    userIds.push(...adminIds)

    // Obtener todos los Guardias activos del taller
    const guards = await prisma.user.findMany({
      where: {
        isActive: true,
        workshopId: workOrder.workshopId,
        role: {
          name: 'Guardia',
        },
      },
      select: { id: true },
    })
    const guardIds = guards.map((u) => u.id)
    userIds.push(...guardIds)

    // Obtener nombre del mecánico que completó la orden
    const mechanicName = workOrder.assignedTo
      ? `${workOrder.assignedTo.firstName} ${workOrder.assignedTo.lastName}`.trim()
      : 'Mecánico'

    // Combinar todos los IDs, eliminando duplicados
    const allUserIds = [...new Set(userIds)]

    if (allUserIds.length > 0) {
      await this.createMany(allUserIds, {
        title: 'Orden de trabajo completada',
        message: `La orden ${workOrder.orderNumber} para el vehículo ${workOrder.vehicle.licensePlate} ha sido completada por ${mechanicName}`,
        type: 'work_order_completed',
        relatedTo: 'work-orders',
        relatedId: workOrder.id,
      })
    }
  }

  /**
   * Notificar sobre stock bajo de repuestos
   */
  async notifyLowStock(sparePartId: string) {
    if (!sparePartId) return

    const sparePart = await prisma.sparePart.findUnique({
      where: { id: sparePartId },
    })

    if (!sparePart) return

    // Notificar a encargados de inventario
    const inventoryManagers = await prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          name: { in: ['Encargado de Inventario', 'Jefe de Taller', 'Administrador'] },
        },
      },
      select: { id: true },
    })

    const userIds = inventoryManagers.map((u) => u.id)

    await this.createMany(userIds, {
      title: 'Alerta de stock bajo',
      message: `El repuesto ${sparePart.name} (${sparePart.code}) tiene stock bajo: ${sparePart.currentStock} unidades`,
      type: 'low_stock',
      relatedTo: 'spare-parts',
      relatedId: sparePart.id,
    })
  }

  /**
   * Notificar sobre salida de vehículo registrada
   */
  async notifyVehicleExit(entryId: string) {
    if (!entryId) return

    const entry = await prisma.vehicleEntry.findUnique({
      where: { id: entryId },
      include: {
        vehicle: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        workshop: {
          include: {
            users: {
              where: {
                isActive: true,
                role: {
                  name: { in: ['Jefe de Taller', 'Recepcionista'] },
                },
              },
              select: { id: true },
            },
          },
        },
      },
    })

    if (!entry) return

    const userIds: string[] = []

    // Obtener usuarios del taller (Jefe de Taller y Recepcionista)
    const workshopUserIds = entry.workshop.users.map((u) => u.id)
    userIds.push(...workshopUserIds)

    // Obtener administradores (con caché)
    const adminIds = await this.getAdminIds()
    userIds.push(...adminIds)

    // Obtener nombre del guardia que registró la salida
    const guardName = entry.createdBy
      ? `${entry.createdBy.firstName} ${entry.createdBy.lastName}`.trim()
      : 'Sistema'

    const allUserIds = [...new Set(userIds)]

    if (allUserIds.length > 0) {
      await this.createMany(allUserIds, {
        title: 'Salida de vehículo registrada',
        message: `El vehículo ${entry.vehicle.licensePlate} ha salido del taller. Registrado por ${guardName}`,
        type: 'vehicle_exit',
        relatedTo: 'vehicle-entries',
        relatedId: entry.id,
      })
    }
  }

  /**
   * Notificar sobre orden de trabajo pausada
   */
  async notifyWorkOrderPaused(workOrderId: string, reason: string) {
    if (!workOrderId) return

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        vehicle: true,
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        workshop: {
          include: {
            users: {
              where: {
                isActive: true,
                role: {
                  name: 'Jefe de Taller',
                },
              },
              select: { id: true },
            },
          },
        },
      },
    })

    if (!workOrder) return

    const userIds: string[] = []

    // Notificar al mecánico asignado si existe
    if (workOrder.assignedToId) {
      userIds.push(workOrder.assignedToId)
    }

    // Obtener jefes de taller del taller
    const workshopManagerIds = workOrder.workshop.users.map((u) => u.id)
    userIds.push(...workshopManagerIds)

    // Obtener administradores (con caché)
    const adminIds = await this.getAdminIds()
    userIds.push(...adminIds)

    const allUserIds = [...new Set(userIds)]

    if (allUserIds.length > 0) {
      await this.createMany(allUserIds, {
        title: 'Orden de trabajo pausada',
        message: `La orden ${workOrder.orderNumber} para ${workOrder.vehicle.licensePlate} ha sido pausada. Razón: ${reason}`,
        type: 'work_order_paused',
        relatedTo: 'work-orders',
        relatedId: workOrder.id,
      })
    }
  }

  /**
   * Notificar sobre orden de trabajo cancelada
   */
  async notifyWorkOrderCancelled(workOrderId: string) {
    if (!workOrderId) return

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        vehicle: true,
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        workshop: {
          include: {
            users: {
              where: {
                isActive: true,
                role: {
                  name: { in: ['Jefe de Taller', 'Recepcionista'] },
                },
              },
              select: { id: true },
            },
          },
        },
      },
    })

    if (!workOrder) return

    const userIds: string[] = []

    // Notificar al mecánico asignado si existe
    if (workOrder.assignedToId) {
      userIds.push(workOrder.assignedToId)
    }

    // Obtener usuarios del taller (Jefe de Taller y Recepcionista)
    const workshopUserIds = workOrder.workshop.users.map((u) => u.id)
    userIds.push(...workshopUserIds)

    // Obtener administradores (con caché)
    const adminIds = await this.getAdminIds()
    userIds.push(...adminIds)

    const allUserIds = [...new Set(userIds)]

    if (allUserIds.length > 0) {
      await this.createMany(allUserIds, {
        title: 'Orden de trabajo cancelada',
        message: `La orden ${workOrder.orderNumber} para ${workOrder.vehicle.licensePlate} ha sido cancelada`,
        type: 'work_order_cancelled',
        relatedTo: 'work-orders',
        relatedId: workOrder.id,
      })
    }
  }

  /**
   * Notificar sobre orden de trabajo iniciada (en_progreso)
   */
  async notifyWorkOrderStarted(workOrderId: string) {
    if (!workOrderId) return

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        vehicle: true,
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        workshop: {
          include: {
            users: {
              where: {
                isActive: true,
                role: {
                  name: 'Jefe de Taller',
                },
              },
              select: { id: true },
            },
          },
        },
      },
    })

    if (!workOrder) return

    const userIds: string[] = []

    // Obtener jefes de taller del taller
    const workshopManagerIds = workOrder.workshop.users.map((u) => u.id)
    userIds.push(...workshopManagerIds)

    // Obtener administradores (con caché)
    const adminIds = await this.getAdminIds()
    userIds.push(...adminIds)

    // Obtener nombre del mecánico
    const mechanicName = workOrder.assignedTo
      ? `${workOrder.assignedTo.firstName} ${workOrder.assignedTo.lastName}`.trim()
      : 'Mecánico'

    const allUserIds = [...new Set(userIds)]

    if (allUserIds.length > 0) {
      await this.createMany(allUserIds, {
        title: 'Orden de trabajo iniciada',
        message: `La orden ${workOrder.orderNumber} para ${workOrder.vehicle.licensePlate} ha sido iniciada por ${mechanicName}`,
        type: 'work_order_started',
        relatedTo: 'work-orders',
        relatedId: workOrder.id,
      })
    }
  }

  /**
   * Notificar sobre solicitud de repuesto
   */
  async notifySparePartRequested(workOrderSparePartId: string) {
    if (!workOrderSparePartId) return

    const request = await prisma.workOrderSparePart.findUnique({
      where: { id: workOrderSparePartId },
      include: {
        sparePart: true,
        workOrder: {
          include: {
            vehicle: true,
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    if (!request) return

    const userIds: string[] = []

    // Obtener encargados de inventario y jefes de taller
    const inventoryManagers = await prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          name: { in: ['Encargado de Inventario', 'Jefe de Taller'] },
        },
      },
      select: { id: true },
    })
    const managerIds = inventoryManagers.map((u) => u.id)
    userIds.push(...managerIds)

    // Obtener administradores (con caché)
    const adminIds = await this.getAdminIds()
    userIds.push(...adminIds)

    const mechanicName = request.workOrder.assignedTo
      ? `${request.workOrder.assignedTo.firstName} ${request.workOrder.assignedTo.lastName}`.trim()
      : 'Mecánico'

    const allUserIds = [...new Set(userIds)]

    if (allUserIds.length > 0) {
      await this.createMany(allUserIds, {
        title: 'Solicitud de repuesto',
        message: `Se solicita ${request.quantityRequested} unidad(es) de ${request.sparePart.name} para la orden ${request.workOrder.orderNumber} (${request.workOrder.vehicle.licensePlate}) por ${mechanicName}`,
        type: 'spare_part_requested',
        relatedTo: 'work-orders',
        relatedId: request.workOrder.id,
      })
    }
  }

  /**
   * Notificar sobre repuesto entregado
   */
  async notifySparePartDelivered(workOrderSparePartId: string) {
    if (!workOrderSparePartId) return

    const request = await prisma.workOrderSparePart.findUnique({
      where: { id: workOrderSparePartId },
      include: {
        sparePart: true,
        workOrder: {
          include: {
            vehicle: true,
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    if (!request || !request.workOrder.assignedToId) return

    // Notificar solo al mecánico que solicitó el repuesto
    await this.create({
      userId: request.workOrder.assignedToId,
      title: 'Repuesto entregado',
      message: `Se ha entregado ${request.quantityDelivered || request.quantityRequested} unidad(es) de ${request.sparePart.name} para la orden ${request.workOrder.orderNumber}`,
      type: 'spare_part_delivered',
      relatedTo: 'work-orders',
      relatedId: request.workOrder.id,
    })
  }

  /**
   * Notificar sobre vehículo listo para salida
   */
  async notifyVehicleReadyForExit(entryId: string) {
    if (!entryId) return

    const entry = await prisma.vehicleEntry.findUnique({
      where: { id: entryId },
      include: {
        vehicle: true,
        workshop: {
          include: {
            users: {
              where: {
                isActive: true,
                role: {
                  name: { in: ['Recepcionista', 'Guardia'] },
                },
              },
              select: { id: true },
            },
          },
        },
      },
    })

    if (!entry) return

    const userIds: string[] = []

    // Obtener recepcionistas y guardias del taller
    const workshopUserIds = entry.workshop.users.map((u) => u.id)
    userIds.push(...workshopUserIds)

    // Obtener administradores (con caché)
    const adminIds = await this.getAdminIds()
    userIds.push(...adminIds)

    const allUserIds = [...new Set(userIds)]

    if (allUserIds.length > 0) {
      await this.createMany(allUserIds, {
        title: 'Vehículo listo para salida',
        message: `El vehículo ${entry.vehicle.licensePlate} tiene todas sus órdenes completadas y está listo para salir del taller`,
        type: 'vehicle_ready_for_exit',
        relatedTo: 'vehicle-entries',
        relatedId: entry.id,
      })
    }
  }

  /**
   * Notificar sobre stock crítico de repuestos
   */
  async notifyCriticalStock(sparePartId: string) {
    if (!sparePartId) return

    const sparePart = await prisma.sparePart.findUnique({
      where: { id: sparePartId },
    })

    if (!sparePart) return

    // Notificar a encargados de inventario y administradores
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          name: { in: ['Encargado de Inventario', 'Jefe de Taller', 'Administrador'] },
        },
      },
      select: { id: true },
    })

    const userIds = users.map((u) => u.id)

    if (userIds.length > 0) {
      await this.createMany(userIds, {
        title: '⚠️ Alerta: Stock crítico',
        message: `El repuesto ${sparePart.name} (${sparePart.code}) tiene stock crítico: ${sparePart.currentStock} unidades. Se requiere atención urgente.`,
        type: 'critical_stock',
        relatedTo: 'spare-parts',
        relatedId: sparePart.id,
      })
    }
  }

  /**
   * Notificar sobre orden de trabajo reasignada
   */
  async notifyWorkOrderReassigned(workOrderId: string, previousMechanicId: string, newMechanicId: string) {
    if (!workOrderId) return

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        vehicle: true,
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!workOrder) return

    const userIds: string[] = []

    // Notificar al mecánico anterior
    if (previousMechanicId) {
      userIds.push(previousMechanicId)
    }

    // Notificar al nuevo mecánico
    if (newMechanicId) {
      userIds.push(newMechanicId)
    }

    // Obtener jefes de taller
    const managers = await prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          name: 'Jefe de Taller',
        },
        workshopId: workOrder.workshopId,
      },
      select: { id: true },
    })
    const managerIds = managers.map((u) => u.id)
    userIds.push(...managerIds)

    // Obtener administradores (con caché)
    const adminIds = await this.getAdminIds()
    userIds.push(...adminIds)

    const newMechanicName = workOrder.assignedTo
      ? `${workOrder.assignedTo.firstName} ${workOrder.assignedTo.lastName}`.trim()
      : 'Nuevo mecánico'

    const allUserIds = [...new Set(userIds)]

    if (allUserIds.length > 0) {
      // Notificación diferente para cada tipo de usuario
      const notifications = allUserIds.map((userId) => {
        let message = ''
        if (userId === previousMechanicId) {
          message = `La orden ${workOrder.orderNumber} para ${workOrder.vehicle.licensePlate} ha sido reasignada a otro mecánico`
        } else if (userId === newMechanicId) {
          message = `Se te ha reasignado la orden ${workOrder.orderNumber} para ${workOrder.vehicle.licensePlate}`
        } else {
          message = `La orden ${workOrder.orderNumber} para ${workOrder.vehicle.licensePlate} ha sido reasignada a ${newMechanicName}`
        }

        return this.create({
          userId,
          title: 'Orden de trabajo reasignada',
          message,
          type: 'work_order_reassigned',
          relatedTo: 'work-orders',
          relatedId: workOrder.id,
        })
      })

      await Promise.all(notifications)
    }
  }
}

export default new NotificationService()


