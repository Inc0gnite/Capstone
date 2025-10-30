/**
 * Utilidades para generar códigos y números únicos
 */

import { counterService } from '../services/counterService'

/**
 * Genera un código de ingreso único secuencial
 * Formato: ING-YYYYMMDD-XXXX
 * Ejemplo: ING-20241015-0001
 */
export async function generateEntryCode(): Promise<string> {
  return await counterService.getNextEntryNumber()
}

/**
 * Genera un número de orden de trabajo único secuencial
 * Formato: OT-YYYYMMDD-XXXX
 * Ejemplo: OT-20241015-0001
 */
export async function generateWorkOrderNumber(): Promise<string> {
  return await counterService.getNextWorkOrderNumber()
}

/**
 * Genera un código de repuesto único
 * Formato: REP-XXXX
 */
export function generateSparePartCode(): string {
  const random = String(Math.floor(Math.random() * 100000)).padStart(5, '0')
  return `REP-${random}`
}

/**
 * Genera un número de flota
 * Formato: FL-XXXX
 */
export function generateFleetNumber(): string {
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `FL-${random}`
}


