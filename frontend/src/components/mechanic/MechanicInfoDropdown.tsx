import { useState, useRef, useEffect } from 'react'

interface Mechanic {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  specialties?: string[]
  isActive?: boolean
  hasActiveOrder?: boolean
}

interface MechanicInfoDropdownProps {
  mechanic: Mechanic
  children: React.ReactNode
}

export function MechanicInfoDropdown({ mechanic, children }: MechanicInfoDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const formatSpecialties = (specialties?: string[]) => {
    if (!specialties || specialties.length === 0) return 'Sin especialidades'
    return specialties.join(', ')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón que activa el dropdown */}
      <div onClick={toggleDropdown}>
        {children}
      </div>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header del mecánico */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {mechanic.firstName.charAt(0)}{mechanic.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {mechanic.firstName} {mechanic.lastName}
                </h3>
                <p className="text-blue-100 text-sm">Mecánico</p>
              </div>
            </div>
          </div>

          {/* Información detallada */}
          <div className="p-4 space-y-4">
            {/* Información básica */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Información Personal</h4>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm">📧</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{mechanic.email}</p>
                  </div>
                </div>

                {mechanic.phone && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm">📞</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Teléfono</p>
                      <p className="text-sm font-medium text-gray-900">{mechanic.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm">🆔</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">ID</p>
                    <p className="text-sm font-medium text-gray-900 font-mono">{mechanic.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Especialidades */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Especialidades</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">{formatSpecialties(mechanic.specialties)}</p>
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Estado</h4>
              <div className="space-y-2">
                {/* Estado del usuario en el sistema */}
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${mechanic.isActive !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-medium ${mechanic.isActive !== false ? 'text-green-700' : 'text-red-700'}`}>
                    {mechanic.isActive !== false ? 'Usuario Activo' : 'Usuario Inactivo'}
                  </span>
                </div>
                {/* Estado de trabajo */}
                {mechanic.hasActiveOrder !== undefined && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${mechanic.hasActiveOrder ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className={`text-sm font-medium ${mechanic.hasActiveOrder ? 'text-blue-700' : 'text-gray-700'}`}>
                      {mechanic.hasActiveOrder ? '🔧 En Trabajo (Tiene orden activa)' : '✅ Disponible (Sin órdenes activas)'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer con acciones */}
          <div className="bg-gray-50 px-4 py-3 rounded-b-lg border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
