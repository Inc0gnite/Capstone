import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MainLayout } from '../components/Layout/MainLayout'
import { workOrderService, WorkOrder } from '../services/workOrderService'
import { AssignMechanicModal } from '../components/modals/AssignMechanicModal'
import { ExchangeMechanicModal } from '../components/modals/ExchangeMechanicModal'
import { RequestSparePartsModal } from '../components/modals/RequestSparePartsModal'
import { MechanicInfoDropdown } from '../components/mechanic/MechanicInfoDropdown'
import { WorkOrderChecklist } from '../components/WorkOrderChecklist'
import { WorkOrderTimer } from '../components/WorkOrderTimer'
import { WordService } from '../services/wordService'
import { sparePartService } from '../services/sparePartService'
import { useAuthStore } from '../store/authStore'
import { CameraCapture } from '../components/photo/CameraCapture'
import photoService, { VehicleEntryPhoto } from '../services/photoService'
import { DocumentUpload } from '../components/DocumentUpload'

type DisplayPhoto = {
  id: string
  url: string
  description?: string
  uploadedAt?: string
  source: 'entry' | 'process'
  photoType?: string
}

const PHOTO_TYPE_LABELS: Record<string, string> = {
  before: 'Antes',
  damage: 'Daños',
  interior: 'Interior',
  exterior: 'Exterior',
  during: 'Proceso',
  after: 'Después',
  general: 'General',
}

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
  const [showRequestSparePartsModal, setShowRequestSparePartsModal] = useState(false)
  const [checklistCompleted, setChecklistCompleted] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [entryPhotos, setEntryPhotos] = useState<VehicleEntryPhoto[]>([])
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
      console.log('📅 Fechas de la orden:', {
        createdAt: order.createdAt,
        startedAt: order.startedAt,
        updatedAt: order.updatedAt,
        completedAt: order.completedAt
      })
      console.log('⏸️ Pausas de la orden:', order.pauses)
      setWorkOrder(order)

      if (order.entryId) {
        try {
          const photos = await photoService.getEntryPhotos(order.entryId)
          setEntryPhotos(photos)
        } catch (photoError) {
          console.error('❌ Error cargando fotos de ingreso:', photoError)
          setEntryPhotos([])
        }
      } else {
        setEntryPhotos([])
      }
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

  const handlePhotoTaken = async (photoDataUrl: string) => {
    if (!workOrder) return

    try {
      setUploadingPhoto(true)
      // Por ahora usamos la DataURL directamente
      // En producción, aquí subirías la foto a Cloudinary u otro servicio
      await workOrderService.addPhoto(workOrder.id, photoDataUrl, 'Foto del proceso', 'during')
      
      // Recargar la orden para mostrar la nueva foto
      await loadWorkOrder()
      setShowCamera(false)
    } catch (err: any) {
      console.error('Error guardando foto:', err)
      alert('Error al guardar la foto: ' + (err.message || 'Error desconocido'))
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleExchangeMechanic = () => {
    setShowExchangeMechanicModal(true)
  }

  const handleExportWord = async () => {
    if (workOrder) {
      await WordService.generateWorkOrderWord(workOrder)
    }
  }


  // Función para verificar si el usuario puede realizar acciones de gestión
  const canManageOrders = () => {
    const roleName = (user as any)?.role?.name
    // Jefe de Taller solo puede ver detalles, no gestionar
    return roleName === 'Administrador' || roleName === 'Recepcionista'
  }

  // Función para verificar si el usuario es mecánico
  const isMechanic = () => {
    const roleName = (user as any)?.role?.name
    return roleName === 'Mecánico'
  }

  // Función para verificar si el mecánico es el asignado a esta orden
  const isAssignedMechanic = () => {
    if (!isMechanic() || !workOrder || !workOrder.assignedTo) return false
    return workOrder.assignedTo.id === (user as any)?.id
  }

  // Función para verificar si el usuario puede solicitar repuestos
  const canRequestSpareParts = () => {
    const roleName = (user as any)?.role?.name
    // Mecánicos y roles de gestión pueden solicitar repuestos
    return roleName === 'Mecánico' || canManageOrders()
  }

  // Función para verificar si la orden permite solicitar repuestos
  const canRequestSparePartsForOrder = () => {
    if (!workOrder) return false
    // Solo se pueden solicitar repuestos para órdenes en progreso o pendientes
    return workOrder.currentStatus === 'en_progreso' || workOrder.currentStatus === 'pendiente'
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No disponible'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Fecha inválida'
      return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch (error) {
      return 'Fecha inválida'
    }
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

  const guardPhotos: DisplayPhoto[] = entryPhotos.map((photo) => ({
    id: photo.id,
    url: photo.url,
    description:
      photo.description ||
      `Foto de ingreso (${PHOTO_TYPE_LABELS[photo.photoType] || photo.photoType})`,
    uploadedAt: photo.uploadedAt,
    source: 'entry',
    photoType: photo.photoType,
  }))

  const processPhotos: DisplayPhoto[] = (workOrder.photos || []).map((photo) => ({
    id: photo.id,
    url: photo.url,
    description:
      photo.description ||
      (photo.photoType
        ? `Foto del proceso (${PHOTO_TYPE_LABELS[photo.photoType] || photo.photoType})`
        : 'Foto del proceso'),
    uploadedAt: photo.uploadedAt,
    source: 'process',
    photoType: photo.photoType,
  }))

  const allPhotos: DisplayPhoto[] = [...guardPhotos, ...processPhotos].sort((a, b) => {
    const dateA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0
    const dateB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0
    return dateB - dateA
  })

  const hasPhotos = allPhotos.length > 0

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header con navegación */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => navigate('/work-orders')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Volver"
              >
                <span className="hidden sm:inline">←</span>
                <span className="sm:hidden">← Volver</span>
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">{workOrder.orderNumber}</h1>
                <p className="text-sm sm:text-base text-gray-600">Detalle de orden de trabajo</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <span className={`inline-flex items-center justify-center px-3 py-2 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                <span className="mr-2">{statusConfig.icon}</span>
                {statusConfig.label}
              </span>
              {/* Botón para roles de gestión (Admin/Recepcionista) */}
              {canManageOrders() && (
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
                >
                  Cambiar Estado
                </button>
              )}
              {/* Botones simplificados para mecánicos */}
              {isMechanic() && isAssignedMechanic() && (
                <div className="flex gap-2">
                  {workOrder.currentStatus === 'pendiente' && (
                    <button
                      onClick={() => handleStatusChange('en_progreso')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
                    >
                      ▶️ Comenzar
                    </button>
                  )}
                  {workOrder.currentStatus === 'en_progreso' && (
                    <>
                      <button
                        onClick={() => handleStatusChange('pausado')}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
                      >
                        ⏸️ Pausar
                      </button>
                      <button
                        onClick={() => handleStatusChange('completado')}
                        disabled={!checklistCompleted}
                        className={`px-4 py-2 font-medium transition-colors text-sm sm:text-base whitespace-nowrap rounded-lg ${
                          checklistCompleted
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        }`}
                      >
                        {checklistCompleted ? '✅ Finalizar' : '⏳ Finalizar (Faltan tareas)'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <p className="text-sm sm:text-base text-red-600">{error}</p>
          </div>
        )}

        {/* Información Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Información de la Orden - Columna Principal */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Cronómetro de Tiempo de Trabajo */}
            {workOrder.startedAt && (
              <WorkOrderTimer
                startedAt={workOrder.startedAt}
                completedAt={workOrder.completedAt}
                currentStatus={workOrder.currentStatus}
                pauses={workOrder.pauses}
              />
            )}
            {/* Card Principal - Información General */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Información General</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Detalles principales de la orden de trabajo</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xs sm:text-sm text-gray-500">Creado</div>
                  <div className="text-sm sm:text-base font-medium text-gray-900">{formatDateShort(workOrder.createdAt)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">Tipo de Trabajo</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-base sm:text-lg">{workTypeConfig.icon}</span>
                      <span className="text-sm sm:text-base text-gray-900 font-medium capitalize">{workTypeConfig.label}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">Prioridad</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-base sm:text-lg">{priorityConfig.icon}</span>
                      <span className={`px-2.5 py-1 rounded text-xs sm:text-sm font-medium ${priorityConfig.bgColor} ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  {workOrder.estimatedHours && (
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">Horas Estimadas</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-base sm:text-lg">⏱️</span>
                        <span className="text-sm sm:text-base text-gray-900 font-medium">{workOrder.estimatedHours}h</span>
                      </div>
                    </div>
                  )}
                  
                  {workOrder.totalHours && (
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">Horas Totales</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-base sm:text-lg">⏰</span>
                        <span className="text-sm sm:text-base text-gray-900 font-medium">{workOrder.totalHours}h</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">Última Actualización</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-base sm:text-lg">🔄</span>
                      <span className="text-xs sm:text-sm text-gray-900">{formatDate(workOrder.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">Descripción del Trabajo</label>
                <WorkOrderChecklist
                  description={workOrder.description}
                  onChecklistChange={handleChecklistChange}
                  disabled={workOrder.currentStatus === 'pendiente' || workOrder.currentStatus === 'completado' || workOrder.currentStatus === 'cancelado' || workOrder.currentStatus === 'pausado'}
                  workOrderId={workOrder.id}
                  workOrderStatus={workOrder.currentStatus}
                />
              </div>
            </div>

            {/* Información del Vehículo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center pb-3 sm:pb-4 border-b border-gray-200">
                <span className="mr-2 text-lg sm:text-xl">🚗</span>
                Información del Vehículo
              </h3>
              
              {workOrder.vehicle && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                      <label className="block text-xs sm:text-sm font-medium text-blue-700 mb-1.5 sm:mb-2">Patente</label>
                      <span className="text-blue-900 font-bold text-lg sm:text-xl">{workOrder.vehicle.licensePlate}</span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">Marca y Modelo</label>
                      <p className="text-sm sm:text-base text-gray-900 font-medium">{workOrder.vehicle.brand} {workOrder.vehicle.model}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">Año</label>
                      <p className="text-sm sm:text-base text-gray-900 font-medium">{workOrder.vehicle.year}</p>
                    </div>
                    
                    {workOrder.entry && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                        <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">Conductor</label>
                        <p className="text-sm sm:text-base font-medium text-gray-900 mb-1">{workOrder.entry.driverName}</p>
                        <p className="text-xs sm:text-sm text-gray-600">RUT: {workOrder.entry.driverRut}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {workOrder.entry && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="mr-2">📋</span>
                    Información del Ingreso
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <span className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Código</span>
                      <span className="text-sm sm:text-base text-gray-900 font-mono font-medium">{workOrder.entry.entryCode}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <span className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Fecha de Ingreso</span>
                      <span className="text-xs sm:text-sm text-gray-900">{formatDate(workOrder.entry.entryDate)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mecánico Asignado */}
            {workOrder.assignedTo && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                    <span className="mr-2 text-lg sm:text-xl">👷</span>
                    Mecánico Asignado
                  </h3>
                  
                  <MechanicInfoDropdown mechanic={workOrder.assignedTo}>
                    <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs sm:text-sm hover:bg-green-200 transition-colors font-medium">
                      👨‍🔧 Ver Mecánico
                    </button>
                  </MechanicInfoDropdown>
                </div>
                
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-base sm:text-xl">
                      {workOrder.assignedTo.firstName.charAt(0)}{workOrder.assignedTo.lastName.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                      {workOrder.assignedTo.firstName} {workOrder.assignedTo.lastName}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{workOrder.assignedTo.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Repuestos Solicitados */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center pb-3 sm:pb-4 border-b border-gray-200">
                <span className="mr-2 text-lg sm:text-xl">📦</span>
                Repuestos Solicitados
                {workOrder.spareParts && workOrder.spareParts.length > 0 && (
                  <span className="ml-2 text-xs sm:text-sm font-normal text-gray-500">({workOrder.spareParts.length})</span>
                )}
              </h3>
              
              {workOrder.spareParts && workOrder.spareParts.length > 0 ? (
                <div className="space-y-3">
                  {workOrder.spareParts.map((sparePartRequest) => {
                    const getStatusConfig = (status: string) => {
                      const configs: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
                        solicitado: { label: 'Solicitado', color: 'text-yellow-800', bgColor: 'bg-yellow-100', icon: '⏳' },
                        usado: { label: 'Usado', color: 'text-blue-800', bgColor: 'bg-blue-100', icon: '✅' },
                        sobrante: { label: 'Sobrante', color: 'text-purple-800', bgColor: 'bg-purple-100', icon: '🔄' },
                        // Mantener compatibilidad con estados antiguos
                        entregado: { label: 'Entregado', color: 'text-green-800', bgColor: 'bg-green-100', icon: '✅' },
                        cancelado: { label: 'Cancelado', color: 'text-red-800', bgColor: 'bg-red-100', icon: '❌' },
                      }
                      return configs[status] || { label: status, color: 'text-gray-800', bgColor: 'bg-gray-100', icon: '📋' }
                    }
                    
                    const statusConfig = getStatusConfig(sparePartRequest.status)
                    const isUsed = sparePartRequest.status === 'usado'
                    const isSurplus = sparePartRequest.status === 'sobrante'
                    const isDelivered = sparePartRequest.status === 'entregado' // Compatibilidad con estado antiguo
                    
                    return (
                      <div
                        key={sparePartRequest.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{sparePartRequest.sparePart.name}</h4>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {sparePartRequest.sparePart.code}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Categoría: {sparePartRequest.sparePart.category}</span>
                              <span>•</span>
                              <span>Stock disponible: {sparePartRequest.sparePart.currentStock}</span>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                            <span className="mr-1">{statusConfig.icon}</span>
                            {statusConfig.label}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-200">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad Solicitada</label>
                            <p className="text-sm font-semibold text-gray-900">{sparePartRequest.quantityRequested}</p>
                          </div>
                          {(isDelivered || isUsed || isSurplus) && sparePartRequest.quantityDelivered !== undefined && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad Entregada</label>
                              <p className={`text-sm font-semibold ${isUsed ? 'text-blue-600' : isSurplus ? 'text-purple-600' : 'text-green-600'}`}>
                                {sparePartRequest.quantityDelivered}
                              </p>
                            </div>
                          )}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de Solicitud</label>
                            <p className="text-sm text-gray-900">{formatDate(sparePartRequest.requestedAt)}</p>
                          </div>
                          {(isDelivered || isUsed || isSurplus) && sparePartRequest.deliveredAt && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                {isUsed ? 'Fecha de Uso' : isSurplus ? 'Fecha de Entrega' : 'Fecha de Entrega'}
                              </label>
                              <p className="text-sm text-gray-900">{formatDate(sparePartRequest.deliveredAt)}</p>
                            </div>
                          )}
                        </div>
                        
                        {isSurplus && (
                          <div className="mt-3 pt-3 border-t border-purple-200 bg-purple-50 rounded-lg p-3">
                            <p className="text-sm text-purple-700 font-medium">
                              🔄 Este repuesto puede ser devuelto al inventario
                            </p>
                          </div>
                        )}
                        
                        {sparePartRequest.observations && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Observaciones</label>
                            <p className="text-sm text-gray-700">{sparePartRequest.observations}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-2">No hay repuestos solicitados para esta orden</p>
                  {canRequestSpareParts() && canRequestSparePartsForOrder() && (
                    <button
                      onClick={() => setShowRequestSparePartsModal(true)}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
                    >
                      📦 Solicitar Repuesto
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Fotos del Proceso */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <span className="mr-2 text-lg sm:text-xl">📸</span>
                  Fotos del Proceso
                  {hasPhotos && (
                    <span className="ml-2 text-sm font-normal text-gray-500">({allPhotos.length})</span>
                  )}
                </h3>
                <button
                  onClick={() => setShowCamera(true)}
                  disabled={uploadingPhoto}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {uploadingPhoto ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <span>📷</span>
                      <span>Tomar Foto</span>
                    </>
                  )}
                </button>
              </div>
              
              {hasPhotos ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {allPhotos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative"
                      onClick={() => window.open(photo.url, '_blank')}
                    >
                      <span
                        className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          photo.source === 'entry'
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {photo.source === 'entry' ? 'Ingreso' : 'Proceso'}
                      </span>
                      <img
                        src={photo.url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-32 sm:h-40 object-cover"
                      />
                      <div className="p-2 sm:p-3">
                        {photo.description && (
                          <p className="text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2 line-clamp-2">{photo.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {formatDate(photo.uploadedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📷</div>
                  <p className="text-sm sm:text-base text-gray-600 mb-2">No hay fotos registradas</p>
                  <p className="text-xs sm:text-sm text-gray-500">Toma fotos del proceso de trabajo para documentar el avance</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Estado y Acciones */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">Estado Actual</h3>
              
              <div className="text-center mb-4 sm:mb-6">
                <div className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                  <span className="mr-2 text-lg sm:text-xl">{statusConfig.icon}</span>
                  {statusConfig.label}
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {/* Botones de cambio de estado - Solo para roles de gestión */}
                {canManageOrders() && (
                  <>
                    {workOrder.currentStatus === 'pendiente' && (
                      <button
                        onClick={() => handleStatusChange('en_progreso')}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                      >
                        ▶️ Iniciar Trabajo
                      </button>
                    )}
                    
                    {workOrder.currentStatus === 'en_progreso' && (
                      <>
                        <button
                          onClick={() => handleStatusChange('pausado')}
                          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
                        >
                          ⏸️ Pausar
                        </button>
                        <button
                          onClick={() => handleStatusChange('completado')}
                          disabled={!checklistCompleted}
                          className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors ${
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
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                      >
                        ▶️ Reanudar
                      </button>
                    )}
                  </>
                )}
                
                {/* Botones simplificados para mecánicos - Solo si es el mecánico asignado */}
                {isMechanic() && isAssignedMechanic() && (
                  <>
                    {workOrder.currentStatus === 'pendiente' && (
                      <button
                        onClick={() => handleStatusChange('en_progreso')}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                      >
                        ▶️ Comenzar
                      </button>
                    )}
                    
                    {workOrder.currentStatus === 'en_progreso' && (
                      <>
                        <button
                          onClick={() => handleStatusChange('pausado')}
                          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
                        >
                          ⏸️ Pausar
                        </button>
                        <button
                          onClick={() => handleStatusChange('completado')}
                          disabled={!checklistCompleted}
                          className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors rounded-lg ${
                            checklistCompleted
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          }`}
                        >
                          {checklistCompleted ? '✅ Finalizar' : '⏳ Finalizar (Faltan tareas)'}
                        </button>
                      </>
                    )}
                    
                    {workOrder.currentStatus === 'pausado' && (
                      <button
                        onClick={() => handleStatusChange('en_progreso')}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                      >
                        ▶️ Reanudar
                      </button>
                    )}
                  </>
                )}
                
                {/* Botón de Solicitar Repuestos */}
                {canRequestSpareParts() && canRequestSparePartsForOrder() && (
                  <button
                    onClick={() => setShowRequestSparePartsModal(true)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>📦</span>
                    <span>Solicitar Repuestos</span>
                  </button>
                )}
            </div>

            {/* Documentos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <DocumentUpload
                relatedTo="work-order"
                relatedId={workOrder.id}
                readOnly={(user as any)?.role?.name === 'Mecánico'}
                onDocumentUploaded={(doc) => {
                  console.log('Documento subido:', doc)
                }}
                onDocumentDeleted={(docId) => {
                  console.log('Documento eliminado:', docId)
                }}
              />
            </div>
          </div>

            {/* Cronología */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">Cronología</h3>
              
              <div className="space-y-3 sm:space-y-4">
                {/* Fecha de Creación */}
                {workOrder.createdAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm sm:text-base">📅</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-900">Creado</p>
                      <p className="text-xs sm:text-sm text-gray-600">{formatDate(workOrder.createdAt)}</p>
                    </div>
                  </div>
                )}
                
                {/* Última Actualización */}
                {workOrder.updatedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 text-sm sm:text-base">🔄</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-900">Última Actualización</p>
                      <p className="text-xs sm:text-sm text-gray-600">{formatDate(workOrder.updatedAt)}</p>
                    </div>
                  </div>
                )}
                
                {/* Fecha de Completado */}
                {workOrder.completedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-sm sm:text-base">✅</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-900">Completado</p>
                      <p className="text-xs sm:text-sm text-gray-600">{formatDate(workOrder.completedAt)}</p>
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

      {/* Modal de solicitar repuestos */}
      {workOrder && canRequestSpareParts() && canRequestSparePartsForOrder() && (
        <RequestSparePartsModal
          isOpen={showRequestSparePartsModal}
          onClose={() => setShowRequestSparePartsModal(false)}
          onSuccess={() => {
            loadWorkOrder() // Recargar la orden para mostrar los repuestos solicitados
          }}
          workOrderId={workOrder.id}
          workOrderNumber={workOrder.orderNumber}
        />
      )}

      {/* Modal de cámara para tomar fotos */}
      {showCamera && (
        <CameraCapture
          onPhotoTaken={handlePhotoTaken}
          onClose={() => setShowCamera(false)}
        />
      )}
    </MainLayout>
  )
}