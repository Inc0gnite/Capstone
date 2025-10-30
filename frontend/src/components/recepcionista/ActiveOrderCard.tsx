import { useState } from 'react'
import { WorkOrder } from '../../services/workOrderService'
import { AssignMechanicModal } from '../modals/AssignMechanicModal'
import { ExchangeMechanicModal } from '../modals/ExchangeMechanicModal'
import { MechanicInfoDropdown } from '../mechanic/MechanicInfoDropdown'
import { WordService } from '../../services/wordService'

interface ActiveOrderCardProps {
  order: WorkOrder
  onUpdate: () => void
  workshopId?: string
  showQuickActions?: boolean
}

export function ActiveOrderCard({ order, onUpdate, workshopId, showQuickActions = true }: ActiveOrderCardProps) {
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showExchangeModal, setShowExchangeModal] = useState(false)
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bgColor: string }> = {
      en_progreso: { 
        label: 'En Progreso', 
        color: 'text-blue-800', 
        bgColor: 'bg-blue-100' 
      },
      pausado: { 
        label: 'Pausado', 
        color: 'text-orange-800', 
        bgColor: 'bg-orange-100' 
      },
      pendiente: { 
        label: 'Pendiente', 
        color: 'text-gray-800', 
        bgColor: 'bg-gray-100' 
      },
      completado: { 
        label: 'Completado', 
        color: 'text-green-800', 
        bgColor: 'bg-green-100' 
      },
      cancelado: { 
        label: 'Cancelada', 
        color: 'text-red-800', 
        bgColor: 'bg-red-100' 
      }
    }
    return configs[status] || configs.pendiente
  }

  const statusConfig = getStatusConfig(order.currentStatus)

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

  const handleAssignMechanic = () => {
    setShowAssignModal(true)
  }

  const handleMechanicAssigned = () => {
    setShowAssignModal(false)
    onUpdate()
  }

  const handleExportWord = async () => {
    await WordService.generateWorkOrderWord(order)
  }

  // Función para calcular el progreso basado en el estado de la orden
  const getProgressFromStatus = (status: string): number => {
    switch (status) {
      case 'pendiente':
        return 0
      case 'en_progreso':
        return 50
      case 'pausado':
        return 25
      case 'completado':
        return 100
      case 'cancelado':
        return 0
      default:
        return 0
    }
  }

  // Función para obtener el color de la barra de progreso según el estado
  const getProgressColor = (status: string): string => {
    switch (status) {
      case 'pendiente':
        return 'bg-gray-400'
      case 'en_progreso':
        return 'bg-gradient-to-r from-blue-500 to-blue-600'
      case 'pausado':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500'
      case 'completado':
        return 'bg-gradient-to-r from-green-500 to-green-600'
      case 'cancelado':
        return 'bg-gradient-to-r from-red-500 to-red-600'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <p className="font-bold text-gray-900 text-lg">{order.orderNumber}</p>
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
            <div>
              <span className="font-medium">Vehículo:</span> {order.vehicle?.licensePlate || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Mecánico:</span> {order.assignedTo ? `${order.assignedTo.firstName} ${order.assignedTo.lastName}` : 'Sin asignar'}
            </div>
            <div>
              <span className="font-medium">Tipo:</span> {order.workType}
            </div>
            <div>
              <span className="font-medium">Prioridad:</span> 
              <span className={`ml-1 px-2 py-1 rounded text-xs ${
                order.priority === 'urgente' ? 'bg-red-100 text-red-800' :
                order.priority === 'alta' ? 'bg-orange-100 text-orange-800' :
                order.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.priority}
              </span>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            <p className="line-clamp-2">{order.description}</p>
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Progreso</span>
          <span className="text-sm text-gray-600">{getProgressFromStatus(order.currentStatus)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(order.currentStatus)}`}
            style={{ width: `${getProgressFromStatus(order.currentStatus)}%` }}
          />
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
        <div>
          <span className="font-medium">Creado:</span> {formatDate(order.createdAt)} {formatTime(order.createdAt)}
        </div>
        <div>
          <span className="font-medium">Actualizado:</span> {formatDate(order.updatedAt)} {formatTime(order.updatedAt)}
        </div>
        {order.estimatedHours && (
          <div>
            <span className="font-medium">Horas estimadas:</span> {order.estimatedHours}h
          </div>
        )}
        {order.totalHours && (
          <div>
            <span className="font-medium">Horas reales:</span> {order.totalHours}h
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={() => window.location.href = `/work-orders/${order.id}`}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
        >
          👁️ Ver Detalles
        </button>
        
        {showQuickActions && (
          <>
            {order.assignedTo ? (
              <>
                <MechanicInfoDropdown mechanic={order.assignedTo}>
                  <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors">
                    👨‍🔧 Ver Mecánico
                  </button>
                </MechanicInfoDropdown>
                {workshopId && (
                  <>
                    <button
                      onClick={handleAssignMechanic}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200 transition-colors"
                    >
                      🔄 Reasignar
                    </button>
                    <button
                      onClick={() => setShowExchangeModal(true)}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 transition-colors"
                    >
                      🔄 Intercambiar
                    </button>
                  </>
                )}
              </>
            ) : (
              workshopId && (
                <button
                  onClick={handleAssignMechanic}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  👨‍🔧 Asignar Mecánico
                </button>
              )
            )}
            
            {/* Botón de exportación - solo para órdenes completadas */}
            {order.currentStatus === 'completado' ? (
              <button
                onClick={handleExportWord}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
              >
                📝 Exportar Documento
              </button>
            ) : (
              <div className="px-3 py-1 bg-gray-100 text-gray-500 rounded text-sm cursor-not-allowed">
                📝 Documento (Solo completadas)
              </div>
            )}
          </>
        )}

        <button
          onClick={onUpdate}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Modal de asignación de mecánico */}
      {workshopId && (
        <AssignMechanicModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onSuccess={handleMechanicAssigned}
          workOrderId={order.id}
          workOrderNumber={order.orderNumber}
          vehiclePlate={order.vehicle?.licensePlate || 'N/A'}
          workshopId={workshopId}
          currentMechanic={order.assignedTo ? {
            id: order.assignedTo.id,
            name: `${order.assignedTo.firstName} ${order.assignedTo.lastName}`
          } : undefined}
        />
      )}

      {/* Modal de intercambio de mecánicos */}
      {workshopId && order.assignedTo && (
        <ExchangeMechanicModal
          isOpen={showExchangeModal}
          onClose={() => setShowExchangeModal(false)}
          onSuccess={handleMechanicAssigned}
          workOrderId={order.id}
          currentMechanicId={order.assignedTo.id}
          workshopId={workshopId}
        />
      )}
    </div>
  )
}
