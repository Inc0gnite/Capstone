import { useEffect, useMemo, useState } from 'react'
import { MainLayout } from '../components/Layout/MainLayout'
import { userService, type User } from '../services/userService'
import { workOrderService } from '../services/workOrderService'
import { roleService, type Role } from '../services/roleService'
import { workshopService, type Workshop } from '../services/workshopService'

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [mutatingId, setMutatingId] = useState<string>('')
  const [showEdit, setShowEdit] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [changePassword, setChangePassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [createUser, setCreateUser] = useState<{
    firstName: string
    lastName: string
    email: string
    password: string
    roleId: string
    workshopId?: string
  }>({ firstName: '', lastName: '', email: '', password: '', roleId: '', workshopId: '' })
  const [inProgressMap, setInProgressMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const [res, rolesRes, wsRes] = await Promise.all([
          userService.getAll({ page: 1, limit: 100 }),
          roleService.getAll(),
          workshopService.getAll(),
        ])
        setUsers(res.data || [])
        setRoles((rolesRes.data || []).filter((r: Role) => r.name !== 'Encargado de Inventario'))
        setWorkshops(wsRes.data || [])
      } catch (err: any) {
        console.error('❌ Error cargando usuarios:', err)
        setError('No fue posible cargar los usuarios.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const reload = async () => {
    try {
      setLoading(true)
      const res = await userService.getAll({ page: 1, limit: 100 })
      setUsers(res.data || [])
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let result = users
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(u =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.role?.name || '').toLowerCase().includes(q)
      )
    }
    if (selectedRole) {
      result = result.filter(u => (u.role?.id || '') === selectedRole)
    }
    return result
  }, [users, search, selectedRole])

  useEffect(() => {
    const checkInProgressForInactiveMechanics = async () => {
      try {
        const targets = filtered.filter(u => !u.isActive && (u.role?.name || '').toLowerCase() === 'mecánico')
        if (targets.length === 0) return
        const results = await Promise.allSettled(targets.map(async (u) => {
          const res = await workOrderService.getAll({ assignedToId: u.id, status: 'en_progreso', limit: 1 })
          const has = (res.data || []).length > 0
          return { id: u.id, has }
        }))
        const updates: Record<string, boolean> = {}
        results.forEach(r => {
          if (r.status === 'fulfilled') {
            updates[r.value.id] = r.value.has
          }
        })
        setInProgressMap(prev => ({ ...prev, ...updates }))
      } catch (e) {
        // ignore silently in UI; table will show estado real si falla
      }
    }
    checkInProgressForInactiveMechanics()
  }, [filtered])

  const toggleActive = async (user: User) => {
    try {
      setMutatingId(user.id)
      await userService.toggleActive(user.id, !user.isActive)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u))
    } catch (err) {
      console.error('❌ Error cambiando estado:', err)
      alert('No fue posible actualizar el estado del usuario')
    } finally {
      setMutatingId('')
    }
  }

  const openEdit = (u: User) => {
    setEditUser(u)
    setShowEdit(true)
  }

  const saveEdit = async () => {
    if (!editUser) return
    try {
      setMutatingId(editUser.id)
      const payload: any = {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
        roleId: editUser.role?.id,
        workshopId: editUser.workshop?.id,
      }
      if (changePassword && newPassword.trim()) {
        payload.password = newPassword.trim()
      }
      await userService.update(editUser.id, payload)
      setUsers(prev => prev.map(u => u.id === editUser.id ? {
        ...u,
        ...editUser,
        role: payload.roleId ? { id: payload.roleId, name: roles.find(r => r.id === payload.roleId)?.name || u.role?.name || '' } : u.role,
        workshop: payload.workshopId ? { id: payload.workshopId, name: workshops.find(w => w.id === payload.workshopId)?.name || u.workshop?.name || '' } : u.workshop,
      } : u))
      setShowEdit(false)
      setChangePassword(false)
      setNewPassword('')
    } catch (err) {
      console.error('❌ Error actualizando usuario:', err)
      alert('No fue posible actualizar el usuario')
    } finally {
      setMutatingId('')
    }
  }

  const handleRoleChange = (roleId: string) => {
    setEditUser(prev => prev ? {
      ...prev,
      role: { id: roleId, name: roles.find(r => r.id === roleId)?.name || '' } as any,
    } : prev)
  }

  const handleWorkshopChange = (workshopId: string) => {
    setEditUser(prev => prev ? {
      ...prev,
      workshop: { id: workshopId, name: workshops.find(w => w.id === workshopId)?.name || '' } as any,
    } : prev)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Usuarios</h2>
            <p className="text-gray-600">Gestión de usuarios del sistema</p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email o rol"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los roles</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <button
              onClick={() => setShowCreate(true)}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              ➕ Agregar usuario
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Rol</th>
                  <th className="px-4 py-2">Taller</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Creado</th>
                  <th className="px-4 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map(u => (
                    <tr key={u.id} className="border-t">
                      <td className="px-4 py-2 whitespace-nowrap">{u.firstName} {u.lastName}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">{u.role?.name || '—'}</td>
                      <td className="px-4 py-2">{u.workshop?.name || '—'}</td>
                      <td className="px-4 py-2">
                        {(() => {
                          const isMechanic = (u.role?.name || '').toLowerCase() === 'mecánico'
                          const effectiveActive = u.isActive || (isMechanic && inProgressMap[u.id])
                          return (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${effectiveActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                              {effectiveActive ? 'Activo' : 'Inactivo'}
                            </span>
                          )
                        })()}
                      </td>
                      <td className="px-4 py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={mutatingId === u.id}
                          className={`px-3 py-1 rounded text-sm font-medium ${u.isActive ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-green-600 text-white hover:bg-green-700'} disabled:opacity-50`}
                        >
                          {mutatingId === u.id ? '...' : u.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => openEdit(u)}
                          className="px-3 py-1 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('¿Eliminar este usuario?')) {
                              try {
                                setMutatingId(u.id)
                                // Si es mecánico, validar que no tenga tareas activas asignadas
                                if ((u.role?.name || '').toLowerCase() === 'mecánico') {
                                  const res = await workOrderService.getAll({ assignedToId: u.id })
                                  const orders = res.data || []
                                  const hasActive = orders.some((o: any) => ['pendiente', 'en_progreso', 'pausado'].includes(o.currentStatus))
                                  if (hasActive) {
                                    alert('No se puede eliminar: el mecánico tiene tareas asignadas.');
                                    return
                                  }
                                }
                                await userService.remove(u.id)
                                setUsers(prev => prev.filter(x => x.id !== u.id))
                              } finally {
                                setMutatingId('')
                              }
                            }
                          }}
                          className="px-3 py-1 rounded text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">No hay usuarios</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {showEdit && editUser && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar Usuario</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nombre</label>
                    <input
                      value={editUser.firstName}
                      onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Apellido</label>
                    <input
                      value={editUser.lastName}
                      onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={editUser.email}
                      onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={changePassword}
                        onChange={(e) => setChangePassword(e.target.checked)}
                      />
                      <span>Cambiar contraseña</span>
                    </label>
                    <div className="relative mt-2">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Nueva contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={!changePassword}
                        className={`w-full pr-10 px-3 py-2 border rounded-lg text-sm ${!changePassword ? 'bg-gray-100 cursor-not-allowed border-gray-200' : 'border-gray-300'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        disabled={!changePassword}
                        className={`absolute inset-y-0 right-2 my-auto text-sm ${!changePassword ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'}`}
                        title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {changePassword && newPassword && newPassword.length < 8 && (
                      <p className="text-xs text-red-600 mt-1">Mínimo 8 caracteres.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Rol</label>
                    <select
                      value={editUser.role?.id || ''}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Selecciona un rol</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Taller</label>
                    <select
                      value={editUser.workshop?.id || ''}
                      onChange={(e) => handleWorkshopChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Sin taller</option>
                      {workshops.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button onClick={() => setShowEdit(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancelar</button>
                  <button onClick={saveEdit} disabled={mutatingId === editUser.id || (changePassword && newPassword.length < 8)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Guardar</button>
                </div>
              </div>
            </div>
          )}
          {showCreate && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Usuario</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nombre</label>
                    <input value={createUser.firstName} onChange={(e)=>setCreateUser({ ...createUser, firstName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Apellido</label>
                    <input value={createUser.lastName} onChange={(e)=>setCreateUser({ ...createUser, lastName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    <input type="email" value={createUser.email} onChange={(e)=>setCreateUser({ ...createUser, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Contraseña</label>
                    <input type="password" value={createUser.password} onChange={(e)=>setCreateUser({ ...createUser, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    {createUser.password && createUser.password.length < 8 && (
                      <p className="text-xs text-red-600 mt-1">Mínimo 8 caracteres.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Rol</label>
                    <select value={createUser.roleId} onChange={(e)=>setCreateUser({ ...createUser, roleId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option value="">Selecciona un rol</option>
                      {roles.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Taller</label>
                    <select value={createUser.workshopId} onChange={(e)=>setCreateUser({ ...createUser, workshopId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option value="">Sin taller</option>
                      {workshops.map(w => (<option key={w.id} value={w.id}>{w.name}</option>))}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button onClick={()=>{setShowCreate(false)}} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancelar</button>
                  <button
                    onClick={async ()=>{
                      try {
                        if (!createUser.firstName || !createUser.lastName || !createUser.email || !createUser.password || !createUser.roleId) { alert('Completa nombre, apellido, email, contraseña y rol'); return }
                        setLoading(true)
                        const created = await userService.create(createUser)
                        setUsers(prev=>[...(prev||[]), created.data || created])
                        setShowCreate(false)
                        setCreateUser({ firstName:'', lastName:'', email:'', password:'', roleId:'', workshopId:'' })
                      } finally { setLoading(false) }
                    }}
                    disabled={createUser.password.length < 8}
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


