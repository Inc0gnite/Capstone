import api from './api'
import type { Notification } from '../../../shared/types'

export const notificationService = {
  /**
   * Obtener mis notificaciones
   */
  async getMyNotifications(page = 1, limit = 20, unreadOnly = false) {
    const response = await api.get('/notifications', {
      params: { page, limit, unreadOnly },
    })
    return response.data
  },

  /**
   * Marcar notificación como leída
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await api.put(`/notifications/${id}/read`)
    return response.data.data
  },

  /**
   * Marcar todas como leídas
   */
  async markAllAsRead() {
    const response = await api.put('/notifications/read-all')
    return response.data.data
  },

  /**
   * Eliminar notificación
   */
  async delete(id: string) {
    const response = await api.delete(`/notifications/${id}`)
    return response.data.data
  },

  /**
   * Eliminar todas las leídas
   */
  async deleteAllRead() {
    const response = await api.delete('/notifications/read')
    return response.data.data
  },
}


