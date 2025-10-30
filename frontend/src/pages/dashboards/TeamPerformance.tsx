import { useEffect, useState } from 'react'
import { MainLayout } from '../../components/Layout/MainLayout'
import { useAuthStore } from '../../store/authStore'
import { mechanicCapacityService } from '../../services/mechanicCapacityService'
import { dashboardService } from '../../services/dashboardService'
import { MechanicCapacityList } from '../../components/MechanicCapacityIndicator'

export default function TeamPerformance() {
  const { user } = useAuthStore()
  const workshopId = (user as any)?.workshopId

  const [mechanicCapacity, setMechanicCapacity] = useState<any[]>([])
  const [mechanicsPerformance, setMechanicsPerformance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!workshopId) return
      try {
        setLoading(true)
        setError(null)
        const [cap, perf] = await Promise.all([
          mechanicCapacityService.getMechanicCapacity(workshopId),
          dashboardService.getMechanicsPerformance(workshopId),
        ])
        setMechanicCapacity(cap.mechanics || [])
        setMechanicsPerformance(perf || [])
      } catch (err: any) {
        console.error('❌ Error cargando equipo:', err)
        setError('No fue posible cargar el rendimiento del equipo.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [workshopId])

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equipo del Taller</h2>
          <p className="text-gray-600">Capacidad y rendimiento de todos los mecánicos</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-3">🛈</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No hay reportes</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacidad de Mecánicos (por horas)</h3>
              <MechanicCapacityList mechanics={mechanicCapacity} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento</h3>
              {mechanicsPerformance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-600">
                        <th className="py-2 pr-4">Mecánico</th>
                        <th className="py-2 pr-4">Órdenes</th>
                        <th className="py-2 pr-4">En Progreso</th>
                        <th className="py-2 pr-4">Completadas</th>
                        <th className="py-2 pr-4">Horas Totales</th>
                        <th className="py-2 pr-4">Promedio (h)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mechanicsPerformance.map((m: any) => (
                        <tr key={m.id} className="border-t">
                          <td className="py-2 pr-4">{m.name}</td>
                          <td className="py-2 pr-4">{m.totalOrders}</td>
                          <td className="py-2 pr-4">{m.inProgressOrders}</td>
                          <td className="py-2 pr-4">{m.completedOrders}</td>
                          <td className="py-2 pr-4">{m.totalHours}</td>
                          <td className="py-2 pr-4">{m.averageHours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No hay datos de rendimiento disponibles</p>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}




