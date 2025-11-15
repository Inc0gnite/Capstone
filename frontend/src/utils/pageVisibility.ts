/**
 * Utilidad para detectar cuando la pestaña está visible/oculta
 * Útil para detener polling cuando el usuario no está viendo la página
 */

type VisibilityCallback = (isVisible: boolean) => void

class PageVisibilityManager {
  private callbacks: Set<VisibilityCallback> = new Set()
  private isVisible: boolean = !document.hidden

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
    }
  }

  private handleVisibilityChange() {
    this.isVisible = !document.hidden
    const message = this.isVisible ? '👁️ Pestaña visible' : '🙈 Pestaña oculta'
    console.log(message)
    
    // Notificar a todos los callbacks
    this.callbacks.forEach((callback) => {
      try {
        callback(this.isVisible)
      } catch (error) {
        console.error('Error en callback de PageVisibility:', error)
      }
    })
  }

  /**
   * Suscribirse a cambios de visibilidad
   */
  subscribe(callback: VisibilityCallback): () => void {
    this.callbacks.add(callback)
    
    // Ejecutar callback inmediatamente con el estado actual
    callback(this.isVisible)
    
    // Retornar función para desuscribirse
    return () => {
      this.callbacks.delete(callback)
    }
  }

  /**
   * Obtener estado actual de visibilidad
   */
  getIsVisible(): boolean {
    return this.isVisible
  }

  /**
   * Limpiar todos los callbacks
   */
  cleanup() {
    this.callbacks.clear()
  }
}

// Singleton
export const pageVisibility = new PageVisibilityManager()

/**
 * Hook para usar Page Visibility en componentes React
 * Nota: Requiere importar React en el archivo que lo use
 */
export function usePageVisibility() {
  // Este hook debe ser usado en componentes React
  // Se importa React dinámicamente para evitar dependencias circulares
  const React = require('react')
  const [isVisible, setIsVisible] = React.useState(() => 
    typeof document !== 'undefined' ? !document.hidden : true
  )

  React.useEffect(() => {
    const unsubscribe = pageVisibility.subscribe(setIsVisible)
    return unsubscribe
  }, [])

  return isVisible
}

