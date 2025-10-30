import api from './api'

export interface WorkOrder {
  id: string
  orderNumber: string
  vehicleId: string
  entryId: string
  workshopId: string
  assignedToId?: string
  workType: 'mantenimiento' | 'reparacion' | 'revision' | 'otro'
  priority: 'baja' | 'normal' | 'alta' | 'urgente'
  description: string
  observations?: string
  currentStatus: 'pendiente' | 'en_progreso' | 'pausado' | 'completado' | 'cancelado'
  progress?: number
  estimatedHours?: number
  totalHours?: number
  createdAt: string
  updatedAt: string
  startedAt?: string
  completedAt?: string
  vehicle?: {
    id: string
    licensePlate: string
    brand: string
    model: string
    year: number
  }
  entry?: {
    id: string
    entryCode: string
    driverName: string
    driverRut: string
    entryDate: string
  }
  assignedTo?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  createdBy?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  photos?: Array<{
    id: string
    url: string
    description?: string
    createdAt: string
  }>
}

export interface CreateWorkOrderData {
  vehicleId: string
  entryId: string
  workshopId: string
  workType: 'mantenimiento' | 'reparacion' | 'revision' | 'otro'
  priority: 'baja' | 'normal' | 'alta' | 'urgente'
  description: string
  estimatedHours?: number
}

export interface WorkOrderStats {
  total: number
  pendientes: number
  en_progreso: number
  pausados: number
  completados: number
  cancelados: number
  completadosHoy: number
}

export const workOrderService = {
  // Obtener todas las órdenes de trabajo
  async getAll(params?: {
    page?: number
    limit?: number
    status?: string
    workshopId?: string
    assignedToId?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.status) searchParams.append('status', params.status)
    if (params?.workshopId) searchParams.append('workshopId', params.workshopId)
    if (params?.assignedToId) searchParams.append('assignedToId', params.assignedToId)

    const response = await api.get(`/work-orders?${searchParams.toString()}`)
    return response.data
  },

  // Obtener orden por ID
  async getById(id: string) {
    try {
      console.log('🔍 Obteniendo orden de trabajo:', id)
      const response = await api.get(`/work-orders/${id}`)
      console.log('✅ Orden obtenida:', response.data)
      return response.data.data
    } catch (error: any) {
      console.error('❌ Error obteniendo orden de trabajo:', error)
      
      // Si es un error de red o servidor, mostrar mensaje más amigable
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté funcionando.')
      }
      
      // Si es un error 404, la orden no existe
      if (error.response?.status === 404) {
        throw new Error('Orden de trabajo no encontrada.')
      }
      
      // Para otros errores, usar el mensaje del servidor
      throw new Error(error.response?.data?.message || error.message || 'Error desconocido')
    }
  },

  // Crear nueva orden de trabajo
  async create(data: CreateWorkOrderData) {
    console.log('🔨 WorkOrderService.create llamado con:', data)
    try {
      const response = await api.post('/work-orders', data)
      console.log('✅ Respuesta del backend:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error en WorkOrderService.create:', error)
      throw error
    }
  },

  // Actualizar orden de trabajo
  async update(id: string, data: Partial<CreateWorkOrderData>) {
    const response = await api.put(`/work-orders/${id}`, data)
    return response.data.data
  },

  // Cambiar estado de la orden
  async changeStatus(id: string, status: string, reason?: string) {
    const response = await api.post(`/work-orders/${id}/status`, { status, reason })
    return response.data.data
  },

  // Pausar orden
  async pause(id: string, reason: string) {
    const response = await api.post(`/work-orders/${id}/pause`, { reason })
    return response.data
  },

  // Reanudar orden
  async resume(id: string) {
    const response = await api.post(`/work-orders/${id}/resume`)
    return response.data
  },

  // Agregar foto a la orden
  async addPhoto(id: string, url: string, description?: string) {
    const response = await api.post(`/work-orders/${id}/photos`, { url, description })
    return response.data
  },

  // Obtener estadísticas
  async getStats(workshopId?: string) {
    const params = workshopId ? `?workshopId=${workshopId}` : ''
    const response = await api.get(`/work-orders/stats${params}`)
    return response.data.data
  },

  // Obtener órdenes pendientes (sin mecánico asignado)
  async getPendingOrders(workshopId?: string, assignedToId?: string) {
    const params = new URLSearchParams()
    if (workshopId) params.append('workshopId', workshopId)
    if (assignedToId) params.append('assignedToId', assignedToId)
    params.append('status', 'pendiente')

    const response = await api.get(`/work-orders?${params.toString()}`)
    return response.data
  },

  // Obtener órdenes en progreso
  async getActiveOrders(workshopId?: string, assignedToId?: string) {
    const params = new URLSearchParams()
    if (workshopId) params.append('workshopId', workshopId)
    if (assignedToId) params.append('assignedToId', assignedToId)
    params.append('status', 'en_progreso')

    console.log('🔍 Buscando órdenes activas con parámetros:', params.toString())
    const response = await api.get(`/work-orders?${params.toString()}`)
    console.log('✅ Respuesta de órdenes activas:', response.data)
    return response.data
  },

  // Obtener órdenes completadas
  async getCompletedOrders(workshopId?: string, assignedToId?: string) {
    const params = new URLSearchParams()
    if (workshopId) params.append('workshopId', workshopId)
    if (assignedToId) params.append('assignedToId', assignedToId)
    params.append('status', 'completado')

    const response = await api.get(`/work-orders?${params.toString()}`)
    return response.data
  },

  // Obtener órdenes pausadas
  async getPausedOrders(workshopId?: string, assignedToId?: string) {
    const params = new URLSearchParams()
    if (workshopId) params.append('workshopId', workshopId)
    if (assignedToId) params.append('assignedToId', assignedToId)
    params.append('status', 'pausado')

    console.log('🔍 Buscando órdenes pausadas con parámetros:', params.toString())
    const response = await api.get(`/work-orders?${params.toString()}`)
    console.log('✅ Respuesta de órdenes pausadas:', response.data)
    return response.data
  },


  // Obtener órdenes canceladas
  async getCancelledOrders(workshopId?: string, assignedToId?: string) {
    const params = new URLSearchParams()
    if (workshopId) params.append('workshopId', workshopId)
    if (assignedToId) params.append('assignedToId', assignedToId)
    params.append('status', 'cancelado')

    const response = await api.get(`/work-orders?${params.toString()}`)
    return response.data
  },

  /**
   * Asignar mecánico a orden de trabajo
   */
  async assignMechanic(workOrderId: string, mechanicId: string) {
    console.log('👨‍🔧 Asignando mecánico:', { workOrderId, mechanicId })
    
    const response = await api.post(`/work-orders/${workOrderId}/assign`, {
      mechanicId
    })
    
    console.log('✅ Mecánico asignado exitosamente:', response.data)
    return response.data
  }
}