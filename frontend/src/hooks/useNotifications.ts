import { useCallback, useEffect, useRef, useState } from 'react'
import type { Notification as BackendNotification } from '../../../shared/types'
import { notificationService } from '../services/notificationService'
import { pageVisibility } from '../utils/pageVisibility'

type AppNotification = BackendNotification & { data?: Record<string, any> }

const POLLING_INTERVAL_MS = 60000 // Aumentado a 60 segundos (1 minuto)
const MAX_POLLING_INTERVAL_MS = 600000 // Máximo 10 minutos si hay errores 429

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const pollingRef = useRef<number | null>(null)
  const currentPollingInterval = useRef(POLLING_INTERVAL_MS)
  const lastFetchTimeRef = useRef(0)
  const isFetchingRef = useRef(false)
  const setupPollingRef = useRef<() => void>()
  const MIN_FETCH_INTERVAL = 5000 // Mínimo 5 segundos entre fetches

  const fetchNotifications = useCallback(async (showSpinner = false) => {
    // Evitar llamadas concurrentes
    if (isFetchingRef.current) {
      console.log('⏸️ Ya hay una petición de notificaciones en curso, omitiendo...')
      return
    }
    
    // Throttling: evitar fetches muy frecuentes
    const now = Date.now()
    if (now - lastFetchTimeRef.current < MIN_FETCH_INTERVAL) {
      console.log('⏸️ Fetch de notificaciones demasiado reciente, omitiendo...')
      return
    }
    
    if (showSpinner) {
      setLoading(true)
    }
    
    isFetchingRef.current = true
    lastFetchTimeRef.current = now

    try {
      const response = await notificationService.getMyNotifications(1, 50)
      const list = Array.isArray(response.data) ? response.data : []
      setNotifications(list)
      const unread = typeof response.unreadCount === 'number'
        ? response.unreadCount
        : list.filter(n => !n.isRead).length
      setUnreadCount(unread)
      
      // Si funciona, resetear intervalo a valor normal
      currentPollingInterval.current = POLLING_INTERVAL_MS
    } catch (error: any) {
      console.error('Error obteniendo notificaciones:', error)
      
      // Si es error 429, aumentar intervalo exponencialmente
      if (error.response?.status === 429) {
        console.warn('⚠️ Rate limit alcanzado en notificaciones, aumentando intervalo de polling')
        currentPollingInterval.current = Math.min(
          currentPollingInterval.current * 2,
          MAX_POLLING_INTERVAL_MS
        )
        
        // Reiniciar polling con nuevo intervalo
        if (pollingRef.current) {
          window.clearInterval(pollingRef.current)
        }
        // Reiniciar polling en el siguiente tick usando ref
        setTimeout(() => {
          setupPollingRef.current?.()
        }, 0)
      }
    } finally {
      setLoading(false)
      isFetchingRef.current = false
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
      // Solo hacer polling si la pestaña está visible
      if (pageVisibility.getIsVisible()) {
        fetchNotifications()
      } else {
        console.log('⏸️ Polling pausado - pestaña no visible')
      }
    }, currentPollingInterval.current)
  }, [fetchNotifications])
  
  // Guardar referencia para uso en fetchNotifications
  setupPollingRef.current = setupPolling

  useEffect(() => {
    fetchNotifications(true)
    setupPolling()

    // Detener polling cuando la pestaña está oculta, reanudar cuando está visible
    const unsubscribeVisibility = pageVisibility.subscribe((isVisible) => {
      if (isVisible) {
        console.log('▶️ Reanudando polling - pestaña visible')
        // Recargar notificaciones cuando la pestaña vuelve a estar visible
        fetchNotifications()
        setupPolling()
      } else {
        console.log('⏸️ Pausando polling - pestaña oculta')
        if (pollingRef.current) {
          window.clearInterval(pollingRef.current)
          pollingRef.current = null
        }
      }
    })

    let debounceTimer: NodeJS.Timeout | null = null
    
    const handleRefresh = () => {
      // Debounce para eventos
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      debounceTimer = setTimeout(() => {
        fetchNotifications()
      }, 1000)
    }
    
    const handleVehicleEvent = () => {
      // Debounce para eventos de vehículos
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      debounceTimer = setTimeout(() => {
        fetchNotifications()
      }, 1000)
    }

    window.addEventListener('notifications:refresh', handleRefresh)
    window.addEventListener('vehicle-entry-created', handleVehicleEvent)
    window.addEventListener('vehicle-exit-registered', handleVehicleEvent)

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {
        /* noop */
      })
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current)
      }
      unsubscribeVisibility()
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
