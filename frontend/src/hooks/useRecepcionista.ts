import { useState, useEffect, useCallback } from 'react'
import { vehicleEntryService } from '../services/vehicleEntryService'
import { workOrderService } from '../services/workOrderService'
// import { VehicleEntry } from '../services/vehicleEntryService'
import { WorkOrder } from '../services/workOrderService'

export interface RecepcionistaStats {
  ingresosHoy: number
  ordenesCreadas: number
  enEspera: number
  listasParaSalida: number
  totalVehiculosIngresados: number
}

export interface PendingVehicle {
  id: string
  entryCode: string
  plate: string
  driverName: string
  driverRut: string
  entryTime: string
  issue?: string
  vehicle: {
    id: string
    plate: string
    brand: string
    model: string
    year: number
  }
  entry: {
    id: string
    entryCode: string
    entryDate: string
    status: string
  }
}

export interface ReadyVehicle {
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

export function useRecepcionista(workshopId?: string) {
  const [stats, setStats] = useState<RecepcionistaStats>({
    ingresosHoy: 0,
    ordenesCreadas: 0,
    enEspera: 0,
    listasParaSalida: 0,
    totalVehiculosIngresados: 0
  })
  const [pendingVehicles, setPendingVehicles] = useState<PendingVehicle[]>([])
  const [activeOrders, setActiveOrders] = useState<WorkOrder[]>([])
  const [readyVehicles, setReadyVehicles] = useState<ReadyVehicle[]>([])
  const [cancelledOrders, setCancelledOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const today = new Date().toISOString().split('T')[0]
      
      // Obtener datos en paralelo
      const [allEntries, workOrdersStats, completedOrders, cancelledOrders] = await Promise.all([
        vehicleEntryService.getAll({ limit: 100 }),
        workOrderService.getStats(workshopId),
        workOrderService.getCompletedOrders(workshopId),
        workOrderService.getCancelledOrders(workshopId)
      ])

      // Calcular estadísticas
      const entriesToday = allEntries.data?.filter((entry: any) => 
        entry.entryDate.startsWith(today)
      ).length || 0

      const newStats = {
        ingresosHoy: entriesToday,
        ordenesCreadas: workOrdersStats.total,
        enEspera: workOrdersStats.pendientes,
        listasParaSalida: completedOrders.data?.length || 0,
        totalVehiculosIngresados: allEntries.data?.length || 0
      }

      setStats(newStats)
    } catch (err: any) {
      console.error('Error cargando estadísticas del recepcionista:', err)
      setError(err.response?.data?.message || 'Error cargando estadísticas')
    } finally {
      setLoading(false)
    }
  }, [workshopId])

  const loadPendingVehicles = useCallback(async () => {
    try {
      setError(null)
      
      // Obtener ingresos activos y órdenes de trabajo en paralelo
      const [activeEntries, allWorkOrders] = await Promise.all([
        vehicleEntryService.getActiveEntries(),
        workOrderService.getAll({ workshopId })
      ])
      
      // Crear un Set de entryIds que ya tienen órdenes (cualquier estado)
      const entriesWithOrders = new Set(
        allWorkOrders.data
          ?.map((order: any) => order.entryId) || []
      )
      
      // Filtrar solo los ingresos que NO tienen órdenes (en cualquier estado)
      const pendingVehiclesData: PendingVehicle[] = []
      
      for (const entry of activeEntries) {
        // Verificar si este ingreso ya tiene una orden (en cualquier estado)
        if (!entriesWithOrders.has(entry.id)) {
          pendingVehiclesData.push({
            id: entry.id,
            entryCode: entry.entryCode,
            plate: entry.vehicleId || 'N/A',
            driverName: entry.driverName,
            driverRut: entry.driverRut,
            entryTime: new Date(entry.entryDate).toLocaleTimeString('es-CL', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            issue: entry.observations || 'Revisión general',
            vehicle: {
              id: entry.vehicleId || '',
              plate: entry.vehicleId || 'N/A',
              brand: '',
              model: '',
              year: 0
            },
            entry: {
              id: entry.id,
              entryCode: entry.entryCode,
              entryDate: entry.entryDate,
              status: entry.status
            }
          })
        }
      }
      
      console.log('🚗 Vehículos pendientes cargados:', pendingVehiclesData.length)
      setPendingVehicles(pendingVehiclesData)
    } catch (err: any) {
      console.error('Error cargando vehículos pendientes:', err)
      setError(err.response?.data?.message || 'Error cargando vehículos pendientes')
    }
  }, [workshopId])

  const loadActiveOrders = useCallback(async () => {
    try {
      setError(null)
      
      console.log('🔄 Cargando órdenes activas para workshop:', workshopId)
      const ordersData = await workOrderService.getActiveOrders(workshopId)
      console.log('📊 Datos de órdenes activas recibidos:', ordersData)
      console.log('📋 Órdenes activas encontradas:', ordersData.data?.length || 0)
      setActiveOrders(ordersData.data || [])
    } catch (err: any) {
      console.error('Error cargando órdenes activas:', err)
      setError(err.response?.data?.message || 'Error cargando órdenes activas')
    }
  }, [workshopId])

  const loadCancelledOrders = useCallback(async () => {
    try {
      setError(null)
      
      // Obtener órdenes canceladas
      const cancelledOrdersData = await workOrderService.getCancelledOrders(workshopId)
      setCancelledOrders(cancelledOrdersData.data || [])
    } catch (err: any) {
      console.error('Error cargando órdenes canceladas:', err)
      setError(err.response?.data?.message || 'Error cargando órdenes canceladas')
    }
  }, [workshopId])


  const loadReadyVehicles = useCallback(async () => {
    try {
      setError(null)
      
      // Obtener órdenes completadas
      const completedOrders = await workOrderService.getCompletedOrders(workshopId)
      
      // Obtener información de los vehículos
      const readyVehiclesData: ReadyVehicle[] = []
      
      for (const order of completedOrders.data || []) {
        if (order.entry) {
          // Verificar si la orden fue marcada como lista por el recepcionista
          const isMarkedByReceptionist = order.observations?.includes('Orden marcada como lista por recepcionista') || 
                                       order.observations?.includes('marcada como lista')
          
          // Verificar si el vehículo ya tiene registrada una salida
          const hasExitRegistered = order.entry.exitDate !== null && order.entry.exitDate !== undefined
          
          // Solo incluir si NO fue marcada por recepcionista Y NO tiene salida registrada
          if (!isMarkedByReceptionist && !hasExitRegistered) {
            readyVehiclesData.push({
              id: order.entry.id,
              plate: order.vehicle?.plate || 'N/A',
              driverName: order.entry.driverName,
              driverRut: order.entry.driverRut,
              phone: order.entry.driverPhone || undefined,
              completedAt: new Date(order.completedAt || order.updatedAt).toLocaleTimeString('es-CL', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              workOrder: {
                id: order.id,
                orderNumber: order.orderNumber,
                completedAt: order.completedAt || order.updatedAt
              }
            })
          }
        }
      }
      
      setReadyVehicles(readyVehiclesData)
    } catch (err: any) {
      console.error('Error cargando vehículos listos:', err)
      setError(err.response?.data?.message || 'Error cargando vehículos listos')
    }
  }, [workshopId])

  const createWorkOrder = useCallback(async (data: any) => {
    try {
      setError(null)
      const newOrder = await workOrderService.create(data)
      
      // Recargar datos
      await Promise.all([
        loadPendingVehicles(),
        loadActiveOrders(),
        loadStats()
      ])
      
      // Emitir evento para actualización en tiempo real
      window.dispatchEvent(new CustomEvent('work-order-created', { detail: newOrder }))
      console.log('📡 Evento work-order-created emitido')
      
      return newOrder
    } catch (err: any) {
      console.error('Error creando orden de trabajo:', err)
      setError(err.response?.data?.message || 'Error creando orden de trabajo')
      throw err
    }
  }, [loadPendingVehicles, loadActiveOrders, loadStats])

  const searchVehicles = useCallback(async (query: string) => {
    try {
      setError(null)
      
      // Buscar en ingresos activos
      const activeEntries = await vehicleEntryService.getActiveEntries()
      
      const results = activeEntries.filter((entry: any) => 
        entry.vehicle?.plate?.toLowerCase().includes(query.toLowerCase()) ||
        entry.entryCode.toLowerCase().includes(query.toLowerCase()) ||
        entry.driverName.toLowerCase().includes(query.toLowerCase()) ||
        entry.driverRut.includes(query)
      )
      
      return results
    } catch (err: any) {
      console.error('Error buscando vehículos:', err)
      setError(err.response?.data?.message || 'Error buscando vehículos')
      return []
    }
  }, [])

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadStats(),
      loadPendingVehicles(),
      loadActiveOrders(),
      loadReadyVehicles(),
      loadCancelledOrders()
    ])
  }, [loadStats, loadPendingVehicles, loadActiveOrders, loadReadyVehicles, loadCancelledOrders])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  // Escuchar eventos de actualización
  useEffect(() => {
    const handleDataUpdate = () => {
      loadAllData()
    }

    window.addEventListener('entry-created', handleDataUpdate)
    window.addEventListener('entry-updated', handleDataUpdate)
    window.addEventListener('work-order-created', handleDataUpdate)
    window.addEventListener('work-order-updated', handleDataUpdate)
    window.addEventListener('work-order-status-changed', handleDataUpdate)

    return () => {
      window.removeEventListener('entry-created', handleDataUpdate)
      window.removeEventListener('entry-updated', handleDataUpdate)
      window.removeEventListener('work-order-created', handleDataUpdate)
      window.removeEventListener('work-order-updated', handleDataUpdate)
      window.removeEventListener('work-order-status-changed', handleDataUpdate)
    }
  }, [loadAllData])

  return {
    stats,
    pendingVehicles,
    activeOrders,
    readyVehicles,
    cancelledOrders,
    loading,
    error,
    loadAllData,
    loadPendingVehicles,
    loadActiveOrders,
    loadReadyVehicles,
    loadCancelledOrders,
    createWorkOrder,
    searchVehicles
  }
}
