import { MainLayout } from '../../components/Layout/MainLayout'
import { useAuthStore } from '../../store/authStore'
import { dashboardService } from '../../services/dashboardService'
import { workOrderService, WorkOrder } from '../../services/workOrderService'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface MechanicStats {
  pending: number
  inProgress: number
  completedToday: number
  totalMonth: number
  recentCompleted: Array<{
    orderNumber: string
    vehicle: string
    vehicleType: string
    completedAt: string
    totalHours: number | null
  }>
}

export default function MecanicoDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<MechanicStats>({
    pending: 0,
    inProgress: 0,
    completedToday: 0,
    totalMonth: 0,
    recentCompleted: []
  })
  const [inProgressOrders, setInProgressOrders] = useState<WorkOrder[]>([])
  const [pendingOrders, setPendingOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Cargar estadísticas y órdenes en paralelo
        const [mechanicStats, inProgressResponse, pendingResponse] = await Promise.all([
          dashboardService.getMechanicStats(user.id),
          workOrderService.getAll({
            assignedToId: user.id,
            status: 'en_progreso',
            limit: 5
          }),
          workOrderService.getAll({
            assignedToId: user.id,
            status: 'pendiente',
            limit: 10
          })
        ])
        
        setStats(mechanicStats)
        // Ordenar órdenes por prioridad (urgente > alta > normal > baja) y luego por fecha
        const priorityOrder: Record<string, number> = { urgente: 0, alta: 1, normal: 2, baja: 3 }
        
        const sortedInProgress = (inProgressResponse.data || []).sort((a, b) => {
          const priorityDiff = (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
          if (priorityDiff !== 0) return priorityDiff
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        
        const sortedPending = (pendingResponse.data || []).sort((a, b) => {
          const priorityDiff = (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
          if (priorityDiff !== 0) return priorityDiff
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        
        setInProgressOrders(sortedInProgress)
        setPendingOrders(sortedPending)
      } catch (err: any) {
        console.error('Error cargando estadísticas:', err)
        setError('Error al cargar las estadísticas')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user?.id])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-100 text-red-800'
      case 'alta':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      case 'baja':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return 'Urgente'
      case 'alta':
        return 'Alta'
      case 'normal':
        return 'Normal'
      case 'baja':
        return 'Baja'
      default:
        return priority
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Órdenes de Trabajo</h2>
          <p className="text-gray-600">Gestión de trabajos asignados</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Pendientes"
            value={stats.pending.toString()}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            title="En Progreso"
            value={stats.inProgress.toString()}
            icon="🔨"
            color="blue"
          />
          <StatCard
            title="Completadas Hoy"
            value={stats.completedToday.toString()}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Total Mes"
            value={stats.totalMonth.toString()}
            icon="📊"
            color="purple"
          />
        </div>

        {/* Botones de Navegación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/mechanic/orders"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-4">
              <div className="text-4xl">📋</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  Mis Órdenes
                </h3>
                <p className="text-gray-600 text-sm">
                  Gestiona todas tus órdenes de trabajo asignadas
                </p>
              </div>
              <div className="text-blue-600 text-2xl">→</div>
            </div>
          </Link>

          <Link
            to="/mechanic/spare-parts"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🔧</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  Repuestos
                </h3>
                <p className="text-gray-600 text-sm">
                  Consulta el inventario de repuestos disponibles
                </p>
              </div>
              <div className="text-blue-600 text-2xl">→</div>
            </div>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Órdenes en Progreso
            </h3>
            <Link
              to="/mechanic/orders"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ver todas →
            </Link>
          </div>
          
          {inProgressOrders.length > 0 ? (
            <div className="space-y-4">
              {inProgressOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {order.orderNumber}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                          {getPriorityText(order.priority)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          <p><span className="font-medium">Vehículo:</span> {order.vehicle?.licensePlate || 'N/A'}</p>
                          <p><span className="font-medium">Tipo:</span> {order.vehicle?.vehicleType || 'N/A'}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Trabajo:</span> {order.workType}</p>
                          <p><span className="font-medium">Horas:</span> {order.estimatedHours || 'N/A'}h</p>
                        </div>
                      </div>
                      
                      {order.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {order.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>Iniciada: {order.startedAt ? formatDate(order.startedAt) : 'N/A'}</span>
                        <Link
                          to={`/mechanic/orders`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver detalles →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">✅</div>
              <p className="text-gray-600">No tienes órdenes en progreso</p>
              <p className="text-sm text-gray-500 mt-2">Todas tus órdenes están completadas o pendientes</p>
            </div>
          )}
        </div>

        {/* Órdenes Pendientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Órdenes Pendientes
            </h3>
            {pendingOrders.length > 0 && (
              <Link
                to="/mechanic/orders"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver todas →
              </Link>
            )}
          </div>
          
          {pendingOrders.length > 0 ? (
            <div className="relative">
              {/* Contenedor deslizable */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex space-x-4 pb-4" style={{ width: 'max-content' }}>
                  {pendingOrders.map((order) => (
                    <div key={order.id} className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {order.orderNumber}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                            {getPriorityText(order.priority)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">⏳</span>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="text-sm">
                          <p className="text-gray-600">
                            <span className="font-medium">Vehículo:</span> {order.vehicle?.licensePlate || 'N/A'}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Tipo:</span> {order.workType}
                          </p>
                        </div>
                      </div>
                      
                      {order.description && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Descripción del trabajo:</p>
                          <p className="text-sm text-gray-600 line-clamp-3 bg-white p-2 rounded border">
                            {order.description}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Asignada: {formatDate(order.createdAt)}</span>
                        <Link
                          to={`/work-orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver detalles →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Indicador de scroll si hay más elementos */}
              {pendingOrders.length > 1 && (
                <div className="flex justify-center mt-2">
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(pendingOrders.length, 5) }).map((_, index) => (
                      <div key={index} className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">🎯</div>
              <p className="text-gray-600">No tienes órdenes pendientes</p>
              <p className="text-sm text-gray-500 mt-2">¡Excelente trabajo!</p>
            </div>
          )}
        </div>

        {/* Historial Completo */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Todas las Trabajos Completados
            </h3>
            {stats.recentCompleted.length > 0 && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {stats.recentCompleted.length} completadas
              </span>
            )}
          </div>
          {stats.recentCompleted.length > 0 ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {stats.recentCompleted.map((order, index) => (
                <CompletedWork
                  key={index}
                  orderNumber={order.orderNumber}
                  vehicle={order.vehicle}
                  vehicleType={order.vehicleType}
                  completedAt={formatCompletedAt(order.completedAt)}
                  duration={order.totalHours ? `${order.totalHours}h` : 'N/A'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <p className="text-gray-600">No hay trabajos completados</p>
              <p className="text-sm text-gray-500 mt-2">Los trabajos completados aparecerán aquí</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

function formatCompletedAt(completedAt: string): string {
  const date = new Date(completedAt)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 24) {
    return `Hoy ${date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffInHours < 48) {
    return `Ayer ${date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return date.toLocaleDateString('es-CL', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
}

function StatCard({ title, value, icon, color }: any) {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`text-4xl ${colors[color]} p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  )
}

function CompletedWork({ orderNumber, vehicle, vehicleType, completedAt, duration }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
      <div className="flex items-center space-x-3">
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-medium text-gray-900">{orderNumber} - {vehicle}</p>
          <p className="text-xs text-gray-600">
            {vehicleType} • Completado: {completedAt}
          </p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-sm font-medium text-gray-600">{duration}</span>
      </div>
    </div>
  )
}