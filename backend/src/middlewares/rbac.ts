import { Request, Response, NextFunction } from 'express'
import { sendError } from '../utils/response'
import prisma from '../config/database'

/**
 * Middleware para verificar permisos basados en roles (RBAC)
 */
export function authorize(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'Usuario no autenticado', 401)
        return
      }

      // Obtener rol del usuario con sus permisos
      const role = await prisma.role.findUnique({
        where: { id: req.user.roleId },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      })

      if (!role) {
        sendError(res, 'Rol no encontrado', 403)
        return
      }

      // Verificar si el rol tiene el permiso específico
      const hasPermission = role.permissions.some(
        (rp) =>
          rp.permission.resource === resource &&
          rp.permission.action === action
      )

      if (!hasPermission) {
        sendError(
          res,
          `No tiene permisos para ${action} en ${resource}`,
          403
        )
        return
      }

      next()
    } catch (error: any) {
      sendError(res, error.message || 'Error al verificar permisos', 500)
    }
  }
}

/**
 * Middleware para verificar si el usuario tiene un rol específico
 */
export function requireRole(...roleNames: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'Usuario no autenticado', 401)
        return
      }

      const role = await prisma.role.findUnique({
        where: { id: req.user.roleId },
      })

      if (!role || !roleNames.includes(role.name)) {
        sendError(
          res,
          `Se requiere uno de estos roles: ${roleNames.join(', ')}`,
          403
        )
        return
      }

      next()
    } catch (error: any) {
      sendError(res, error.message || 'Error al verificar rol', 500)
    }
  }
}

/**
 * Middleware para verificar si el usuario es admin
 */
export const requireAdmin = requireRole('Administrador')

/**
 * Middleware para verificar si el usuario puede acceder a un taller específico
 */
export function requireWorkshopAccess(workshopIdParam = 'workshopId') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return sendError(res, 'Usuario no autenticado', 401)
      }

      // Obtener usuario con su taller
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true },
      })

      if (!user) {
        return sendError(res, 'Usuario no encontrado', 404)
      }

      // Admin puede acceder a cualquier taller
      if (user.role.name === 'Administrador') {
        return next()
      }

      // Verificar si el taller coincide
      const requestedWorkshopId =
        req.params[workshopIdParam] || req.body[workshopIdParam]

      if (user.workshopId !== requestedWorkshopId) {
        return sendError(
          res,
          'No tiene acceso a este taller',
          403
        )
      }

      next()
    } catch (error: any) {
      return sendError(res, error.message || 'Error al verificar acceso', 500)
    }
  }
}


