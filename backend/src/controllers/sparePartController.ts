import { Request, Response } from 'express'
import sparePartService from '../services/sparePartService'
import { sendSuccess, sendError, sendPaginated } from '../utils/response'

/**
 * Controlador de repuestos
 */
export class SparePartController {
  /**
   * GET /api/spare-parts
   */
  async getAll(req: Request, res: Response) {
    try {
      const filters = req.query
      const result = await sparePartService.getAll(filters)
      return sendPaginated(res, result.spareParts, result.page, result.limit, result.total)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/spare-parts/stats
   */
  async getStats(_req: Request, res: Response) {
    try {
      const stats = await sparePartService.getStats()
      return sendSuccess(res, stats)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/spare-parts/low-stock
   */
  async getLowStock(_req: Request, res: Response) {
    try {
      const spareParts = await sparePartService.getLowStock()
      return sendSuccess(res, spareParts)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/spare-parts/:id
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const sparePart = await sparePartService.getById(id)
      return sendSuccess(res, sparePart)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  /**
   * POST /api/spare-parts
   */
  async create(req: Request, res: Response) {
    try {
      const data = req.body
      const sparePart = await sparePartService.create(data)
      return sendSuccess(res, sparePart, 'Repuesto creado exitosamente', 201)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * PUT /api/spare-parts/:id
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data = req.body
      const sparePart = await sparePartService.update(id, data)
      return sendSuccess(res, sparePart, 'Repuesto actualizado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * POST /api/spare-parts/:id/adjust-stock
   */
  async adjustStock(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { quantity, movementType, reason, reference } = req.body

      if (!quantity || !movementType || !reason) {
        return sendError(res, 'Cantidad, tipo de movimiento y razón son requeridos', 400)
      }

      const sparePart = await sparePartService.adjustStock(
        id,
        quantity,
        movementType,
        reason,
        reference
      )

      return sendSuccess(res, sparePart, 'Stock ajustado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * POST /api/spare-parts/request
   */
  async requestForWorkOrder(req: Request, res: Response) {
    try {
      const { workOrderId, sparePartId, quantity, observations } = req.body

      if (!workOrderId || !sparePartId || !quantity) {
        return sendError(res, 'Orden, repuesto y cantidad son requeridos', 400)
      }

      const request = await sparePartService.requestForWorkOrder(
        workOrderId,
        sparePartId,
        quantity,
        observations
      )

      return sendSuccess(res, request, 'Repuesto solicitado exitosamente', 201)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * POST /api/spare-parts/deliver/:id
   */
  async deliverForWorkOrder(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { quantityDelivered } = req.body

      if (!quantityDelivered) {
        return sendError(res, 'Cantidad entregada requerida', 400)
      }

      const sparePart = await sparePartService.deliverForWorkOrder(id, quantityDelivered)
      return sendSuccess(res, sparePart, 'Repuesto entregado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }
}

export default new SparePartController()


