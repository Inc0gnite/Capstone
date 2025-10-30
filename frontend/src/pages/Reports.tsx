import { useEffect, useMemo, useState } from 'react'
import { MainLayout } from '../components/Layout/MainLayout'
import { useAuthStore } from '../store/authStore'
import { dashboardService } from '../services/dashboardService'
import { workOrderService, type WorkOrder } from '../services/workOrderService'
import { sparePartService } from '../services/sparePartService'

type KPIs = {
  total: number
  pendientes: number
  en_progreso: number
  pausados: number
  completados: number
  cancelados: number
  completadosHoy: number
}

export default function Reports() {
  const { user } = useAuthStore()
  const workshopId = (user as any)?.workshopId
  const roleName = (user as any)?.role?.name

  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [mechanicsPerformance, setMechanicsPerformance] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<WorkOrder[]>([])
  const [lowStockParts, setLowStockParts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canSeeAllWorkshops = useMemo(() => roleName === 'Administrador', [roleName])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const kpisPromise = dashboardService.getGeneralStats(canSeeAllWorkshops ? undefined : workshopId)
        const perfPromise = dashboardService.getMechanicsPerformance(canSeeAllWorkshops ? undefined : workshopId)
        const ordersPromise = workOrderService.getAll({
          workshopId: canSeeAllWorkshops ? undefined : workshopId,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
        const lowStockPromise = sparePartService.getAll({
          page: 1,
          limit: 10,
          lowStock: true,
          workshopId: canSeeAllWorkshops ? undefined : workshopId,
        })

        const [k, perf, orders, parts] = await Promise.all([
          kpisPromise,
          perfPromise,
          ordersPromise,
          lowStockPromise,
        ])

        // Mapear kpis de backend → frontend
        const mappedKpis: KPIs = {
          total: k.total || 0,
          pendientes: k.pending || 0,
          en_progreso: k.inProgress || 0,
          pausados: k.paused || 0,
          completados: k.completed || 0,
          cancelados: k.cancelled || 0,
          completadosHoy: k.completedToday || 0,
        }

        setKpis(mappedKpis)
        setMechanicsPerformance(perf || [])
        setRecentOrders(orders.data || [])
        setLowStockParts(parts.data || [])
      } catch (err: any) {
        console.error('❌ Error cargando reportes:', err)
        setError(err?.response?.data?.message || 'Error cargando reportes')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [workshopId, canSeeAllWorkshops])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando reportes...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const hasAnyData = !!kpis || mechanicsPerformance.length > 0 || recentOrders.length > 0 || lowStockParts.length > 0

  // Estado de error o ausencia total de datos
  if (error || !hasAnyData) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
              <p className="text-gray-600">Indicadores y rendimiento del taller</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-3">🛈</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No hay reportes</h3>
            <p className="text-gray-600">{error ? 'No fue posible cargar los reportes en este momento.' : 'Aún no hay datos para mostrar.'}</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
            <p className="text-gray-600">Indicadores y rendimiento del taller</p>
          </div>
        </div>

        {/* KPIs */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KpiCard title="Total" value={kpis.total} color="gray" icon="📋" />
            <KpiCard title="Pendientes" value={kpis.pendientes} color="yellow" icon="⏳" />
            <KpiCard title="En Progreso" value={kpis.en_progreso} color="blue" icon="🔨" />
            <KpiCard title="Pausadas" value={kpis.pausados} color="orange" icon="⏸️" />
            <KpiCard title="Completadas" value={kpis.completados} color="green" icon="✅" />
            <KpiCard title="Hoy" value={kpis.completadosHoy} color="emerald" icon="📅" />
          </div>
        )}

        {/* Rendimiento de Mecánicos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Rendimiento de Mecánicos</h3>
          </div>
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
            <p className="text-gray-600">Sin datos de rendimiento.</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Órdenes recientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Órdenes recientes</h3>
            </div>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((o) => (
                  <div key={o.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900">{o.orderNumber}</div>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{o.currentStatus}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {o.vehicle?.licensePlate || 'N/A'} · {o.workType} · {o.priority}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No hay órdenes.</p>
            )}
          </div>

          {/* Repuestos con bajo stock */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Repuestos con bajo stock</h3>
            </div>
            {lowStockParts.length > 0 ? (
              <div className="space-y-3">
                {lowStockParts.map((p: any) => (
                  <div key={p.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <span className="text-sm text-red-600 font-medium">{p.currentStock} / {p.minStock}</span>
                    </div>
                    <div className="text-sm text-gray-600">{p.code} · {p.category || 'Sin categoría'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Sin alertas de stock.</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

function KpiCard({ title, value, color, icon }: { title: string; value: number; color: string; icon: string }) {
  const colorMap: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-900',
    yellow: 'bg-yellow-100 text-yellow-900',
    blue: 'bg-blue-100 text-blue-900',
    orange: 'bg-orange-100 text-orange-900',
    green: 'bg-green-100 text-green-900',
    emerald: 'bg-emerald-100 text-emerald-900',
  }
  return (
    <div className={`rounded-lg p-4 ${colorMap[color] || colorMap.gray}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium opacity-80">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  )
}


