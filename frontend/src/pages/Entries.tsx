import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MainLayout } from '../components/Layout/MainLayout'
import { CreateEntryModalAdvanced } from '../components/modals/CreateEntryModalAdvanced'
import { RegisterExitModal } from '../components/modals/RegisterExitModal'
import { vehicleEntryService } from '../services/vehicleEntryService'
import { vehicleService } from '../services/vehicleService'
import { debugTokenStatus } from '../services/api'
import type { VehicleEntry, Vehicle } from '../../../shared/types'

export default function Entries() {
  const [searchParams] = useSearchParams()
  const [entries, setEntries] = useState<VehicleEntry[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateFormAdvanced, setShowCreateFormAdvanced] = useState(false)
  const [showExitForm, setShowExitForm] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<VehicleEntry | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<Vehicle | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [readyForExit, setReadyForExit] = useState<Set<string>>(new Set())
  const [showAllCompleted, setShowAllCompleted] = useState(false)

  useEffect(() => {
    loadData()
    debugTokenStatus() // Debug del estado del token
    
    // Manejar parámetros de URL
    const action = searchParams.get('action')
    const vehicleId = searchParams.get('vehicleId')
    
    if (action === 'create') {
      setShowCreateFormAdvanced(true)
    } else if (action === 'create-advanced') {
      setShowCreateFormAdvanced(true)
    } else if (action === 'exit' && vehicleId) {
      // Buscar el ingreso activo del vehículo
      const findActiveEntry = async () => {
        try {
          console.log('🔍 Buscando ingreso activo para vehículo:', vehicleId)
          const activeEntries = await vehicleEntryService.getActiveEntries()
          console.log('📊 Ingresos activos encontrados:', activeEntries.length)
          
          const activeEntry = activeEntries.find(entry => entry.vehicleId === vehicleId)
          if (activeEntry) {
            console.log('✅ Ingreso activo encontrado:', activeEntry.entryCode)
            setSelectedEntry(activeEntry)
            setShowExitForm(true)
          } else {
            console.log('❌ No se encontró ingreso activo para el vehículo')
            alert('No se encontró un ingreso activo para este vehículo')
          }
        } catch (error) {
          console.error('❌ Error buscando ingreso activo:', error)
          alert('Error al buscar el ingreso activo del vehículo')
        }
      }
      findActiveEntry()
    }
  }, [searchParams])

  // Escuchar eventos de órdenes marcadas como listas
  useEffect(() => {
    const handleOrderMarkedReady = () => {
      console.log('📢 Orden marcada como lista, actualizando estado de vehículos...')
      loadData() // Recargar datos para actualizar el estado
    }

    window.addEventListener('order-marked-ready', handleOrderMarkedReady)
    
    return () => {
      window.removeEventListener('order-marked-ready', handleOrderMarkedReady)
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [entriesData, vehiclesData] = await Promise.all([
        vehicleEntryService.getAll(),
        vehicleService.getAll()
      ])
      setEntries(entriesData.data || [])
      setVehicles(vehiclesData.data || [])
      
      // Verificar qué vehículos están listos para salida
      await checkVehiclesReadyForExit(entriesData.data || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkVehiclesReadyForExit = async (entries: VehicleEntry[]) => {
    try {
      console.log('🔍 Verificando qué vehículos están listos para salida...')
      const readyEntries = new Set<string>()
      
      // Verificar cada entrada individualmente
      for (const entry of entries) {
        try {
          const isReady = await vehicleEntryService.isReadyForExit(entry.id)
          if (isReady) {
            readyEntries.add(entry.id)
            console.log(`✅ ${entry.entryCode} está listo para salida`)
          } else {
            console.log(`⏳ ${entry.entryCode} aún no está listo para salida`)
          }
        } catch (error) {
          console.error(`❌ Error verificando ${entry.entryCode}:`, error)
        }
      }
      
      setReadyForExit(readyEntries)
      console.log(`📊 Total de vehículos listos para salida: ${readyEntries.size}`)
    } catch (error) {
      console.error('❌ Error verificando vehículos listos para salida:', error)
      setReadyForExit(new Set<string>())
    }
  }


  const handleRegisterExit = (entry: VehicleEntry) => {
    setSelectedEntry(entry)
    setShowExitForm(true)
  }

  const handleViewDetails = async (entry: VehicleEntry) => {
    try {
      // Buscar el vehículo asociado al entry
      const vehicle = vehicles.find(v => v.id === entry.vehicleId)
      if (vehicle) {
        setSelectedVehicleDetails(vehicle)
        setShowDetailsModal(true)
      } else {
        // Si no está en el estado local, buscarlo en el backend
        const vehicleData = await vehicleService.getById(entry.vehicleId)
        setSelectedVehicleDetails(vehicleData)
        setShowDetailsModal(true)
      }
    } catch (error) {
      console.error('Error al cargar detalles del vehículo:', error)
      alert('Error al cargar los detalles del vehículo')
    }
  }

  const filteredEntries = entries.filter(entry => {
    const searchLower = searchTerm.toLowerCase()
    const vehicleId = searchParams.get('vehicleId')
    
    // Si hay un vehicleId en la URL, filtrar solo ese vehículo
    if (vehicleId && entry.vehicleId !== vehicleId) {
      return false
    }
    
    return (
      entry.entryCode.toLowerCase().includes(searchLower) ||
      entry.driverName.toLowerCase().includes(searchLower) ||
      entry.driverRut.includes(searchLower)
    )
  })

  const activeEntries = filteredEntries.filter(entry => entry.status === 'ingresado')
  const completedEntries = filteredEntries.filter(entry => entry.status === 'salida')
  const displayedCompletedEntries = showAllCompleted ? completedEntries : completedEntries.slice(0, 10)

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  const vehicleId = searchParams.get('vehicleId')
  const selectedVehicle = vehicleId ? vehicles.find(v => v.id === vehicleId) : null

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Ingresos</h2>
            <p className="text-gray-600">Control de entradas y salidas de vehículos</p>
            {selectedVehicle && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Filtrando por vehículo:</span> {selectedVehicle.licensePlate} - {selectedVehicle.brand} {selectedVehicle.model}
                </p>
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateFormAdvanced(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📝 Ingresar Vehiculo
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🏭</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ingresos</p>
                <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">{activeEntries.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-gray-900">{completedEntries.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex space-x-3">
            <input
              id="searchEntries"
              name="searchEntries"
              type="text"
              placeholder="Buscar por código, conductor o RUT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Active Entries */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Ingresos Activos</h3>
            <p className="text-gray-600">Vehículos actualmente en taller</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conductor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Ingreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KM Ingreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Combustible
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.entryCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{entry.driverName}</div>
                        <div className="text-gray-500">{entry.driverRut}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.entryDate).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.entryKm.toLocaleString()} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        entry.fuelLevel === 'full' ? 'bg-green-100 text-green-800' :
                        entry.fuelLevel === 'half' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {entry.fuelLevel === 'full' ? 'Lleno' :
                         entry.fuelLevel === 'half' ? 'Medio' : 'Bajo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {readyForExit.has(entry.id) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ Listo para salida
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⏳ En mantenimiento
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {readyForExit.has(entry.id) ? (
                        <button
                          onClick={() => handleRegisterExit(entry)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Registrar Salida
                        </button>
                      ) : (
                        <span className="text-gray-400 mr-3">
                          ⏳ Esperando orden lista
                        </span>
                      )}
                      <button 
                        onClick={() => handleViewDetails(entry)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activeEntries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay ingresos activos
              </div>
            )}
          </div>
        </div>

        {/* Completed Entries */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Historial de Salidas Registradas</h3>
                <p className="text-gray-600">
                  {showAllCompleted ? 'Todos los vehículos que han registrado salida' : 'Últimos 10 vehículos con salida registrada'}
                </p>
              </div>
              {completedEntries.length > 10 && (
                <button
                  onClick={() => setShowAllCompleted(!showAllCompleted)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  {showAllCompleted ? 'Ver Solo Últimos 10' : `Ver Todos (${completedEntries.length})`}
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conductor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Ingreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hora Ingreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Salida
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hora Salida
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedCompletedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.entryCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{entry.driverName}</div>
                        <div className="text-gray-500">{entry.driverRut}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.entryDate).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.entryTime || new Date(entry.entryDate).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.exitDate ? new Date(entry.exitDate).toLocaleDateString('es-CL') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.exitTime || (entry.exitDate ? new Date(entry.exitDate).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '-')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Completado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {completedEntries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay ingresos completados
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}

      <RegisterExitModal
        isOpen={showExitForm}
        onClose={() => {
          setShowExitForm(false)
          setSelectedEntry(null)
        }}
        onSuccess={() => {
          console.log('✅ Salida registrada exitosamente, actualizando datos...')
          loadData()
          setShowExitForm(false)
          setSelectedEntry(null)
          // Mostrar mensaje de éxito
          alert('Salida registrada exitosamente')
        }}
        entry={selectedEntry}
      />

      {/* Modal de Detalles del Vehículo */}
      {showDetailsModal && selectedVehicleDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalles del Vehículo
                </h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedVehicleDetails(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Patente</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedVehicleDetails.licensePlate}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Marca</label>
                      <p className="text-gray-900">{selectedVehicleDetails.brand}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Modelo</label>
                      <p className="text-gray-900">{selectedVehicleDetails.model}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Año</label>
                      <p className="text-gray-900">{selectedVehicleDetails.year}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tipo</label>
                      <p className="text-gray-900 capitalize">{selectedVehicleDetails.vehicleType}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Técnica</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">VIN</label>
                      <p className="text-gray-900 font-mono text-sm">{selectedVehicleDetails.vin}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Número de Flota</label>
                      <p className="text-gray-900">{selectedVehicleDetails.fleetNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Estado</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedVehicleDetails.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedVehicleDetails.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Creado</label>
                      <p className="text-gray-900">
                        {new Date(selectedVehicleDetails.createdAt).toLocaleDateString('es-CL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setSelectedVehicleDetails(null)
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateEntryModalAdvanced
        isOpen={showCreateFormAdvanced}
        onClose={() => setShowCreateFormAdvanced(false)}
        onSuccess={() => {
          loadData()
          setShowCreateFormAdvanced(false)
        }}
      />
    </MainLayout>
  )
}
