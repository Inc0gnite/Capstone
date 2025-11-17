import api from './api'
import type { DashboardStats } from '../../../shared/types'

export const dashboardService = {
  /**
   * Obtener estadísticas generales del dashboard
   */
  async getGeneralStats(workshopId?: string): Promise<DashboardStats> {
    const params = workshopId ? { workshopId } : {}
    const response = await api.get('/dashboard/stats', { params })
    return response.data.data
  },

  /**
   * Obtener estadísticas por período
   */
  async getStatsByPeriod(period: 'day' | 'week' | 'month', workshopId?: string) {
    const params = workshopId ? { workshopId } : {}
    const response = await api.get(`/dashboard/stats/${period}`, { params })
    return response.data.data
  },

  /**
   * Obtener rendimiento de mecánicos
   */
  async getMechanicsPerformance(workshopId?: string) {
    const params = workshopId ? { workshopId } : {}
    const response = await api.get('/dashboard/mechanics-performance', { params })
    return response.data.data
  },

  /**
   * Obtener actividad reciente
   */
  async getRecentActivity(workshopId?: string, limit = 20) {
    const params: any = { limit }
    if (workshopId) params.workshopId = workshopId
    const response = await api.get('/dashboard/activity', { params })
    return response.data.data
  },

  /**
   * Obtener estadísticas específicas de un mecánico
   */
  async getMechanicStats(mechanicId: string) {
    const response = await api.get(`/dashboard/mechanic-stats/${mechanicId}`)
    return response.data.data
  },
}


