import { Request, Response, NextFunction } from 'express'
import { sendError } from '../utils/response'
import prisma from '../config/database'
import { isSuperAdminUser } from '../utils/admin'

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
 * Middleware para inyectar automáticamente el workshopId del usuario
 * Fuerza que los usuarios solo vean/modifiquen recursos de su taller
 * (excepto Administradores que pueden ver todos los talleres)
 */
export function injectWorkshopFilter() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next() // Si no está autenticado, dejar pasar (otro middleware lo manejará)
      }

      // Administradores pueden ver todos los talleres
      // Pero solo el administrador supremo puede operar sin restricciones de taller
      if (req.user.roleName === 'Administrador') {
        // Si es administrador supremo, no aplicar filtros de taller
        // Necesitamos obtener el nombre completo del usuario para verificar
        try {
          const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { firstName: true, lastName: true },
          })
          
          if (user && isSuperAdminUser(user)) {
            // Administrador supremo: sin restricciones
            return next()
          }
        } catch (error) {
          // Si hay error al obtener el usuario, continuar con validación normal
        }
        
        // Administradores regulares: aplicar filtros de taller si tienen uno asignado
        if (req.user.workshopId) {
          // Inyectar workshopId en query params (para GET requests)
          if (req.query) {
            req.query.workshopId = req.user.workshopId
          }
          
          // Para operaciones de creación/actualización, validar o inyectar workshopId en body
          if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
            // Si el body tiene workshopId, validar que coincida
            if (req.body.workshopId && req.body.workshopId !== req.user.workshopId) {
              return sendError(
                res,
                'No puede realizar operaciones en otro taller',
                403
              )
            }
            // Si no tiene workshopId, inyectarlo automáticamente
            if (!req.body.workshopId) {
              req.body.workshopId = req.user.workshopId
            }
          }
        }
        
        return next()
      }

      // Si el usuario no tiene taller asignado, bloquear acceso
      if (!req.user.workshopId) {
        return sendError(
          res,
          'Usuario no tiene taller asignado. Contacte al administrador.',
          403
        )
      }

      // Inyectar workshopId en query params (para GET requests)
      if (req.query) {
        req.query.workshopId = req.user.workshopId
      }

      // Para operaciones de creación/actualización, validar o inyectar workshopId en body
      if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
        // Si el body tiene workshopId, validar que coincida
        if (req.body.workshopId && req.body.workshopId !== req.user.workshopId) {
          return sendError(
            res,
            'No puede realizar operaciones en otro taller',
            403
          )
        }
        // Si no tiene workshopId, inyectarlo automáticamente
        if (!req.body.workshopId) {
          req.body.workshopId = req.user.workshopId
        }
      }

      next()
    } catch (error: any) {
      return sendError(res, error.message || 'Error al filtrar por taller', 500)
    }
  }
}

/**
 * Middleware para verificar si el usuario puede acceder a un taller específico
 */
export function requireWorkshopAccess(workshopIdParam = 'workshopId') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return sendError(res, 'Usuario no autenticado', 401)
      }

      // Admin puede acceder a cualquier taller
      if (req.user.roleName === 'Administrador') {
        return next()
      }

      // Verificar si el taller coincide
      const requestedWorkshopId =
        req.params[workshopIdParam] || req.body[workshopIdParam] || req.query[workshopIdParam]

      if (req.user.workshopId !== requestedWorkshopId) {
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

/**
 * Middleware para validar que un recurso pertenece al taller del usuario
 * Útil para validar acceso a recursos específicos por ID
 */
export function validateResourceWorkshop(resourceService: {
  getById: (id: string) => Promise<{ workshopId: string } | null>
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return sendError(res, 'Usuario no autenticado', 401)
      }

      // Admin puede acceder a cualquier recurso
      if (req.user.roleName === 'Administrador') {
        return next()
      }

      // Obtener el ID del recurso desde params
      const resourceId = req.params.id
      if (!resourceId) {
        return next() // Si no hay ID, dejar pasar
      }

      // Obtener el recurso y verificar su taller
      const resource = await resourceService.getById(resourceId)
      if (!resource) {
        return sendError(res, 'Recurso no encontrado', 404)
      }

      // Validar que el recurso pertenezca al taller del usuario
      if (resource.workshopId !== req.user.workshopId) {
        return sendError(
          res,
          'No tiene acceso a este recurso. Pertenece a otro taller.',
          403
        )
      }

      next()
    } catch (error: any) {
      return sendError(res, error.message || 'Error al validar acceso al recurso', 500)
    }
  }
}


