import { Router } from 'express'
import reportController from '../controllers/reportController'
import { authenticate } from '../middlewares/auth'
import { authorize } from '../middlewares/rbac'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * GET /api/reports/fleet
 * Generar reporte de flota con filtros por región y rango de fechas
 */
router.get(
  '/fleet',
  authorize('reports', 'read'),
  reportController.generateFleetReport
)

export default router

