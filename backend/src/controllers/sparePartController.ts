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
   * GET /api/spare-parts/categories
   */
  async getCategories(_req: Request, res: Response) {
    try {
      const categories = await sparePartService.getCategories()
      return sendSuccess(res, categories)
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
      
      // Validar que el recurso pertenezca al taller del usuario (excepto Admin)
      if (req.user && req.user.roleName !== 'Administrador' && req.user.workshopId) {
        if (sparePart.workshopId && sparePart.workshopId !== req.user.workshopId) {
          return sendError(res, 'No tiene acceso a este repuesto. Pertenece a otro taller.', 403)
        }
      }
      
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
      // Validar que el usuario tenga taller asignado (excepto Admin)
      if (req.user && req.user.roleName !== 'Administrador') {
        if (!req.user.workshopId) {
          return sendError(res, 'Usuario no tiene taller asignado. Contacte al administrador.', 403)
        }
        // Asegurar que el workshopId sea del usuario
        req.body.workshopId = req.body.workshopId || req.user.workshopId
      }
      
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
      
      // Validar que el recurso pertenezca al taller del usuario (excepto Admin)
      if (req.user && req.user.roleName !== 'Administrador' && req.user.workshopId) {
        const existingPart = await sparePartService.getById(id)
        if (existingPart.workshopId && existingPart.workshopId !== req.user.workshopId) {
          return sendError(res, 'No puede modificar repuestos de otro taller', 403)
        }
        // Prevenir cambio de taller
        delete req.body.workshopId
      }
      
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

      // Validar que el recurso pertenezca al taller del usuario (excepto Admin)
      if (req.user && req.user.roleName !== 'Administrador' && req.user.workshopId) {
        const sparePart = await sparePartService.getById(id)
        if (sparePart.workshopId && sparePart.workshopId !== req.user.workshopId) {
          return sendError(res, 'No puede ajustar stock de repuestos de otro taller', 403)
        }
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
      const { workOrderId, sparePartId, quantity, observations, requests } = req.body

      // Si viene un array de requests, usar el método para múltiples repuestos
      if (requests && Array.isArray(requests) && requests.length > 0) {
        if (!workOrderId) {
          return sendError(res, 'Orden de trabajo es requerida', 400)
        }

        // Validar que todos los requests tengan los campos necesarios
        for (const reqItem of requests) {
          if (!reqItem.sparePartId || !reqItem.quantity) {
            return sendError(res, 'Cada repuesto debe tener ID y cantidad', 400)
          }
          if (reqItem.quantity <= 0) {
            return sendError(res, 'La cantidad debe ser mayor a 0', 400)
          }
        }

        const result = await sparePartService.requestMultipleForWorkOrder(
          workOrderId,
          requests,
          observations
        )

        return sendSuccess(
          res,
          result,
          `${result.length} repuesto(s) solicitado(s) exitosamente`,
          201
        )
      }

      // Si viene un solo repuesto (retrocompatibilidad)
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

  /**
   * POST /api/spare-parts/:id/mark-as-used
   * Marcar repuesto como usado
   */
  async markAsUsed(req: Request, res: Response) {
    try {
      const { id } = req.params
      const request = await sparePartService.markAsUsed(id)
      return sendSuccess(res, request, 'Repuesto marcado como usado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * POST /api/spare-parts/:id/mark-as-surplus
   * Marcar repuesto como sobrante y devolver al inventario
   */
  async markAsSurplus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { quantityToReturn } = req.body
      const request = await sparePartService.markAsSurplus(id, quantityToReturn)
      return sendSuccess(res, request, 'Repuesto marcado como sobrante y devuelto al inventario')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * GET /api/spare-parts/requests/pending
   * Obtener solicitudes pendientes de aprobación
   */
  async getPendingRequests(req: Request, res: Response) {
    try {
      const { workshopId } = req.query
      const requests = await sparePartService.getPendingRequests(workshopId as string)
      return sendSuccess(res, requests)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/spare-parts/requests
   * Obtener todas las solicitudes de repuestos (historial completo)
   */
  async getAllRequests(req: Request, res: Response) {
    try {
      const { workshopId, status, page, limit, dateFrom, dateTo } = req.query
      const result = await sparePartService.getAllRequests({
        workshopId: workshopId as string,
        status: status as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
      })
      return sendSuccess(res, result)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * POST /api/spare-parts/requests/:id/approve
   * Aprobar solicitud de repuesto
   */
  async approveRequest(req: Request, res: Response) {
    try {
      const { id } = req.params
      const request = await sparePartService.approveRequest(id, req.user!.userId)
      return sendSuccess(res, request, 'Solicitud aprobada exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * POST /api/spare-parts/requests/:id/reject
   * Rechazar solicitud de repuesto
   */
  async rejectRequest(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { reason } = req.body
      const request = await sparePartService.rejectRequest(id, req.user!.userId, reason)
      return sendSuccess(res, request, 'Solicitud rechazada exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * GET /api/spare-parts/:id/movements
   * Obtener movimientos de un repuesto con filtros
   */
  async getMovements(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { dateFrom, dateTo, movementType, page, limit } = req.query

      const filters: any = {}
      if (dateFrom) filters.dateFrom = dateFrom as string
      if (dateTo) filters.dateTo = dateTo as string
      if (movementType) filters.movementType = movementType as 'entrada' | 'salida' | 'ajuste'
      if (page) filters.page = parseInt(page as string, 10)
      if (limit) filters.limit = parseInt(limit as string, 10)

      const result = await sparePartService.getMovements(id, filters)
      return sendPaginated(res, result.movements, result.page, result.limit, result.total)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }
}

export default new SparePartController()


