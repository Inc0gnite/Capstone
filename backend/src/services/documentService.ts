import prisma from '../config/database'

export interface DocumentData {
  name: string
  type: string
  url: string
  relatedTo: 'vehicle-entry' | 'vehicle' | 'work-order'
  relatedId: string
}

export class DocumentService {
  /**
   * Crear un nuevo documento
   */
  async createDocument(documentData: DocumentData) {
    try {
      const document = await prisma.document.create({
        data: {
          name: documentData.name,
          type: documentData.type,
          url: documentData.url,
          relatedTo: documentData.relatedTo,
          relatedId: documentData.relatedId,
        },
      })

      return document
    } catch (error: any) {
      throw new Error(`Error creando documento: ${error.message}`)
    }
  }

  /**
   * Obtener todos los documentos relacionados con una entidad
   */
  async getDocumentsByRelated(relatedTo: string, relatedId: string) {
    try {
      const documents = await prisma.document.findMany({
        where: {
          relatedTo,
          relatedId,
        },
        orderBy: {
          uploadedAt: 'desc',
        },
      })

      return documents
    } catch (error: any) {
      throw new Error(`Error obteniendo documentos: ${error.message}`)
    }
  }

  /**
   * Obtener un documento por ID
   */
  async getDocumentById(id: string) {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
      })

      if (!document) {
        throw new Error('Documento no encontrado')
      }

      return document
    } catch (error: any) {
      throw new Error(`Error obteniendo documento: ${error.message}`)
    }
  }

  /**
   * Actualizar un documento
   */
  async updateDocument(id: string, data: { name?: string; type?: string }) {
    try {
      const document = await prisma.document.update({
        where: { id },
        data,
      })

      return document
    } catch (error: any) {
      throw new Error(`Error actualizando documento: ${error.message}`)
    }
  }

  /**
   * Eliminar un documento
   */
  async deleteDocument(id: string) {
    try {
      const document = await prisma.document.delete({
        where: { id },
      })

      return document
    } catch (error: any) {
      throw new Error(`Error eliminando documento: ${error.message}`)
    }
  }

  /**
   * Obtener tipos de documentos permitidos
   */
  getDocumentTypes(relatedTo: string): string[] {
    const types: Record<string, string[]> = {
      'vehicle-entry': [
        'Factura',
        'Orden de Compra',
        'Guía de Despacho',
        'Boleta',
        'Certificado',
        'Otro',
      ],
      vehicle: [
        'Permiso de Circulación',
        'Seguro',
        'Revisión Técnica',
        'Documentación Legal',
        'Otro',
      ],
      'work-order': [
        'Orden de Trabajo',
        'Presupuesto',
        'Factura de Reparación',
        'Garantía',
        'Otro',
      ],
    }

    return types[relatedTo] || ['Otro']
  }
}

export default new DocumentService()

