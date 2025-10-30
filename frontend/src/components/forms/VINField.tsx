import { useState } from 'react'
import { generateUniqueVIN } from '../../utils/vinGenerator'

interface VINFieldProps {
  value: string
  onChange: (vin: string) => void
  existingVINs?: string[]
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function VINField({ 
  value, 
  onChange, 
  existingVINs = [],
  className = "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
  placeholder = "1HGBH41JXMN109186",
  disabled = false
}: VINFieldProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateVIN = async () => {
    try {
      setIsGenerating(true)
      const newVIN = await generateUniqueVIN(existingVINs)
      onChange(newVIN)
    } catch (error) {
      console.error('Error generando VIN:', error)
      alert('Error generando VIN. Por favor, ingrésalo manualmente.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex space-x-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className={className}
        placeholder={placeholder}
        maxLength={17}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={handleGenerateVIN}
        disabled={isGenerating || disabled}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        title="Generar VIN automáticamente"
      >
        {isGenerating ? '⏳' : '🎲'} {isGenerating ? 'Generando...' : 'Generar'}
      </button>
    </div>
  )
}


