import { Request, Response } from 'express'
import photoService from '../services/photoService'
import { sendSuccess, sendError } from '../utils/response'

export class PhotoController {
  /**
   * POST /api/photos/entries/:entryId
   * Agregar foto a un ingreso
   */
  async addEntryPhoto(req: Request, res: Response) {
    try {
      const { entryId } = req.params
      const { url, description, photoType } = req.body

      // Validaciones
      if (!url) {
        return sendError(res, 'URL de la foto es requerida', 400)
      }

      if (!photoType) {
        return sendError(res, 'Tipo de foto es requerido', 400)
      }

      // Tipos de foto válidos
      const validPhotoTypes = ['before', 'damage', 'interior', 'exterior']
      if (!validPhotoTypes.includes(photoType)) {
        return sendError(res, `Tipo de foto inválido. Tipos válidos: ${validPhotoTypes.join(', ')}`, 400)
      }

      const photo = await photoService.addEntryPhoto({
        entryId,
        url,
        description,
        photoType
      })

      return sendSuccess(res, photo, 'Foto agregada exitosamente', 201)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * GET /api/photos/entries/:entryId
   * Obtener fotos de un ingreso
   */
  async getEntryPhotos(req: Request, res: Response) {
    try {
      const { entryId } = req.params
      const { photoType } = req.query

      let photos
      if (photoType) {
        photos = await photoService.getPhotosByType(entryId, photoType as string)
      } else {
        photos = await photoService.getEntryPhotos(entryId)
      }

      return sendSuccess(res, photos, 'Fotos obtenidas exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * GET /api/photos/:photoId
   * Obtener una foto específica
   */
  async getPhotoById(req: Request, res: Response) {
    try {
      const { photoId } = req.params
      const photo = await photoService.getPhotoById(photoId)

      return sendSuccess(res, photo, 'Foto obtenida exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * PUT /api/photos/:photoId
   * Actualizar descripción de una foto
   */
  async updatePhotoDescription(req: Request, res: Response) {
    try {
      const { photoId } = req.params
      const { description } = req.body

      if (!description) {
        return sendError(res, 'Descripción es requerida', 400)
      }

      const photo = await photoService.updatePhotoDescription(photoId, description)

      return sendSuccess(res, photo, 'Descripción actualizada exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  /**
   * DELETE /api/photos/:photoId
   * Eliminar una foto
   */
  async deletePhoto(req: Request, res: Response) {
    try {
      const { photoId } = req.params
      const photo = await photoService.deletePhoto(photoId)

      return sendSuccess(res, photo, 'Foto eliminada exitosamente')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }
}

export default new PhotoController()


