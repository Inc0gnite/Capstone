import { MainLayout } from '../../components/Layout/MainLayout'
import { sparePartService, SparePart } from '../../services/sparePartService'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'

export default function MechanicSpareParts() {
  const [parts, setParts] = useState<SparePart[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'available'>('all')
  const { user } = useAuthStore()

  useEffect(() => {
    const loadSpareParts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // NO filtrar por workshopId - el mecánico debe ver TODOS los repuestos disponibles
        // Usar la misma lógica que Inventory.tsx para cargar los datos
        const params: any = { 
          page: 1, 
          limit: 100 // El backend tiene un límite máximo de 100
        }
        
        // No filtrar por taller - mostrar todos los repuestos del sistema
        
        const response: any = await sparePartService.getAll(params)
        
        // El backend devuelve según sendPaginated: { data: [...], page, limit, total, totalPages }
        // sparePartService.getAll() devuelve res.data del axios, que es el objeto paginado
        // Entonces response = { data: [...], page: 1, limit: 100, total: X, totalPages: Y }
        
        console.log('🔍 Respuesta completa del backend:', response)
        console.log('🔍 Tipo de response:', typeof response)
        console.log('🔍 Es array?', Array.isArray(response))
        console.log('🔍 Keys de response:', response ? Object.keys(response) : 'null')
        
        // Extraer items de la respuesta paginada
        let items: SparePart[] = []
        
        if (Array.isArray(response)) {
          // Si la respuesta es directamente un array
          items = response
          console.log('✅ La respuesta es un array directo, usando:', items.length, 'items')
        } else if (response?.data && Array.isArray(response.data)) {
          // Si la respuesta tiene estructura { data: [...] }
          items = response.data
          console.log('✅ Items extraídos de response.data:', items.length)
        } else if (response?.items && Array.isArray(response.items)) {
          // Si la respuesta tiene estructura { items: [...] }
          items = response.items
          console.log('✅ Items extraídos de response.items:', items.length)
        } else if (response?.success && response?.data && Array.isArray(response.data)) {
          // Si la respuesta tiene estructura { success: true, data: [...] }
          items = response.data
          console.log('✅ Items extraídos de response.data (con success):', items.length)
        } else {
          console.warn('⚠️ No se pudo extraer items de la respuesta:', response)
        }
        
        console.log('🔍 Items extraídos:', items.length)
        console.log('🔍 Total según backend:', response?.total)
        
        if (items.length === 0 && response?.total > 0) {
          console.warn('⚠️ No se encontraron items pero hay total:', response.total)
          console.warn('⚠️ Estructura de respuesta completa:', JSON.stringify(response, null, 2))
        }
        
        if (items.length === 0 && (!response?.total || response?.total === 0)) {
          console.info('ℹ️ No hay repuestos registrados en el sistema')
        }
        
        console.log('✅ Estableciendo', items.length, 'repuestos en el estado')
        setParts(items)
      } catch (err: any) {
        console.error('Error cargando repuestos:', err)
        console.error('Error response:', err?.response)
        console.error('Error status:', err?.response?.status)
        console.error('Error data:', err?.response?.data)
        
        let errorMessage = 'Error desconocido al cargar los repuestos'
        
        if (err?.response?.status === 401) {
          errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.'
        } else if (err?.response?.status === 403) {
          errorMessage = 'No tienes permisos para ver los repuestos. Contacta al administrador.'
        } else if (err?.response?.status === 404) {
          errorMessage = 'El endpoint de repuestos no fue encontrado. Verifica la configuración del servidor.'
        } else if (err?.response?.data?.error) {
          errorMessage = err.response.data.error
        } else if (err?.message) {
          errorMessage = err.message
        }
        
        setError(errorMessage)
        setParts([])
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadSpareParts()
    }
  }, [user])

  const filteredParts = parts.filter(part => {
    // Filtro por búsqueda
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false
    
    // Filtro por estado
    switch (filter) {
      case 'low_stock':
        return part.currentStock <= part.minStock
      case 'available':
        return part.currentStock > part.minStock
      default:
        return true
    }
  })

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock === 0) {
      return { text: 'Sin Stock', color: 'bg-red-100 text-red-800' }
    } else if (currentStock <= minStock) {
      return { text: 'Stock Bajo', color: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { text: 'Disponible', color: 'bg-green-100 text-green-800' }
    }
  }

  const getStockColor = (currentStock: number, minStock: number) => {
    if (currentStock === 0) {
      return 'text-red-600'
    } else if (currentStock <= minStock) {
      return 'text-yellow-600'
    } else {
      return 'text-green-600'
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando repuestos...</p>
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inventario de Repuestos</h2>
            <p className="text-gray-600">Consulta el stock disponible de repuestos</p>
          </div>
          <div className="text-sm text-gray-500">
            Total: {parts.length} repuestos
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre, código o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filtros */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos ({parts.length})
              </button>
              <button
                onClick={() => setFilter('low_stock')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'low_stock'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Stock Bajo ({parts.filter(p => p.currentStock <= p.minStock).length})
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'available'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Disponibles ({parts.filter(p => p.currentStock > p.minStock).length})
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Repuestos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParts.length > 0 ? (
            filteredParts.map((part) => {
              const stockStatus = getStockStatus(part.currentStock, part.minStock)
              const stockColor = getStockColor(part.currentStock, part.minStock)
              
              const isOutOfStock = part.currentStock === 0
              
              return (
                <div key={part.id} className={`rounded-lg shadow p-6 hover:shadow-md transition-shadow ${
                  isOutOfStock 
                    ? 'bg-red-50 border-2 border-red-200' 
                    : 'bg-white'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 ${
                        isOutOfStock ? 'text-red-900' : 'text-gray-900'
                      }`}>
                        {part.name}
                      </h3>
                      <p className={`text-sm mb-2 ${
                        isOutOfStock ? 'text-red-700' : 'text-gray-600'
                      }`}>
                        Código: {part.code}
                      </p>
                      <p className={`text-sm mb-3 ${
                        isOutOfStock ? 'text-red-700' : 'text-gray-600'
                      }`}>
                        Categoría: {part.category}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock Actual:</span>
                      <span className={`font-medium ${stockColor}`}>
                        {part.currentStock} unidades
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock Mínimo:</span>
                      <span className="font-medium text-gray-900">
                        {part.minStock} unidades
                      </span>
                    </div>
                    {part.supplier && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Proveedor:</span>
                        <span className="font-medium text-gray-900">
                          {part.supplier}
                        </span>
                      </div>
                    )}
                    {part.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ubicación:</span>
                        <span className="font-medium text-gray-900">
                          {part.location}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {part.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Descripción:</span> {part.description}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Última actualización:</span>
                      <span>{new Date(part.updatedAt).toLocaleDateString('es-CL')}</span>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔧</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {parts.length === 0 
                  ? 'No hay repuestos registrados en el sistema'
                  : `No hay repuestos ${filter === 'all' ? '' : `con filtro "${filter}"`}`
                }
              </h3>
              <p className="text-gray-500">
                {parts.length === 0
                  ? 'No se encontraron repuestos en la base de datos. Contacte al administrador para agregar repuestos.'
                  : filter === 'all' 
                    ? 'No se encontraron repuestos con los criterios de búsqueda'
                    : `No hay repuestos con estado "${filter}". Intente cambiar el filtro o el término de búsqueda.`
                }
              </p>
            </div>
          )}
        </div>

        {/* Resumen de Stock */}
        {parts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {parts.filter(p => p.currentStock > p.minStock).length}
                </div>
                <div className="text-sm text-green-600">Disponibles</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {parts.filter(p => p.currentStock > 0 && p.currentStock <= p.minStock).length}
                </div>
                <div className="text-sm text-yellow-600">Stock Bajo</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {parts.filter(p => p.currentStock === 0).length}
                </div>
                <div className="text-sm text-red-600">Sin Stock</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
