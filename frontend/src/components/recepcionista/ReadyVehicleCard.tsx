import { useState, useEffect } from 'react'
import { vehicleEntryService } from '../../services/vehicleEntryService'
import { workOrderService } from '../../services/workOrderService'

interface ReadyVehicleCardProps {
  vehicle: {
    id: string
    plate: string
    driverName: string
    driverRut: string
    phone?: string
    completedAt: string
    workOrder: {
      id: string
      orderNumber: string
      completedAt: string
    }
  }
  onExitRegistered: () => void
}

export function ReadyVehicleCard({ vehicle, onExitRegistered }: ReadyVehicleCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMarkedAsReady, setIsMarkedAsReady] = useState(false)
  const [orderDetails, setOrderDetails] = useState<any>(null)

  // Cargar detalles de la orden al montar el componente
  useEffect(() => {
    loadOrderDetails()
  }, [vehicle.workOrder.id])

  const loadOrderDetails = async () => {
    try {
      const order = await workOrderService.getById(vehicle.workOrder.id)
      setOrderDetails(order)
      
      // Verificar si ya fue marcada como lista por el recepcionista
      const isMarked = order.observations?.includes('Orden marcada como lista por recepcionista') || 
                      order.observations?.includes('marcada como lista')
      setIsMarkedAsReady(isMarked)
    } catch (err) {
      console.error('Error cargando detalles de la orden:', err)
    }
  }

  const handleMarkOrderReady = async () => {
    if (isMarkedAsReady) {
      // Si ya está marcada como lista, cancelar
      if (!confirm('¿Está seguro de cancelar el estado de lista de esta orden?')) {
        return
      }
      
      try {
        setLoading(true)
        setError(null)
        
        // Actualizar observaciones para remover la marca de lista
        const updatedObservations = orderDetails.observations
          ?.replace('Orden marcada como lista por recepcionista', '')
          ?.replace('marcada como lista', '')
          ?.trim() || ''
        
        await workOrderService.update(vehicle.workOrder.id, {
          observations: updatedObservations
        })
        
        // Actualizar estado local
        setIsMarkedAsReady(false)
        
        // Recargar detalles de la orden
        await loadOrderDetails()
        
        // Mostrar mensaje de confirmación
        alert('✅ Orden cancelada exitosamente. El vehículo permanecerá en la lista hasta que se marque como lista nuevamente.')
        
        // Emitir evento para actualizar otros dashboards
        window.dispatchEvent(new CustomEvent('order-marked-ready', { detail: vehicle }))
        
      } catch (err: any) {
        console.error('Error cancelando orden como lista:', err)
        setError(err.response?.data?.message || 'Error cancelando orden como lista')
      } finally {
        setLoading(false)
      }
    } else {
      // Si no está marcada como lista, marcarla
      if (!confirm('¿Está seguro de marcar esta orden como lista para salida?')) {
        return
      }
      
      try {
        setLoading(true)
        setError(null)
        
        // Agregar observación de que fue marcada como lista por recepcionista
        const currentObservations = orderDetails.observations || ''
        const newObservations = currentObservations 
          ? `${currentObservations}\nOrden marcada como lista por recepcionista`
          : 'Orden marcada como lista por recepcionista'
        
        await workOrderService.update(vehicle.workOrder.id, {
          observations: newObservations
        })
        
        // Actualizar estado local
        setIsMarkedAsReady(true)
        
        // Mostrar mensaje de confirmación
        alert('✅ Orden marcada como lista exitosamente. El vehículo está listo para salida.')
        
        // Emitir evento de éxito para actualizar otros dashboards
        window.dispatchEvent(new CustomEvent('order-marked-ready', { detail: vehicle }))
        
        // El vehículo ya no está "listo" para el recepcionista, debe desaparecer de su dashboard
        // Esto hará que el vehículo desaparezca inmediatamente del dashboard del recepcionista
        onExitRegistered()
      } catch (err: any) {
        console.error('Error marcando orden como lista:', err)
        setError(err.response?.data?.message || 'Error marcando orden como lista')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCallDriver = () => {
    if (vehicle.phone) {
      window.open(`tel:${vehicle.phone}`, '_self')
    }
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <p className="font-bold text-gray-900 text-xl">{vehicle.plate}</p>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
              ✅ Listo
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700 mb-2">
            <div>
              <span className="font-medium">Conductor:</span> {vehicle.driverName}
            </div>
            <div>
              <span className="font-medium">RUT:</span> {vehicle.driverRut}
            </div>
            {vehicle.phone && (
              <div>
                <span className="font-medium">Teléfono:</span> 
                <button
                  onClick={handleCallDriver}
                  className="ml-1 text-blue-600 hover:text-blue-800 underline"
                >
                  {vehicle.phone}
                </button>
              </div>
            )}
            <div>
              <span className="font-medium">Orden:</span> {vehicle.workOrder.orderNumber}
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Completado: {vehicle.completedAt}
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 ml-4">
          <button
            onClick={handleMarkOrderReady}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isMarkedAsReady 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading 
              ? (isMarkedAsReady ? '⏳ Cancelando...' : '⏳ Marcando...') 
              : (isMarkedAsReady ? '❌ Cancelar' : '✅ Marcar Orden Lista')
            }
          </button>
          
          {vehicle.phone && (
            <button
              onClick={handleCallDriver}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium text-sm transition-colors"
            >
              📞 Llamar
            </button>
          )}
          
          <button
            onClick={() => window.location.href = `/work-orders/${vehicle.workOrder.id}`}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm transition-colors"
          >
            👁️ Ver Orden
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
