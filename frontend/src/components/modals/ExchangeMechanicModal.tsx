import { useState, useEffect } from 'react'
import { mechanicService } from '../../services/mechanicService'
import { workOrderService } from '../../services/workOrderService'

interface Mechanic {
  id: string
  firstName: string
  lastName: string
  email: string
  currentWorkload: number
  maxWorkload: number
  currentOrders: Array<{
    id: string
    orderNumber: string
    vehiclePlate: string
    priority: string
  }>
}

interface ExchangeMechanicModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  workOrderId: string
  currentMechanicId: string
  workshopId: string
}

export function ExchangeMechanicModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  workOrderId, 
  currentMechanicId,
  workshopId 
}: ExchangeMechanicModalProps) {
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMechanics, setLoadingMechanics] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMechanicId, setSelectedMechanicId] = useState<string>('')
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null)
  const [selectedOrderToExchange, setSelectedOrderToExchange] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      loadAllMechanics()
    }
  }, [isOpen, workshopId])

  const loadAllMechanics = async () => {
    try {
      setLoadingMechanics(true)
      setError(null)
      
      // Obtener todos los mecánicos con su carga de trabajo
      const allMechanics = await mechanicService.getAllMechanicsWithWorkload(workshopId)
      
      // Filtrar el mecánico actual
      const otherMechanics = allMechanics.filter(m => m.id !== currentMechanicId)
      
      setMechanics(otherMechanics)
    } catch (err: any) {
      console.error('Error cargando mecánicos:', err)
      setError(err.response?.data?.message || 'Error cargando mecánicos')
    } finally {
      setLoadingMechanics(false)
    }
  }

  const handleMechanicSelect = (mechanicId: string) => {
    setSelectedMechanicId(mechanicId)
    const mechanic = mechanics.find(m => m.id === mechanicId)
    setSelectedMechanic(mechanic || null)
    // Resetear selección de orden al cambiar de mecánico
    setSelectedOrderToExchange('')
  }
  
  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderToExchange(orderId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedMechanicId) {
      setError('Por favor selecciona un mecánico')
      return
    }

    if (!selectedMechanic) {
      setError('Información del mecánico no válida')
      return
    }

    if (!selectedOrderToExchange) {
      setError('Por favor selecciona una orden para intercambiar')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Confirmar intercambio
      const confirmMessage = `¿Estás seguro de realizar el intercambio?\n\n` +
        `Orden actual será asignada a: ${selectedMechanic.firstName} ${selectedMechanic.lastName}\n` +
        `Orden seleccionada será asignada al mecánico actual\n\n` +
        `¿Deseas continuar con el intercambio?`

      if (!confirm(confirmMessage)) {
        return
      }

      // Realizar intercambio de tareas
      await mechanicService.exchangeMechanics({
        workOrderId,
        fromMechanicId: currentMechanicId,
        toMechanicId: selectedMechanicId,
        orderToExchangeId: selectedOrderToExchange
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error intercambiando órdenes:', err)
      setError(err.response?.data?.message || 'Error intercambiando órdenes')
    } finally {
      setLoading(false)
    }
  }

  const getWorkloadColor = (workload: number, maxWorkload: number) => {
    const percentage = (workload / maxWorkload) * 100
    if (percentage >= 100) return 'text-red-600 bg-red-100'
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'text-red-600 bg-red-100'
      case 'alta': return 'text-orange-600 bg-orange-100'
      case 'normal': return 'text-blue-600 bg-blue-100'
      case 'baja': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center">
              <span className="mr-2">🔄</span>
              Reasignar Orden de Trabajo
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del intercambio */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Reasignación de Orden</h3>
              <p className="text-sm text-blue-800">
                Selecciona un mecánico para <strong>reasignar esta orden de trabajo</strong>. 
                La orden se transferirá al mecánico seleccionado.
              </p>
            </div>

            {/* Lista de mecánicos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Seleccionar Mecánico para Reasignar
              </label>
              
              {loadingMechanics ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Cargando mecánicos...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mechanics.map((mechanic) => (
                    <div
                      key={mechanic.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedMechanicId === mechanic.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleMechanicSelect(mechanic.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-bold">
                              {mechanic.firstName.charAt(0)}{mechanic.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {mechanic.firstName} {mechanic.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{mechanic.email}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getWorkloadColor(mechanic.currentWorkload, mechanic.maxWorkload)}`}>
                            {mechanic.currentWorkload}/{mechanic.maxWorkload} tareas
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {mechanics.length === 0 && !loadingMechanics && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No hay otros mecánicos disponibles para intercambio</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Información del mecánico seleccionado y selección de orden */}
            {selectedMechanic && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  📋 Seleccionar Orden para Intercambiar
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mecánico: {selectedMechanic.firstName} {selectedMechanic.lastName}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkloadColor(selectedMechanic.currentWorkload, selectedMechanic.maxWorkload)}`}>
                      {selectedMechanic.currentWorkload}/{selectedMechanic.maxWorkload} tareas
                    </span>
                  </div>

                  {selectedMechanic.currentOrders.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Selecciona una orden para intercambiar:</p>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedMechanic.currentOrders.map((order) => (
                          <div 
                            key={order.id} 
                            onClick={() => handleOrderSelect(order.id)}
                            className={`bg-white border-2 rounded-lg p-3 cursor-pointer transition-all ${
                              selectedOrderToExchange === order.id
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm text-gray-900">{order.orderNumber}</p>
                                <p className="text-xs text-gray-600">{order.vehiclePlate}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                                  {order.priority}
                                </span>
                                {selectedOrderToExchange === order.id && (
                                  <span className="text-orange-600">✓</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">Este mecánico no tiene órdenes asignadas para intercambiar</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !selectedMechanicId || !selectedOrderToExchange}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '🔄 Intercambiando...' : '🔄 Confirmar Intercambio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
