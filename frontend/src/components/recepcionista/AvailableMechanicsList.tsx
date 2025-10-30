import { useState, useEffect } from 'react'
import { mechanicService, MechanicWorkload } from '../../services/mechanicService'

interface AvailableMechanicsListProps {
  workshopId: string
  onMechanicSelected?: (mechanic: MechanicWorkload) => void
  showOnlyAvailable?: boolean
}

export function AvailableMechanicsList({ 
  workshopId, 
  onMechanicSelected,
  showOnlyAvailable = false 
}: AvailableMechanicsListProps) {
  const [mechanics, setMechanics] = useState<MechanicWorkload[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'available' | 'busy'>('all')

  useEffect(() => {
    if (workshopId) {
      loadMechanics()
    }
  }, [workshopId])

  const loadMechanics = async () => {
    try {
      setLoading(true)
      setError(null)
      const availableMechanics = await mechanicService.getAvailableMechanics(workshopId)
      setMechanics(availableMechanics)
    } catch (err: any) {
      console.error('Error cargando mecánicos:', err)
      setError(err.response?.data?.message || 'Error cargando mecánicos')
    } finally {
      setLoading(false)
    }
  }

  const getWorkloadPercentage = (activeOrders: number, maxCapacity: number) => {
    return Math.round((activeOrders / maxCapacity) * 100)
  }

  const getWorkloadColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-100 text-red-800'
    if (percentage >= 70) return 'bg-orange-100 text-orange-800'
    return 'bg-green-100 text-green-800'
  }

  const getWorkloadText = (percentage: number) => {
    if (percentage >= 90) return 'Sobrecargado'
    if (percentage >= 70) return 'Alta carga'
    return 'Disponible'
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600'
    if (efficiency >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredMechanics = mechanics.filter(mechanic => {
    if (showOnlyAvailable) return mechanic.isAvailable
    if (filter === 'available') return mechanic.isAvailable
    if (filter === 'busy') return !mechanic.isAvailable
    return true
  })

  const handleMechanicClick = (mechanic: MechanicWorkload) => {
    if (onMechanicSelected) {
      onMechanicSelected(mechanic)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando mecánicos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-2">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadMechanics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          👨‍🔧 Mecánicos del Taller
        </h3>
        
        {!showOnlyAvailable && (
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === 'available' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Disponibles
            </button>
            <button
              onClick={() => setFilter('busy')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === 'busy' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ocupados
            </button>
          </div>
        )}
      </div>

      {filteredMechanics.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">👨‍🔧</div>
          <p>No hay mecánicos {filter === 'available' ? 'disponibles' : filter === 'busy' ? 'ocupados' : 'en este taller'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMechanics.map((mechanic) => {
            const workloadPercentage = getWorkloadPercentage(mechanic.activeOrders, mechanic.maxCapacity)
            
            return (
              <div
                key={mechanic.mechanicId}
                className={`p-4 border rounded-lg transition-colors ${
                  onMechanicSelected 
                    ? 'cursor-pointer hover:bg-gray-50 hover:border-gray-300' 
                    : ''
                } ${
                  mechanic.isAvailable 
                    ? 'border-gray-200' 
                    : 'border-red-200 bg-red-50'
                }`}
                onClick={() => handleMechanicClick(mechanic)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900 text-lg">
                        {mechanic.mechanicName}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        mechanic.inProgressOrders > 0 
                          ? 'bg-blue-100 text-blue-800' 
                          : mechanic.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {mechanic.inProgressOrders > 0 
                          ? '🔨 En progreso' 
                          : mechanic.isAvailable 
                          ? '✅ Disponible' 
                          : '⛔ Lleno'}
                      </span>
                    </div>
                    
                    {/* Descripción breve del mecánico */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        {mechanic.inProgressOrders > 0 
                          ? `Trabajando actualmente en una tarea. Tiene ${mechanic.activeOrders} orden${mechanic.activeOrders > 1 ? 'es' : ''} asignada${mechanic.activeOrders > 1 ? 's' : ''} en total.`
                          : mechanic.currentHours >= mechanic.maxHours 
                          ? `Capacidad completa: ${mechanic.currentHours}h/${mechanic.maxHours}h asignadas. No disponible para más tareas.`
                          : mechanic.activeOrders > 0 
                          ? `Tiene ${mechanic.activeOrders} orden${mechanic.activeOrders > 1 ? 'es' : ''} pendiente${mechanic.activeOrders > 1 ? 's' : ''}. ${mechanic.maxHours - mechanic.currentHours}h disponibles de capacidad.`
                          : 'Sin tareas asignadas. Disponible para nuevas asignaciones.'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium block text-xs text-gray-500">Estado</span>
                        <span className={`font-bold text-sm ${
                          mechanic.inProgressOrders > 0 ? 'text-blue-600' :
                          mechanic.isAvailable ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {mechanic.inProgressOrders > 0 ? 'En Progreso' : mechanic.isAvailable ? 'Disponible' : 'Ocupado'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium block text-xs text-gray-500">Horas</span>
                        <span className="font-bold text-sm text-gray-900">
                          {mechanic.currentHours}h / {mechanic.maxHours}h
                        </span>
                      </div>
                      <div>
                        <span className="font-medium block text-xs text-gray-500">Órdenes</span>
                        <span className="font-bold text-sm text-gray-900">
                          {mechanic.activeOrders} activa{mechanic.activeOrders !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium block text-xs text-gray-500">Eficiencia</span>
                        <span className={`font-bold text-sm ${getEfficiencyColor(mechanic.efficiency)}`}>
                          {mechanic.efficiency}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Barra de progreso de horas */}
                    <div className="mt-3 bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center justify-between text-xs text-gray-700 mb-1">
                        <span>Horas Asignadas</span>
                        <span className="font-bold">{mechanic.currentHours}h / {mechanic.maxHours}h</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            (mechanic.currentHours / mechanic.maxHours) >= 1 ? 'bg-red-500' :
                            (mechanic.currentHours / mechanic.maxHours) >= 0.9 ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((mechanic.currentHours / mechanic.maxHours) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {mechanic.maxHours - mechanic.currentHours}h disponibles de capacidad
                      </div>
                    </div>
                    
                    {/* Especialidades */}
                    {mechanic.specialties && mechanic.specialties.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs text-gray-500 font-medium">Especialidades:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {mechanic.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {onMechanicSelected && (
                    <div className="ml-4">
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors">
                        Seleccionar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      {/* Estadísticas resumidas */}
      {mechanics.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {mechanics.length}
              </div>
              <div className="text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mechanics.filter(m => m.isAvailable).length}
              </div>
              <div className="text-gray-600">Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {mechanics.filter(m => !m.isAvailable).length}
              </div>
              <div className="text-gray-600">Ocupados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(mechanics.reduce((acc, m) => acc + m.efficiency, 0) / mechanics.length)}%
              </div>
              <div className="text-gray-600">Eficiencia Promedio</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

