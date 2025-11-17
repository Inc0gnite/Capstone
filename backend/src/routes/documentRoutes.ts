import { Router } from 'express'
import documentController from '../controllers/documentController'
import { authenticate } from '../middlewares/auth'
import { authorize } from '../middlewares/rbac'
import { validateBody } from '../middlewares/validation'
import { auditLog } from '../middlewares/audit'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * GET /api/documents/types/:relatedTo
 * Obtener tipos de documentos permitidos
 */
router.get(
  '/types/:relatedTo',
  authorize('vehicle-entries', 'read'), // Usar permisos existentes
  documentController.getDocumentTypes
)

/**
 * POST /api/documents
 * Crear un nuevo documento
 */
router.post(
  '/',
  authorize('vehicle-entries', 'update'), // Usar permisos existentes
  validateBody(['name', 'type', 'url', 'relatedTo', 'relatedId']),
  auditLog('create', 'documents'),
  documentController.createDocument
)

/**
 * GET /api/documents/:relatedTo/:relatedId
 * Obtener documentos relacionados con una entidad
 */
router.get(
  '/:relatedTo/:relatedId',
  authorize('vehicle-entries', 'read'), // Usar permisos existentes
  documentController.getDocumentsByRelated
)

/**
 * GET /api/documents/:id
 * Obtener un documento por ID
 */
router.get(
  '/:id',
  authorize('vehicle-entries', 'read'), // Usar permisos existentes
  documentController.getDocumentById
)

/**
 * PUT /api/documents/:id
 * Actualizar un documento
 */
router.put(
  '/:id',
  authorize('vehicle-entries', 'update'), // Usar permisos existentes
  auditLog('update', 'documents'),
  documentController.updateDocument
)

/**
 * DELETE /api/documents/:id
 * Eliminar un documento
 */
router.delete(
  '/:id',
  authorize('vehicle-entries', 'update'), // Usar permisos existentes
  auditLog('delete', 'documents'),
  documentController.deleteDocument
)

export default router

