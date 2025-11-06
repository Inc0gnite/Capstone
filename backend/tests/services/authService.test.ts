/**
 * Pruebas unitarias para AuthService
 * Ejemplo de uso del sistema de logging para evidencias
 */

import { AuthService } from '../../src/services/authService'
import prisma from '../../src/config/database'
import { testLogger } from '../helpers/testLogger'
import { hashPassword } from '../../src/utils/auth'

describe('AuthService - Login', () => {
  const authService = new AuthService()

  beforeEach(async () => {
    testLogger.logAction('Limpiando base de datos de prueba');
    await prisma.user.deleteMany()
  })

  afterEach(() => {
    testLogger.separator()
  })

  test('debe retornar tokens al hacer login con credenciales válidas', async () => {
    testLogger.startTest('Login con credenciales válidas')

    // Arrange - Preparar datos de prueba
    testLogger.logAction('Creando usuario de prueba')
    const testPassword = 'password123'
    const hashedPassword = await hashPassword(testPassword)
    
    const testUser = await prisma.user.create({
      data: {
        email: 'test@test.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        rut: '12345678-9',
        isActive: true,
        role: {
          connectOrCreate: {
            where: { name: 'Guardia' },
            create: {
              name: 'Guardia',
              description: 'Rol de guardia',
            },
          },
        },
      },
      include: {
        role: true,
      },
    })

    testLogger.logTestData('Usuario creado', {
      email: testUser.email,
      role: testUser.role.name,
    })

    // Act - Ejecutar la acción
    testLogger.logAction('Ejecutando login con credenciales válidas')
    const result = await authService.login({
      email: 'test@test.com',
      password: testPassword,
    })

    // Assert - Verificar resultados
    testLogger.logExpected('Retornar objeto con accessToken, refreshToken y user')
    testLogger.logAssert('accessToken debe estar definido', !!result.accessToken)
    testLogger.logAssert('refreshToken debe estar definido', !!result.refreshToken)
    testLogger.logAssert('user.email debe ser test@test.com', result.user.email === 'test@test.com')
    
    testLogger.logTestData('Resultado del login', {
      hasAccessToken: !!result.accessToken,
      hasRefreshToken: !!result.refreshToken,
      userEmail: result.user.email,
    })

    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect(result.user.email).toBe('test@test.com')

    testLogger.endTest('Login con credenciales válidas', true)
  })

  test('debe lanzar error al hacer login con credenciales inválidas', async () => {
    testLogger.startTest('Login con credenciales inválidas')

    // Arrange
    testLogger.logAction('Creando usuario de prueba')
    const testPassword = 'password123'
    const hashedPassword = await hashPassword(testPassword)
    
    await prisma.user.create({
      data: {
        email: 'test@test.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        rut: '12345678-9',
        isActive: true,
        role: {
          connectOrCreate: {
            where: { name: 'Guardia' },
            create: {
              name: 'Guardia',
              description: 'Rol de guardia',
            },
          },
        },
      },
    })

    // Act & Assert
    testLogger.logAction('Intentando login con contraseña incorrecta')
    testLogger.logExpected('Lanzar error "Credenciales inválidas"')

    try {
      await authService.login({
        email: 'test@test.com',
        password: 'wrongpassword',
      })
      
      testLogger.logError('No se lanzó el error esperado')
      testLogger.endTest('Login con credenciales inválidas', false)
      throw new Error('Debería haber lanzado un error')
    } catch (error: any) {
      testLogger.logAssert(
        `Error capturado: ${error.message}`,
        error.message === 'Credenciales inválidas'
      )
      
      expect(error.message).toBe('Credenciales inválidas')
      
      testLogger.endTest('Login con credenciales inválidas', true)
    }
  })

  test('debe lanzar error al hacer login con usuario inexistente', async () => {
    testLogger.startTest('Login con usuario inexistente')

    // Act & Assert
    testLogger.logAction('Intentando login con email que no existe')
    testLogger.logExpected('Lanzar error "Credenciales inválidas"')

    try {
      await authService.login({
        email: 'noexiste@test.com',
        password: 'password123',
      })
      
      testLogger.logError('No se lanzó el error esperado')
      testLogger.endTest('Login con usuario inexistente', false)
      throw new Error('Debería haber lanzado un error')
    } catch (error: any) {
      testLogger.logAssert(
        `Error capturado: ${error.message}`,
        error.message === 'Credenciales inválidas'
      )
      
      expect(error.message).toBe('Credenciales inválidas')
      
      testLogger.endTest('Login con usuario inexistente', true)
    }
  })
})


