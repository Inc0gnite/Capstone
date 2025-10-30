import { Request, Response } from 'express'
import dashboardService from '../services/dashboardService'
import { sendSuccess, sendError } from '../utils/response'

/**
 * Controlador del dashboard
 */
export class DashboardController {
  /**
   * GET /api/dashboard/stats
   * Obtener estadísticas generales
   */
  async getGeneralStats(req: Request, res: Response) {
    try {
      const { workshopId } = req.query
      const stats = await dashboardService.getGeneralStats(workshopId as string)
      return sendSuccess(res, stats)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/dashboard/stats/:period
   * Obtener estadísticas por período
   */
  async getStatsByPeriod(req: Request, res: Response) {
    try {
      const { period } = req.params
      const { workshopId } = req.query

      if (!['day', 'week', 'month'].includes(period)) {
        return sendError(res, 'Período inválido. Use: day, week, month', 400)
      }

      const stats = await dashboardService.getStatsByPeriod(
        period as 'day' | 'week' | 'month',
        workshopId as string
      )

      return sendSuccess(res, stats)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/dashboard/mechanics-performance
   * Obtener rendimiento de mecánicos
   */
  async getMechanicsPerformance(req: Request, res: Response) {
    try {
      const { workshopId } = req.query
      const performance = await dashboardService.getMechanicsPerformance(
        workshopId as string
      )
      return sendSuccess(res, performance)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/dashboard/activity
   * Obtener actividad reciente
   */
  async getRecentActivity(req: Request, res: Response) {
    try {
      const { workshopId, limit } = req.query
      const activity = await dashboardService.getRecentActivity(
        workshopId as string,
        limit ? parseInt(limit as string) : undefined
      )
      return sendSuccess(res, activity)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/dashboard/mechanic-stats/:mechanicId
   * Obtener estadísticas específicas de un mecánico
   */
  async getMechanicStats(req: Request, res: Response) {
    try {
      const { mechanicId } = req.params
      const stats = await dashboardService.getMechanicStats(mechanicId)
      return sendSuccess(res, stats)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }
}

export default new DashboardController()


