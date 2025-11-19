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

/**
 * GET /api/reports/mechanics-performance
 * Generar reporte de desempeño de mecánicos con filtros por taller y rango de fechas
 */
router.get(
  '/mechanics-performance',
  authorize('reports', 'read'),
  reportController.generateMechanicsPerformanceReport
)

/**
 * GET /api/reports/inventory
 * Generar reporte de inventario con filtros por taller, categoría y stock
 */
router.get(
  '/inventory',
  authorize('reports', 'read'),
  reportController.generateInventoryReport
)

/**
 * GET /api/reports/costs
 * Generar reporte de costos con filtros por taller y rango de fechas
 */
router.get(
  '/costs',
  authorize('reports', 'read'),
  reportController.generateCostsReport
)

export default router

