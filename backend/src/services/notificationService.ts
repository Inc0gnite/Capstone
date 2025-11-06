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
    const notifications = await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        ...data,
      })),
    })

    return notifications
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

    const userIds = entry.workshop.users.map((u) => u.id)

    await this.createMany(userIds, {
      title: 'Nuevo ingreso de vehículo',
      message: `Vehículo ${entry.vehicle.licensePlate} ingresado - Código: ${entry.entryCode}`,
      type: 'vehicle_entry',
      relatedTo: 'vehicle-entries',
      relatedId: entry.id,
    })
  }

  /**
   * Notificar sobre nueva orden de trabajo
   */
  async notifyWorkOrderCreated(workOrderId: string) {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        vehicle: true,
        assignedTo: true,
      },
    })

    if (!workOrder) return

    if (workOrder.assignedToId) {
      await this.create({
        userId: workOrder.assignedToId,
        title: 'Nueva orden de trabajo asignada',
        message: `Se le ha asignado la orden ${workOrder.orderNumber} para ${workOrder.vehicle.licensePlate}`,
        type: 'work_order_assigned',
        relatedTo: 'work-orders',
        relatedId: workOrder.id,
      })
    }
  }

  /**
   * Notificar sobre stock bajo de repuestos
   */
  async notifyLowStock(sparePartId: string) {
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
}

export default new NotificationService()


