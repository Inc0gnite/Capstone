/**
 * Generador de Números de Flota únicos
 * Genera números de flota en formato FL### o FL####
 */

/**
 * Genera un número de flota aleatorio
 * Formato: FL seguido de 3-4 dígitos
 */
export function generateRandomFleetNumber(): string {
  // Generar un número aleatorio entre 1 y 9999
  const number = Math.floor(Math.random() * 9999) + 1
  
  // Formatear con ceros a la izquierda (mínimo 3 dígitos, máximo 4)
  // Si es menor a 1000, usar 3 dígitos, si es mayor, usar 4
  const formattedNumber = number.toString().padStart(number < 1000 ? 3 : 4, '0')
  
  return `FL${formattedNumber}`
}

/**
 * Genera un número de flota único verificando que no exista en la base de datos
 */
export async function generateUniqueFleetNumber(existingFleetNumbers: string[] = []): Promise<string> {
  let attempts = 0
  const maxAttempts = 1000 // Más intentos porque hay menos combinaciones
  
  // Normalizar los números existentes (sin espacios, en mayúsculas)
  const normalizedExisting = existingFleetNumbers
    .filter(fn => fn && fn.trim() !== '')
    .map(fn => fn.trim().toUpperCase())
  
  while (attempts < maxAttempts) {
    const fleetNumber = generateRandomFleetNumber()
    
    // Verificar que no exista (comparación case-insensitive)
    if (!normalizedExisting.includes(fleetNumber.toUpperCase())) {
      return fleetNumber
    }
    
    attempts++
  }
  
  // Si no se puede generar uno único después de muchos intentos,
  // usar timestamp para garantizar unicidad
  const timestamp = Date.now().toString().slice(-6) // Últimos 6 dígitos del timestamp
  const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  const uniqueFleetNumber = `FL${timestamp}${randomSuffix}`.substring(0, 7) // FL + 5 caracteres máximo
  
  return uniqueFleetNumber
}

/**
 * Valida el formato de un número de flota
 * Formato esperado: FL seguido de 3-6 dígitos
 */
export function validateFleetNumber(fleetNumber: string): boolean {
  if (!fleetNumber || fleetNumber.trim() === '') {
    return false
  }
  
  // Formato: FL seguido de 3-6 dígitos (case-insensitive)
  const fleetNumberRegex = /^FL\d{3,6}$/i
  return fleetNumberRegex.test(fleetNumber.trim())
}

