import { Router } from 'express'
import photoController from '../controllers/photoController'
import { authenticate } from '../middlewares/auth'
import { authorize } from '../middlewares/rbac'
import { validateBody } from '../middlewares/validation'
import { auditLog } from '../middlewares/audit'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * POST /api/photos/entries/:entryId
 * Agregar foto a un ingreso
 */
router.post(
  '/entries/:entryId',
  authorize('entries', 'update'),
  validateBody(['url', 'photoType']),
  auditLog('add-photo', 'vehicle-entries'),
  photoController.addEntryPhoto
)

/**
 * GET /api/photos/entries/:entryId
 * Obtener fotos de un ingreso
 */
router.get(
  '/entries/:entryId',
  authorize('entries', 'read'),
  photoController.getEntryPhotos
)

/**
 * GET /api/photos/:photoId
 * Obtener una foto específica
 */
router.get(
  '/:photoId',
  authorize('entries', 'read'),
  photoController.getPhotoById
)

/**
 * PUT /api/photos/:photoId
 * Actualizar descripción de una foto
 */
router.put(
  '/:photoId',
  authorize('entries', 'update'),
  validateBody(['description']),
  auditLog('update-photo', 'vehicle-entries'),
  photoController.updatePhotoDescription
)

/**
 * DELETE /api/photos/:photoId
 * Eliminar una foto
 */
router.delete(
  '/:photoId',
  authorize('entries', 'update'),
  auditLog('delete-photo', 'vehicle-entries'),
  photoController.deletePhoto
)

export default router
