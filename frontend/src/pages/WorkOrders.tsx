import { useState, useEffect, useMemo, useRef } from 'react'
import { MainLayout } from '../components/Layout/MainLayout'
import { useWorkOrders } from '../hooks/useWorkOrders'
import { ActiveOrderCard } from '../components/recepcionista/ActiveOrderCard'
import { CreateWorkOrderFromVehicleModal } from '../components/modals/CreateWorkOrderFromVehicleModal'
import { useAuthStore } from '../store/authStore'
import { mechanicService, MechanicWorkload } from '../services/mechanicService'
import { sortWorkOrders } from '../utils/workOrderSorting'

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

  // Cargar mecánicos del taller (solo una vez, con protección)
  const mechanicsLoadingRef = useRef(false)
  const lastMechanicsLoadRef = useRef(0)
  
  useEffect(() => {
    const loadMechanics = async () => {
      if (!workshopId) return
      
      // Protección contra llamadas concurrentes y frecuentes
      if (mechanicsLoadingRef.current) {
        console.log('⏸️ Ya hay una carga de mecánicos en curso, omitiendo...')
        return
      }
      
      const now = Date.now()
      if (now - lastMechanicsLoadRef.current < 30000) { // Mínimo 30 segundos
        console.log('⏸️ Carga de mecánicos demasiado reciente, omitiendo...')
        return
      }
      
      mechanicsLoadingRef.current = true
      lastMechanicsLoadRef.current = now
      
      try {
        const mechanicsData = await mechanicService.getAvailableMechanics(workshopId)
        setMechanics(mechanicsData)
      } catch (err: any) {
        console.error('Error cargando mecánicos:', err)
        // Si es 429, esperar más tiempo antes de reintentar
        if (err.response?.status === 429) {
          lastMechanicsLoadRef.current = Date.now() + 60000 // Esperar 1 minuto adicional
        }
      } finally {
        mechanicsLoadingRef.current = false
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

  // Ordenar órdenes usando useMemo (debe estar en el nivel superior del componente)
  const sortedWorkOrders = useMemo(() => sortWorkOrders(workOrders), [workOrders])

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Órdenes de Trabajo</h2>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Actualización en tiempo real</span>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-600">Gestión y seguimiento de órdenes</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => {
                loadStatsFromDB()
                handleFilterChange(filter)
              }}
              className="px-2 sm:px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors flex items-center space-x-1 sm:space-x-2 text-sm"
              title="Actualizar estadísticas desde BD"
            >
              <span className={`${loading ? 'animate-spin' : ''}`}>🔄</span>
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            {/* Solo mostrar botón de crear para roles que no sean Jefe de Taller */}
            {userRole !== 'Jefe de Taller' && (
              <button
                onClick={handleCreateOrder}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm sm:text-base"
              >
                <span className="sm:hidden">📝</span>
                <span className="hidden sm:inline">📝 Nueva Orden</span>
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {filterStats.label} ({filterStats.count})
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-4">
              {/* Selector de Mecánico */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label htmlFor="mechanic-filter" className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Mecánico:
                </label>
                <select
                  id="mechanic-filter"
                  value={selectedMechanic}
                  onChange={(e) => handleMechanicChange(e.target.value)}
                  className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los mecánicos</option>
                  {mechanics.map((mechanic) => (
                    <option key={mechanic.mechanicId} value={mechanic.mechanicId}>
                      {mechanic.mechanicName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => handleFilterChange('pendiente')}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'pendiente'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => handleFilterChange('en_progreso')}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'en_progreso'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En Progreso
              </button>
              <button
                onClick={() => handleFilterChange('pausado')}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'pausado'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pausadas
              </button>
              <button
                onClick={() => handleFilterChange('completado')}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'completado'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completadas
              </button>
              <button
                onClick={() => handleFilterChange('cancelado')}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
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
          {sortedWorkOrders.length > 0 ? (
            <div className="space-y-3">
              {sortedWorkOrders.map((order) => (
                <ActiveOrderCard
                  key={order.id}
                  order={order}
                  onUpdate={() => handleFilterChange(filter)}
                  workshopId={workshopId}
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
      className={`bg-white rounded-lg shadow p-4 sm:p-6 cursor-pointer transition-all hover:shadow-lg ${
        active ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{value}</p>
        </div>
        <div className={`text-3xl sm:text-4xl lg:text-5xl ${colors[color]} p-2 sm:p-3 lg:p-4 rounded-lg flex-shrink-0 ml-2`}>{icon}</div>
      </div>
    </div>
  )
}
