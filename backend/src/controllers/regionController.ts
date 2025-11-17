import { Request, Response } from 'express'
import workshopService from '../services/workshopService'
import { sendSuccess, sendError } from '../utils/response'

/**
 * Controlador de regiones
 */
export class RegionController {
  /**
   * GET /api/regions
   */
  async getAll(_req: Request, res: Response) {
    try {
      const regions = await workshopService.getAllRegions()
      return sendSuccess(res, regions)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/regions/:id
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const region = await workshopService.getRegionById(id)
      return sendSuccess(res, region)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  /**
   * POST /api/regions
   */
  async create(req: Request, res: Response) {
    try {
      const data = req.body
      const region = await workshopService.createRegion(data)
      return sendSuccess(res, region, 'Región creada exitosamente', 201)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * PUT /api/regions/:id
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data = req.body
      const region = await workshopService.updateRegion(id, data)
      return sendSuccess(res, region, 'Región actualizada exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }
}

export default new RegionController()


