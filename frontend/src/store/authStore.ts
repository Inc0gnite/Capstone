import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/authService'
import type { User } from '../../../shared/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  getCurrentUser: () => Promise<void>
  clearError: () => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

          login: async (email: string, password: string) => {
            console.log('🔐 Iniciando login para:', email)
            set({ isLoading: true, error: null })
            try {
              console.log('📡 Llamando a authService.login...')
              const data = await authService.login({ email, password })
              console.log('✅ Login exitoso:', data.user?.email, 'Rol:', data.user?.role?.name)
              console.log('👤 Datos completos del usuario:', JSON.stringify(data.user, null, 2))

              const userToStore = data.user as any
              console.log('💾 Almacenando usuario:', {
                id: userToStore.id,
                email: userToStore.email,
                firstName: userToStore.firstName,
                lastName: userToStore.lastName,
                roleName: userToStore.role?.name,
                workshopId: userToStore.workshopId
              })

              set({
                user: userToStore,
                isAuthenticated: true,
                isLoading: false,
              })

              console.log('✅ Usuario almacenado en el store exitosamente')
            } catch (error: any) {
              console.error('❌ Error en login:', error)
              console.error('❌ Error response:', error.response)
              console.error('❌ Error message:', error.message)
              set({
                error: error.response?.data?.error || 'Error al iniciar sesión',
                isLoading: false,
              })
              throw error
            }
          },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authService.logout()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        } catch (error) {
          console.error('Error al cerrar sesión:', error)
          // Limpiar de todos modos
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      getCurrentUser: async () => {
        console.log('🔍 getCurrentUser llamado')
        const hasToken = authService.isAuthenticated()
        console.log('🔑 Token disponible:', hasToken)
        
        if (!hasToken) {
          console.log('❌ No hay token, usuario no autenticado')
          set({ isAuthenticated: false })
          return
        }

        // Si el usuario ya está en el store persistido, no hacer nada más
        const currentUser = useAuthStore.getState().user
        if (currentUser) {
          console.log('✅ Usuario ya está en el store:', currentUser.email)
          set({ isAuthenticated: true, isLoading: false })
          return
        }

        set({ isLoading: true })
        try {
          console.log('📡 Obteniendo usuario actual del backend...')
          const user = await authService.getCurrentUser()
          console.log('✅ Usuario obtenido del backend:', user.email, 'Rol:', user.role?.name)
          set({
            user: user as any,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          console.error('❌ Error obteniendo usuario:', error)
          // No limpiar el estado si hay error, dejar que el usuario persista
          set({ isLoading: false })
        }
      },

      clearError: () => set({ error: null }),
      
      clearUser: () => set({ 
        user: null, 
        isAuthenticated: false,
        error: null 
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user 
      }),
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name)
          console.log('📦 GetItem de storage:', name, str)
          if (!str) return null
          const parsed = JSON.parse(str)
          console.log('📦 Data parseada:', parsed)
          return parsed
        },
        setItem: (name, value) => {
          console.log('💾 SetItem a storage:', name, value)
          sessionStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          console.log('🗑️ RemoveItem de storage:', name)
          sessionStorage.removeItem(name)
        },
      },
    }
  )
)
