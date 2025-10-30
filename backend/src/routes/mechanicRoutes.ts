import { Router } from 'express'
import { MechanicController } from '../controllers/mechanicController'
import { authorize } from '../middlewares/rbac'
import { authenticate } from '../middlewares/auth'

const router = Router()
const mechanicController = new MechanicController()

/**
 * GET /api/mechanics/available/:workshopId
 * Obtener mecánicos disponibles por taller
 */
router.get(
  '/available/:workshopId',
  // authenticate, // Temporalmente sin autenticación para debug
  mechanicController.getAvailableMechanics
)

/**
 * GET /api/mechanics/workload/:workshopId
 * Obtener mecánicos con carga de trabajo por taller
 */
router.get(
  '/workload/:workshopId',
  // authenticate, // Temporalmente sin autenticación para debug
  mechanicController.getMechanicsWithWorkload
)

/**
 * POST /api/mechanics/assign
 * Asignar mecánico a orden de trabajo
 */
router.post(
  '/assign',
  // authenticate, // Temporalmente sin autenticación para debug
  mechanicController.assignMechanic
)

/**
 * PUT /api/mechanics/reassign
 * Reasignar mecánico a orden de trabajo
 */
router.put(
  '/reassign',
  authenticate, // Solo autenticación básica
  mechanicController.reassignMechanic
)

/**
 * POST /api/mechanics/exchange
 * Intercambiar mecánicos entre órdenes de trabajo
 */
router.post(
  '/exchange',
  authenticate, // Solo autenticación básica
  mechanicController.exchangeMechanics
)

/**
 * GET /api/mechanics/:mechanicId/workload
 * Obtener carga de trabajo de un mecánico
 */
router.get(
  '/:mechanicId/workload',
  authorize('users', 'read'),
  mechanicController.getMechanicWorkload
)

/**
 * GET /api/mechanics/workshop/:workshopId/specialty/:specialty
 * Obtener mecánicos por especialidad
 */
router.get(
  '/workshop/:workshopId/specialty/:specialty',
  authorize('users', 'read'),
  mechanicController.getMechanicsBySpecialty
)

export default router
