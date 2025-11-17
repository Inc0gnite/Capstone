import { useState, useEffect } from 'react'
import { sparePartService, SparePart } from '../../services/sparePartService'

interface RequestSparePartsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  workOrderId: string
  workOrderNumber: string
}

interface SelectedSparePart {
  sparePartId: string
  quantity: number
  name: string
  currentStock: number
}

export function RequestSparePartsModal({
  isOpen,
  onClose,
  onSuccess,
  workOrderId,
  workOrderNumber
}: RequestSparePartsModalProps) {
  const [spareParts, setSpareParts] = useState<SparePart[]>([])
  const [selectedParts, setSelectedParts] = useState<SelectedSparePart[]>([])
  const [observations, setObservations] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingParts, setLoadingParts] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadSpareParts()
      // Resetear estado al abrir
      setSelectedParts([])
      setObservations('')
      setSearchTerm('')
      setError(null)
    }
  }, [isOpen])

  const loadSpareParts = async () => {
    try {
      setLoadingParts(true)
      setError(null)
      const response = await sparePartService.getAll({
        page: 1,
        limit: 100,
        search: searchTerm || undefined
      })
      setSpareParts(response.data || [])
    } catch (err: any) {
      console.error('Error cargando repuestos:', err)
      setError(err.response?.data?.error || 'Error cargando repuestos disponibles')
    } finally {
      setLoadingParts(false)
    }
  }

  useEffect(() => {
    if (isOpen && searchTerm !== undefined) {
      const timeoutId = setTimeout(() => {
        loadSpareParts()
      }, 500) // Debounce de 500ms
      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm, isOpen])

  const handleAddSparePart = (sparePart: SparePart) => {
    // Verificar si ya está en la lista
    if (selectedParts.find(p => p.sparePartId === sparePart.id)) {
      return
    }

    // Verificar stock disponible
    if (sparePart.currentStock <= 0) {
      setError(`El repuesto "${sparePart.name}" no tiene stock disponible`)
      return
    }

    setSelectedParts([
      ...selectedParts,
      {
        sparePartId: sparePart.id,
        quantity: 1,
        name: sparePart.name,
        currentStock: sparePart.currentStock
      }
    ])
    setError(null)
  }

  const handleRemoveSparePart = (sparePartId: string) => {
    setSelectedParts(selectedParts.filter(p => p.sparePartId !== sparePartId))
  }

  const handleQuantityChange = (sparePartId: string, quantity: number) => {
    const part = selectedParts.find(p => p.sparePartId === sparePartId)
    if (!part) return

    // Validar que no exceda el stock disponible
    if (quantity > part.currentStock) {
      setError(`La cantidad no puede ser mayor al stock disponible (${part.currentStock})`)
      return
    }

    if (quantity < 1) {
      setError('La cantidad debe ser al menos 1')
      return
    }

    setSelectedParts(
      selectedParts.map(p =>
        p.sparePartId === sparePartId ? { ...p, quantity } : p
      )
    )
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedParts.length === 0) {
      setError('Por favor selecciona al menos un repuesto')
      return
    }

    // Validar cantidades
    for (const part of selectedParts) {
      if (part.quantity < 1) {
        setError(`La cantidad para "${part.name}" debe ser al menos 1`)
        return
      }
      if (part.quantity > part.currentStock) {
        setError(`La cantidad para "${part.name}" excede el stock disponible`)
        return
      }
    }

    try {
      setLoading(true)
      setError(null)

      if (selectedParts.length === 1) {
        // Solicitar un solo repuesto
        await sparePartService.requestForWorkOrder(
          workOrderId,
          selectedParts[0].sparePartId,
          selectedParts[0].quantity,
          observations.trim() || undefined
        )
      } else {
        // Solicitar múltiples repuestos
        await sparePartService.requestMultipleForWorkOrder(
          workOrderId,
          selectedParts.map(p => ({
            sparePartId: p.sparePartId,
            quantity: p.quantity
          })),
          observations.trim() || undefined
        )
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error solicitando repuestos:', err)
      setError(err.response?.data?.error || err.message || 'Error al solicitar repuestos')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const availableParts = spareParts.filter(p => p.currentStock > 0)
  const filteredParts = availableParts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Solicitar Repuestos</h3>
            <p className="text-sm text-gray-600 mt-1">Orden: {workOrderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Búsqueda de Repuestos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Repuesto
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o código..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || loadingParts}
              />
            </div>

            {/* Lista de Repuestos Disponibles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repuestos Disponibles
              </label>
              {loadingParts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Cargando repuestos...</p>
                </div>
              ) : filteredParts.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No hay repuestos disponibles</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredParts.map((part) => {
                    const isSelected = selectedParts.find(p => p.sparePartId === part.id)
                    return (
                      <div
                        key={part.id}
                        className={`p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 ${
                          isSelected ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{part.name}</span>
                              <span className="text-xs text-gray-500">({part.code})</span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <span>Stock: {part.currentStock}</span>
                              <span>•</span>
                              <span>{part.category}</span>
                            </div>
                          </div>
                          {!isSelected ? (
                            <button
                              type="button"
                              onClick={() => handleAddSparePart(part)}
                              className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                              disabled={loading || part.currentStock <= 0}
                            >
                              Agregar
                            </button>
                          ) : (
                            <span className="ml-4 px-3 py-1 bg-green-100 text-green-700 text-sm rounded">
                              ✓ Agregado
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Repuestos Seleccionados */}
            {selectedParts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repuestos Seleccionados ({selectedParts.length})
                </label>
                <div className="space-y-2 border border-gray-200 rounded-lg p-4">
                  {selectedParts.map((part) => (
                    <div
                      key={part.sparePartId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{part.name}</p>
                        <p className="text-xs text-gray-600">Stock disponible: {part.currentStock}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-700">Cantidad:</label>
                          <input
                            type="number"
                            min="1"
                            max={part.currentStock}
                            value={part.quantity}
                            onChange={(e) =>
                              handleQuantityChange(part.sparePartId, parseInt(e.target.value) || 1)
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                            disabled={loading}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSparePart(part.sparePartId)}
                          className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
                          disabled={loading}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones (opcional)
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Agregar notas sobre la solicitud..."
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || selectedParts.length === 0}
              >
                {loading ? 'Solicitando...' : 'Solicitar Repuestos'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

