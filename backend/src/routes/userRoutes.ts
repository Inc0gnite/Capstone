import { Router } from 'express'
import userController from '../controllers/userController'
import { authenticate } from '../middlewares/auth'
import { authorize, requireAdmin, injectWorkshopFilter } from '../middlewares/rbac'
import {
  validateBody,
  validateEmailField,
  validatePasswordField,
  validateRUTField,
  validatePagination,
} from '../middlewares/validation'
import { auditLog } from '../middlewares/audit'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)
// Inyectar filtro de taller automáticamente
router.use(injectWorkshopFilter())

/**
 * GET /api/users
 * Obtener todos los usuarios
 */
router.get(
  '/',
  authorize('users', 'read'),
  validatePagination,
  userController.getAll
)

/**
 * GET /api/users/:id
 * Obtener usuario por ID
 */
router.get(
  '/:id',
  authorize('users', 'read'),
  userController.getById
)

/**
 * POST /api/users
 * Crear usuario
 */
router.post(
  '/',
  requireAdmin,
  validateBody(['rut', 'firstName', 'lastName', 'email', 'password', 'roleId']),
  validateRUTField('rut'),
  validateEmailField('email'),
  validatePasswordField('password'),
  auditLog('create', 'users'),
  userController.create
)

/**
 * PUT /api/users/:id
 * Actualizar usuario
 */
router.put(
  '/:id',
  authorize('users', 'update'),
  validateEmailField('email'),
  validateRUTField('rut'),
  auditLog('update', 'users'),
  userController.update
)

/**
 * DELETE /api/users/:id/permanent
 * Eliminar usuario permanentemente (hard delete)
 * Solo el administrador supremo puede usar este endpoint
 * IMPORTANTE: Esta ruta debe estar ANTES de /:id para que Express la reconozca
 */
router.delete(
  '/:id/permanent',
  requireAdmin,
  auditLog('permanent_delete', 'users'),
  userController.permanentDelete
)

/**
 * POST /api/users/:id/restore
 * Restaurar usuario
 * IMPORTANTE: Esta ruta debe estar ANTES de /:id para que Express la reconozca
 */
router.post(
  '/:id/restore',
  requireAdmin,
  auditLog('restore', 'users'),
  userController.restore
)

/**
 * DELETE /api/users/:id
 * Eliminar usuario (soft delete)
 */
router.delete(
  '/:id',
  requireAdmin,
  auditLog('delete', 'users'),
  userController.delete
)

/**
 * GET /api/users/workshop/:workshopId
 * Obtener usuarios por taller
 */
router.get(
  '/workshop/:workshopId',
  authorize('users', 'read'),
  userController.getByWorkshop
)

/**
 * GET /api/users/role/:roleId
 * Obtener usuarios por rol
 */
router.get(
  '/role/:roleId',
  authorize('users', 'read'),
  userController.getByRole
)

export default router


