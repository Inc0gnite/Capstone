import { Router } from 'express'
import adminController from '../controllers/adminController'
import { authenticate } from '../middlewares/auth'
import { requireAdmin } from '../middlewares/rbac'

const router = Router()

// Todas las rutas requieren autenticación y ser Administrador
router.use(authenticate)
router.use(requireAdmin)

/**
 * POST /api/admin/add-reports-permission
 * Endpoint temporal para agregar permiso reports:read
 * Solo accesible por Administradores
 */
router.post(
  '/add-reports-permission',
  adminController.addReportsPermission
)

/**
 * POST /api/admin/add-work-orders-read-permission-guardia
 * Endpoint temporal para agregar permiso work-orders:read al rol Guardia
 * Solo accesible por Administradores
 */
router.post(
  '/add-work-orders-read-permission-guardia',
  adminController.addWorkOrdersReadPermissionToGuardia
)

export default router

