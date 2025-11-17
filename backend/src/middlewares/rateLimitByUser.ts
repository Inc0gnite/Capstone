import { Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { sendError } from '../utils/response'

/**
 * Rate limiting por usuario (se ejecuta después de autenticación)
 * Permite que múltiples usuarios desde la misma IP no se afecten entre sí
 */
export const userRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // 500 requests por usuario cada 15 minutos
  message: 'Demasiadas solicitudes. Por favor intente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  // Generar clave basada en el ID del usuario
  keyGenerator: (req: Request) => {
    if (req.user?.userId) {
      return `user:${req.user.userId}`
    }
    // Fallback a IP si no hay usuario (no debería pasar en rutas protegidas)
    return req.ip || req.socket.remoteAddress || 'unknown'
  },
  handler: (_req: Request, res: Response) => {
    sendError(res, 'Demasiadas solicitudes. Por favor intente más tarde.', 429)
  },
  skip: (req: Request) => {
    // Solo aplicar si el usuario está autenticado
    return !req.user?.userId
  },
})

/**
 * Rate limiting más permisivo para endpoints específicos
 */
export const permissiveRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Más permisivo para endpoints que se usan frecuentemente
  keyGenerator: (req: Request) => {
    if (req.user?.userId) {
      return `user:${req.user.userId}`
    }
    return req.ip || req.socket.remoteAddress || 'unknown'
  },
  skip: (req: Request) => {
    return !req.user?.userId
  },
})

/**
 * Rate limiting estricto para endpoints pesados
 */
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Más estricto para endpoints que consumen muchos recursos
  keyGenerator: (req: Request) => {
    if (req.user?.userId) {
      return `user:${req.user.userId}`
    }
    return req.ip || req.socket.remoteAddress || 'unknown'
  },
  skip: (req: Request) => {
    return !req.user?.userId
  },
})

