import { useRef, useState } from 'react'

export interface Photo {
  id: string
  entryId: string
  url: string
  description?: string
  photoType: string
  uploadedAt: string
}

interface PhotoGalleryProps {
  entryId: string
  photos: Photo[]
  onAddPhoto: (photo: Photo) => void
  onDeletePhoto: (photoId: string) => void
  onUpdatePhoto: (photoId: string, description: string) => void
}

const PHOTO_TYPES = [
  { value: 'before', label: 'Antes', icon: '📸', color: 'bg-blue-500' },
  { value: 'damage', label: 'Daños', icon: '⚠️', color: 'bg-red-500' },
  { value: 'interior', label: 'Interior', icon: '🚗', color: 'bg-green-500' },
  { value: 'exterior', label: 'Exterior', icon: '🚙', color: 'bg-purple-500' }
]

export function PhotoGallery({
  entryId,
  photos,
  onAddPhoto,
  onDeletePhoto,
  onUpdatePhoto
}: PhotoGalleryProps) {
  const [selectedPhotoType, setSelectedPhotoType] = useState('before')
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const convertFileToDataUrl = (file: File) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP)')
    }

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
      reader.readAsDataURL(file)
    })
  }

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      try {
        const dataUrl = await convertFileToDataUrl(file)
        const newPhoto: Photo = {
          id: `temp-${Date.now()}-${file.name}`,
          entryId,
          url: dataUrl,
          description: file.name,
          photoType: selectedPhotoType,
          uploadedAt: new Date().toISOString()
        }

        onAddPhoto(newPhoto)
      } catch (error) {
        console.error('Error cargando la foto:', error)
        const message = error instanceof Error ? error.message : 'Hubo un problema al cargar la foto. Intenta nuevamente.'
        alert(message)
      }
    }
  }

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleEditPhoto = (photo: Photo) => {
    setEditingPhoto(photo.id)
    setEditDescription(photo.description || '')
  }

  const handleSaveEdit = () => {
    if (editingPhoto && editDescription.trim()) {
      onUpdatePhoto(editingPhoto, editDescription.trim())
      setEditingPhoto(null)
      setEditDescription('')
    }
  }

  const handleCancelEdit = () => {
    setEditingPhoto(null)
    setEditDescription('')
  }

  const getPhotosByType = (type: string) => {
    return photos.filter(photo => photo.photoType === type)
  }

  const getPhotoTypeInfo = (type: string) => {
    return PHOTO_TYPES.find(t => t.value === type) || PHOTO_TYPES[0]
  }

  return (
    <div className="space-y-4">
      {/* Selector de tipo de foto */}
      <div className="flex flex-wrap gap-2">
        {PHOTO_TYPES.map(type => (
          <button
            key={type.value}
            onClick={() => setSelectedPhotoType(type.value)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              selectedPhotoType === type.value
                ? `${type.color} text-white shadow-lg`
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className="text-sm sm:text-base">{type.icon}</span>
            <span className="hidden sm:inline">{type.label}</span>
            <span className="text-xs">
              ({getPhotosByType(type.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* Botón para subir foto */}
      <button
        type="button"
        onClick={handleUploadButtonClick}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2.5 sm:p-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors text-sm sm:text-base"
      >
        <span className="text-lg sm:text-xl">📸</span>
        <span className="hidden sm:inline">Subir Foto - </span>
        <span>{getPhotoTypeInfo(selectedPhotoType).label}</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          void handleFilesSelected(event.target.files)
          if (event.target) {
            event.target.value = ''
          }
        }}
      />

      {/* Galería de fotos por tipo */}
      {PHOTO_TYPES.map(type => {
        const typePhotos = getPhotosByType(type.value)
        if (typePhotos.length === 0) return null

        return (
          <div key={type.value} className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span>{type.icon}</span>
              {type.label} ({typePhotos.length})
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {typePhotos.map(photo => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.url}
                    alt={photo.description}
                    className="w-full h-24 sm:h-32 md:h-40 object-cover rounded-lg border-2 border-gray-200"
                  />

                  {/* Overlay con controles */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                      <button
                        onClick={() => handleEditPhoto(photo)}
                        className="bg-blue-500 text-white p-1 rounded text-xs"
                        title="Editar descripción"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDeletePhoto(photo.id)}
                        className="bg-red-500 text-white p-1 rounded text-xs"
                        title="Eliminar foto"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="mt-1 text-xs text-gray-600 truncate">
                    {photo.description || 'Sin descripción'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Modal de edición */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Editar Descripción</h3>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Descripción de la foto..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={3}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Guardar
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

