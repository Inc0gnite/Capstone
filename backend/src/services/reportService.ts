import prisma from '../config/database'

/**
 * Servicio de reportes
 */
export class ReportService {
  /**
   * Generar reporte de flota con filtros
   */
  async generateFleetReport(filters?: {
    regionId?: string
    dateFrom?: string
    dateTo?: string
  }) {
    const { regionId, dateFrom, dateTo } = filters || {}

    // Construir where clause para vehículos
    const vehicleWhere: any = {}
    if (regionId) {
      vehicleWhere.regionId = regionId
    }

    // Construir where clause para entradas (si hay filtro de fecha)
    const entryWhere: any = {}
    if (dateFrom || dateTo) {
      entryWhere.entryDate = {}
      if (dateFrom) {
        entryWhere.entryDate.gte = new Date(dateFrom)
      }
      if (dateTo) {
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        entryWhere.entryDate.lte = endDate
      }
    }

    // Obtener vehículos con sus relaciones
    const vehicles = await prisma.vehicle.findMany({
      where: vehicleWhere,
      include: {
        region: true,
        entries: {
          where: entryWhere,
          include: {
            workshop: true,
            workOrders: {
              include: {
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
          orderBy: { entryDate: 'desc' },
        },
        _count: {
          select: {
            entries: true,
            workOrders: true,
          },
        },
      },
      orderBy: { licensePlate: 'asc' },
    })

    // Calcular métricas agregadas
    const totalVehicles = vehicles.length
    const totalEntries = vehicles.reduce((sum, v) => sum + v.entries.length, 0)
    const totalWorkOrders = vehicles.reduce(
      (sum, v) => sum + v.entries.reduce((s, e) => s + e.workOrders.length, 0),
      0
    )

    // Agrupar por región
    const byRegion = vehicles.reduce((acc: any, vehicle) => {
      const regionName = vehicle.region?.name || 'Sin región'
      if (!acc[regionName]) {
        acc[regionName] = {
          regionName,
          regionCode: vehicle.region?.code || '',
          vehicleCount: 0,
          entryCount: 0,
          workOrderCount: 0,
        }
      }
      acc[regionName].vehicleCount++
      acc[regionName].entryCount += vehicle.entries.length
      acc[regionName].workOrderCount += vehicle.entries.reduce(
        (s, e) => s + e.workOrders.length,
        0
      )
      return acc
    }, {})

    // Agrupar por tipo de vehículo
    const byVehicleType = vehicles.reduce((acc: any, vehicle) => {
      const type = vehicle.vehicleType || 'Sin tipo'
      if (!acc[type]) {
        acc[type] = {
          vehicleType: type,
          count: 0,
        }
      }
      acc[type].count++
      return acc
    }, {})

    // Calcular estadísticas de órdenes de trabajo
    const allWorkOrders = vehicles.flatMap((v) =>
      v.entries.flatMap((e) => e.workOrders)
    )

    const workOrdersByStatus = allWorkOrders.reduce((acc: any, wo) => {
      const status = wo.currentStatus || 'sin_estado'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    const workOrdersByPriority = allWorkOrders.reduce((acc: any, wo) => {
      const priority = wo.priority || 'sin_prioridad'
      acc[priority] = (acc[priority] || 0) + 1
      return acc
    }, {})

    // Calcular tiempo promedio de completado
    const completedWorkOrders = allWorkOrders.filter(
      (wo) => wo.currentStatus === 'completado' && wo.totalHours
    )
    const averageCompletionTime =
      completedWorkOrders.length > 0
        ? completedWorkOrders.reduce((sum, wo) => sum + (wo.totalHours || 0), 0) /
          completedWorkOrders.length
        : 0

    return {
      summary: {
        totalVehicles,
        totalEntries,
        totalWorkOrders,
        averageCompletionTime: Math.round(averageCompletionTime * 100) / 100,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        regionId: regionId || null,
      },
      byRegion: Object.values(byRegion),
      byVehicleType: Object.values(byVehicleType),
      workOrdersByStatus,
      workOrdersByPriority,
      vehicles: vehicles.map((v) => ({
        id: v.id,
        licensePlate: v.licensePlate,
        vehicleType: v.vehicleType,
        brand: v.brand,
        model: v.model,
        year: v.year,
        fleetNumber: v.fleetNumber,
        region: v.region
          ? {
              id: v.region.id,
              code: v.region.code,
              name: v.region.name,
            }
          : null,
        totalEntries: v.entries.length,
        totalWorkOrders: v.entries.reduce((s, e) => s + e.workOrders.length, 0),
        entries: v.entries.map((e) => ({
          id: e.id,
          entryCode: e.entryCode,
          entryDate: e.entryDate,
          exitDate: e.exitDate,
          status: e.status,
          workshop: e.workshop
            ? {
                id: e.workshop.id,
                code: e.workshop.code,
                name: e.workshop.name,
              }
            : null,
          workOrders: e.workOrders.map((wo) => ({
            id: wo.id,
            orderNumber: wo.orderNumber,
            workType: wo.workType,
            priority: wo.priority,
            currentStatus: wo.currentStatus,
            totalHours: wo.totalHours,
            assignedTo: wo.assignedTo
              ? {
                  id: wo.assignedTo.id,
                  firstName: wo.assignedTo.firstName,
                  lastName: wo.assignedTo.lastName,
                }
              : null,
            createdAt: wo.createdAt,
            completedAt: wo.completedAt,
          })),
        })),
      })),
    }
  }
}

export default new ReportService()

