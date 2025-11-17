import { Request, Response } from 'express'
import vehicleEntryService from '../services/vehicleEntryService'
import { sendSuccess, sendError, sendPaginated } from '../utils/response'

/**
 * Controlador de ingresos de vehículos
 */
export class VehicleEntryController {
  /**
   * GET /api/vehicle-entries
   * Obtener todos los ingresos
   */
  async getAll(req: Request, res: Response) {
    try {
      const filters = req.query
      const result = await vehicleEntryService.getAll(filters)
      return sendPaginated(res, result.entries, result.page, result.limit, result.total)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/vehicle-entries/active
   * Obtener ingresos activos (sin salida)
   */
  async getActiveEntries(req: Request, res: Response) {
    try {
      const workshopId = req.query.workshopId as string
      const entries = await vehicleEntryService.getActiveEntries(workshopId)
      return sendSuccess(res, entries)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/vehicle-entries/:id
   * Obtener ingreso por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const entry = await vehicleEntryService.getById(id)
      return sendSuccess(res, entry)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  /**
   * POST /api/vehicle-entries
   * Crear ingreso de vehículo
   */
  async create(req: Request, res: Response) {
    try {
      const data = {
        ...req.body,
        createdById: req.user!.userId,
      }
      const entry = await vehicleEntryService.create(data)
      return sendSuccess(res, entry, 'Ingreso creado exitosamente', 201)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * PUT /api/vehicle-entries/:id
   * Actualizar ingreso
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data = req.body
      const entry = await vehicleEntryService.update(id, data)
      return sendSuccess(res, entry, 'Ingreso actualizado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * GET /api/vehicle-entries/:id/ready-for-exit
   * Verificar si un vehículo está listo para salida
   */
  async isReadyForExit(req: Request, res: Response) {
    try {
      const { id } = req.params
      const isReady = await vehicleEntryService.isReadyForExit(id)
      return sendSuccess(res, { isReady })
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * POST /api/vehicle-entries/:id/exit
   * Registrar salida del vehículo
   */
  async registerExit(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { exitKm, exitTime } = req.body

      if (!exitKm) {
        return sendError(res, 'Kilometraje de salida requerido', 400)
      }

      const entry = await vehicleEntryService.registerExit(id, exitKm, exitTime)
      return sendSuccess(res, entry, 'Salida registrada exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * PUT /api/vehicle-entries/:id/keys
   * Actualizar control de llaves
   */
  async updateKeyControl(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data = req.body
      const keyControl = await vehicleEntryService.updateKeyControl(id, data)
      return sendSuccess(res, keyControl, 'Control de llaves actualizado')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }
}

export default new VehicleEntryController()


