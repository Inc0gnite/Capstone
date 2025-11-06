import { useState, useEffect } from 'react'
import { mechanicService, MechanicWorkload } from '../../services/mechanicService'

interface AssignMechanicModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  workOrderId: string
  workOrderNumber: string
  vehiclePlate: string
  workshopId: string
  currentMechanic?: {
    id: string
    name: string
  }
}

export function AssignMechanicModal({
  isOpen,
  onClose,
  onSuccess,
  workOrderId,
  workOrderNumber,
  vehiclePlate,
  workshopId,
  currentMechanic
}: AssignMechanicModalProps) {
  const [mechanics, setMechanics] = useState<MechanicWorkload[]>([])
  const [selectedMechanicId, setSelectedMechanicId] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMechanics, setLoadingMechanics] = useState(false)

  useEffect(() => {
    if (isOpen && workshopId) {
      loadAvailableMechanics()
    }
  }, [isOpen, workshopId])

  const loadAvailableMechanics = async () => {
    try {
      setLoadingMechanics(true)
      setError(null)
      const availableMechanics = await mechanicService.getAvailableMechanics(workshopId)
      // El backend ya filtra solo mecánicos disponibles
      setMechanics(availableMechanics)
    } catch (err: any) {
      console.error('Error cargando mecánicos:', err)
      setError(err.response?.data?.message || 'Error cargando mecánicos disponibles')
    } finally {
      setLoadingMechanics(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedMechanicId) {
      setError('Por favor selecciona un mecánico')
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (currentMechanic) {
        // Reasignar mecánico
        await mechanicService.reassignMechanicToOrder({
          workOrderId,
          mechanicId: selectedMechanicId,
          notes: notes.trim() || undefined
        })
      } else {
        // Asignar mecánico por primera vez
        await mechanicService.assignMechanicToOrder({
          workOrderId,
          mechanicId: selectedMechanicId,
          notes: notes.trim() || undefined
        })
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error asignando mecánico:', err)
      setError(err.response?.data?.message || 'Error asignando mecánico')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedMechanicId('')
    setNotes('')
    setError(null)
    onClose()
  }

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'text-red-600'
    if (workload >= 70) return 'text-orange-600'
    return 'text-green-600'
  }

  const getWorkloadText = (workload: number) => {
    if (workload >= 90) return 'Sobrecargado'
    if (workload >= 70) return 'Alta carga'
    return 'Disponible'
  }

  const isMechanicOverloaded = (mechanic: any) => {
    // Mecánico no disponible si:
    // 1. Tiene capacidad llena (8 horas)
    // 2. Tiene una orden en progreso (solo una tarea a la vez)
    return mechanic.currentHours >= mechanic.maxHours || mechanic.inProgressOrders > 0
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentMechanic ? 'Reasignar Mecánico' : 'Asignar Mecánico'}
              </h2>
              <p className="text-gray-600 mt-1">
                Orden: {workOrderNumber} - Vehículo: {vehiclePlate}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Mecánicos disponibles */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Seleccionar Mecánico
              </label>
              
              {loadingMechanics ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Cargando mecánicos...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {mechanics.map((mechanic) => (
                    <div
                      key={mechanic.mechanicId}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedMechanicId === mechanic.mechanicId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      } ${!mechanic.isAvailable || isMechanicOverloaded(mechanic) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => mechanic.isAvailable && !isMechanicOverloaded(mechanic) && setSelectedMechanicId(mechanic.mechanicId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900">
                              {mechanic.mechanicName}
                            </h3>
                            {(!mechanic.isAvailable || isMechanicOverloaded(mechanic)) && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                {mechanic.inProgressOrders > 0 
                                  ? 'Trabajando actualmente' 
                                  : mechanic.currentHours >= mechanic.maxHours 
                                  ? 'Capacidad llena' 
                                  : 'No disponible'}
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-blue-50 p-2 rounded text-center">
                                <div className="text-xs text-gray-600">En Progreso</div>
                                <div className="font-bold text-blue-600">{mechanic.inProgressOrders}</div>
                              </div>
                              <div className="bg-yellow-50 p-2 rounded text-center">
                                <div className="text-xs text-gray-600">En Cola</div>
                                <div className="font-bold text-yellow-600">{mechanic.pendingOrders}</div>
                              </div>
                              <div className="bg-gray-50 p-2 rounded text-center">
                                <div className="text-xs text-gray-600">Total</div>
                                <div className="font-bold text-gray-600">{mechanic.activeOrders}</div>
                              </div>
                            </div>
                            
                            {mechanic.inProgressOrders > 0 && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs">
                                <span className="text-blue-700 font-medium">⏳ Trabajando actualmente en una tarea</span>
                              </div>
                            )}
                            <div className="bg-gray-100 rounded-lg p-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-xs">Horas Asignadas:</span>
                                <span className="text-xs font-bold">{mechanic.currentHours}h / {mechanic.maxHours}h</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    mechanic.currentHours / mechanic.maxHours >= 0.9
                                      ? 'bg-red-500'
                                      : mechanic.currentHours / mechanic.maxHours >= 0.7
                                      ? 'bg-orange-500'
                                      : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min((mechanic.currentHours / mechanic.maxHours) * 100, 100)}%` }}
                                />
                              </div>
                              <span className={`text-xs font-medium ${getWorkloadColor((mechanic.currentHours / mechanic.maxHours) * 100)} mt-1 block`}>
                                {mechanic.currentHours >= mechanic.maxHours ? 'Lleno' : `${mechanic.maxHours - mechanic.currentHours}h disponibles`}
                              </span>
                            </div>
                          </div>
                          
                          {mechanic.specialties && mechanic.specialties.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">Especialidades: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {mechanic.specialties.map((specialty, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                  >
                                    {specialty}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          <input
                            type="radio"
                            name="mechanic"
                            value={mechanic.mechanicId}
                            checked={selectedMechanicId === mechanic.mechanicId}
                            onChange={() => setSelectedMechanicId(mechanic.mechanicId)}
                            disabled={!mechanic.isAvailable || isMechanicOverloaded(mechanic)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {mechanics.length === 0 && !loadingMechanics && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No hay mecánicos disponibles en este taller</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notas */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agregar notas sobre la asignación..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !selectedMechanicId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Asignando...' : currentMechanic ? '🔄 Reasignar' : '👨‍🔧 Asignar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
