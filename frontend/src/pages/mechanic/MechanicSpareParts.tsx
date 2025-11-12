import { useEffect, useMemo, useState } from 'react'
import { MainLayout } from '../../components/Layout/MainLayout'
import { sparePartService, SparePart } from '../../services/sparePartService'
import { useAuthStore } from '../../store/authStore'

// Tipos locales
interface SparePartFilters {
  page?: number
  limit?: number
  search?: string
  category?: string
  lowStock?: boolean
}

interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function MechanicSpareParts() {
  const { user } = useAuthStore()
  const [parts, setParts] = useState<SparePart[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros y paginación
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [categoriesApiUnavailable, setCategoriesApiUnavailable] = useState(false)
  const [categoriesLoadedOnce, setCategoriesLoadedOnce] = useState(false)
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const [total, setTotal] = useState(0)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  useEffect(() => {
    if (user) {
      loadParts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, user])

  useEffect(() => {
    const loadCategories = async () => {
      if (categoriesLoadedOnce || categoriesApiUnavailable) return
      try {
        setLoadingCategories(true)
        const data = await sparePartService.getCategories()
        let cats: string[] = []
        if (Array.isArray(data)) {
          cats = data
            .map((item: any) => {
              if (typeof item === 'string') return item
              if (item && typeof item.name === 'string') return item.name
              if (item && typeof item.category === 'string') return item.category
              return null
            })
            .filter((v: any) => typeof v === 'string')
        }
        setCategories(cats)
        setCategoriesLoadedOnce(true)
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setCategoriesApiUnavailable(true)
        }
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [categoriesLoadedOnce, categoriesApiUnavailable])

  // Si no hay categorías desde API, derivarlas desde los datos cargados
  useEffect(() => {
    if ((!categories.length || categoriesApiUnavailable) && parts.length) {
      const derived = Array.from(new Set(parts.map(p => p.category))).sort()
      setCategories(derived)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parts, categoriesApiUnavailable])

  // Recargar automáticamente al cambiar filtros rápidos
  useEffect(() => {
    setPage(1)
    loadParts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, lowStockOnly])

  const loadParts = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: Partial<SparePartFilters> = { page, limit }
      if (search.trim()) params.search = search.trim()
      if (category.trim()) params.category = category.trim()
      if (lowStockOnly) params.lowStock = true

      const response: PaginatedResponse<SparePart> | any = await sparePartService.getAll(params as any)
      
      console.log('[MechanicSpareParts] 🔍 Params enviados:', params)
      console.log('[MechanicSpareParts] 📦 Respuesta recibida:', response)
      console.log('[MechanicSpareParts] 📦 Tipo respuesta:', typeof response)
      console.log('[MechanicSpareParts] 📦 Es array?', Array.isArray(response))
      if (response && typeof response === 'object') {
        console.log('[MechanicSpareParts] 📦 Keys:', Object.keys(response))
        console.log('[MechanicSpareParts] 📦 response.data existe?', 'data' in response)
        console.log('[MechanicSpareParts] 📦 response.data es array?', Array.isArray(response.data))
        console.log('[MechanicSpareParts] 📦 response.data length:', response.data?.length)
        console.log('[MechanicSpareParts] 📦 response.total:', response.total)
      }
      
      // sendPaginated devuelve { data: [...], page, limit, total, totalPages }
      // sparePartService.getAll() devuelve res.data del axios, que es el objeto paginado
      const items: SparePart[] = response?.data ?? response?.items ?? response?.spareParts ?? (Array.isArray(response) ? response : [])
      const totalCount = response?.total ?? items.length

      console.log('[MechanicSpareParts] ✅ Items extraídos:', items.length)
      console.log('[MechanicSpareParts] ✅ Total count:', totalCount)
      if (items.length > 0) {
        console.log('[MechanicSpareParts] ✅ Primer item:', items[0])
      }

      setParts(items)
      setTotal(totalCount)
    } catch (err: any) {
      console.error('Error cargando inventario:', err)
      console.error('Error completo:', {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
        config: err?.config
      })
      
      let errorMessage = 'No se pudo cargar el inventario'
      
      if (err?.response?.status === 400) {
        const backendError = err?.response?.data?.error || err?.response?.data?.message
        errorMessage = backendError || 'Error en los parámetros de la petición. Por favor, intenta nuevamente.'
      } else if (err?.response?.status === 401) {
        errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.'
      } else if (err?.response?.status === 403) {
        errorMessage = 'No tienes permisos para ver el inventario. Contacta al administrador.'
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setParts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setPage(1)
    await loadParts()
  }

  const handleClear = async () => {
    setSearch('')
    setCategory('')
    setLowStockOnly(false)
    setPage(1)
    await loadParts()
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inventario</h2>
            <p className="text-gray-600">Listado y búsqueda de repuestos</p>
          </div>
          <div className="text-sm text-gray-500">{total} repuestos</div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Buscar por nombre, código o categoría..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1) }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">
                  {loadingCategories ? 'Cargando categorías...' : 'Todas las categorías'}
                </option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="lowStock"
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="lowStock" className="text-sm text-gray-700">Solo stock bajo</label>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleClear}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={handleSearch}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="md:overflow-visible overflow-x-auto">
            <table className="min-w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Mínimo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!loading && parts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      {error ? (
                        <span className="text-red-600">{error}</span>
                      ) : (
                        <div>
                          <p className="text-gray-500 mb-2">No hay repuestos registrados</p>
                          <p className="text-sm text-gray-400">Contacta al administrador para agregar repuestos al inventario</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
                {loading && parts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                        <span>Cargando repuestos...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {parts.map((p) => {
                  const isLow = p.currentStock <= p.minStock
                  const out = p.currentStock === 0
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 break-words">{p.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 break-words">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 break-words">{p.category}</td>
                      <td className={`px-4 py-3 text-sm text-right font-medium ${out ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-green-600'}`}>{p.currentStock}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">{p.minStock}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 break-words">{p.location || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Página {page} de {totalPages}
            </div>
            <div className="space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`px-3 py-1 rounded border ${page <= 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={`px-3 py-1 rounded border ${page >= totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
