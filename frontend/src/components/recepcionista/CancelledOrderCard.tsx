import { WorkOrder } from '../../services/workOrderService'

interface CancelledOrderCardProps {
  order: WorkOrder
  onUpdate: () => void
}

export function CancelledOrderCard({ order, onUpdate }: CancelledOrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'cancelado':
        return 'Cancelada'
      default:
        return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-100 text-red-800'
      case 'alta':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-yellow-100 text-yellow-800'
      case 'baja':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return 'Urgente'
      case 'alta':
        return 'Alta'
      case 'normal':
        return 'Normal'
      case 'baja':
        return 'Baja'
      default:
        return priority
    }
  }

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-bold text-lg text-gray-900">{order.orderNumber}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.currentStatus)}`}>
              {getStatusLabel(order.currentStatus)}
            </span>
          </div>
          
          <div className="space-y-1 text-sm text-gray-700">
            <p><span className="font-medium">Vehículo:</span> {order.vehicle?.licensePlate || 'N/A'}</p>
            <p><span className="font-medium">Marca/Modelo:</span> {order.vehicle?.brand || 'N/A'} {order.vehicle?.model || 'N/A'}</p>
            <p><span className="font-medium">Tipo de Trabajo:</span> {order.workType}</p>
            <p><span className="font-medium">Descripción:</span> {order.description}</p>
            {order.assignedTo && (
              <p><span className="font-medium">Mecánico Asignado:</span> {order.assignedTo.firstName} {order.assignedTo.lastName}</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(order.priority)}`}>
            {getPriorityLabel(order.priority)}
          </span>
          
          <div className="text-right text-sm text-gray-600">
            <p>Creada: {new Date(order.createdAt).toLocaleDateString('es-CL')}</p>
            <p>Cancelada: {new Date(order.updatedAt).toLocaleDateString('es-CL')}</p>
          </div>
        </div>
      </div>

      {order.observations && (
        <div className="mt-3 p-3 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Observaciones:</span> {order.observations}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={() => window.location.href = `/work-orders/${order.id}`}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
        >
          👁️ Ver Detalles
        </button>

        <button
          onClick={() => window.location.href = `/entries/${order.entryId}`}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
        >
          📋 Ver Ingreso
        </button>

        <button
          onClick={onUpdate}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>
    </div>
  )
}





