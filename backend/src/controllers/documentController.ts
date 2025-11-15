import { Request, Response } from 'express'
import documentService from '../services/documentService'
import { sendSuccess, sendError } from '../utils/response'

export class DocumentController {
  /**
   * POST /api/documents
   * Crear un nuevo documento
   */
  async createDocument(req: Request, res: Response) {
    try {
      const { name, type, url, relatedTo, relatedId } = req.body

      // Validaciones
      if (!name || !type || !url || !relatedTo || !relatedId) {
        return sendError(res, 'Todos los campos son requeridos: name, type, url, relatedTo, relatedId', 400)
      }

      // Validar relatedTo
      const validRelatedTo = ['vehicle-entry', 'vehicle', 'work-order']
      if (!validRelatedTo.includes(relatedTo)) {
        return sendError(res, `relatedTo inválido. Valores válidos: ${validRelatedTo.join(', ')}`, 400)
      }

      // Validar que el archivo sea PDF
      if (!url.toLowerCase().endsWith('.pdf') && !url.includes('pdf')) {
        return sendError(res, 'Solo se permiten archivos PDF', 400)
      }

      const document = await documentService.createDocument({
        name,
        type,
        url,
        relatedTo,
        relatedId,
      })

      return sendSuccess(res, document, 'Documento creado exitosamente', 201)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * GET /api/documents/:relatedTo/:relatedId
   * Obtener documentos relacionados con una entidad
   */
  async getDocumentsByRelated(req: Request, res: Response) {
    try {
      const { relatedTo, relatedId } = req.params

      // Validar relatedTo
      const validRelatedTo = ['vehicle-entry', 'vehicle', 'work-order']
      if (!validRelatedTo.includes(relatedTo)) {
        return sendError(res, `relatedTo inválido. Valores válidos: ${validRelatedTo.join(', ')}`, 400)
      }

      const documents = await documentService.getDocumentsByRelated(relatedTo, relatedId)

      return sendSuccess(res, documents)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * GET /api/documents/:id
   * Obtener un documento por ID
   */
  async getDocumentById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const document = await documentService.getDocumentById(id)

      return sendSuccess(res, document)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  /**
   * GET /api/documents/types/:relatedTo
   * Obtener tipos de documentos permitidos
   */
  async getDocumentTypes(req: Request, res: Response) {
    try {
      const { relatedTo } = req.params
      const types = documentService.getDocumentTypes(relatedTo)

      return sendSuccess(res, types)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * PUT /api/documents/:id
   * Actualizar un documento
   */
  async updateDocument(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { name, type } = req.body

      const document = await documentService.updateDocument(id, { name, type })

      return sendSuccess(res, document, 'Documento actualizado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * DELETE /api/documents/:id
   * Eliminar un documento
   */
  async deleteDocument(req: Request, res: Response) {
    try {
      const { id } = req.params
      await documentService.deleteDocument(id)

      return sendSuccess(res, null, 'Documento eliminado exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }
}

export default new DocumentController()

