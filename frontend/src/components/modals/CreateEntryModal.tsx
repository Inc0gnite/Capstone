import { useState, useEffect } from 'react'
import { vehicleEntryService } from '../../services/vehicleEntryService'
import { vehicleService } from '../../services/vehicleService'
import { configService } from '../../services/configService'
import { useAuthStore } from '../../store/authStore'
import { PhotoGallery, type Photo } from '../photo/PhotoGallery'
import type { Vehicle } from '../../../../shared/types'

interface CreateEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (entryData?: any) => void
}

export function CreateEntryModal({ isOpen, onClose, onSuccess }: CreateEntryModalProps) {
  const { user } = useAuthStore()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [showPhotoSection, setShowPhotoSection] = useState(false)
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverRut: '',
    driverName: '',
    driverPhone: '',
    entryKm: '',
    fuelLevel: 'half',
    hasKeys: true,
    keyLocation: '',
    observations: ''
  })

  useEffect(() => {
    if (isOpen) {
      loadVehicles()
    }
  }, [isOpen])

  const loadVehicles = async () => {
    try {
      setLoadingVehicles(true)
      console.log('Cargando vehículos...')
      const response = await vehicleService.getAll()
      console.log('Respuesta de vehículos:', response)
      setVehicles(response.data || [])
      console.log('Vehículos cargados:', response.data || [])
    } catch (error) {
      console.error('Error cargando vehículos:', error)
      alert('Error al cargar vehículos: ' + (error as Error).message)
    } finally {
      setLoadingVehicles(false)
    }
  }

  const handleAddPhoto = (photo: Photo) => {
    setPhotos(prev => [...prev, photo])
  }

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId))
  }

  const handleUpdatePhoto = (photoId: string, description: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId ? { ...p, description } : p
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.vehicleId || !formData.driverRut || !formData.driverName || !formData.entryKm) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    try {
      setLoading(true)
      console.log('Creando ingreso con datos:', formData)
      
      // Usar el workshopId del usuario actual directamente
      const workshopId = user?.workshopId || user?.workshop?.id
      console.log('🏭 Workshop ID del usuario:', workshopId)
      
      // Verificar que tenemos el usuario actual
      if (!user) {
        throw new Error('Usuario no autenticado')
      }
      
      const newEntry = await vehicleEntryService.create({
        vehicleId: formData.vehicleId,
        workshopId: workshopId,
        driverRut: formData.driverRut,
        driverName: formData.driverName,
        driverPhone: formData.driverPhone || undefined,
        entryKm: parseInt(formData.entryKm),
        fuelLevel: formData.fuelLevel,
        hasKeys: formData.hasKeys,
        keyLocation: formData.hasKeys ? formData.keyLocation : undefined,
        observations: formData.observations || undefined,
        createdById: user.id
      } as any)
      
      // Emitir evento para actualizar estadísticas
      window.dispatchEvent(new CustomEvent('entry-created'))
      
      // Preparar datos para la notificación
      const entryData = {
        id: newEntry.id,
        entryCode: newEntry.entryCode,
        driverName: formData.driverName,
        driverRut: formData.driverRut,
        vehicle: selectedVehicle
      }
      
      onSuccess(entryData)
      onClose()
      resetForm()
    } catch (error: any) {
      console.error('Error creando ingreso:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error desconocido'
      
      // Mensaje más informativo según el tipo de error
      if (errorMessage.includes('Taller no encontrado')) {
        alert(`❌ Error al crear el ingreso: ${errorMessage}\n\n💡 El taller asignado no es válido. Contacta al administrador.`)
      } else if (errorMessage.includes('Vehículo no encontrado')) {
        alert(`❌ Error al crear el ingreso: ${errorMessage}\n\n💡 El vehículo seleccionado no existe. Intenta seleccionar otro vehículo.`)
      } else {
        alert(`❌ Error al crear el ingreso: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      driverRut: '',
      driverName: '',
      driverPhone: '',
      entryKm: '',
      fuelLevel: 'half',
      hasKeys: true,
      keyLocation: '',
      observations: ''
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Registrar Nuevo Ingreso
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vehículo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehículo *
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loadingVehicles}
              >
                <option value="">
                  {loadingVehicles ? 'Cargando vehículos...' : vehicles.length === 0 ? 'No hay vehículos disponibles' : 'Selecciona un vehículo'}
                </option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.licensePlate} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </option>
                ))}
              </select>
              {vehicles.length === 0 && !loadingVehicles && (
                <p className="text-sm text-red-600 mt-1">
                  No se encontraron vehículos. Verifica que tengas permisos para ver vehículos.
                </p>
              )}
            </div>

            {/* Información del Conductor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RUT Conductor *
                </label>
                <input
                  type="text"
                  value={formData.driverRut}
                  onChange={(e) => setFormData({ ...formData, driverRut: e.target.value })}
                  placeholder="12345678-9"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Conductor *
                </label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  placeholder="Nombre completo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono Conductor
              </label>
              <input
                type="tel"
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                placeholder="+56912345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Información del Vehículo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kilometraje Ingreso *
                </label>
                <input
                  type="number"
                  value={formData.entryKm}
                  onChange={(e) => setFormData({ ...formData, entryKm: e.target.value })}
                  placeholder="50000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de Combustible
                </label>
                <select
                  value={formData.fuelLevel}
                  onChange={(e) => setFormData({ ...formData, fuelLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="full">Lleno</option>
                  <option value="half">Medio</option>
                  <option value="low">Bajo</option>
                </select>
              </div>
            </div>

            {/* Control de Llaves */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿El vehículo tiene llaves?
                </label>
                <select
                  value={formData.hasKeys ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, hasKeys: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
              {formData.hasKeys && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación de las llaves
                  </label>
                  <input
                    type="text"
                    value={formData.keyLocation}
                    onChange={(e) => setFormData({ ...formData, keyLocation: e.target.value })}
                    placeholder="Ej: Oficina principal, Cajón 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Observaciones adicionales..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sección de Fotografías */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">📸 Fotografías del Vehículo</h3>
                <button
                  type="button"
                  onClick={() => setShowPhotoSection(!showPhotoSection)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showPhotoSection ? 'Ocultar' : 'Mostrar'} Fotos
                  <span className="text-xs">
                    ({photos.length} {photos.length === 1 ? 'foto' : 'fotos'})
                  </span>
                </button>
              </div>
              
              {showPhotoSection && (
                <PhotoGallery
                  entryId="temp-entry" // ID temporal para el modal
                  photos={photos}
                  onAddPhoto={handleAddPhoto}
                  onDeletePhoto={handleDeletePhoto}
                  onUpdatePhoto={handleUpdatePhoto}
                />
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Registrando...' : 'Registrar Ingreso'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
