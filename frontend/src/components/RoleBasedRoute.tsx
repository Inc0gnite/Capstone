import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface RoleBasedRouteProps {
  children: ReactNode
  allowedRoles: string[]
  fallbackPath?: string
}

export function RoleBasedRoute({ 
  children, 
  allowedRoles, 
  fallbackPath = '/dashboard' 
}: RoleBasedRouteProps) {
  const { user, isAuthenticated } = useAuthStore()
  const location = useLocation()

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Obtener el rol del usuario
  const userRole = (user as any)?.role?.name

  // Si el usuario no tiene rol o el rol no está permitido
  if (!userRole || !allowedRoles.includes(userRole)) {
    console.warn(`🚫 Acceso denegado: Usuario con rol '${userRole}' intentó acceder a ruta restringida para roles: ${allowedRoles.join(', ')}`)
    
    // Redirigir al dashboard apropiado según el rol del usuario
    const roleDashboardMap: Record<string, string> = {
      'Administrador': '/dashboard/administrador',
      'Guardia': '/dashboard/guardia',
      'Recepcionista': '/dashboard/recepcionista',
      'Mecánico': '/dashboard/mecanico',
      'Jefe de Taller': '/dashboard/jefe-taller',
      'Inventario': '/dashboard/inventario'
    }

    const redirectPath = roleDashboardMap[userRole] || fallbackPath
    console.log(`🔄 Redirigiendo ${userRole} de ${location.pathname} a: ${redirectPath}`)
    
    return <Navigate to={redirectPath} replace />
  }

  // Si el rol está permitido, mostrar el contenido
  return <>{children}</>
}



