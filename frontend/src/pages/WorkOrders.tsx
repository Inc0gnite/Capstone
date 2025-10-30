import { useState, useEffect } from 'react'
import { MainLayout } from '../components/Layout/MainLayout'
import { useWorkOrders } from '../hooks/useWorkOrders'
import { ActiveOrderCard } from '../components/recepcionista/ActiveOrderCard'
import { CreateWorkOrderFromVehicleModal } from '../components/modals/CreateWorkOrderFromVehicleModal'
import { useAuthStore } from '../store/authStore'
import { mechanicService, MechanicWorkload } from '../services/mechanicService'

export default function WorkOrders() {
  const [filter, setFilter] = useState<'all' | 'pendiente' | 'en_progreso' | 'pausado' | 'completado' | 'cancelado'>('all')
  const [selectedMechanic, setSelectedMechanic] = useState<string>('')
  const [mechanics, setMechanics] = useState<MechanicWorkload[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { user } = useAuthStore()
  
  // Obtener workshopId y rol del usuario actual
  const workshopId = (user as any)?.workshopId
  const userRole = (user as any)?.role?.name
  
  const {
    workOrders,
    stats,
    loading,
    error,
    loadWorkOrders,
    loadStatsFromDB,
    loadPendingOrders,
    loadActiveOrders,
    loadPausedOrders,
    loadCompletedOrders,
    loadCancelledOrders
  } = useWorkOrders(workshopId, selectedMechanic || undefined)

  // Cargar mecánicos del taller
  useEffect(() => {
    const loadMechanics = async () => {
      if (!workshopId) return
      
      try {
        const mechanicsData = await mechanicService.getAvailableMechanics(workshopId)
        setMechanics(mechanicsData)
      } catch (err) {
        console.error('Error cargando mecánicos:', err)
      }
    }
    
    loadMechanics()
  }, [workshopId])

  const handleFilterChange = async (newFilter: typeof filter) => {
    setFilter(newFilter)
    
    switch (newFilter) {
      case 'pendiente':
        await loadPendingOrders()
        break
      case 'en_progreso':
        await loadActiveOrders()
        break
      case 'pausado':
        await loadPausedOrders()
        break
      case 'completado':
        await loadCompletedOrders()
        break
      case 'cancelado':
        await loadCancelledOrders()
        break
      default:
        await loadWorkOrders()
        break
    }
  }

  const handleCreateOrder = () => {
    setShowCreateModal(true)
  }

  const handleModalClose = () => {
    setShowCreateModal(false)
  }

  const handleOrderCreated = () => {
    setShowCreateModal(false)
    // Recargar las órdenes después de crear una nueva
    handleFilterChange(filter)
  }

  const handleMechanicChange = async (mechanicId: string) => {
    setSelectedMechanic(mechanicId)
    // El hook useWorkOrders detectará automáticamente el cambio en assignedToId
    // y recargará las órdenes. Solo necesitamos actualizar el estado.
  }

  // Recargar órdenes cuando cambie el mecánico seleccionado
  useEffect(() => {
    // Recargar con el filtro actual cuando cambie el mecánico
    handleFilterChange(filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMechanic])

  const getFilterStats = () => {
    switch (filter) {
      case 'pendiente':
        return { count: stats.pendientes, label: 'Pendientes' }
      case 'en_progreso':
        return { count: stats.en_progreso, label: 'En Progreso' }
      case 'pausado':
        return { count: stats.pausados || 0, label: 'Pausadas' }
      case 'completado':
        return { count: stats.completados, label: 'Completadas' }
      case 'cancelado':
        return { count: stats.cancelados || 0, label: 'Canceladas' }
      default:
        return { count: stats.total, label: 'Total' }
    }
  }

  const filterStats = getFilterStats()

  if (loading && workOrders.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando órdenes de trabajo...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-900">Órdenes de Trabajo</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Actualización en tiempo real</span>
              </div>
            </div>
            <p className="text-gray-600">Gestión y seguimiento de órdenes</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                loadStatsFromDB()
                handleFilterChange(filter)
              }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors flex items-center space-x-2"
              title="Actualizar estadísticas desde BD"
            >
              <span className={`${loading ? 'animate-spin' : ''}`}>🔄</span>
              <span>Actualizar </span>
            </button>
            {/* Solo mostrar botón de crear para roles que no sean Jefe de Taller */}
            {userRole !== 'Jefe de Taller' && (
              <button
                onClick={handleCreateOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                📝 Nueva Orden
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total"
            value={(stats.total || 0).toString()}
            icon="📋"
            color="gray"
            onClick={() => handleFilterChange('all')}
            active={filter === 'all'}
          />
          <StatCard
            title="Pendientes"
            value={(stats.pendientes || 0).toString()}
            icon="⏳"
            color="yellow"
            onClick={() => handleFilterChange('pendiente')}
            active={filter === 'pendiente'}
          />
          <StatCard
            title="En Progreso"
            value={(stats.en_progreso || 0).toString()}
            icon="🔨"
            color="blue"
            onClick={() => handleFilterChange('en_progreso')}
            active={filter === 'en_progreso'}
          />
          <StatCard
            title="Completadas"
            value={(stats.completados || 0).toString()}
            icon="✅"
            color="green"
            onClick={() => handleFilterChange('completado')}
            active={filter === 'completado'}
          />
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {filterStats.label} ({filterStats.count})
            </h3>
            <div className="flex items-center space-x-4">
              {/* Selector de Mecánico */}
              <div className="flex items-center space-x-2">
                <label htmlFor="mechanic-filter" className="text-sm font-medium text-gray-700">
                  Mecánico:
                </label>
                <select
                  id="mechanic-filter"
                  value={selectedMechanic}
                  onChange={(e) => handleMechanicChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los mecánicos</option>
                  {mechanics.map((mechanic) => (
                    <option key={mechanic.mechanicId} value={mechanic.mechanicId}>
                      {mechanic.mechanicName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => handleFilterChange('pendiente')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === 'pendiente'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => handleFilterChange('en_progreso')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === 'en_progreso'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En Progreso
              </button>
              <button
                onClick={() => handleFilterChange('pausado')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === 'pausado'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pausadas
              </button>
              <button
                onClick={() => handleFilterChange('completado')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === 'completado'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completadas
              </button>
              <button
                onClick={() => handleFilterChange('cancelado')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === 'cancelado'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Canceladas
              </button>
              </div>
            </div>
          </div>

          {/* Lista de órdenes */}
          {workOrders.length > 0 ? (
            <div className="space-y-3">
              {workOrders.map((order) => (
                <ActiveOrderCard
                  key={order.id}
                  order={order}
                  onUpdate={() => handleFilterChange(filter)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">
                {filter === 'pendiente' ? '⏳' :
                 filter === 'en_progreso' ? '🔨' :
                 filter === 'pausado' ? '⏸️' :
                 filter === 'completado' ? '✅' :
                 filter === 'cancelado' ? '❌' : '📋'}
              </div>
              <p>No hay órdenes {filter === 'all' ? '' : filter}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de creación de orden de trabajo */}
      {showCreateModal && (
        <CreateWorkOrderFromVehicleModal
          isOpen={showCreateModal}
          onClose={handleModalClose}
          onSuccess={handleOrderCreated}
        />
      )}
    </MainLayout>
  )
}

function StatCard({ title, value, icon, color, onClick, active }: any) {
  const colors: Record<string, string> = {
    gray: 'bg-gray-50 text-gray-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
  }

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${
        active ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`text-5xl ${colors[color]} p-4 rounded-lg`}>{icon}</div>
      </div>
    </div>
  )
}
