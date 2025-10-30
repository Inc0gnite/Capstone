import { useState, useEffect, useCallback } from 'react'
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
      
      // Cargar estadísticas básicas
      const [activeEntries, allEntries] = await Promise.all([
        vehicleEntryService.getActiveEntries(),
        vehicleEntryService.getAll({ limit: 100 })
      ])
      
      const today = new Date().toISOString().split('T')[0]
      const entriesToday = allEntries.data?.filter((entry: any) => 
        entry.entryDate.startsWith(today)
      ).length || 0
      
      const exitsToday = allEntries.data?.filter((entry: any) => 
        entry.exitDate && entry.exitDate.startsWith(today)
      ).length || 0

      const newStats = {
        vehiclesInWorkshop: activeEntries.length,
        entriesToday,
        exitsToday,
        totalEntries: allEntries.data?.length || 0
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
      } else if (error.code === 'ECONNREFUSED') {
        console.warn('🌐 Error de conexión: Backend no disponible en puerto 3000')
        console.warn('💡 Verificar que el backend esté ejecutándose')
      } else {
        console.warn('🌐 Error de conexión con el servidor:', error.message)
      }
      
      // Mantener valores en 0 en caso de error
      setStats({
        vehiclesInWorkshop: 0,
        entriesToday: 0,
        exitsToday: 0,
        totalEntries: 0
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshStats = useCallback(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadStats()
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

