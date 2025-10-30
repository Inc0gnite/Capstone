import api from './api'

export const regionService = {
  /**
   * Obtener todas las regiones
   */
  async getAll() {
    const response = await api.get('/regions')
    return response.data
  },

  /**
   * Obtener región por ID
   */
  async getById(id: string) {
    const response = await api.get(`/regions/${id}`)
    return response.data.data
  },

  /**
   * Crear región
   */
  async create(data: {
    name: string
    code: string
    description?: string
  }) {
    const response = await api.post('/regions', data)
    return response.data.data
  },

  /**
   * Actualizar región
   */
  async update(id: string, data: Partial<{
    name: string
    code: string
    description: string
  }>) {
    const response = await api.put(`/regions/${id}`, data)
    return response.data.data
  },

  /**
   * Eliminar región
   */
  async delete(id: string) {
    const response = await api.delete(`/regions/${id}`)
    return response.data.data
  }
}











