import { useState, useEffect } from 'react'
import { MainLayout } from '../components/Layout/MainLayout'
import { notificationService } from '../services/notificationService'
import { NotificationDetailModal } from '../components/Notifications/NotificationDetailModal'
import type { Notification } from '../../../shared/types'

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const limit = 20

  useEffect(() => {
    loadNotifications()
    
    // Escuchar eventos de actualización
    const handleRefresh = () => {
      loadNotifications()
    }
    
    window.addEventListener('notifications:refresh', handleRefresh)
    window.addEventListener('vehicle-entry-created', handleRefresh)
    window.addEventListener('vehicle-exit-registered', handleRefresh)
    
    return () => {
      window.removeEventListener('notifications:refresh', handleRefresh)
      window.removeEventListener('vehicle-entry-created', handleRefresh)
      window.removeEventListener('vehicle-exit-registered', handleRefresh)
    }
  }, [page, filter])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationService.getMyNotifications(
        page,
        limit,
        filter === 'unread'
      )
      
      const list = Array.isArray(response.data) ? response.data : []
      setNotifications(list)
      setTotalPages(response.totalPages || 1)
      setUnreadCount(response.unreadCount || list.filter(n => !n.isRead).length)
    } catch (error) {
      console.error('Error cargando notificaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev =>
        prev.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      )
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0))
    } catch (error) {
      console.error('Error marcando notificación como leída:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })))
      setUnreadCount(0)
      await loadNotifications()
    } catch (error) {
      console.error('Error marcando todas como leídas:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await notificationService.delete(id)
      setNotifications(prev => {
        const target = prev.find(n => n.id === id)
        if (target && !target.isRead) {
          setUnreadCount(prevUnread => (prevUnread > 0 ? prevUnread - 1 : 0))
        }
        return prev.filter(n => n.id !== id)
      })
    } catch (error) {
      console.error('Error eliminando notificación:', error)
    }
  }

  const handleDeleteAllRead = async () => {
    try {
      await notificationService.deleteAllRead()
      await loadNotifications()
    } catch (error) {
      console.error('Error eliminando notificaciones leídas:', error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Ahora'
    if (diffInMinutes < 60) return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`
    if (diffInMinutes < 1440) return `hace ${Math.floor(diffInMinutes / 60)} ${Math.floor(diffInMinutes / 60) === 1 ? 'hora' : 'horas'}`
    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-blue-600'
    }
  }

  const filteredNotifications = filter === 'read' 
    ? notifications.filter(n => n.isRead)
    : filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Notificaciones
          </h1>
          <p className="text-gray-600">
            {unreadCount > 0 
              ? `Tienes ${unreadCount} ${unreadCount === 1 ? 'notificación' : 'notificaciones'} sin leer`
              : 'No tienes notificaciones sin leer'
            }
          </p>
        </div>

        {/* Filtros y acciones */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFilter('all')
                setPage(1)
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => {
                setFilter('unread')
                setPage(1)
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              No leídas {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => {
                setFilter('read')
                setPage(1)
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'read'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Leídas
            </button>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Marcar todas como leídas
              </button>
            )}
            {filter === 'read' && filteredNotifications.length > 0 && (
              <button
                onClick={handleDeleteAllRead}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Eliminar todas las leídas
              </button>
            )}
          </div>
        </div>

        {/* Lista de notificaciones */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-gray-600 text-lg">
              {filter === 'unread' 
                ? 'No tienes notificaciones sin leer'
                : filter === 'read'
                ? 'No tienes notificaciones leídas'
                : 'No hay notificaciones'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  setSelectedNotification(notification)
                  setShowDetailModal(true)
                }}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`text-2xl ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-base font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        {notification.data && (
                          <div className="text-xs text-gray-500 space-y-1">
                            {notification.data.vehicle?.licensePlate && (
                              <div>
                                <span className="font-medium">Vehículo:</span> {notification.data.vehicle.licensePlate}
                              </div>
                            )}
                            {notification.data.vehicle?.driverName && (
                              <div>
                                <span className="font-medium">Conductor:</span> {notification.data.vehicle.driverName}
                              </div>
                            )}
                            {notification.data.entryCode && (
                              <div>
                                <span className="font-medium">Código de ingreso:</span> {notification.data.entryCode}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mt-2 text-xs text-gray-500">
                          {formatTime(notification.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notification.id)
                            }}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                          >
                            Marcar como leída
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(notification.id)
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Eliminar"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Modal de vista previa detallada */}
        <NotificationDetailModal
          isOpen={showDetailModal}
          notification={selectedNotification}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedNotification(null)
          }}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
        />
      </div>
    </MainLayout>
  )
}

