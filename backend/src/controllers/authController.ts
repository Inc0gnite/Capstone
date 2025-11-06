import { Request, Response } from 'express'
import authService from '../services/authService'
import { sendSuccess, sendError } from '../utils/response'

/**
 * Controlador de autenticación
 */
export class AuthController {
  /**
   * POST /api/auth/login
   * Login de usuario
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return sendError(res, 'Email y contraseña son requeridos', 400)
      }

      const result = await authService.login({ email, password })

      return sendSuccess(res, result, 'Login exitoso')
    } catch (error: any) {
      return sendError(res, error.message, 401)
    }
  }

  /**
   * POST /api/auth/register
   * Registro de usuario
   */
  async register(req: Request, res: Response) {
    try {
      const data = req.body

      const result = await authService.register(data)

      return sendSuccess(res, result, 'Usuario registrado exitosamente', 201)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * POST /api/auth/refresh
   * Refrescar token
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return sendError(res, 'Refresh token requerido', 400)
      }

      const tokens = await authService.refreshToken(refreshToken)

      return sendSuccess(res, tokens, 'Token refrescado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 401)
    }
  }

  /**
   * GET /api/auth/me
   * Obtener usuario actual
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Usuario no autenticado', 401)
      }

      const user = await authService.getCurrentUser(req.user.userId)

      return sendSuccess(res, user)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  /**
   * POST /api/auth/change-password
   * Cambiar contraseña
   */
  async changePassword(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Usuario no autenticado', 401)
      }

      const { oldPassword, newPassword } = req.body

      if (!oldPassword || !newPassword) {
        return sendError(
          res,
          'Contraseña actual y nueva contraseña son requeridas',
          400
        )
      }

      const result = await authService.changePassword(
        req.user.userId,
        oldPassword,
        newPassword
      )

      return sendSuccess(res, result, 'Contraseña actualizada exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Solicitar recuperación de contraseña
   */
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body

      if (!email) {
        return sendError(res, 'Email requerido', 400)
      }

      const result = await authService.requestPasswordReset(email)

      return sendSuccess(res, result)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * POST /api/auth/reset-password
   * Restablecer contraseña con token
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body
      if (!token || !newPassword) {
        return sendError(res, 'Token y nueva contraseña son requeridos', 400)
      }

      const result = await authService.resetPassword(token, newPassword)
      return sendSuccess(res, result)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * POST /api/auth/logout
   * Logout (en frontend se elimina el token)
   */
  async logout(_req: Request, res: Response) {
    return sendSuccess(res, null, 'Logout exitoso')
  }
}

export default new AuthController()


