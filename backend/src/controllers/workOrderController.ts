import { Request, Response } from 'express'
import workOrderService from '../services/workOrderService'
import { sendSuccess, sendError, sendPaginated } from '../utils/response'

/**
 * Controlador de órdenes de trabajo
 */
export class WorkOrderController {
  /**
   * GET /api/work-orders
   * Obtener todas las órdenes
   */
  async getAll(req: Request, res: Response) {
    try {
      const filters = req.query
      const result = await workOrderService.getAll(filters)
      return sendPaginated(res, result.workOrders, result.page, result.limit, result.total)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/work-orders/stats
   * Obtener estadísticas
   */
  async getStats(req: Request, res: Response) {
    try {
      const { workshopId } = req.query
      const stats = await workOrderService.getStats(workshopId as string)
      return sendSuccess(res, stats)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/work-orders/:id
   * Obtener orden por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const workOrder = await workOrderService.getById(id)
      
      // Validar que el recurso pertenezca al taller del usuario (excepto Admin)
      if (req.user && req.user.roleName !== 'Administrador' && req.user.workshopId) {
        if (workOrder.workshopId !== req.user.workshopId) {
          return sendError(res, 'No tiene acceso a esta orden. Pertenece a otro taller.', 403)
        }
      }
      
      return sendSuccess(res, workOrder)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  /**
   * POST /api/work-orders
   * Crear orden de trabajo
   */
  async create(req: Request, res: Response) {
    try {
      console.log('🔨 WorkOrderController.create llamado con:', req.body)
      console.log('👤 Usuario autenticado:', req.user)
      
      // Validar que el usuario tenga taller asignado (excepto Admin)
      if (req.user && req.user.roleName !== 'Administrador') {
        if (!req.user.workshopId) {
          return sendError(res, 'Usuario no tiene taller asignado. Contacte al administrador.', 403)
        }
        // Asegurar que el workshopId sea del usuario
        req.body.workshopId = req.user.workshopId
      }
      
      const data = {
        ...req.body,
        createdById: req.user!.userId,
      }
      
      console.log('📤 Datos finales para crear orden:', data)
      
      const workOrder = await workOrderService.create(data)
      console.log('✅ Orden creada exitosamente:', workOrder)
      
      return sendSuccess(res, workOrder, 'Orden creada exitosamente', 201)
    } catch (error: any) {
      console.error('❌ Error en WorkOrderController.create:', error)
      return sendError(res, error.message, 400)
    }
  }

  /**
   * PUT /api/work-orders/:id
   * Actualizar orden
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      // Validar que el recurso pertenezca al taller del usuario (excepto Admin)
      if (req.user && req.user.roleName !== 'Administrador' && req.user.workshopId) {
        const existingOrder = await workOrderService.getById(id)
        if (existingOrder.workshopId !== req.user.workshopId) {
          return sendError(res, 'No puede modificar órdenes de otro taller', 403)
        }
        // Prevenir cambio de taller
        delete req.body.workshopId
      }
      
      const data = req.body
      const workOrder = await workOrderService.update(id, data)
      return sendSuccess(res, workOrder, 'Orden actualizada exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * POST /api/work-orders/:id/status
   * Cambiar estado de la orden
   */
  async changeStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status, observations } = req.body

      if (!status) {
        return sendError(res, 'Estado requerido', 400)
      }

      // Validar que el recurso pertenezca al taller del usuario (excepto Admin)
      if (req.user && req.user.roleName !== 'Administrador' && req.user.workshopId) {
        const workOrder = await workOrderService.getById(id)
        if (workOrder.workshopId !== req.user.workshopId) {
          return sendError(res, 'No puede cambiar el estado de órdenes de otro taller', 403)
        }
      }

      const workOrder = await workOrderService.changeStatus(
        id,
        status,
        observations || '',
        req.user!.userId
      )

      return sendSuccess(res, workOrder, 'Estado actualizado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * POST /api/work-orders/:id/pause
   * Pausar orden
   */
  async pause(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { reason, observations } = req.body

      if (!reason) {
        return sendError(res, 'Razón de pausa requerida', 400)
      }

      // Validar que el recurso pertenezca al taller del usuario (excepto Admin)
      if (req.user && req.user.roleName !== 'Administrador' && req.user.workshopId) {
        const workOrder = await workOrderService.getById(id)
        if (workOrder.workshopId !== req.user.workshopId) {
          return sendError(res, 'No puede pausar órdenes de otro taller', 403)
        }
      }

      const workOrder = await workOrderService.pause(id, reason, observations)
      return sendSuccess(res, workOrder, 'Orden pausada exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * POST /api/work-orders/:id/resume
   * Reanudar orden
   */
  async resume(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { observations } = req.body
      
      // Validar que el recurso pertenezca al taller del usuario (excepto Admin)
      if (req.user && req.user.roleName !== 'Administrador' && req.user.workshopId) {
        const workOrder = await workOrderService.getById(id)
        if (workOrder.workshopId !== req.user.workshopId) {
          return sendError(res, 'No puede reanudar órdenes de otro taller', 403)
        }
      }
      
      const workOrder = await workOrderService.resume(id, req.user!.userId, observations)
      return sendSuccess(res, workOrder, 'Orden reanudada exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * POST /api/work-orders/:id/photos
   * Agregar foto
   */
  async addPhoto(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { url, description, photoType } = req.body

      if (!url) {
        return sendError(res, 'URL de la foto requerida', 400)
      }

      // Validar que el recurso pertenezca al taller del usuario (excepto Admin)
      if (req.user && req.user.roleName !== 'Administrador' && req.user.workshopId) {
        const workOrder = await workOrderService.getById(id)
        if (workOrder.workshopId !== req.user.workshopId) {
          return sendError(res, 'No puede agregar fotos a órdenes de otro taller', 403)
        }
      }

      const photo = await workOrderService.addPhoto(id, url, description, photoType)
      return sendSuccess(res, photo, 'Foto agregada exitosamente', 201)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * POST /api/work-orders/:id/assign
   * Asignar mecánico a orden de trabajo
   */
  async assignMechanic(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { mechanicId } = req.body

      if (!mechanicId) {
        return sendError(res, 'ID del mecánico es requerido', 400)
      }

      // Validar que el recurso pertenezca al taller del usuario (excepto Admin)
      if (req.user && req.user.roleName !== 'Administrador' && req.user.workshopId) {
        const workOrder = await workOrderService.getById(id)
        if (workOrder.workshopId !== req.user.workshopId) {
          return sendError(res, 'No puede asignar mecánicos a órdenes de otro taller', 403)
        }
      }

      const result = await workOrderService.assignMechanic(id, mechanicId)
      return sendSuccess(res, result, 'Mecánico asignado exitosamente')
    } catch (error: any) {
      console.error('Error asignando mecánico:', error)
      return sendError(res, error.message, 400)
    }
  }
}

export default new WorkOrderController()


