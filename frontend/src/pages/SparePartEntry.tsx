import { useState, useEffect } from 'react'
import { MainLayout } from '../components/Layout/MainLayout'
import { sparePartService } from '../services/sparePartService'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'
import type { SparePart } from '../services/sparePartService'

export default function SparePartEntry() {
  const { user } = useAuthStore()
  const [spareParts, setSpareParts] = useState<SparePart[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Formulario
  const [selectedSparePartId, setSelectedSparePartId] = useState<string>('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [quantity, setQuantity] = useState<number>(0)
  const [unitPrice, setUnitPrice] = useState<number | ''>('')
  const [reference, setReference] = useState<string>('')
  
  // Formulario de creación de repuesto
  const [newSparePart, setNewSparePart] = useState({
    code: '',
    name: '',
    category: '',
    unitOfMeasure: 'unidad',
    unitPrice: 0,
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    location: '',
    description: ''
  })
  const [categories, setCategories] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadSpareParts()
    loadCategories()
  }, [])

  const loadSpareParts = async () => {
    try {
      setLoading(true)
      const response = await sparePartService.getAll({ page: 1, limit: 1000 })
      const items = response?.data ?? response?.items ?? (Array.isArray(response) ? response : [])
      setSpareParts(items)
    } catch (err: any) {
      console.error('Error cargando repuestos:', err)
      setError('No se pudieron cargar los repuestos')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
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
    } catch (err) {
      console.error('Error cargando categorías:', err)
    }
  }

  const handleCreateSparePart = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isCreating) return
    
    setIsCreating(true)
    try {
      const workshopId = (user as any)?.workshopId || (user as any)?.workshop?.id
      
      const data = {
        code: newSparePart.code.toUpperCase(),
        name: newSparePart.name,
        category: newSparePart.category,
        unitOfMeasure: newSparePart.unitOfMeasure,
        unitPrice: newSparePart.unitPrice,
        currentStock: newSparePart.currentStock,
        minStock: newSparePart.minStock,
        maxStock: newSparePart.maxStock,
        location: newSparePart.location || undefined,
        description: newSparePart.description || undefined,
        workshopId: workshopId || ''
      }
      
      // Si hay cantidad ingresada, usar esa cantidad como stock inicial
      const stockInicial = quantity > 0 ? quantity : newSparePart.currentStock
      const precioInicial = (unitPrice && typeof unitPrice === 'number' && unitPrice > 0) ? unitPrice : newSparePart.unitPrice
      
      const dataToCreate = {
        ...data,
        currentStock: stockInicial,
        unitPrice: precioInicial
      }
      
      const created = await sparePartService.create(dataToCreate as any)
      const createdId = created.data?.id || created.id
      
      // Si se creó con stock inicial desde el formulario de ingreso, registrar el movimiento
      if (quantity > 0 && stockInicial === quantity) {
        await sparePartService.entryStock(createdId, quantity, 'Ingreso inicial', reference || undefined)
      }
      
      await loadSpareParts()
      setSelectedSparePartId(createdId)
      setShowCreateForm(false)
      setSuccess('Repuesto creado e ingresado exitosamente')
      setTimeout(() => setSuccess(null), 5000)
      
      // Resetear formulario de creación
      setNewSparePart({
        code: '',
        name: '',
        category: '',
        unitOfMeasure: 'unidad',
        unitPrice: 0,
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        location: '',
        description: ''
      })
      
      // Si ya se ingresó el stock al crear, resetear cantidad
      if (quantity > 0 && stockInicial === quantity) {
        setQuantity(0)
        setUnitPrice('')
        setReference('')
      }
    } catch (err: any) {
      console.error('Error creando repuesto:', err)
      setError(err.response?.data?.error || err.message || 'No se pudo crear el repuesto')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedSparePartId) {
      setError('Por favor selecciona un repuesto')
      return
    }
    
    if (quantity <= 0) {
      setError('La cantidad debe ser mayor a 0')
      return
    }
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    
    try {
      const selectedPart = spareParts.find(p => p.id === selectedSparePartId)
      if (!selectedPart) {
        setError('Repuesto no encontrado')
        setIsSubmitting(false)
        return
      }
      
      // Actualizar precio si se proporcionó
      if (unitPrice && typeof unitPrice === 'number' && unitPrice > 0) {
        await sparePartService.update(selectedSparePartId, { unitPrice: unitPrice } as any)
      }
      
      // Registrar ingreso de stock
      const reason = 'Ingreso de repuestos'
      await sparePartService.entryStock(selectedSparePartId, quantity, reason, reference)
      
      setSuccess('Ingreso de repuestos registrado exitosamente')
      
      // Resetear formulario
      setQuantity(0)
      setUnitPrice('')
      setReference('')
      setSelectedSparePartId('')
      
      // Recargar repuestos para ver stock actualizado
      await loadSpareParts()
      
      setTimeout(() => setSuccess(null), 5000)
    } catch (err: any) {
      console.error('Error registrando ingreso:', err)
      setError(err.response?.data?.error || err.message || 'No se pudo registrar el ingreso')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedPart = spareParts.find(p => p.id === selectedSparePartId)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ingreso de Repuestos</h1>
            <p className="text-gray-600 mt-1">Registra la entrada de repuestos al inventario</p>
          </div>
          <Link
            to="/inventory"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            ← Volver a Inventario
          </Link>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleccionar o crear repuesto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repuesto <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-2">
                <select
                  value={selectedSparePartId}
                  onChange={(e) => {
                    setSelectedSparePartId(e.target.value)
                    if (e.target.value) {
                      const part = spareParts.find(p => p.id === e.target.value)
                      if (part && (part as any).unitPrice) {
                        setUnitPrice((part as any).unitPrice)
                      }
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={!showCreateForm}
                  disabled={showCreateForm}
                >
                  <option value="">Seleccionar repuesto existente</option>
                  {spareParts.map((part) => (
                    <option key={part.id} value={part.id}>
                      {part.code} - {part.name} (Stock: {part.currentStock})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(!showCreateForm)
                    if (!showCreateForm) {
                      setSelectedSparePartId('')
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    showCreateForm
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {showCreateForm ? 'Cancelar' : '+ Crear Nuevo'}
                </button>
              </div>
            </div>

            {/* Formulario de creación de repuesto */}
            {showCreateForm && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
                <h3 className="font-semibold text-gray-900">Crear Nuevo Repuesto</h3>
                <form onSubmit={handleCreateSparePart} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newSparePart.code}
                      onChange={(e) => setNewSparePart({ ...newSparePart, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                      placeholder="Ej: REP-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newSparePart.name}
                      onChange={(e) => setNewSparePart({ ...newSparePart, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                      placeholder="Ej: Filtro de Aceite"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 font-normal ml-2">(Seleccionar o escribir nueva)</span>
                    </label>
                    <input
                      type="text"
                      value={newSparePart.category}
                      onChange={(e) => setNewSparePart({ ...newSparePart, category: e.target.value })}
                      list="new-category-list"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                      placeholder="Seleccionar o escribir categoría"
                    />
                    <datalist id="new-category-list">
                      {categories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unidad de Medida <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newSparePart.unitOfMeasure}
                      onChange={(e) => setNewSparePart({ ...newSparePart, unitOfMeasure: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    >
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Unitario <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newSparePart.unitPrice}
                      onChange={(e) => setNewSparePart({ ...newSparePart, unitPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Mínimo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newSparePart.minStock}
                      onChange={(e) => setNewSparePart({ ...newSparePart, minStock: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Máximo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newSparePart.maxStock}
                      onChange={(e) => setNewSparePart({ ...newSparePart, maxStock: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación (opcional)
                    </label>
                    <input
                      type="text"
                      value={newSparePart.location}
                      onChange={(e) => setNewSparePart({ ...newSparePart, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Ej: Estante A1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción (opcional)
                    </label>
                    <textarea
                      value={newSparePart.description}
                      onChange={(e) => setNewSparePart({ ...newSparePart, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={2}
                      placeholder="Descripción del repuesto"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? 'Creando...' : 'Crear Repuesto'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Información del repuesto seleccionado */}
            {selectedPart && !showCreateForm && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Código:</span>
                    <div className="font-medium text-gray-900">{selectedPart.code}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Categoría:</span>
                    <div className="font-medium text-gray-900">{selectedPart.category}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Stock Actual:</span>
                    <div className="font-medium text-gray-900">{selectedPart.currentStock}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Precio Actual:</span>
                    <div className="font-medium text-gray-900">
                      ${typeof (selectedPart as any).unitPrice === 'number' 
                        ? (selectedPart as any).unitPrice.toLocaleString('es-CL') 
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cantidad recibida */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad Recibida <span className="text-red-500">*</span>
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Ingresa la cantidad recibida"
              />
            </div>

            {/* Precio unitario (opcional) */}
            <div>
              <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Precio Unitario (opcional)
              </label>
              <input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dejar vacío para mantener precio actual"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si se ingresa un precio, se actualizará el precio unitario del repuesto
              </p>
            </div>

            {/* Referencia */}
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                Referencia (Factura/Orden de Compra) (opcional)
              </label>
              <input
                id="reference"
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: FACT-2025-001 o OC-2025-001"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link
                to="/inventory"
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !selectedSparePartId}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}

