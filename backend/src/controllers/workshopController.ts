import { Request, Response } from 'express'
import workshopService from '../services/workshopService'
import { sendSuccess, sendError } from '../utils/response'

/**
 * Controlador de talleres
 */
export class WorkshopController {
  /**
   * GET /api/workshops
   */
  async getAll(_req: Request, res: Response) {
    try {
      const workshops = await workshopService.getAllWorkshops()
      return sendSuccess(res, workshops)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/workshops/:id
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const workshop = await workshopService.getWorkshopById(id)
      return sendSuccess(res, workshop)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  /**
   * GET /api/workshops/:id/stats
   */
  async getStats(req: Request, res: Response) {
    try {
      const { id } = req.params
      const stats = await workshopService.getWorkshopStats(id)
      return sendSuccess(res, stats)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/workshops/region/:regionId
   */
  async getByRegion(req: Request, res: Response) {
    try {
      const { regionId } = req.params
      const workshops = await workshopService.getWorkshopsByRegion(regionId)
      return sendSuccess(res, workshops)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * POST /api/workshops
   */
  async create(req: Request, res: Response) {
    try {
      const data = req.body
      const workshop = await workshopService.createWorkshop(data)
      return sendSuccess(res, workshop, 'Taller creado exitosamente', 201)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * PUT /api/workshops/:id
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data = req.body
      const workshop = await workshopService.updateWorkshop(id, data)
      return sendSuccess(res, workshop, 'Taller actualizado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * POST /api/workshops/:id/schedule
   */
  async setSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data = {
        ...req.body,
        workshopId: id,
      }
      const schedule = await workshopService.setSchedule(data)
      return sendSuccess(res, schedule, 'Horario configurado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }
}

export default new WorkshopController()


