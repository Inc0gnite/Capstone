/**
 * Utilidades para manejo de administradores
 */

/**
 * Verifica si un usuario es el administrador supremo
 * El administrador supremo se identifica por el nombre completo "ADMIN ADMIN"
 */
export function isSuperAdmin(firstName: string, lastName: string): boolean {
  const fullName = `${firstName} ${lastName}`.trim().toUpperCase()
  return fullName === 'ADMIN ADMIN'
}

/**
 * Verifica si un usuario es administrador supremo basado en el objeto de usuario
 */
export function isSuperAdminUser(user: { firstName: string; lastName: string }): boolean {
  return isSuperAdmin(user.firstName, user.lastName)
}

