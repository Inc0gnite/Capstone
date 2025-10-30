import { Router } from 'express'
import sparePartController from '../controllers/sparePartController'
import { authenticate } from '../middlewares/auth'
import { authorize } from '../middlewares/rbac'
import { validateBody, validatePagination } from '../middlewares/validation'
import { auditLog } from '../middlewares/audit'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * GET /api/spare-parts/stats
 */
router.get('/stats', authorize('spare-parts', 'read'), sparePartController.getStats)

/**
 * GET /api/spare-parts/low-stock
 */
router.get('/low-stock', authorize('spare-parts', 'read'), sparePartController.getLowStock)

/**
 * POST /api/spare-parts/request
 */
router.post(
  '/request',
  authorize('spare-parts', 'update'),
  validateBody(['workOrderId', 'sparePartId', 'quantity']),
  auditLog('request', 'spare-parts'),
  sparePartController.requestForWorkOrder
)

/**
 * POST /api/spare-parts/deliver/:id
 */
router.post(
  '/deliver/:id',
  authorize('spare-parts', 'update'),
  validateBody(['quantityDelivered']),
  auditLog('deliver', 'spare-parts'),
  sparePartController.deliverForWorkOrder
)

/**
 * GET /api/spare-parts
 */
router.get(
  '/',
  authorize('spare-parts', 'read'),
  validatePagination,
  sparePartController.getAll
)

/**
 * GET /api/spare-parts/:id
 */
router.get('/:id', authorize('spare-parts', 'read'), sparePartController.getById)

/**
 * POST /api/spare-parts
 */
router.post(
  '/',
  authorize('spare-parts', 'create'),
  validateBody([
    'code',
    'name',
    'category',
    'unitOfMeasure',
    'unitPrice',
    'currentStock',
    'minStock',
    'maxStock',
  ]),
  auditLog('create', 'spare-parts'),
  sparePartController.create
)

/**
 * PUT /api/spare-parts/:id
 */
router.put(
  '/:id',
  authorize('spare-parts', 'update'),
  auditLog('update', 'spare-parts'),
  sparePartController.update
)

/**
 * POST /api/spare-parts/:id/adjust-stock
 */
router.post(
  '/:id/adjust-stock',
  authorize('spare-parts', 'update'),
  validateBody(['quantity', 'movementType', 'reason']),
  auditLog('adjust-stock', 'spare-parts'),
  sparePartController.adjustStock
)

export default router


