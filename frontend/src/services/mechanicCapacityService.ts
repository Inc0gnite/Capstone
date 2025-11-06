import api from './api'

export interface MechanicCapacity {
  id: string
  name: string
  currentHours: number
  maxHours: number
  currentOrders: number
  workshopId: string
  workshopName: string
}

export interface MechanicCapacityResponse {
  mechanics: MechanicCapacity[]
  workshop: {
    id: string
    name: string
    maxHoursPerMechanic: number
  }
}

class MechanicCapacityService {
  /**
   * Obtener capacidad de mecánicos de un taller (por horas)
   */
  async getMechanicCapacity(workshopId: string): Promise<MechanicCapacityResponse> {
    console.log('🔍 Obteniendo capacidad de mecánicos para taller:', workshopId)
    
    try {
      const response = await api.get(`/workshops/${workshopId}/mechanic-capacity`)
      console.log('✅ Capacidad de mecánicos obtenida:', response.data)
      return response.data
    } catch (error) {
      console.warn('⚠️ Backend no disponible, usando datos simulados')
      
      // Datos simulados por ahora
      const mockData: MechanicCapacityResponse = {
        mechanics: [
          { id: '1', name: 'Carlos Silva', currentHours: 6, maxHours: 8, currentOrders: 3, workshopId, workshopName: 'Taller Principal' },
          { id: '2', name: 'Ana Martínez', currentHours: 8, maxHours: 8, currentOrders: 4, workshopId, workshopName: 'Taller Principal' },
          { id: '3', name: 'Pedro López', currentHours: 4, maxHours: 8, currentOrders: 2, workshopId, workshopName: 'Taller Principal' },
          { id: '4', name: 'María González', currentHours: 7, maxHours: 8, currentOrders: 3, workshopId, workshopName: 'Taller Principal' },
        ],
        workshop: {
          id: workshopId,
          name: 'Taller Principal',
          maxHoursPerMechanic: 8
        }
      }
      
      return mockData
    }
  }

  /**
   * Obtener mecánicos disponibles para asignación (por horas)
   */
  async getAvailableMechanics(workshopId: string): Promise<MechanicCapacity[]> {
    console.log('🔍 Obteniendo mecánicos disponibles para taller:', workshopId)
    
    try {
      const response = await api.get(`/workshops/${workshopId}/available-mechanics`)
      console.log('✅ Mecánicos disponibles obtenidos:', response.data)
      return response.data
    } catch (error) {
      console.warn('⚠️ Backend no disponible, usando datos simulados')
      
      // Datos simulados por ahora
      const mockData: MechanicCapacity[] = [
        { id: '1', name: 'Carlos Silva', currentHours: 6, maxHours: 8, currentOrders: 3, workshopId, workshopName: 'Taller Principal' },
        { id: '2', name: 'Ana Martínez', currentHours: 8, maxHours: 8, currentOrders: 4, workshopId, workshopName: 'Taller Principal' },
        { id: '3', name: 'Pedro López', currentHours: 4, maxHours: 8, currentOrders: 2, workshopId, workshopName: 'Taller Principal' },
        { id: '4', name: 'María González', currentHours: 7, maxHours: 8, currentOrders: 3, workshopId, workshopName: 'Taller Principal' },
      ]
      
      return mockData
    }
  }

  /**
   * Verificar si un mecánico puede recibir más órdenes (por horas)
   */
  async canAssignOrder(mechanicId: string, workshopId: string, estimatedHours?: number): Promise<boolean> {
    console.log('🔍 Verificando si se puede asignar orden:', { mechanicId, workshopId, estimatedHours })
    
    try {
      const params = new URLSearchParams()
      params.append('workshopId', workshopId)
      if (estimatedHours) params.append('estimatedHours', estimatedHours.toString())
      
      const response = await api.get(`/mechanics/${mechanicId}/can-assign?${params.toString()}`)
      console.log('✅ Verificación completada:', response.data)
      return response.data.canAssign
    } catch (error: any) {
      console.error('❌ Error verificando capacidad:', error)
      return false
    }
  }
}

export const mechanicCapacityService = new MechanicCapacityService()