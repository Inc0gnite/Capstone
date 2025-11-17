import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MainLayout } from '../components/Layout/MainLayout'
import { vehicleEntryService, VehicleEntry } from '../services/vehicleEntryService'
import { vehicleService, Vehicle } from '../services/vehicleService'
import { DocumentUpload } from '../components/DocumentUpload'

export default function EntryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [entry, setEntry] = useState<VehicleEntry | null>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDocuments, setShowDocuments] = useState(false)

  useEffect(() => {
    if (id) {
      loadEntry()
    }
  }, [id])

  const loadEntry = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Cargando detalles del ingreso:', id)
      const entryData = await vehicleEntryService.getById(id)
      console.log('✅ Ingreso cargado:', entryData)
      setEntry(entryData)

      // Cargar información del vehículo si está disponible
      if (entryData.vehicleId) {
        try {
          const vehicleData = await vehicleService.getById(entryData.vehicleId)
          setVehicle(vehicleData)
        } catch (vehicleError) {
          console.warn('⚠️ No se pudo cargar información del vehículo:', vehicleError)
        }
      }
    } catch (err: any) {
      console.error('❌ Error cargando detalles del ingreso:', err)
      setError(err.response?.data?.message || 'Error cargando detalles del ingreso')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bgColor: string }> = {
      activo: {
        label: 'Activo',
        color: 'text-green-800',
        bgColor: 'bg-green-100'
      },
      completado: {
        label: 'Completado',
        color: 'text-blue-800',
        bgColor: 'bg-blue-100'
      },
      cancelado: {
        label: 'Cancelado',
        color: 'text-red-800',
        bgColor: 'bg-red-100'
      }
    }
    return configs[status] || { label: status, color: 'text-gray-800', bgColor: 'bg-gray-100' }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 text-lg">Cargando detalles del ingreso...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <p className="text-lg">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!entry) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center text-gray-600">
            <p className="text-lg">Ingreso no encontrado.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const statusConfig = getStatusConfig(entry.status)

  return (
    <MainLayout>
      <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalles del Ingreso</h1>
            <p className="text-gray-600">Código: {entry.entryCode}</p>
          </div>
          <button
            onClick={() => navigate('/entries')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            ← Volver a Ingresos
          </button>
        </div>

        {/* Información Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del Ingreso */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Principal */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Información del Ingreso</h3>
                  <p className="text-gray-600">Detalles principales del ingreso del vehículo</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Estado</div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código de Ingreso</label>
                    <p className="text-gray-900 font-mono text-lg">{entry.entryCode}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso</label>
                    <p className="text-gray-900">{formatDate(entry.entryDate)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Ingreso</label>
                    <p className="text-gray-900">{formatTime(entry.entryDate)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {entry.exitDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Salida</label>
                      <p className="text-gray-900">{formatDate(entry.exitDate)}</p>
                    </div>
                  )}

                  {entry.exitDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Salida</label>
                      <p className="text-gray-900">{formatTime(entry.exitDate)}</p>
                    </div>
                  )}

                  {entry.observations && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                      <p className="text-gray-900">{entry.observations}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información del Conductor */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Información del Conductor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <p className="text-gray-900">{entry.driverName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                  <p className="text-gray-900">{entry.driverRut}</p>
                </div>
                {entry.driverPhone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <p className="text-gray-900">{entry.driverPhone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Documentos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="mr-2 text-xl">📄</span>
                  Documentos
                </h3>
                <button
                  onClick={() => setShowDocuments(!showDocuments)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm flex items-center space-x-2"
                >
                  <span>{showDocuments ? '👁️ Ocultar' : '👁️ Ver'}</span>
                  <span>Documentos</span>
                </button>
              </div>
              
              {showDocuments && (
                <div className="mt-4">
                  <DocumentUpload
                    relatedTo="vehicle-entry"
                    relatedId={entry.id}
                    onDocumentUploaded={(doc) => {
                      console.log('Documento subido:', doc)
                    }}
                    onDocumentDeleted={(docId) => {
                      console.log('Documento eliminado:', docId)
                    }}
                  />
                </div>
              )}
              
              {!showDocuments && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">Haz clic en "Ver Documentos" para gestionar los documentos del ingreso</p>
                </div>
              )}
            </div>

            {/* Fotos del Vehículo */}
            {entry.photos && entry.photos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2 text-xl sm:text-2xl">📸</span>
                  Fotografías del Vehículo ({entry.photos.length})
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {entry.photos.map((photoUrl, index) => {
                    const isImage = /\.(jpe?g|png|gif|webp)$/i.test(new URL(photoUrl).pathname)
                    if (!isImage) {
                      return (
                        <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                          <p className="font-semibold">Archivo no soportado</p>
                          <p className="text-xs mt-1 break-words">
                            Solo se admiten imágenes (jpg, png, gif, webp). Este archivo fue omitido.
                          </p>
                        </div>
                      )
                    }
                    return (
                      <div 
                        key={index} 
                        className="relative group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          window.open(photoUrl, '_blank')
                        }}
                      >
                        <img
                          src={photoUrl}
                          alt={`Foto del vehículo ${index + 1}`}
                          className="w-full h-32 sm:h-40 md:h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium">
                            👁️ Ver
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                          <p className="text-white text-xs">Foto {index + 1}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Información del Vehículo */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Información del Vehículo</h3>
              {vehicle ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patente</label>
                    <p className="text-gray-900 font-mono text-lg">{vehicle.licensePlate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                    <p className="text-gray-900">{vehicle.brand}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                    <p className="text-gray-900">{vehicle.model}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                    <p className="text-gray-900">{vehicle.year}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <p className="text-gray-900">{vehicle.color || 'No especificado'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>Información del vehículo no disponible</p>
                </div>
              )}
            </div>

            {/* Acciones Rápidas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/entries')}
                  className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <span>📋</span>
                  <span>Ver Todos los Ingresos</span>
                </button>

                {entry.status === 'activo' && (
                  <button
                    onClick={() => navigate(`/entries?action=exit&vehicleId=${entry.vehicleId}`)}
                    className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>🚪</span>
                    <span>Registrar Salida</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}





