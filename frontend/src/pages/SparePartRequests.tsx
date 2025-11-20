import { useState, useEffect } from 'react'
import { MainLayout } from '../components/Layout/MainLayout'
import { sparePartService } from '../services/sparePartService'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'

interface SparePartRequest {
  id: string
  workOrderId: string
  sparePartId: string
  quantityRequested: number
  quantityDelivered?: number
  status: string
  requestedAt: string
  deliveredAt?: string
  observations?: string
  sparePart: {
    id: string
    name: string
    code: string
    category: string
    currentStock: number
    minStock: number
  }
  workOrder: {
    id: string
    orderNumber: string
    vehicle: {
      licensePlate: string
    }
    assignedTo: {
      id: string
      firstName: string
      lastName: string
    } | null
  }
}

export default function SparePartRequests() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending')
  const [requests, setRequests] = useState<SparePartRequest[]>([])
  const [historyRequests, setHistoryRequests] = useState<SparePartRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<string>('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [historyPage, setHistoryPage] = useState(1)
  const [historyTotalPages, setHistoryTotalPages] = useState(1)

  const workshopId = (user as any)?.workshopId

  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingRequests()
    } else {
      loadHistoryRequests()
    }
  }, [workshopId, activeTab])

  const loadPendingRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await sparePartService.getPendingRequests(workshopId)
      setRequests(data || [])
    } catch (err: any) {
      console.error('Error cargando solicitudes pendientes:', err)
      setError(err.response?.data?.message || 'Error cargando solicitudes pendientes')
    } finally {
      setLoading(false)
    }
  }

  const loadHistoryRequests = async (page = 1) => {
    try {
      setLoadingHistory(true)
      setError(null)
      const result = await sparePartService.getAllRequests({
        workshopId,
        page,
        limit: 50,
      })
      setHistoryRequests(result.requests || [])
      setHistoryPage(result.page || 1)
      setHistoryTotalPages(result.totalPages || 1)
    } catch (err: any) {
      console.error('Error cargando historial:', err)
      setError(err.response?.data?.message || 'Error cargando historial de solicitudes')
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      setProcessingId(requestId)
      await sparePartService.approveRequest(requestId)
      await loadPendingRequests()
      // Si estamos viendo el historial, también actualizarlo
      if (activeTab === 'history') {
        await loadHistoryRequests(historyPage)
      }
    } catch (err: any) {
      console.error('Error aprobando solicitud:', err)
      alert(err.response?.data?.message || 'Error al aprobar la solicitud')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    if (!rejectReason.trim()) {
      alert('Por favor, ingresa un motivo para rechazar la solicitud')
      return
    }

    try {
      setProcessingId(requestId)
      await sparePartService.rejectRequest(requestId, rejectReason)
      setRejectReason('')
      setRejectingId(null)
      await loadPendingRequests()
      // Si estamos viendo el historial, también actualizarlo
      if (activeTab === 'history') {
        await loadHistoryRequests(historyPage)
      }
    } catch (err: any) {
      console.error('Error rechazando solicitud:', err)
      alert(err.response?.data?.message || 'Error al rechazar la solicitud')
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStockStatus = (current: number, min: number) => {
    if (current === 0) return { label: 'Sin stock', color: 'text-red-600 bg-red-100' }
    if (current <= min) return { label: 'Stock bajo', color: 'text-orange-600 bg-orange-100' }
    return { label: 'Disponible', color: 'text-green-600 bg-green-100' }
  }

  const getRequestStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bgColor: string }> = {
      solicitado: { label: 'Solicitado', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
      entregado: { label: 'Entregado', color: 'text-green-800', bgColor: 'bg-green-100' },
      usado: { label: 'Usado', color: 'text-blue-800', bgColor: 'bg-blue-100' },
      sobrante: { label: 'Sobrante', color: 'text-purple-800', bgColor: 'bg-purple-100' },
      rechazado: { label: 'Rechazado', color: 'text-red-800', bgColor: 'bg-red-100' },
      cancelado: { label: 'Cancelado', color: 'text-gray-800', bgColor: 'bg-gray-100' },
    }
    return configs[status] || { label: status, color: 'text-gray-800', bgColor: 'bg-gray-100' }
  }

  const renderRequestCard = (request: SparePartRequest, showActions: boolean = false) => {
    const stockStatus = getStockStatus(
      request.sparePart.currentStock,
      request.sparePart.minStock
    )
    const statusConfig = getRequestStatusConfig(request.status)
    const mechanicName = request.workOrder.assignedTo
      ? `${request.workOrder.assignedTo.firstName} ${request.workOrder.assignedTo.lastName}`
      : 'Sin asignar'

    return (
      <div
        key={request.id}
        className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {request.sparePart.name}
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {request.sparePart.code}
              </span>
              <span className={`text-xs px-2 py-1 rounded font-medium ${stockStatus.color}`}>
                {stockStatus.label}
              </span>
              <span className={`text-xs px-2 py-1 rounded font-medium ${statusConfig.color} ${statusConfig.bgColor}`}>
                {statusConfig.label}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Cantidad:</span>{' '}
                <span className="text-gray-900">{request.quantityRequested}</span>
                {request.quantityDelivered && (
                  <span className="text-gray-500"> / {request.quantityDelivered} entregada</span>
                )}
              </div>
              <div>
                <span className="font-medium">Stock disponible:</span>{' '}
                <span className="text-gray-900">{request.sparePart.currentStock}</span>
              </div>
              <div>
                <span className="font-medium">Orden:</span>{' '}
                <Link
                  to={`/work-orders/${request.workOrderId}`}
                  className="text-blue-600 hover:underline"
                >
                  {request.workOrder.orderNumber}
                </Link>
              </div>
              <div>
                <span className="font-medium">Vehículo:</span>{' '}
                <span className="text-gray-900">{request.workOrder.vehicle.licensePlate}</span>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium">Mecánico:</span>{' '}
              <span className="text-gray-900">{mechanicName}</span>
              <span className="mx-2">•</span>
              <span className="font-medium">Solicitado:</span>{' '}
              <span className="text-gray-900">{formatDate(request.requestedAt)}</span>
              {request.deliveredAt && (
                <>
                  <span className="mx-2">•</span>
                  <span className="font-medium">Entregado:</span>{' '}
                  <span className="text-gray-900">{formatDate(request.deliveredAt)}</span>
                </>
              )}
            </div>
            {request.observations && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Observaciones:</span> {request.observations}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Acciones solo para solicitudes pendientes */}
        {showActions && request.status === 'solicitado' && (
          rejectingId === request.id ? (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del rechazo:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Ingresa el motivo del rechazo..."
              />
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => handleReject(request.id)}
                  disabled={processingId === request.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId === request.id ? 'Rechazando...' : 'Confirmar Rechazo'}
                </button>
                <button
                  onClick={() => {
                    setRejectingId(null)
                    setRejectReason('')
                  }}
                  disabled={processingId === request.id}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleApprove(request.id)}
                disabled={processingId === request.id || request.sparePart.currentStock < request.quantityRequested}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  request.sparePart.currentStock < request.quantityRequested
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={
                  request.sparePart.currentStock < request.quantityRequested
                    ? 'Stock insuficiente'
                    : 'Aprobar solicitud'
                }
              >
                {processingId === request.id ? 'Procesando...' : '✅ Aprobar'}
              </button>
              <button
                onClick={() => setRejectingId(request.id)}
                disabled={processingId === request.id}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ❌ Rechazar
              </button>
              <Link
                to={`/work-orders/${request.workOrderId}`}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-center"
              >
                👁️ Ver Orden
              </Link>
            </div>
          )
        )}

        {/* Solo botón ver orden para historial */}
        {!showActions && (
          <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200">
            <Link
              to={`/work-orders/${request.workOrderId}`}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-center"
            >
              👁️ Ver Orden
            </Link>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  const currentRequests = activeTab === 'pending' ? requests : historyRequests
  const isLoading = activeTab === 'pending' ? loading : loadingHistory

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Repuestos</h1>
            <p className="text-gray-600 mt-1">
              {activeTab === 'pending' 
                ? 'Gestiona las solicitudes pendientes de aprobación'
                : 'Historial completo de solicitudes de repuestos'}
            </p>
          </div>
          <button
            onClick={() => activeTab === 'pending' ? loadPendingRequests() : loadHistoryRequests(historyPage)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            🔄 Actualizar
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pendientes
              {requests.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs">
                  {requests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Historial
            </button>
          </nav>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Contenido según tab activo */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : currentRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'pending' 
                ? 'No hay solicitudes pendientes'
                : 'No hay solicitudes en el historial'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'pending'
                ? 'Todas las solicitudes de repuestos han sido procesadas'
                : 'No se encontraron solicitudes de repuestos'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentRequests.map((request) => renderRequestCard(request, activeTab === 'pending'))}
            </div>
            
            {/* Paginación para historial */}
            {activeTab === 'history' && historyTotalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <button
                  onClick={() => loadHistoryRequests(historyPage - 1)}
                  disabled={historyPage === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Página {historyPage} de {historyTotalPages}
                </span>
                <button
                  onClick={() => loadHistoryRequests(historyPage + 1)}
                  disabled={historyPage >= historyTotalPages}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}

