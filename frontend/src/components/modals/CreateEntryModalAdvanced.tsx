import { useState, useEffect } from 'react'
import { vehicleEntryService } from '../../services/vehicleEntryService'
import { vehicleService } from '../../services/vehicleService'
import { configService } from '../../services/configService'
import { regionCache, Region } from '../../services/regionCache'
// import { CHILE_REGIONS } from '../../data/chileRegions'
import { generateUniqueVIN } from '../../utils/vinGenerator'
import { RegionSelector } from '../forms/RegionSelector'
import { VINField } from '../forms/VINField'
import { PhotoGallery, type Photo } from '../photo/PhotoGallery'
import { useAuthStore } from '../../store/authStore'
import type { Vehicle } from '../../../../shared/types'

interface CreateEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateEntryModalAdvanced({ isOpen, onClose, onSuccess }: CreateEntryModalProps) {
  const { user } = useAuthStore()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(false)
  // const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [loadingRegions, setLoadingRegions] = useState(false)
  const [regionsLoaded, setRegionsLoaded] = useState(false)
  const [step, setStep] = useState<'vehicle' | 'driver' | 'entry'>('vehicle')
  
  // Datos del vehículo
  const [vehicleData, setVehicleData] = useState({
    licensePlate: '',
    vehicleType: 'camion',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    fleetNumber: '',
    regionId: user?.workshop?.regionId || '' // Usar región del usuario como predeterminada
  })
  
  // Datos del conductor
  const [driverData, setDriverData] = useState({
    name: '',
    rut: '',
    phone: ''
  })
  
  // Datos del ingreso
  const [entryData, setEntryData] = useState({
    entryKm: '',
    fuelLevel: 'half',
    hasKeys: true,
    keyLocation: '',
    observations: ''
  })
  
  // Vehículo creado
  const [createdVehicle, setCreatedVehicle] = useState<any>(null)
  
