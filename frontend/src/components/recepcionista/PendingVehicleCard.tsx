import { useState } from 'react'
import { CreateWorkOrderModal } from '../modals/CreateWorkOrderModal'
import { AssignMechanicModal } from '../modals/AssignMechanicModal'
import { vehicleEntryService, VehicleEntry } from '../../services/vehicleEntryService'
import { vehicleService, Vehicle } from '../../services/vehicleService'

interface PendingVehicleCardProps {
  vehicle: {
    id: string
    entryCode: string
    plate: string
    driverName: string
    driverRut: string
    entryTime: string
    issue?: string
    vehicle: {
      id: string
      plate: string
      brand: string
      model: string
      year: number
    }
    entry: {
      id: string
      entryCode: string
      entryDate: string
      status: string
      workshopId?: string
    }
  }
  onCreateOrder: () => void
  workshopId?: string
}

export function PendingVehicleCard({ vehicle, onCreateOrder, workshopId }: PendingVehicleCardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [createdWorkOrderId, setCreatedWorkOrderId] = useState<string | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [entryDetails, setEntryDetails] = useState<VehicleEntry | null>(null)
  const [vehicleDetails, setVehicleDetails] = useState<Vehicle | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const handleCreateOrder = () => {
    setShowCreateModal(true)
  }

  const handleOrderCreated = (workOrderId?: string) => {
    setShowCreateModal(false)
    if (workOrderId) {
      setCreatedWorkOrderId(workOrderId)
      setShowAssignModal(true)
    } else {
      onCreateOrder()
    }
  }

  const handleMechanicAssigned = () => {
    setShowAssignModal(false)
    setCreatedWorkOrderId(null)
    onCreateOrder()
  }

  const handleShowDetails = async () => {
    setShowDetailsModal(true)
    setLoadingDetails(true)
    
    try {
      // Cargar detalles del ingreso
      const entryData = await vehicleEntryService.getById(vehicle.entry.id)
      setEntryDetails(entryData)
      
      // Cargar detalles del vehículo si está disponible
      if (entryData.vehicleId) {
        try {
          const vehicleData = await vehicleService.getById(entryData.vehicleId)
          setVehicleDetails(vehicleData)
        } catch (vehicleError) {
          console.warn('⚠️ No se pudo cargar información del vehículo:', vehicleError)
        }
      }
    } catch (error) {
      console.error('❌ Error cargando detalles del ingreso:', error)
      alert('Error al cargar los detalles del ingreso')
    } finally {
      setLoadingDetails(false)
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

  return (
    <>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors space-y-3 sm:space-y-0">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <p className="font-bold text-gray-900 text-lg">{vehicle.plate}</p>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {vehicle.entryCode}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
            <div>
              <span className="font-medium">Conductor:</span> {vehicle.driverName}
            </div>
            <div>
              <span className="font-medium">RUT:</span> {vehicle.driverRut}
            </div>
            <div>
              <span className="font-medium">Motivo:</span> {vehicle.issue || 'Revisión general'}
            </div>
            <div>
              <span className="font-medium">Ingreso:</span> {vehicle.entryTime}
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            {vehicle.vehicle.brand} {vehicle.vehicle.model} ({vehicle.vehicle.year})
          </div>
        </div>
        
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:ml-4">
          <button
            onClick={handleCreateOrder}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
          >
            🔨 Crear Orden
          </button>
          
          <button
            onClick={handleShowDetails}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm transition-colors"
          >
            👁️ Ver Detalles
          </button>
        </div>
      </div>

      {/* Modal para crear orden de trabajo */}
      <CreateWorkOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleOrderCreated}
        vehicleId={vehicle.vehicle.id}
        entryId={vehicle.entry.id}
        workshopId={vehicle.entry.workshopId || workshopId || ''}
        vehicleInfo={{
          plate: vehicle.vehicle.plate,
          brand: vehicle.vehicle.brand,
          model: vehicle.vehicle.model,
          year: vehicle.vehicle.year
        }}
        driverInfo={{
          name: vehicle.driverName,
          rut: vehicle.driverRut
        }}
      />

      {/* Modal para asignar mecánico */}
      {createdWorkOrderId && workshopId && (
        <AssignMechanicModal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false)
            setCreatedWorkOrderId(null)
          }}
          onSuccess={handleMechanicAssigned}
          workOrderId={createdWorkOrderId}
          workOrderNumber={`OT-${createdWorkOrderId.slice(-6)}`}
          vehiclePlate={vehicle.vehicle.plate}
          workshopId={workshopId}
        />
      )}

      {/* Modal de detalles del ingreso */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Detalles del Ingreso</h2>
                  <p className="text-gray-600">Código: {vehicle.entryCode}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {loadingDetails ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Cargando detalles...</span>
                </div>
              ) : entryDetails ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Información del Ingreso */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Ingreso</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Código:</span>
                          <span className="text-gray-900 font-mono">{entryDetails.entryCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Estado:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusConfig(entryDetails.status).bgColor} ${getStatusConfig(entryDetails.status).color}`}>
                            {getStatusConfig(entryDetails.status).label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Fecha:</span>
                          <span className="text-gray-900">{formatDate(entryDetails.entryDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Hora:</span>
                          <span className="text-gray-900">{formatTime(entryDetails.entryDate)}</span>
                        </div>
                        {entryDetails.exitDate && (
                          <>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Salida:</span>
                              <span className="text-gray-900">{formatDate(entryDetails.exitDate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Hora Salida:</span>
                              <span className="text-gray-900">{formatTime(entryDetails.exitDate)}</span>
                            </div>
                          </>
                        )}
                        {entryDetails.observations && (
                          <div className="mt-3">
                            <span className="font-medium text-gray-700">Observaciones:</span>
                            <p className="text-gray-900 mt-1 text-sm">{entryDetails.observations}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información del Conductor */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Conductor</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Nombre:</span>
                          <span className="text-gray-900">{entryDetails.driverName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">RUT:</span>
                          <span className="text-gray-900">{entryDetails.driverRut}</span>
                        </div>
                        {entryDetails.driverPhone && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Teléfono:</span>
                            <span className="text-gray-900">{entryDetails.driverPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Información del Vehículo */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Vehículo</h3>
                      {vehicleDetails ? (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Patente:</span>
                            <span className="text-gray-900 font-mono">{vehicleDetails.licensePlate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Marca:</span>
                            <span className="text-gray-900">{vehicleDetails.brand}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Modelo:</span>
                            <span className="text-gray-900">{vehicleDetails.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Año:</span>
                            <span className="text-gray-900">{vehicleDetails.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Color:</span>
                            <span className="text-gray-900">{vehicleDetails.color || 'No especificado'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p>Información del vehículo no disponible</p>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Acciones</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setShowDetailsModal(false)
                            handleCreateOrder()
                          }}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                          <span>🔨</span>
                          <span>Crear Orden de Trabajo</span>
                        </button>
                        
                        {entryDetails.status === 'activo' && (
                          <button
                            onClick={() => {
                              setShowDetailsModal(false)
                              // Aquí podrías agregar lógica para registrar salida
                              alert('Función de registrar salida disponible')
                            }}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center space-x-2"
                          >
                            <span>🚪</span>
                            <span>Registrar Salida</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No se pudieron cargar los detalles del ingreso</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
