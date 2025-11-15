/**
 * Sistema de caché para requests HTTP
 * Evita peticiones duplicadas y reduce la carga en el servidor
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface CacheConfig {
  ttl?: number // Time to live en milisegundos
  maxSize?: number // Tamaño máximo del caché
}

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>()
  private pendingRequests = new Map<string, Promise<any>>()
  private defaultTTL = 30000 // 30 segundos por defecto
  private maxSize = 100 // Máximo 100 entradas en caché

  /**
   * Obtener o ejecutar request con caché
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    config?: CacheConfig
  ): Promise<T> {
    const ttl = config?.ttl || this.defaultTTL
    const now = Date.now()

    // Verificar si hay una petición pendiente para esta clave
    if (this.pendingRequests.has(key)) {
      console.log(`🔄 Reutilizando petición pendiente para: ${key}`)
      return this.pendingRequests.get(key) as Promise<T>
    }

    // Verificar caché
    const cached = this.cache.get(key)
    if (cached && now < cached.expiresAt) {
      console.log(`✅ Cache hit para: ${key}`)
      return cached.data as T
    }

    // Ejecutar fetcher y cachear resultado
    console.log(`🌐 Cache miss, ejecutando petición para: ${key}`)
    const promise = fetcher()
      .then((data) => {
        // Guardar en caché
        this.set(key, data, ttl)
        // Remover de peticiones pendientes
        this.pendingRequests.delete(key)
        return data
      })
      .catch((error) => {
        // Remover de peticiones pendientes en caso de error
        this.pendingRequests.delete(key)
        throw error
      })

    // Guardar petición pendiente
    this.pendingRequests.set(key, promise)

    return promise
  }

  /**
   * Guardar en caché
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const expiresAt = now + (ttl || this.defaultTTL)

    // Limpiar caché si está lleno
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    })
  }

  /**
   * Invalidar caché
   */
  invalidate(key: string | RegExp): void {
    if (typeof key === 'string') {
      this.cache.delete(key)
      console.log(`🗑️ Cache invalidado para: ${key}`)
    } else {
      // Invalidar por patrón
      const keysToDelete: string[] = []
      this.cache.forEach((_, cacheKey) => {
        if (key.test(cacheKey)) {
          keysToDelete.push(cacheKey)
        }
      })
      keysToDelete.forEach((k) => this.cache.delete(k))
      console.log(`🗑️ Cache invalidado para patrón: ${key}, ${keysToDelete.length} entradas eliminadas`)
    }
  }

  /**
   * Limpiar entradas expiradas
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((entry, key) => {
      if (now >= entry.expiresAt) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => this.cache.delete(key))

    if (keysToDelete.length > 0) {
      console.log(`🧹 Limpieza de caché: ${keysToDelete.length} entradas expiradas eliminadas`)
    }
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    this.cache.clear()
    this.pendingRequests.clear()
    console.log('🗑️ Caché completamente limpiado')
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    const now = Date.now()
    let expired = 0
    let active = 0

    this.cache.forEach((entry) => {
      if (now >= entry.expiresAt) {
        expired++
      } else {
        active++
      }
    })

    return {
      total: this.cache.size,
      active,
      expired,
      pending: this.pendingRequests.size,
    }
  }
}

// Singleton
export const requestCache = new RequestCache()

// Limpiar caché expirado cada minuto
if (typeof window !== 'undefined') {
  setInterval(() => {
    requestCache.cleanup()
  }, 60000)
}

/**
 * Helper para generar clave de caché desde URL y parámetros
 */
export function generateCacheKey(url: string, params?: Record<string, any>): string {
  const sortedParams = params
    ? Object.keys(params)
        .sort()
        .map((key) => `${key}=${JSON.stringify(params[key])}`)
        .join('&')
    : ''
  return `${url}${sortedParams ? `?${sortedParams}` : ''}`
}

