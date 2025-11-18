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
}

