import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MainLayout } from '../components/Layout/MainLayout'
import { workOrderService, WorkOrder } from '../services/workOrderService'
import { AssignMechanicModal } from '../components/modals/AssignMechanicModal'
import { ExchangeMechanicModal } from '../components/modals/ExchangeMechanicModal'
import { MechanicInfoDropdown } from '../components/mechanic/MechanicInfoDropdown'
import { WorkOrderChecklist } from '../components/WorkOrderChecklist'
import { WordService } from '../services/wordService'
import { useAuthStore } from '../store/authStore'

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusReason, setStatusReason] = useState('')
  const [showAssignMechanicModal, setShowAssignMechanicModal] = useState(false)
  const [showExchangeMechanicModal, setShowExchangeMechanicModal] = useState(false)
  const [checklistCompleted, setChecklistCompleted] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    if (id) {
      loadWorkOrder()
    }
  }, [id])

  const loadWorkOrder = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Cargando orden de trabajo:', id)
      const order = await workOrderService.getById(id)
      console.log('✅ Orden cargada:', order)
      setWorkOrder(order)
    } catch (err: any) {
      console.error('❌ Error cargando orden de trabajo:', err)
      console.error('❌ Error response:', err.response)
      
      // Mostrar mensaje de error más específico
      const errorMessage = err.message || err.response?.data?.message || 'Error cargando orden de trabajo'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignMechanic = () => {
    setShowAssignMechanicModal(true)
  }

  const handleMechanicAssigned = () => {
    setShowAssignMechanicModal(false)
    setShowExchangeMechanicModal(false)
    loadWorkOrder() // Recargar la orden para mostrar el mecánico asignado
  }

  const handleChecklistChange = useCallback((_items: any[], allCompleted: boolean) => {
    setChecklistCompleted(allCompleted)
  }, [])

  const handleExchangeMechanic = () => {
    setShowExchangeMechanicModal(true)
  }

  const handleExportWord = async () => {
    if (workOrder) {
      await WordService.generateWorkOrderWord(workOrder)
    }
  }

  // Función para calcular el progreso basado en el estado de la orden
  const getProgressFromStatus = (status: string): number => {
    switch (status) {
      case 'pendiente':
        return 0
      case 'en_progreso':
        return 50
      case 'pausado':
        return 25
      case 'completado':
        return 100
      default:
        return 0
    }
  }

  // Función para obtener el color de la barra de progreso según el estado
  const getProgressColor = (status: string): string => {
    switch (status) {
      case 'pendiente':
        return 'bg-gray-400'
      case 'en_progreso':
        return 'bg-gradient-to-r from-blue-500 to-blue-600'
      case 'pausado':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500'
      case 'completado':
        return 'bg-gradient-to-r from-green-500 to-green-600'
      default:
        return 'bg-gray-400'
    }
  }

  // Función para verificar si el usuario puede realizar acciones de gestión
  const canManageOrders = () => {
    const roleName = (user as any)?.role?.name
    return roleName === 'Administrador' || roleName === 'Recepcionista' || roleName === 'Jefe de Taller'
  }

  // Función para obtener el workshopId para asignación de mecánico
  // Los admins pueden usar el workshopId de la orden si no tienen uno propio
  const getWorkshopIdForAssignment = () => {
    const userWorkshopId = (user as any)?.workshopId
    const roleName = (user as any)?.role?.name
    
    // Si el usuario es Admin, puede usar el workshopId de la orden
    if (roleName === 'Administrador' && workOrder?.workshopId) {
      return workOrder.workshopId
    }
    
    // Para otros roles, usar su propio workshopId
    return userWorkshopId
  }

  const handleStatusChange = async (newStatus: string, reason?: string) => {
    if (!workOrder) return

    // Validar que todas las tareas estén completadas antes de completar la orden
    if (newStatus === 'completado' && !checklistCompleted) {
      setError('No se puede completar la orden hasta que todas las tareas estén marcadas como completadas.')
      return
    }

    try {
      setError(null)
      console.log('🔄 Cambiando estado de orden:', {
        orderId: workOrder.id,
        newStatus,
        reason,
        workOrder: workOrder
      })
      
      const result = await workOrderService.changeStatus(workOrder.id, newStatus, reason)
      console.log('✅ Estado cambiado exitosamente:', result)
      
      // Si el estado cambió a completado, actualizar progreso al 100%
      if (newStatus === 'completado') {
        try {
          await workOrderService.update(workOrder.id, { progress: 100 })
          console.log('✅ Progreso actualizado al 100%')
        } catch (progressError) {
          console.warn('⚠️ No se pudo actualizar el progreso:', progressError)
        }
      }
      
      await loadWorkOrder()
      setShowStatusModal(false)
      setStatusReason('')
      
      // Emitir evento para actualización en tiempo real
      window.dispatchEvent(new CustomEvent('work-order-status-changed', {
        detail: { orderId: workOrder.id, newStatus, reason }
      }))
      
      // Emitir evento específico si se completó
      if (newStatus === 'completado') {
        window.dispatchEvent(new CustomEvent('work-order-completed', {
          detail: { orderId: workOrder.id }
        }))
      }
    } catch (err: any) {
      console.error('❌ Error cambiando estado:', err)
      console.error('❌ Error response:', err.response)
      console.error('❌ Error data:', err.response?.data)
      
      // Manejo específico para error de mecánico no asignado
      // El backend puede devolver 'error' o 'message'
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Error cambiando estado'
      
      if (errorMessage.includes('mecánico asignado') || errorMessage.includes('sin mecánico')) {
        setError('⚠️ No se puede iniciar la orden sin un mecánico asignado. Por favor, asigna un mecánico antes de iniciar.')
      } else {
        setError(errorMessage)
      }
      
      // No cerrar el modal si hay error
      // setShowStatusModal(false)
    }
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
      pendiente: { label: 'Pendiente', color: 'text-gray-800', bgColor: 'bg-gray-100', icon: '⏳' },
      en_progreso: { label: 'En Progreso', color: 'text-blue-800', bgColor: 'bg-blue-100', icon: '🔨' },
      pausado: { label: 'Pausado', color: 'text-orange-800', bgColor: 'bg-orange-100', icon: '⏸️' },
      completado: { label: 'Completado', color: 'text-green-800', bgColor: 'bg-green-100', icon: '✅' },
      cancelado: { label: 'Cancelado', color: 'text-red-800', bgColor: 'bg-red-100', icon: '❌' }
    }
    return configs[status] || configs.pendiente
  }

  const getPriorityConfig = (priority: string) => {
    const configs: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
      baja: { label: 'Baja', color: 'text-gray-800', bgColor: 'bg-gray-100', icon: '🟢' },
      normal: { label: 'Normal', color: 'text-blue-800', bgColor: 'bg-blue-100', icon: '🔵' },
      alta: { label: 'Alta', color: 'text-orange-800', bgColor: 'bg-orange-100', icon: '🟠' },
      urgente: { label: 'Urgente', color: 'text-red-800', bgColor: 'bg-red-100', icon: '🔴' }
    }
    return configs[priority] || configs.normal
  }

  const getWorkTypeConfig = (workType: string) => {
    const configs: Record<string, { label: string; icon: string }> = {
      mantenimiento: { label: 'Mantenimiento', icon: '🔧' },
      reparacion: { label: 'Reparación', icon: '🛠️' },
      revision: { label: 'Revisión', icon: '🔍' },
      otro: { label: 'Otro', icon: '📋' }
    }
    return configs[workType] || configs.otro
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando orden de trabajo...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !workOrder) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Orden de trabajo no encontrada'}</p>
          <button
            onClick={() => navigate('/work-orders')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Volver a Órdenes
          </button>
        </div>
      </MainLayout>
    )
  }

  const statusConfig = getStatusConfig(workOrder.currentStatus)
  const priorityConfig = getPriorityConfig(workOrder.priority)
  const workTypeConfig = getWorkTypeConfig(workOrder.workType)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header con navegación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/work-orders')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Volver
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{workOrder.orderNumber}</h1>
              <p className="text-gray-600">Detalle de orden de trabajo</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
              <span className="mr-2">{statusConfig.icon}</span>
              {statusConfig.label}
            </span>
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Cambiar Estado
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Información Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Información de la Orden */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Principal */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Información General</h3>
                  <p className="text-gray-600">Detalles principales de la orden de trabajo</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Creado</div>
                  <div className="font-medium">{formatDateShort(workOrder.createdAt)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Trabajo</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{workTypeConfig.icon}</span>
                      <span className="text-gray-900 capitalize">{workTypeConfig.label}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{priorityConfig.icon}</span>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${priorityConfig.bgColor} ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Progreso</label>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(workOrder.currentStatus)}`}
                          style={{ width: `${getProgressFromStatus(workOrder.currentStatus)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 min-w-[3rem]">{getProgressFromStatus(workOrder.currentStatus)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {workOrder.estimatedHours && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Horas Estimadas</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">⏱️</span>
                        <span className="text-gray-900 font-medium">{workOrder.estimatedHours}h</span>
                      </div>
                    </div>
                  )}
                  
                  {workOrder.totalHours && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Horas Totales</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">⏰</span>
                        <span className="text-gray-900 font-medium">{workOrder.totalHours}h</span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Última Actualización</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🔄</span>
                      <span className="text-gray-900">{formatDate(workOrder.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción del Trabajo</label>
                <WorkOrderChecklist
                  description={workOrder.description}
                  onChecklistChange={handleChecklistChange}
                  disabled={workOrder.currentStatus === 'pendiente' || workOrder.currentStatus === 'completado' || workOrder.currentStatus === 'cancelado'}
                />
              </div>
            </div>

            {/* Información del Vehículo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🚗</span>
                Información del Vehículo
              </h3>
              
              {workOrder.vehicle && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Patente</label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <span className="text-blue-900 font-bold text-xl">{workOrder.vehicle.licensePlate}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marca y Modelo</label>
                      <p className="text-gray-900 font-medium">{workOrder.vehicle.brand} {workOrder.vehicle.model}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                      <p className="text-gray-900 font-medium">{workOrder.vehicle.year}</p>
                    </div>
                    
                    {workOrder.entry && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Conductor</label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="font-medium text-gray-900">{workOrder.entry.driverName}</p>
                          <p className="text-sm text-gray-600">RUT: {workOrder.entry.driverRut}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {workOrder.entry && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">📋</span>
                    Información del Ingreso
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Código:</span>
                      <span className="ml-2 text-gray-900 font-mono">{workOrder.entry.entryCode}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Fecha de Ingreso:</span>
                      <span className="ml-2 text-gray-900">{formatDate(workOrder.entry.entryDate)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mecánico Asignado */}
            {workOrder.assignedTo && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="mr-2">👷</span>
                    Mecánico Asignado
                  </h3>
                  
                  <MechanicInfoDropdown mechanic={workOrder.assignedTo}>
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors">
                      👨‍🔧 Ver Mecánico
                    </button>
                  </MechanicInfoDropdown>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xl">
                      {workOrder.assignedTo.firstName.charAt(0)}{workOrder.assignedTo.lastName.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-lg">
                      {workOrder.assignedTo.firstName} {workOrder.assignedTo.lastName}
                    </p>
                    <p className="text-gray-600">{workOrder.assignedTo.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Fotos del Proceso */}
            {workOrder.photos && workOrder.photos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📸</span>
                  Fotos del Proceso ({workOrder.photos.length})
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {workOrder.photos.map((photo, index) => (
                    <div key={photo.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <img
                        src={photo.url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-3">
                        {photo.description && (
                          <p className="text-sm text-gray-700 mb-2">{photo.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {formatDate(photo.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estado y Acciones */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado Actual</h3>
              
              <div className="text-center mb-6">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium ${statusConfig.bgColor} ${statusConfig.color} mb-2`}>
                  <span className="mr-2 text-2xl">{statusConfig.icon}</span>
                  {statusConfig.label}
                </div>
              </div>

              <div className="space-y-3">
                {workOrder.currentStatus === 'pendiente' && (
                  <button
                    onClick={() => handleStatusChange('en_progreso')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    ▶️ Iniciar Trabajo
                  </button>
                )}
                
                {workOrder.currentStatus === 'en_progreso' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('pausado')}
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
                    >
                      ⏸️ Pausar
                    </button>
                    <button
                      onClick={() => handleStatusChange('completado')}
                      disabled={!checklistCompleted}
                      className={`w-full px-4 py-2 font-medium transition-colors ${
                        checklistCompleted
                          ? 'bg-green-600 text-white rounded-lg hover:bg-green-700'
                          : 'bg-gray-400 text-gray-200 rounded-lg cursor-not-allowed'
                      }`}
                    >
                      {checklistCompleted ? '✅ Completar' : '⏳ Completar (Faltan tareas)'}
                    </button>
                  </>
                )}
                
                {workOrder.currentStatus === 'pausado' && (
                  <button
                    onClick={() => handleStatusChange('en_progreso')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    ▶️ Reanudar
                  </button>
                )}
              </div>
            </div>

            {/* Fechas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cronología</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📅</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Creado</p>
                    <p className="text-xs text-gray-600">{formatDate(workOrder.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm">🔄</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Última Actualización</p>
                    <p className="text-xs text-gray-600">{formatDate(workOrder.updatedAt)}</p>
                  </div>
                </div>
                
                {workOrder.completedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">✅</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Completado</p>
                      <p className="text-xs text-gray-600">{formatDate(workOrder.completedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones Rápidas - Solo para roles de gestión */}
            {canManageOrders() && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                
                <div className="space-y-3">
                  {/* Botón de asignar mecánico - solo para órdenes pendientes */}
                  {workOrder.currentStatus === 'pendiente' && !workOrder.assignedTo && getWorkshopIdForAssignment() && (
                    <button
                      onClick={handleAssignMechanic}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>👨‍🔧</span>
                      <span>Asignar Mecánico</span>
                    </button>
                  )}

                  {/* Botones para mecánicos asignados */}
                  {workOrder.assignedTo && getWorkshopIdForAssignment() && (
                    <>

                      {/* Reasignar Mecánico */}
                      <button
                        onClick={handleAssignMechanic}
                        className="w-full px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <span>🔄</span>
                        <span>Reasignar</span>
                      </button>

                      {/* Intercambiar Mecánico */}
                      <button
                        onClick={handleExchangeMechanic}
                        className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <span>🔄</span>
                        <span>Intercambiar</span>
                      </button>
                    </>
                  )}

                  
                  {/* Botón de exportación - solo para órdenes completadas */}
                  {workOrder.currentStatus === 'completado' ? (
                    <button
                      onClick={handleExportWord}
                      className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>📝</span>
                      <span>Exportar Documento</span>
                    </button>
                  ) : (
                    <div className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-lg font-medium flex items-center justify-center space-x-2 cursor-not-allowed">
                      <span>📝</span>
                      <span>Exportar Documento (Solo para órdenes completadas)</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de cambio de estado */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Estado</h3>
            
            {/* Mensaje de error si existe */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nuevo Estado</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar estado</option>
                  <option value="pendiente">Pendiente</option>
                  <option 
                    value="en_progreso"
                    disabled={!workOrder.assignedTo}
                  >
                    En Progreso {!workOrder.assignedTo ? '(Requiere mecánico asignado)' : ''}
                  </option>
                  <option value="pausado">Pausado</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
                {!workOrder.assignedTo && (
                  <p className="mt-2 text-sm text-red-600">
                    ⚠️ No se puede iniciar una orden sin mecánico asignado. Por favor, asigna un mecánico primero.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Motivo (opcional)</label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe el motivo del cambio de estado..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setError(null)
                  setStatusReason('')
                  setNewStatus('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleStatusChange(newStatus, statusReason)}
                disabled={!newStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cambiar Estado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de asignación de mecánico */}
      {workOrder && canManageOrders() && getWorkshopIdForAssignment() && (
        <AssignMechanicModal
          isOpen={showAssignMechanicModal}
          onClose={() => setShowAssignMechanicModal(false)}
          onSuccess={handleMechanicAssigned}
          workOrderId={workOrder.id}
          workOrderNumber={workOrder.orderNumber}
          vehiclePlate={workOrder.vehicle?.licensePlate || 'N/A'}
          workshopId={getWorkshopIdForAssignment() || ''}
          currentMechanic={workOrder.assignedTo ? {
            id: workOrder.assignedTo.id,
            name: `${workOrder.assignedTo.firstName} ${workOrder.assignedTo.lastName}`
          } : undefined}
        />
      )}

      {/* Modal de intercambio de mecánicos */}
      {workOrder && canManageOrders() && getWorkshopIdForAssignment() && workOrder.assignedTo && (
        <ExchangeMechanicModal
          isOpen={showExchangeMechanicModal}
          onClose={() => setShowExchangeMechanicModal(false)}
          onSuccess={handleMechanicAssigned}
          workOrderId={workOrder.id}
          currentMechanicId={workOrder.assignedTo.id}
          workshopId={getWorkshopIdForAssignment() || ''}
        />
      )}
    </MainLayout>
  )
}