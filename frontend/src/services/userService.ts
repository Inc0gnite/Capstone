import api from './api'

export interface User {
  id: string
  rut: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  isActive: boolean
  createdAt: string
  role?: { id: string; name: string }
  workshop?: { id: string; name: string }
}

export const userService = {
  async getAll(params?: { page?: number; limit?: number; search?: string }) {
    const response = await api.get('/users', { params })
    return response.data
  },

  async getById(id: string) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  async create(data: Partial<User> & { roleId: string; password: string }) {
    const response = await api.post('/users', data)
    return response.data
  },

  async update(id: string, data: Partial<User> & { roleId?: string }) {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },

  async toggleActive(id: string, isActive: boolean) {
    const response = await api.put(`/users/${id}`, { isActive })
    return response.data
  },

  async remove(id: string) {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },
}


