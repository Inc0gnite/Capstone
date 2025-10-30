import prisma from '../config/database'
import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyToken,
} from '../utils/auth'
import { formatRUT } from '../utils/validation'
import type { LoginRequest, RegisterRequest } from '../types'
import jwt from 'jsonwebtoken'
import { sendPasswordResetEmail } from '../utils/email'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

/**
 * Servicio de autenticación
 */
export class AuthService {
  /**
   * Login de usuario
   */
  async login(data: LoginRequest) {
    const { email, password } = data

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        workshop: true,
      },
    })

    if (!user) {
      throw new Error('Credenciales inválidas')
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      throw new Error('Usuario inactivo')
    }

    // Verificar contraseña
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas')
    }

    // Actualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    // Generar tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
    })

    // Remover password del objeto user
    const { password: _, ...userWithoutPassword } = user

    return {
      ...tokens,
      user: userWithoutPassword,
    }
  }

  /**
   * Registro de usuario
   */
  async register(data: RegisterRequest) {
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

    // Verificar que el rol exista
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    })

    if (!role) {
      throw new Error('Rol no encontrado')
    }

    // Verificar que el taller exista (si se proporciona)
    if (workshopId) {
      const workshop = await prisma.workshop.findUnique({
        where: { id: workshopId },
      })

      if (!workshop) {
        throw new Error('Taller no encontrado')
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

    // Generar tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
    })

    // Remover password del objeto user
    const { password: _, ...userWithoutPassword } = user

    return {
      ...tokens,
      user: userWithoutPassword,
    }
  }

  /**
   * Refrescar token
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verificar refresh token
      const payload = verifyToken(refreshToken)

      // Verificar que el usuario existe y está activo
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      })

      if (!user || !user.isActive) {
        throw new Error('Usuario no autorizado')
      }

      // Generar nuevos tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        roleId: user.roleId,
      })

      return tokens
    } catch (error) {
      throw new Error('Refresh token inválido')
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    const { password: _, ...userWithoutPassword } = user

    return userWithoutPassword
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    // Verificar contraseña actual
    const isPasswordValid = await verifyPassword(oldPassword, user.password)

    if (!isPasswordValid) {
      throw new Error('Contraseña actual incorrecta')
    }

    // Hash de la nueva contraseña
    const hashedPassword = await hashPassword(newPassword)

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return { message: 'Contraseña actualizada exitosamente' }
  }

  /**
   * Solicitar recuperación de contraseña
   */
  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return { message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña' }
    }

    // Generar token JWT de uso único para recuperación
    const resetToken = jwt.sign(
      { sub: user.id, type: 'password_reset', email: user.email },
      JWT_SECRET,
      { expiresIn: '15m' }
    )

    const resetLink = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`

    // Loguear enlace en desarrollo para facilitar pruebas
    if (process.env.NODE_ENV !== 'production') {
      console.info('[DEV] Enlace de restablecimiento de contraseña:', resetLink)
    }

    // Enviar email (no fallar si SMTP no está configurado)
    try {
      await sendPasswordResetEmail(user.email, resetLink)
    } catch (err) {
      console.warn('No se pudo enviar el correo de restablecimiento. Verifique SMTP:', err)
      // Continuamos retornando respuesta genérica
    }

    return {
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
    }
  }

  /**
   * Restablecer contraseña usando token
   */
  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      if (!decoded || decoded.type !== 'password_reset' || !decoded.sub) {
        throw new Error('Token inválido')
      }

      const userId = decoded.sub as string
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) {
        throw new Error('Usuario no encontrado')
      }

      const hashedPassword = await hashPassword(newPassword)
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      })

      return { message: 'Contraseña restablecida exitosamente' }
    } catch (error) {
      throw new Error('Token inválido o expirado')
    }
  }
}

export default new AuthService()


