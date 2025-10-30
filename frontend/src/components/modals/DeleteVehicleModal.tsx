import { useState, useEffect } from 'react'
import { vehicleService } from '../../services/vehicleService'
import { vehicleEntryService } from '../../services/vehicleEntryService'

interface DeleteVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  vehicle: {
    id: string
    licensePlate: string
    brand: string
    model?: string
    year: number
  } | null
}

export function DeleteVehicleModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  vehicle 
}: DeleteVehicleModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [vehicleStatus, setVehicleStatus] = useState<{
    hasActiveEntries: boolean
    activeEntries: any[]
    canDelete: boolean
    reason?: string
  } | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)

  const expectedText = 'ELIMINAR'

  // Verificar estado del vehículo al abrir el modal
  useEffect(() => {
    if (isOpen && vehicle) {
      checkVehicleStatus()
    }
  }, [isOpen, vehicle])

  const checkVehicleStatus = async () => {
    if (!vehicle) return
    
    try {
      setCheckingStatus(true)
      setError(null)
      
      // Obtener todos los ingresos del vehículo
      const entries = await vehicleEntryService.getAll()
      const vehicleEntries = entries.data.filter((entry: any) => 
        entry.vehicleId === vehicle.id
      )
      
      // Filtrar ingresos activos
      const activeEntries = vehicleEntries.filter((entry: any) => 
        entry.status === 'ingresado'
      )
      
      const hasActiveEntries = activeEntries.length > 0
      const canDelete = !hasActiveEntries
      
      let reason = ''
      if (hasActiveEntries) {
        reason = `El vehículo tiene ${activeEntries.length} ingreso(s) activo(s) en mantenimiento. Debe registrar la salida antes de eliminar.`
      }
      
      setVehicleStatus({
        hasActiveEntries,
        activeEntries,
        canDelete,
        reason
      })
      
    } catch (err: any) {
      console.error('Error verificando estado del vehículo:', err)
      setError('Error verificando el estado del vehículo')
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleDelete = async () => {
    if (!vehicle) return
    
    // Verificar si el vehículo se puede eliminar
    if (vehicleStatus && !vehicleStatus.canDelete) {
      setError(vehicleStatus.reason || 'No se puede eliminar el vehículo en este momento')
      return
    }
    
    if (confirmText !== expectedText) {
      setError('Debe escribir "ELIMINAR" para confirmar la eliminación')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      await vehicleService.delete(vehicle.id)
      
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error eliminando vehículo:', err)
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error eliminando vehículo'
      
      if (err.response?.status === 500) {
        const serverMessage = err.response?.data?.message
        if (serverMessage?.includes('ingresos activos')) {
          errorMessage = 'No se puede eliminar el vehículo porque tiene ingresos activos. Primero debe registrar la salida de todos los ingresos desde el dashboard del guardia.'
        } else if (serverMessage?.includes('no encontrado')) {
          errorMessage = 'El vehículo no fue encontrado en la base de datos.'
        } else {
          errorMessage = `Error del servidor: ${serverMessage || 'Error interno del servidor'}`
        }
      } else if (err.response?.status === 403) {
        errorMessage = 'No tiene permisos para eliminar vehículos. Solo los administradores pueden realizar esta acción.'
      } else if (err.response?.status === 404) {
        errorMessage = 'El vehículo no fue encontrado.'
      } else {
        errorMessage = err.response?.data?.message || 'Error desconocido al eliminar el vehículo'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setConfirmText('')
    setError(null)
    setVehicleStatus(null)
    onClose()
  }

  if (!isOpen || !vehicle) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-red-500 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center">
              <span className="mr-2">🗑️</span>
              Eliminar Vehículo
            </h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Estado del vehículo */}
          {checkingStatus && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Verificando estado del vehículo...
              </div>
            </div>
          )}

          {vehicleStatus && !vehicleStatus.canDelete && (
            <div className="mb-4 p-4 bg-orange-100 border border-orange-400 text-orange-800 rounded-lg">
              <div className="flex items-start">
                <span className="text-orange-600 mr-2">⚠️</span>
                <div>
                  <h4 className="font-semibold mb-2">No se puede eliminar el vehículo</h4>
                  <p className="text-sm mb-2">{vehicleStatus.reason}</p>
                  {vehicleStatus.activeEntries.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Ingresos activos:</p>
                      <ul className="text-xs space-y-1">
                        {vehicleStatus.activeEntries.map((entry: any, index: number) => (
                          <li key={index} className="bg-orange-50 p-2 rounded">
                            <strong>Código:</strong> {entry.entryCode} | 
                            <strong> Conductor:</strong> {entry.driverName} | 
                            <strong> Fecha:</strong> {new Date(entry.entryDate).toLocaleDateString()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs mt-2 text-orange-700">
                    <strong>Solución:</strong> Vaya al dashboard del guardia y registre la salida de estos ingresos.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-red-900 mb-2">⚠️ Advertencia</h3>
              <p className="text-sm text-red-800">
                Esta acción eliminará <strong>permanentemente</strong> el vehículo y todos sus datos relacionados:
              </p>
              <ul className="text-sm text-red-800 mt-2 ml-4 list-disc">
                <li>Historial de ingresos</li>
                <li>Órdenes de trabajo</li>
                <li>Fotos y documentos</li>
                <li>Control de llaves</li>
                <li>Estados y pausas</li>
              </ul>
              <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                <p className="text-xs text-yellow-800">
                  <strong>Nota:</strong> Si el vehículo tiene ingresos activos, no se podrá eliminar. 
                  Primero debe registrar la salida desde el dashboard del guardia.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Vehículo a eliminar:</h3>
              <div className="text-sm text-gray-700">
                <p><strong>Patente:</strong> {vehicle.licensePlate}</p>
                <p><strong>Marca:</strong> {vehicle.brand}</p>
                <p><strong>Modelo:</strong> {vehicle.model || 'N/A'}</p>
                <p><strong>Año:</strong> {vehicle.year}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Para confirmar, escriba <strong>ELIMINAR</strong>:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Escriba ELIMINAR para confirmar"
              disabled={loading || (vehicleStatus && !vehicleStatus.canDelete)}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || confirmText !== expectedText || (vehicleStatus && !vehicleStatus.canDelete)}
              className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                vehicleStatus && !vehicleStatus.canDelete
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {loading ? '🗑️ Eliminando...' : 
               (vehicleStatus && !vehicleStatus.canDelete) ? '🚫 No se puede eliminar' : 
               '🗑️ Eliminar Permanentemente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

