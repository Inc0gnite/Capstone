import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    // No agregar token para peticiones públicas de auth
    const url = config.url || ''
    const isPublicAuth =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password')

    if (isPublicAuth) {
      return config
    }
    
    const token = sessionStorage.getItem('accessToken')
    console.log('🔑 Token encontrado para petición:', config.url, token ? 'Sí' : 'No')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Token agregado a la petición:', config.url)
    } else {
      console.warn('⚠️ No hay token disponible para la petición:', config.url)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta exitosa:', response.config.url, response.status)
    return response
  },
  async (error) => {
    console.error('❌ Error en petición:', error.config?.url, error.response?.status, error.response?.data)
    console.error('❌ Error completo:', error)
    
    const originalRequest = error.config

    // Si el error es 401 y no es un retry, intentar refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 Error 401 detectado, intentando refrescar token...')
      console.log('🔍 URL de la petición:', originalRequest.url)
      console.log('🔍 Método:', originalRequest.method)
      
      originalRequest._retry = true

      try {
        const refreshToken = sessionStorage.getItem('refreshToken')
        console.log('🔍 Refresh token disponible:', refreshToken ? 'Sí' : 'No')
        
        if (refreshToken) {
          console.log('🔄 Llamando a /auth/refresh...')
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          })

          const { accessToken } = response.data.data
          sessionStorage.setItem('accessToken', accessToken)
          console.log('✅ Token refrescado exitosamente')

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } else {
          console.log('⚠️ No hay refresh token disponible')
        }
      } catch (refreshError) {
        console.error('❌ Error refrescando token:', refreshError)
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Función de debugging para verificar el estado del token
export const debugTokenStatus = () => {
  const accessToken = sessionStorage.getItem('accessToken')
  const refreshToken = sessionStorage.getItem('refreshToken')
  
  console.log('🔍 Estado de los tokens:')
  console.log('  - Access Token:', accessToken ? `Presente (${accessToken.length} caracteres)` : 'No encontrado')
  console.log('  - Refresh Token:', refreshToken ? `Presente (${refreshToken.length} caracteres)` : 'No encontrado')
  
  if (accessToken) {
    try {
      // Decodificar el JWT para ver su contenido (sin verificar la firma)
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      console.log('  - Token payload:', payload)
      console.log('  - Token expira en:', new Date(payload.exp * 1000))
      console.log('  - Token es válido:', payload.exp * 1000 > Date.now())
    } catch (error) {
      console.log('  - Error decodificando token:', error)
    }
  }
}

export default api
