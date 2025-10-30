import { Router } from 'express'
import workshopController from '../controllers/workshopController'
import { authenticate } from '../middlewares/auth'
import { authorize, requireAdmin } from '../middlewares/rbac'
import { validateBody } from '../middlewares/validation'
import { auditLog } from '../middlewares/audit'
import { mechanicService } from '../services/mechanicService'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * GET /api/workshops
 */
router.get('/', authorize('workshops', 'read'), workshopController.getAll)

/**
 * GET /api/workshops/region/:regionId
 */
router.get('/region/:regionId', authorize('workshops', 'read'), workshopController.getByRegion)

/**
 * GET /api/workshops/:id/mechanic-capacity
 * Obtener capacidad de mecánicos por taller
 */
router.get('/:id/mechanic-capacity', authorize('workshops', 'read'), async (req, res) => {
  try {
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID de taller requerido'
      })
    }

    const mechanics = await mechanicService.getAvailableMechanics(id)
    
    // Transformar los datos al formato esperado por el frontend
    const formattedMechanics = mechanics.map(m => ({
      id: m.mechanicId,
      name: m.mechanicName,
      currentHours: m.currentHours,
      maxHours: m.maxHours,
      currentOrders: m.activeOrders,
      workshopId: id,
      workshopName: 'Taller'
    }))

    return res.json({
      success: true,
      data: {
        mechanics: formattedMechanics,
        workshop: {
          id: id,
          name: 'Taller',
          maxHoursPerMechanic: 8
        }
      }
    })
  } catch (error: any) {
    console.error('Error en mechanic-capacity:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/workshops/:id/stats
 */
router.get('/:id/stats', authorize('workshops', 'read'), workshopController.getStats)

/**
 * GET /api/workshops/:id
 */
router.get('/:id', authorize('workshops', 'read'), workshopController.getById)

/**
 * POST /api/workshops
 */
router.post(
  '/',
  requireAdmin,
  validateBody(['code', 'name', 'regionId', 'address', 'city']),
  auditLog('create', 'workshops'),
  workshopController.create
)

/**
 * PUT /api/workshops/:id
 */
router.put(
  '/:id',
  requireAdmin,
  auditLog('update', 'workshops'),
  workshopController.update
)

/**
 * POST /api/workshops/:id/schedule
 */
router.post(
  '/:id/schedule',
  requireAdmin,
  validateBody(['dayOfWeek', 'openTime', 'closeTime']),
  auditLog('set-schedule', 'workshops'),
  workshopController.setSchedule
)

export default router


