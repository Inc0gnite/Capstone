import { Request, Response } from 'express'
import userService from '../services/userService'
import { sendSuccess, sendError, sendPaginated } from '../utils/response'

/**
 * Controlador de usuarios
 */
export class UserController {
  /**
   * GET /api/users
   * Obtener todos los usuarios
   */
  async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const search = (req.query.search as string) || ''

      const result = await userService.getAll(page, limit, search)

      return sendPaginated(res, result.users, page, limit, result.total)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/users/:id
   * Obtener usuario por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params

      const user = await userService.getById(id)

      return sendSuccess(res, user)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  /**
   * POST /api/users
   * Crear usuario
   */
  async create(req: Request, res: Response) {
    try {
      const data = req.body

      const user = await userService.create(data)

      return sendSuccess(res, user, 'Usuario creado exitosamente', 201)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * PUT /api/users/:id
   * Actualizar usuario
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data = req.body

      const user = await userService.update(id, data)

      return sendSuccess(res, user, 'Usuario actualizado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * DELETE /api/users/:id
   * Eliminar usuario (soft delete)
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params

      const result = await userService.delete(id)

      return sendSuccess(res, result, 'Usuario eliminado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  /**
   * POST /api/users/:id/restore
   * Restaurar usuario
   */
  async restore(req: Request, res: Response) {
    try {
      const { id } = req.params

      const result = await userService.restore(id)

      return sendSuccess(res, result, 'Usuario restaurado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  /**
   * GET /api/users/workshop/:workshopId
   * Obtener usuarios por taller
   */
  async getByWorkshop(req: Request, res: Response) {
    try {
      const { workshopId } = req.params

      const users = await userService.getByWorkshop(workshopId)

      return sendSuccess(res, users)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/users/role/:roleId
   * Obtener usuarios por rol
   */
  async getByRole(req: Request, res: Response) {
    try {
      const { roleId } = req.params

      const users = await userService.getByRole(roleId)

      return sendSuccess(res, users)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }
}

export default new UserController()


