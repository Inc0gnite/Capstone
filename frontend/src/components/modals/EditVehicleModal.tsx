import { useEffect, useState } from 'react'
import { vehicleService } from '../../services/vehicleService'

interface EditVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  vehicle: {
    id: string
    licensePlate: string
    brand: string
    model?: string
    year: number
    vin?: string
    fleetNumber?: string
    vehicleType?: string
    status?: string
  } | null
}

export function EditVehicleModal({ isOpen, onClose, onSuccess, vehicle }: EditVehicleModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState<number | ''>('')
  const [vin, setVin] = useState('')
  const [fleetNumber, setFleetNumber] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (isOpen && vehicle) {
      setError(null)
      setBrand(vehicle.brand || '')
      setModel(vehicle.model || '')
      setYear(vehicle.year || '')
      setVin(vehicle.vin || '')
      setFleetNumber(vehicle.fleetNumber || '')
      setVehicleType((vehicle as any).vehicleType || '')
      setStatus((vehicle as any).status || '')
    }
  }, [isOpen, vehicle])

  const handleSave = async () => {
    if (!vehicle) return

    try {
      setLoading(true)
      setError(null)

      const payload: any = {
        brand: brand || undefined,
        model: model || undefined,
        year: year === '' ? undefined : Number(year),
        vin: vin || undefined,
        fleetNumber: fleetNumber || undefined,
        vehicleType: vehicleType || undefined,
        status: status || undefined,
      }

      await vehicleService.update(vehicle.id, payload)
      onSuccess()
      onClose()
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Error al actualizar el vehículo'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    onClose()
  }

  if (!isOpen || !vehicle) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">✏️ Editar Vehículo - {vehicle.licensePlate}</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-800 border border-red-300 rounded">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Toyota"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Corolla"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="2020"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
              <input
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="1HGCM82633A004352"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Flota</label>
              <input
                value={fleetNumber}
                onChange={(e) => setFleetNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="F-123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <input
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Sedán"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin cambio</option>
                <option value="active">Activo</option>
                <option value="in_maintenance">En mantenimiento</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-3">
          <button onClick={handleClose} className="px-4 py-2 text-gray-600 hover:text-gray-800" disabled={loading}>Cancelar</button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white ${loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}


