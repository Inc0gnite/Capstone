import { Router } from 'express'
import userController from '../controllers/userController'
import { authenticate } from '../middlewares/auth'
import { authorize, requireAdmin } from '../middlewares/rbac'
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
 * POST /api/users/:id/restore
 * Restaurar usuario
 */
router.post(
  '/:id/restore',
  requireAdmin,
  auditLog('restore', 'users'),
  userController.restore
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


