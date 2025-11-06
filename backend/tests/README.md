# Guía de Pruebas Unitarias con Logging

Este directorio contiene las pruebas unitarias del proyecto con un sistema de logging integrado para mostrar evidencias en consola.

## 📋 Sistema de Logging

El sistema de logging (`testLogger`) permite mostrar mensajes detallados en consola durante la ejecución de las pruebas, lo que facilita:

- ✅ Ver qué acciones se están ejecutando
- ✅ Ver los datos de prueba utilizados
- ✅ Ver los resultados obtenidos
- ✅ Generar evidencias para documentación

## 🚀 Uso Básico

### Importar el Logger

```typescript
import { testLogger } from '../helpers/testLogger'
```

### Ejemplo de Prueba con Logging

```typescript
describe('MiServicio', () => {
  test('debe realizar acción correctamente', async () => {
    // Iniciar prueba
    testLogger.startTest('Realizar acción correctamente')

    // Log de acción
    testLogger.logAction('Preparando datos de prueba')
    const testData = { email: 'test@test.com' }
    testLogger.logTestData('Datos de prueba', testData)

    // Ejecutar acción
    testLogger.logAction('Ejecutando servicio')
    const result = await miServicio.ejecutar(testData)

    // Log de resultado esperado
    testLogger.logExpected('Retornar resultado válido')
    testLogger.logTestData('Resultado obtenido', result)

    // Verificaciones
    testLogger.logAssert('Resultado debe estar definido', !!result)
    expect(result).toBeDefined()

    // Finalizar prueba
    testLogger.endTest('Realizar acción correctamente', true)
  })
})
```

## 📝 Métodos Disponibles

### `testLogger.startTest(testName: string)`
Inicia una nueva prueba con un encabezado formateado.

```typescript
testLogger.startTest('Login con credenciales válidas')
```

### `testLogger.logAction(action: string, details?: any)`
Registra una acción realizada.

```typescript
testLogger.logAction('Ejecutando login')
testLogger.logAction('Creando usuario', { email: 'test@test.com' })
```

### `testLogger.logExpected(expected: string, actual?: any)`
Registra el resultado esperado.

```typescript
testLogger.logExpected('Retornar token JWT')
testLogger.logExpected('Retornar token JWT', result.accessToken)
```

### `testLogger.logAssert(assertion: string, passed?: boolean)`
Registra una verificación realizada.

```typescript
testLogger.logAssert('Token debe estar definido', !!token)
testLogger.logAssert('Email debe ser correcto', result.email === 'test@test.com')
```

### `testLogger.logTestData(label: string, data: any)`
Muestra datos de prueba formateados en JSON.

```typescript
testLogger.logTestData('Usuario creado', {
  email: 'test@test.com',
  role: 'Admin'
})
```

### `testLogger.logError(error: string, errorDetails?: any)`
Registra un error.

```typescript
testLogger.logError('Error al crear usuario', error)
```

### `testLogger.separator()`
Añade un separador visual entre secciones.

```typescript
testLogger.separator()
```

### `testLogger.endTest(testName: string, passed?: boolean)`
Finaliza una prueba con un resumen.

```typescript
testLogger.endTest('Login con credenciales válidas', true)
```

## 🎯 Ejemplo Completo

```typescript
import { AuthService } from '../../src/services/authService'
import { testLogger } from '../helpers/testLogger'

describe('AuthService', () => {
  test('login exitoso', async () => {
    testLogger.startTest('Login con credenciales válidas')

    // Arrange
    testLogger.logAction('Creando usuario de prueba')
    const user = await crearUsuarioTest()
    testLogger.logTestData('Usuario creado', { email: user.email })

    // Act
    testLogger.logAction('Ejecutando login')
    const result = await authService.login({
      email: user.email,
      password: 'password123'
    })

    // Assert
    testLogger.logExpected('Retornar tokens y usuario')
    testLogger.logAssert('AccessToken definido', !!result.accessToken)
    testLogger.logAssert('RefreshToken definido', !!result.refreshToken)
    testLogger.logTestData('Resultado del login', {
      hasTokens: !!result.accessToken,
      userEmail: result.user.email
    })

    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()

    testLogger.endTest('Login con credenciales válidas', true)
  })
})
```

## 📊 Salida en Consola

Cuando ejecutes las pruebas, verás una salida como esta:

```
📋 ============================================
📋 INICIANDO PRUEBA: Login con credenciales válidas
📋 ============================================

✅ [10:30:45] Acción: Creando usuario de prueba
📊 Usuario creado:
{
  "email": "test@test.com",
  "role": "Admin"
}

✅ [10:30:45] Acción: Ejecutando login
🎯 Resultado Esperado: Retornar tokens y usuario
✅ Verificación: AccessToken definido
✅ Verificación: RefreshToken definido
📊 Resultado del login:
{
  "hasTokens": true,
  "userEmail": "test@test.com"
}

📋 ============================================
✅ PRUEBA COMPLETADA: Login con credenciales válidas
📋 ============================================
```

## 🛠️ Ejecutar Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar en modo watch (re-ejecuta al cambiar archivos)
npm run test:watch

# Ejecutar con reporte de cobertura
npm run test:coverage

# Ejecutar un archivo específico
npm test -- authService.test.ts

# Ejecutar pruebas que coincidan con un patrón
npm test -- --testNamePattern="login"
```

## 📁 Estructura de Archivos

```
backend/tests/
├── helpers/
│   └── testLogger.ts          # Helper de logging
├── services/
│   └── authService.test.ts    # Pruebas de servicios
├── utils/
│   └── validation.test.ts     # Pruebas de utilidades
├── setup.ts                   # Configuración global
└── README.md                  # Esta guía
```

## 💡 Tips

1. **Usa `startTest` y `endTest`** para cada prueba individual
2. **Usa `logAction`** para cada paso importante (Arrange, Act, Assert)
3. **Usa `logTestData`** para mostrar datos complejos en formato JSON
4. **Usa `logAssert`** para documentar cada verificación
5. **Usa `separator`** entre pruebas para mejor legibilidad

## 🔍 Ver Logs en CI/CD

Los logs también se muestran en entornos de CI/CD. Asegúrate de que Jest esté configurado con `verbose: true` y `silent: false` en `jest.config.js`.


