import api from './api'
import type { VehicleEntry, PaginationParams } from '../../../shared/types'

// Re-export VehicleEntry for local use
export type { VehicleEntry }

export interface VehicleEntryFilters extends PaginationParams {
  search?: string
  status?: string
  workshopId?: string
  vehicleId?: string
  dateFrom?: string
  dateTo?: string
}

export interface CreateVehicleEntryRequest {
  vehicleId: string
  workshopId: string
  driverRut: string
  driverName: string
  driverPhone?: string
  entryKm: number
  fuelLevel: string
  hasKeys: boolean
  keyLocation?: string
  observations?: string
  photos?: string[]
  createdById: string
}

export interface UpdateVehicleEntryRequest {
  driverRut?: string
  driverName?: string
  driverPhone?: string
  observations?: string
  photos?: string[]
}

export interface RegisterExitRequest {
  exitKm: number
  exitTime?: string
  observations?: string
}

export interface UpdateKeyControlRequest {
  keyLocation: string
  deliveredTo?: string
  deliveredAt?: string
  observations?: string
}

export const vehicleEntryService = {
  /**
   * Obtener todos los ingresos con filtros
   */
  async getAll(filters?: VehicleEntryFilters) {
    const response = await api.get('/vehicle-entries', { params: filters })
    return response.data
  },

  /**
   * Obtener ingreso por ID
   */
  async getById(id: string): Promise<VehicleEntry> {
    const response = await api.get(`/vehicle-entries/${id}`)
    return response.data.data
  },

  /**
   * Crear ingreso de vehículo
   */
  async create(data: CreateVehicleEntryRequest): Promise<VehicleEntry> {
    const response = await api.post('/vehicle-entries', data)
    return response.data.data
  },

  /**
   * Actualizar ingreso
   */
  async update(id: string, data: UpdateVehicleEntryRequest): Promise<VehicleEntry> {
    const response = await api.put(`/vehicle-entries/${id}`, data)
    return response.data.data
  },

  /**
   * Verificar si un vehículo está listo para salida
   */
  async isReadyForExit(id: string): Promise<boolean> {
    const response = await api.get(`/vehicle-entries/${id}/ready-for-exit`)
    return response.data.data.isReady
  },

  /**
   * Registrar salida del vehículo
   */
  async registerExit(id: string, data: RegisterExitRequest): Promise<VehicleEntry> {
    const response = await api.post(`/vehicle-entries/${id}/exit`, data)
    return response.data.data
  },

  /**
   * Actualizar control de llaves
   */
  async updateKeyControl(id: string, data: UpdateKeyControlRequest) {
    const response = await api.put(`/vehicle-entries/${id}/keys`, data)
    return response.data.data
  },

  /**
   * Obtener estadísticas de ingresos
   */
  async getStats() {
    const response = await api.get('/vehicle-entries/stats')
    return response.data.data
  },

  /**
   * Buscar ingreso por código de entrada
   */
  async getByEntryCode(entryCode: string): Promise<VehicleEntry> {
    const response = await api.get(`/vehicle-entries/code/${entryCode}`)
    return response.data.data
  },

  /**
   * Obtener ingresos activos (sin salida)
   */
  async getActiveEntries(workshopId?: string): Promise<VehicleEntry[]> {
    const response = await api.get('/vehicle-entries/active', {
      params: workshopId ? { workshopId } : {}
    })
    return response.data.data
  }
}
