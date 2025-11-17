import api from './api'

export interface Region {
  id: string
  code: string
  name: string
}

export interface Workshop {
  id: string
  code: string
  name: string
  regionId: string
}

class ConfigService {
  private regionsCache: Region[] | null = null
  private workshopsCache: Workshop[] | null = null

  /**
   * Obtener regiones desde el backend
   */
  async getRegions(): Promise<Region[]> {
    if (this.regionsCache) {
      return this.regionsCache
    }

    try {
      const response = await api.get('/regions')
      this.regionsCache = response.data.data
      return this.regionsCache
    } catch (error) {
      console.error('Error obteniendo regiones:', error)
      // Fallback a regiones por defecto si falla la API
      return this.getDefaultRegions()
    }
  }

  /**
   * Obtener talleres desde el backend
   */
  async getWorkshops(): Promise<Workshop[]> {
    if (this.workshopsCache) {
      return this.workshopsCache
    }

    try {
      const response = await api.get('/workshops')
      this.workshopsCache = response.data.data
      return this.workshopsCache
    } catch (error) {
      console.error('Error obteniendo talleres:', error)
      // Fallback a talleres por defecto si falla la API
      return this.getDefaultWorkshops()
    }
  }

  /**
   * Obtener el ID del taller por defecto (primer taller disponible)
   */
  async getDefaultWorkshopId(): Promise<string> {
    try {
      const workshops = await this.getWorkshops()
      if (workshops.length > 0) {
        return workshops[0].id
      }
    } catch (error) {
      console.error('Error obteniendo taller por defecto:', error)
    }
    
    // Fallback al ID del primer taller como último recurso
    return 'dcb29955-8985-47cf-9142-8c68efc2554f'
  }

  /**
   * Obtener región por código
   */
  async getRegionByCode(code: string): Promise<Region | null> {
    try {
      const regions = await this.getRegions()
      return regions.find(region => region.code === code) || null
    } catch (error) {
      console.error('Error obteniendo región por código:', error)
      return null
    }
  }

  /**
   * Obtener taller por código
   */
  async getWorkshopByCode(code: string): Promise<Workshop | null> {
    try {
      const workshops = await this.getWorkshops()
      return workshops.find(workshop => workshop.code === code) || null
    } catch (error) {
      console.error('Error obteniendo taller por código:', error)
      return null
    }
  }

  /**
   * Limpiar cache (útil para testing o cambios de configuración)
   */
  clearCache(): void {
    this.regionsCache = null
    this.workshopsCache = null
  }

  /**
   * Regiones por defecto (fallback)
   */
  private getDefaultRegions(): Region[] {
    return [
      { id: 'c96a9139-ae99-413e-9ef4-25d8cab5fc34', code: 'VIII', name: 'Región del Biobío' },
      { id: '6784eff8-8bde-40fc-99d6-e512b7d859f7', code: 'RM', name: 'Región Metropolitana' },
      { id: '1e3deda7-2112-44ac-8394-9dbad922eb81', code: 'V', name: 'Región de Valparaíso' }
    ]
  }

  /**
   * Talleres por defecto (fallback)
   */
  private getDefaultWorkshops(): Workshop[] {
    return [
      { 
        id: '7e9fef8f-76ca-4f52-bb41-e7b8ac95ba52', 
        code: 'TAL-V-01', 
        name: 'Taller Valparaíso',
        regionId: '1e3deda7-2112-44ac-8394-9dbad922eb81'
      },
      { 
        id: 'dcb29955-8985-47cf-9142-8c68efc2554f', 
        code: 'TAL-RM-01', 
        name: 'Taller Quilicura',
        regionId: '6784eff8-8bde-40fc-99d6-e512b7d859f7'
      },
      { 
        id: '5f13ce17-ae6e-4f78-b20b-5419e0a44505', 
        code: 'TAL-RM-02', 
        name: 'Taller Maipú',
        regionId: '6784eff8-8bde-40fc-99d6-e512b7d859f7'
      }
    ]
  }
}

export const configService = new ConfigService()
