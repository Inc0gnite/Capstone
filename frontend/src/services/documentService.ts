import api from './api'
import type { Document } from '../../../shared/types'

export interface CreateDocumentRequest {
  name: string
  type: string
  url: string
  relatedTo: 'vehicle-entry' | 'vehicle' | 'work-order'
  relatedId: string
}

export interface UpdateDocumentRequest {
  name?: string
  type?: string
}

export const documentService = {
  /**
   * Obtener tipos de documentos permitidos
   */
  async getDocumentTypes(relatedTo: string): Promise<string[]> {
    const response = await api.get(`/documents/types/${relatedTo}`)
    return response.data.data
  },

  /**
   * Crear un nuevo documento
   */
  async create(data: CreateDocumentRequest): Promise<Document> {
    const response = await api.post('/documents', data)
    return response.data.data
  },

  /**
   * Obtener documentos relacionados con una entidad
   */
  async getByRelated(relatedTo: string, relatedId: string): Promise<Document[]> {
    const response = await api.get(`/documents/${relatedTo}/${relatedId}`)
    return response.data.data
  },

  /**
   * Obtener un documento por ID
   */
  async getById(id: string): Promise<Document> {
    const response = await api.get(`/documents/${id}`)
    return response.data.data
  },

  /**
   * Actualizar un documento
   */
  async update(id: string, data: UpdateDocumentRequest): Promise<Document> {
    const response = await api.put(`/documents/${id}`, data)
    return response.data.data
  },

  /**
   * Eliminar un documento
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/documents/${id}`)
  },

  /**
   * Subir archivo PDF y obtener URL
   * Nota: Esto asume que tienes un servicio de almacenamiento (S3, Cloudinary, etc.)
   * Por ahora, retornamos una URL temporal. Deberás implementar la lógica de subida real.
   */
  async uploadFile(file: File): Promise<string> {
    // TODO: Implementar subida real de archivos
    // Por ahora, convertimos a base64 como ejemplo
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        // En producción, esto debería subir a un servicio de almacenamiento
        // y retornar la URL pública
        const base64 = reader.result as string
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  },
}

