import { Router } from 'express'
import dashboardController from '../controllers/dashboardController'
import { authenticate } from '../middlewares/auth'
import { authorize } from '../middlewares/rbac'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * GET /api/dashboard/stats
 */
router.get(
  '/stats',
  authorize('dashboard', 'read'),
  dashboardController.getGeneralStats
)

/**
 * GET /api/dashboard/stats/:period
 */
router.get(
  '/stats/:period',
  authorize('dashboard', 'read'),
  dashboardController.getStatsByPeriod
)

/**
 * GET /api/dashboard/mechanics-performance
 */
router.get(
  '/mechanics-performance',
  authorize('dashboard', 'read'),
  dashboardController.getMechanicsPerformance
)

/**
 * GET /api/dashboard/activity
 */
router.get(
  '/activity',
  authorize('dashboard', 'read'),
  dashboardController.getRecentActivity
)

/**
 * GET /api/dashboard/mechanic-stats/:mechanicId
 */
router.get(
  '/mechanic-stats/:mechanicId',
  authorize('dashboard', 'read'),
  dashboardController.getMechanicStats
)

export default router


