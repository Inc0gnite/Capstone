import { MainLayout } from '../../components/Layout/MainLayout'
import { MechanicCapacityList } from '../../components/MechanicCapacityIndicator'
import { mechanicCapacityService } from '../../services/mechanicCapacityService'
import { dashboardService } from '../../services/dashboardService'
import { workOrderService } from '../../services/workOrderService'
import { useAuthStore } from '../../store/authStore'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function JefeTallerDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [mechanicCapacity, setMechanicCapacity] = useState<any[]>([])
  const [loadingCapacity, setLoadingCapacity] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [mechanicsPerformance, setMechanicsPerformance] = useState<any[]>([])
  const [loadingPerformance, setLoadingPerformance] = useState(false)

  useEffect(() => {
    if (user?.workshopId) {
      loadAllData()
    }
  }, [user?.workshopId])

  const loadAllData = async () => {
    await Promise.all([
      loadMechanicCapacity(),
      loadStats(),
      loadWorkOrders(),
      loadMechanicsPerformance()
    ])
  }

  const loadMechanicCapacity = async () => {
    if (!user?.workshopId) return

    try {
      setLoadingCapacity(true)
      const response = await mechanicCapacityService.getMechanicCapacity(user.workshopId)
      setMechanicCapacity(response.mechanics || [])
    } catch (error) {
      console.error('Error cargando capacidad de mecánicos:', error)
      setMechanicCapacity([])
    } finally {
      setLoadingCapacity(false)
    }
  }

  const loadStats = async () => {
    if (!user?.workshopId) return

    try {
      setLoadingStats(true)
      const response = await dashboardService.getGeneralStats(user.workshopId)
      setStats(response)
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
      setStats(null)
    } finally {
      setLoadingStats(false)
    }
  }

  const loadWorkOrders = async () => {
    if (!user?.workshopId) return

    try {
      setLoadingOrders(true)
      const response = await workOrderService.getAll({ 
        workshopId: user.workshopId,
        limit: 5 
      })
      setWorkOrders(response.data || [])
    } catch (error) {
      console.error('Error cargando órdenes:', error)
      setWorkOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }

  const loadMechanicsPerformance = async () => {
    if (!user?.workshopId) return

    try {
      setLoadingPerformance(true)
      const response = await dashboardService.getMechanicsPerformance(user.workshopId)
      setMechanicsPerformance(response || [])
    } catch (error) {
      console.error('Error cargando rendimiento de mecánicos:', error)
      setMechanicsPerformance([])
    } finally {
      setLoadingPerformance(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Supervisión del Taller</h2>
          <p className="text-gray-600">Monitoreo y control de operaciones</p>
        </div>

        {/* Stats Cards */}
        {loadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Órdenes Activas"
              value={stats?.activeWorkOrders || 0}
              change={`Total: ${stats?.totalWorkOrders || 0}`}
              icon="🔨"
              color="blue"
            />
            <StatCard
              title="Mecánicos Trabajando"
              value={`${mechanicsPerformance.length}/${mechanicCapacity.length}`}
              change={`${mechanicCapacity.length > 0 ? Math.round((mechanicsPerformance.length / mechanicCapacity.length) * 100) : 0}% activos`}
              icon="👷"
              color="green"
            />
            <StatCard
              title="Completadas Hoy"
              value={stats?.completedToday || 0}
              change="Hoy"
              icon="✅"
              color="purple"
            />
            <StatCard
              title="Órdenes Pendientes"
              value={stats?.pendingWorkOrders || 0}
              change="Esperando asignación"
              icon="⏳"
              color="yellow"
            />
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estado de Órdenes */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estado de Órdenes de Trabajo
            </h3>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <OrderStatusCount status="Pendiente" count={stats?.pendingWorkOrders || 0} color="yellow" />
              <OrderStatusCount status="En Progreso" count={workOrders.filter(o => o.currentStatus === 'en_progreso').length} color="blue" />
              <OrderStatusCount status="Pausado" count={workOrders.filter(o => o.currentStatus === 'pausado').length} color="orange" />
              <OrderStatusCount status="Completado" count={stats?.completedToday || 0} color="green" />
            </div>

            {loadingOrders ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : workOrders.length > 0 ? (
              <div className="space-y-3">
                {workOrders.map((order) => (
                  <OrderProgress
                    key={order.id}
                    orderNumber={order.orderNumber}
                    vehicle={order.vehicle?.licensePlate || 'N/A'}
                    mechanic={order.assignedTo ? `${order.assignedTo.firstName} ${order.assignedTo.lastName}` : 'Sin asignar'}
                    progress={order.currentStatus === 'completado' ? 100 : order.currentStatus === 'en_progreso' ? 50 : 0}
                    priority={order.priority}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay órdenes de trabajo
              </div>
            )}
          </div>

          {/* Rendimiento de Mecánicos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rendimiento del Equipo
            </h3>
            
            {/* Indicadores de Capacidad */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <MechanicCapacityList 
                mechanics={mechanicCapacity}
                className="mb-4"
              />
            </div>
            
            {loadingPerformance ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  </div>
                ))}
              </div>
            ) : mechanicsPerformance.length > 0 ? (
              <div className="space-y-4">
                {mechanicsPerformance.map((mechanic) => (
                  <MechanicPerformance
                    key={mechanic.id}
                    name={mechanic.name}
                    efficiency={Math.round(mechanic.averageHours || 0)}
                    tasksCompleted={mechanic.completedOrders || 0}
                    tasksActive={mechanic.inProgressOrders || 0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No hay datos de rendimiento disponibles
              </div>
            )}
            <button
              onClick={() => navigate('/dashboard/jefe-taller/equipo')}
              className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Ver equipo completo →
            </button>
          </div>
        </div>

        {/* Alertas y Recursos - Comentados temporalmente hasta implementar datos reales */}
        {/* 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Alertas e Incidencias
              </h3>
            </div>
            <div className="text-center py-8 text-gray-500">
              Las alertas se mostrarán aquí cuando haya datos reales
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estado de Recursos
            </h3>
            <div className="text-center py-8 text-gray-500">
              El estado de recursos se mostrará aquí cuando haya datos reales
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rendimiento Semanal
          </h3>
          <div className="text-center py-8 text-gray-500">
            Las estadísticas semanales se mostrarán aquí cuando haya datos reales
          </div>
        </div>
        */}

        {/* Acciones rápidas removidas por solicitud */}
      </div>
    </MainLayout>
  )
}

function StatCard({ title, value, change, icon, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{change}</p>
        </div>
        <div className={`text-4xl ${colors[color]} p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  )
}

function OrderStatusCount({ status, count, color }: any) {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    green: 'bg-green-100 text-green-800 border-green-200',
  }

  return (
    <div className={`border-2 ${colors[color]} rounded-lg p-4 text-center`}>
      <p className="text-3xl font-bold">{count}</p>
      <p className="text-sm font-medium mt-1">{status}</p>
    </div>
  )
}

function OrderProgress({ orderNumber, vehicle, mechanic, progress, priority }: any) {
  const priorityColors: Record<string, string> = {
    urgente: 'bg-red-100 text-red-800',
    alta: 'bg-orange-100 text-orange-800',
    normal: 'bg-yellow-100 text-yellow-800',
    baja: 'bg-blue-100 text-blue-800',
  }

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      urgente: 'Urgente',
      alta: 'Alta',
      normal: 'Normal',
      baja: 'Baja',
    }
    return labels[priority] || priority
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{orderNumber} - {vehicle}</p>
          <p className="text-sm text-gray-600">Mecánico: {mechanic}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[priority] || 'bg-gray-100 text-gray-800'}`}>
          {getPriorityLabel(priority)}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium text-gray-700">{progress}%</span>
      </div>
    </div>
  )
}

function MechanicPerformance({ name, efficiency, tasksCompleted, tasksActive }: any) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium text-gray-900">{name}</p>
        <span className="text-sm font-bold text-blue-600">{efficiency}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
        <div
          className="bg-blue-600 h-1.5 rounded-full"
          style={{ width: `${efficiency}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>✅ {tasksCompleted}</span>
        <span>🔨 {tasksActive} activas</span>
      </div>
    </div>
  )
}

function Alert({ type, message, time }: any) {
  const typeConfig: Record<string, any> = {
    crítico: { icon: '🔴', color: 'bg-red-50 border-red-200' },
    advertencia: { icon: '⚠️', color: 'bg-yellow-50 border-yellow-200' },
    info: { icon: 'ℹ️', color: 'bg-blue-50 border-blue-200' },
  }

  const config = typeConfig[type]

  return (
    <div className={`p-3 border rounded-lg ${config.color}`}>
      <div className="flex items-start space-x-2">
        <span className="text-xl">{config.icon}</span>
        <div className="flex-1">
          <p className="text-sm text-gray-800">{message}</p>
          <p className="text-xs text-gray-500 mt-1">{time}</p>
        </div>
      </div>
    </div>
  )
}

function ResourceStatus({ name, current, max, unit }: any) {
  const percentage = (current / max) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-gray-700">{name}</p>
        <p className="text-sm text-gray-600">
          {current}/{max} {unit}
        </p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

function DayPerformance({ day, completed, total }: any) {
  const percentage = total > 0 ? (completed / total) * 100 : 0

  return (
    <div className="text-center">
      <p className="text-xs font-medium text-gray-600 mb-1">{day}</p>
      <div className="h-24 bg-gray-200 rounded relative">
        <div
          className="bg-blue-600 rounded absolute bottom-0 left-0 right-0"
          style={{ height: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {completed}/{total}
      </p>
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


