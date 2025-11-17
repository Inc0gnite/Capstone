import { Request, Response, NextFunction } from 'express'
import prisma from '../config/database'
import logger from '../config/logger'

/**
 * Middleware para registrar acciones en el audit log
 */
export function auditLog(action: string, resource: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Guardar el send original
      const originalSend = res.send

      // Sobrescribir res.send para capturar la respuesta
      res.send = function (data: any) {
        // Restaurar el send original
        res.send = originalSend

        // Si la respuesta fue exitosa, registrar en audit log
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (req.user) {
            const resourceId = req.params.id || req.body.id || null

            prisma.auditLog
              .create({
                data: {
                  userId: req.user.userId,
                  action,
                  resource,
                  resourceId,
                  details: {
                    method: req.method,
                    path: req.path,
                    body: req.body,
                    params: req.params,
                  },
                  ipAddress: req.ip,
                  userAgent: req.headers['user-agent'],
                },
              })
              .catch((error) => {
                logger.error('Error al crear audit log:', error)
              })
          }
        }

        return originalSend.call(this, data)
      }

      next()
    } catch (error) {
      logger.error('Error en middleware de auditoría:', error)
      next()
    }
  }
}


