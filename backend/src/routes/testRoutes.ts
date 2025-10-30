import { Router } from 'express'
import { testController } from '../controllers/testController'

const router = Router()

/**
 * GET /api/test
 * Endpoint de prueba
 */
router.get('/', testController.test)

export default router

