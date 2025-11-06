import { useState, useEffect, useCallback } from 'react'
import { workOrderService, WorkOrder, WorkOrderStats } from '../services/workOrderService'

export function useWorkOrders(workshopId?: string, assignedToId?: string) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [stats, setStats] = useState<WorkOrderStats>({
    total: 0,
    pendientes: 0,
    en_progreso: 0,
    pausados: 0,
    completados: 0,
    cancelados: 0,
    completadosHoy: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWorkOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Cargando órdenes de trabajo con workshopId:', workshopId, 'assignedToId:', assignedToId)
      
      const [ordersData, statsData] = await Promise.all([
        workOrderService.getAll({ workshopId, assignedToId }),
        workOrderService.getStats(workshopId)
      ])
      
      console.log('📋 Datos de órdenes recibidos:', ordersData)
      console.log('📊 Estadísticas desde BD:', statsData)
      
      setWorkOrders(ordersData.data || [])
      
      // Mapear estadísticas del backend al frontend
      if (statsData && typeof statsData === 'object') {
        const mappedStats = {
          total: statsData.total || 0,
          pendientes: statsData.pending || 0,
          en_progreso: statsData.inProgress || 0,
          pausados: statsData.paused || 0,
          completados: statsData.completed || 0,
          cancelados: statsData.cancelled || 0,
          completadosHoy: statsData.completedToday || 0
        }
        setStats(mappedStats)
        console.log('📊 Estadísticas mapeadas en loadWorkOrders:', mappedStats)
      }
    } catch (err: any) {
      console.error('❌ Error cargando órdenes de trabajo:', err)
      console.error('❌ Error response:', err.response?.data)
      setError(err.response?.data?.message || 'Error cargando órdenes de trabajo')
    } finally {
      setLoading(false)
    }
  }, [workshopId, assignedToId])

  // Función específica para cargar solo estadísticas desde la BD
  const loadStatsFromDB = useCallback(async () => {
    try {
      console.log('📊 Actualizando estadísticas desde BD...', { workshopId })
      const statsData = await workOrderService.getStats(workshopId)
      console.log('📊 Estadísticas actualizadas desde BD:', statsData)
      console.log('📊 Tipo de datos:', typeof statsData, 'Es objeto:', typeof statsData === 'object')
      
      if (statsData && typeof statsData === 'object') {
        // Mapear los nombres de propiedades del backend al frontend
        const mappedStats = {
          total: statsData.total || 0,
          pendientes: statsData.pending || 0,
          en_progreso: statsData.inProgress || 0,
          pausados: statsData.paused || 0,
          completados: statsData.completed || 0,
          cancelados: statsData.cancelled || 0,
          completadosHoy: statsData.completedToday || 0
        }
        
        console.log('📊 Estadísticas mapeadas:', mappedStats)
        setStats(mappedStats)
        console.log('✅ Estadísticas actualizadas en el estado')
      } else {
        console.warn('⚠️ Datos de estadísticas no válidos:', statsData)
      }
    } catch (err: any) {
      console.error('❌ Error cargando estadísticas desde BD:', err)
      console.error('❌ Error response:', err.response?.data)
      // Re-lanzar el error para que el polling pueda manejarlo
      throw err
    }
  }, [workshopId, assignedToId])

  const loadPendingOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const ordersData = await workOrderService.getPendingOrders(workshopId, assignedToId)
      setWorkOrders(ordersData.data || [])
    } catch (err: any) {
      console.error('Error cargando órdenes pendientes:', err)
      setError(err.response?.data?.message || 'Error cargando órdenes pendientes')
    } finally {
      setLoading(false)
    }
  }, [workshopId, assignedToId])

  const loadActiveOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const ordersData = await workOrderService.getActiveOrders(workshopId, assignedToId)
      setWorkOrders(ordersData.data || [])
    } catch (err: any) {
      console.error('Error cargando órdenes activas:', err)
      setError(err.response?.data?.message || 'Error cargando órdenes activas')
    } finally {
      setLoading(false)
    }
  }, [workshopId, assignedToId])

  const loadPausedOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const ordersData = await workOrderService.getPausedOrders(workshopId, assignedToId)
      setWorkOrders(ordersData.data || [])
    } catch (err: any) {
      console.error('Error cargando órdenes pausadas:', err)
      setError(err.response?.data?.message || 'Error cargando órdenes pausadas')
    } finally {
      setLoading(false)
    }
  }, [workshopId, assignedToId])

  const loadCompletedOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const ordersData = await workOrderService.getCompletedOrders(workshopId, assignedToId)
      setWorkOrders(ordersData.data || [])
    } catch (err: any) {
      console.error('Error cargando órdenes completadas:', err)
      setError(err.response?.data?.message || 'Error cargando órdenes completadas')
    } finally {
      setLoading(false)
    }
  }, [workshopId, assignedToId])

  const loadCancelledOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const ordersData = await workOrderService.getCancelledOrders(workshopId, assignedToId)
      setWorkOrders(ordersData.data || [])
    } catch (err: any) {
      console.error('Error cargando órdenes canceladas:', err)
      setError(err.response?.data?.message || 'Error cargando órdenes canceladas')
    } finally {
      setLoading(false)
    }
  }, [workshopId, assignedToId])

  const createWorkOrder = useCallback(async (data: any) => {
    try {
      setError(null)
      const newOrder = await workOrderService.create(data)
      await loadWorkOrders() // Recargar la lista
      return newOrder
    } catch (err: any) {
      console.error('Error creando orden de trabajo:', err)
      setError(err.response?.data?.message || 'Error creando orden de trabajo')
      throw err
    }
  }, [loadWorkOrders])

  const updateWorkOrder = useCallback(async (id: string, data: any) => {
    try {
      setError(null)
      const updatedOrder = await workOrderService.update(id, data)
      await loadWorkOrders() // Recargar la lista
      return updatedOrder
    } catch (err: any) {
      console.error('Error actualizando orden de trabajo:', err)
      setError(err.response?.data?.message || 'Error actualizando orden de trabajo')
      throw err
    }
  }, [loadWorkOrders])

  const changeStatus = useCallback(async (id: string, status: string, reason?: string) => {
    try {
      setError(null)
      const result = await workOrderService.changeStatus(id, status, reason)
      await loadWorkOrders() // Recargar la lista
      return result
    } catch (err: any) {
      console.error('Error cambiando estado:', err)
      setError(err.response?.data?.message || 'Error cambiando estado')
      throw err
    }
  }, [loadWorkOrders])

  useEffect(() => {
    loadWorkOrders()
  }, [loadWorkOrders])

  // Polling automático con manejo de rate limiting
  // Si hay error 429, aumentamos el intervalo exponencialmente
  const [pollingInterval, setPollingInterval] = useState(60000) // Empezar con 60 segundos
  const [statsPollingInterval, setStatsPollingInterval] = useState(120000) // Empezar con 2 minutos

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        console.log('🔄 Actualización automática de estadísticas desde BD...')
        await loadStatsFromDB()
        // Si funciona, resetear intervalo a valor normal
        setStatsPollingInterval(120000) // 2 minutos
      } catch (err: any) {
        if (err.response?.status === 429) {
          console.warn('⚠️ Rate limit alcanzado, aumentando intervalo de polling de estadísticas')
          // Aumentar intervalo exponencialmente (máximo 5 minutos)
          setStatsPollingInterval(prev => Math.min(prev * 2, 300000))
        }
      }
    }, statsPollingInterval)

    return () => clearInterval(interval)
  }, [loadStatsFromDB, statsPollingInterval])

  // Polling menos frecuente para órdenes completas
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        console.log('🔄 Actualización automática de lista de órdenes...')
        await loadWorkOrders()
        // Si funciona, resetear intervalo a valor normal
        setPollingInterval(60000) // 1 minuto
      } catch (err: any) {
        if (err.response?.status === 429) {
          console.warn('⚠️ Rate limit alcanzado, aumentando intervalo de polling de órdenes')
          // Aumentar intervalo exponencialmente (máximo 5 minutos)
          setPollingInterval(prev => Math.min(prev * 2, 300000))
        }
      }
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [loadWorkOrders, pollingInterval])

  // Escuchar eventos de actualización
  useEffect(() => {
    const handleDataUpdate = () => {
      console.log('📡 Evento recibido, actualizando datos desde BD...')
      loadWorkOrders()
      loadStatsFromDB() // Actualizar estadísticas inmediatamente
    }

    const handleStatusChange = (event: any) => {
      console.log('🔄 Estado de orden cambiado:', event.detail)
      loadStatsFromDB() // Actualizar solo estadísticas para cambios de estado
    }

    const handleStatsUpdate = () => {
      console.log('📊 Evento de estadísticas, actualizando desde BD...')
      loadStatsFromDB()
    }

    window.addEventListener('work-order-created', handleDataUpdate)
    window.addEventListener('work-order-updated', handleDataUpdate)
    window.addEventListener('work-order-status-changed', handleStatusChange)
    window.addEventListener('work-order-completed', handleStatsUpdate)
    window.addEventListener('work-order-cancelled', handleStatsUpdate)

    return () => {
      window.removeEventListener('work-order-created', handleDataUpdate)
      window.removeEventListener('work-order-updated', handleDataUpdate)
      window.removeEventListener('work-order-status-changed', handleStatusChange)
      window.removeEventListener('work-order-completed', handleStatsUpdate)
      window.removeEventListener('work-order-cancelled', handleStatsUpdate)
    }
  }, [loadWorkOrders, loadStatsFromDB])

  return {
    workOrders,
    stats,
    loading,
    error,
    loadWorkOrders,
    loadStatsFromDB,
    loadPendingOrders,
    loadActiveOrders,
    loadPausedOrders,
    loadCompletedOrders,
    loadCancelledOrders,
    createWorkOrder,
    updateWorkOrder,
    changeStatus
  }
}
