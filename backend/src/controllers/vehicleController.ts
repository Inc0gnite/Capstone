import { Request, Response } from 'express'
import vehicleService from '../services/vehicleService'
import { sendSuccess, sendError, sendPaginated } from '../utils/response'

/**
 * Controlador de vehículos
 */
export class VehicleController {
  /**
   * GET /api/vehicles
   * Obtener todos los vehículos
   */
  async getAll(req: Request, res: Response) {
    try {
      const filters = req.query
      const result = await vehicleService.getAll(filters)
      return sendPaginated(res, result.vehicles, result.page, result.limit, result.total)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/vehicles/stats
   * Obtener estadísticas de vehículos
   */
  async getStats(_req: Request, res: Response) {
    try {
      const stats = await vehicleService.getStats()
      return sendSuccess(res, stats)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/vehicles/:id
   * Obtener vehículo por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const vehicle = await vehicleService.getById(id)
      return sendSuccess(res, vehicle)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  /**
   * GET /api/vehicles/plate/:licensePlate
   * Obtener vehículo por patente
   */
  async getByLicensePlate(req: Request, res: Response) {
    try {
      const { licensePlate } = req.params
      const vehicle = await vehicleService.getByLicensePlate(licensePlate)
      return sendSuccess(res, vehicle)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  /**
   * POST /api/vehicles
   * Crear vehículo
   */
  async create(req: Request, res: Response) {
    try {
      const data = req.body
      const vehicle = await vehicleService.create(data)
      return sendSuccess(res, vehicle, 'Vehículo creado exitosamente', 201)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * PUT /api/vehicles/:id
   * Actualizar vehículo
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data = req.body
      const vehicle = await vehicleService.update(id, data)
      return sendSuccess(res, vehicle, 'Vehículo actualizado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }


  /**
   * POST /api/vehicles/:id/restore
   * Restaurar vehículo
   */
  async restore(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await vehicleService.restore(id)
      return sendSuccess(res, result, 'Vehículo restaurado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  /**
   * DELETE /api/vehicles/:id
   * Eliminar vehículo permanentemente
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const deletedVehicle = await vehicleService.delete(id)
      return sendSuccess(res, { message: 'Vehículo eliminado exitosamente', vehicle: deletedVehicle })
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }
}

export default new VehicleController()


