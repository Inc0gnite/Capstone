import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import AdminDashboard from './dashboards/AdminDashboard'
import GuardiaDashboard from './dashboards/GuardiaDashboard'
import RecepcionistaDashboard from './dashboards/RecepcionistaDashboard'
import MecanicoDashboard from './dashboards/MecanicoDashboard'
import JefeTallerDashboard from './dashboards/JefeTallerDashboard'
import InventarioDashboard from './dashboards/InventarioDashboard'
import { CreateEntryModalAdvanced } from '../components/modals/CreateEntryModalAdvanced'

function Dashboard() {
  const { user, getCurrentUser, isLoading, clearUser } = useAuthStore()
  const [showCreateVehicle, setShowCreateVehicle] = useState(false)
  const [isValidating, setIsValidating] = useState(true)

  useEffect(() => {
    const validateUser = async () => {
      try {
        setIsValidating(true)
        
        // Si el usuario ya está en el store, no necesitamos validar
        if (user) {
          console.log('✅ Usuario ya validado en store:', user.email, 'Rol:', (user as any)?.role?.name)
          setIsValidating(false)
          return
        }
        
        // Solo validar si no hay usuario en el store
        console.log('🔍 No hay usuario en store, validando...')
        await getCurrentUser()
        console.log('✅ Usuario validado:', user?.email, 'Rol:', (user as any)?.role?.name)
      } catch (error) {
        console.error('❌ Error validando usuario:', error)
        // Solo redirigir al login si realmente no hay sesión
        clearUser()
        window.location.href = '/login'
      } finally {
        setIsValidating(false)
      }
    }

    validateUser()
  }, [getCurrentUser, clearUser, user])

  // Generar ID único para esta pestaña
  useEffect(() => {
    const tabId = crypto.randomUUID()
    sessionStorage.setItem('tabId', tabId)
    console.log('🆔 ID de pestaña generado:', tabId)
  }, [])

  // Redirigir automáticamente según el rol - MOVIDO ANTES DE LOS RENDERS CONDICIONALES
  useEffect(() => {
    if (!user || !(user as any).role) return
    
    const roleName = (user as any).role?.name
    console.log('🔍 Dashboard.tsx - Rol detectado:', roleName)
    console.log('🔍 Dashboard.tsx - Usuario:', user)
    
    if (!roleName) {
      console.log('⚠️ No hay rol detectado, esperando...')
      return
    }
    
    const roleDashboardMap: Record<string, string> = {
      'Administrador': '/dashboard/administrador',
      'Guardia': '/dashboard/guardia',
      'Recepcionista': '/dashboard/recepcionista',
      'Mecánico': '/dashboard/mecanico',
      'Jefe de Taller': '/dashboard/jefe-taller',
      'Inventario': '/dashboard/inventario'
    }
    
    const dashboardPath = roleDashboardMap[roleName]
    
    if (dashboardPath) {
      console.log(`🔄 Redirigiendo ${roleName} a su dashboard específico: ${dashboardPath}`)
      // Usar window.location.href para forzar la redirección
      window.location.href = dashboardPath
    } else {
      console.log(`⚠️ No hay dashboard específico para el rol: ${roleName}`)
    }
  }, [user])

  const handleCreateVehicleSuccess = () => {
    setShowCreateVehicle(false)
    // Recargar la página para actualizar los datos
    window.location.reload()
  }

  if (isLoading || isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {isValidating ? 'Validando usuario...' : 'Cargando...'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Verificando permisos y rol de usuario
        </p>
      </div>
    </div>
    )
  }

  if (!user || !(user as any).role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium">Error al cargar usuario</p>
          <p className="text-gray-600 mt-2">Por favor, inicia sesión nuevamente</p>
        </div>
      </div>
    )
  }

  // Renderizar dashboard según rol
  const roleName = (user as any).role?.name
  
  // Debug: Mostrar información del usuario actual
  console.log('🔍 Dashboard - Usuario actual:', {
    id: user?.id,
    email: user?.email,
    firstName: user?.firstName,
    lastName: user?.lastName,
    role: roleName,
    workshopId: (user as any)?.workshopId
  })

  const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
    // Solo mostrar el botón para Guardia y Administrador
    const canCreateVehicle = roleName === 'Guardia' || roleName === 'Administrador'
    
    return (
      <div className="relative">
        
        {/* Botón flotante para registrar vehículo - Solo para Guardia y Admin */}
        {canCreateVehicle && (
          <button
            onClick={() => setShowCreateVehicle(true)}
            className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
            title="Registrar Nuevo Vehículo"
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚗</span>
              <span className="font-medium">Nuevo Vehículo</span>
            </div>
          </button>
        )}
        
        {children}
        
        {/* Modal para crear vehículo - Solo para Guardia y Admin */}
        {canCreateVehicle && (
          <CreateEntryModalAdvanced
            isOpen={showCreateVehicle}
            onClose={() => setShowCreateVehicle(false)}
            onSuccess={handleCreateVehicleSuccess}
          />
        )}
      </div>
    )
  }

  switch (roleName) {
    case 'Administrador':
      return (
        <DashboardWrapper>
          <AdminDashboard />
        </DashboardWrapper>
      )
    
    case 'Guardia':
      return (
        <DashboardWrapper>
          <GuardiaDashboard />
        </DashboardWrapper>
      )
    
    case 'Recepcionista':
      return (
        <DashboardWrapper>
          <RecepcionistaDashboard />
        </DashboardWrapper>
      )
    
    case 'Mecánico':
      return (
        <DashboardWrapper>
          <MecanicoDashboard />
        </DashboardWrapper>
      )
    
    case 'Jefe de Taller':
      return (
        <DashboardWrapper>
          <JefeTallerDashboard />
        </DashboardWrapper>
      )
    
    case 'Encargado de Inventario':
      return (
        <DashboardWrapper>
          <InventarioDashboard />
        </DashboardWrapper>
      )
    
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="text-xl font-bold text-gray-900">
              Rol no reconocido: {roleName}
            </p>
            <p className="text-gray-600 mt-2">
              Contacta al administrador del sistema
            </p>
          </div>
        </div>
      )
  }
}

export default Dashboard
