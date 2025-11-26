import { Router } from 'express'
import sparePartController from '../controllers/sparePartController'
import { authenticate } from '../middlewares/auth'
import { authorize, injectWorkshopFilter } from '../middlewares/rbac'
import { validateBody, validatePagination } from '../middlewares/validation'
import { auditLog } from '../middlewares/audit'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)
// Inyectar filtro de taller automáticamente
router.use(injectWorkshopFilter())

/**
 * GET /api/spare-parts/stats
 */
router.get('/stats', authorize('spare-parts', 'read'), sparePartController.getStats)

/**
 * GET /api/spare-parts/low-stock
 */
router.get('/low-stock', authorize('spare-parts', 'read'), sparePartController.getLowStock)

/**
 * GET /api/spare-parts/categories
 */
router.get('/categories', authorize('spare-parts', 'read'), sparePartController.getCategories)

/**
 * POST /api/spare-parts/request
 * Acepta:
 * - Un solo repuesto: { workOrderId, sparePartId, quantity, observations? }
 * - Múltiples repuestos: { workOrderId, requests: [{ sparePartId, quantity }], observations? }
 */
router.post(
  '/request',
  authorize('spare-parts', 'update'),
  (req, res, next) => {
    // Validación flexible: acepta formato antiguo o nuevo
    if (req.body.requests && Array.isArray(req.body.requests)) {
      // Formato nuevo: múltiples repuestos
      if (!req.body.workOrderId) {
        return res.status(400).json({
          success: false,
          error: 'Orden de trabajo es requerida',
        })
      }
      return next()
    } else {
      // Formato antiguo: un solo repuesto
      if (!req.body.workOrderId || !req.body.sparePartId || !req.body.quantity) {
        return res.status(400).json({
          success: false,
          error: 'Orden, repuesto y cantidad son requeridos',
        })
      }
      return next()
    }
  },
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
 * POST /api/spare-parts/:id/mark-as-used
 * Marcar repuesto como usado
 */
router.post(
  '/:id/mark-as-used',
  authorize('spare-parts', 'update'),
  auditLog('mark-as-used', 'spare-parts'),
  sparePartController.markAsUsed
)

/**
 * POST /api/spare-parts/:id/mark-as-surplus
 * Marcar repuesto como sobrante y devolver al inventario
 */
router.post(
  '/:id/mark-as-surplus',
  authorize('spare-parts', 'update'),
  auditLog('mark-as-surplus', 'spare-parts'),
  sparePartController.markAsSurplus
)

/**
 * GET /api/spare-parts/requests/pending
 * Obtener solicitudes pendientes de aprobación (solo para jefes de taller)
 * IMPORTANTE: Esta ruta debe ir ANTES de /requests y /:id para evitar conflictos
 */
router.get(
  '/requests/pending',
  authorize('spare-parts', 'read'),
  sparePartController.getPendingRequests
)

/**
 * GET /api/spare-parts/requests
 * Obtener todas las solicitudes de repuestos (historial completo)
 * IMPORTANTE: Esta ruta debe ir ANTES de /:id para evitar conflictos
 */
router.get(
  '/requests',
  authorize('spare-parts', 'read'),
  sparePartController.getAllRequests
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
 * GET /api/spare-parts/:id/movements
 * Obtener movimientos de un repuesto con filtros
 */
router.get(
  '/:id/movements',
  authorize('spare-parts', 'read'),
  sparePartController.getMovements
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

/**
 * POST /api/spare-parts/requests/:id/approve
 * Aprobar solicitud de repuesto (solo para jefes de taller)
 */
router.post(
  '/requests/:id/approve',
  authorize('spare-parts', 'update'),
  auditLog('approve-request', 'spare-parts'),
  sparePartController.approveRequest
)

/**
 * POST /api/spare-parts/requests/:id/reject
 * Rechazar solicitud de repuesto (solo para jefes de taller)
 */
router.post(
  '/requests/:id/reject',
  authorize('spare-parts', 'update'),
  auditLog('reject-request', 'spare-parts'),
  sparePartController.rejectRequest
)

export default router


