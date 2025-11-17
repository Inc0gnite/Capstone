import React from 'react'

interface MechanicCapacityIndicatorProps {
  mechanicName: string
  currentHours: number
  maxHours: number
  currentOrders: number
  className?: string
}

export function MechanicCapacityIndicator({
  mechanicName,
  currentHours,
  maxHours,
  currentOrders,
  className = ''
}: MechanicCapacityIndicatorProps) {
  const hoursPercentage = (currentHours / maxHours) * 100
  
  const isNearLimit = hoursPercentage >= 80
  const isAtLimit = hoursPercentage >= 100

  const getCapacityColor = () => {
    if (isAtLimit) return 'bg-red-500'
    if (isNearLimit) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getCapacityIcon = () => {
    if (isAtLimit) return '🚫'
    if (isNearLimit) return '⚠️'
    return '✅'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        <span className="text-sm">{getCapacityIcon()}</span>
        <span className="text-sm font-medium">
          {mechanicName}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="w-20 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getCapacityColor()}`}
            style={{ width: `${Math.min(hoursPercentage, 100)}%` }}
          />
        </div>
        
        <span className="text-xs font-medium">
          {currentHours}h/{maxHours}h ({currentOrders} órdenes)
        </span>
      </div>
      
      {isAtLimit && (
        <span className="text-xs text-red-500 font-medium">
          Límite de 8h alcanzado
        </span>
      )}
      
      {isNearLimit && !isAtLimit && (
        <span className="text-xs text-yellow-500 font-medium">
          Cerca del límite
        </span>
      )}
    </div>
  )
}

interface MechanicCapacityListProps {
  mechanics: Array<{
    id: string
    name: string
    currentHours: number
    maxHours: number
    currentOrders: number
  }>
  className?: string
}

export function MechanicCapacityList({ mechanics, className = '' }: MechanicCapacityListProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-700 mb-2">
        Capacidad de Mecánicos (por horas)
      </h4>
      
      {mechanics.length === 0 ? (
        <p className="text-sm text-gray-500">No hay mecánicos disponibles</p>
      ) : (
        mechanics.map((mechanic) => (
          <MechanicCapacityIndicator
            key={mechanic.id}
            mechanicName={mechanic.name}
            currentHours={mechanic.currentHours}
            maxHours={mechanic.maxHours}
            currentOrders={mechanic.currentOrders}
          />
        ))
      )}
    </div>
  )
}