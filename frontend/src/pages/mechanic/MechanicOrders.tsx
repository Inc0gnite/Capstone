import { MainLayout } from '../../components/Layout/MainLayout'
import { useAuthStore } from '../../store/authStore'
import { workOrderService, WorkOrder } from '../../services/workOrderService'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function MechanicOrders() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
  
  // Verificar si hay una orden en progreso
  const hasOrderInProgress = orders.some(order => order.currentStatus === 'en_progreso')

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.id) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Obtener todas las órdenes asignadas al mecánico
        const response = await workOrderService.getAll({
          assignedToId: user.id,
          page: 1,
          limit: 100
        })
        
        // Ordenar órdenes por prioridad (urgente > alta > normal > baja) y luego por fecha
        const priorityOrder: Record<string, number> = { urgente: 0, alta: 1, normal: 2, baja: 3 }
        const sortedOrders = (response.data || []).sort((a, b) => {
          const priorityDiff = (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
          if (priorityDiff !== 0) {
            return priorityDiff
          }
          // Si tienen la misma prioridad, ordenar por fecha ascendente (más nuevas primero)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        
        setOrders(sortedOrders)
      } catch (err: any) {
        console.error('Error cargando órdenes:', err)
        setError('Error al cargar las órdenes')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [user?.id])

  const filteredOrders = orders.filter(order => {
    switch (filter) {
      case 'pending':
        return order.currentStatus === 'pendiente'
      case 'in_progress':
        return order.currentStatus === 'en_progreso'
      case 'completed':
        return order.currentStatus === 'completado'
      default:
        return true
    }
  })
  
  // Asegurar que las órdenes filtradas también estén ordenadas
  const priorityOrder: Record<string, number> = { urgente: 0, alta: 1, normal: 2, baja: 3 }
  const sortedFilteredOrders = filteredOrders.sort((a, b) => {
    const priorityDiff = (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
    if (priorityDiff !== 0) {
      return priorityDiff
    }
    // Ordenar por fecha ascendente (más nuevas primero)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      console.log('🔄 Cambiando estado de orden:', { orderId, newStatus })
      
      const result = await workOrderService.changeStatus(orderId, newStatus)
      console.log('✅ Estado cambiado exitosamente:', result)
      
      // Actualizar la orden en el estado local
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, currentStatus: newStatus }
            : order
        )
      )
      
      // Emitir evento para actualización en tiempo real
      window.dispatchEvent(new CustomEvent('work-order-status-changed', {
        detail: { orderId, newStatus }
      }))
      
    } catch (err: any) {
      console.error('❌ Error cambiando estado:', err)
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Error cambiando estado'
      setError(errorMessage)
      
      // Mostrar error temporalmente
      setTimeout(() => setError(null), 5000)
      
      alert(`Error: ${errorMessage}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800'
      case 'completado':
        return 'bg-green-100 text-green-800'
      case 'pausado':
        return 'bg-orange-100 text-orange-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'Pendiente'
      case 'en_progreso':
        return 'En Progreso'
      case 'completado':
        return 'Completado'
      case 'pausado':
        return 'Pausado'
      case 'cancelado':
        return 'Cancelado'
      default:
        return status
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

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando órdenes...</p>
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
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mis Órdenes de Trabajo</h2>
            <p className="text-gray-600">Gestiona las órdenes asignadas a ti</p>
          </div>
          <div className="text-sm text-gray-500">
            Total: {orders.length} órdenes
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendientes ({orders.filter(o => o.currentStatus === 'pendiente').length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'in_progress'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En Progreso ({orders.filter(o => o.currentStatus === 'en_progreso').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completadas ({orders.filter(o => o.currentStatus === 'completado').length})
            </button>
          </div>
        </div>

        {/* Lista de Órdenes */}
        <div className="space-y-4">
          {sortedFilteredOrders.length > 0 ? (
            sortedFilteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.orderNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.currentStatus)}`}>
                        {getStatusText(order.currentStatus)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(order.priority)}`}>
                        {getPriorityText(order.priority)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><span className="font-medium">Vehículo:</span> {order.vehicle?.licensePlate || 'N/A'}</p>
                        <p><span className="font-medium">Tipo:</span> {order.vehicle?.vehicleType || 'N/A'}</p>
                        <p><span className="font-medium">Marca:</span> {order.vehicle?.brand || 'N/A'}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Tipo de Trabajo:</span> {order.workType}</p>
                        <p><span className="font-medium">Horas Estimadas:</span> {order.estimatedHours || 'N/A'}</p>
                        <p><span className="font-medium">Horas Reales:</span> {order.totalHours || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {order.description && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Descripción:</span> {order.description}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-3 text-xs text-gray-500">
                      <p>Creada: {new Date(order.createdAt).toLocaleDateString('es-CL')}</p>
                      {order.startedAt && (
                        <p>Iniciada: {new Date(order.startedAt).toLocaleDateString('es-CL')}</p>
                      )}
                      {order.completedAt && (
                        <p>Completada: {new Date(order.completedAt).toLocaleDateString('es-CL')}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Link
                      to={`/work-orders/${order.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm text-center"
                    >
                      Ver Detalles
                    </Link>
                    {order.currentStatus === 'pendiente' && (
                      <button 
                        onClick={() => handleStatusChange(order.id, 'en_progreso')}
                        disabled={hasOrderInProgress}
                        className={`px-4 py-2 font-medium text-sm rounded-lg ${
                          hasOrderInProgress
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        title={hasOrderInProgress ? 'Ya tienes una orden en progreso' : ''}
                      >
                        {hasOrderInProgress ? '⚠️ No disponible' : 'Iniciar Trabajo'}
                      </button>
                    )}
                    {order.currentStatus === 'en_progreso' && (
                      <button 
                        onClick={() => handleStatusChange(order.id, 'pausado')}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm"
                      >
                        Pausar
                      </button>
                    )}
                    {order.currentStatus === 'pausado' && (
                      <button 
                        onClick={() => handleStatusChange(order.id, 'en_progreso')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                      >
                        ▶️ Reanudar
                      </button>
                    )}
                    {(order.currentStatus === 'en_progreso' || order.currentStatus === 'pausado') && (
                      <button 
                        onClick={() => handleStatusChange(order.id, 'completado')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                      >
                        ✅ Completar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay órdenes {filter === 'all' ? '' : `con estado ${filter}`}
              </h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'No tienes órdenes de trabajo asignadas'
                  : `No tienes órdenes con estado ${filter}`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
