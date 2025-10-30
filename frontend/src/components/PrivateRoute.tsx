import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useEffect, useState } from 'react'

interface PrivateRouteProps {
  children: React.ReactNode
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, user, getCurrentUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      // Si el usuario ya está en el store, no necesitamos llamar a getCurrentUser
      if (user) {
        setIsLoading(false)
        return
      }
      
      // Si no hay usuario, intentar obtenerlo del backend
      await getCurrentUser()
      setIsLoading(false)
    }
    checkAuth()
  }, [getCurrentUser, user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}


