import { useState, useEffect } from 'react'
import { MainLayout } from '../components/Layout/MainLayout'
import { vehicleService } from '../services/vehicleService'
import { DeleteVehicleModal } from '../components/modals/DeleteVehicleModal'
import { EditVehicleModal } from '../components/modals/EditVehicleModal'
import { useAuthStore } from '../store/authStore'
import type { Vehicle } from '../../../shared/types'

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null)
  const { user } = useAuthStore()

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const response = await vehicleService.getAll()
      setVehicles(response.data || [])
    } catch (error) {
      console.error('Error cargando vehículos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadVehicles()
      return
    }

    try {
      setLoading(true)
      const vehicle = await vehicleService.getByLicensePlate(searchTerm.trim().toUpperCase())
      setVehicles([vehicle])
    } catch (error) {
      console.error('Error buscando vehículo:', error)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    loadVehicles()
  }

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

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Búsqueda de Vehículos
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Ingresa patente (ej: ABCD12)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleSearch}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm sm:text-base"
              >
                <span className="sm:hidden">🔍</span>
                <span className="hidden sm:inline">🔍 Buscar</span>
              </button>
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors text-sm sm:text-base"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Vehicles List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {searchTerm ? `Resultados para "${searchTerm}"` : 'Lista de Vehículos'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {searchTerm ? `Mostrando resultados de búsqueda` : 'Todos los vehículos registrados'}
            </p>
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
                          onClick={() => setSelectedVehicle(vehicle)}
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
                {searchTerm ? 'No se encontraron vehículos con esa patente' : 'No hay vehículos registrados'}
              </div>
            )}
          </div>
          
          {/* Vista de cards para móvil */}
          <div className="md:hidden p-4 space-y-4">
            {vehicles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No se encontraron vehículos con esa patente' : 'No hay vehículos registrados'}
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
                      onClick={() => setSelectedVehicle(vehicle)}
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
                  onClick={() => setSelectedVehicle(null)}
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

