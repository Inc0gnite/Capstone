import axios from 'axios'
import { requestCache, generateCacheKey } from '../utils/requestCache'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Configuración de caché por endpoint
const CACHE_CONFIG: Record<string, { ttl: number; methods: string[] }> = {
  '/vehicle-entries/active': { ttl: 30000, methods: ['GET'] }, // 30 segundos
  '/notifications': { ttl: 20000, methods: ['GET'] }, // 20 segundos
  '/dashboard': { ttl: 60000, methods: ['GET'] }, // 60 segundos
  '/work-orders': { ttl: 30000, methods: ['GET'] }, // 30 segundos
}

// Interceptor para agregar token a las peticiones y manejar caché
api.interceptors.request.use(
  async (config) => {
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

    // Verificar si esta petición debe usar caché
    const cacheConfig = Object.entries(CACHE_CONFIG).find(([endpoint]) => 
      url.includes(endpoint)
    )
    
    if (cacheConfig && config.method?.toUpperCase() === 'GET') {
      const cacheKey = generateCacheKey(url, config.params)
      config.metadata = { cacheKey, cacheConfig: cacheConfig[1] }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de autenticación y rate limiting
api.interceptors.response.use(
  (response) => {
    // Guardar en caché si está configurado
    const metadata = response.config.metadata
    if (metadata?.cacheKey && response.status === 200) {
      requestCache.set(metadata.cacheKey, response.data, metadata.cacheConfig.ttl)
    }

    console.log('✅ Respuesta exitosa:', response.config.url, response.status)
    return response
  },
  async (error) => {

    console.error('❌ Error en petición:', error.config?.url, error.response?.status, error.response?.data)
    console.error('❌ Error completo:', error)
    
    const originalRequest = error.config

    // Manejar error 429 (Rate Limit)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 
                        error.response.data?.retryAfter || 
                        60 // Default: 60 segundos
      
      console.warn(`⚠️ Rate limit alcanzado. Reintentando después de ${retryAfter} segundos...`)
      
      // Invalidar caché para esta petición
      if (originalRequest.metadata?.cacheKey) {
        requestCache.invalidate(originalRequest.metadata.cacheKey)
      }

      // Retry con exponential backoff
      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 0
      }
      
      originalRequest._retryCount++
      
      if (originalRequest._retryCount <= 3) {
        const delay = retryAfter * 1000 * originalRequest._retryCount
        console.log(`⏳ Esperando ${delay / 1000} segundos antes de reintentar...`)
        
        await new Promise((resolve) => setTimeout(resolve, delay))
        
        return api(originalRequest)
      } else {
        console.error('❌ Máximo de reintentos alcanzado para rate limit')
        return Promise.reject(error)
      }
    }

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
