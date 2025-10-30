import { Router } from 'express'
import roleController from '../controllers/roleController'
import { authenticate } from '../middlewares/auth'
import { requireAdmin } from '../middlewares/rbac'
import { validateBody } from '../middlewares/validation'
import { auditLog } from '../middlewares/audit'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * GET /api/roles
 * Obtener todos los roles
 */
router.get('/', roleController.getAll)

/**
 * GET /api/roles/permissions
 * Obtener todos los permisos
 */
router.get('/permissions', roleController.getAllPermissions)

/**
 * POST /api/roles/permissions
 * Crear permiso
 */
router.post(
  '/permissions',
  requireAdmin,
  validateBody(['resource', 'action']),
  auditLog('create', 'permissions'),
  roleController.createPermission
)

/**
 * GET /api/roles/:id
 * Obtener rol por ID
 */
router.get('/:id', roleController.getById)

/**
 * POST /api/roles
 * Crear rol
 */
router.post(
  '/',
  requireAdmin,
  validateBody(['name']),
  auditLog('create', 'roles'),
  roleController.create
)

/**
 * PUT /api/roles/:id
 * Actualizar rol
 */
router.put(
  '/:id',
  requireAdmin,
  auditLog('update', 'roles'),
  roleController.update
)

/**
 * DELETE /api/roles/:id
 * Eliminar rol
 */
router.delete(
  '/:id',
  requireAdmin,
  auditLog('delete', 'roles'),
  roleController.delete
)

export default router


