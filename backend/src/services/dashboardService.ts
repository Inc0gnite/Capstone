import prisma from '../config/database'
import type { DashboardStats } from '../types'

/**
 * Servicio del dashboard
 */
export class DashboardService {
  /**
   * Obtener estadísticas generales del dashboard
   */
  async getGeneralStats(workshopId?: string): Promise<DashboardStats> {
    const where = workshopId ? { workshopId } : {}

    // Fechas para hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [
      totalVehicles,
      vehiclesInWorkshop,
      activeWorkOrders,
      completedToday,
      pendingWorkOrders,
      lowStockItems,
      recentEntriesData,
      urgentWorkOrdersData,
    ] = await Promise.all([
      // Total de vehículos
      prisma.vehicle.count({ where: { isActive: true } }),

      // Vehículos en taller (con ingreso sin salida)
      prisma.vehicleEntry.count({
        where: {
          ...where,
          status: 'ingresado',
          exitDate: null,
        },
      }),

      // Órdenes de trabajo activas
      prisma.workOrder.count({
        where: {
          ...where,
          currentStatus: { in: ['pendiente', 'en_progreso', 'pausado'] },
        },
      }),

      // Completadas hoy
      prisma.workOrder.count({
        where: {
          ...where,
          currentStatus: 'completado',
          completedAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // Pendientes
      prisma.workOrder.count({
        where: {
          ...where,
          currentStatus: 'pendiente',
        },
      }),

      // Repuestos con stock bajo
      prisma.sparePart.count({
        where: {
          isActive: true,
          currentStock: {
            lte: prisma.sparePart.fields.minStock,
          },
        },
      }),

      // Ingresos recientes
      prisma.vehicleEntry.findMany({
        where,
        take: 5,
        orderBy: { entryDate: 'desc' },
        include: {
          vehicle: true,
          workshop: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),

      // Órdenes urgentes
      prisma.workOrder.findMany({
        where: {
          ...where,
          currentStatus: { in: ['pendiente', 'en_progreso'] },
          priority: { in: ['alta', 'critica'] },
        },
        take: 5,
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
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
      }),
    ])

    return {
      totalVehicles,
      vehiclesInWorkshop,
      activeWorkOrders,
      completedToday,
      pendingWorkOrders,
      lowStockItems,
      recentEntries: recentEntriesData as any,
      urgentWorkOrders: urgentWorkOrdersData as any,
    }
  }

  /**
   * Obtener estadísticas por período
   */
  async getStatsByPeriod(
    period: 'day' | 'week' | 'month',
    workshopId?: string
  ) {
    const where = workshopId ? { workshopId } : {}

    // Calcular fecha de inicio según período
    const now = new Date()
    const startDate = new Date()

    if (period === 'day') {
      startDate.setHours(0, 0, 0, 0)
    } else if (period === 'week') {
      startDate.setDate(now.getDate() - 7)
    } else {
      startDate.setMonth(now.getMonth() - 1)
    }

    const [
      entriesCount,
      completedWorkOrders,
      averageCompletionTime,
      workOrdersByStatus,
      workOrdersByPriority,
    ] = await Promise.all([
      // Ingresos en el período
      prisma.vehicleEntry.count({
        where: {
          ...where,
          entryDate: { gte: startDate },
        },
      }),

      // Órdenes completadas
      prisma.workOrder.count({
        where: {
          ...where,
          currentStatus: 'completado',
          completedAt: { gte: startDate },
        },
      }),

      // Tiempo promedio de completado
      prisma.workOrder.aggregate({
        where: {
          ...where,
          currentStatus: 'completado',
          completedAt: { gte: startDate },
          totalHours: { not: null },
        },
        _avg: {
          totalHours: true,
        },
      }),

      // Por estado
      prisma.workOrder.groupBy({
        by: ['currentStatus'],
        where: {
          ...where,
          createdAt: { gte: startDate },
        },
        _count: true,
      }),

      // Por prioridad
      prisma.workOrder.groupBy({
        by: ['priority'],
        where: {
          ...where,
          createdAt: { gte: startDate },
        },
        _count: true,
      }),
    ])

    return {
      period,
      startDate,
      endDate: now,
      entriesCount,
      completedWorkOrders,
      averageCompletionTime: averageCompletionTime._avg.totalHours || 0,
      workOrdersByStatus,
      workOrdersByPriority,
    }
  }

  /**
   * Obtener rendimiento de mecánicos
   */
  async getMechanicsPerformance(workshopId?: string) {
    const where: any = {
      role: {
        name: 'Mecánico',
      },
      isActive: true,
    }

    if (workshopId) {
      where.workshopId = workshopId
    }

    const mechanics = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        assignedWorkOrders: {
          select: {
            id: true,
            currentStatus: true,
            totalHours: true,
            completedAt: true,
          },
        },
      },
    })

    const performance = mechanics.map((mechanic: any) => {
      const orders = mechanic.assignedWorkOrders
      const completed = orders.filter((o: any) => o.currentStatus === 'completado')
      const inProgress = orders.filter((o: any) => o.currentStatus === 'en_progreso')
      const totalHours = completed.reduce((sum: number, o: any) => sum + (o.totalHours || 0), 0)
      const avgHours = completed.length > 0 ? totalHours / completed.length : 0

      return {
        id: mechanic.id,
        name: `${mechanic.firstName} ${mechanic.lastName}`,
        totalOrders: orders.length,
        completedOrders: completed.length,
        inProgressOrders: inProgress.length,
        totalHours: Math.round(totalHours * 100) / 100,
        averageHours: Math.round(avgHours * 100) / 100,
      }
    })

    return performance
  }

  /**
   * Obtener actividad reciente
   */
  async getRecentActivity(workshopId?: string, limit = 20) {
    const where = workshopId ? { workshopId } : {}

    const [recentEntries, recentWorkOrders, recentStatusChanges] = await Promise.all([
      prisma.vehicleEntry.findMany({
        where,
        take: limit / 3,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: true,
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),

      prisma.workOrder.findMany({
        where,
        take: limit / 3,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: true,
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),

      prisma.workOrderStatus.findMany({
        take: limit / 3,
        orderBy: { changedAt: 'desc' },
        include: {
          workOrder: {
            include: {
              vehicle: true,
            },
          },
        },
      }),
    ])

    // Combinar y ordenar todas las actividades
    const activities: any[] = []

    recentEntries.forEach((entry: any) => {
      activities.push({
        type: 'entry',
        timestamp: entry.createdAt,
        description: `Vehículo ${entry.vehicle.licensePlate} ingresado`,
        user: `${entry.createdBy.firstName} ${entry.createdBy.lastName}`,
        data: entry,
      })
    })

    recentWorkOrders.forEach((order: any) => {
      activities.push({
        type: 'work_order',
        timestamp: order.createdAt,
        description: `Orden ${order.orderNumber} creada para ${order.vehicle.licensePlate}`,
        user: `${order.createdBy.firstName} ${order.createdBy.lastName}`,
        data: order,
      })
    })

    recentStatusChanges.forEach((status: any) => {
      activities.push({
        type: 'status_change',
        timestamp: status.changedAt,
        description: `Orden ${status.workOrder.orderNumber} cambió a ${status.status}`,
        data: status,
      })
    })

    // Ordenar por timestamp descendente
    activities.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())

    return activities.slice(0, limit)
  }

  /**
   * Obtener estadísticas específicas de un mecánico
   */
  async getMechanicStats(mechanicId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [
      pending,
      inProgress,
      completedToday,
      totalMonth,
      recentCompleted
    ] = await Promise.all([
      // Órdenes pendientes asignadas al mecánico
      prisma.workOrder.count({
        where: {
          assignedToId: mechanicId,
          currentStatus: 'pendiente'
        }
      }),
      
      // Órdenes en progreso
      prisma.workOrder.count({
        where: {
          assignedToId: mechanicId,
          currentStatus: 'en_progreso'
        }
      }),
      
      // Completadas hoy
      prisma.workOrder.count({
        where: {
          assignedToId: mechanicId,
          currentStatus: 'completado',
          completedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // Total del mes
      prisma.workOrder.count({
        where: {
          assignedToId: mechanicId,
          currentStatus: 'completado',
          completedAt: {
            gte: startOfMonth
          }
        }
      }),

      // Órdenes completadas recientemente (todas)
      prisma.workOrder.findMany({
        where: {
          assignedToId: mechanicId,
          currentStatus: 'completado',
          completedAt: { not: null }
        },
        include: {
          vehicle: {
            select: {
              licensePlate: true,
              vehicleType: true
            }
          }
        },
        orderBy: {
          completedAt: 'desc'
        }
      })
    ])

    return {
      pending,
      inProgress,
      completedToday,
      totalMonth,
      recentCompleted: recentCompleted.map(order => ({
        orderNumber: order.orderNumber,
        vehicle: order.vehicle.licensePlate,
        vehicleType: order.vehicle.vehicleType,
        completedAt: order.completedAt,
        totalHours: order.totalHours
      }))
    }
  }
}

export default new DashboardService()

