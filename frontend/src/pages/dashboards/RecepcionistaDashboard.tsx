import { useState, useEffect } from 'react'
import { MainLayout } from '../../components/Layout/MainLayout'
import { useRecepcionista } from '../../hooks/useRecepcionista'
import { PendingVehicleCard } from '../../components/recepcionista/PendingVehicleCard'
import { ActiveOrderCard } from '../../components/recepcionista/ActiveOrderCard'
import { ReadyVehicleCard } from '../../components/recepcionista/ReadyVehicleCard'
import { CancelledOrderCard } from '../../components/recepcionista/CancelledOrderCard'
import { SearchVehicles } from '../../components/recepcionista/SearchVehicles'
import { AvailableMechanicsList } from '../../components/recepcionista/AvailableMechanicsList'
import { CreateWorkOrderFromVehicleModal } from '../../components/modals/CreateWorkOrderFromVehicleModal'
import { NotificationDropdown } from '../../components/Notifications/NotificationDropdown'
import { useAuthStore } from '../../store/authStore'

export default function RecepcionistaDashboard() {
  console.log('🏠 RecepcionistaDashboard cargado correctamente')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { user } = useAuthStore()
  
  // Obtener workshopId del usuario actual
  const workshopId = (user as any)?.workshopId
  
  const {
    stats,
    pendingVehicles,
    activeOrders,
    readyVehicles,
    cancelledOrders,
    loading,
    error,
    loadAllData,
    searchVehicles
  } = useRecepcionista(workshopId)


  const handleDataUpdate = () => {
    loadAllData()
  }

  // Escuchar eventos de órdenes marcadas como listas y salidas registradas
  useEffect(() => {
    const handleOrderMarkedReady = (event: any) => {
      console.log('✅ Evento order-marked-ready recibido en recepcionista, actualizando dashboard...')
      if (event.detail?.vehicle) {
        console.log('📊 Orden marcada como lista para:', event.detail.vehicle.plate)
      }
      // Recargar datos para que el vehículo desaparezca del dashboard
      loadAllData()
    }

    const handleExitRegistered = (event: any) => {
      console.log('🚪 Evento exit-registered recibido en recepcionista, actualizando dashboard...')
      if (event.detail?.vehicle) {
        console.log('📊 Salida registrada para:', event.detail.vehicle.plate)
      }
      // Recargar datos para que el vehículo desaparezca del dashboard
      loadAllData()
    }

    window.addEventListener('order-marked-ready', handleOrderMarkedReady)
    window.addEventListener('exit-registered', handleExitRegistered)

    return () => {
      window.removeEventListener('order-marked-ready', handleOrderMarkedReady)
      window.removeEventListener('exit-registered', handleExitRegistered)
    }
  }, [loadAllData])

  const handleCreateOrder = () => {
    setShowCreateModal(true)
  }

  const handleModalClose = () => {
    setShowCreateModal(false)
  }

  const handleOrderCreated = () => {
    setShowCreateModal(false)
    loadAllData()
  }


  if (loading && !stats.ingresosHoy) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos del recepcionista...</p>
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
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Ingresos y Órdenes</h2>
            <p className="text-gray-600">Recepción y coordinación de trabajos</p>
          </div>
          <div className="flex items-center space-x-3">
            <NotificationDropdown />
            <button
              onClick={handleCreateOrder}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              📝 Nueva Orden
            </button>
            <button
              onClick={handleDataUpdate}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          <StatCard
            title="Ingresos Hoy"
            value={(stats.ingresosHoy || 0).toString()}
            icon="📝"
            color="blue"
          />
          <StatCard
            title="Total Ingresos"
            value={(stats.totalVehiculosIngresados || 0).toString()}
            icon="📊"
            color="orange"
          />
          <StatCard
            title="Órdenes Creadas"
            value={(stats.ordenesCreadas || 0).toString()}
            icon="🔨"
            color="green"
          />
          <StatCard
            title="En Espera"
            value={(stats.enEspera || 0).toString()}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            title="Listas para Salida"
            value={(stats.listasParaSalida || 0).toString()}
            icon="✅"
            color="purple"
          />
        </div>


        {/* Acciones Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <button 
            onClick={() => window.location.href = '/vehicles'}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 text-center transition transform hover:scale-105"
          >
            <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">🔍</div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">Validar Vehículos</h3>
            <p className="text-blue-100 text-sm sm:text-base">Revisar vehículos y gestionar salidas</p>
          </button>

          <button 
            onClick={() => window.location.href = '/work-orders'}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 text-center transition transform hover:scale-105"
          >
            <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">🔨</div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">Gestionar Órdenes</h3>
            <p className="text-purple-100 text-sm sm:text-base">Generar órdenes de trabajo</p>
          </button>
        </div>

        {/* Vehículos Pendientes de Orden */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Vehículos Sin Orden Asignada
            </h3>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              {pendingVehicles.length} pendientes
            </span>
          </div>
          
          {pendingVehicles.length > 0 ? (
            <div className="space-y-3">
                {pendingVehicles.map((vehicle) => (
                  <PendingVehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onCreateOrder={handleDataUpdate}
                    workshopId={workshopId}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">✅</div>
              <p>No hay vehículos pendientes de orden</p>
            </div>
          )}
        </div>

        {/* Grid de Información */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Órdenes Activas */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Órdenes en Proceso
            </h3>
            
            {activeOrders.length > 0 ? (
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <ActiveOrderCard
                    key={order.id}
                    order={order}
                    onUpdate={handleDataUpdate}
                    workshopId={workshopId}
                    showQuickActions={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🔨</div>
                <p>No hay órdenes en proceso</p>
              </div>
            )}
          </div>

          {/* Próximas Salidas */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vehículos Listos para Salida
            </h3>
            
            {readyVehicles.length > 0 ? (
              <div className="space-y-3">
                {readyVehicles.map((vehicle) => (
                  <ReadyVehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onExitRegistered={handleDataUpdate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🚗</div>
                <p>No hay vehículos listos para salida</p>
              </div>
            )}
          </div>

          {/* Órdenes Canceladas */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Órdenes Canceladas
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {cancelledOrders.length} canceladas
              </span>
            </h3>
            
            {cancelledOrders.length > 0 ? (
              <div className="space-y-3">
                {cancelledOrders.map((order) => (
                  <CancelledOrderCard
                    key={order.id}
                    order={order}
                    onUpdate={handleDataUpdate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">❌</div>
                <p>No hay órdenes canceladas</p>
              </div>
            )}
          </div>
        </div>

        {/* Búsqueda de Vehículos */}
        <SearchVehicles
          onSearch={searchVehicles}
        />

        {/* Mecánicos del Taller */}
        {workshopId && (
          <AvailableMechanicsList
            workshopId={workshopId}
            showOnlyAvailable={false}
          />
        )}

        {/* Modal de creación de orden de trabajo */}
        {showCreateModal && (
          <CreateWorkOrderFromVehicleModal
            isOpen={showCreateModal}
            onClose={handleModalClose}
            onSuccess={handleOrderCreated}
          />
        )}

      </div>
    </MainLayout>
  )
}

function StatCard({ title, value, icon, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
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






