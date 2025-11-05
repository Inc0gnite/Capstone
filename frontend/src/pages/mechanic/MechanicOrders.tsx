import { MainLayout } from '../../components/Layout/MainLayout'
import { useAuthStore } from '../../store/authStore'
import { workOrderService, WorkOrder } from '../../services/workOrderService'
import { sparePartService, SparePart } from '../../services/sparePartService'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function MechanicOrders() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
  
  // Estados para solicitud de repuestos
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [spareParts, setSpareParts] = useState<SparePart[]>([])
  const [loadingSpareParts, setLoadingSpareParts] = useState(false)
  const [requestedItems, setRequestedItems] = useState<Array<{ sparePartId: string; quantity: number }>>([])
  const [observations, setObservations] = useState<string>('')
  const [submittingRequest, setSubmittingRequest] = useState(false)
  
  // Verificar si hay una orden en progreso
  const hasOrderInProgress = orders.some(order => order.currentStatus === 'en_progreso')

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.id) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Obtener todas las órdenes asignadas al mecánico
        const response = await workOrderService.getAll({
          assignedToId: user.id,
          page: 1,
          limit: 100
        })
        
        // Ordenar órdenes por prioridad (urgente > alta > normal > baja) y luego por fecha
        const priorityOrder: Record<string, number> = { urgente: 0, alta: 1, normal: 2, baja: 3 }
        const sortedOrders = (response.data || []).sort((a, b) => {
          const priorityDiff = (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
          if (priorityDiff !== 0) {
            return priorityDiff
          }
          // Si tienen la misma prioridad, ordenar por fecha ascendente (más nuevas primero)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        
        setOrders(sortedOrders)
      } catch (err: any) {
        console.error('Error cargando órdenes:', err)
        setError('Error al cargar las órdenes')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [user?.id])

  // Cargar repuestos cuando se abre el modal
  useEffect(() => {
    const loadSpareParts = async () => {
      if (!showRequestModal || !user?.workshopId) return
      
      try {
        setLoadingSpareParts(true)
        const response = await sparePartService.getAll({
          page: 1,
          limit: 100,
          workshopId: (user as any).workshopId
        })
        setSpareParts(response.data || [])
      } catch (err: any) {
        console.error('Error cargando repuestos:', err)
        setError('Error al cargar los repuestos')
      } finally {
        setLoadingSpareParts(false)
      }
    }

    loadSpareParts()
  }, [showRequestModal, user?.workshopId])

  const filteredOrders = orders.filter(order => {
    switch (filter) {
      case 'pending':
        return order.currentStatus === 'pendiente'
      case 'in_progress':
        return order.currentStatus === 'en_progreso'
      case 'completed':
        return order.currentStatus === 'completado'
      default:
        return true
    }
  })
  
  // Asegurar que las órdenes filtradas también estén ordenadas
  const priorityOrder: Record<string, number> = { urgente: 0, alta: 1, normal: 2, baja: 3 }
  const sortedFilteredOrders = filteredOrders.sort((a, b) => {
    const priorityDiff = (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
    if (priorityDiff !== 0) {
      return priorityDiff
    }
    // Ordenar por fecha ascendente (más nuevas primero)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      console.log('🔄 Cambiando estado de orden:', { orderId, newStatus })
      
      const result = await workOrderService.changeStatus(orderId, newStatus)
      console.log('✅ Estado cambiado exitosamente:', result)
      
      // Actualizar la orden en el estado local
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, currentStatus: newStatus }
            : order
        )
      )
      
      // Emitir evento para actualización en tiempo real
      window.dispatchEvent(new CustomEvent('work-order-status-changed', {
        detail: { orderId, newStatus }
      }))
      
    } catch (err: any) {
      console.error('❌ Error cambiando estado:', err)
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Error cambiando estado'
      setError(errorMessage)
      
      // Mostrar error temporalmente
      setTimeout(() => setError(null), 5000)
      
      alert(`Error: ${errorMessage}`)
    }
  }

  const handleOpenRequestModal = (order: WorkOrder) => {
    setSelectedOrder(order)
    setShowRequestModal(true)
    setRequestedItems([])
    setObservations('')
  }

  const handleCloseRequestModal = () => {
    setShowRequestModal(false)
    setSelectedOrder(null)
    setRequestedItems([])
    setObservations('')
  }

  const handleAddItem = () => {
    setRequestedItems([...requestedItems, { sparePartId: '', quantity: 1 }])
  }

  const handleRemoveItem = (index: number) => {
    setRequestedItems(requestedItems.filter((_, i) => i !== index))
  }

  const handleUpdateItem = (index: number, field: 'sparePartId' | 'quantity', value: string | number) => {
    const updated = [...requestedItems]
    updated[index] = { ...updated[index], [field]: value }
    setRequestedItems(updated)
  }

  const validateItems = () => {
    for (let i = 0; i < requestedItems.length; i++) {
      const item = requestedItems[i]
      if (!item.sparePartId) {
        setError(`El repuesto en la línea ${i + 1} es requerido`)
        return false
      }
      if (!item.quantity || item.quantity <= 0) {
        setError(`La cantidad en la línea ${i + 1} debe ser mayor a 0`)
        return false
      }
      
      const sparePart = spareParts.find(p => p.id === item.sparePartId)
      if (sparePart && item.quantity > sparePart.currentStock) {
        setError(`Stock insuficiente para ${sparePart.name}. Disponible: ${sparePart.currentStock}, Solicitado: ${item.quantity}`)
        return false
      }
    }
    return true
  }

  const handleSubmitRequest = async () => {
    if (!selectedOrder) {
      setError('No se ha seleccionado una orden')
      setTimeout(() => setError(null), 5000)
      return
    }

    if (requestedItems.length === 0) {
      setError('Debe agregar al menos un repuesto')
      setTimeout(() => setError(null), 5000)
      return
    }

    if (!validateItems()) {
      setTimeout(() => setError(null), 5000)
      return
    }

    try {
      setSubmittingRequest(true)
      setError(null)

      await sparePartService.requestMultipleForWorkOrder(
        selectedOrder.id,
        requestedItems,
        observations || undefined
      )

      alert(`${requestedItems.length} repuesto(s) solicitado(s) exitosamente`)
      handleCloseRequestModal()
      
      // Recargar órdenes y repuestos para ver actualizaciones
      const [ordersResponse, sparePartsResponse] = await Promise.all([
        workOrderService.getAll({
          assignedToId: user?.id,
          page: 1,
          limit: 100
        }),
        sparePartService.getAll({
          page: 1,
          limit: 100,
          workshopId: (user as any).workshopId
        })
      ])
      
      const priorityOrder: Record<string, number> = { urgente: 0, alta: 1, normal: 2, baja: 3 }
      const sortedOrders = (ordersResponse.data || []).sort((a, b) => {
        const priorityDiff = (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
        if (priorityDiff !== 0) return priorityDiff
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      setOrders(sortedOrders)
      setSpareParts(sparePartsResponse.data || [])
    } catch (err: any) {
      console.error('Error solicitando repuestos:', err)
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Error al solicitar repuestos'
      setError(errorMessage)
      setTimeout(() => setError(null), 5000)
    } finally {
      setSubmittingRequest(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800'
      case 'completado':
        return 'bg-green-100 text-green-800'
      case 'pausado':
        return 'bg-orange-100 text-orange-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-100 text-red-800'
      case 'alta':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      case 'baja':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'Pendiente'
      case 'en_progreso':
        return 'En Progreso'
      case 'completado':
        return 'Completado'
      case 'pausado':
        return 'Pausado'
      case 'cancelado':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return 'Urgente'
      case 'alta':
        return 'Alta'
      case 'normal':
        return 'Normal'
      case 'baja':
        return 'Baja'
      default:
        return priority
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando órdenes...</p>
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
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mis Órdenes de Trabajo</h2>
            <p className="text-gray-600">Gestiona las órdenes asignadas a ti</p>
          </div>
          <div className="text-sm text-gray-500">
            Total: {orders.length} órdenes
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendientes ({orders.filter(o => o.currentStatus === 'pendiente').length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'in_progress'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En Progreso ({orders.filter(o => o.currentStatus === 'en_progreso').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completadas ({orders.filter(o => o.currentStatus === 'completado').length})
            </button>
          </div>
        </div>

        {/* Lista de Órdenes */}
        <div className="space-y-4">
          {sortedFilteredOrders.length > 0 ? (
            sortedFilteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.orderNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.currentStatus)}`}>
                        {getStatusText(order.currentStatus)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(order.priority)}`}>
                        {getPriorityText(order.priority)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><span className="font-medium">Vehículo:</span> {order.vehicle?.licensePlate || 'N/A'}</p>
                        <p><span className="font-medium">Tipo:</span> {order.vehicle?.vehicleType || 'N/A'}</p>
                        <p><span className="font-medium">Marca:</span> {order.vehicle?.brand || 'N/A'}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Tipo de Trabajo:</span> {order.workType}</p>
                        <p><span className="font-medium">Horas Estimadas:</span> {order.estimatedHours || 'N/A'}</p>
                        <p><span className="font-medium">Horas Reales:</span> {order.totalHours || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {order.description && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Descripción:</span> {order.description}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-3 text-xs text-gray-500">
                      <p>Creada: {new Date(order.createdAt).toLocaleDateString('es-CL')}</p>
                      {order.startedAt && (
                        <p>Iniciada: {new Date(order.startedAt).toLocaleDateString('es-CL')}</p>
                      )}
                      {order.completedAt && (
                        <p>Completada: {new Date(order.completedAt).toLocaleDateString('es-CL')}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Link
                      to={`/work-orders/${order.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm text-center"
                    >
                      Ver Detalles
                    </Link>
                    {order.currentStatus === 'pendiente' && (
                      <button 
                        onClick={() => handleStatusChange(order.id, 'en_progreso')}
                        disabled={hasOrderInProgress}
                        className={`px-4 py-2 font-medium text-sm rounded-lg ${
                          hasOrderInProgress
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        title={hasOrderInProgress ? 'Ya tienes una orden en progreso' : ''}
                      >
                        {hasOrderInProgress ? '⚠️ No disponible' : 'Iniciar Trabajo'}
                      </button>
                    )}
                    {order.currentStatus === 'en_progreso' && (
                      <button 
                        onClick={() => handleStatusChange(order.id, 'pausado')}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm"
                      >
                        Pausar
                      </button>
                    )}
                    {order.currentStatus === 'pausado' && (
                      <button 
                        onClick={() => handleStatusChange(order.id, 'en_progreso')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                      >
                        ▶️ Reanudar
                      </button>
                    )}
                    {(order.currentStatus === 'en_progreso' || order.currentStatus === 'pausado') && (
                      <>
                        <button 
                          onClick={() => handleOpenRequestModal(order)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm"
                        >
                          🔧 Solicitar Repuesto
                        </button>
                        <button 
                          onClick={() => handleStatusChange(order.id, 'completado')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                        >
                          ✅ Completar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay órdenes {filter === 'all' ? '' : `con estado ${filter}`}
              </h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'No tienes órdenes de trabajo asignadas'
                  : `No tienes órdenes con estado ${filter}`
                }
              </p>
            </div>
          )}
        </div>

        {/* Modal para solicitar repuestos */}
        {showRequestModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Solicitar Repuestos</h3>
                <button
                  onClick={handleCloseRequestModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Orden:</span> {selectedOrder.orderNumber}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Vehículo:</span> {selectedOrder.vehicle?.licensePlate || 'N/A'}
                </p>
              </div>

              {loadingSpareParts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando repuestos...</p>
                </div>
              ) : (
                <>
                  {/* Lista de repuestos a solicitar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Repuestos a Solicitar <span className="text-red-500">*</span>
                      </label>
                      <button
                        onClick={handleAddItem}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium"
                      >
                        + Agregar Repuesto
                      </button>
                    </div>

                    {requestedItems.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 text-sm">No hay repuestos agregados</p>
                        <p className="text-gray-400 text-xs mt-1">Haz clic en "Agregar Repuesto" para comenzar</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {requestedItems.map((item, index) => {
                          const selectedPart = spareParts.find(p => p.id === item.sparePartId)
                          const availableStock = selectedPart?.currentStock || 0
                          const isStockExceeded = item.quantity > availableStock
                          const availableParts = spareParts.filter(part => 
                            part.currentStock > 0 && 
                            !requestedItems.some((ri, riIndex) => riIndex !== index && ri.sparePartId === part.id)
                          )

                          return (
                            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex items-start gap-3">
                                <div className="flex-1 space-y-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Repuesto {index + 1} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                      value={item.sparePartId}
                                      onChange={(e) => handleUpdateItem(index, 'sparePartId', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    >
                                      <option value="">Selecciona un repuesto</option>
                                      {availableParts.map(part => (
                                        <option key={part.id} value={part.id}>
                                          {part.name} ({part.code}) - Stock: {part.currentStock}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Cantidad <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        min="1"
                                        max={availableStock}
                                        value={item.quantity}
                                        onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                                          isStockExceeded ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                      />
                                      <button
                                        onClick={() => handleRemoveItem(index)}
                                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                                        title="Eliminar repuesto"
                                      >
                                        ×
                                      </button>
                                    </div>
                                    {selectedPart && (
                                      <p className={`text-xs mt-1 ${
                                        isStockExceeded ? 'text-red-600 font-medium' : 'text-gray-500'
                                      }`}>
                                        Stock disponible: {availableStock} unidades
                                        {isStockExceeded && ` (Solicitado: ${item.quantity})`}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {spareParts.filter(part => part.currentStock > 0).length === 0 && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          ⚠️ No hay repuestos con stock disponible en este momento
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observaciones (opcional)
                    </label>
                    <textarea
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      rows={3}
                      placeholder="Observaciones adicionales sobre la solicitud..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={handleCloseRequestModal}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                      disabled={submittingRequest}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmitRequest}
                      disabled={submittingRequest || requestedItems.length === 0}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                        submittingRequest || requestedItems.length === 0
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {submittingRequest ? 'Enviando...' : `Solicitar ${requestedItems.length} repuesto(s)`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
