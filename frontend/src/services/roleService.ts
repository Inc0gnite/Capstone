import api from './api'

export interface Role { id: string; name: string; description?: string }

export const roleService = {
  async getAll() {
    const res = await api.get('/roles')
    return res.data
  },
}




