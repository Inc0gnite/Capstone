import api from './api'

export interface Workshop { id: string; name: string }

export const workshopService = {
  async getAll() {
    const res = await api.get('/workshops')
    return res.data
  },
}




