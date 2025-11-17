import { Router } from 'express'
import regionController from '../controllers/regionController'
import { authenticate } from '../middlewares/auth'
import { authorize, requireAdmin } from '../middlewares/rbac'
import { validateBody } from '../middlewares/validation'
import { auditLog } from '../middlewares/audit'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * GET /api/regions
 */
router.get('/', authorize('regions', 'read'), regionController.getAll)

/**
 * GET /api/regions/:id
 */
router.get('/:id', authorize('regions', 'read'), regionController.getById)

/**
 * POST /api/regions
 */
router.post(
  '/',
  requireAdmin,
  validateBody(['code', 'name']),
  auditLog('create', 'regions'),
  regionController.create
)

/**
 * PUT /api/regions/:id
 */
router.put(
  '/:id',
  requireAdmin,
  auditLog('update', 'regions'),
  regionController.update
)

export default router


