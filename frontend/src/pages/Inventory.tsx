import { useEffect, useMemo, useState } from 'react'
import { MainLayout } from '../components/Layout/MainLayout'
import { sparePartService } from '../services/sparePartService'
import type { SparePart, SparePartFilters, PaginatedResponse } from '../../../shared/types'
import { useAuthStore } from '../store/authStore'
import { ViewMovementsModal } from '../components/modals/ViewMovementsModal'

export default function Inventory() {
  // Log para verificar que se está ejecutando el código nuevo
  console.log('✅ Inventory.tsx - Versión actualizada con unitOfMeasure - v3.0')
  console.log('🔍 Si NO ves el campo "Unidad de Medida" en el formulario, el navegador tiene caché')
  console.log('🔍 Solución: Ctrl+Shift+Delete → Borrar caché → Reiniciar navegador')
  
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
  const [showAdjustStock, setShowAdjustStock] = useState(false)
  const [showMovements, setShowMovements] = useState(false)
  const [editingPart, setEditingPart] = useState<SparePart | null>(null)
  const [adjustingPart, setAdjustingPart] = useState<SparePart | null>(null)
  const [viewingMovementsPart, setViewingMovementsPart] = useState<SparePart | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isAdjusting, setIsAdjusting] = useState(false)

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
      // sendPaginated devuelve { data: [...], page, limit, total, totalPages }
      // sparePartService.getAll() devuelve res.data del axios, que es el objeto paginado
      const items: SparePart[] = response?.data ?? response?.items ?? (Array.isArray(response) ? response : [])
      const totalCount = response?.total ?? items.length

      setParts(items)
      setTotal(totalCount)
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
  const openAdjustStock = (part: SparePart) => { setAdjustingPart(part); setShowAdjustStock(true) }
  const openMovements = (part: SparePart) => { setViewingMovementsPart(part); setShowMovements(true) }
  const closeModals = () => { 
    setShowCreate(false); 
    setShowEdit(false); 
    setShowAdjustStock(false)
    setShowMovements(false)
    setEditingPart(null)
    setAdjustingPart(null)
    setViewingMovementsPart(null)
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Prevenir doble envío
    if (isCreating) return
    
    setIsCreating(true)
    const form = e.currentTarget as any
    
    try {
      // Validar y obtener unitOfMeasure - asegurar que siempre tenga un valor válido
      const unitOfMeasureElement = form.unitOfMeasure || form['create-unitOfMeasure']
      const unitOfMeasure = unitOfMeasureElement?.value?.trim() || 'unidad'
      
      // Validar y obtener unitPrice - asegurar que siempre sea un número válido
      const unitPriceElement = form.unitPrice || form['create-price']
      const unitPriceValue = unitPriceElement?.value
      const unitPrice = unitPriceValue && unitPriceValue !== '' ? Number(unitPriceValue) : 0
      
      // Validar que los campos obligatorios estén presentes
      if (!unitOfMeasure || unitOfMeasure === '') {
        alert('Por favor selecciona una unidad de medida')
        setIsCreating(false)
        return
      }
      
      if (unitPrice < 0 || isNaN(unitPrice)) {
        alert('Por favor ingresa un precio válido (mayor o igual a 0)')
        setIsCreating(false)
        return
      }
      
      // Validar campos obligatorios según backend
      const code = form.code.value.trim()
      const name = form.name.value.trim()
      const category = form.category.value.trim()
      const currentStock = Number(form.currentStock.value || 0)
      const minStock = Number(form.minStock.value || 0)
      const maxStock = Number(form.maxStock.value || minStock) // maxStock es obligatorio, usar minStock como default
      
      // Validaciones adicionales
      if (!code) {
        alert('El código es obligatorio')
        setIsCreating(false)
        return
      }
      
      if (!name) {
        alert('El nombre es obligatorio')
        setIsCreating(false)
        return
      }
      
      if (!category) {
        alert('La categoría es obligatoria')
        setIsCreating(false)
        return
      }
      
      if (minStock < 0) {
        alert('El stock mínimo debe ser mayor o igual a 0')
        setIsCreating(false)
        return
      }
      
      if (maxStock < minStock) {
        alert('El stock máximo debe ser mayor o igual al stock mínimo')
        setIsCreating(false)
        return
      }
      
      const data = {
        code: code.toUpperCase(), // Convertir a mayúsculas como el backend espera
        name: name,
        category: category,
        description: form.description.value.trim() || undefined,
        currentStock: currentStock,
        minStock: minStock,
        maxStock: maxStock, // Obligatorio según backend
        unitOfMeasure: unitOfMeasure,
        unitPrice: unitPrice,
        location: form.location?.value?.trim() || undefined,
        workshopId: (user as any)?.workshopId || (user as any)?.workshop?.id
      }
      
      console.log('📦 Datos a enviar al crear repuesto:', JSON.stringify(data, null, 2))
      console.log('🔍 unitOfMeasure:', unitOfMeasure, 'unitPrice:', unitPrice)
      
      await sparePartService.create(data as any)
      closeModals()
      await loadParts()
    } catch (err: any) {
      console.error('❌ Error al crear repuesto:', err)
      console.error('❌ Error response:', err?.response?.data)
      const errorMessage = err?.response?.data?.error || err?.message || 'No se pudo crear el repuesto'
      alert(errorMessage)
    } finally {
      setIsCreating(false)
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
      currentStock: Number(form.currentStock.value || 0),
      minStock: Number(form.minStock.value || 0),
      unitOfMeasure: form.unitOfMeasure?.value?.trim() || (editingPart as any).unitOfMeasure || 'unidad',
      // unitPrice no se edita, se mantiene el valor original
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

  const handleAdjustStock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!adjustingPart) return
    
    if (isAdjusting) return
    
    setIsAdjusting(true)
    const form = e.currentTarget as any
    
    try {
      const newStock = Number(form.newStock.value)
      const reason = form.reason.value.trim()
      
      if (isNaN(newStock) || newStock < 0) {
        alert('Por favor ingresa un stock válido (mayor o igual a 0)')
        setIsAdjusting(false)
        return
      }
      
      if (!reason) {
        alert('Por favor selecciona un motivo para el ajuste')
        setIsAdjusting(false)
        return
      }
      
      await sparePartService.adjustStock(adjustingPart.id, newStock, reason)
      closeModals()
      await loadParts()
      alert('Stock ajustado exitosamente')
    } catch (err: any) {
      console.error('Error ajustando stock:', err)
      alert(err.response?.data?.error || err.message || 'No se pudo ajustar el stock')
    } finally {
      setIsAdjusting(false)
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Inventario</h2>
            <p className="text-sm sm:text-base text-gray-600">Listado y búsqueda de repuestos</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Solo mostrar botón de crear si no es mecánico */}
            {((user as any)?.role?.name || '') !== 'Mecánico' && (
              <button
                onClick={openCreate}
                className="px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                <span className="sm:hidden">+</span>
                <span className="hidden sm:inline">+ Agregar repuesto</span>
              </button>
            )}
            <div className="text-xs sm:text-sm text-gray-500">{total} repuestos</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
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
                  {/* Ocultar precio para mecánicos */}
                  {((user as any)?.role?.name || '') !== 'Mecánico' && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parts.length === 0 && (
                  <tr>
                    <td colSpan={((user as any)?.role?.name || '') === 'Mecánico' ? 7 : 8} className="px-6 py-8 text-center text-gray-500">Sin resultados</td>
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
                      {/* Ocultar precio para mecánicos */}
                      {((user as any)?.role?.name || '') !== 'Mecánico' && (
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{typeof (p as any).unitPrice === 'number' ? `$${(p as any).unitPrice.toLocaleString('es-CL')}` : '—'}</td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-700 break-words">{p.location || '—'}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex gap-2 justify-end">
                          {/* Botón Ver Movimientos - visible para todos */}
                          <button
                            onClick={() => openMovements(p)}
                            className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-xs sm:text-sm"
                            title="Ver Movimientos"
                          >
                            📋 Ver Movimientos
                          </button>
                          {/* Solo mostrar botones de edición si no es mecánico */}
                          {((user as any)?.role?.name || '') !== 'Mecánico' && (
                            <>
                              <button
                                onClick={() => openAdjustStock(p)}
                                className="px-3 py-1 rounded bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors text-xs sm:text-sm"
                                title="Ajustar Stock"
                              >
                                📊 Ajustar Stock
                              </button>
                              <button
                                onClick={() => openEdit(p)}
                                className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-xs sm:text-sm"
                              >
                                Editar
                              </button>
                            </>
                          )}
                        </div>
                        {((user as any)?.role?.name || '') === 'Mecánico' && (
                          <span className="text-gray-400 text-sm hidden">Solo lectura</span>
                        )}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="px-4 sm:px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
                <h3 className="text-base sm:text-lg font-semibold">Agregar repuesto</h3>
                <button onClick={closeModals} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
              </div>
              <form onSubmit={handleCreate} className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="create-code" className="block text-sm font-medium text-gray-700 mb-1">Código <span className="text-red-500">*</span></label>
                    <input id="create-code" name="code" placeholder="Ej: REP-001" className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label htmlFor="create-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                    <input id="create-name" name="name" placeholder="Ej: Filtro de Aceite" className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label htmlFor="create-category" className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 font-normal ml-2">(Seleccionar o escribir nueva)</span>
                    </label>
                    <input
                      id="create-category"
                      name="category"
                      list="create-category-list"
                      className="w-full px-3 py-2 border rounded bg-white"
                      required
                      placeholder="Seleccionar o escribir categoría"
                    />
                    <datalist id="create-category-list">
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <option key={cat} value={cat} />
                        ))
                      ) : (
                        <>
                          <option value="Motor" />
                          <option value="Frenos" />
                          <option value="Suspensión" />
                          <option value="Transmisión" />
                          <option value="Eléctrico" />
                          <option value="Carrocería" />
                          <option value="Neumáticos" />
                          <option value="Aceites y Lubricantes" />
                          <option value="Filtros" />
                          <option value="Batería" />
                          <option value="Otros" />
                        </>
                      )}
                    </datalist>
                  </div>
                  <div>
                    <label htmlFor="create-unitOfMeasure" className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida <span className="text-red-500">*</span></label>
                    <select id="create-unitOfMeasure" name="unitOfMeasure" className="w-full px-3 py-2 border rounded" required defaultValue="unidad">
                      <option value="unidad">Unidad</option>
                      <option value="pieza">Pieza</option>
                      <option value="litro">Litro</option>
                      <option value="kilogramo">Kilogramo</option>
                      <option value="metro">Metro</option>
                      <option value="rollo">Rollo</option>
                      <option value="galón">Galón</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="create-price" className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario <span className="text-red-500">*</span></label>
                    <input id="create-price" name="unitPrice" type="number" step="0.01" min="0" placeholder="Ej: 15000" className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label htmlFor="create-currentStock" className="block text-sm font-medium text-gray-700 mb-1">Stock actual <span className="text-red-500">*</span></label>
                    <input id="create-currentStock" name="currentStock" type="number" min="0" placeholder="Ej: 50" className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label htmlFor="create-minStock" className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo <span className="text-red-500">*</span></label>
                    <input id="create-minStock" name="minStock" type="number" min="0" placeholder="Ej: 10" className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label htmlFor="create-maxStock" className="block text-sm font-medium text-gray-700 mb-1">Stock máximo <span className="text-red-500">*</span></label>
                    <input id="create-maxStock" name="maxStock" type="number" min="0" placeholder="Ej: 100" className="w-full px-3 py-2 border rounded" required />
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
                  <button 
                    type="button" 
                    onClick={closeModals} 
                    className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
                    disabled={isCreating}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creando...' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Ajustar Stock */}
        {showAdjustStock && adjustingPart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="px-4 sm:px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold">Ajustar Stock</h3>
                <button onClick={closeModals} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
              </div>
              <form onSubmit={handleAdjustStock} className="p-4 sm:p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-1">Repuesto</div>
                  <div className="font-semibold text-gray-900">{adjustingPart.name}</div>
                  <div className="text-sm text-gray-500">{adjustingPart.code}</div>
                  <div className="mt-2 text-sm">
                    <span className="text-gray-600">Stock actual: </span>
                    <span className="font-medium text-gray-900">{adjustingPart.currentStock}</span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="newStock" className="block text-sm font-medium text-gray-700 mb-1">
                    Nuevo Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="newStock"
                    name="newStock"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={adjustingPart.currentStock}
                    placeholder="Ingresa el nuevo stock"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo del ajuste <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="reason"
                    name="reason"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    required
                    defaultValue=""
                  >
                    <option value="">Seleccionar motivo</option>
                    <option value="conteo físico">Conteo físico</option>
                    <option value="corrección">Corrección</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    disabled={isAdjusting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isAdjusting}
                  >
                    {isAdjusting ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editar */}
        {showEdit && editingPart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="px-4 sm:px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
                <h3 className="text-base sm:text-lg font-semibold">Editar repuesto</h3>
                <button onClick={closeModals} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
              </div>
              <form onSubmit={handleEdit} className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="edit-code" className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                    <input id="edit-code" name="code" defaultValue={editingPart.code} placeholder="Código" className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input id="edit-name" name="name" defaultValue={editingPart.name} placeholder="Nombre" className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                      <span className="text-xs text-gray-500 font-normal ml-2">(Seleccionar o escribir nueva)</span>
                    </label>
                    <input
                      id="edit-category"
                      name="category"
                      list="edit-category-list"
                      className="w-full px-3 py-2 border rounded bg-white"
                      required
                      defaultValue={editingPart.category}
                      placeholder="Seleccionar o escribir categoría"
                    />
                    <datalist id="edit-category-list">
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <option key={cat} value={cat} />
                        ))
                      ) : (
                        <>
                          <option value="Motor" />
                          <option value="Frenos" />
                          <option value="Suspensión" />
                          <option value="Transmisión" />
                          <option value="Eléctrico" />
                          <option value="Carrocería" />
                          <option value="Neumáticos" />
                          <option value="Aceites y Lubricantes" />
                          <option value="Filtros" />
                          <option value="Batería" />
                          <option value="Otros" />
                        </>
                      )}
                    </datalist>
                  </div>
                  <div>
                    <label htmlFor="edit-unitOfMeasure" className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida</label>
                    <select id="edit-unitOfMeasure" name="unitOfMeasure" className="w-full px-3 py-2 border rounded" defaultValue={(editingPart as any).unitOfMeasure || 'unidad'}>
                      <option value="unidad">Unidad</option>
                      <option value="pieza">Pieza</option>
                      <option value="litro">Litro</option>
                      <option value="kilogramo">Kilogramo</option>
                      <option value="metro">Metro</option>
                      <option value="rollo">Rollo</option>
                      <option value="galón">Galón</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-currentStock" className="block text-sm font-medium text-gray-700 mb-1">Stock Actual</label>
                    <input 
                      id="edit-currentStock" 
                      name="currentStock" 
                      type="number" 
                      min="0"
                      defaultValue={editingPart.currentStock ?? 0} 
                      placeholder="Stock actual" 
                      className="w-full px-3 py-2 border rounded" 
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-minStock" className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
                    <input id="edit-minStock" name="minStock" type="number" defaultValue={editingPart.minStock} placeholder="Stock mínimo" className="w-full px-3 py-2 border rounded" required />
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

        {/* Modal Ver Movimientos */}
        {showMovements && viewingMovementsPart && (
          <ViewMovementsModal
            isOpen={showMovements}
            onClose={closeModals}
            sparePart={{
              id: viewingMovementsPart.id,
              name: viewingMovementsPart.name,
              code: viewingMovementsPart.code
            }}
          />
        )}
      </div>
    </MainLayout>
  )
}


