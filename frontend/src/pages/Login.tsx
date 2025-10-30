import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  // Estado para recuperación de contraseña
  const [isForgotOpen, setIsForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStatus, setForgotStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' })
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    console.log('🚀 INICIO DEL LOGIN - Email:', email)
    console.log('🚀 INICIO DEL LOGIN - Password:', password ? '***' : 'VACÍO')

    try {
      console.log('📡 LLAMANDO A LOGIN...')
      await login(email, password)
      console.log('✅ LOGIN EXITOSO - Continuando con redirección...')
      
      // Esperar un momento para que el store se actualice
      setTimeout(() => {
        // Redirigir según el rol del usuario
        const userRole = (useAuthStore.getState().user as any)?.role?.name
        console.log('🎯 Rol detectado:', userRole)
        console.log('👤 Usuario completo:', useAuthStore.getState().user)
        
        let redirectPath = '/dashboard'
        const roleDashboardMap: Record<string, string> = {
          'Administrador': '/dashboard/administrador',
          'Guardia': '/dashboard/guardia',
          'Recepcionista': '/dashboard/recepcionista',
          'Mecánico': '/dashboard/mecanico',
          'Jefe de Taller': '/dashboard/jefe-taller',
          'Inventario': '/dashboard/inventario'
        }
        
        redirectPath = roleDashboardMap[userRole || ''] || '/dashboard'
        
        console.log('🔄 Redirigiendo a:', redirectPath)
        console.log('🔍 Mapeo usado:', roleDashboardMap)
        
        // Usar window.location.href para forzar la redirección
        window.location.href = redirectPath
      }, 100)
      
    } catch (error: any) {
      console.error('❌ ERROR EN LOGIN:', error)
      console.error('❌ Error response:', error.response)
      console.error('❌ Error message:', error.message)
      setError(error.response?.data?.error || 'Error al iniciar sesión')
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotStatus({ type: 'idle' })
    setIsSubmittingForgot(true)
    try {
      await authService.forgotPassword(forgotEmail)
      setForgotStatus({ type: 'success', message: 'Si el correo existe, enviaremos instrucciones para restablecer tu contraseña.' })
    } catch (err: any) {
      console.error('Error en recuperación de contraseña:', err)
      setForgotStatus({ type: 'error', message: err?.response?.data?.error || 'No se pudo procesar la solicitud' })
    } finally {
      setIsSubmittingForgot(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Logo y título */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Gestión de Flota</h2>
            <p className="text-gray-600">PepsiCo Chile</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700"
                onClick={() => {
                  setForgotEmail('')
                  setForgotStatus({ type: 'idle' })
                  setIsForgotOpen(true)
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>

          {/* Credenciales de prueba */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-2">Credenciales de prueba:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Admin:</span> admin@pepsico.cl / admin123
              </p>
              <p>
                <span className="font-medium">Guardia:</span> guardia@pepsico.cl / admin123
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-4">
          © 2024 PepsiCo Chile - Todos los derechos reservados
        </p>
      </div>

      {/* Modal Recuperar Contraseña */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recuperar contraseña</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsForgotOpen(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              {forgotStatus.type === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {forgotStatus.message}
                </div>
              )}
              {forgotStatus.type === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {forgotStatus.message}
                </div>
              )}

              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsForgotOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingForgot}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmittingForgot ? 'Enviando...' : 'Enviar instrucciones'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
