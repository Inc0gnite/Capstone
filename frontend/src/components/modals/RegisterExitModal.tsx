import { useState } from 'react'
import { vehicleEntryService } from '../../services/vehicleEntryService'
import { useAuthStore } from '../../store/authStore'
import type { VehicleEntry } from '../../../../shared/types'

interface RegisterExitModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  entry: VehicleEntry | null
}

export function RegisterExitModal({ isOpen, onClose, onSuccess, entry }: RegisterExitModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    exitKm: '',
    observations: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.exitKm || !entry) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    // Validar que el KM de salida sea mayor al de entrada
    if (parseInt(formData.exitKm) <= entry.entryKm) {
      alert(`El kilometraje de salida (${formData.exitKm}) debe ser mayor al de entrada (${entry.entryKm})`)
      return
    }

    try {
      setLoading(true)
      console.log('🚗 Registrando salida para:', entry.entryCode)
      console.log('📊 Datos de salida:', {
        entryKm: entry.entryKm,
        exitKm: parseInt(formData.exitKm),
        observations: formData.observations
      })

      const updatedEntry = await vehicleEntryService.registerExit(entry.id, {
        exitKm: parseInt(formData.exitKm),
        observations: formData.observations || undefined
      })
      
      console.log('✅ Salida registrada exitosamente:', updatedEntry)
      
      // Obtener información del guardia actual
      const { user } = useAuthStore.getState()
      const guardName = user ? `${user.firstName} ${user.lastName}` : 'Sistema'
      
      // Emitir evento para actualizar estadísticas
      window.dispatchEvent(new CustomEvent('exit-registered', { 
        detail: { entry: updatedEntry } 
      }))
      
      // Emitir evento específico para notificaciones del recepcionista
      window.dispatchEvent(new CustomEvent('vehicle-exit-registered', {
        detail: {
          vehicle: {
            licensePlate: entry.vehicle.licensePlate,
            driverName: entry.driverName,
            driverRut: entry.driverRut
          },
          guardName: guardName
        }
      }))
      
      // Mostrar mensaje de éxito
      alert(`Salida registrada exitosamente para ${entry.entryCode}`)
      
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      console.error('❌ Error registrando salida:', error)
      
      // Manejar diferentes tipos de errores con mensajes específicos
      let errorMessage = 'Error al registrar la salida'
      
      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message
        
        if (backendMessage.includes('Esperando orden')) {
          errorMessage = '⏳ Esperando orden: El recepcionista debe marcar la orden como lista antes de registrar la salida'
        } else if (backendMessage.includes('ya tiene registrada una salida')) {
          errorMessage = '❌ Este vehículo ya tiene registrada una salida'
        } else {
          errorMessage = backendMessage
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      exitKm: '',
      observations: ''
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen || !entry) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Registrar Salida de Vehículo
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
          
          {/* Información del Ingreso */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">📋 Información del Ingreso</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">🚗 Vehículo:</span>
                <span className="ml-2 font-medium">{entry.entryCode}</span>
              </div>
              <div>
                <span className="text-gray-600">👤 Conductor:</span>
                <span className="ml-2 font-medium">{entry.driverName}</span>
              </div>
              <div>
                <span className="text-gray-600">🆔 Código:</span>
                <span className="ml-2 font-medium">{entry.entryCode}</span>
              </div>
              <div>
                <span className="text-gray-600">📅 Fecha Ingreso:</span>
                <span className="ml-2 font-medium">
                  {new Date(entry.entryDate).toLocaleDateString('es-CL')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">KM Ingreso:</span>
                <span className="ml-2 font-medium">{entry.entryKm.toLocaleString()} km</span>
              </div>
              <div>
                <span className="text-gray-600">Combustible:</span>
                <span className="ml-2 font-medium">
                  {entry.fuelLevel === 'full' ? 'Lleno' :
                   entry.fuelLevel === 'half' ? 'Medio' : 'Bajo'}
                </span>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kilometraje de Salida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🚗 Kilometraje de Salida *
              </label>
              <input
                id="exitKm"
                name="exitKm"
                type="number"
                value={formData.exitKm}
                onChange={(e) => setFormData({ ...formData, exitKm: e.target.value })}
                placeholder={`${entry.entryKm + 100}`}
                min={entry.entryKm + 1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>KM de entrada:</strong> {entry.entryKm.toLocaleString()} km
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  El KM de salida debe ser mayor al de entrada
                </p>
              </div>
            </div>

            {/* Información sobre hora automática */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>🕐 Hora de salida:</strong> Se registrará automáticamente la hora actual del sistema
              </p>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 Observaciones (Opcional)
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Observaciones sobre la salida del vehículo (estado, entregas, etc.)..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                ❌ Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !formData.exitKm}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    <span>Registrar Salida</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
