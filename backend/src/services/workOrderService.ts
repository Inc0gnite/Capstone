import prisma from '../config/database'
import { generateWorkOrderNumber } from '../utils/generators'
import type { WorkOrderFilters } from '../types'
import notificationService from './notificationService'

/**
 * Servicio de órdenes de trabajo
 */
export class WorkOrderService {
  /**
   * Obtener todas las órdenes con filtros
   */
  async getAll(filters: WorkOrderFilters) {
    try {
      console.log('🔍 WorkOrderService.getAll called with filters:', filters)
      
      const {
        page = 1,
        limit = 10,
        search = '',
        status,
        priority,
        workshopId,
        assignedToId,
        dateFrom,
        dateTo,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters

      // Convertir limit y page a números para evitar errores de Prisma
      const numericLimit = parseInt(String(limit), 10)
      const numericPage = parseInt(String(page), 10)
      const skip = (numericPage - 1) * numericLimit

      const where: any = {}

      if (search) {
        where.OR = [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { vehicle: { licensePlate: { contains: search, mode: 'insensitive' } } },
        ]
      }

      if (status) where.currentStatus = status
      if (priority) where.priority = priority
      if (workshopId) where.workshopId = workshopId
      if (assignedToId) where.assignedToId = assignedToId
      if (filters.vehicleId) where.vehicleId = filters.vehicleId
      
      console.log('🔍 Where clause:', where)
    
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    console.log('🔍 Executing Prisma query...')
    
    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        skip,
        take: numericLimit,
        include: {
          vehicle: true,
          entry: true,
          workshop: true,
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              spareParts: true,
              photos: true,
              pauses: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.workOrder.count({ where }),
    ])
    
    console.log('🔍 Query results:', { workOrdersCount: workOrders.length, total })

      return {
        workOrders,
        total,
        page: numericPage,
        limit: numericLimit,
        totalPages: Math.ceil(total / numericLimit),
      }
    } catch (error) {
      console.error('❌ Error in WorkOrderService.getAll:', error)
      throw error
    }
  }

