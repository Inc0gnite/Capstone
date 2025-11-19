import api from './api'

export interface FleetReport {
  summary: {
    totalVehicles: number
    totalEntries: number
    totalWorkOrders: number
    averageCompletionTime: number
    dateFrom: string | null
    dateTo: string | null
    regionId: string | null
  }
  byRegion: Array<{
    regionName: string
    regionCode: string
    vehicleCount: number
    entryCount: number
    workOrderCount: number
  }>
  byVehicleType: Array<{
    vehicleType: string
    count: number
  }>
  workOrdersByStatus: Record<string, number>
  workOrdersByPriority: Record<string, number>
  vehicles: Array<{
    id: string
    licensePlate: string
    vehicleType: string
    brand: string
    model: string
    year: number
    fleetNumber: string | null
    region: {
      id: string
      code: string
      name: string
    } | null
    totalEntries: number
    totalWorkOrders: number
    entries: Array<any>
  }>
}

export interface MechanicsPerformanceReport {
  summary: {
    totalMechanics: number
    totalOrders: number
    totalCompleted: number
    totalHours: number
    averageEfficiency: number
    dateFrom: string | null
    dateTo: string | null
    workshopId: string | null
  }
  mechanics: Array<{
    id: string
    name: string
    email: string
    workshop: {
      id: string
      code: string
      name: string
    } | null
    totalOrders: number
    completedOrders: number
    inProgressOrders: number
    pendingOrders: number
    pausedOrders: number
    cancelledOrders: number
    totalHours: number
    estimatedHours: number
    averageHours: number
    efficiency: number
    averageCompletionDays: number
    orders: Array<any>
  }>
}

export interface InventoryReport {
  summary: {
    totalParts: number
    totalValue: number
    lowStockCount: number
    outOfStockCount: number
    workshopId: string | null
    category: string | null
  }
  byCategory: Array<{
    category: string
    count: number
    totalValue: number
    lowStockCount: number
  }>
  byWorkshop: Array<{
    workshopId: string | null
    workshopName: string
    workshopCode: string
    count: number
    totalValue: number
    lowStockCount: number
  }>
  parts: Array<{
    id: string
    code: string
    name: string
    description: string | null
    category: string
    unitOfMeasure: string
    unitPrice: number
    currentStock: number
    minStock: number
    maxStock: number
    location: string | null
    totalValue: number
    isLowStock: boolean
    isOutOfStock: boolean
    usageCount: number
    workshop: {
      id: string
      code: string
      name: string
    } | null
    recentMovements: Array<any>
  }>
}

export interface CostsReport {
  summary: {
    totalOrders: number
    totalLaborCost: number
    totalSparePartsCost: number
    totalCost: number
    totalHours: number
    averageCostPerOrder: number
    hourlyRate: number
    dateFrom: string | null
    dateTo: string | null
    workshopId: string | null
  }
  byWorkshop: Array<{
    workshopId: string | null
    workshopName: string
    workshopCode: string
    orderCount: number
    totalLaborCost: number
    totalSparePartsCost: number
    totalCost: number
    totalHours: number
  }>
  byWorkType: Array<{
    workType: string
    orderCount: number
    totalLaborCost: number
    totalSparePartsCost: number
    totalCost: number
    totalHours: number
  }>
  byMechanic: Array<{
    mechanicId: string
    mechanicName: string
    orderCount: number
    totalLaborCost: number
    totalSparePartsCost: number
    totalCost: number
    totalHours: number
  }>
  orders: Array<{
    id: string
    orderNumber: string
    workType: string
    priority: string
    currentStatus: string
    totalHours: number
    laborCost: number
    sparePartsCost: number
    totalCost: number
    createdAt: string
    completedAt: string | null
    vehicle: {
      licensePlate: string
      vehicleType: string
    } | null
    mechanic: {
      id: string
      name: string
    } | null
    workshop: {
      id: string
      code: string
      name: string
    } | null
    spareParts: Array<any>
  }>
}

export const reportService = {
  /**
   * Generar reporte de flota con filtros
   */
  async generateFleetReport(params?: {
    regionId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<FleetReport> {
    const searchParams = new URLSearchParams()
    if (params?.regionId) searchParams.append('regionId', params.regionId)
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom)
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo)

    const queryString = searchParams.toString()
    const url = `/reports/fleet${queryString ? `?${queryString}` : ''}`
    const response = await api.get(url)
    return response.data.data
  },

  /**
   * Generar reporte de desempeño de mecánicos con filtros
   */
  async generateMechanicsPerformanceReport(params?: {
    workshopId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<MechanicsPerformanceReport> {
    const searchParams = new URLSearchParams()
    if (params?.workshopId) searchParams.append('workshopId', params.workshopId)
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom)
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo)

    const queryString = searchParams.toString()
    const url = `/reports/mechanics-performance${queryString ? `?${queryString}` : ''}`
    const response = await api.get(url)
    return response.data.data
  },

  /**
   * Generar reporte de inventario con filtros
   */
  async generateInventoryReport(params?: {
    workshopId?: string
    category?: string
    lowStock?: boolean
    search?: string
  }): Promise<InventoryReport> {
    const searchParams = new URLSearchParams()
    if (params?.workshopId) searchParams.append('workshopId', params.workshopId)
    if (params?.category) searchParams.append('category', params.category)
    if (params?.lowStock) searchParams.append('lowStock', 'true')
    if (params?.search) searchParams.append('search', params.search)

    const queryString = searchParams.toString()
    const url = `/reports/inventory${queryString ? `?${queryString}` : ''}`
    const response = await api.get(url)
    return response.data.data
  },

  /**
   * Generar reporte de costos con filtros
   */
  async generateCostsReport(params?: {
    workshopId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<CostsReport> {
    const searchParams = new URLSearchParams()
    if (params?.workshopId) searchParams.append('workshopId', params.workshopId)
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom)
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo)

    const queryString = searchParams.toString()
    const url = `/reports/costs${queryString ? `?${queryString}` : ''}`
    const response = await api.get(url)
    return response.data.data
  },
}

