import 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      cacheKey?: string
      cacheConfig?: {
        ttl: number
        methods: string[]
      }
    }
    _retryCount?: number
  }
}

