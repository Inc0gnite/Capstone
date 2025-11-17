import { useState, useEffect } from 'react'
import { documentService } from '../services/documentService'
import type { Document } from '../../../shared/types'

interface DocumentUploadProps {
  relatedTo: 'vehicle-entry' | 'vehicle' | 'work-order'
  relatedId: string
  onDocumentUploaded?: (document: Document) => void
  onDocumentDeleted?: (documentId: string) => void
  readOnly?: boolean // Si es true, solo permite visualizar, no subir ni eliminar
}

export function DocumentUpload({
  relatedTo,
  relatedId,
  onDocumentUploaded,
  onDocumentDeleted,
  readOnly = false,
}: DocumentUploadProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [documentTypes, setDocumentTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedType, setSelectedType] = useState('')
  const [documentName, setDocumentName] = useState('')

  useEffect(() => {
    loadDocuments()
    loadDocumentTypes()
  }, [relatedId, relatedTo])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const docs = await documentService.getByRelated(relatedTo, relatedId)
      setDocuments(docs)
    } catch (error) {
      console.error('Error cargando documentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDocumentTypes = async () => {
    try {
      const types = await documentService.getDocumentTypes(relatedTo)
      setDocumentTypes(types)
      if (types.length > 0) {
        setSelectedType(types[0])
      }
    } catch (error) {
      console.error('Error cargando tipos de documentos:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar que sea PDF
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Solo se permiten archivos PDF')
        return
      }

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo no puede ser mayor a 10MB')
        return
      }

      setSelectedFile(file)
      if (!documentName) {
        setDocumentName(file.name.replace('.pdf', ''))
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedType || !documentName) {
      alert('Por favor completa todos los campos')
      return
    }

    try {
      setUploading(true)

      // Subir archivo y obtener URL
      const fileUrl = await documentService.uploadFile(selectedFile)

      // Crear documento
      const document = await documentService.create({
        name: documentName,
        type: selectedType,
        url: fileUrl,
        relatedTo,
        relatedId,
      })

      // Actualizar lista
      await loadDocuments()

      // Limpiar formulario
      setSelectedFile(null)
      setDocumentName('')
      setSelectedType(documentTypes[0] || '')
      setShowUploadForm(false)

      // Notificar
      if (onDocumentUploaded) {
        onDocumentUploaded(document)
      }

      alert('Documento subido exitosamente')
    } catch (error: any) {
      console.error('Error subiendo documento:', error)
      alert('Error al subir documento: ' + (error.response?.data?.error || error.message))
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) {
      return
    }

    try {
      await documentService.delete(documentId)
      await loadDocuments()

      if (onDocumentDeleted) {
        onDocumentDeleted(documentId)
      }

      alert('Documento eliminado exitosamente')
    } catch (error: any) {
      console.error('Error eliminando documento:', error)
      alert('Error al eliminar documento: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleDownload = async (doc: Document) => {
    try {
      // Si la URL es base64, convertirla a blob y descargar
      if (doc.url.startsWith('data:application/pdf;base64,')) {
        const base64Data = doc.url.split(',')[1]
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/pdf' })
        
        // Crear URL temporal y descargar
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${doc.name}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        // Si es una URL normal, descargar directamente
        const response = await fetch(doc.url)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${doc.name}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error descargando documento:', error)
      alert('Error al descargar el documento. Intenta abrirlo en una nueva pestaña.')
      // Fallback: abrir en nueva pestaña
      window.open(doc.url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Cargando documentos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2 text-xl">📄</span>
          Documentos ({documents.length})
        </h3>
        {!readOnly && (
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm flex items-center space-x-2"
          >
            <span>{showUploadForm ? '✕' : '+'}</span>
            <span>{showUploadForm ? 'Cancelar' : 'Subir Documento'}</span>
          </button>
        )}
      </div>

      {/* Formulario de subida */}
      {showUploadForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Subir Nuevo Documento</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento *
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Documento *
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Ej: Factura 001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivo PDF *
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !selectedType || !documentName}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Guardar</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowUploadForm(false)
                setSelectedFile(null)
                setDocumentName('')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de documentos */}
      {documents.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No hay documentos subidos</p>
          <p className="text-sm text-gray-400 mt-1">Haz clic en "Subir Documento" para agregar uno</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((document) => (
            <div
              key={document.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="text-3xl">📄</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{document.name}</p>
                  <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                    <span>Tipo: {document.type}</span>
                    <span>•</span>
                    <span>
                      Subido: {new Date(document.uploadedAt).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(document)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors text-sm"
                  title="Descargar documento"
                >
                  ⬇️ Descargar
                </button>
                {!readOnly && (
                  <button
                    onClick={() => handleDelete(document.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors text-sm"
                    title="Eliminar"
                  >
                    🗑️ Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