  // Estado para fotos
  const [photos, setPhotos] = useState<Photo[]>([])
  const [showPhotoSection, setShowPhotoSection] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadVehicles()
      loadRegions()
      resetForm()
      // Generar VIN automáticamente al abrir el modal
      setTimeout(() => {
        generateVIN()
      }, 500) // Pequeño delay para asegurar que los vehículos se carguen
    }
  }, [isOpen])

  // Protección contra cierre accidental con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        // Si hay un vehículo creado, usar handleClose que tiene confirmación
        if (createdVehicle) {
          e.preventDefault()
          handleClose()
        }
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      return () => {
        window.removeEventListener('keydown', handleEscape)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, createdVehicle])

  const loadVehicles = async () => {
    try {
      console.log('🔄 Cargando vehículos...')
      const response = await vehicleService.getAll()
      console.log('✅ Respuesta del servicio:', response)
      
      // Obtener los datos correctos de la respuesta
      const vehiclesData = response.data || response || []
      console.log('✅ Vehículos cargados:', vehiclesData.length)
      
      // Filtrar vehículos válidos y limpiar datos nulos
      const validVehicles = vehiclesData.filter((vehicle: any) => 
        vehicle && 
        vehicle.id && 
        vehicle.licensePlate && 
        vehicle.brand
      ).map((vehicle: any) => ({
        ...vehicle,
        vin: vehicle.vin || '', // Asegurar que VIN sea string
        model: vehicle.model || '', // Asegurar que model sea string
        fleetNumber: vehicle.fleetNumber || '' // Asegurar que fleetNumber sea string
      }))
      
      console.log('✅ Vehículos válidos procesados:', validVehicles.length)
      setVehicles(validVehicles)
    } catch (error) {
      console.error('❌ Error cargando vehículos:', error)
      setVehicles([]) // Usar array vacío en caso de error
    } finally {
      // setLoadingVehicles(false)
    }
  }

  const loadRegions = async () => {
    // Evitar cargas duplicadas
    if (regionsLoaded || loadingRegions) {
      console.log('🔄 Regiones ya cargadas o cargándose, omitiendo...')
      return
    }

    try {
      setLoadingRegions(true)
      console.log('🔄 Cargando regiones desde caché global...')
      
      const cachedRegions = await regionCache.getRegions()
      setRegions(cachedRegions)
      setRegionsLoaded(true)
      
      console.log('✅ Regiones cargadas desde caché global:', cachedRegions.length)
    } catch (error) {
      console.error('❌ Error cargando regiones:', error)
      
      // Fallback final con región básica
      const fallbackRegions: Region[] = [{
        id: '6784eff8-8bde-40fc-99d6-e512b7d859f7',
        code: 'RM',
        name: 'Región Metropolitana'
      }]
      
      console.log('🔄 Usando regiones de fallback:', fallbackRegions)
      setRegions(fallbackRegions)
      setRegionsLoaded(true)
    } finally {
      setLoadingRegions(false)
    }
  }

  const resetForm = () => {
    setVehicleData({
      licensePlate: '',
      vehicleType: 'camion',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      vin: '',
      fleetNumber: '',
      regionId: ''
    })
    setDriverData({
      name: '',
      rut: '',
      phone: ''
    })
    setEntryData({
      entryKm: '',
      fuelLevel: 'half',
      hasKeys: true,
      keyLocation: '',
      observations: ''
    })
    setStep('vehicle')
    setCreatedVehicle(null)
    setPhotos([])
    setShowPhotoSection(false)
  }

  // Funciones para manejar fotos
  const handleAddPhoto = (photo: Photo) => {
    setPhotos(prev => [...prev, photo])
  }

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId))
  }

  const handleUpdatePhoto = (photoId: string, description: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId ? { ...p, description } : p
    ))
  }

  const generateVIN = async () => {
    try {
      console.log('🔄 Generando VIN...')
      console.log('📋 Vehículos disponibles:', vehicles.length)
      
      // Obtener VINs existentes para evitar duplicados
      const existingVINs = vehicles
        .map(v => v.vin)
        .filter((vin): vin is string => {
          // Verificación más robusta
          if (vin === null || vin === undefined) return false
          if (typeof vin !== 'string') return false
          return vin.trim() !== ''
        })
      
      console.log('🔍 VINs existentes encontrados:', existingVINs.length)
      
      const newVIN = await generateUniqueVIN(existingVINs)
      console.log('✅ VIN generado:', newVIN)
      setVehicleData({ ...vehicleData, vin: newVIN })
    } catch (error) {
      console.error('❌ Error generando VIN:', error)
      alert('Error generando VIN. Por favor, ingrésalo manualmente.')
    }
  }

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Protección contra submit doble
    if (loading) {
      console.log('⏸️ Ya hay una operación en curso, omitiendo submit...')
      return
    }
    
    if (!vehicleData.licensePlate || !vehicleData.brand || !vehicleData.regionId) {
      alert('Por favor completa todos los campos obligatorios del vehículo')
      return
    }

    try {
      setLoading(true)
      console.log('🚗 Creando vehículo con datos:', vehicleData)
      console.log('🏛️ Región seleccionada:', vehicleData.regionId)
      console.log('📋 Regiones disponibles:', regions)
      console.log('👤 Región del usuario:', user?.workshop?.regionId)
      
      // Determinar la región final a usar - Priorizar región del usuario
      let finalRegionId = user?.workshop?.regionId || vehicleData.regionId
      
      // Si no tenemos región del usuario, usar la región seleccionada
      if (!finalRegionId && vehicleData.regionId) {
        finalRegionId = vehicleData.regionId
      }
      
      // Si aún no tenemos región válida, usar la primera región disponible del backend
      if (!finalRegionId && regions.length > 0) {
        finalRegionId = regions[0].id
        console.log('🔄 Usando primera región disponible del backend:', finalRegionId)
      }
      
      console.log('✅ Región final seleccionada:', finalRegionId)
      
      // Preparar datos del vehículo (asegurar que model sea string vacío si no se proporciona)
      let finalVIN = vehicleData.vin
      if (!finalVIN || finalVIN.trim() === '') {
        // Generar VIN si no está presente
        const existingVINs = vehicles
          .map(v => v.vin)
          .filter((vin): vin is string => vin !== undefined && vin.trim() !== '')
        finalVIN = await generateUniqueVIN(existingVINs)
      }
      
      const vehicleCreateData = {
        licensePlate: vehicleData.licensePlate,
        vehicleType: vehicleData.vehicleType,
        brand: vehicleData.brand,
        model: vehicleData.model || '', // Asegurar que model sea string
        year: vehicleData.year,
        vin: finalVIN, // Usar VIN generado o existente
        fleetNumber: vehicleData.fleetNumber || '', // Asegurar que fleetNumber sea string
        regionId: finalRegionId // Usar región válida
      }
      
      console.log('📤 Datos finales para crear vehículo:', vehicleCreateData)
      
      // Validación final de región
      if (!finalRegionId) {
        console.error('❌ No se pudo determinar una región válida')
        alert('Error: No se pudo determinar una región válida. Por favor, contacta al administrador.')
        return
      }
      
      // Crear el vehículo
      const newVehicle = await vehicleService.create(vehicleCreateData)
      console.log('Vehículo creado:', newVehicle)
      
      // Guardar el vehículo creado
      setCreatedVehicle(newVehicle)
      
      // Actualizar la lista de vehículos
      await loadVehicles()
      
      // Pasar al siguiente paso
      setStep('driver')
    } catch (error: any) {
      console.error('Error creando vehículo:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error desconocido'
      
      if (errorMessage.includes('Ya existe un vehículo con esa patente')) {
        alert(`❌ Error: Ya existe un vehículo con la patente ${vehicleData.licensePlate}.\n\n💡 Sugerencia: Intenta con una patente diferente como ${vehicleData.licensePlate}1 o ${vehicleData.licensePlate}A`)
      } else if (errorMessage.includes('Región no encontrada')) {
        alert('Error: La región seleccionada no es válida. Por favor, contacta al administrador del sistema.')
        console.error('❌ Error de región:', {
          regionId: vehicleData.regionId,
          availableRegions: regions.map(r => ({ id: r.id, code: r.code, name: r.name }))
        })
      } else {
        alert('Error al crear el vehículo: ' + errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!driverData.name || !driverData.rut) {
      alert('Por favor completa todos los campos obligatorios del conductor')
      return
    }

    // Pasar al siguiente paso
    setStep('entry')
  }

  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Protección contra submit doble
    if (loading) {
      console.log('⏸️ Ya hay una operación en curso, omitiendo submit...')
      return
    }
    
    if (!entryData.entryKm) {
      alert('Por favor completa todos los campos obligatorios del ingreso')
      return
    }

    try {
      setLoading(true)
      console.log('Creando ingreso con datos:', { vehicleData, driverData, entryData })
      
      // Usar el workshopId del usuario actual directamente
      const workshopId = user?.workshopId || user?.workshop?.id
      console.log('🏭 Workshop ID del usuario:', workshopId)
      
      // Usar el vehículo recién creado
      const vehicle = createdVehicle
      if (!vehicle) {
        throw new Error('No se pudo encontrar el vehículo creado')
      }
      
      const entryDataToSend = {
        vehicleId: vehicle.id,
        workshopId: workshopId,
        driverRut: driverData.rut,
        driverName: driverData.name,
        driverPhone: driverData.phone || undefined,
        entryKm: parseInt(entryData.entryKm),
        fuelLevel: entryData.fuelLevel,
        hasKeys: entryData.hasKeys,
        keyLocation: entryData.hasKeys ? entryData.keyLocation : undefined,
        observations: entryData.observations || undefined,
        createdById: user?.id || ''
      }
      
      console.log('📤 Datos finales para crear ingreso:', entryDataToSend)
      
      const createdEntry = await vehicleEntryService.create(entryDataToSend)
      
      // Si llegamos aquí, el ingreso se creó exitosamente
      // El vehículo ya no necesita ser eliminado en caso de error
      setCreatedVehicle(null)
      
      // Emitir evento para actualizar estadísticas
      window.dispatchEvent(new CustomEvent('entry-created'))
      
      // Subir fotos si hay alguna (opcional, no bloquea el proceso)
      if (photos.length > 0 && createdEntry?.id) {
        try {
          console.log('📸 Subiendo fotos del ingreso...')
          // Las fotos se suben después del ingreso para no bloquear el proceso principal
          // Esto se puede hacer en background
          window.dispatchEvent(new CustomEvent('entry-photos-pending', { 
            detail: { entryId: createdEntry.id, photos } 
          }))
        } catch (photoError) {
          console.error('⚠️ Error subiendo fotos (no crítico):', photoError)
          // No fallar el proceso si las fotos no se suben
        }
      }
      
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      console.error('❌ Error creando ingreso:', error)
      
      // ROLLBACK: Eliminar el vehículo creado si falla el ingreso
      // Esto asegura que no queden datos huérfanos en el sistema
      if (createdVehicle) {
        try {
          console.log('🔄 Iniciando rollback: eliminando vehículo creado debido a error en ingreso...')
          console.log('📋 Vehículo a eliminar:', {
            id: createdVehicle.id,
            licensePlate: createdVehicle.licensePlate
          })
          
          await vehicleService.delete(createdVehicle.id)
          console.log('✅ Rollback exitoso: vehículo eliminado correctamente')
          
          // Limpiar el vehículo creado del estado
          setCreatedVehicle(null)
          
          // Actualizar la lista de vehículos
          await loadVehicles()
          
          const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error desconocido'
          alert(`❌ Error al crear el ingreso: ${errorMessage}\n\n✅ El vehículo ha sido eliminado automáticamente para mantener la integridad de los datos.`)
        } catch (deleteError: any) {
          console.error('❌ Error crítico en rollback:', deleteError)
          
          // Si no se puede eliminar, informar al usuario con detalles
          const deleteErrorMessage = deleteError.response?.data?.error || deleteError.message
          const originalErrorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error desconocido'
          
          if (deleteError.response?.status === 403) {
            alert(`❌ Error al crear el ingreso: ${originalErrorMessage}\n\n⚠️ CRÍTICO: El vehículo fue creado pero no se pudo eliminar automáticamente (sin permisos).\n\n📋 Vehículo huérfano creado:\n- Patente: ${createdVehicle.licensePlate}\n- ID: ${createdVehicle.id}\n\n🚨 Contacta al administrador INMEDIATAMENTE para eliminar este vehículo huérfano.`)
          } else {
            alert(`❌ Error al crear el ingreso: ${originalErrorMessage}\n\n⚠️ CRÍTICO: El vehículo fue creado pero no se pudo eliminar automáticamente.\n\n📋 Vehículo huérfano creado:\n- Patente: ${createdVehicle.licensePlate}\n- ID: ${createdVehicle.id}\n\n🚨 Contacta al administrador INMEDIATAMENTE para resolver este problema.`)
          }
        }
      } else {
        // Si no hay vehículo creado, solo mostrar el error
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error desconocido'
        alert(`❌ Error al crear el ingreso: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    // Verificar si hay fotos sin guardar
    const hasUnsavedPhotos = photos.length > 0
    
    // Si hay un vehículo creado pero no se completó el ingreso, preguntar al usuario
    if (createdVehicle) {
      let confirmMessage = step === 'entry' 
        ? '¿Estás seguro de cerrar? El vehículo ya fue creado pero el ingreso no se ha registrado. El vehículo será eliminado automáticamente.'
        : '¿Estás seguro de cerrar? El vehículo ya fue creado y será eliminado automáticamente.'
      
      // Agregar advertencia sobre fotos si las hay
      if (hasUnsavedPhotos) {
        confirmMessage += `\n\n⚠️ ADVERTENCIA: Tienes ${photos.length} ${photos.length === 1 ? 'foto' : 'fotos'} sin guardar que se perderán al cerrar.`
      }
      
      if (!confirm(confirmMessage)) {
        return // El usuario canceló el cierre
      }
      
      // Eliminar el vehículo creado
      console.log('🔄 Eliminando vehículo creado al cerrar modal...')
      vehicleService.delete(createdVehicle.id)
        .then(() => {
          console.log('✅ Vehículo eliminado correctamente al cerrar')
        })
        .catch(error => {
          console.error('❌ Error eliminando vehículo al cerrar:', error)
          alert('⚠️ El vehículo fue creado pero no se pudo eliminar automáticamente. Contacta al administrador.')
        })
    } else if (hasUnsavedPhotos) {
      // Si no hay vehículo pero hay fotos, advertir
      const confirmMessage = `¿Estás seguro de cerrar?\n\n⚠️ ADVERTENCIA: Tienes ${photos.length} ${photos.length === 1 ? 'foto' : 'fotos'} sin guardar que se perderán al cerrar.`
      
      if (!confirm(confirmMessage)) {
        return // El usuario canceló el cierre
      }
    }
    
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2 sm:p-4">
      <div className="relative top-2 sm:top-4 md:top-10 mx-auto p-3 sm:p-4 md:p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="mt-1 sm:mt-3">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              Registrar Nuevo Ingreso Completo
            </h3>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Cerrar"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Indicador de pasos */}
          <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8 overflow-x-auto pb-2">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-max">
              <div className={`flex items-center space-x-1 sm:space-x-2 ${step === 'vehicle' ? 'text-blue-600' : step === 'driver' || step === 'entry' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step === 'vehicle' ? 'bg-blue-600 text-white' : step === 'driver' || step === 'entry' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  <span className="text-xs sm:text-sm font-bold">1</span>
                </div>
                <span className="text-xs sm:text-sm font-medium hidden xs:inline">Vehículo</span>
              </div>
              <div className={`w-4 sm:w-8 h-0.5 ${step === 'driver' || step === 'entry' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center space-x-1 sm:space-x-2 ${step === 'driver' ? 'text-blue-600' : step === 'entry' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step === 'driver' ? 'bg-blue-600 text-white' : step === 'entry' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  <span className="text-xs sm:text-sm font-bold">2</span>
                </div>
                <span className="text-xs sm:text-sm font-medium hidden xs:inline">Conductor</span>
              </div>
              <div className={`w-4 sm:w-8 h-0.5 ${step === 'entry' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center space-x-1 sm:space-x-2 ${step === 'entry' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step === 'entry' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  <span className="text-xs sm:text-sm font-bold">3</span>
                </div>
                <span className="text-xs sm:text-sm font-medium hidden xs:inline">Ingreso</span>
              </div>
            </div>
          </div>

          {/* Paso 1: Datos del Vehículo */}
          {step === 'vehicle' && (
            <form onSubmit={handleVehicleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Patente *
                  </label>
                  <input
                    type="text"
                    value={vehicleData.licensePlate}
                    onChange={(e) => setVehicleData({ ...vehicleData, licensePlate: e.target.value.toUpperCase() })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ABCD12"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Tipo de Vehículo *
                  </label>
                  <select
                    value={vehicleData.vehicleType}
                    onChange={(e) => setVehicleData({ ...vehicleData, vehicleType: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="camion">Camión</option>
                    <option value="furgon">Furgón</option>
                    <option value="pickup">Pickup</option>
                    <option value="automovil">Automóvil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Marca *
                  </label>
                  <input
                    type="text"
                    value={vehicleData.brand}
                    onChange={(e) => setVehicleData({ ...vehicleData, brand: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Toyota"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={vehicleData.model}
                    onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Hilux (opcional)"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Año
                  </label>
                  <input
                    type="number"
                    value={vehicleData.year}
                    onChange={(e) => setVehicleData({ ...vehicleData, year: parseInt(e.target.value) })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Región *
                  </label>
                  <RegionSelector
                    value={vehicleData.regionId}
                    onChange={(regionId) => setVehicleData({ ...vehicleData, regionId })}
                    required
                    disabled={loadingRegions}
                    regions={regions}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {loadingRegions ? 'Cargando regiones...' : 
                     regions.length === 0 ? 'No hay regiones disponibles' :
                     `${regions.length} regiones disponibles`}
                  </p>
                  {regions.length === 0 && !loadingRegions && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      ⚠️ No se pudieron cargar las regiones. Verifica la conexión con el servidor.
                      <button
                        type="button"
                        onClick={loadRegions}
                        className="ml-2 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        🔄 Reintentar
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    VIN
                  </label>
                  <VINField
                    value={vehicleData.vin}
                    onChange={(vin) => setVehicleData({ ...vehicleData, vin })}
                    existingVINs={vehicles.map(v => v.vin).filter((vin): vin is string => vin !== undefined && vin !== null && vin.trim() !== '')}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El VIN se genera automáticamente y es único para cada vehículo
                  </p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Número de Flota
                  </label>
                  <input
                    type="text"
                    value={vehicleData.fleetNumber}
                    onChange={(e) => setVehicleData({ ...vehicleData, fleetNumber: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="FL001"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 sm:space-x-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{loading ? 'Creando vehículo...' : <><span className="hidden sm:inline">Siguiente: </span>Conductor</>}</span>
                </button>
              </div>
            </form>
          )}

          {/* Paso 2: Datos del Conductor */}
          {step === 'driver' && (
            <form onSubmit={handleDriverSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Nombre del Conductor *
                  </label>
                  <input
                    type="text"
                    value={driverData.name}
                    onChange={(e) => setDriverData({ ...driverData, name: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    RUT *
                  </label>
                  <input
                    type="text"
                    value={driverData.rut}
                    onChange={(e) => setDriverData({ ...driverData, rut: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12.345.678-9"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={driverData.phone}
                    onChange={(e) => setDriverData({ ...driverData, phone: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+56912345678"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setStep('vehicle')}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <span className="hidden sm:inline">← Anterior: </span>Vehículo
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <span className="hidden sm:inline">Siguiente: </span>Ingreso<span className="hidden sm:inline"> →</span>
                </button>
              </div>
            </form>
          )}

          {/* Paso 3: Datos del Ingreso */}
          {step === 'entry' && (
            <form onSubmit={handleEntrySubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Kilometraje de Ingreso *
                  </label>
                  <input
                    type="number"
                    value={entryData.entryKm}
                    onChange={(e) => setEntryData({ ...entryData, entryKm: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Nivel de Combustible
                  </label>
                  <select
                    value={entryData.fuelLevel}
                    onChange={(e) => setEntryData({ ...entryData, fuelLevel: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="empty">Vacío</option>
                    <option value="quarter">1/4</option>
                    <option value="half">1/2</option>
                    <option value="three-quarters">3/4</option>
                    <option value="full">Lleno</option>
                  </select>
                </div>
              </div>

              {/* Control de Llaves */}
              <div className="space-y-2 sm:space-y-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Control de Llaves
                </label>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={entryData.hasKeys}
                      onChange={(e) => setEntryData({ ...entryData, hasKeys: e.target.checked })}
                      className="mr-2 w-4 h-4 sm:w-5 sm:h-5"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">¿Tiene llaves?</span>
                  </label>
                </div>
                {entryData.hasKeys && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Ubicación de las Llaves
                    </label>
                    <input
                      type="text"
                      value={entryData.keyLocation}
                      onChange={(e) => setEntryData({ ...entryData, keyLocation: e.target.value })}
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Oficina principal"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Observaciones
                </label>
                <textarea
                  value={entryData.observations}
                  onChange={(e) => setEntryData({ ...entryData, observations: e.target.value })}
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Observaciones adicionales..."
                />
              </div>

              {/* Sección de Fotografías */}
              <div className="border-t pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">📸 Fotografías del Vehículo</h3>
                  <button
                    type="button"
                    onClick={() => setShowPhotoSection(!showPhotoSection)}
                    className="flex items-center gap-1 sm:gap-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
                  >
                    {showPhotoSection ? 'Ocultar' : 'Mostrar'} Fotos
                    <span className="text-xs">
                      ({photos.length} {photos.length === 1 ? 'foto' : 'fotos'})
                    </span>
                  </button>
                </div>
                
                {showPhotoSection && (
                  <PhotoGallery
                    entryId="temp-entry" // ID temporal para el modal
                    photos={photos}
                    onAddPhoto={handleAddPhoto}
                    onDeletePhoto={handleDeletePhoto}
                    onUpdatePhoto={handleUpdatePhoto}
                  />
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setStep('driver')}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <span className="hidden sm:inline">← Anterior: </span>Conductor
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{loading ? 'Registrando ingreso...' : 'Registrar Ingreso'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

