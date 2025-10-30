/**
 * Generador de VIN (Vehicle Identification Number) único
 * Genera VINs de 17 caracteres siguiendo el estándar ISO 3779
 */

// Caracteres permitidos en VIN (excluyendo I, O, Q para evitar confusión)
const VIN_CHARS = '0123456789ABCDEFGHJKLMNPRSTUVWXYZ'

/**
 * Genera un VIN aleatorio de 17 caracteres
 */
export function generateRandomVIN(): string {
  let vin = ''
  
  // Posición 1-3: WMI (World Manufacturer Identifier) - Fabricante
  // Usamos códigos genéricos para Chile
  const wmiOptions = ['1H1', '1H2', '1H3', '1H4', '1H5', '1H6', '1H7', '1H8', '1H9']
  const wmi = wmiOptions[Math.floor(Math.random() * wmiOptions.length)]
  vin += wmi
  
  // Posición 4-8: VDS (Vehicle Descriptor Section) - Descripción del vehículo
  for (let i = 0; i < 5; i++) {
    vin += VIN_CHARS[Math.floor(Math.random() * VIN_CHARS.length)]
  }
  
  // Posición 9: Dígito verificador (calculado)
  vin += calculateCheckDigit(vin)
  
  // Posición 10: Año del modelo
  const currentYear = new Date().getFullYear()
  const modelYear = currentYear + Math.floor(Math.random() * 3) // Año actual + 0-2 años
  vin += getModelYearCode(modelYear)
  
  // Posición 11: Planta de ensamblaje
  const plantCodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
  vin += plantCodes[Math.floor(Math.random() * plantCodes.length)]
  
  // Posición 12-17: Número secuencial
  for (let i = 0; i < 6; i++) {
    vin += VIN_CHARS[Math.floor(Math.random() * VIN_CHARS.length)]
  }
  
  return vin
}

/**
 * Calcula el dígito verificador del VIN
 */
function calculateCheckDigit(vin: string): string {
  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]
  const transliteration: { [key: string]: number } = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
    'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9
  }
  
  let sum = 0
  for (let i = 0; i < vin.length; i++) {
    const char = vin[i]
    let value: number
    
    if (char >= '0' && char <= '9') {
      value = parseInt(char)
    } else {
      value = transliteration[char] || 0
    }
    
    sum += value * weights[i]
  }
  
  const remainder = sum % 11
  return remainder === 10 ? 'X' : remainder.toString()
}

/**
 * Obtiene el código del año del modelo
 */
function getModelYearCode(year: number): string {
  const yearCodes: { [key: number]: string } = {
    2020: 'L', 2021: 'M', 2022: 'N', 2023: 'P', 2024: 'R', 2025: 'S',
    2026: 'T', 2027: 'V', 2028: 'W', 2029: 'X', 2030: 'Y', 2031: '1',
    2032: '2', 2033: '3', 2034: '4', 2035: '5', 2036: '6', 2037: '7',
    2038: '8', 2039: '9', 2040: 'A', 2041: 'B', 2042: 'C', 2043: 'D',
    2044: 'E', 2045: 'F', 2046: 'G', 2047: 'H', 2048: 'J', 2049: 'K'
  }
  
  return yearCodes[year] || 'L'
}

/**
 * Valida si un VIN es válido
 */
export function validateVIN(vin: string): boolean {
  if (!vin || vin.length !== 17) {
    return false
  }
  
  // Verificar que no contenga caracteres prohibidos
  const prohibitedChars = /[IOQ]/
  if (prohibitedChars.test(vin)) {
    return false
  }
  
  // Verificar dígito verificador
  const checkDigit = vin[8]
  const calculatedCheckDigit = calculateCheckDigit(vin.substring(0, 8) + vin.substring(9))
  
  return checkDigit === calculatedCheckDigit
}

/**
 * Genera un VIN único verificando que no exista en la base de datos
 */
export async function generateUniqueVIN(existingVINs: string[] = []): Promise<string> {
  let attempts = 0
  const maxAttempts = 100
  
  while (attempts < maxAttempts) {
    const vin = generateRandomVIN()
    
    if (!existingVINs.includes(vin) && validateVIN(vin)) {
      return vin
    }
    
    attempts++
  }
  
  // Si no se puede generar uno único, generar uno con timestamp
  const timestamp = Date.now().toString(36).toUpperCase()
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
  const uniqueVin = `1H1${timestamp.substring(0, 5)}${randomSuffix.substring(0, 6)}`
  
  // Asegurar que tenga 17 caracteres
  if (uniqueVin.length < 17) {
    return uniqueVin.padEnd(17, '0')
  }
  
  return uniqueVin.substring(0, 17)
}
