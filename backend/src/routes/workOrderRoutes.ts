import { Router } from 'express'
import workOrderController from '../controllers/workOrderController'
import { authenticate } from '../middlewares/auth'
import { authorize } from '../middlewares/rbac'
import { validateBody, validatePagination } from '../middlewares/validation'
import { auditLog } from '../middlewares/audit'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * GET /api/work-orders/stats
 * Obtener estadísticas
 */
router.get(
  '/stats',
  authorize('work-orders', 'read'),
  workOrderController.getStats
)

/**
 * GET /api/work-orders
 * Obtener todas las órdenes
 */
router.get(
  '/',
  authorize('work-orders', 'read'),
  validatePagination,
  workOrderController.getAll
)

/**
 * GET /api/work-orders/:id
 * Obtener orden por ID
 */
router.get(
  '/:id',
  authorize('work-orders', 'read'),
  workOrderController.getById
)

/**
 * POST /api/work-orders
 * Crear orden de trabajo
 */
router.post(
  '/',
  authorize('work-orders', 'create'),
  validateBody(['vehicleId', 'entryId', 'workshopId', 'workType', 'description']),
  auditLog('create', 'work-orders'),
  workOrderController.create
)

/**
 * PUT /api/work-orders/:id
 * Actualizar orden
 */
router.put(
  '/:id',
  authorize('work-orders', 'update'),
  auditLog('update', 'work-orders'),
  workOrderController.update
)

/**
 * POST /api/work-orders/:id/status
 * Cambiar estado
 */
router.post(
  '/:id/status',
  authorize('work-orders', 'update'),
  validateBody(['status']),
  auditLog('change-status', 'work-orders'),
  workOrderController.changeStatus
)

/**
 * POST /api/work-orders/:id/pause
 * Pausar orden
 */
router.post(
  '/:id/pause',
  authorize('work-orders', 'update'),
  validateBody(['reason']),
  auditLog('pause', 'work-orders'),
  workOrderController.pause
)

/**
 * POST /api/work-orders/:id/resume
 * Reanudar orden
 */
router.post(
  '/:id/resume',
  authorize('work-orders', 'update'),
  auditLog('resume', 'work-orders'),
  workOrderController.resume
)

/**
 * POST /api/work-orders/:id/photos
 * Agregar foto
 */
router.post(
  '/:id/photos',
  authorize('work-orders', 'update'),
  validateBody(['url']),
  auditLog('add-photo', 'work-orders'),
  workOrderController.addPhoto
)

/**
 * POST /api/work-orders/:id/assign
 * Asignar mecánico
 */
router.post(
  '/:id/assign',
  authorize('work-orders', 'assign'),
  validateBody(['mechanicId']),
  auditLog('assign-mechanic', 'work-orders'),
  workOrderController.assignMechanic
)

export default router


