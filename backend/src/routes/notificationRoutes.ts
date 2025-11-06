import { Router } from 'express'
import notificationController from '../controllers/notificationController'
import { authenticate } from '../middlewares/auth'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * GET /api/notifications
 */
router.get('/', notificationController.getMyNotifications)

/**
 * PUT /api/notifications/read-all
 */
router.put('/read-all', notificationController.markAllAsRead)

/**
 * DELETE /api/notifications/read
 */
router.delete('/read', notificationController.deleteAllRead)

/**
 * PUT /api/notifications/:id/read
 */
router.put('/:id/read', notificationController.markAsRead)

/**
 * DELETE /api/notifications/:id
 */
router.delete('/:id', notificationController.delete)

export default router


