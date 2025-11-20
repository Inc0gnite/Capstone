import api from './api'

export interface SparePart {
  id: string
  name: string
  code: string
  category: string
  description?: string
  currentStock: number
  minStock: number
  maxStock?: number
  price?: number
  supplier?: string
  location?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSparePartData {
  name: string
  code: string
  category: string
  description?: string
  currentStock: number
  minStock: number
  maxStock?: number
  unitOfMeasure: string
  unitPrice: number
  supplier?: string
  location?: string
  workshopId: string
}

export interface SparePartStats {
  total: number
  lowStock: number
  outOfStock: number
  available: number
  totalValue: number
}

export const sparePartService = {
  // Obtener todos los repuestos
  async getAll(params?: {
    page?: number
    limit?: number
    category?: string
    lowStock?: boolean
    search?: string
    workshopId?: string
  }) {
    const searchParams = new URLSearchParams()
    
    // Validar y normalizar page y limit
    let page = params?.page
    let limit = params?.limit
    
    // Validar que page sea un número válido >= 1
    if (page === undefined || page === null || typeof page !== 'number' || isNaN(page) || page < 1) {
      page = 1
    }
    
    // Validar que limit sea un número válido entre 1 y 100
    if (limit === undefined || limit === null || typeof limit !== 'number' || isNaN(limit) || limit < 1) {
      limit = 10
    } else if (limit > 100) {
      limit = 100
    }
    
    // Siempre incluir page y limit con valores validados
    searchParams.append('page', page.toString())
    searchParams.append('limit', limit.toString())
    
    if (params?.category && params.category.trim()) {
      searchParams.append('category', params.category.trim())
    }
    if (params?.lowStock === true) {
      searchParams.append('lowStock', 'true')
    }
    if (params?.search && params.search.trim()) {
      searchParams.append('search', params.search.trim())
    }
    if (params?.workshopId && params.workshopId.trim()) {
      searchParams.append('workshopId', params.workshopId.trim())
    }

    const response = await api.get(`/spare-parts?${searchParams.toString()}`)
    return response.data
  },

  // Obtener repuesto por ID
  async getById(id: string) {
    const response = await api.get(`/spare-parts/${id}`)
    return response.data.data
  },

  // Crear nuevo repuesto
  async create(data: CreateSparePartData) {
    const response = await api.post('/spare-parts', data)
    return response.data
  },

  // Actualizar repuesto
  async update(id: string, data: Partial<CreateSparePartData>) {
    const response = await api.put(`/spare-parts/${id}`, data)
    return response.data.data
  },

  // Actualizar stock
  async updateStock(id: string, quantity: number, operation: 'add' | 'subtract' | 'set') {
    const response = await api.post(`/spare-parts/${id}/stock`, {
      quantity,
      operation
    })
    return response.data.data
  },

  // Obtener estadísticas
  async getStats() {
    const response = await api.get('/spare-parts/stats')
    return response.data.data
  },

  // Obtener repuestos con stock bajo
  async getLowStock() {
    const response = await api.get('/spare-parts?page=1&limit=100&lowStock=true')
    return response.data
  },

  // Obtener repuestos sin stock
  async getOutOfStock() {
    const response = await api.get('/spare-parts?page=1&limit=100&outOfStock=true')
    return response.data
  },

  // Buscar repuestos
  async search(query: string) {
    const response = await api.get(`/spare-parts?page=1&limit=100&search=${encodeURIComponent(query)}`)
    return response.data
  },

  // Obtener categorías
  async getCategories() {
    const response = await api.get('/spare-parts/categories')
    return response.data.data
  },

  // Eliminar repuesto
  async delete(id: string) {
    const response = await api.delete(`/spare-parts/${id}`)
    return response.data
  },

  // Solicitar repuesto para orden de trabajo (un solo repuesto)
  async requestForWorkOrder(workOrderId: string, sparePartId: string, quantity: number, observations?: string) {
    const response = await api.post('/spare-parts/request', {
      workOrderId,
      sparePartId,
      quantity,
      observations
    })
    return response.data
  },

  // Solicitar múltiples repuestos para orden de trabajo
  async requestMultipleForWorkOrder(
    workOrderId: string,
    requests: Array<{ sparePartId: string; quantity: number }>,
    observations?: string
  ) {
    const response = await api.post('/spare-parts/request', {
      workOrderId,
      requests,
      observations
    })
    return response.data
  },

  // Marcar repuesto como usado
  async markAsUsed(requestId: string) {
    const response = await api.post(`/spare-parts/${requestId}/mark-as-used`)
    return response.data
  },

  // Marcar repuesto como sobrante y devolver al inventario
  async markAsSurplus(requestId: string, quantityToReturn?: number) {
    const response = await api.post(`/spare-parts/${requestId}/mark-as-surplus`, {
      quantityToReturn
    })
    return response.data
  },

  // Obtener solicitudes pendientes de aprobación
  async getPendingRequests(workshopId?: string) {
    const params = workshopId ? `?workshopId=${workshopId}` : ''
    const response = await api.get(`/spare-parts/requests/pending${params}`)
    return response.data.data
  },

  // Obtener todas las solicitudes de repuestos (historial completo)
  async getAllRequests(params?: {
    workshopId?: string
    status?: string
    page?: number
    limit?: number
    dateFrom?: string
    dateTo?: string
  }) {
    const queryParams = new URLSearchParams()
    if (params?.workshopId) queryParams.append('workshopId', params.workshopId)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom)
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo)
    
    const queryString = queryParams.toString()
    const url = `/spare-parts/requests${queryString ? `?${queryString}` : ''}`
    const response = await api.get(url)
    return response.data.data
  },

  // Aprobar solicitud de repuesto
  async approveRequest(requestId: string) {
    const response = await api.post(`/spare-parts/requests/${requestId}/approve`)
    return response.data
  },

  // Rechazar solicitud de repuesto
  async rejectRequest(requestId: string, reason?: string) {
    const response = await api.post(`/spare-parts/requests/${requestId}/reject`, { reason })
    return response.data
  },

  // Ajustar stock de repuesto
  async adjustStock(id: string, quantity: number, reason: string, movementType: 'entrada' | 'salida' | 'ajuste' = 'ajuste', reference?: string) {
    const response = await api.post(`/spare-parts/${id}/adjust-stock`, {
      quantity,
      movementType,
      reason,
      reference
    })
    return response.data
  },

  // Ingresar repuestos (entrada de stock)
  async entryStock(id: string, quantity: number, reason: string, reference?: string) {
    return this.adjustStock(id, quantity, reason, 'entrada', reference)
  },

  // Obtener movimientos de un repuesto con filtros
  async getMovements(
    id: string,
    params?: {
      dateFrom?: string
      dateTo?: string
      movementType?: 'entrada' | 'salida' | 'ajuste'
      page?: number
      limit?: number
    }
  ) {
    const searchParams = new URLSearchParams()
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom)
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo)
    if (params?.movementType) searchParams.append('movementType', params.movementType)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())

    const queryString = searchParams.toString()
    const url = `/spare-parts/${id}/movements${queryString ? `?${queryString}` : ''}`
    const response = await api.get(url)
    return response.data
  }
}
