import { useState, useEffect } from 'react'
import { sparePartService } from '../../services/sparePartService'
import type { SparePartMovement } from '../../../../shared/types'

interface ViewMovementsModalProps {
  isOpen: boolean
  onClose: () => void
  sparePart: {
    id: string
    name: string
    code: string
  }
}

export function ViewMovementsModal({
  isOpen,
  onClose,
  sparePart
}: ViewMovementsModalProps) {
  const [movements, setMovements] = useState<SparePartMovement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filtros
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [movementType, setMovementType] = useState<'entrada' | 'salida' | 'ajuste' | ''>('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  const loadMovements = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        page,
        limit
      }
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo
      if (movementType) params.movementType = movementType

      const response = await sparePartService.getMovements(sparePart.id, params)
      setMovements(response.data || [])
      setTotal(response.total || 0)
    } catch (err: any) {
      console.error('Error cargando movimientos:', err)
      setError(err.response?.data?.error || 'Error cargando movimientos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadMovements()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, page])

  const handleFilter = () => {
    setPage(1)
  }

  const handleClearFilters = () => {
    setDateFrom('')
    setDateTo('')
    setMovementType('')
    setPage(1)
  }

  // Auto-filtrar cuando cambian los filtros (con un pequeño delay)
  useEffect(() => {
    if (!isOpen) return
    
    const timeoutId = setTimeout(() => {
      setPage(1)
      loadMovements()
    }, 300)
    
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, movementType])

  const getMovementTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      entrada: 'Entrada',
      salida: 'Salida',
      ajuste: 'Ajuste'
    }
    return labels[type] || type
  }

  const getMovementTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      entrada: 'text-green-600 bg-green-50',
      salida: 'text-red-600 bg-red-50',
      ajuste: 'text-blue-600 bg-blue-50'
    }
    return colors[type] || 'text-gray-600 bg-gray-50'
  }

  const getMovementTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      entrada: '➕',
      salida: '➖',
      ajuste: '🔧'
    }
    return icons[type] || '📋'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPages = Math.ceil(total / limit)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Movimientos de Inventario</h3>
            <p className="text-sm text-gray-600">
              {sparePart.name} ({sparePart.code})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Filtros */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Movimiento
              </label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Todos</option>
                <option value="entrada">Ingreso</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando movimientos...</p>
              </div>
            </div>
          ) : movements.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 text-lg">No se encontraron movimientos</p>
                <p className="text-gray-400 text-sm mt-2">
                  {dateFrom || dateTo || movementType
                    ? 'Intenta ajustar los filtros'
                    : 'Este repuesto aún no tiene movimientos registrados'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Mostrando {movements.length} de {total} movimientos
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock Anterior
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock Nuevo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Motivo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referencia
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {movements.map((movement) => (
                      <tr key={movement.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {formatDate(movement.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMovementTypeColor(
                              movement.movementType
                            )}`}
                          >
                            <span className="mr-1">{getMovementTypeIcon(movement.movementType)}</span>
                            {getMovementTypeLabel(movement.movementType)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          {movement.movementType === 'salida' ? '-' : '+'}
                          {Math.abs(movement.quantity)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {movement.previousStock}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          {movement.newStock}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {movement.reason}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {movement.reference || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Página {page} de {totalPages}
                  </div>
                  <div className="space-x-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={`px-3 py-1 rounded border ${
                        page <= 1
                          ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Anterior
                    </button>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className={`px-3 py-1 rounded border ${
                        page >= totalPages
                          ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

