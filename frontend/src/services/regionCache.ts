/**
 * Servicio de caché para regiones
 * Evita cargas duplicadas y proporciona datos offline
 */

interface Region {
  id: string
  code: string
  name: string
}

class RegionCache {
  private static instance: RegionCache
  private regions: Region[] = []
  private isLoading = false
  private isLoaded = false

  private constructor() {}

  static getInstance(): RegionCache {
    if (!RegionCache.instance) {
      RegionCache.instance = new RegionCache()
    }
    return RegionCache.instance
  }

  /**
   * Obtener regiones (desde caché o cargar si es necesario)
   */
  async getRegions(): Promise<Region[]> {
    // Si ya están cargadas, devolver inmediatamente
    if (this.isLoaded) {
      console.log('📦 Regiones obtenidas desde caché:', this.regions.length)
      return this.regions
    }

    // Si ya se están cargando, esperar
    if (this.isLoading) {
      console.log('⏳ Esperando carga de regiones...')
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (this.isLoaded) {
            resolve(this.regions)
          } else {
            setTimeout(checkLoaded, 100)
          }
        }
        checkLoaded()
      })
    }

    // Cargar regiones
    return this.loadRegions()
  }

  /**
   * Cargar regiones (solo una vez)
   */
  private async loadRegions(): Promise<Region[]> {
    this.isLoading = true
    console.log('🔄 Cargando regiones en caché...')

    try {
      // Regiones por defecto (modo offline)
      const defaultRegions: Region[] = [
        {
          id: '6784eff8-8bde-40fc-99d6-e512b7d859f7',
          code: 'RM',
          name: 'Región Metropolitana'
        },
        {
          id: 'region-valparaiso',
          code: 'V',
          name: 'Región de Valparaíso'
        },
        {
          id: 'region-biobio',
          code: 'VIII',
          name: 'Región del Biobío'
        },
        {
          id: 'region-arica',
          code: 'XV',
          name: 'Región de Arica y Parinacota'
        },
        {
          id: 'region-tarapaca',
          code: 'I',
          name: 'Región de Tarapacá'
        },
        {
          id: 'region-antofagasta',
          code: 'II',
          name: 'Región de Antofagasta'
        },
        {
          id: 'region-atacama',
          code: 'III',
          name: 'Región de Atacama'
        },
        {
          id: 'region-coquimbo',
          code: 'IV',
          name: 'Región de Coquimbo'
        },
        {
          id: 'region-ohiggins',
          code: 'VI',
          name: 'Región del Libertador General Bernardo O\'Higgins'
        },
        {
          id: 'region-maule',
          code: 'VII',
          name: 'Región del Maule'
        },
        {
          id: 'region-araucania',
          code: 'IX',
          name: 'Región de La Araucanía'
        },
        {
          id: 'region-los-rios',
          code: 'XIV',
          name: 'Región de Los Ríos'
        },
        {
          id: 'region-los-lagos',
          code: 'X',
          name: 'Región de Los Lagos'
        },
        {
          id: 'region-aysen',
          code: 'XI',
          name: 'Región Aysén del General Carlos Ibáñez del Campo'
        },
        {
          id: 'region-magallanes',
          code: 'XII',
          name: 'Región de Magallanes y de la Antártica Chilena'
        }
      ]

      this.regions = defaultRegions
      this.isLoaded = true
      console.log('✅ Regiones cargadas en caché (modo offline):', this.regions.length)

      // Intentar cargar desde el backend como mejora opcional
      try {
        const { configService } = await import('./configService')
        const backendRegions = await configService.getRegions()
        if (backendRegions && backendRegions.length > 0) {
          console.log('✅ Regiones del backend cargadas en caché:', backendRegions.length)
          this.regions = backendRegions
        }
      } catch (backendError) {
        console.log('⚠️ No se pudieron cargar regiones del backend, usando datos por defecto')
      }

      return this.regions
    } catch (error) {
      console.error('❌ Error cargando regiones en caché:', error)
      
      // Fallback final
      this.regions = [{
        id: '6784eff8-8bde-40fc-99d6-e512b7d859f7',
        code: 'RM',
        name: 'Región Metropolitana'
      }]
      this.isLoaded = true
      
      return this.regions
    } finally {
      this.isLoading = false
    }
  }

  /**
   * Limpiar caché (para testing o recarga forzada)
   */
  clearCache(): void {
    this.regions = []
    this.isLoaded = false
    this.isLoading = false
    console.log('🗑️ Caché de regiones limpiado')
  }

  /**
   * Verificar si las regiones están cargadas
   */
  isRegionsLoaded(): boolean {
    return this.isLoaded
  }
}

// Exportar instancia singleton
export const regionCache = RegionCache.getInstance()
export type { Region }

