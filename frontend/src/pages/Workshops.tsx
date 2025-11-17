import { useEffect, useMemo, useState } from 'react'
import { MainLayout } from '../components/Layout/MainLayout'
import { workshopService, type Workshop } from '../services/workshopService'
import { regionService } from '../services/regionService'

interface Region {
  id: string
  code: string
  name: string
  isActive: boolean
}

export default function Workshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [mutatingId, setMutatingId] = useState<string>('')
  const [showEdit, setShowEdit] = useState(false)
  const [editWorkshop, setEditWorkshop] = useState<Workshop | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createWorkshop, setCreateWorkshop] = useState<{
    code: string
    name: string
    regionId: string
    address: string
    city: string
    phone: string
    capacity: string
  }>({
    code: '',
    name: '',
    regionId: '',
    address: '',
    city: '',
    phone: '',
    capacity: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const [wsRes, regionsRes] = await Promise.all([
          workshopService.getAll(),
          regionService.getAll(),
        ])
        // El backend devuelve { success: true, data: [...] }
        // workshopService.getAll() devuelve res.data del axios, que es { success: true, data: [...] }
        setWorkshops(wsRes?.data || [])
        setRegions(regionsRes?.data || [])
      } catch (err: any) {
        console.error('❌ Error cargando talleres:', err)
        setError('No fue posible cargar los talleres.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const reload = async () => {
    try {
      setLoading(true)
      const res = await workshopService.getAll()
      setWorkshops(res?.data || [])
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let result = workshops
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.code.toLowerCase().includes(q) ||
          w.city.toLowerCase().includes(q) ||
          w.address.toLowerCase().includes(q) ||
          w.region?.name.toLowerCase().includes(q)
      )
    }
    if (selectedRegion) {
      result = result.filter((w) => w.regionId === selectedRegion)
    }
    return result
  }, [workshops, search, selectedRegion])

  const toggleActive = async (workshop: Workshop) => {
    try {
      setMutatingId(workshop.id)
      await workshopService.update(workshop.id, { isActive: !workshop.isActive })
      setWorkshops((prev) =>
        prev.map((w) => (w.id === workshop.id ? { ...w, isActive: !w.isActive } : w))
      )
    } catch (err) {
      console.error('❌ Error cambiando estado:', err)
      alert('No fue posible actualizar el estado del taller')
    } finally {
      setMutatingId('')
    }
  }

  const openEdit = (w: Workshop) => {
    setEditWorkshop(w)
    setShowEdit(true)
  }

  const saveEdit = async () => {
    if (!editWorkshop) return
    try {
      setMutatingId(editWorkshop.id)
      const payload: any = {
        name: editWorkshop.name,
        regionId: editWorkshop.regionId,
        address: editWorkshop.address,
        city: editWorkshop.city,
        phone: editWorkshop.phone || undefined,
        capacity: editWorkshop.capacity ? parseInt(String(editWorkshop.capacity)) : undefined,
      }
      await workshopService.update(editWorkshop.id, payload)
      setWorkshops((prev) =>
        prev.map((w) =>
          w.id === editWorkshop.id
            ? {
                ...w,
                ...editWorkshop,
                region: regions.find((r) => r.id === payload.regionId) || w.region,
              }
            : w
        )
      )
      setShowEdit(false)
    } catch (err: any) {
      console.error('❌ Error actualizando taller:', err)
      alert(err?.response?.data?.error || err?.message || 'No fue posible actualizar el taller')
    } finally {
      setMutatingId('')
    }
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Talleres</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              ➕ Agregar Taller
            </button>
            <button
              onClick={reload}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
              title="Actualizar datos"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-4 bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Buscar</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, código, ciudad, dirección..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Región</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Todas las regiones</option>
                {regions
                  .filter((r) => r.isActive)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow">
              <table className="min-w-full table-fixed text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="px-4 py-2">Código</th>
                    <th className="px-4 py-2">Nombre</th>
                    <th className="px-4 py-2">Región</th>
                    <th className="px-4 py-2">Ciudad</th>
                    <th className="px-4 py-2">Dirección</th>
                    <th className="px-4 py-2">Teléfono</th>
                    <th className="px-4 py-2">Capacidad</th>
                    <th className="px-4 py-2">Usuarios</th>
                    <th className="px-4 py-2">Estado</th>
                    <th className="px-4 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((w) => (
                      <tr key={w.id} className="border-t align-top">
                        <td className="px-4 py-2 font-mono text-xs break-words">
                          {w.code}
                        </td>
                        <td className="px-4 py-2 font-medium break-words">{w.name}</td>
                        <td className="px-4 py-2 break-words">{w.region?.name || '—'}</td>
                        <td className="px-4 py-2 break-words">{w.city}</td>
                        <td className="px-4 py-2 break-words">{w.address}</td>
                        <td className="px-4 py-2 break-words">{w.phone || '—'}</td>
                        <td className="px-4 py-2">{w.capacity || '—'}</td>
                        <td className="px-4 py-2">
                          {w._count?.users || 0}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              w.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {w.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right space-x-2">
                          <button
                            onClick={() => toggleActive(w)}
                            disabled={mutatingId === w.id}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              w.isActive
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            } disabled:opacity-50`}
                          >
                            {mutatingId === w.id ? '...' : w.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => openEdit(w)}
                            className="px-3 py-1 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
                        No hay talleres
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal de edición */}
            {showEdit && editWorkshop && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar Taller</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Código</label>
                      <input
                        value={editWorkshop.code}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Nombre</label>
                      <input
                        value={editWorkshop.name}
                        onChange={(e) => setEditWorkshop({ ...editWorkshop, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Región</label>
                      <select
                        value={editWorkshop.regionId}
                        onChange={(e) =>
                          setEditWorkshop({ ...editWorkshop, regionId: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">Selecciona una región</option>
                        {regions
                          .filter((r) => r.isActive)
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Ciudad</label>
                      <input
                        value={editWorkshop.city}
                        onChange={(e) => setEditWorkshop({ ...editWorkshop, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">Dirección</label>
                      <input
                        value={editWorkshop.address}
                        onChange={(e) =>
                          setEditWorkshop({ ...editWorkshop, address: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
                      <input
                        value={editWorkshop.phone || ''}
                        onChange={(e) =>
                          setEditWorkshop({ ...editWorkshop, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Capacidad</label>
                      <input
                        type="number"
                        value={editWorkshop.capacity || ''}
                        onChange={(e) =>
                          setEditWorkshop({
                            ...editWorkshop,
                            capacity: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-2">
                    <button
                      onClick={() => setShowEdit(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={mutatingId === editWorkshop.id}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de creación */}
            {showCreate && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Taller</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Código *</label>
                      <input
                        value={createWorkshop.code}
                        onChange={(e) =>
                          setCreateWorkshop({ ...createWorkshop, code: e.target.value.toUpperCase() })
                        }
                        placeholder="Ej: TAL-001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Nombre *</label>
                      <input
                        value={createWorkshop.name}
                        onChange={(e) =>
                          setCreateWorkshop({ ...createWorkshop, name: e.target.value })
                        }
                        placeholder="Ej: Taller Central"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Región *</label>
                      <select
                        value={createWorkshop.regionId}
                        onChange={(e) =>
                          setCreateWorkshop({ ...createWorkshop, regionId: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">Selecciona una región</option>
                        {regions
                          .filter((r) => r.isActive)
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Ciudad *</label>
                      <input
                        value={createWorkshop.city}
                        onChange={(e) =>
                          setCreateWorkshop({ ...createWorkshop, city: e.target.value })
                        }
                        placeholder="Ej: Santiago"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">Dirección *</label>
                      <input
                        value={createWorkshop.address}
                        onChange={(e) =>
                          setCreateWorkshop({ ...createWorkshop, address: e.target.value })
                        }
                        placeholder="Ej: Av. Principal 123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
                      <input
                        value={createWorkshop.phone}
                        onChange={(e) =>
                          setCreateWorkshop({ ...createWorkshop, phone: e.target.value })
                        }
                        placeholder="Ej: +56 9 1234 5678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Capacidad</label>
                      <input
                        type="number"
                        value={createWorkshop.capacity}
                        onChange={(e) =>
                          setCreateWorkshop({ ...createWorkshop, capacity: e.target.value })
                        }
                        placeholder="Ej: 50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setShowCreate(false)
                        setCreateWorkshop({
                          code: '',
                          name: '',
                          regionId: '',
                          address: '',
                          city: '',
                          phone: '',
                          capacity: '',
                        })
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          if (
                            !createWorkshop.code ||
                            !createWorkshop.name ||
                            !createWorkshop.regionId ||
                            !createWorkshop.address ||
                            !createWorkshop.city
                          ) {
                            alert('Completa todos los campos obligatorios')
                            return
                          }
                          setLoading(true)
                          const payload: any = {
                            code: createWorkshop.code,
                            name: createWorkshop.name,
                            regionId: createWorkshop.regionId,
                            address: createWorkshop.address,
                            city: createWorkshop.city,
                          }
                          if (createWorkshop.phone) {
                            payload.phone = createWorkshop.phone
                          }
                          if (createWorkshop.capacity) {
                            payload.capacity = parseInt(createWorkshop.capacity)
                          }
                          const created = await workshopService.create(payload)
                          setWorkshops((prev) => [...(prev || []), created?.data || created])
                          setShowCreate(false)
                          setCreateWorkshop({
                            code: '',
                            name: '',
                            regionId: '',
                            address: '',
                            city: '',
                            phone: '',
                            capacity: '',
                          })
                        } catch (err: any) {
                          console.error('Error creando taller:', err)
                          alert(
                            err?.response?.data?.error || err?.message || 'Error al crear el taller'
                          )
                        } finally {
                          setLoading(false)
                        }
                      }}
                      disabled={
                        !createWorkshop.code ||
                        !createWorkshop.name ||
                        !createWorkshop.regionId ||
                        !createWorkshop.address ||
                        !createWorkshop.city
                      }
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}

