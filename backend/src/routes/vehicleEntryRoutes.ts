import { Router } from 'express'
import vehicleEntryController from '../controllers/vehicleEntryController'
import { authenticate } from '../middlewares/auth'
import { authorize } from '../middlewares/rbac'
import { validateBody, validatePagination } from '../middlewares/validation'
import { auditLog } from '../middlewares/audit'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * GET /api/vehicle-entries
 * Obtener todos los ingresos
 */
router.get(
  '/',
  authorize('vehicle-entries', 'read'),
  validatePagination,
  vehicleEntryController.getAll
)

/**
 * GET /api/vehicle-entries/active
 * Obtener ingresos activos (sin salida)
 */
router.get(
  '/active',
  authorize('vehicle-entries', 'read'),
  vehicleEntryController.getActiveEntries
)

/**
 * GET /api/vehicle-entries/:id
 * Obtener ingreso por ID
 */
router.get(
  '/:id',
  authorize('vehicle-entries', 'read'),
  vehicleEntryController.getById
)

/**
 * POST /api/vehicle-entries
 * Crear ingreso de vehículo
 */
router.post(
  '/',
  authorize('vehicle-entries', 'create'),
  validateBody([
    'vehicleId',
    'workshopId',
    'driverRut',
    'driverName',
    'entryKm',
    'fuelLevel',
    'hasKeys',
  ]),
  auditLog('create', 'vehicle-entries'),
  vehicleEntryController.create
)

/**
 * PUT /api/vehicle-entries/:id
 * Actualizar ingreso
 */
router.put(
  '/:id',
  authorize('vehicle-entries', 'update'),
  auditLog('update', 'vehicle-entries'),
  vehicleEntryController.update
)

/**
 * GET /api/vehicle-entries/:id/ready-for-exit
 * Verificar si un vehículo está listo para salida
 */
router.get(
  '/:id/ready-for-exit',
  authorize('vehicle-entries', 'read'),
  vehicleEntryController.isReadyForExit
)

/**
 * POST /api/vehicle-entries/:id/exit
 * Registrar salida del vehículo
 */
router.post(
  '/:id/exit',
  authorize('vehicle-entries', 'update'),
  validateBody(['exitKm']),
  auditLog('register-exit', 'vehicle-entries'),
  vehicleEntryController.registerExit
)

/**
 * PUT /api/vehicle-entries/:id/keys
 * Actualizar control de llaves
 */
router.put(
  '/:id/keys',
  authorize('vehicle-entries', 'update'),
  auditLog('update-keys', 'vehicle-entries'),
  vehicleEntryController.updateKeyControl
)

export default router


