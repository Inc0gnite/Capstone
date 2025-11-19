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

  /**
   * Generar reporte de desempeño de mecánicos con filtros
   */
  async generateMechanicsPerformanceReport(filters?: {
    workshopId?: string
    dateFrom?: string
    dateTo?: string
  }) {
    const { workshopId, dateFrom, dateTo } = filters || {}

    // Construir where clause para órdenes de trabajo
    const workOrderWhere: any = {}
    if (dateFrom || dateTo) {
      workOrderWhere.createdAt = {}
      if (dateFrom) {
        workOrderWhere.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        workOrderWhere.createdAt.lte = endDate
      }
    }

    // Obtener mecánicos con sus órdenes
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
      include: {
        workshop: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        assignedWorkOrders: {
          where: workOrderWhere,
          select: {
            id: true,
            orderNumber: true,
            workType: true,
            priority: true,
            currentStatus: true,
            estimatedHours: true,
            totalHours: true,
            createdAt: true,
            startedAt: true,
            completedAt: true,
            vehicle: {
              select: {
                licensePlate: true,
                vehicleType: true,
              },
            },
          },
        },
      },
    })

    // Calcular métricas por mecánico
    const performance = mechanics.map((mechanic) => {
      const orders = mechanic.assignedWorkOrders
      const completed = orders.filter((o) => o.currentStatus === 'completado')
      const inProgress = orders.filter((o) => o.currentStatus === 'en_progreso')
      const pending = orders.filter((o) => o.currentStatus === 'pendiente')
      const paused = orders.filter((o) => o.currentStatus === 'pausado')
      const cancelled = orders.filter((o) => o.currentStatus === 'cancelado')

      const totalHours = completed.reduce((sum, o) => sum + (o.totalHours || 0), 0)
      const estimatedHours = orders.reduce((sum, o) => sum + (o.estimatedHours || 0), 0)
      const avgHours = completed.length > 0 ? totalHours / completed.length : 0
      const efficiency = estimatedHours > 0 ? (totalHours / estimatedHours) * 100 : 0

      // Calcular tiempo promedio de completado (días)
      const completionTimes = completed
        .filter((o) => o.startedAt && o.completedAt)
        .map((o) => {
          const start = new Date(o.startedAt!).getTime()
          const end = new Date(o.completedAt!).getTime()
          return (end - start) / (1000 * 60 * 60 * 24) // días
        })
      const avgCompletionDays =
        completionTimes.length > 0
          ? completionTimes.reduce((sum, t) => sum + t, 0) / completionTimes.length
          : 0

      return {
        id: mechanic.id,
        name: `${mechanic.firstName} ${mechanic.lastName}`,
        email: mechanic.email,
        workshop: mechanic.workshop
          ? {
              id: mechanic.workshop.id,
              code: mechanic.workshop.code,
              name: mechanic.workshop.name,
            }
          : null,
        totalOrders: orders.length,
        completedOrders: completed.length,
        inProgressOrders: inProgress.length,
        pendingOrders: pending.length,
        pausedOrders: paused.length,
        cancelledOrders: cancelled.length,
        totalHours: Math.round(totalHours * 100) / 100,
        estimatedHours: Math.round(estimatedHours * 100) / 100,
        averageHours: Math.round(avgHours * 100) / 100,
        efficiency: Math.round(efficiency * 100) / 100,
        averageCompletionDays: Math.round(avgCompletionDays * 100) / 100,
        orders: orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          workType: o.workType,
          priority: o.priority,
          currentStatus: o.currentStatus,
          estimatedHours: o.estimatedHours,
          totalHours: o.totalHours,
          vehicle: o.vehicle
            ? {
                licensePlate: o.vehicle.licensePlate,
                vehicleType: o.vehicle.vehicleType,
              }
            : null,
          createdAt: o.createdAt,
          startedAt: o.startedAt,
          completedAt: o.completedAt,
        })),
      }
    })

    // Calcular métricas agregadas
    const totalMechanics = performance.length
    const totalOrders = performance.reduce((sum, m) => sum + m.totalOrders, 0)
    const totalCompleted = performance.reduce((sum, m) => sum + m.completedOrders, 0)
    const totalHours = performance.reduce((sum, m) => sum + m.totalHours, 0)
    const avgEfficiency =
      totalMechanics > 0
        ? performance.reduce((sum, m) => sum + m.efficiency, 0) / totalMechanics
        : 0

    return {
      summary: {
        totalMechanics,
        totalOrders,
        totalCompleted,
        totalHours: Math.round(totalHours * 100) / 100,
        averageEfficiency: Math.round(avgEfficiency * 100) / 100,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        workshopId: workshopId || null,
      },
      mechanics: performance,
    }
  }

  /**
   * Generar reporte de inventario con filtros
   */
  async generateInventoryReport(filters?: {
    workshopId?: string
    category?: string
    lowStock?: boolean
    search?: string
  }) {
    const { workshopId, category, lowStock, search } = filters || {}

    const where: any = {
      isActive: true,
    }

    if (workshopId) {
      where.workshopId = workshopId
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Obtener todos los repuestos
    let spareParts = await prisma.sparePart.findMany({
      where,
      include: {
        workshop: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        movements: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Últimos 10 movimientos
        },
        _count: {
          select: {
            workOrders: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Filtrar por stock bajo si se solicita
    if (lowStock) {
      spareParts = spareParts.filter((part) => part.currentStock <= part.minStock)
    }

    // Calcular métricas agregadas
    const totalParts = spareParts.length
    const totalValue = spareParts.reduce(
      (sum, part) => sum + part.currentStock * part.unitPrice,
      0
    )
    const lowStockCount = spareParts.filter((p) => p.currentStock <= p.minStock).length
    const outOfStockCount = spareParts.filter((p) => p.currentStock === 0).length

    // Agrupar por categoría
    const byCategory = spareParts.reduce((acc: any, part) => {
      const cat = part.category || 'Sin categoría'
      if (!acc[cat]) {
        acc[cat] = {
          category: cat,
          count: 0,
          totalValue: 0,
          lowStockCount: 0,
        }
      }
      acc[cat].count++
      acc[cat].totalValue += part.currentStock * part.unitPrice
      if (part.currentStock <= part.minStock) {
        acc[cat].lowStockCount++
      }
      return acc
    }, {})

    // Agrupar por taller
    const byWorkshop = spareParts.reduce((acc: any, part) => {
      const workshopName = part.workshop?.name || 'Sin taller'
      const workshopId = part.workshop?.id || 'no-workshop'
      if (!acc[workshopId]) {
        acc[workshopId] = {
          workshopId: workshopId === 'no-workshop' ? null : workshopId,
          workshopName,
          workshopCode: part.workshop?.code || '',
          count: 0,
          totalValue: 0,
          lowStockCount: 0,
        }
      }
      acc[workshopId].count++
      acc[workshopId].totalValue += part.currentStock * part.unitPrice
      if (part.currentStock <= part.minStock) {
        acc[workshopId].lowStockCount++
      }
      return acc
    }, {})

    return {
      summary: {
        totalParts,
        totalValue: Math.round(totalValue * 100) / 100,
        lowStockCount,
        outOfStockCount,
        workshopId: workshopId || null,
        category: category || null,
      },
      byCategory: Object.values(byCategory),
      byWorkshop: Object.values(byWorkshop),
      parts: spareParts.map((part) => ({
        id: part.id,
        code: part.code,
        name: part.name,
        description: part.description,
        category: part.category,
        unitOfMeasure: part.unitOfMeasure,
        unitPrice: part.unitPrice,
        currentStock: part.currentStock,
        minStock: part.minStock,
        maxStock: part.maxStock,
        location: part.location,
        totalValue: Math.round(part.currentStock * part.unitPrice * 100) / 100,
        isLowStock: part.currentStock <= part.minStock,
        isOutOfStock: part.currentStock === 0,
        usageCount: part._count.workOrders,
        workshop: part.workshop
          ? {
              id: part.workshop.id,
              code: part.workshop.code,
              name: part.workshop.name,
            }
          : null,
        recentMovements: part.movements.slice(0, 5).map((m) => ({
          id: m.id,
          movementType: m.movementType,
          quantity: m.quantity,
          createdAt: m.createdAt,
        })),
      })),
    }
  }

  /**
   * Generar reporte de costos con filtros
   */
  async generateCostsReport(filters?: {
    workshopId?: string
    dateFrom?: string
    dateTo?: string
  }) {
    const { workshopId, dateFrom, dateTo } = filters || {}

    // Constante: costo por hora de trabajo de mecánico (CLP)
    const HOURLY_RATE = 15000 // $15,000 CLP por hora

    // Construir where clause para órdenes de trabajo
    const workOrderWhere: any = {}
    if (workshopId) {
      workOrderWhere.workshopId = workshopId
    }
    if (dateFrom || dateTo) {
      workOrderWhere.createdAt = {}
      if (dateFrom) {
        workOrderWhere.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        workOrderWhere.createdAt.lte = endDate
      }
    }

    // Obtener órdenes de trabajo con repuestos
    const workOrders = await prisma.workOrder.findMany({
      where: workOrderWhere,
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        vehicle: {
          select: {
            licensePlate: true,
            vehicleType: true,
          },
        },
        workshop: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        spareParts: {
          include: {
            sparePart: {
              select: {
                id: true,
                code: true,
                name: true,
                unitPrice: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calcular costos por orden
    const ordersWithCosts = workOrders.map((wo) => {
      // Costo de repuestos
      const sparePartsCost = wo.spareParts.reduce((sum, sp) => {
        const quantity = sp.quantityDelivered || sp.quantityRequested || 0
        return sum + quantity * sp.sparePart.unitPrice
      }, 0)

      // Costo de mano de obra (horas trabajadas)
      const laborCost = (wo.totalHours || 0) * HOURLY_RATE

      // Costo total
      const totalCost = sparePartsCost + laborCost

      return {
        id: wo.id,
        orderNumber: wo.orderNumber,
        workType: wo.workType,
        priority: wo.priority,
        currentStatus: wo.currentStatus,
        totalHours: wo.totalHours || 0,
        laborCost: Math.round(laborCost * 100) / 100,
        sparePartsCost: Math.round(sparePartsCost * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        createdAt: wo.createdAt,
        completedAt: wo.completedAt,
        vehicle: wo.vehicle
          ? {
              licensePlate: wo.vehicle.licensePlate,
              vehicleType: wo.vehicle.vehicleType,
            }
          : null,
        mechanic: wo.assignedTo
          ? {
              id: wo.assignedTo.id,
              name: `${wo.assignedTo.firstName} ${wo.assignedTo.lastName}`,
            }
          : null,
        workshop: wo.workshop
          ? {
              id: wo.workshop.id,
              code: wo.workshop.code,
              name: wo.workshop.name,
            }
          : null,
        spareParts: wo.spareParts.map((sp) => ({
          id: sp.id,
          sparePart: {
            id: sp.sparePart.id,
            code: sp.sparePart.code,
            name: sp.sparePart.name,
            category: sp.sparePart.category,
            unitPrice: sp.sparePart.unitPrice,
          },
          quantityRequested: sp.quantityRequested,
          quantityDelivered: sp.quantityDelivered || 0,
          cost: Math.round((sp.quantityDelivered || sp.quantityRequested || 0) * sp.sparePart.unitPrice * 100) / 100,
        })),
      }
    })

    // Calcular métricas agregadas
    const totalOrders = ordersWithCosts.length
    const totalLaborCost = ordersWithCosts.reduce((sum, o) => sum + o.laborCost, 0)
    const totalSparePartsCost = ordersWithCosts.reduce((sum, o) => sum + o.sparePartsCost, 0)
    const totalCost = ordersWithCosts.reduce((sum, o) => sum + o.totalCost, 0)
    const totalHours = ordersWithCosts.reduce((sum, o) => sum + o.totalHours, 0)
    const avgCostPerOrder = totalOrders > 0 ? totalCost / totalOrders : 0

    // Agrupar por taller
    const byWorkshop = ordersWithCosts.reduce((acc: any, order) => {
      const workshopId = order.workshop?.id || 'no-workshop'
      const workshopName = order.workshop?.name || 'Sin taller'
      if (!acc[workshopId]) {
        acc[workshopId] = {
          workshopId: workshopId === 'no-workshop' ? null : workshopId,
          workshopName,
          workshopCode: order.workshop?.code || '',
          orderCount: 0,
          totalLaborCost: 0,
          totalSparePartsCost: 0,
          totalCost: 0,
          totalHours: 0,
        }
      }
      acc[workshopId].orderCount++
      acc[workshopId].totalLaborCost += order.laborCost
      acc[workshopId].totalSparePartsCost += order.sparePartsCost
      acc[workshopId].totalCost += order.totalCost
      acc[workshopId].totalHours += order.totalHours
      return acc
    }, {})

    // Agrupar por tipo de trabajo
    const byWorkType = ordersWithCosts.reduce((acc: any, order) => {
      const workType = order.workType || 'otro'
      if (!acc[workType]) {
        acc[workType] = {
          workType,
          orderCount: 0,
          totalLaborCost: 0,
          totalSparePartsCost: 0,
          totalCost: 0,
          totalHours: 0,
        }
      }
      acc[workType].orderCount++
      acc[workType].totalLaborCost += order.laborCost
      acc[workType].totalSparePartsCost += order.sparePartsCost
      acc[workType].totalCost += order.totalCost
      acc[workType].totalHours += order.totalHours
      return acc
    }, {})

    // Agrupar por mecánico
    const byMechanic = ordersWithCosts.reduce((acc: any, order) => {
      if (!order.mechanic) return acc
      const mechanicId = order.mechanic.id
      const mechanicName = order.mechanic.name
      if (!acc[mechanicId]) {
        acc[mechanicId] = {
          mechanicId,
          mechanicName,
          orderCount: 0,
          totalLaborCost: 0,
          totalSparePartsCost: 0,
          totalCost: 0,
          totalHours: 0,
        }
      }
      acc[mechanicId].orderCount++
      acc[mechanicId].totalLaborCost += order.laborCost
      acc[mechanicId].totalSparePartsCost += order.sparePartsCost
      acc[mechanicId].totalCost += order.totalCost
      acc[mechanicId].totalHours += order.totalHours
      return acc
    }, {})

    return {
      summary: {
        totalOrders,
        totalLaborCost: Math.round(totalLaborCost * 100) / 100,
        totalSparePartsCost: Math.round(totalSparePartsCost * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        totalHours: Math.round(totalHours * 100) / 100,
        averageCostPerOrder: Math.round(avgCostPerOrder * 100) / 100,
        hourlyRate: HOURLY_RATE,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        workshopId: workshopId || null,
      },
      byWorkshop: Object.values(byWorkshop).map((w: any) => ({
        ...w,
        totalLaborCost: Math.round(w.totalLaborCost * 100) / 100,
        totalSparePartsCost: Math.round(w.totalSparePartsCost * 100) / 100,
        totalCost: Math.round(w.totalCost * 100) / 100,
        totalHours: Math.round(w.totalHours * 100) / 100,
      })),
      byWorkType: Object.values(byWorkType).map((w: any) => ({
        ...w,
        totalLaborCost: Math.round(w.totalLaborCost * 100) / 100,
        totalSparePartsCost: Math.round(w.totalSparePartsCost * 100) / 100,
        totalCost: Math.round(w.totalCost * 100) / 100,
        totalHours: Math.round(w.totalHours * 100) / 100,
      })),
      byMechanic: Object.values(byMechanic).map((m: any) => ({
        ...m,
        totalLaborCost: Math.round(m.totalLaborCost * 100) / 100,
        totalSparePartsCost: Math.round(m.totalSparePartsCost * 100) / 100,
        totalCost: Math.round(m.totalCost * 100) / 100,
        totalHours: Math.round(m.totalHours * 100) / 100,
      })),
      orders: ordersWithCosts,
    }
  }
}

export default new ReportService()

