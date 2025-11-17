export interface ChileRegion {
  id: string
  name: string
  code: string
  number: number
}

export const CHILE_REGIONS: ChileRegion[] = [
  { id: 'region-1', name: 'Región de Tarapacá', code: 'I', number: 1 },
  { id: 'region-2', name: 'Región de Antofagasta', code: 'II', number: 2 },
  { id: 'region-3', name: 'Región de Atacama', code: 'III', number: 3 },
  { id: 'region-4', name: 'Región de Coquimbo', code: 'IV', number: 4 },
  { id: 'region-5', name: 'Región de Valparaíso', code: 'V', number: 5 },
  { id: 'region-6', name: 'Región del Libertador General Bernardo O\'Higgins', code: 'VI', number: 6 },
  { id: 'region-7', name: 'Región del Maule', code: 'VII', number: 7 },
  { id: 'region-8', name: 'Región del Biobío', code: 'VIII', number: 8 },
  { id: 'region-9', name: 'Región de La Araucanía', code: 'IX', number: 9 },
  { id: 'region-10', name: 'Región de Los Lagos', code: 'X', number: 10 },
  { id: 'region-11', name: 'Región Aysén del General Carlos Ibáñez del Campo', code: 'XI', number: 11 },
  { id: 'region-12', name: 'Región de Magallanes y de la Antártica Chilena', code: 'XII', number: 12 },
  { id: 'region-13', name: 'Región Metropolitana de Santiago', code: 'RM', number: 13 },
  { id: 'region-14', name: 'Región de Los Ríos', code: 'XIV', number: 14 },
  { id: 'region-15', name: 'Región de Arica y Parinacota', code: 'XV', number: 15 },
  { id: 'region-16', name: 'Región de Ñuble', code: 'XVI', number: 16 }
]

export const getRegionById = (id: string): ChileRegion | undefined => {
  return CHILE_REGIONS.find(region => region.id === id)
}

export const getRegionByCode = (code: string): ChileRegion | undefined => {
  return CHILE_REGIONS.find(region => region.code === code)
}


