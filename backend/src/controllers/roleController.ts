import { Request, Response } from 'express'
import roleService from '../services/roleService'
import { sendSuccess, sendError } from '../utils/response'

/**
 * Controlador de roles
 */
export class RoleController {
  /**
   * GET /api/roles
   * Obtener todos los roles
   */
  async getAll(_req: Request, res: Response) {
    try {
      const roles = await roleService.getAll()
      return sendSuccess(res, roles)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * GET /api/roles/:id
   * Obtener rol por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const role = await roleService.getById(id)
      return sendSuccess(res, role)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  /**
   * POST /api/roles
   * Crear rol
   */
  async create(req: Request, res: Response) {
    try {
      const data = req.body
      const role = await roleService.create(data)
      return sendSuccess(res, role, 'Rol creado exitosamente', 201)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * PUT /api/roles/:id
   * Actualizar rol
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data = req.body
      const role = await roleService.update(id, data)
      return sendSuccess(res, role, 'Rol actualizado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * DELETE /api/roles/:id
   * Eliminar rol
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await roleService.delete(id)
      return sendSuccess(res, result, 'Rol eliminado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * GET /api/roles/permissions
   * Obtener todos los permisos
   */
  async getAllPermissions(_req: Request, res: Response) {
    try {
      const permissions = await roleService.getAllPermissions()
      return sendSuccess(res, permissions)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * POST /api/roles/permissions
   * Crear permiso
   */
  async createPermission(req: Request, res: Response) {
    try {
      const data = req.body
      const permission = await roleService.createPermission(data)
      return sendSuccess(res, permission, 'Permiso creado exitosamente', 201)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }
}

export default new RoleController()


