import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainLayout } from '../components/Layout/MainLayout'
import { vehicleService } from '../services/vehicleService'
import { regionService } from '../services/regionService'
import { vehicleEntryService, type VehicleEntry } from '../services/vehicleEntryService'
import { workOrderService, type WorkOrder } from '../services/workOrderService'
import { DeleteVehicleModal } from '../components/modals/DeleteVehicleModal'
import { EditVehicleModal } from '../components/modals/EditVehicleModal'
import { DocumentUpload } from '../components/DocumentUpload'
import { useAuthStore } from '../store/authStore'
import type { Vehicle, VehicleFilters, Region } from '../../../shared/types'

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]) // Todos los vehículos sin filtrar
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [vehicleHistory, setVehicleHistory] = useState<{
    entries: VehicleEntry[]
    workOrders: WorkOrder[]
    loading: boolean
  }>({
    entries: [],
    workOrders: [],
    loading: false,
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null)
  const [showDocuments, setShowDocuments] = useState(false)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Filtros
  const [filterType, setFilterType] = useState<string>('')
  const [filterRegion, setFilterRegion] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [regions, setRegions] = useState<Region[]>([])

  // Obtener tipos de vehículos únicos
  const vehicleTypes = useMemo(() => {
    const types = new Set(allVehicles.map(v => v.vehicleType).filter(Boolean))
    return Array.from(types).sort()
  }, [allVehicles])

  useEffect(() => {
    loadVehicles()
    loadRegions()
  }, [])

  const loadRegions = async () => {
    try {
      const response = await regionService.getAll()
      setRegions(response.data || [])
    } catch (error) {
      console.error('Error cargando regiones:', error)
    }
  }

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const response = await vehicleService.getAll()
      const vehiclesData = response.data || []
      setAllVehicles(vehiclesData)
      setVehicles(vehiclesData)
    } catch (error) {
      console.error('Error cargando vehículos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      
      // Si hay búsqueda por patente, usar ese método
      if (searchTerm.trim()) {
        try {
          const vehicle = await vehicleService.getByLicensePlate(searchTerm.trim().toUpperCase())
          setVehicles([vehicle])
          return
        } catch (error) {
          console.error('Error buscando vehículo por patente:', error)
          setVehicles([])
          return
        }
      }

      // Aplicar filtros
      const filters: VehicleFilters = {}
      if (filterType) filters.vehicleType = filterType
      if (filterRegion) filters.regionId = filterRegion
      if (filterStatus) filters.status = filterStatus

      // Si hay filtros, buscar con ellos
      if (Object.keys(filters).length > 0) {
        const response = await vehicleService.getAll(filters)
        setVehicles(response.data || [])
      } else {
        // Si no hay filtros, mostrar todos
        setVehicles(allVehicles)
      }
    } catch (error) {
      console.error('Error buscando vehículos:', error)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilterType('')
    setFilterRegion('')
    setFilterStatus('')
    setVehicles(allVehicles)
  }

  const hasActiveFilters = searchTerm || filterType || filterRegion || filterStatus

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle)
    setShowDeleteModal(true)
  }

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false)
    setVehicleToDelete(null)
    loadVehicles() // Recargar la lista
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setVehicleToDelete(null)
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setVehicleToEdit(vehicle)
    setShowEditModal(true)
  }

  const loadVehicleHistory = async (vehicleId: string) => {
    try {
      setVehicleHistory({ entries: [], workOrders: [], loading: true })
      
      const [entriesResponse, workOrdersResponse] = await Promise.all([
        vehicleEntryService.getAll({ vehicleId, limit: 100 }),
        workOrderService.getAll({ vehicleId, limit: 100 }),
      ])

      setVehicleHistory({
        entries: entriesResponse.data || [],
        workOrders: workOrdersResponse.data || [],
        loading: false,
      })
    } catch (error) {
      console.error('Error cargando historial del vehículo:', error)
      setVehicleHistory({ entries: [], workOrders: [], loading: false })
    }
  }

  const handleViewVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setShowDocuments(false) // Resetear estado de documentos al abrir modal
    loadVehicleHistory(vehicle.id)
  }
  
  const handleCloseVehicleModal = () => {
    setSelectedVehicle(null)
    setShowDocuments(false) // Resetear estado de documentos al cerrar modal
  }

  const handleEditSuccess = () => {
    setShowEditModal(false)
    setVehicleToEdit(null)
    loadVehicles()
  }

  const handleEditCancel = () => {
    setShowEditModal(false)
    setVehicleToEdit(null)
  }

  // Verificar si el usuario es administrador
  const isAdmin = user?.role?.name === 'Administrador'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'in_maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'in_maintenance':
        return 'En Mantenimiento'
      case 'inactive':
        return 'Inactivo'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Vehículos</h2>
          <p className="text-gray-600">Consulta y búsqueda de vehículos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <span className="text-xl sm:text-2xl">🚗</span>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Vehículos</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{vehicles.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                <span className="text-xl sm:text-2xl">✅</span>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Activos</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {vehicles.filter(v => v.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                <span className="text-xl sm:text-2xl">🔧</span>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">En Mantenimiento</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {vehicles.filter(v => v.status === 'in_maintenance').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                <span className="text-xl sm:text-2xl">❌</span>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Inactivos</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {vehicles.filter(v => v.status === 'inactive').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Búsqueda y Filtros de Vehículos
          </h3>
          
          {/* Búsqueda por patente */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Búsqueda por Patente
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Ingresa patente (ej: ABCD12)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Filtro por Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Vehículo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
              >
                <option value="">Todos los tipos</option>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Región */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Región
              </label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
              >
                <option value="">Todas las regiones</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.code} - {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="in_maintenance">En Mantenimiento</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleSearch}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm sm:text-base flex items-center justify-center space-x-2"
            >
              <span>🔍</span>
              <span>Buscar</span>
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClearSearch}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors text-sm sm:text-base"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        </div>

        {/* Vehicles List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {hasActiveFilters ? 'Resultados de Búsqueda' : 'Lista de Vehículos'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {hasActiveFilters 
                ? `Mostrando ${vehicles.length} vehículo(s) con los filtros aplicados`
                : `Todos los vehículos registrados (${vehicles.length} total)`}
            </p>
            {hasActiveFilters && (
              <div className="mt-2 flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    Patente: {searchTerm}
                  </span>
                )}
                {filterType && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    Tipo: {filterType}
                  </span>
                )}
                {filterRegion && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    Región: {regions.find(r => r.id === filterRegion)?.code || filterRegion}
                  </span>
                )}
                {filterStatus && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                    Estado: {getStatusText(filterStatus)}
                  </span>
                )}
              </div>
            )}
          </div>
          {/* Vista de tabla para desktop, cards para móvil */}
          <div className="hidden md:block">
            <table className="min-w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehículo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Año
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VIN
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número de Flota
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 break-words">
                      {vehicle.licensePlate}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="space-y-0.5">
                        <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                        <div className="text-gray-500 break-words">{vehicle.vehicleType}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {vehicle.year}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 break-words">
                      {vehicle.vin || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 break-words">
                      {vehicle.fleetNumber || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(vehicle.status)}`}>
                        {getStatusText(vehicle.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleViewVehicle(vehicle)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver Detalles
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleEditVehicle(vehicle)}
                            className="text-green-600 hover:text-green-900"
                          >
                          ✏️ Editar
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteVehicle(vehicle)}
                            className="text-red-600 hover:text-red-900"
                          >
                            🗑️ Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {vehicles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {hasActiveFilters 
                  ? 'No se encontraron vehículos con los filtros aplicados' 
                  : 'No hay vehículos registrados'}
              </div>
            )}
          </div>
          
          {/* Vista de cards para móvil */}
          <div className="md:hidden p-4 space-y-4">
            {vehicles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {hasActiveFilters 
                  ? 'No se encontraron vehículos con los filtros aplicados' 
                  : 'No hay vehículos registrados'}
              </div>
            ) : (
              vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900">{vehicle.licensePlate}</h4>
                      <p className="text-sm text-gray-600">{vehicle.brand} {vehicle.model}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(vehicle.status)}`}>
                      {getStatusText(vehicle.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-700 mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Año:</span>
                      <span className="font-medium">{vehicle.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">VIN:</span>
                      <span className="font-medium">{vehicle.vin || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">N° Flota:</span>
                      <span className="font-medium">{vehicle.fleetNumber || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tipo:</span>
                      <span className="font-medium">{vehicle.vehicleType}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleViewVehicle(vehicle)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Ver Detalles
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleEditVehicle(vehicle)}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(vehicle)}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 sm:p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles del Vehículo
                </h3>
                <button
                  onClick={handleCloseVehicleModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Información Básica</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patente:</span>
                      <span className="font-medium">{selectedVehicle.licensePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Marca:</span>
                      <span className="font-medium">{selectedVehicle.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modelo:</span>
                      <span className="font-medium">{selectedVehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Año:</span>
                      <span className="font-medium">{selectedVehicle.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium">{selectedVehicle.vehicleType}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Información Adicional</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">VIN:</span>
                      <span className="font-medium">{selectedVehicle.vin || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">N° Flota:</span>
                      <span className="font-medium">{selectedVehicle.fleetNumber || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedVehicle.status)}`}>
                        {getStatusText(selectedVehicle.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Activo:</span>
                      <span className="font-medium">{selectedVehicle.isActive ? 'Sí' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Fechas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Creado:</span>
                    <span className="font-medium">
                      {new Date(selectedVehicle.createdAt).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actualizado:</span>
                    <span className="font-medium">
                      {new Date(selectedVehicle.updatedAt).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documentos del Vehículo */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <span className="mr-2 text-xl">📄</span>
                    Documentos
                  </h4>
                  <button
                    onClick={() => setShowDocuments(!showDocuments)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm flex items-center space-x-2"
                  >
                    <span>{showDocuments ? '👁️ Ocultar' : '👁️ Ver'}</span>
                    <span>Documentos</span>
                  </button>
                </div>
                
                {showDocuments && (
                  <div className="mt-4">
                    <DocumentUpload
                      relatedTo="vehicle"
                      relatedId={selectedVehicle.id}
                      onDocumentUploaded={(doc) => {
                        console.log('Documento subido:', doc)
                      }}
                      onDocumentDeleted={(docId) => {
                        console.log('Documento eliminado:', docId)
                      }}
                    />
                  </div>
                )}
                
                {!showDocuments && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500">Haz clic en "Ver Documentos" para gestionar los documentos del vehículo</p>
                  </div>
                )}
              </div>

              {/* Historial del Vehículo */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">📋 Historial del Vehículo</h4>
                
                {vehicleHistory.loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Cargando historial...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Historial de Ingresos */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="mr-2">📝</span>
                        Ingresos al Taller ({vehicleHistory.entries.length})
                      </h5>
                      {vehicleHistory.entries.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-2">No hay ingresos registrados</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {vehicleHistory.entries.map((entry) => (
                            <div
                              key={entry.id}
                              className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                              onClick={() => {
                                handleCloseVehicleModal()
                                navigate(`/entries/${entry.id}`)
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs font-semibold text-blue-600">{entry.entryCode}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                      entry.status === 'ingresado' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {entry.status === 'ingresado' ? 'En Taller' : 'Salida'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">{entry.driverName}</span> • {entry.driverRut}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(entry.entryDate).toLocaleDateString('es-CL')} • 
                                    {entry.entryKm.toLocaleString()} km
                                    {entry.exitKm && ` → ${entry.exitKm.toLocaleString()} km`}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-400">→</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Historial de Órdenes de Trabajo */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="mr-2">🔨</span>
                        Órdenes de Trabajo ({vehicleHistory.workOrders.length})
                      </h5>
                      {vehicleHistory.workOrders.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-2">No hay órdenes de trabajo registradas</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {vehicleHistory.workOrders.map((order) => (
                            <div
                              key={order.id}
                              className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                              onClick={() => {
                                handleCloseVehicleModal()
                                navigate(`/work-orders/${order.id}`)
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs font-semibold text-purple-600">{order.orderNumber}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                      order.currentStatus === 'completado' 
                                        ? 'bg-green-100 text-green-800'
                                        : order.currentStatus === 'en_progreso'
                                        ? 'bg-blue-100 text-blue-800'
                                        : order.currentStatus === 'pausado'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {order.currentStatus === 'completado' ? 'Completado' :
                                       order.currentStatus === 'en_progreso' ? 'En Progreso' :
                                       order.currentStatus === 'pausado' ? 'Pausado' : 'Pendiente'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-700 font-medium">{order.workType}</p>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{order.description}</p>
                                  {order.assignedTo && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Mecánico: {order.assignedTo.firstName} {order.assignedTo.lastName}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(order.createdAt).toLocaleDateString('es-CL')}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-400">→</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de eliminación */}
      <DeleteVehicleModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onSuccess={handleDeleteSuccess}
        vehicle={vehicleToDelete}
      />

      {/* Modal de edición */}
      <EditVehicleModal
        isOpen={showEditModal}
        onClose={handleEditCancel}
        onSuccess={handleEditSuccess}
        vehicle={vehicleToEdit}
      />
    </MainLayout>
  )
}

