import { useState } from 'react'
import { workOrderService, CreateWorkOrderData } from '../../services/workOrderService'

interface CreateWorkOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (workOrderId?: string) => void
  vehicleId: string
  entryId: string
  workshopId: string
  vehicleInfo: {
    plate: string
    brand: string
    model: string
    year: number
  }
  driverInfo: {
    name: string
    rut: string
  }
}

export function CreateWorkOrderModal({
  isOpen,
  onClose,
  onSuccess,
  vehicleId,
  entryId,
  workshopId,
  vehicleInfo,
  driverInfo
}: CreateWorkOrderModalProps) {
  const [formData, setFormData] = useState<CreateWorkOrderData>({
    vehicleId,
    entryId,
    workshopId,
    workType: 'revision',
    priority: 'normal',
    description: '',
    estimatedHours: 2
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔨 Creando orden de trabajo con datos:', formData)
    
    if (!formData.description.trim()) {
      setError('La descripción es obligatoria')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('📤 Enviando datos al backend:', formData)
      const workOrder = await workOrderService.create(formData)
      console.log('✅ Orden creada exitosamente:', workOrder)
      
      // Emitir evento de éxito
      window.dispatchEvent(new CustomEvent('work-order-created'))
      
      onSuccess(workOrder.id)
      onClose()
    } catch (err: any) {
      console.error('❌ Error creando orden de trabajo:', err)
      console.error('❌ Detalles del error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
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

          {/* Información del vehículo */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Información del Vehículo</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Patente:</span> {vehicleInfo.plate}
              </div>
              <div>
                <span className="font-medium">Marca/Modelo:</span> {vehicleInfo.brand} {vehicleInfo.model}
              </div>
              <div>
                <span className="font-medium">Año:</span> {vehicleInfo.year}
              </div>
              <div>
                <span className="font-medium">Conductor:</span> {driverInfo.name}
              </div>
            </div>
          </div>

          {/* Formulario */}
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
        </div>
      </div>
    </div>
  )
}
