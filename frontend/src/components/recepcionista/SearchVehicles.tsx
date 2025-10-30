import { useState } from 'react'
import { VehicleEntry } from '../../services/vehicleEntryService'

interface SearchVehiclesProps {
  onSearch: (query: string) => Promise<VehicleEntry[]>
  onVehicleSelected?: (vehicle: VehicleEntry) => void
}

export function SearchVehicles({ onSearch, onVehicleSelected }: SearchVehiclesProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<VehicleEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) {
      setResults([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const searchResults = await onSearch(query)
      setResults(searchResults)
    } catch (err: any) {
      console.error('Error buscando vehículos:', err)
      setError(err.message || 'Error buscando vehículos')
    } finally {
      setLoading(false)
    }
  }

  const handleVehicleSelect = (vehicle: VehicleEntry) => {
    onVehicleSelected(vehicle)
    setQuery('')
    setResults([])
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ingresado':
        return 'bg-blue-100 text-blue-800'
      case 'en_taller':
        return 'bg-yellow-100 text-yellow-800'
      case 'listo_para_salida':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🔍 Búsqueda de Vehículo
      </h3>
      
      {/* Formulario de búsqueda */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex space-x-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por patente, código de ingreso, conductor o RUT..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '⏳ Buscando...' : '🔍 Buscar'}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Resultados */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            Resultados ({results.length})
          </h4>
          
          {results.map((vehicle) => (
            <div
              key={vehicle.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleVehicleSelect(vehicle)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-bold text-gray-900 text-lg">
                      {vehicle.vehicle?.plate || 'N/A'}
                    </p>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {vehicle.entryCode}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                    <div>
                      <span className="font-medium">Conductor:</span> {vehicle.driverName}
                    </div>
                    <div>
                      <span className="font-medium">RUT:</span> {vehicle.driverRut}
                    </div>
                    <div>
                      <span className="font-medium">Ingreso:</span> {formatDate(vehicle.entryDate)}
                    </div>
                    <div>
                      <span className="font-medium">Vehículo:</span> {vehicle.vehicle?.brand} {vehicle.vehicle?.model}
                    </div>
                  </div>
                  
                  {vehicle.issue && (
                    <div className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">Motivo:</span> {vehicle.issue}
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors">
                    👁️ Ver Detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {query && results.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <p>No se encontraron vehículos con el criterio de búsqueda</p>
        </div>
      )}

      {/* Sugerencias de búsqueda */}
      {!query && (
        <div className="text-sm text-gray-500">
          <p className="mb-2">💡 <strong>Sugerencias de búsqueda:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Patente del vehículo (ej: ABCD-12)</li>
            <li>Código de ingreso (ej: ING-2024-001)</li>
            <li>Nombre del conductor</li>
            <li>RUT del conductor</li>
          </ul>
        </div>
      )}
    </div>
  )
}
