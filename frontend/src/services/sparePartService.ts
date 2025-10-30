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
  price?: number
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
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.category) searchParams.append('category', params.category)
    if (params?.lowStock) searchParams.append('lowStock', params.lowStock.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.workshopId) searchParams.append('workshopId', params.workshopId)

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
    const response = await api.get('/spare-parts?lowStock=true')
    return response.data
  },

  // Obtener repuestos sin stock
  async getOutOfStock() {
    const response = await api.get('/spare-parts?outOfStock=true')
    return response.data
  },

  // Buscar repuestos
  async search(query: string) {
    const response = await api.get(`/spare-parts?search=${encodeURIComponent(query)}`)
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
  }
}
