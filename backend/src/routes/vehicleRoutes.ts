import { Router } from 'express'
import vehicleController from '../controllers/vehicleController'
import { authenticate } from '../middlewares/auth'
import { authorize } from '../middlewares/rbac'
import { validateBody, validatePagination } from '../middlewares/validation'
import { auditLog } from '../middlewares/audit'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * GET /api/vehicles/stats
 * Obtener estadísticas de vehículos
 */
router.get('/stats', authorize('vehicles', 'read'), vehicleController.getStats)

/**
 * GET /api/vehicles/plate/:licensePlate
 * Obtener vehículo por patente
 */
router.get(
  '/plate/:licensePlate',
  authorize('vehicles', 'read'),
  vehicleController.getByLicensePlate
)

/**
 * GET /api/vehicles
 * Obtener todos los vehículos
 */
router.get(
  '/',
  authorize('vehicles', 'read'),
  validatePagination,
  vehicleController.getAll
)

/**
 * GET /api/vehicles/:id
 * Obtener vehículo por ID
 */
router.get('/:id', authorize('vehicles', 'read'), vehicleController.getById)

/**
 * POST /api/vehicles
 * Crear vehículo
 */
router.post(
  '/',
  authorize('vehicles', 'create'),
  validateBody(['licensePlate', 'vehicleType', 'brand', 'model', 'year', 'regionId']),
  auditLog('create', 'vehicles'),
  vehicleController.create
)

/**
 * PUT /api/vehicles/:id
 * Actualizar vehículo
 */
router.put(
  '/:id',
  authorize('vehicles', 'update'),
  auditLog('update', 'vehicles'),
  vehicleController.update
)

/**
 * DELETE /api/vehicles/:id
 * Eliminar vehículo (soft delete)
 */
router.delete(
  '/:id',
  authorize('vehicles', 'delete'),
  auditLog('delete', 'vehicles'),
  vehicleController.delete
)

/**
 * POST /api/vehicles/:id/restore
 * Restaurar vehículo
 */
router.post(
  '/:id/restore',
  authorize('vehicles', 'update'),
  auditLog('restore', 'vehicles'),
  vehicleController.restore
)

/**
 * DELETE /api/vehicles/:id
 * Eliminar vehículo permanentemente (solo administradores)
 */
router.delete(
  '/:id',
  authorize('vehicles', 'delete'),
  auditLog('delete', 'vehicles'),
  vehicleController.delete
)

export default router


