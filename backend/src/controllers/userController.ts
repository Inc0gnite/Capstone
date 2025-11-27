import { Request, Response } from 'express'
import userService from '../services/userService'
import { sendSuccess, sendError, sendPaginated } from '../utils/response'
import { isSuperAdminEmail } from '../utils/admin'
import prisma from '../config/database'

/**
 * Controlador de usuarios
 */
export class UserController {
  /**
   * GET /api/users
   * Obtener todos los usuarios
   * - Administradores regulares solo ven usuarios de su taller
   * - Administrador supremo ve todos los usuarios
   */
  async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const search = (req.query.search as string) || ''

      let workshopId: string | undefined = undefined

      // Si es administrador pero no supremo, filtrar por su taller
      if (req.user && req.user.roleName === 'Administrador') {
        // Verificar si es administrador supremo
        const isSupremeAdmin = req.user.email && isSuperAdminEmail(req.user.email)
        
        if (!isSupremeAdmin && req.user.workshopId) {
          // Administrador regular: solo ver usuarios de su taller
          workshopId = req.user.workshopId
        }
        // Si es supremo, workshopId queda undefined y verá todos
      } else if (req.user && req.user.workshopId) {
        // Usuarios no-admin: solo ver usuarios de su taller
        workshopId = req.user.workshopId
      }

      const result = await userService.getAll(page, limit, search, workshopId)
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

      // Validar que el usuario pertenezca al taller del usuario autenticado (excepto Admin)
      if (req.user && req.user.roleName !== 'Administrador' && req.user.workshopId) {
        if (user.workshopId !== req.user.workshopId) {
          return sendError(res, 'No tiene acceso a este usuario. Pertenece a otro taller.', 403)
        }
      }

      return sendSuccess(res, user)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  /**
   * POST /api/users
   * Crear usuario
   * Solo el administrador supremo (admin@pepsico.cl) puede crear usuarios
   */
  async create(req: Request, res: Response) {
    try {
      // Verificar que solo el administrador supremo puede crear usuarios
      if (!req.user) {
        return sendError(res, 'Usuario no autenticado', 401)
      }

      const isSupremeAdmin = req.user.email && isSuperAdminEmail(req.user.email)
      
      if (!isSupremeAdmin) {
        return sendError(
          res,
          'Solo el administrador supremo puede crear usuarios',
          403
        )
      }

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
   * - Administradores regulares solo pueden actualizar usuarios de su taller
   * - Administrador supremo puede actualizar cualquier usuario
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      // Verificar si es administrador supremo
      const isSupremeAdmin = req.user?.email && isSuperAdminEmail(req.user.email)
      
      // Validar que el usuario pertenezca al taller del usuario autenticado (excepto Admin supremo)
      if (req.user && !isSupremeAdmin && req.user.roleName !== 'Administrador' && req.user.workshopId) {
        const existingUser = await userService.getById(id)
        if (existingUser.workshopId !== req.user.workshopId) {
          return sendError(res, 'No puede modificar usuarios de otro taller', 403)
        }
        // Prevenir cambio de taller
        delete req.body.workshopId
      } else if (req.user && !isSupremeAdmin && req.user.roleName === 'Administrador' && req.user.workshopId) {
        // Administrador regular: solo puede actualizar usuarios de su taller
        const existingUser = await userService.getById(id)
        if (existingUser.workshopId !== req.user.workshopId) {
          return sendError(res, 'No puede modificar usuarios de otro taller', 403)
        }
      }

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
   * - Administradores regulares solo pueden eliminar usuarios de su taller
   * - Administrador supremo puede eliminar cualquier usuario
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params

      // Verificar si es administrador supremo
      const isSupremeAdmin = req.user?.email && isSuperAdminEmail(req.user.email)

      // Validar que el usuario pertenezca al taller del usuario autenticado (excepto Admin supremo)
      if (req.user && !isSupremeAdmin && req.user.roleName !== 'Administrador' && req.user.workshopId) {
        const existingUser = await userService.getById(id)
        if (existingUser.workshopId !== req.user.workshopId) {
          return sendError(res, 'No puede eliminar usuarios de otro taller', 403)
        }
      } else if (req.user && !isSupremeAdmin && req.user.roleName === 'Administrador' && req.user.workshopId) {
        // Administrador regular: solo puede eliminar usuarios de su taller
        const existingUser = await userService.getById(id)
        if (existingUser.workshopId !== req.user.workshopId) {
          return sendError(res, 'No puede eliminar usuarios de otro taller', 403)
        }
      }

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
   * DELETE /api/users/:id/permanent
   * Eliminar usuario permanentemente (hard delete)
   * Solo el administrador supremo puede eliminar usuarios permanentemente
   */
  async permanentDelete(req: Request, res: Response) {
    try {
      // Verificar que solo el administrador supremo puede eliminar permanentemente
      if (!req.user) {
        return sendError(res, 'Usuario no autenticado', 401)
      }

      const isSupremeAdmin = req.user.email && isSuperAdminEmail(req.user.email)
      
      if (!isSupremeAdmin) {
        return sendError(
          res,
          'Solo el administrador supremo puede eliminar usuarios permanentemente',
          403
        )
      }

      const { id } = req.params

      const result = await userService.permanentDelete(id)

      return sendSuccess(res, result, 'Usuario eliminado permanentemente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * GET /api/users/workshop/:workshopId
   * Obtener usuarios por taller
   */
  async getByWorkshop(req: Request, res: Response) {
    try {
      const { workshopId } = req.params

      // Validar que el usuario solo pueda ver usuarios de su taller (excepto Admin)
      if (req.user && req.user.roleName !== 'Administrador' && req.user.workshopId) {
        if (workshopId !== req.user.workshopId) {
          return sendError(res, 'No tiene acceso a usuarios de otro taller', 403)
        }
      }

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


