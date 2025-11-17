/**
 * Pruebas unitarias para funciones de validación
 * Ejemplo de uso del sistema de logging para evidencias
 */

import { validateRUT, formatRUT } from '../../src/utils/validation'
import { testLogger } from '../helpers/testLogger'

describe('Validación de RUT', () => {
  describe('validateRUT', () => {
    test('debe validar RUT chileno válido', () => {
      testLogger.startTest('Validar RUT chileno válido')

      // Arrange
      const validRUT = '12345678-9'
      testLogger.logAction('Preparando RUT de prueba', { rut: validRUT })

      // Act
      testLogger.logAction('Ejecutando validación de RUT')
      const result = validateRUT(validRUT)

      // Assert
      testLogger.logExpected('Retornar true para RUT válido')
      testLogger.logAssert(`Resultado: ${result}`, result === true)
      testLogger.logTestData('Resultado de validación', { rut: validRUT, esValido: result })

      expect(result).toBe(true)

      testLogger.endTest('Validar RUT chileno válido', true)
    })

    test('debe rechazar RUT inválido', () => {
      testLogger.startTest('Validar RUT inválido')

      // Arrange
      const invalidRUT = '12345678-0'
      testLogger.logAction('Preparando RUT inválido de prueba', { rut: invalidRUT })

      // Act
      testLogger.logAction('Ejecutando validación de RUT inválido')
      const result = validateRUT(invalidRUT)

      // Assert
      testLogger.logExpected('Retornar false para RUT inválido')
      testLogger.logAssert(`Resultado: ${result}`, result === false)
      testLogger.logTestData('Resultado de validación', { rut: invalidRUT, esValido: result })

      expect(result).toBe(false)

      testLogger.endTest('Validar RUT inválido', true)
    })

    test('debe validar RUT con formato con puntos', () => {
      testLogger.startTest('Validar RUT con formato con puntos')

      // Arrange
      const rutWithDots = '12.345.678-9'
      testLogger.logAction('Preparando RUT con puntos', { rut: rutWithDots })

      // Act
      testLogger.logAction('Ejecutando validación de RUT con formato')
      const result = validateRUT(rutWithDots)

      // Assert
      testLogger.logExpected('Retornar true para RUT con formato válido')
      testLogger.logAssert(`Resultado: ${result}`, result === true)
      testLogger.logTestData('Resultado de validación', { rut: rutWithDots, esValido: result })

      expect(result).toBe(true)

      testLogger.endTest('Validar RUT con formato con puntos', true)
    })
  })

  describe('formatRUT', () => {
    test('debe formatear RUT sin puntos', () => {
      testLogger.startTest('Formatear RUT sin puntos')

      // Arrange
      const rutSinFormato = '12345678-9'
      testLogger.logAction('Preparando RUT sin formato', { rut: rutSinFormato })

      // Act
      testLogger.logAction('Ejecutando formateo de RUT')
      const result = formatRUT(rutSinFormato)

      // Assert
      testLogger.logExpected('Retornar RUT formateado: 12.345.678-9')
      testLogger.logAssert(`Resultado: ${result}`, result === '12.345.678-9')
      testLogger.logTestData('Resultado de formateo', { 
        entrada: rutSinFormato, 
        salida: result 
      })

      expect(result).toBe('12.345.678-9')

      testLogger.endTest('Formatear RUT sin puntos', true)
    })

    test('debe mantener formato si ya está formateado', () => {
      testLogger.startTest('Formatear RUT ya formateado')

      // Arrange
      const rutFormateado = '12.345.678-9'
      testLogger.logAction('Preparando RUT ya formateado', { rut: rutFormateado })

      // Act
      testLogger.logAction('Ejecutando formateo de RUT ya formateado')
      const result = formatRUT(rutFormateado)

      // Assert
      testLogger.logExpected('Retornar RUT formateado correctamente')
      testLogger.logAssert(`Resultado: ${result}`, result === '12.345.678-9')
      testLogger.logTestData('Resultado de formateo', { 
        entrada: rutFormateado, 
        salida: result 
      })

      expect(result).toBe('12.345.678-9')

      testLogger.endTest('Formatear RUT ya formateado', true)
    })
  })
})


