import { Router } from 'express'
import authController from '../controllers/authController'
import { authenticate } from '../middlewares/auth'
import {
  validateBody,
  validateEmailField,
  validatePasswordField,
  validateRUTField,
} from '../middlewares/validation'
import { auditLog } from '../middlewares/audit'

const router = Router()

/**
 * POST /api/auth/login
 * Login de usuario
 */
router.post(
  '/login',
  validateBody(['email', 'password']),
  validateEmailField('email'),
  auditLog('login', 'auth'),
  authController.login
)

/**
 * POST /api/auth/register
 * Registro de usuario
 */
router.post(
  '/register',
  validateBody(['rut', 'firstName', 'lastName', 'email', 'password', 'roleId']),
  validateRUTField('rut'),
  validateEmailField('email'),
  validatePasswordField('password'),
  auditLog('register', 'auth'),
  authController.register
)

/**
 * POST /api/auth/refresh
 * Refrescar token
 */
router.post(
  '/refresh',
  validateBody(['refreshToken']),
  authController.refreshToken
)

/**
 * GET /api/auth/me
 * Obtener usuario actual
 */
router.get('/me', authenticate, authController.getCurrentUser)

/**
 * POST /api/auth/change-password
 * Cambiar contraseña
 */
router.post(
  '/change-password',
  authenticate,
  validateBody(['oldPassword', 'newPassword']),
  validatePasswordField('newPassword'),
  auditLog('change-password', 'auth'),
  authController.changePassword
)

/**
 * POST /api/auth/forgot-password
 * Solicitar recuperación de contraseña
 */
router.post(
  '/forgot-password',
  validateBody(['email']),
  validateEmailField('email'),
  authController.forgotPassword
)

/**
 * POST /api/auth/reset-password
 * Restablecer contraseña con token
 */
router.post(
  '/reset-password',
  validateBody(['token', 'newPassword']),
  validatePasswordField('newPassword'),
  authController.resetPassword
)

/**
 * POST /api/auth/logout
 * Logout
 */
router.post('/logout', authenticate, authController.logout)

export default router


