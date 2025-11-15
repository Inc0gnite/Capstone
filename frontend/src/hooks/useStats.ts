import { useState, useEffect, useCallback, useRef } from 'react'
import { vehicleEntryService } from '../services/vehicleEntryService'

interface Stats {
  vehiclesInWorkshop: number
  entriesToday: number
  exitsToday: number
  totalEntries: number
}

export function useStats() {
  const [stats, setStats] = useState<Stats>({
    vehiclesInWorkshop: 0,
    entriesToday: 0,
    exitsToday: 0,
    totalEntries: 0
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
          totalEntries: 0
        })
        // Redirigir al login si no hay token
        window.location.href = '/login'
        return
      }
      
      // Optimizado: usar solo una petición con filtro de fecha para obtener todo
      const today = new Date().toISOString().split('T')[0]
      const [activeEntries, todayEntries] = await Promise.all([
        vehicleEntryService.getActiveEntries(),
        vehicleEntryService.getAll({ limit: 100, dateFrom: today })
      ])
      
      const entriesToday = todayEntries.data?.filter((entry: any) => 
        entry.entryDate && entry.entryDate.startsWith(today)
      ).length || 0
      
      const exitsToday = todayEntries.data?.filter((entry: any) => 
        entry.exitDate && entry.exitDate.startsWith(today)
      ).length || 0

      const newStats = {
        vehiclesInWorkshop: activeEntries.length,
        entriesToday,
        exitsToday,
        totalEntries: todayEntries.data?.length || 0
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
          totalEntries: 0
        })
      }
    } finally {
      setLoading(false)
    }
  }, [])

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

