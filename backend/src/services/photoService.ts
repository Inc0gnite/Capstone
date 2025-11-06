import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface PhotoData {
  entryId: string
  url: string
  description?: string
  photoType: string
}

export class PhotoService {
  /**
   * Agregar foto a un ingreso de vehículo
   */
  async addEntryPhoto(photoData: PhotoData) {
    try {
      const photo = await prisma.vehicleEntryPhoto.create({
        data: {
          entryId: photoData.entryId,
          url: photoData.url,
          description: photoData.description,
          photoType: photoData.photoType
        },
        include: {
          entry: {
            include: {
              vehicle: true
            }
          }
        }
      })

      return photo
    } catch (error: any) {
      throw new Error(`Error agregando foto: ${error.message}`)
    }
  }

  /**
   * Obtener todas las fotos de un ingreso
   */
  async getEntryPhotos(entryId: string) {
    try {
      const photos = await prisma.vehicleEntryPhoto.findMany({
        where: { entryId },
        orderBy: { uploadedAt: 'desc' },
        include: {
          entry: {
            include: {
              vehicle: true
            }
          }
        }
      })

      return photos
    } catch (error: any) {
      throw new Error(`Error obteniendo fotos: ${error.message}`)
    }
  }

  /**
   * Obtener una foto específica
   */
  async getPhotoById(photoId: string) {
    try {
      const photo = await prisma.vehicleEntryPhoto.findUnique({
        where: { id: photoId },
        include: {
          entry: {
            include: {
              vehicle: true
            }
          }
        }
      })

      if (!photo) {
        throw new Error('Foto no encontrada')
      }

      return photo
    } catch (error: any) {
      throw new Error(`Error obteniendo foto: ${error.message}`)
    }
  }

  /**
   * Eliminar una foto
   */
  async deletePhoto(photoId: string) {
    try {
      const photo = await prisma.vehicleEntryPhoto.delete({
        where: { id: photoId }
      })

      return photo
    } catch (error: any) {
      throw new Error(`Error eliminando foto: ${error.message}`)
    }
  }

  /**
   * Obtener fotos por tipo
   */
  async getPhotosByType(entryId: string, photoType: string) {
    try {
      const photos = await prisma.vehicleEntryPhoto.findMany({
        where: { 
          entryId,
          photoType 
        },
        orderBy: { uploadedAt: 'desc' }
      })

      return photos
    } catch (error: any) {
      throw new Error(`Error obteniendo fotos por tipo: ${error.message}`)
    }
  }

  /**
   * Actualizar descripción de una foto
   */
  async updatePhotoDescription(photoId: string, description: string) {
    try {
      const photo = await prisma.vehicleEntryPhoto.update({
        where: { id: photoId },
        data: { description }
      })

      return photo
    } catch (error: any) {
      throw new Error(`Error actualizando descripción: ${error.message}`)
    }
  }
}

export default new PhotoService()


