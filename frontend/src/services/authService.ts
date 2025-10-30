import api from './api'
import type { LoginRequest, LoginResponse, User } from '../../../shared/types'

export const authService = {
  /**
   * Login
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('🔐 AuthService.login llamado con:', credentials.email)
    const response = await api.post('/auth/login', credentials)
    const data = response.data.data
    console.log('✅ Respuesta del backend:', data)

    // Guardar tokens en sessionStorage (aislado por pestaña)
    sessionStorage.setItem('accessToken', data.accessToken)
    sessionStorage.setItem('refreshToken', data.refreshToken)
    console.log('💾 Tokens guardados en sessionStorage:', {
      accessTokenLength: data.accessToken?.length || 0,
      refreshTokenLength: data.refreshToken?.length || 0,
      sessionStorageKeys: Object.keys(sessionStorage)
    })

    return data
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } finally {
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('refreshToken')
    }
  },

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me')
    return response.data.data
  },

  /**
   * Cambiar contraseña
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      oldPassword,
      newPassword,
    })
  },

  /**
   * Solicitar recuperación de contraseña
   */
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  },

  /**
   * Restablecer contraseña usando token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword })
  },

  /**
   * Verificar si hay sesión activa
   */
  isAuthenticated(): boolean {
    const token = sessionStorage.getItem('accessToken')
    return !!token
  },
}


