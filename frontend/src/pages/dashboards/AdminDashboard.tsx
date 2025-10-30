import { useEffect, useState } from 'react'
import { MainLayout } from '../../components/Layout/MainLayout'
import { useNavigate } from 'react-router-dom'
import { dashboardService } from '../../services/dashboardService'
import { workOrderService } from '../../services/workOrderService'
import { sparePartService } from '../../services/sparePartService'
import { vehicleService } from '../../services/vehicleService'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState<boolean>(true)
  const [urgentOrders, setUrgentOrders] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [mechanicsPerformance, setMechanicsPerformance] = useState<any[]>([])
  const [lowStock, setLowStock] = useState<any[]>([])
  const [totalVehicles, setTotalVehicles] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingStats(true)
        setError(null)

        const [s, perf, recent, urgent, stock, vehicles] = await Promise.all([
          dashboardService.getGeneralStats(),
          dashboardService.getMechanicsPerformance(),
          dashboardService.getRecentActivity(undefined, 8),
          workOrderService.getAll({ limit: 5 }),
          sparePartService.getAll({ page: 1, limit: 5, lowStock: true }),
          vehicleService.getAll(),
        ])

        setStats(s)
        setMechanicsPerformance(perf || [])
        setRecentActivity(recent || [])
        const urgentList = (urgent.data || []).filter((o: any) => ['urgente', 'alta'].includes(o.priority))
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setUrgentOrders(urgentList)
        setLowStock(stock.data || [])
        setTotalVehicles((vehicles.data || []).length)
      } catch (err: any) {
        console.error('❌ Error cargando dashboard administrador:', err)
        setError('No fue posible cargar los datos del dashboard.')
      } finally {
        setLoadingStats(false)
      }
    }
    loadData()
  }, [])

  return (
    <MainLayout>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Panel de Administrador</h2>
          <p className="text-gray-600">Vista general del sistema</p>
        </div>
        {/* Stats Cards */}
        {loadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Vehículos"
              value={(totalVehicles || 0).toString()}
              change=""
              icon="🚗"
              color="blue"
            />
            <StatCard
              title="Órdenes Activas"
              value={(stats?.inProgress || 0).toString()}
              change={`Total: ${stats?.total || 0}`}
              icon="🔨"
              color="yellow"
            />
            <StatCard
              title="En Taller"
              value={(stats?.pending || 0).toString()}
              change="Pendientes"
              icon="🏭"
              color="green"
            />
            <StatCard
              title="Completadas Hoy"
              value={(stats?.completedToday || 0).toString()}
              change="Hoy"
              icon="✅"
              color="purple"
            />
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Órdenes Urgentes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Órdenes Urgentes</h3>
              <span className="text-sm text-red-600 font-medium">{urgentOrders.filter(o => o.priority === 'urgente').length} críticas</span>
            </div>
            <div className="space-y-3">
              {urgentOrders.length > 0 ? urgentOrders.map((o) => (
                <OrderItem
                  key={o.id}
                  orderNumber={o.orderNumber}
                  vehicle={o.vehicle?.licensePlate || 'N/A'}
                  priority={o.priority === 'urgente' ? 'crítica' : o.priority}
                  mechanic={o.assignedTo ? `${o.assignedTo.firstName} ${o.assignedTo.lastName}` : 'Sin asignar'}
                />
              )) : (
                <p className="text-gray-500 text-sm">No hay órdenes urgentes</p>
              )}
            </div>
            <button className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
              Ver todas las órdenes →
            </button>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((a: any, idx: number) => (
                <ActivityItem
                  key={idx}
                  icon="🛈"
                  title={a.title || a.action || 'Actividad'}
                  description={a.description || a.resource || ''}
                  time={new Date(a.createdAt || Date.now()).toLocaleString()}
                />
              )) : (
                <p className="text-gray-500 text-sm">Sin actividad reciente</p>
              )}
            </div>
          </div>

          {/* Rendimiento de Mecánicos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rendimiento del Equipo
            </h3>
            <div className="space-y-4">
              {mechanicsPerformance.length > 0 ? mechanicsPerformance.map((m: any) => (
                <MechanicPerformance
                  key={m.id}
                  name={m.name}
                  completed={m.completedOrders}
                  inProgress={m.inProgressOrders}
                  efficiency={Math.round(m.averageHours || 0)}
                />
              )) : (
                <p className="text-gray-500 text-sm">No hay datos de rendimiento</p>
              )}
            </div>
          </div>

          {/* Stock Bajo */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Alertas de Stock</h3>
              <span className="text-sm text-orange-600 font-medium">{lowStock.length} items</span>
            </div>
            <div className="space-y-3">
              {lowStock.length > 0 ? lowStock.map((p: any) => (
                <StockAlert key={p.id} item={p.name} current={p.currentStock} min={p.minStock} />
              )) : (
                <p className="text-gray-500 text-sm">Sin alertas de stock</p>
              )}
            </div>
            <button className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
              Ver inventario completo →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction icon="➕" label="Nuevo Usuario" onClick={() => navigate('/users')} />
            <QuickAction icon="🚗" label="Registrar Vehículo" onClick={() => navigate('/vehicles')} />
            <QuickAction icon="📝" label="Nuevo Ingreso" onClick={() => navigate('/entries')} />
            <QuickAction icon="✅" label="Registrar Salida" onClick={() => navigate('/entries?action=exit')} />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

// Componentes auxiliares
function StatCard({ title, value, change, icon, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{change} vs mes anterior</p>
        </div>
        <div className={`text-4xl ${colors[color]} p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  )
}

function OrderItem({ orderNumber, vehicle, priority, mechanic }: any) {
  const priorityColors: Record<string, string> = {
    crítica: 'bg-red-100 text-red-800',
    alta: 'bg-orange-100 text-orange-800',
    media: 'bg-yellow-100 text-yellow-800',
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{orderNumber}</p>
        <p className="text-sm text-gray-600">Vehículo: {vehicle}</p>
        <p className="text-xs text-gray-500">Mecánico: {mechanic}</p>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[priority]}`}>
        {priority}
      </span>
    </div>
  )
}

function ActivityItem({ icon, title, description, time }: any) {
  return (
    <div className="flex items-start space-x-3">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  )
}

function MechanicPerformance({ name, completed, inProgress, efficiency }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <p className="text-sm font-bold text-blue-600">{efficiency}%</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${efficiency}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-1">
        <p className="text-xs text-gray-500">✅ {completed} completadas</p>
        <p className="text-xs text-gray-500">🔨 {inProgress} en progreso</p>
      </div>
    </div>
  )
}

function StockAlert({ item, current, min }: any) {
  const percentage = (current / min) * 100
  const isLow = percentage < 50

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{item}</p>
        <div className="flex items-center space-x-2 mt-1">
          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${isLow ? 'bg-red-500' : 'bg-orange-500'}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-600">
            {current}/{min}
          </span>
        </div>
      </div>
    </div>
  )
}

function QuickAction({ icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
      <span className="text-3xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  )
}


