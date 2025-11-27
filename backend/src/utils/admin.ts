/**
 * Utilidades para manejo de administradores
 */

/**
 * Email del administrador supremo
 */
export const SUPER_ADMIN_EMAIL = 'admin@pepsico.cl'

/**
 * Verifica si un usuario es el administrador supremo
 * El administrador supremo se identifica por el nombre completo "ADMIN ADMIN"
 * o por el email "admin@pepsico.cl"
 */
export function isSuperAdmin(firstName: string, lastName: string, email?: string): boolean {
  const fullName = `${firstName} ${lastName}`.trim().toUpperCase()
  const isNameMatch = fullName === 'ADMIN ADMIN'
  const isEmailMatch = email && email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
  return isNameMatch || isEmailMatch || false
}

/**
 * Verifica si un usuario es administrador supremo basado en el objeto de usuario
 */
export function isSuperAdminUser(user: { firstName: string; lastName: string; email?: string }): boolean {
  return isSuperAdmin(user.firstName, user.lastName, user.email)
}

/**
 * Verifica si un email pertenece al administrador supremo
 */
export function isSuperAdminEmail(email: string): boolean {
  return email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
}

