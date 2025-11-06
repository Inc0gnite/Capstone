import { useState, useEffect } from 'react'
import { workOrderService, CreateWorkOrderData } from '../../services/workOrderService'
import { vehicleEntryService } from '../../services/vehicleEntryService'

interface CreateWorkOrderFromVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateWorkOrderFromVehicleModal({
  isOpen,
  onClose,
  onSuccess
}: CreateWorkOrderFromVehicleModalProps) {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [formData, setFormData] = useState<CreateWorkOrderData>({
    vehicleId: '',
    entryId: '',
    workshopId: '',
    workType: 'revision',
    priority: 'normal',
    description: '',
    estimatedHours: 2
  })
  const [loading, setLoading] = useState(false)
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadVehiclesWithoutOrder()
    }
  }, [isOpen])

  const loadVehiclesWithoutOrder = async () => {
    try {
      setLoadingVehicles(true)
      const response = await vehicleEntryService.getAll()
      // Filtrar vehículos que están dentro del taller (ingresados y sin salida)
      const vehiclesInWorkshop = response.data.filter((entry: any) => {
        // Debe estar ingresado (status: 'ingresado') y no tener fecha de salida
        const isInsideWorkshop = entry.status === 'ingresado' && !entry.exitDate
        // Y no debe tener órdenes de trabajo asociadas
        const hasNoWorkOrders = !entry.workOrders || entry.workOrders.length === 0
        return isInsideWorkshop && hasNoWorkOrders
      })
      setVehicles(vehiclesInWorkshop)
    } catch (error) {
      console.error('Error cargando vehículos:', error)
      setError('Error al cargar vehículos disponibles')
    } finally {
      setLoadingVehicles(false)
    }
  }

  const handleVehicleSelect = (vehicle: any) => {
    setSelectedVehicle(vehicle)
    setFormData(prev => ({
      ...prev,
      vehicleId: vehicle.vehicleId,
      entryId: vehicle.id,
      workshopId: vehicle.workshopId
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedVehicle) {
      setError('Debes seleccionar un vehículo')
      return
    }
    
    if (!formData.description.trim()) {
      setError('La descripción es obligatoria')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      await workOrderService.create(formData)
      
      // Emitir evento de éxito
      window.dispatchEvent(new CustomEvent('work-order-created'))
      
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error creando orden de trabajo:', err)
      setError(err.response?.data?.message || 'Error creando orden de trabajo')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimatedHours' ? parseInt(value) || 0 : value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Crear Orden de Trabajo
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Selección de vehículo */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Seleccionar Vehículo
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Solo se muestran vehículos que están dentro del taller y no tienen órdenes de trabajo
            </p>
            
            {loadingVehicles ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Cargando vehículos...</p>
              </div>
            ) : vehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => handleVehicleSelect(vehicle)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedVehicle?.id === vehicle.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{vehicle.vehicle?.licensePlate}</h4>
                      <span className="text-sm text-gray-500">#{vehicle.entryCode}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>Marca/Modelo:</strong> {vehicle.vehicle?.brand} {vehicle.vehicle?.model}</p>
                      <p><strong>Conductor:</strong> {vehicle.driverName}</p>
                      <p><strong>Ingreso:</strong> {new Date(vehicle.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🏭</div>
                <p className="text-lg font-medium mb-2">No hay vehículos dentro del taller</p>
                <p className="text-sm">Los vehículos deben estar ingresados y sin órdenes de trabajo para aparecer aquí</p>
              </div>
            )}
          </div>

          {/* Información del vehículo seleccionado */}
          {selectedVehicle && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Vehículo Seleccionado</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Patente:</span> {selectedVehicle.vehicle?.licensePlate}
                </div>
                <div>
                  <span className="font-medium">Marca/Modelo:</span> {selectedVehicle.vehicle?.brand} {selectedVehicle.vehicle?.model}
                </div>
                <div>
                  <span className="font-medium">Año:</span> {selectedVehicle.vehicle?.year}
                </div>
                <div>
                  <span className="font-medium">Conductor:</span> {selectedVehicle.driverName}
                </div>
              </div>
            </div>
          )}

          {/* Formulario */}
          {selectedVehicle && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de trabajo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Trabajo *
                </label>
                <select
                  name="workType"
                  value={formData.workType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="revision">Revisión General</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="reparacion">Reparación</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="baja">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Trabajo *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe el trabajo a realizar..."
                  required
                />
              </div>

              {/* Horas estimadas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horas Estimadas
                </label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleChange}
                  min="1"
                  max="24"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creando...' : 'Crear Orden'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