  /**
   * Obtener orden por ID
   */
  async getById(id: string) {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: { region: true },
        },
        entry: true,
        workshop: true,
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isActive: true,
            assignedWorkOrders: {
              where: {
                currentStatus: 'en_progreso',
                id: { not: id }, // Excluir la orden actual
              },
              select: {
                id: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        statuses: {
          orderBy: { changedAt: 'desc' },
        },
        photos: true,
        spareParts: {
          include: {
            sparePart: true,
          },
        },
        pauses: {
          orderBy: { pausedAt: 'desc' },
        },
      },
    })

    if (!workOrder) {
      throw new Error('Orden de trabajo no encontrada')
    }

    // Agregar información de si el mecánico tiene una orden activa
    if (workOrder.assignedTo) {
      // Verificar si tiene otra orden en progreso (excluyendo la actual)
      const hasOtherActiveOrder = workOrder.assignedTo.assignedWorkOrders.length > 0
      // O si la orden actual está en progreso
      const currentOrderInProgress = workOrder.currentStatus === 'en_progreso'
      const hasActiveOrder = hasOtherActiveOrder || currentOrderInProgress
      
      // Especialidades por defecto (hasta que se agregue al modelo de BD)
      const specialties = ['General', 'Motor', 'Frenos']
      
      // Remover assignedWorkOrders del objeto antes de retornar
      const { assignedWorkOrders, ...assignedToWithoutOrders } = workOrder.assignedTo
      return {
        ...workOrder,
        assignedTo: {
          ...assignedToWithoutOrders,
          hasActiveOrder,
          specialties,
        },
      }
    }

    return workOrder
  }

  /**
   * Crear orden de trabajo
   */
  async create(data: {
    vehicleId: string
    entryId: string
    workshopId: string
    workType: string
    priority?: string
    description: string
    estimatedHours?: number
    assignedToId?: string
    createdById: string
  }) {
    console.log('🔨 WorkOrderService.create llamado con datos:', data)
    
    const {
      vehicleId,
      entryId,
      workshopId,
      workType,
      priority = 'normal',
      description,
      estimatedHours,
      assignedToId,
      createdById,
    } = data
    
    console.log('📋 Datos extraídos:', {
      vehicleId,
      entryId,
      workshopId,
      workType,
      priority,
      description,
      estimatedHours,
      assignedToId,
      createdById
    })

    // Validar que el taller existe y está activo
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
    })

    if (!workshop) {
      throw new Error('Taller no encontrado')
    }

    if (!workshop.isActive) {
      throw new Error('El taller no está activo')
    }

    // Validar que la entrada pertenece al mismo taller
    const entry = await prisma.vehicleEntry.findUnique({
      where: { id: entryId },
    })

    if (!entry) {
      throw new Error('Entrada de vehículo no encontrada')
    }

    if (entry.workshopId !== workshopId) {
      throw new Error('La entrada de vehículo no pertenece al taller especificado')
    }

    // Validar capacidad del mecánico por horas estimadas si está asignado
    if (assignedToId) {
      await this.validateMechanicCapacity(assignedToId, workshopId, estimatedHours)
    }

    // Generar número único secuencial
    const orderNumber = await generateWorkOrderNumber()
    console.log('🔢 Número de orden generado:', orderNumber)

    // Crear orden en transacción
    const workOrder = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.workOrder.create({
        data: {
          orderNumber,
          vehicleId,
          entryId,
          workshopId,
          workType,
          priority,
          description,
          estimatedHours,
          assignedToId,
          createdById,
        },
      })

      // Crear primer registro de estado
      await tx.workOrderStatus.create({
        data: {
          workOrderId: newOrder.id,
          status: 'pendiente',
          observations: 'Orden creada',
          changedById: createdById,
        },
      })

      return newOrder
    })

    // Notificar a los usuarios relevantes (mecánico asignado, jefe/recepcionista)
    notificationService
      .notifyWorkOrderCreated(workOrder.id)
      .catch((error) => console.error('❌ Error notificando creación de OT:', error))

    return this.getById(workOrder.id)
  }

  /**
   * Actualizar orden
   */
  async update(id: string, data: Partial<{
    workType: string
    priority: string
    description: string
    estimatedHours: number
    assignedToId: string
    observations: string
  }>) {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
    })

    if (!workOrder) {
      throw new Error('Orden de trabajo no encontrada')
    }

    const updated = await prisma.workOrder.update({
      where: { id },
      data,
    })

    return this.getById(updated.id)
  }

  /**
   * Cambiar estado de la orden
   */
  async changeStatus(
    id: string,
    newStatus: string,
    observations: string,
    changedById: string
  ) {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        assignedTo: true
      }
    })

    if (!workOrder) {
      throw new Error('Orden de trabajo no encontrada')
    }

    // Validación: No se puede iniciar una orden sin mecánico asignado
    if (newStatus === 'en_progreso' && !workOrder.assignedToId) {
      throw new Error('No se puede iniciar una orden de trabajo sin mecánico asignado')
    }

    // Validación: El mecánico no puede tener más de una orden en progreso a la vez
    if (newStatus === 'en_progreso' && workOrder.assignedToId) {
      const activeOrder = await prisma.workOrder.findFirst({
        where: {
          assignedToId: workOrder.assignedToId,
          currentStatus: 'en_progreso',
          id: { not: id } // Excluir la orden actual
        }
      })

      if (activeOrder) {
        throw new Error('Ya tienes una orden en progreso. Debes completarla o pausarla antes de iniciar otra.')
      }
    }

    // Actualizar en transacción
    await prisma.$transaction(async (tx) => {
      // Actualizar estado actual
      const updateData: any = { currentStatus: newStatus }
      
      if (newStatus === 'en_progreso' && !workOrder.startedAt) {
        updateData.startedAt = new Date()
      }
      
      if (newStatus === 'completado' && !workOrder.completedAt) {
        updateData.completedAt = new Date()
        
        // Calcular horas totales
        if (workOrder.startedAt) {
          const totalHours =
            (new Date().getTime() - workOrder.startedAt.getTime()) / (1000 * 60 * 60)
          updateData.totalHours = Math.round(totalHours * 100) / 100
        }
      }

      await tx.workOrder.update({
        where: { id },
        data: updateData,
      })

      // Crear registro de cambio de estado
      await tx.workOrderStatus.create({
        data: {
          workOrderId: id,
          status: newStatus,
          observations,
          changedById,
        },
      })
    })

    // Notificar según el estado
    if (newStatus === 'completado') {
      notificationService
        .notifyWorkOrderCompleted(id)
        .catch((error) => console.error('❌ Error notificando orden completada:', error))
      
      // Verificar si todas las órdenes del vehículo están completadas (de forma asíncrona)
      // Esto evita bloquear la respuesta mientras se verifica
      setImmediate(async () => {
        try {
          const completedOrder = await prisma.workOrder.findUnique({
            where: { id },
            include: {
              entry: {
                include: {
                  workOrders: {
                    where: {
                      currentStatus: { not: 'completado' },
                      id: { not: id }
                    }
                  }
                }
              }
            }
          })

          // Si no hay más órdenes pendientes, el vehículo está listo para salida
          if (completedOrder?.entry && completedOrder.entry.workOrders.length === 0) {
            await notificationService.notifyVehicleReadyForExit(completedOrder.entryId)
          }
        } catch (error) {
          console.error('❌ Error verificando vehículo listo para salida:', error)
        }
      })
    } else if (newStatus === 'cancelado') {
      notificationService
        .notifyWorkOrderCancelled(id)
        .catch((error) => console.error('❌ Error notificando orden cancelada:', error))
    } else if (newStatus === 'en_progreso') {
      notificationService
        .notifyWorkOrderStarted(id)
        .catch((error) => console.error('❌ Error notificando orden iniciada:', error))
    }

    return this.getById(id)
  }

  /**
   * Pausar orden de trabajo
   */
  async pause(id: string, reason: string, observations?: string) {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        pauses: {
          where: { resumedAt: null },
        },
      },
    })

    if (!workOrder) {
      throw new Error('Orden de trabajo no encontrada')
    }

    if (workOrder.pauses.length > 0) {
      throw new Error('La orden ya está pausada')
    }

    await prisma.$transaction([
      prisma.workPause.create({
        data: {
          workOrderId: id,
          reason,
          observations,
        },
      }),
      prisma.workOrder.update({
        where: { id },
        data: { currentStatus: 'pausado' },
      }),
    ])

    // Notificar orden pausada
    notificationService
      .notifyWorkOrderPaused(id, reason)
      .catch((error) => console.error('❌ Error notificando orden pausada:', error))

    return this.getById(id)
  }

  /**
   * Reanudar orden de trabajo
   */
  async resume(id: string, changedById: string, observations?: string) {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        pauses: {
          where: { resumedAt: null },
          orderBy: { pausedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!workOrder) {
      throw new Error('Orden de trabajo no encontrada')
    }

    if (workOrder.pauses.length === 0) {
      throw new Error('La orden no está pausada')
    }

    const pause = workOrder.pauses[0]
    const now = new Date()
    const duration = Math.floor((now.getTime() - pause.pausedAt.getTime()) / 1000 / 60)

    // Formatear duración para mostrar en observaciones
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    const durationText = hours > 0 
      ? `${hours}h ${minutes}min` 
      : `${minutes}min`

    await prisma.$transaction(async (tx) => {
      // Actualizar pausa con timestamp de reanudación y duración calculada
      await tx.workPause.update({
        where: { id: pause.id },
        data: {
          resumedAt: now,
          duration,
        },
      })

      // Cambiar estado a 'en_progreso'
      await tx.workOrder.update({
        where: { id },
        data: { currentStatus: 'en_progreso' },
      })

      // Crear registro en historial de estados
      await tx.workOrderStatus.create({
        data: {
          workOrderId: id,
          status: 'en_progreso',
          observations: observations || `Orden reanudada. Pausa duró ${durationText}`,
          changedById,
        },
      })
    })

    // Notificar reanudación
    notificationService
      .notifyWorkOrderStarted(id)
      .catch((error) => console.error('❌ Error notificando orden reanudada:', error))

    return this.getById(id)
  }

  /**
   * Agregar foto a la orden
   */
  async addPhoto(workOrderId: string, url: string, description?: string, photoType?: string) {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
    })

    if (!workOrder) {
      throw new Error('Orden de trabajo no encontrada')
    }

    const photo = await prisma.workOrderPhoto.create({
      data: {
        workOrderId,
        url,
        description,
        photoType: photoType || 'general',
      },
    })

    return photo
  }

  /**
   * Obtener estadísticas de órdenes
   */
  async getStats(workshopId?: string) {
    const where = workshopId ? { workshopId } : {}

    const [total, pending, inProgress, paused, completed, cancelled, byPriority] =
      await Promise.all([
        prisma.workOrder.count({ where }),
        prisma.workOrder.count({ where: { ...where, currentStatus: 'pendiente' } }),
        prisma.workOrder.count({ where: { ...where, currentStatus: 'en_progreso' } }),
        prisma.workOrder.count({ where: { ...where, currentStatus: 'pausado' } }),
        prisma.workOrder.count({ where: { ...where, currentStatus: 'completado' } }),
        prisma.workOrder.count({ where: { ...where, currentStatus: 'cancelado' } }),
        prisma.workOrder.groupBy({
          by: ['priority'],
          where,
          _count: true,
        }),
      ])

    return {
      total,
      pending,
      inProgress,
      paused,
      completed,
      cancelled,
      byPriority,
    }
  }

  /**
   * Asignar mecánico a orden de trabajo
   */
  async assignMechanic(workOrderId: string, mechanicId: string) {
    console.log('👨‍🔧 Asignando mecánico a orden de trabajo:', { workOrderId, mechanicId })

    // Obtener información de la orden de trabajo
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      select: { 
        workshopId: true, 
        orderNumber: true, 
        estimatedHours: true,
        assignedToId: true
      }
    })

    if (!workOrder) {
      throw new Error('Orden de trabajo no encontrada')
    }

    const previousMechanicId = workOrder.assignedToId
    const isReassignment = previousMechanicId && previousMechanicId !== mechanicId

    // Validar capacidad del mecánico por horas estimadas
    await this.validateMechanicCapacity(mechanicId, workOrder.workshopId, workOrder.estimatedHours || undefined)

    // Asignar mecánico
    const updatedOrder = await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { assignedToId: mechanicId },
      include: {
        assignedTo: {
          select: { firstName: true, lastName: true }
        }
      }
    })

    console.log('✅ Mecánico asignado exitosamente:', updatedOrder.assignedTo)

    // Notificar según si es reasignación o asignación nueva
    if (isReassignment) {
      notificationService
        .notifyWorkOrderReassigned(workOrderId, previousMechanicId!, mechanicId)
        .catch((error) => console.error('❌ Error notificando reasignación de OT:', error))
    } else {
      // Notificar al mecánico asignado
      notificationService
        .create({
          userId: mechanicId,
          title: 'Nueva orden asignada',
          message: `Se te ha asignado la orden ${workOrder.orderNumber}.`,
          type: 'work_order_assigned',
          relatedTo: 'work-orders',
          relatedId: workOrderId,
        })
        .catch((error) => console.error('❌ Error notificando asignación de OT:', error))
    }

    return updatedOrder
  }

  /**
   * Validar capacidad del mecánico por horas estimadas
   */
  private async validateMechanicCapacity(mechanicId: string, workshopId: string, newOrderHours?: number, scheduledDate?: Date) {
    console.log('🔍 Validando capacidad del mecánico por horas:', { mechanicId, workshopId, newOrderHours, scheduledDate })

    const maxHours = 8 // Límite fijo de 8 horas por día

    // Obtener órdenes activas del mecánico con sus horas estimadas
    const activeOrders = await prisma.workOrder.findMany({
      where: {
        assignedToId: mechanicId,
        currentStatus: { in: ['pendiente', 'en_progreso', 'pausado'] }
      },
      select: {
        id: true,
        orderNumber: true,
        estimatedHours: true,
        currentStatus: true,
        scheduledDate: true
      }
    })

    // Si se proporciona una fecha programada, solo contar órdenes de ese mismo día
    let currentTotalHours = 0
    if (scheduledDate) {
      const targetDate = new Date(scheduledDate)
      targetDate.setHours(0, 0, 0, 0)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)

      currentTotalHours = activeOrders
        .filter(order => {
          if (!order.scheduledDate) return false
          const orderDate = new Date(order.scheduledDate)
          return orderDate >= targetDate && orderDate < nextDay
        })
        .reduce((sum, order) => sum + (order.estimatedHours || 0), 0)
    } else {
      // Si no hay fecha programada, contar todas las órdenes activas (comportamiento por defecto)
      currentTotalHours = activeOrders.reduce((sum, order) => 
        sum + (order.estimatedHours || 0), 0
      )
    }

    console.log('📊 Estado actual:', {
      órdenes: activeOrders.length,
      horas: currentTotalHours,
      nuevaOrden: newOrderHours || 0,
      fechaProgramada: scheduledDate
    })

    // Validar límite de horas
    const projectedTotalHours = currentTotalHours + (newOrderHours || 0)
    
    // No permitir si excede o iguala exactamente las 8 horas
    if (projectedTotalHours >= maxHours) {
      const mechanic = await prisma.user.findUnique({
        where: { id: mechanicId },
        select: { firstName: true, lastName: true }
      })
      const mechanicName = mechanic ? `${mechanic.firstName} ${mechanic.lastName}` : 'Mecánico'
      
      if (projectedTotalHours > maxHours) {
        throw new Error(
          `El mecánico ${mechanicName} ya tiene ${currentTotalHours}h asignadas. ` +
          `Con esta nueva orden (${newOrderHours}h) superaría el límite de ${maxHours}h por día.`
        )
      } else {
        // Caso especial: exactamente 8 horas
        throw new Error(
          `El mecánico ${mechanicName} ya tiene ${currentTotalHours}h asignadas. ` +
          `Con esta nueva orden de ${newOrderHours}h llegaría exactamente a las ${maxHours}h, ` +
          `lo que llenaría completamente su jornada. No se pueden asignar más órdenes para este día.`
        )
      }
    }

    // Si es menos de 8 horas, permitir asignación normal
    console.log('✅ Capacidad del mecánico validada correctamente')
    console.log('📊 Horas proyectadas:', projectedTotalHours, 'de', maxHours, 'máximas')
  }
}

export default new WorkOrderService()


