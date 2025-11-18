import { Request, Response } from 'express'
import reportService from '../services/reportService'
import { sendSuccess, sendError } from '../utils/response'

/**
 * Controlador de reportes
 */
export class ReportController {
  /**
   * GET /api/reports/fleet
   * Generar reporte de flota con filtros
   */
  async generateFleetReport(req: Request, res: Response) {
    try {
      const { regionId, dateFrom, dateTo } = req.query

      const filters: any = {}
      if (regionId) filters.regionId = regionId as string
      if (dateFrom) filters.dateFrom = dateFrom as string
      if (dateTo) filters.dateTo = dateTo as string

      const report = await reportService.generateFleetReport(filters)
      return sendSuccess(res, report, 'Reporte de flota generado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }
}

export default new ReportController()

