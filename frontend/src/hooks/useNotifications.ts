import { useState, useEffect, useCallback } from 'react'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  isRead: boolean
  createdAt: string
  data?: {
    vehicle?: {
      licensePlate: string
      driverName: string
      driverRut: string
    }
    entryId?: string
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const unreadCount = notifications.filter(n => !n.isRead).length

  // Cargar notificaciones desde localStorage
  const loadNotifications = useCallback(() => {
    try {
      const stored = localStorage.getItem('notifications')
      if (stored) {
        const parsed = JSON.parse(stored)
        setNotifications(parsed)
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error)
    }
  }, [])

  // Guardar notificaciones en localStorage
  const saveNotifications = useCallback((newNotifications: Notification[]) => {
    try {
      localStorage.setItem('notifications', JSON.stringify(newNotifications))
      setNotifications(newNotifications)
    } catch (error) {
      console.error('Error guardando notificaciones:', error)
    }
  }, [])

  // Agregar nueva notificación
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isRead: false
    }

    const updatedNotifications = [newNotification, ...notifications]
    saveNotifications(updatedNotifications)

    // Mostrar notificación del sistema si está disponible
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      })
    }

    return newNotification
  }, [notifications, saveNotifications])

  // Marcar como leída
  const markAsRead = useCallback((id: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    )
    saveNotifications(updatedNotifications)
  }, [notifications, saveNotifications])

  // Marcar todas como leídas
  const markAllAsRead = useCallback(() => {
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }))
    saveNotifications(updatedNotifications)
  }, [notifications, saveNotifications])

  // Eliminar notificación
  const deleteNotification = useCallback((id: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== id)
    saveNotifications(updatedNotifications)
  }, [notifications, saveNotifications])

  // Limpiar notificaciones leídas
  const clearReadNotifications = useCallback(() => {
    const updatedNotifications = notifications.filter(n => !n.isRead)
    saveNotifications(updatedNotifications)
  }, [notifications, saveNotifications])

  // Escuchar eventos de ingreso de vehículos
  useEffect(() => {
    const handleVehicleEntry = (event: any) => {
      console.log('🚗 Evento de ingreso de vehículo recibido:', event.detail)
      
      const { vehicle, entry, guardName } = event.detail
      const currentTime = new Date().toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
      
      addNotification({
        title: 'Nuevo Ingreso de Vehículo',
        message: `El Guardia "${guardName || 'Sistema'}" realizó el ingreso de un vehículo a las ${currentTime}`,
        type: 'success',
        data: {
          vehicle: {
            licensePlate: vehicle.licensePlate,
            driverName: entry.driverName,
            driverRut: entry.driverRut
          },
          entryId: entry.id
        }
      })
    }

    const handleVehicleExit = (event: any) => {
      console.log('🚪 Evento de salida de vehículo recibido:', event.detail)
      
      const { vehicle, guardName } = event.detail
      const currentTime = new Date().toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
      
      addNotification({
        title: 'Salida de Vehículo Registrada',
        message: `El Guardia "${guardName || 'Sistema'}" realizó la salida de un vehículo a las ${currentTime}`,
        type: 'info',
        data: {
          vehicle: {
            licensePlate: vehicle.licensePlate,
            driverName: vehicle.driverName || 'N/A',
            driverRut: vehicle.driverRut || 'N/A'
          }
        }
      })
    }

    // Solicitar permisos para notificaciones del sistema
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Escuchar eventos
    window.addEventListener('vehicle-entry-created', handleVehicleEntry)
    window.addEventListener('vehicle-exit-registered', handleVehicleExit)

    // Cargar notificaciones existentes
    loadNotifications()

    return () => {
      window.removeEventListener('vehicle-entry-created', handleVehicleEntry)
      window.removeEventListener('vehicle-exit-registered', handleVehicleExit)
    }
  }, [addNotification, loadNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    loadNotifications
  }
}
