import { Request, Response } from 'express'
import notificationService from '../services/notificationService'
import { sendSuccess, sendError } from '../utils/response'

/**
 * Controlador de notificaciones
 */
export class NotificationController {
  /**
   * GET /api/notifications
   * Obtener notificaciones del usuario
   */
  async getMyNotifications(req: Request, res: Response) {
    try {
      const userId = req.user!.userId
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const unreadOnly = req.query.unreadOnly === 'true'

      const result = await notificationService.getUserNotifications(
        userId,
        page,
        limit,
        unreadOnly
      )

      return res.status(200).json({
        success: true,
        data: result.notifications,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        unreadCount: result.unreadCount,
      })
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * PUT /api/notifications/:id/read
   * Marcar como leída
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user!.userId

      const notification = await notificationService.markAsRead(id, userId)
      return sendSuccess(res, notification, 'Notificación marcada como leída')
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  /**
   * PUT /api/notifications/read-all
   * Marcar todas como leídas
   */
  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!.userId
      const result = await notificationService.markAllAsRead(userId)
      return sendSuccess(res, result)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }

  /**
   * DELETE /api/notifications/:id
   * Eliminar notificación
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user!.userId

      const result = await notificationService.delete(id, userId)
      return sendSuccess(res, result)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  /**
   * DELETE /api/notifications/read
   * Eliminar todas las leídas
   */
  async deleteAllRead(req: Request, res: Response) {
    try {
      const userId = req.user!.userId
      const result = await notificationService.deleteAllRead(userId)
      return sendSuccess(res, result)
    } catch (error: any) {
      return sendError(res, error.message, 500)
    }
  }
}

export default new NotificationController()


