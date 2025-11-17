import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Notification } from '../../../../shared/types'

interface NotificationDetailModalProps {
  isOpen: boolean
  notification: (Notification & { data?: Record<string, any> }) | null
  onClose: () => void
  onMarkAsRead?: (id: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export function NotificationDetailModal({
  isOpen,
  notification,
  onClose,
  onMarkAsRead,
  onDelete
}: NotificationDetailModalProps) {
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen && notification && !notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id).catch(console.error)
    }
  }, [isOpen, notification, onMarkAsRead])

  if (!isOpen || !notification) return null

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'vehicle_entry': return '🚗'
      case 'vehicle_exit': return '✅'
      case 'vehicle_ready_for_exit': return '🚦'
      case 'work_order_assigned': return '🔧'
      case 'work_order_completed': return '✅'
      case 'work_order_paused': return '⏸️'
      case 'work_order_cancelled': return '❌'
      case 'work_order_started': return '▶️'
      case 'work_order_reassigned': return '🔄'
      case 'spare_part_requested': return '📦'
      case 'spare_part_delivered': return '📬'
      case 'low_stock': return '⚠️'
      case 'critical_stock': return '🔴'
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'vehicle_entry':
      case 'work_order_started':
        return 'text-blue-600 bg-blue-50'
      case 'vehicle_exit':
      case 'work_order_completed':
      case 'vehicle_ready_for_exit':
        return 'text-green-600 bg-green-50'
      case 'work_order_paused':
        return 'text-orange-600 bg-orange-50'
      case 'work_order_cancelled':
      case 'error':
        return 'text-red-600 bg-red-50'
      case 'low_stock':
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'critical_stock':
        return 'text-red-600 bg-red-50'
      case 'spare_part_requested':
      case 'spare_part_delivered':
        return 'text-purple-600 bg-purple-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getFriendlyTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      'vehicle_entry': 'Ingreso de Vehículo',
      'vehicle_exit': 'Salida de Vehículo',
      'vehicle_ready_for_exit': 'Vehículo Listo para Salida',
      'work_order_created': 'Orden de Trabajo Creada',
      'work_order_assigned': 'Orden de Trabajo Asignada',
      'work_order_started': 'Orden de Trabajo Iniciada',
      'work_order_completed': 'Orden de Trabajo Completada',
      'work_order_paused': 'Orden de Trabajo Pausada',
      'work_order_cancelled': 'Orden de Trabajo Cancelada',
      'work_order_reassigned': 'Orden de Trabajo Reasignada',
      'spare_part_requested': 'Repuesto Solicitado',
      'spare_part_delivered': 'Repuesto Entregado',
      'low_stock': 'Stock Bajo',
      'critical_stock': 'Stock Crítico',
      'success': 'Éxito',
      'warning': 'Advertencia',
      'error': 'Error',
      'info': 'Información'
    }
    return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getFriendlyRelatedToName = (relatedTo: string): string => {
    const relatedMap: Record<string, string> = {
      'work-orders': 'Orden de Trabajo',
      'vehicle-entries': 'Ingreso de Vehículo',
      'spare-parts': 'Repuesto',
      'vehicles': 'Vehículo',
      'users': 'Usuario'
    }
    return relatedMap[relatedTo] || relatedTo.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const handleNavigateToRelated = () => {
    if (!notification.relatedTo || !notification.relatedId) return

    switch (notification.relatedTo) {
      case 'work-orders':
        navigate(`/work-orders/${notification.relatedId}`)
        break
      case 'vehicle-entries':
        navigate(`/entries?entryId=${notification.relatedId}`)
        break
      case 'spare-parts':
        navigate(`/inventory?sparePartId=${notification.relatedId}`)
        break
      default:
        return
    }
    onClose()
  }

  const handleDelete = async () => {
    if (onDelete && window.confirm('¿Estás seguro de que deseas eliminar esta notificación?')) {
      await onDelete(notification.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b border-gray-200 ${getNotificationColor(notification.type)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{getNotificationIcon(notification.type)}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{notification.title}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDateTime(notification.createdAt)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Mensaje principal */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Mensaje</h3>
            <p className="text-base text-gray-900 leading-relaxed">{notification.message}</p>
          </div>

          {/* Información adicional */}
          {notification.data && Object.keys(notification.data).length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Información Adicional</h3>
              <div className="space-y-2">
                {notification.data.vehicle?.licensePlate && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 w-24">Vehículo:</span>
                    <span className="text-sm text-gray-900">{notification.data.vehicle.licensePlate}</span>
                  </div>
                )}
                {notification.data.vehicle?.driverName && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 w-24">Conductor:</span>
                    <span className="text-sm text-gray-900">{notification.data.vehicle.driverName}</span>
                  </div>
                )}
                {notification.data.entryCode && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 w-24">Código:</span>
                    <span className="text-sm text-gray-900">{notification.data.entryCode}</span>
                  </div>
                )}
                {notification.data.orderNumber && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 w-24">Orden:</span>
                    <span className="text-sm text-gray-900">{notification.data.orderNumber}</span>
                  </div>
                )}
                {notification.data.sparePartName && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 w-24">Repuesto:</span>
                    <span className="text-sm text-gray-900">{notification.data.sparePartName}</span>
                  </div>
                )}
                {notification.data.quantity && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 w-24">Cantidad:</span>
                    <span className="text-sm text-gray-900">{notification.data.quantity}</span>
                  </div>
                )}
                {notification.data.stock && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 w-24">Stock:</span>
                    <span className="text-sm text-gray-900">{notification.data.stock} unidades</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadatos */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Detalles</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium w-32">Tipo:</span>
                <span className="text-gray-900 font-medium">{getFriendlyTypeName(notification.type)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium w-32">Estado:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  notification.isRead 
                    ? 'bg-gray-100 text-gray-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {notification.isRead ? 'Leída' : 'No leída'}
                </span>
              </div>
              {notification.readAt && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 font-medium w-32">Leída el:</span>
                  <span className="text-gray-900">{formatDateTime(notification.readAt)}</span>
                </div>
              )}
              {notification.relatedTo && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 font-medium w-32">Relacionado con:</span>
                  <span className="text-gray-900 font-medium">{getFriendlyRelatedToName(notification.relatedTo)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex space-x-2">
            {notification.relatedTo && notification.relatedId && (
              <button
                onClick={handleNavigateToRelated}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                Ver Detalles Relacionados
              </button>
            )}
          </div>
          <div className="flex space-x-2">
            {onDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
              >
                Eliminar
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

