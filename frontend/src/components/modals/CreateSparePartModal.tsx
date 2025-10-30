import { useState, useEffect } from 'react'
import { sparePartService, CreateSparePartData } from '../../services/sparePartService'
import { useAuthStore } from '../../store/authStore'

interface CreateSparePartModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateSparePartModal({ isOpen, onClose, onSuccess }: CreateSparePartModalProps) {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateSparePartData>({
    code: '',
    name: '',
    description: '',
    category: '',
    unitOfMeasure: 'unidad',
    unitPrice: 0,
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    location: '',
    workshopId: (user as any)?.workshopId || ''
  })

  const categories = [
    'Motor',
    'Frenos',
    'Suspensión',
    'Transmisión',
    'Eléctrico',
    'Carrocería',
    'Neumáticos',
    'Aceites y Lubricantes',
    'Filtros',
    'Batería',
    'Otros'
  ]

  const unitOfMeasures = [
    'unidad',
    'pieza',
    'litro',
    'kilogramo',
    'metro',
    'rollo',
    'galón'
  ]

  useEffect(() => {
    if (isOpen) {
      // Resetear el formulario al abrir
      setFormData({
        code: '',
        name: '',
        description: '',
        category: '',
        unitOfMeasure: 'unidad',
        unitPrice: 0,
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        location: '',
        workshopId: (user as any)?.workshopId || ''
      })
      setError(null)
    }
  }, [isOpen, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validación
    if (!formData.code || !formData.name || !formData.category) {
      setError('Por favor completa los campos obligatorios (Código, Nombre, Categoría)')
      return
    }

    if (!formData.workshopId) {
      setError('No se pudo identificar el taller')
      return
    }

    try {
      setLoading(true)
      await sparePartService.create(formData)
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error creando repuesto:', err)
      setError(err.response?.data?.message || err.message || 'Error al crear el repuesto')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Agregar Nuevo Repuesto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Código <span className="text-red-500">*</span>
              </label>
              <input
                id="code"
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="REP-001"
                required
              />
            </div>

            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre del repuesto"
                required
              />
            </div>

            {/* Categoría */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Unidad de Medida */}
            <div>
              <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-gray-700 mb-2">
                Unidad de Medida
              </label>
              <select
                id="unitOfMeasure"
                value={formData.unitOfMeasure}
                onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {unitOfMeasures.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            {/* Precio Unitario */}
            <div>
              <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Precio Unitario ($)
              </label>
              <input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Ubicación */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Estante A, Fila 3"
              />
            </div>

            {/* Stock Actual */}
            <div>
              <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700 mb-2">
                Stock Actual
              </label>
              <input
                id="currentStock"
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            {/* Stock Mínimo */}
            <div>
              <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 mb-2">
                Stock Mínimo
              </label>
              <input
                id="minStock"
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            {/* Stock Máximo */}
            <div>
              <label htmlFor="maxStock" className="block text-sm font-medium text-gray-700 mb-2">
                Stock Máximo
              </label>
              <input
                id="maxStock"
                type="number"
                min="0"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción detallada del repuesto..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Repuesto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}



