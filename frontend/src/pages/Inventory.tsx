import { useEffect, useMemo, useState } from 'react'
import { MainLayout } from '../components/Layout/MainLayout'
import { sparePartService } from '../services/sparePartService'
import type { SparePart, SparePartFilters, PaginatedResponse } from '../../../shared/types'
import { useAuthStore } from '../store/authStore'

export default function Inventory() {
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

  // Modales
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingPart, setEditingPart] = useState<SparePart | null>(null)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  useEffect(() => {
    loadParts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit])

  useEffect(() => {
    const loadCategories = async () => {
      if (categoriesLoadedOnce || categoriesApiUnavailable) return
      try {
        setLoadingCategories(true)
        const data = await sparePartService.getCategories()
        let cats: string[] = []
        if (Array.isArray(data)) {
          // El backend puede devolver: ["Lubricantes", ...] o [{ name: "Lubricantes" }] o [{ category: "Lubricantes" }]
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
        // Si el endpoint no existe (404), marcar como no disponible y usar derivación
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
      // La API retorna { success, data, pagination }. Aseguramos compatibilidad flexible
      const items: SparePart[] = response?.data ?? response?.items ?? []
      const pagination = response?.pagination ?? { total: items.length, page, limit }

      setParts(items)
      setTotal(pagination.total || items.length)
    } catch (err: any) {
      console.error('Error cargando inventario:', err)
      setError('No se pudo cargar el inventario')
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

  const openCreate = () => setShowCreate(true)
  const openEdit = (part: SparePart) => { setEditingPart(part); setShowEdit(true) }
  const closeModals = () => { setShowCreate(false); setShowEdit(false); setEditingPart(null) }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget as any
    const data = {
      code: form.code.value.trim(),
      name: form.name.value.trim(),
      category: form.category.value.trim(),
      description: form.description.value.trim() || undefined,
      currentStock: Number(form.currentStock.value || 0),
      minStock: Number(form.minStock.value || 0),
      maxStock: form.maxStock.value ? Number(form.maxStock.value) : undefined,
      price: form.unitPrice.value ? Number(form.unitPrice.value) : undefined,
      supplier: form.supplier.value.trim() || undefined,
      location: form.location.value.trim() || undefined,
      workshopId: (user as any)?.workshopId || (user as any)?.workshop?.id
    }
    try {
      await sparePartService.create(data as any)
      closeModals()
      await loadParts()
    } catch (err) {
      alert('No se pudo crear el repuesto')
    }
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingPart) return
    const form = e.currentTarget as any
    const data = {
      code: form.code.value.trim(),
      name: form.name.value.trim(),
      category: form.category.value.trim(),
      description: form.description.value.trim() || undefined,
      minStock: Number(form.minStock.value || 0),
      maxStock: form.maxStock.value ? Number(form.maxStock.value) : undefined,
      price: form.unitPrice.value ? Number(form.unitPrice.value) : undefined,
      supplier: form.supplier.value.trim() || undefined,
      location: form.location.value.trim() || undefined,
    }
    try {
      await sparePartService.update(editingPart.id, data as any)
      closeModals()
      await loadParts()
    } catch (err) {
      alert('No se pudo actualizar el repuesto')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando inventario...</p>
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
          <div className="flex items-center gap-3">
            <button
              onClick={openCreate}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              + Agregar repuesto
            </button>
            <div className="text-sm text-gray-500">{total} repuestos</div>
          </div>
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Mínimo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">Sin resultados</td>
                  </tr>
                )}
                {parts.map((p) => {
                  const isLow = p.currentStock <= p.minStock
                  const out = p.currentStock === 0
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.category}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${out ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-green-600'}`}>{p.currentStock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">{p.minStock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{typeof (p as any).unitPrice === 'number' ? `$${(p as any).unitPrice.toLocaleString('es-CL')}` : '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.location || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button
                          onClick={() => openEdit(p)}
                          className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          Editar
                        </button>
                      </td>
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

        {/* Modal Crear */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Agregar repuesto</h3>
                <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="create-code" className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                    <input id="create-code" name="code" placeholder="Ej: REP-001" className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label htmlFor="create-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input id="create-name" name="name" placeholder="Ej: Filtro de Aceite" className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label htmlFor="create-category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <input id="create-category" name="category" placeholder="Ej: Filtros de Aceite" className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label htmlFor="create-price" className="block text-sm font-medium text-gray-700 mb-1">Precio (opcional)</label>
                    <input id="create-price" name="unitPrice" type="number" step="0.01" placeholder="Ej: 15000" className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div>
                    <label htmlFor="create-currentStock" className="block text-sm font-medium text-gray-700 mb-1">Stock actual</label>
                    <input id="create-currentStock" name="currentStock" type="number" placeholder="Ej: 50" className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label htmlFor="create-minStock" className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
                    <input id="create-minStock" name="minStock" type="number" placeholder="Ej: 10" className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label htmlFor="create-maxStock" className="block text-sm font-medium text-gray-700 mb-1">Stock máximo (opcional)</label>
                    <input id="create-maxStock" name="maxStock" type="number" placeholder="Ej: 100" className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div>
                    <label htmlFor="create-supplier" className="block text-sm font-medium text-gray-700 mb-1">Proveedor (opcional)</label>
                    <input id="create-supplier" name="supplier" placeholder="Ej: Proveedor de Repuestos" className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div>
                    <label htmlFor="create-location" className="block text-sm font-medium text-gray-700 mb-1">Ubicación (opcional)</label>
                    <input id="create-location" name="location" placeholder="Ej: Estante A1" className="w-full px-3 py-2 border rounded" />
                  </div>
                </div>
                <div>
                  <label htmlFor="create-description" className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                  <textarea id="create-description" name="description" placeholder="Ej: Aceite sintético para motor diésel" className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={closeModals} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Crear</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editar */}
        {showEdit && editingPart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Editar repuesto</h3>
                <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form onSubmit={handleEdit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-code" className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                    <input id="edit-code" name="code" defaultValue={editingPart.code} placeholder="Código" className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input id="edit-name" name="name" defaultValue={editingPart.name} placeholder="Nombre" className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <input id="edit-category" name="category" defaultValue={editingPart.category} placeholder="Categoría" className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-1">Precio (opcional)</label>
                    <input id="edit-price" name="unitPrice" type="number" step="0.01" defaultValue={(editingPart as any).unitPrice ?? ''} placeholder="Precio" className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div>
                    <label htmlFor="edit-minStock" className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
                    <input id="edit-minStock" name="minStock" type="number" defaultValue={editingPart.minStock} placeholder="Stock mínimo" className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label htmlFor="edit-maxStock" className="block text-sm font-medium text-gray-700 mb-1">Stock máximo (opcional)</label>
                    <input id="edit-maxStock" name="maxStock" type="number" defaultValue={(editingPart as any).maxStock ?? ''} placeholder="Stock máximo" className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div>
                    <label htmlFor="edit-supplier" className="block text-sm font-medium text-gray-700 mb-1">Proveedor (opcional)</label>
                    <input id="edit-supplier" name="supplier" defaultValue={(editingPart as any).supplier ?? ''} placeholder="Proveedor" className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div>
                    <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700 mb-1">Ubicación (opcional)</label>
                    <input id="edit-location" name="location" defaultValue={editingPart.location ?? ''} placeholder="Ubicación" className="w-full px-3 py-2 border rounded" />
                  </div>
                </div>
                <div>
                  <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                  <textarea id="edit-description" name="description" defaultValue={editingPart.description ?? ''} placeholder="Descripción" className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={closeModals} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}


