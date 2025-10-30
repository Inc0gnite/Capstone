import prisma from '../config/database'
import { hashPassword } from '../utils/auth'
import { formatRUT } from '../utils/validation'
import type { RegisterRequest } from '../types'

/**
 * Servicio de usuarios
 */
export class UserService {
  /**
   * Obtener todos los usuarios con paginación
   */
  async getAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { rut: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          role: true,
          workshop: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    // Remover passwords
    const usersWithoutPassword = users.map(({ password, ...user }) => user)

    return {
      users: usersWithoutPassword,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        workshop: true,
      },
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    // Remover password
    const { password, ...userWithoutPassword } = user

    return userWithoutPassword
  }

  /**
   * Crear usuario
   */
  async create(data: RegisterRequest) {
    const { rut, firstName, lastName, email, password, phone, roleId, workshopId } =
      data

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { rut: formatRUT(rut) }],
      },
    })

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('El email ya está registrado')
      }
      if (existingUser.rut === formatRUT(rut)) {
        throw new Error('El RUT ya está registrado')
      }
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        rut: formatRUT(rut),
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        roleId,
        workshopId,
      },
      include: {
        role: true,
        workshop: true,
      },
    })

    // Remover password
    const { password: _, ...userWithoutPassword } = user

    return userWithoutPassword
  }

  /**
   * Actualizar usuario
   */
  async update(id: string, data: Partial<RegisterRequest>) {
    const { rut, firstName, lastName, email, password, phone, roleId, workshopId } =
      data

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      throw new Error('Usuario no encontrado')
    }

    // Preparar datos de actualización
    const updateData: any = {}

    if (rut) updateData.rut = formatRUT(rut)
    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (email) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (roleId) updateData.roleId = roleId
    if (workshopId !== undefined) updateData.workshopId = workshopId
    if (password) {
      updateData.password = await hashPassword(password)
    }

    // Actualizar usuario
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
        workshop: true,
      },
    })

    // Remover password
    const { password: _, ...userWithoutPassword } = user

    return userWithoutPassword
  }

  /**
   * Eliminar usuario (soft delete)
   */
  async delete(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    // Soft delete - marcar como inactivo
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })

    return { message: 'Usuario eliminado exitosamente' }
  }

  /**
   * Restaurar usuario
   */
  async restore(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: true },
    })

    return { message: 'Usuario restaurado exitosamente' }
  }

  /**
   * Obtener usuarios por taller
   */
  async getByWorkshop(workshopId: string) {
    const users = await prisma.user.findMany({
      where: {
        workshopId,
        isActive: true,
      },
      include: {
        role: true,
      },
      orderBy: { firstName: 'asc' },
    })

    // Remover passwords
    const usersWithoutPassword = users.map(({ password, ...user }) => user)

    return usersWithoutPassword
  }

  /**
   * Obtener usuarios por rol
   */
  async getByRole(roleId: string) {
    const users = await prisma.user.findMany({
      where: {
        roleId,
        isActive: true,
      },
      include: {
        role: true,
        workshop: true,
      },
      orderBy: { firstName: 'asc' },
    })

    // Remover passwords
    const usersWithoutPassword = users.map(({ password, ...user }) => user)

    return usersWithoutPassword
  }
}

export default new UserService()


