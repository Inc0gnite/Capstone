import api from './api'

export interface Mechanic {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  isActive: boolean
  workshopId: string
  currentWorkload: number
  maxWorkload: number
  activeOrders: number
  completedOrders: number
  efficiency: number
  specialties?: string[]
  createdAt: string
  updatedAt: string
}

export interface AssignMechanicRequest {
  workOrderId: string
  mechanicId: string
  notes?: string
}

export interface MechanicWorkload {
  mechanicId: string
  mechanicName: string
  activeOrders: number
  inProgressOrders: number
  pendingOrders: number
  maxCapacity: number
  efficiency: number
  specialties: string[]
  isAvailable: boolean
  currentHours: number
  maxHours: number
  estimatedHours?: number
}

class MechanicService {
  /**
   * Obtener todos los mecánicos de un taller
   */
  async getMechanicsByWorkshop(workshopId: string): Promise<Mechanic[]> {
    try {
      const response = await api.get(`/mechanics/workshop/${workshopId}`)
      return response.data
    } catch (error) {
      console.error('Error obteniendo mecánicos:', error)
      throw error
    }
  }

  /**
   * Obtener mecánicos disponibles para asignación
   */
  async getAvailableMechanics(workshopId: string): Promise<MechanicWorkload[]> {
    try {
      const response = await api.get(`/mechanics/available/${workshopId}`)
      return response.data.data // Acceder a la propiedad data dentro de la respuesta
    } catch (error) {
      console.error('Error obteniendo mecánicos disponibles:', error)
      throw error
    }
  }

  /**
   * Asignar mecánico a una orden de trabajo
   */
  async assignMechanicToOrder(assignment: AssignMechanicRequest): Promise<void> {
    try {
      await api.post('/mechanics/assign', assignment)
    } catch (error) {
      console.error('Error asignando mecánico:', error)
      throw error
    }
  }

  /**
   * Reasignar mecánico a una orden de trabajo
   */
  async reassignMechanicToOrder(assignment: AssignMechanicRequest): Promise<void> {
    try {
      await api.put('/mechanics/reassign', assignment)
    } catch (error) {
      console.error('Error reasignando mecánico:', error)
      throw error
    }
  }

  /**
   * Obtener carga de trabajo de un mecánico
   */
  async getMechanicWorkload(mechanicId: string): Promise<MechanicWorkload> {
    try {
      const response = await api.get(`/mechanics/${mechanicId}/workload`)
      return response.data
    } catch (error) {
      console.error('Error obteniendo carga de trabajo:', error)
      throw error
    }
  }

  /**
   * Obtener mecánicos con sus especialidades
   */
  async getMechanicsWithSpecialties(workshopId: string): Promise<Mechanic[]> {
    try {
      const response = await api.get(`/mechanics/workshop/${workshopId}/specialties`)
      return response.data
    } catch (error) {
      console.error('Error obteniendo mecánicos con especialidades:', error)
      throw error
    }
  }

  /**
   * Obtener mecánicos por especialidad
   */
  async getMechanicsBySpecialty(workshopId: string, specialty: string): Promise<Mechanic[]> {
    try {
      const response = await api.get(`/mechanics/workshop/${workshopId}/specialty/${specialty}`)
      return response.data
    } catch (error) {
      console.error('Error obteniendo mecánicos por especialidad:', error)
      throw error
    }
  }

  /**
   * Obtener todos los mecánicos con su carga de trabajo
   */
  async getAllMechanicsWithWorkload(workshopId: string): Promise<any[]> {
    try {
      const response = await api.get(`/mechanics/workload/${workshopId}`)
      return response.data.data
    } catch (error) {
      console.error('Error obteniendo mecánicos con carga de trabajo:', error)
      throw error
    }
  }

  /**
   * Intercambiar mecánicos entre tareas
   */
  async exchangeMechanics(data: {
    workOrderId: string
    fromMechanicId: string
    toMechanicId: string
    orderToExchangeId: string
  }): Promise<void> {
    try {
      await api.post('/mechanics/exchange', data)
    } catch (error) {
      console.error('Error intercambiando mecánicos:', error)
      throw error
    }
  }
}

export const mechanicService = new MechanicService()
