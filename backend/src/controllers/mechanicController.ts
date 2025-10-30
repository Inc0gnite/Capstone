import { Request, Response } from 'express'
import { mechanicService } from '../services/mechanicService'
import { sendSuccess, sendError } from '../utils/response'

export class MechanicController {
  /**
   * GET /api/mechanics/available/:workshopId
   * Obtener mecánicos disponibles por taller
   */
  async getAvailableMechanics(req: Request, res: Response) {
    try {
      const { workshopId } = req.params
      
      if (!workshopId) {
        return sendError(res, 'ID de taller requerido', 400)
      }

      const mechanics = await mechanicService.getAvailableMechanics(workshopId)
      return sendSuccess(res, mechanics)
    } catch (error: any) {
      console.error('Error en getAvailableMechanics:', error)
      return sendError(res, error.message, 500)
    }
  }

  /**
   * POST /api/mechanics/assign
   * Asignar mecánico a orden de trabajo
   */
  async assignMechanic(req: Request, res: Response) {
    try {
      const { workOrderId, mechanicId, notes } = req.body

      if (!workOrderId || !mechanicId) {
        return sendError(res, 'ID de orden y mecánico requeridos', 400)
      }

      await mechanicService.assignMechanicToOrder({
        workOrderId,
        mechanicId,
        notes
      })

      return sendSuccess(res, { message: 'Mecánico asignado correctamente' })
    } catch (error: any) {
      console.error('Error en assignMechanic:', error)
      return sendError(res, error.message, 500)
    }
  }

  /**
   * PUT /api/mechanics/reassign
   * Reasignar mecánico a orden de trabajo
   */
  async reassignMechanic(req: Request, res: Response) {
    try {
      const { workOrderId, mechanicId, notes } = req.body

      if (!workOrderId || !mechanicId) {
        return sendError(res, 'ID de orden y mecánico requeridos', 400)
      }

      await mechanicService.reassignMechanicToOrder({
        workOrderId,
        mechanicId,
        notes
      })

      return sendSuccess(res, { message: 'Mecánico reasignado correctamente' })
    } catch (error: any) {
      console.error('Error en reassignMechanic:', error)
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/mechanics/:mechanicId/workload
   * Obtener carga de trabajo de un mecánico
   */
  async getMechanicWorkload(req: Request, res: Response) {
    try {
      const { mechanicId } = req.params

      if (!mechanicId) {
        return sendError(res, 'ID de mecánico requerido', 400)
      }

      const workload = await mechanicService.getMechanicWorkload(mechanicId)
      return sendSuccess(res, workload)
    } catch (error: any) {
      console.error('Error en getMechanicWorkload:', error)
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/mechanics/workshop/:workshopId/specialty/:specialty
   * Obtener mecánicos por especialidad
   */
  async getMechanicsBySpecialty(req: Request, res: Response) {
    try {
      const { workshopId, specialty } = req.params

      if (!workshopId || !specialty) {
        return sendError(res, 'ID de taller y especialidad requeridos', 400)
      }

      const mechanics = await mechanicService.getMechanicsBySpecialty(workshopId, specialty)
      return sendSuccess(res, mechanics)
    } catch (error: any) {
      console.error('Error en getMechanicsBySpecialty:', error)
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/mechanics/workload/:workshopId
   * Obtener mecánicos con carga de trabajo por taller
   */
  async getMechanicsWithWorkload(req: Request, res: Response) {
    try {
      const { workshopId } = req.params
      
      if (!workshopId) {
        return sendError(res, 'ID de taller requerido', 400)
      }

      const mechanics = await mechanicService.getMechanicsWithWorkload(workshopId)
      return sendSuccess(res, mechanics)
    } catch (error: any) {
      console.error('Error en getMechanicsWithWorkload:', error)
      return sendError(res, error.message, 500)
    }
  }

  /**
   * POST /api/mechanics/exchange
   * Intercambiar órdenes de trabajo entre mecánicos
   */
  async exchangeMechanics(req: Request, res: Response) {
    try {
      const { workOrderId, fromMechanicId, toMechanicId, orderToExchangeId } = req.body
      
      if (!workOrderId || !fromMechanicId || !toMechanicId || !orderToExchangeId) {
        return sendError(res, 'workOrderId, fromMechanicId, toMechanicId y orderToExchangeId son requeridos', 400)
      }

      await mechanicService.exchangeMechanics({
        workOrderId,
        fromMechanicId,
        toMechanicId,
        orderToExchangeId
      })

      return sendSuccess(res, { message: 'Órdenes intercambiadas exitosamente' })
    } catch (error: any) {
      console.error('Error en exchangeMechanics:', error)
      return sendError(res, error.message, 500)
    }
  }
}
