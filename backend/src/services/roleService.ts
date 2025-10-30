import prisma from '../config/database'

/**
 * Servicio de roles y permisos
 */
export class RoleService {
  /**
   * Obtener todos los roles
   */
  async getAll() {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return roles
  }

  /**
   * Obtener rol por ID
   */
  async getById(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
    })

    if (!role) {
      throw new Error('Rol no encontrado')
    }

    return role
  }

  /**
   * Crear rol
   */
  async create(data: { name: string; description?: string; permissions?: string[] }) {
    const { name, description, permissions } = data

    // Verificar si el rol ya existe
    const existingRole = await prisma.role.findUnique({
      where: { name },
    })

    if (existingRole) {
      throw new Error('Ya existe un rol con ese nombre')
    }

    // Crear rol
    const role = await prisma.role.create({
      data: {
        name,
        description,
      },
    })

    // Asignar permisos si se proporcionan
    if (permissions && permissions.length > 0) {
      await Promise.all(
        permissions.map((permissionId) =>
          prisma.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId,
            },
          })
        )
      )
    }

    return this.getById(role.id)
  }

  /**
   * Actualizar rol
   */
  async update(
    id: string,
    data: { name?: string; description?: string; permissions?: string[] }
  ) {
    const { name, description, permissions } = data

    const role = await prisma.role.findUnique({
      where: { id },
    })

    if (!role) {
      throw new Error('Rol no encontrado')
    }

    // Actualizar información básica
    await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
      },
    })

    // Actualizar permisos si se proporcionan
    if (permissions) {
      // Eliminar permisos existentes
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      })

      // Agregar nuevos permisos
      if (permissions.length > 0) {
        await Promise.all(
          permissions.map((permissionId) =>
            prisma.rolePermission.create({
              data: {
                roleId: id,
                permissionId,
              },
            })
          )
        )
      }
    }

    return this.getById(id)
  }

  /**
   * Eliminar rol
   */
  async delete(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    })

    if (!role) {
      throw new Error('Rol no encontrado')
    }

    // Verificar que no haya usuarios con este rol
    if (role._count.users > 0) {
      throw new Error(
        `No se puede eliminar el rol porque tiene ${role._count.users} usuario(s) asignado(s)`
      )
    }

    await prisma.role.delete({
      where: { id },
    })

    return { message: 'Rol eliminado exitosamente' }
  }

  /**
   * Obtener todos los permisos
   */
  async getAllPermissions() {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    })

    return permissions
  }

  /**
   * Crear permiso
   */
  async createPermission(data: {
    resource: string
    action: string
    description?: string
  }) {
    const { resource, action, description } = data

    // Verificar si el permiso ya existe
    const existingPermission = await prisma.permission.findFirst({
      where: { resource, action },
    })

    if (existingPermission) {
      throw new Error('Ya existe un permiso con ese recurso y acción')
    }

    const permission = await prisma.permission.create({
      data: {
        resource,
        action,
        description,
      },
    })

    return permission
  }
}

export default new RoleService()


