import { CHILE_REGIONS } from '../../data/chileRegions'

interface Region {
  id: string
  code: string
  name: string
}

interface RegionSelectorProps {
  value: string
  onChange: (regionId: string) => void
  required?: boolean
  disabled?: boolean
  className?: string
  regions?: Region[]
}

export function RegionSelector({ 
  value, 
  onChange, 
  required = false, 
  disabled = false,
  className = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
  regions = CHILE_REGIONS
}: RegionSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      required={required}
      disabled={disabled}
    >
      <option value="">
        {regions.length === 0 ? 'No hay regiones disponibles' : 'Selecciona una región'}
      </option>
      {regions.map((region) => (
        <option key={region.id} value={region.id}>
          {region.code} - {region.name}
        </option>
      ))}
    </select>
  )
}
