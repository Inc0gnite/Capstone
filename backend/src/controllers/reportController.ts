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

  /**
   * GET /api/reports/mechanics-performance
   * Generar reporte de desempeño de mecánicos con filtros
   */
  async generateMechanicsPerformanceReport(req: Request, res: Response) {
    try {
      const { workshopId, dateFrom, dateTo } = req.query

      const filters: any = {}
      if (workshopId) filters.workshopId = workshopId as string
      if (dateFrom) filters.dateFrom = dateFrom as string
      if (dateTo) filters.dateTo = dateTo as string

      // Si el usuario no es admin, filtrar por su taller
      if (!req.user || (req.user as any).role?.name !== 'Administrador') {
        filters.workshopId = (req.user as any).workshopId
      }

      const report = await reportService.generateMechanicsPerformanceReport(filters)
      return sendSuccess(res, report, 'Reporte de desempeño de mecánicos generado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/reports/inventory
   * Generar reporte de inventario con filtros
   */
  async generateInventoryReport(req: Request, res: Response) {
    try {
      const { workshopId, category, lowStock, search } = req.query

      const filters: any = {}
      if (workshopId) filters.workshopId = workshopId as string
      if (category) filters.category = category as string
      if (lowStock === 'true') filters.lowStock = true
      if (search) filters.search = search as string

      // Si el usuario no es admin, filtrar por su taller
      if (!req.user || (req.user as any).role?.name !== 'Administrador') {
        filters.workshopId = (req.user as any).workshopId
      }

      const report = await reportService.generateInventoryReport(filters)
      return sendSuccess(res, report, 'Reporte de inventario generado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/reports/costs
   * Generar reporte de costos con filtros
   */
  async generateCostsReport(req: Request, res: Response) {
    try {
      const { workshopId, dateFrom, dateTo } = req.query

      const filters: any = {}
      if (workshopId) filters.workshopId = workshopId as string
      if (dateFrom) filters.dateFrom = dateFrom as string
      if (dateTo) filters.dateTo = dateTo as string

      // Si el usuario no es admin, filtrar por su taller
      if (!req.user || (req.user as any).role?.name !== 'Administrador') {
        filters.workshopId = (req.user as any).workshopId
      }

      const report = await reportService.generateCostsReport(filters)
      return sendSuccess(res, report, 'Reporte de costos generado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }
}

export default new ReportController()

