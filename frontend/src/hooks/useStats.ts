import { useState, useEffect, useCallback, useRef } from 'react'
import { vehicleEntryService } from '../services/vehicleEntryService'

export type PeriodType = 'diario' | 'semanal' | 'mensual'

interface Stats {
  vehiclesInWorkshop: number
  entriesToday: number
  exitsToday: number
  totalEntries: number
  period: PeriodType
}

export function useStats(period: PeriodType = 'diario') {
  const [stats, setStats] = useState<Stats>({
    vehiclesInWorkshop: 0,
    entriesToday: 0,
    exitsToday: 0,
    totalEntries: 0,
    period
  })
  const [loading, setLoading] = useState(true)

  const loadStats = useCallback(async () => {
    try {
      setLoading(true)
      
      // Verificar autenticación
      const token = sessionStorage.getItem('accessToken')
      if (!token) {
        console.warn('⚠️ No hay token de autenticación - redirigiendo al login')
        setStats({
          vehiclesInWorkshop: 0,
          entriesToday: 0,
          exitsToday: 0,
          totalEntries: 0,
          period
        })
        // Redirigir al login si no hay token
        window.location.href = '/login'
        return
      }
      
      // Calcular fecha de inicio según el período
      const now = new Date()
      const startDate = new Date()
      const endDate = new Date()
      endDate.setHours(23, 59, 59, 999) // Hasta el final del día de hoy
      
      if (period === 'diario') {
        startDate.setHours(0, 0, 0, 0)
      } else if (period === 'semanal') {
        startDate.setDate(now.getDate() - 7)
        startDate.setHours(0, 0, 0, 0)
      } else if (period === 'mensual') {
        // Último mes: desde hace 30 días
        startDate.setDate(now.getDate() - 30)
        startDate.setHours(0, 0, 0, 0)
      }
      
      const dateFrom = startDate.toISOString().split('T')[0]
      const dateTo = endDate.toISOString().split('T')[0]
      const today = new Date().toISOString().split('T')[0]
      
      console.log(`📊 Cargando estadísticas - Período: ${period}`, {
        dateFrom,
        dateTo,
        today
      })
      
      const [activeEntries, periodEntriesResponse, todayEntriesResponse] = await Promise.all([
        vehicleEntryService.getActiveEntries(),
        vehicleEntryService.getAll({ limit: 100, dateFrom, dateTo }), // Límite máximo permitido por el backend
        vehicleEntryService.getAll({ limit: 100, dateFrom: today, dateTo: today })
      ])
      
      // La respuesta tiene estructura: { data: entries[], total, page, limit, totalPages }
      const periodEntries = periodEntriesResponse.data || []
      const todayEntries = todayEntriesResponse.data || []
      
      // Ingresos de hoy (siempre diario) - usar consulta separada para hoy
      const entriesToday = todayEntriesResponse.total || 0
      
      // Salidas de hoy (siempre diario) - contar desde los datos de hoy
      const exitsToday = todayEntries.filter((entry: any) => 
        entry.exitDate && entry.exitDate.startsWith(today)
      ).length

      // totalEntries: Total real de ingresos según el período seleccionado
      // Usar 'total' de la respuesta paginada para obtener el total real
      const totalEntries = periodEntriesResponse.total || 0
      
      console.log(`✅ Estadísticas cargadas - Total: ${totalEntries}, Hoy: ${entriesToday}`, {
        periodEntriesCount: periodEntries.length,
        periodTotal: periodEntriesResponse.total,
        todayEntriesCount: todayEntries.length,
        todayTotal: todayEntriesResponse.total
      })

      const newStats = {
        vehiclesInWorkshop: activeEntries.length,
        entriesToday,
        exitsToday,
        totalEntries,
        period
      }

      setStats(newStats)
      
    } catch (error: any) {
      console.error('❌ Error cargando estadísticas:', error)
      
      // Manejar errores específicos
      if (error.response?.status === 401) {
        console.warn('🔐 Error de autenticación - redirigiendo al login')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      } else if (error.response?.status === 403) {
        console.warn('🚫 Sin permisos para acceder a los datos')
      } else if (error.response?.status === 429) {
        console.warn('⚠️ Rate limit alcanzado, esperando antes de reintentar...')
        // No actualizar stats para mantener los valores anteriores
        return
      } else if (error.code === 'ECONNREFUSED') {
        console.warn('🌐 Error de conexión: Backend no disponible en puerto 3000')
        console.warn('💡 Verificar que el backend esté ejecutándose')
      } else {
        console.warn('🌐 Error de conexión con el servidor:', error.message)
      }
      
      // Mantener valores en 0 en caso de error (excepto 429)
      if (error.response?.status !== 429) {
        setStats({
          vehiclesInWorkshop: 0,
          entriesToday: 0,
          exitsToday: 0,
          totalEntries: 0,
          period
        })
      }
    } finally {
      setLoading(false)
    }
  }, [period])

  const refreshStats = useCallback(() => {
    loadStats()
  }, [loadStats])

  // Throttle: evitar cargar stats muy frecuentemente
  const lastLoadTimeRef = useRef(0)
  const MIN_LOAD_INTERVAL = 10000 // Mínimo 10 segundos entre cargas

  useEffect(() => {
    const now = Date.now()
    if (now - lastLoadTimeRef.current < MIN_LOAD_INTERVAL) {
      // Si se intenta cargar muy pronto, esperar
      const timeout = setTimeout(() => {
        loadStats()
        lastLoadTimeRef.current = Date.now()
      }, MIN_LOAD_INTERVAL - (now - lastLoadTimeRef.current))
      return () => clearTimeout(timeout)
    }
    
    loadStats()
    lastLoadTimeRef.current = now
  }, [loadStats])

  // Escuchar eventos de actualización de datos
  useEffect(() => {
    const handleDataUpdate = () => {
      refreshStats()
    }

    // Escuchar eventos personalizados
    window.addEventListener('entry-created', handleDataUpdate)
    window.addEventListener('entry-updated', handleDataUpdate)
    window.addEventListener('exit-registered', handleDataUpdate)

    return () => {
      window.removeEventListener('entry-created', handleDataUpdate)
      window.removeEventListener('entry-updated', handleDataUpdate)
      window.removeEventListener('exit-registered', handleDataUpdate)
    }
  }, [refreshStats])

  return {
    stats,
    loading,
    refreshStats
  }
}

