import api from './api'
import type { Vehicle, VehicleFilters } from '../../../shared/types'

export const vehicleService = {
  /**
   * Obtener todos los vehículos con filtros
   */
  async getAll(filters?: VehicleFilters) {
    const response = await api.get('/vehicles', { params: filters })
    return response.data
  },

  /**
   * Obtener vehículo por ID
   */
  async getById(id: string): Promise<Vehicle> {
    const response = await api.get(`/vehicles/${id}`)
    return response.data.data
  },

  /**
   * Buscar vehículo por patente
   */
  async getByLicensePlate(licensePlate: string): Promise<Vehicle> {
    const response = await api.get(`/vehicles/plate/${licensePlate}`)
    return response.data.data
  },

  /**
   * Crear vehículo
   */
  async create(data: {
    licensePlate: string
    vehicleType: string
    brand: string
    model?: string
    year: number
    vin?: string
    fleetNumber?: string
    regionId: string
  }): Promise<Vehicle> {
    const response = await api.post('/vehicles', data)
    return response.data.data
  },

  /**
   * Actualizar vehículo
   */
  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await api.put(`/vehicles/${id}`, data)
    return response.data.data
  },

  /**
   * Eliminar vehículo permanentemente
   */
  async delete(id: string) {
    const response = await api.delete(`/vehicles/${id}`)
    return response.data.data
  },

  /**
   * Obtener estadísticas de vehículos
   */
  async getStats() {
    const response = await api.get('/vehicles/stats')
    return response.data.data
  },
}


