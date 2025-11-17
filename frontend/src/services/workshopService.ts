import api from './api'

export interface Region {
  id: string
  code: string
  name: string
  isActive: boolean
}

export interface Workshop {
  id: string
  code: string
  name: string
  regionId: string
  region?: Region
  address: string
  city: string
  phone?: string
  capacity?: number
  isActive: boolean
  _count?: {
    users: number
    entries: number
    workOrders: number
  }
}

export const workshopService = {
  async getAll() {
    const res = await api.get('/workshops')
    return res.data
  },

  async getById(id: string) {
    const res = await api.get(`/workshops/${id}`)
    return res.data
  },

  async create(data: {
    code: string
    name: string
    regionId: string
    address: string
    city: string
    phone?: string
    capacity?: number
  }) {
    const res = await api.post('/workshops', data)
    return res.data
  },

  async update(id: string, data: {
    name?: string
    regionId?: string
    address?: string
    city?: string
    phone?: string
    capacity?: number
    isActive?: boolean
  }) {
    const res = await api.put(`/workshops/${id}`, data)
    return res.data
  },
}











