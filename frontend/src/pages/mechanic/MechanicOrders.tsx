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
  
  // Filtros para la tabla de repuestos
  const [searchParts, setSearchParts] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [lowStockOnly, setLowStockOnly] = useState(false)
  
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
      if (!showRequestModal) return
      
      try {
        setLoadingSpareParts(true)
        setError(null)
        
        // NO filtrar por workshopId - el mecánico debe ver TODOS los repuestos disponibles
        // Usar la misma lógica que MechanicSpareParts.tsx para cargar los datos
        const params: any = { 
          page: 1, 
          limit: 100 // El backend tiene un límite máximo de 100
        }
        
        // No filtrar por taller - mostrar todos los repuestos del sistema
        
        const response: any = await sparePartService.getAll(params)
        
        // El backend devuelve según sendPaginated: { data: [...], page, limit, total, totalPages }
        // sparePartService.getAll devuelve response.data del axios, que es el objeto paginado
        // Entonces response = { data: [...], page: 1, limit: 100, total: X, totalPages: Y }
        const items: SparePart[] = response?.data ?? response?.items ?? (Array.isArray(response) ? response : [])
        
        console.log('🔍 Respuesta completa del backend:', response)
        console.log('🔍 Tipo de response:', typeof response)
        console.log('🔍 Es array?', Array.isArray(response))
        console.log('🔍 Keys de response:', response ? Object.keys(response) : 'null')
        console.log('🔍 Items extraídos:', items.length)
        console.log('🔍 Total según backend:', response?.total)
        console.log('🔍 Repuestos cargados:', items)
        
        if (items.length === 0 && response?.total > 0) {
          // Si no hay items pero hay total, puede que la estructura sea diferente
          console.warn('⚠️ No se encontraron items pero hay total:', response.total)
          console.warn('⚠️ Estructura de respuesta:', Object.keys(response))
          // Intentar acceder directamente a la respuesta si es un array
          if (Array.isArray(response)) {
            console.log('✅ La respuesta es un array directo, usando:', response.length, 'items')
            setSpareParts(response)
            // Extraer categorías únicas
            const uniqueCategories = Array.from(new Set(response.map((p: SparePart) => p.category))).sort()
            setCategories(uniqueCategories)
            return
          }
        }
        
        if (items.length === 0 && (!response?.total || response?.total === 0)) {
          console.info('ℹ️ No hay repuestos registrados en el sistema')
        }
        
        console.log('✅ Estableciendo', items.length, 'repuestos en el estado')
        setSpareParts(items)
        
        // Extraer categorías únicas de los repuestos cargados
        const uniqueCategories = Array.from(new Set(items.map((p: SparePart) => p.category))).sort()
        setCategories(uniqueCategories)
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
        setSpareParts([])
        setCategories([])
      } finally {
        setLoadingSpareParts(false)
      }
    }

    loadSpareParts()
  }, [showRequestModal, user])

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
    setSearchParts('')
    setCategoryFilter('')
    setLowStockOnly(false)
  }

  const handleCloseRequestModal = () => {
    setShowRequestModal(false)
    setSelectedOrder(null)
    setRequestedItems([])
    setObservations('')
    setSearchParts('')
    setCategoryFilter('')
    setLowStockOnly(false)
  }

  // Filtrar repuestos para la tabla
  const filteredSpareParts = spareParts.filter(part => {
    // Filtrar por búsqueda
    const matchesSearch = !searchParts.trim() || 
      part.name.toLowerCase().includes(searchParts.toLowerCase()) ||
      part.code.toLowerCase().includes(searchParts.toLowerCase()) ||
      part.category.toLowerCase().includes(searchParts.toLowerCase())
    
    // Filtrar por categoría
    const matchesCategory = !categoryFilter || part.category === categoryFilter
    
    // Filtrar por stock bajo
    const matchesStock = !lowStockOnly || part.currentStock <= part.minStock
    
    // Excluir repuestos ya agregados
    const notAlreadyAdded = !requestedItems.some(ri => ri.sparePartId === part.id)
    
    return matchesSearch && matchesCategory && matchesStock && notAlreadyAdded
  })

  // Filtrar repuestos para mostrar solo los que tienen stock (opcional: mostrar todos pero deshabilitar los sin stock)
  const displayParts = filteredSpareParts // Mostramos todos, pero deshabilitamos los sin stock

  const handleAddFromTable = (sparePartId: string) => {
    const part = spareParts.find(p => p.id === sparePartId)
    if (!part) return
    
    // Verificar si ya está agregado
    if (requestedItems.some(ri => ri.sparePartId === sparePartId)) {
      setError('Este repuesto ya está agregado a la solicitud')
      setTimeout(() => setError(null), 3000)
      return
    }
    
    // Validar que el repuesto tenga stock disponible
    if (part.currentStock <= 0) {
      setError(`No se puede solicitar ${part.name} porque no tiene stock disponible`)
      setTimeout(() => setError(null), 3000)
      return
    }
    
    // Agregar con cantidad inicial de 1
    setRequestedItems([...requestedItems, { sparePartId, quantity: 1 }])
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
              {/* Header del Modal */}
              <div className="flex justify-between items-center p-6 border-b">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Solicitar Repuestos</h3>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Orden:</span> {selectedOrder.orderNumber} | 
                    <span className="font-medium ml-1">Vehículo:</span> {selectedOrder.vehicle?.licensePlate || 'N/A'}
                  </div>
                </div>
                <button
                  onClick={handleCloseRequestModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {loadingSpareParts ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando repuestos...</p>
                  </div>
                ) : (
                  <>
                    {/* Filtros de búsqueda */}
                    <div className="mb-4 bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            placeholder="Buscar por nombre, código o categoría..."
                            value={searchParts}
                            onChange={(e) => setSearchParts(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                          >
                            <option value="">Todas las categorías</option>
                            {categories.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            id="lowStockFilter"
                            type="checkbox"
                            checked={lowStockOnly}
                            onChange={(e) => setLowStockOnly(e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label htmlFor="lowStockFilter" className="text-sm text-gray-700">Solo stock bajo</label>
                        </div>
                      </div>
                    </div>

                    {/* Lista de Repuestos en formato de tarjetas */}
                    <div className="mb-6">
                      {filteredSpareParts.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                          <div className="text-gray-400 text-6xl mb-4">🔧</div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {spareParts.length === 0 
                              ? 'No hay repuestos disponibles' 
                              : 'No se encontraron repuestos con los filtros aplicados'}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            {spareParts.length === 0
                              ? 'No hay repuestos registrados en el sistema'
                              : 'Intenta ajustar los filtros de búsqueda'}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {displayParts.map((part) => {
                            const isLow = part.currentStock <= part.minStock
                            const out = part.currentStock === 0
                            const stockStatus = out 
                              ? { text: 'Sin Stock', color: 'bg-red-100 text-red-800' }
                              : isLow 
                              ? { text: 'Stock Bajo', color: 'bg-yellow-100 text-yellow-800' }
                              : { text: 'Disponible', color: 'bg-green-100 text-green-800' }
                            const stockColor = out 
                              ? 'text-red-600'
                              : isLow 
                              ? 'text-yellow-600'
                              : 'text-green-600'
                            
                            const isOutOfStock = part.currentStock === 0
                            
                            return (
                              <div key={part.id} className={`rounded-lg shadow p-4 hover:shadow-md transition-shadow border ${
                                isOutOfStock 
                                  ? 'bg-red-50 border-2 border-red-200' 
                                  : 'bg-white border-gray-200'
                              }`}>
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <h3 className={`text-base font-semibold mb-1 ${
                                      isOutOfStock ? 'text-red-900' : 'text-gray-900'
                                    }`}>
                                      {part.name}
                                    </h3>
                                    <p className="text-xs text-gray-600 mb-1">
                                      Código: {part.code}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Categoría: {part.category}
                                    </p>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                    {stockStatus.text}
                                  </span>
                                </div>
                                
                                <div className="space-y-1.5 text-xs mb-3">
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
                                  <div className="mb-3 pt-2 border-t border-gray-200">
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                      {part.description}
                                    </p>
                                  </div>
                                )}
                                
                                <div className="pt-2 border-t border-gray-200">
                                  {part.currentStock > 0 ? (
                                    <button
                                      onClick={() => handleAddFromTable(part.id)}
                                      className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                      + Agregar
                                    </button>
                                  ) : (
                                    <button
                                      disabled
                                      className="w-full px-3 py-2 rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed text-sm font-medium"
                                    >
                                      Sin Stock
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Lista de repuestos seleccionados */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Repuestos Seleccionados <span className="text-red-500">*</span> ({requestedItems.length})
                        </label>
                      </div>

                      {requestedItems.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <p className="text-gray-500 text-sm">No hay repuestos seleccionados</p>
                          <p className="text-gray-400 text-xs mt-1">Usa la tabla superior para agregar repuestos</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {requestedItems.map((item, index) => {
                            const selectedPart = spareParts.find(p => p.id === item.sparePartId)
                            const availableStock = selectedPart?.currentStock || 0
                            const isStockExceeded = item.quantity > availableStock

                            return (
                              <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                          {selectedPart?.name || 'Repuesto no encontrado'}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          {selectedPart?.code || 'N/A'} - {selectedPart?.category || 'N/A'}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs text-gray-500">Stock disponible:</p>
                                        <p className={`text-sm font-medium ${
                                          availableStock === 0 ? 'text-red-600' : 
                                          availableStock <= (selectedPart?.minStock || 0) ? 'text-yellow-600' : 
                                          'text-green-600'
                                        }`}>
                                          {availableStock} unidades
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Cantidad <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="number"
                                        min="1"
                                        max={availableStock}
                                        value={item.quantity}
                                        onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                        className={`w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                                          isStockExceeded ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                      />
                                    </div>
                                    <button
                                      onClick={() => handleRemoveItem(index)}
                                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium mt-6"
                                      title="Eliminar repuesto"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                                {isStockExceeded && (
                                  <p className="text-xs text-red-600 font-medium mt-2">
                                    ⚠️ Cantidad excede el stock disponible ({availableStock} unidades)
                                  </p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Observaciones */}
                    <div className="mb-4">
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
                  </>
                )}
              </div>

              {/* Footer del Modal con botones */}
              <div className="border-t p-6 bg-gray-50">
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
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
