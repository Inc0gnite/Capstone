import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainLayout } from '../../components/Layout/MainLayout'
import { useStats } from '../../hooks/useStats'
import { vehicleService } from '../../services/vehicleService'
import { vehicleEntryService } from '../../services/vehicleEntryService'
import { workOrderService } from '../../services/workOrderService'
import { useAuthStore } from '../../store/authStore'
import { CreateEntryModal } from '../../components/modals/CreateEntryModal'
import { CreateEntryModalAdvanced } from '../../components/modals/CreateEntryModalAdvanced'
import type { VehicleEntry, Vehicle, WorkOrder } from '../../../../shared/types'
import { RefreshCw, FileText, Factory, CheckCircle, Search, Car, Wrench, Lightbulb, XCircle, BarChart, Zap, Play, Pause, Clock, Clipboard, Package, ArrowRight, AlertTriangle, UserCog } from 'lucide-react'

export default function GuardiaDashboard() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<'diario' | 'semanal' | 'mensual'>('diario')
  const { stats, loading, refreshStats } = useStats(period)
  const { isAuthenticated } = useAuthStore()
  const [searchPlate, setSearchPlate] = useState('')
  const [searchResult, setSearchResult] = useState<Vehicle | null>(null)
  const [activeVehicles, setActiveVehicles] = useState<(VehicleEntry & { isReadyForExit?: boolean })[]>([])
  const [recentActivity, setRecentActivity] = useState<VehicleEntry[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreateVehicle, setShowCreateVehicle] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
  }, [isAuthenticated, navigate])

  // Cargar datos reales solo una vez al montar el componente
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Escuchar eventos de creación de entradas
  useEffect(() => {
    const handleEntryCreated = () => {
      loadDashboardData()
      refreshStats()
    }

    const handleExitRegistered = () => {
      loadDashboardData()
      refreshStats()
    }

    const handleOrderMarkedReady = () => {
      loadDashboardData()
      refreshStats()
    }

    window.addEventListener('entry-created', handleEntryCreated)
    window.addEventListener('exit-registered', handleExitRegistered)
    window.addEventListener('order-marked-ready', handleOrderMarkedReady)

    return () => {
      window.removeEventListener('entry-created', handleEntryCreated)
      window.removeEventListener('exit-registered', handleExitRegistered)
      window.removeEventListener('order-marked-ready', handleOrderMarkedReady)
    }
  }, [refreshStats])

  const loadDashboardData = async () => {
    // Evitar peticiones concurrentes
    if (isLoadingData) {
      console.log('Ya hay una petición en curso, omitiendo...')
      return
    }

    try {
      setIsLoadingData(true)
      setLoadingData(true)
      
      console.log('Cargando datos del dashboard...')
      // El backend ahora incluye isReadyForExit en getActiveEntries, evitando peticiones adicionales
      const [activeEntries, recentEntries] = await Promise.all([
        vehicleEntryService.getActiveEntries(),
        vehicleEntryService.getAll({ limit: 10, dateFrom: new Date().toISOString().split('T')[0] })
      ])
      
      // activeEntries ya incluye isReadyForExit desde el backend
      setActiveVehicles(activeEntries as (VehicleEntry & { isReadyForExit?: boolean })[])
      setRecentActivity(recentEntries.data || [])
      console.log('Datos del dashboard cargados exitosamente')
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error)
    } finally {
      setLoadingData(false)
      setIsLoadingData(false)
    }
  }

  const handleRefreshAll = async () => {
    // Limpiar caché y forzar recarga
    setActiveVehicles([])
    setRecentActivity([])
    setLoadingData(true)
    await Promise.all([
      refreshStats(),
      loadDashboardData()
    ])
  }

  const handleForceRefresh = () => {
    // Limpiar todo el estado
    setActiveVehicles([])
    setRecentActivity([])
    setSearchResult(null)
    setLoadingData(true)
    
    // Recargar datos después de un pequeño delay
    setTimeout(() => {
      loadDashboardData()
      refreshStats()
    }, 100)
  }

  const handleCreateEntry = () => {
    setShowCreateModal(true)
  }

  const handleModalClose = () => {
    setShowCreateModal(false)
  }

  const handleCreateVehicle = () => {
    setShowCreateVehicle(true)
  }

  const handleCreateVehicleSuccess = () => {
    setShowCreateVehicle(false)
    loadDashboardData()
    refreshStats()
  }

  const handleEntryCreated = (entryData?: any) => {
    setShowCreateModal(false)
    
    // Invalidar caché de vehicle-entries antes de recargar
    requestCache.invalidate(/vehicle-entries/)
    
    loadDashboardData()
    refreshStats()
    
    // Emitir evento de notificación para el recepcionista
    if (entryData) {
      // Obtener información del guardia actual
      const { user } = useAuthStore.getState()
      const guardName = user ? `${user.firstName} ${user.lastName}` : 'Sistema'
      
      window.dispatchEvent(new CustomEvent('vehicle-entry-created', {
        detail: {
          vehicle: {
            licensePlate: entryData.vehicle?.licensePlate,
            driverName: entryData.driverName,
            driverRut: entryData.driverRut
          },
          entry: {
            id: entryData.id,
            entryCode: entryData.entryCode,
            driverName: entryData.driverName,
            driverRut: entryData.driverRut
          },
          guardName: guardName
        }
      }))
    }
  }

  const handleQuickSearch = async () => {
    if (!searchPlate.trim()) {
      setSearchResult(null)
      return
    }
    
    try {
      const vehicle = await vehicleService.getByLicensePlate(searchPlate.trim().toUpperCase())
      setSearchResult(vehicle)
    } catch (error) {
      // Buscar en los vehículos activos si no se encuentra en la base de datos
      const activeVehicle = activeVehicles.find(entry => 
        entry.entryCode?.toUpperCase().includes(searchPlate.trim().toUpperCase())
      )
      
      if (activeVehicle) {
        // Crear un objeto vehicle básico para mostrar en el resultado
        setSearchResult({
          id: activeVehicle.vehicleId,
          licensePlate: searchPlate.trim().toUpperCase(),
          brand: 'N/A',
          model: 'N/A',
          year: new Date().getFullYear(),
          vehicleType: 'unknown',
          vin: 'N/A',
          fleetNumber: 'N/A',
          regionId: 'N/A',
          status: 'active',
          isActive: true,
          createdAt: activeVehicle.createdAt,
          updatedAt: activeVehicle.updatedAt
        })
      } else {
        setSearchResult(null)
        alert('No se encontró el vehículo con esa patente')
      }
    }
  }

  const handleRegisterExit = async () => {
    try {
      // Verificar si hay vehículos con órdenes completadas
      const orders = await workOrderService.getAll({ status: 'completado' })
      const completedOrders = (orders.data || []) as WorkOrder[]
      
      // Verificar si hay vehículos activos con órdenes completadas
      const readyVehicles = activeVehicles.filter(entry => {
        return completedOrders.some(order => order.entryId === entry.id)
      })
      
      if (readyVehicles.length === 0) {
        alert('Esperando a Recepcionista')
        return
      }
      
      navigate('/entries?action=exit')
    } catch (error) {
      console.error('Error verificando vehículos listos:', error)
      // Si hay error de permisos, permitir navegación de todas formas
      // El backend validará si hay órdenes completadas
      navigate('/entries?action=exit')
    }
  }

  const handleVehicleClick = (vehicleId: string) => {
    navigate(`/entries?vehicleId=${vehicleId}`)
  }

  // Mostrar pantalla de carga si no está autenticado
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando autenticación...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Control de Ingreso Vehicular</h2>
            <p className="text-gray-600">Gestión de entradas y salidas de vehículos</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleCreateEntry}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Registrar Ingreso</span>
            </button>
            <button
              onClick={handleRefreshAll}
              disabled={loading || loadingData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar Todo</span>
            </button>
            <button
              onClick={handleCreateVehicle}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center space-x-2"
            >
              <Car className="w-4 h-4" />
              <span>Nuevo Vehículo</span>
            </button>
            <button
              onClick={handleRegisterExit}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Registrar Salida</span>
            </button>
            <button
              onClick={handleForceRefresh}
              disabled={loading || loadingData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Forzar Actualización</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Vehículos en Taller"
            value={loading ? "..." : stats.vehiclesInWorkshop.toString()}
            icon={Factory}
            color="blue"
          />
          <StatCard
            title="Ingresos Hoy"
            value={loading ? "..." : stats.entriesToday.toString()}
            icon={FileText}
            color="green"
          />
          <StatCard
            title="Salidas Hoy"
            value={loading ? "..." : stats.exitsToday.toString()}
            icon={CheckCircle}
            color="purple"
          />
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">
                Total Ingresos
              </p>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'diario' | 'semanal' | 'mensual')}
                className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
              >
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="mensual">Mensual</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-900">
                {loading ? "..." : stats.totalEntries.toString()}
              </p>
              <BarChart className="w-12 h-12 bg-orange-50 text-orange-600 p-4 rounded-lg" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Período: {period === 'diario' ? 'Hoy' : period === 'semanal' ? 'Últimos 7 días' : 'Último mes'}
            </p>
          </div>
        </div>


        {/* Búsqueda Rápida */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Búsqueda Rápida de Vehículo
          </h3>
          <div className="flex space-x-3">
            <input
              id="searchPlate"
              name="searchPlate"
              type="text"
              placeholder="Ingresa patente (ej: ABCD12)"
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch()}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              onClick={handleQuickSearch}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              <Search className="w-4 h-4 inline mr-1" />
              Buscar
            </button>
          </div>
          
          {/* Resultado de búsqueda */}
          {searchResult && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Vehículo Encontrado</h4>
              
              {/* Verificar si está en el taller */}
              {(() => {
                const activeEntry = activeVehicles.find(entry => entry.vehicleId === searchResult.id)
                return activeEntry ? (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Factory className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Actualmente en el taller</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Conductor: {activeEntry.driverName} | 
                      Ingreso: {new Date(activeEntry.entryDate).toLocaleString('es-CL')} |
                      Código: {activeEntry.entryCode}
                    </p>
                  </div>
                ) : null
              })()}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Patente:</p>
                  <p className="font-bold text-lg">{searchResult.licensePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehículo:</p>
                  <p className="font-medium">{searchResult.brand} {searchResult.model} ({searchResult.year})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo:</p>
                  <p className="font-medium">{searchResult.vehicleType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado:</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    searchResult.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {searchResult.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => navigate(`/vehicles/${searchResult.id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Ver Detalles
                </button>
                {activeVehicles.find(entry => entry.vehicleId === searchResult.id) && (
                  <button
                    onClick={() => navigate(`/entries?vehicleId=${searchResult.id}&action=exit`)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                  >
                    Registrar Salida
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vehículos Actualmente en Taller */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Vehículos en Taller Actualmente ({activeVehicles.length})
            </h3>
            <button
              onClick={loadDashboardData}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Actualizar
            </button>
          </div>
          <div className="space-y-6">
            {loadingData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Cargando vehículos...</p>
              </div>
            ) : activeVehicles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No hay vehículos en el taller actualmente</p>
                <p className="text-sm mt-2 text-gray-400">
                  Los vehículos aparecerán aquí cuando ingresen al taller
                </p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={handleForceRefresh}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium mr-2"
                  >
                    <Zap className="w-4 h-4 inline mr-1" />
                    Forzar Actualización
                  </button>
                  <button
                    onClick={loadDashboardData}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                  >
                    <RefreshCw className="w-4 h-4 inline mr-1" />
                    Verificar Datos
                  </button>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                  <p className="text-sm text-yellow-800">
                    <strong className="flex items-center gap-1">
                      <Lightbulb className="w-4 h-4" />
                      Consejo:
                    </strong> Si acabas de crear un ingreso y no aparece aquí, 
                    verifica que el vehículo no haya registrado salida.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Vehículos Listos para Salida */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h4 className="text-md font-semibold text-green-700">
                      Listos para Salida
                    </h4>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {activeVehicles.filter(v => v.isReadyForExit).length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {activeVehicles.filter(v => v.isReadyForExit).length === 0 ? (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        No hay vehículos listos para salida
                      </div>
                    ) : (
                      activeVehicles
                        .filter(v => v.isReadyForExit)
                        .map((entry) => (
                          <VehicleInWorkshop
                            key={entry.id}
                            entry={entry}
                            onClick={() => handleVehicleClick(entry.vehicleId)}
                            isReadyForExit={true}
                          />
                        ))
                    )}
                  </div>
                </div>

                {/* Separador */}
                {activeVehicles.filter(v => v.isReadyForExit).length > 0 && 
                 activeVehicles.filter(v => !v.isReadyForExit).length > 0 && (
                  <div className="border-t border-gray-200 my-4"></div>
                )}

                {/* Vehículos En Proceso */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Wrench className="w-6 h-6" />
                    <h4 className="text-md font-semibold text-yellow-700">
                      En Proceso
                    </h4>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      {activeVehicles.filter(v => !v.isReadyForExit).length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {activeVehicles.filter(v => !v.isReadyForExit).length === 0 ? (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        No hay vehículos en proceso
                      </div>
                    ) : (
                      activeVehicles
                        .filter(v => !v.isReadyForExit)
                        .map((entry) => (
                          <VehicleInWorkshop
                            key={entry.id}
                            entry={entry}
                            onClick={() => handleVehicleClick(entry.vehicleId)}
                            isReadyForExit={false}
                          />
                        ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actividad del Día */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Actividad de Hoy ({recentActivity.length})
            </h3>
            <button
              onClick={loadDashboardData}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Actualizar
            </button>
          </div>
          <div className="space-y-3">
            {loadingData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Cargando actividad...</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                <p>No hay actividad registrada hoy</p>
              </div>
            ) : (
              recentActivity.map((entry) => (
                <ActivityLog
                  key={entry.id}
                  entry={entry}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de creación de ingreso */}
      {showCreateModal && (
        <CreateEntryModal
          isOpen={showCreateModal}
          onClose={handleModalClose}
          onSuccess={handleEntryCreated}
        />
      )}

      {/* Modal de creación de nuevo vehículo */}
      {showCreateVehicle && (
        <CreateEntryModalAdvanced
          isOpen={showCreateVehicle}
          onClose={() => setShowCreateVehicle(false)}
          onSuccess={handleCreateVehicleSuccess}
        />
      )}
    </MainLayout>
  )
}

function StatCard({ title, value, icon: IconComponent, color }: any) {
  const colors: Record<string, string> = {
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
        {IconComponent && (
          <div className={`${colors[color]} p-4 rounded-lg`}>
            <IconComponent className="w-10 h-10" />
          </div>
        )}
      </div>
    </div>
  )
}

function VehicleInWorkshop({ entry, onClick, isReadyForExit }: { 
  entry: VehicleEntry & { isReadyForExit?: boolean }, 
  onClick: () => void,
  isReadyForExit?: boolean 
}) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getStatusInfo = () => {
    if (entry.exitDate) {
      return { label: 'Completado', color: 'bg-green-100 text-green-800', borderColor: 'border-green-500' }
    }
    if (isReadyForExit) {
      return { label: 'Listo para Salida', color: 'bg-green-100 text-green-800', borderColor: 'border-green-500', icon: CheckCircle }
    }
    return { label: 'En Proceso', color: 'bg-yellow-100 text-yellow-800', borderColor: 'border-yellow-500', icon: Wrench }
  }

  const statusInfo = getStatusInfo()

  return (
    <div 
      className={`flex items-center justify-between p-4 rounded-lg hover:shadow-md transition cursor-pointer border-l-4 ${statusInfo.borderColor} ${
        isReadyForExit 
          ? 'bg-green-50 hover:bg-green-100' 
          : 'bg-yellow-50 hover:bg-yellow-100'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          isReadyForExit ? 'bg-green-600' : 'bg-yellow-600'
        }`}>
          <Car className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-lg">
            {entry.entryCode || 'Sin código'}
          </p>
          <p className="text-sm text-gray-600">Conductor: {entry.driverName}</p>
          <p className="text-xs text-gray-500">
            Ingreso: {formatTime(entry.entryDate)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} flex items-center gap-1`}>
          {statusInfo.icon && (() => {
            const IconComponent = statusInfo.icon
            return IconComponent ? <IconComponent className="w-3 h-3" /> : null
          })()}
          {statusInfo.label}
        </span>
        {isReadyForExit && (
          <p className="text-xs text-green-700 mt-1 font-semibold">
            <CheckCircle className="w-3 h-3 inline mr-1" />
            Puede registrar salida
          </p>
        )}
        {!isReadyForExit && (
          <p className="text-xs text-yellow-700 mt-1 font-medium">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            Esperando órdenes completadas
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Código: {entry.entryCode}
        </p>
      </div>
    </div>
  )
}

function ActivityLog({ entry }: { entry: VehicleEntry }) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getActionInfo = (entry: VehicleEntry) => {
    if (entry.exitDate) {
      return { 
        action: 'Salida', 
        icon: CheckCircle, 
        color: 'text-green-600',
        borderColor: 'border-green-400'
      }
    }
    return { 
      action: 'Ingreso', 
      icon: ArrowRight, 
      color: 'text-blue-600',
      borderColor: 'border-blue-400'
    }
  }

  const actionInfo = getActionInfo(entry)

  return (
    <div className={`flex items-center space-x-4 p-3 border-l-4 ${actionInfo.borderColor}`}>
      {(() => {
        const IconComponent = actionInfo.icon
        return IconComponent ? <IconComponent className={`w-6 h-6 ${actionInfo.color}`} /> : null
      })()}
      <div className="flex-1">
        <p className="font-medium text-gray-900">
          {actionInfo.action}: {entry.entryCode || 'Sin código'}
        </p>
        <p className="text-sm text-gray-600">Conductor: {entry.driverName}</p>
        <p className="text-xs text-gray-500">
          Código: {entry.entryCode}
        </p>
        <p className="text-xs text-gray-500">
          ID Vehículo: {entry.vehicleId}
        </p>
      </div>
      <div className="text-right">
        <span className="text-sm text-gray-500">
          {entry.exitTime || entry.entryTime || formatTime(entry.exitDate || entry.entryDate)}
        </span>
        <p className="text-xs text-gray-400">
          {new Date(entry.exitDate || entry.entryDate).toLocaleDateString('es-CL')}
        </p>
      </div>
    </div>
  )
}


