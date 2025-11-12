import { useCallback, useEffect, useRef, useState } from 'react'
import type { Notification as BackendNotification } from '../../../shared/types'
import { notificationService } from '../services/notificationService'

type AppNotification = BackendNotification & { data?: Record<string, any> }

const POLLING_INTERVAL_MS = 15000

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const pollingRef = useRef<number | null>(null)

  const fetchNotifications = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true)
    }

    try {
      const response = await notificationService.getMyNotifications(1, 50)
      const list = Array.isArray(response.data) ? response.data : []
      setNotifications(list)
      const unread = typeof response.unreadCount === 'number'
        ? response.unreadCount
        : list.filter(n => !n.isRead).length
      setUnreadCount(unread)
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (id: string) => {
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
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error)
    }
  }, [])

  const deleteNotification = useCallback(async (id: string) => {
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
  }, [])

  const clearReadNotifications = useCallback(async () => {
    try {
      await notificationService.deleteAllRead()
      setNotifications(prev => prev.filter(n => !n.isRead))
    } catch (error) {
      console.error('Error eliminando notificaciones leídas:', error)
    }
  }, [])

  const setupPolling = useCallback(() => {
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current)
    }

    pollingRef.current = window.setInterval(() => {
      fetchNotifications()
    }, POLLING_INTERVAL_MS)
  }, [fetchNotifications])

  useEffect(() => {
    fetchNotifications(true)
    setupPolling()

    const handleRefresh = () => fetchNotifications()
    const handleVehicleEvent = () => fetchNotifications()

    window.addEventListener('notifications:refresh', handleRefresh)
    window.addEventListener('vehicle-entry-created', handleVehicleEvent)
    window.addEventListener('vehicle-exit-registered', handleVehicleEvent)

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {
        /* noop */
      })
    }

    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current)
      }
      window.removeEventListener('notifications:refresh', handleRefresh)
      window.removeEventListener('vehicle-entry-created', handleVehicleEvent)
      window.removeEventListener('vehicle-exit-registered', handleVehicleEvent)
    }
  }, [fetchNotifications, setupPolling])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    refresh: fetchNotifications,
  }
}
