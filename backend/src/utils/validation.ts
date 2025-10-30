/**
 * Utilidades de validación
 */

/**
 * Valida formato de RUT chileno
 * Formato: 12345678-9 o 12.345.678-9
 */
export function validateRUT(rut: string): boolean {
  // Remover puntos y guión
  const cleanRUT = rut.replace(/\./g, '').replace(/-/g, '')
  
  if (cleanRUT.length < 8 || cleanRUT.length > 9) {
    return false
  }

  const body = cleanRUT.slice(0, -1)
  const dv = cleanRUT.slice(-1).toLowerCase()

  // Calcular dígito verificador
  let sum = 0
  let multiplier = 2

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i)) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const expectedDV = 11 - (sum % 11)
  const finalDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'k' : expectedDV.toString()

  return dv === finalDV
}

/**
 * Formatea RUT a formato estándar (12.345.678-9)
 */
export function formatRUT(rut: string): string {
  const cleanRUT = rut.replace(/\./g, '').replace(/-/g, '')
  const body = cleanRUT.slice(0, -1)
  const dv = cleanRUT.slice(-1)

  // Agregar puntos cada 3 dígitos
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${formattedBody}-${dv}`
}

/**
 * Valida formato de email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida formato de patente chilena
 * Formatos: ABCD12, AB1234, ABCD-12, AB-1234
 */
export function validateLicensePlate(plate: string): boolean {
  const plateRegex = /^[A-Z]{2,4}-?\d{2,4}$/
  return plateRegex.test(plate.toUpperCase())
}

/**
 * Valida contraseña segura
 * Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una mayúscula')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una minúscula')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Valida formato de teléfono chileno
 * Formatos: +56912345678, 912345678, +56 9 1234 5678
 */
export function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\s/g, '').replace(/\+/g, '')
  const phoneRegex = /^(56)?9\d{8}$/
  return phoneRegex.test(cleanPhone)
}


