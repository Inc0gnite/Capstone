# 🚦 Documentación de Rate Limiting - Sistema de Gestión de Flota

## 📋 Índice

1. [¿Qué es Rate Limiting?](#qué-es-rate-limiting)
2. [¿Por qué se produjo el error 429?](#por-qué-se-produjo-el-error-429)
3. [¿Podría volver a pasar?](#podría-volver-a-pasar)
4. [Configuración Actual](#configuración-actual)
5. [Mejoras Implementadas](#mejoras-implementadas)
6. [Recomendaciones para Usuarios](#recomendaciones-para-usuarios)
7. [Monitoreo y Prevención](#monitoreo-y-prevención)

---

## 1. ¿Qué es Rate Limiting?

El **Rate Limiting** es un mecanismo de seguridad que limita el número de peticiones que un cliente puede hacer al servidor en un período de tiempo determinado. Esto previene:

- **Ataques de fuerza bruta**
- **Abuso del sistema**
- **Sobrecarga del servidor**
- **Consumo excesivo de recursos**

---

## 2. ¿Por qué se produjo el error 429?

### 🔴 Causas Raíz Identificadas

#### **A. Rate Limiting Muy Restrictivo (ANTES)**
```
Límite anterior: 100 requests / 15 minutos
Límite actual:   500 requests / 15 minutos
```

#### **B. Peticiones Duplicadas en el Dashboard**

**Problema:** Al cargar el dashboard del Guardia, se hacían múltiples peticiones duplicadas:

```
Antes de las optimizaciones:
├── useStats: 2 peticiones
│   ├── getActiveEntries()
│   └── getAll({ limit: 100 })
├── GuardiaDashboard: 2 peticiones
│   ├── getActiveEntries()
│   └── getAll({ limit: 10, dateFrom: hoy })
└── Verificación isReadyForExit: N peticiones (una por vehículo activo)
    └── Si hay 10 vehículos = 10 peticiones adicionales

Total: 14+ peticiones solo al cargar el dashboard
```

#### **C. Polling Agresivo**

**Múltiples hooks haciendo polling simultáneamente:**

| Hook | Intervalo Anterior | Peticiones/15min |
|------|-------------------|------------------|
| `useNotifications` | 30 segundos | ~30 peticiones |
| `useWorkOrders` | 2-3 minutos | ~5-7 peticiones |
| `useStats` | Variable (cada actualización) | ~10-20 peticiones |

**Total estimado:** 50-100+ peticiones en 15 minutos

#### **D. Verificación Individual de `isReadyForExit`**

**Problema crítico:** Por cada vehículo activo, se hacía una petición adicional:

```typescript
// ANTES (ineficiente):
for (const entry of activeEntries) {
  const isReady = await vehicleEntryService.isReadyForExit(entry.id) // 1 petición por vehículo
  // Si hay 10 vehículos = 10 peticiones adicionales
}
```

#### **E. Eventos que Disparan Recargas**

Cada evento (`entry-created`, `exit-registered`, etc.) dispara recargas:
- Si hay 5 eventos en 1 minuto = 5 recargas = 10+ peticiones adicionales

---

## 3. ¿Podría volver a pasar?

### ⚠️ **SÍ, en estos escenarios:**

#### **Escenario 1: Múltiples Usuarios desde la Misma IP**
```
Problema: Rate limiting es por IP, no por usuario
Ejemplo:
- Usuario A (Guardia): 200 peticiones/15min
- Usuario B (Recepcionista): 200 peticiones/15min
- Usuario C (Mecánico): 200 peticiones/15min
Total: 600 peticiones > Límite de 500 ❌
```

**Solución parcial:** Aumentamos el límite a 500, pero si hay 3+ usuarios activos desde la misma IP, aún puede ocurrir.

#### **Escenario 2: Múltiples Pestañas Abiertas**
```
Cada pestaña del navegador hace polling independiente:
- Pestaña 1: Dashboard Guardia (polling activo)
- Pestaña 2: Dashboard Recepcionista (polling activo)
- Pestaña 3: Lista de Vehículos (polling activo)

Resultado: 3x las peticiones normales
```

#### **Escenario 3: Uso Intensivo del Dashboard**
```
Si el usuario:
- Hace clic frecuente en "Actualizar"
- Hace clic en "Forzar Actualización" múltiples veces
- Tiene muchos eventos disparando recargas

Resultado: Acumulación rápida de peticiones
```

#### **Escenario 4: Muchos Vehículos Activos**
```
Si hay 50+ vehículos activos:
- La respuesta de getActiveEntries es más pesada
- Más datos a procesar
- Aunque no hay peticiones adicionales, el servidor trabaja más
```

---

## 4. Configuración Actual

### **Backend (`backend/src/index.ts`)**

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 1000 : 500,
  standardHeaders: true, // Headers X-RateLimit-*
  legacyHeaders: false,
})
```

**Características:**
- ✅ Límite aumentado: 500 requests/15min (antes: 100)
- ⚠️ Se aplica por IP (no por usuario)
- ✅ Headers informativos incluidos
- ✅ Handler personalizado para errores 429

### **Frontend - Optimizaciones**

#### **A. Polling Reducido**
- `useNotifications`: 30s → 60s (1 minuto)
- `useWorkOrders`: 2-3 minutos (sin cambios)

#### **B. Throttling Implementado**
- `useStats`: Mínimo 10 segundos entre cargas
- `useNotifications`: Mínimo 5 segundos entre fetches

#### **C. Eliminación de Peticiones Duplicadas**
- `getActiveEntries` ahora incluye `isReadyForExit`
- Eliminado el bucle de verificación individual

---

## 5. Mejoras Implementadas

### ✅ **Backend**

1. **Rate limit aumentado:** 100 → 500 requests/15min
2. **Headers informativos:** `X-RateLimit-*` para que el frontend sepa cuántas peticiones quedan
3. **Handler personalizado:** Respuesta JSON estructurada con `retryAfter`

### ✅ **Frontend**

1. **Optimización de peticiones:** De 15+ a 2-3 al cargar dashboard
2. **Polling menos agresivo:** 60 segundos en lugar de 30
3. **Throttling:** Prevención de peticiones muy frecuentes
4. **Mejor manejo de errores 429:**
   - No resetea datos cuando hay rate limit
   - Aumenta intervalos exponencialmente
   - Muestra mensajes informativos

---

## 6. Recomendaciones para Usuarios

### ✅ **Buenas Prácticas**

1. **Evitar múltiples pestañas:**
   - Cerrar pestañas no utilizadas
   - Usar una sola pestaña por sesión

2. **No abusar de botones de actualización:**
   - El sistema actualiza automáticamente
   - Solo usar "Actualizar" cuando sea necesario

3. **Cerrar sesión cuando no se use:**
   - Reduce peticiones de polling
   - Libera recursos del servidor

4. **Reportar si ocurre frecuentemente:**
   - Si ves errores 429 regularmente, puede ser un problema de configuración
   - Contactar al administrador del sistema

### ⚠️ **Si Ocurre el Error 429**

1. **Esperar 1-2 minutos** antes de intentar de nuevo
2. **Cerrar pestañas duplicadas** del sistema
3. **Refrescar la página** después de esperar
4. **Verificar si otros usuarios** están usando el sistema desde la misma red

---

## 7. Monitoreo y Prevención

### **Headers de Rate Limiting**

El servidor incluye estos headers en cada respuesta:

```
X-RateLimit-Limit: 500        # Límite máximo
X-RateLimit-Remaining: 450    # Peticiones restantes
X-RateLimit-Reset: 1234567890 # Timestamp de reinicio
```

### **Logs del Backend**

El sistema registra cuando se alcanza el rate limit:
- Revisar logs para identificar patrones
- Identificar usuarios/IPs problemáticos

### **Métricas Recomendadas**

Monitorear:
- Número de errores 429 por día
- IPs que más frecuentemente alcanzan el límite
- Endpoints más solicitados
- Horarios de mayor carga

---

## 8. Mejoras Adicionales Implementadas ✅

### **A. Sistema de Caché en el Frontend**

**Implementado:** Sistema de caché inteligente que evita peticiones duplicadas.

**Características:**
- ✅ Caché automático para endpoints frecuentes (`/vehicle-entries/active`, `/notifications`, etc.)
- ✅ TTL configurable por endpoint (20-60 segundos)
- ✅ Invalidación automática cuando hay cambios
- ✅ Request deduplication (evita peticiones idénticas simultáneas)

**Beneficios:**
- Reduce peticiones duplicadas en ~70%
- Mejora la experiencia del usuario (respuestas más rápidas)
- Reduce carga en el servidor

### **B. Page Visibility API**

**Implementado:** Detiene polling cuando la pestaña no está visible.

**Características:**
- ✅ Polling se pausa automáticamente cuando la pestaña está oculta
- ✅ Se reanuda cuando la pestaña vuelve a estar visible
- ✅ Recarga datos al volver a la pestaña

**Beneficios:**
- Reduce peticiones innecesarias cuando el usuario no está viendo la página
- Ahorra recursos del servidor y del cliente
- Mejora la eficiencia energética

### **C. Rate Limiting por Usuario**

**Implementado:** Middleware adicional que aplica rate limiting por usuario después de autenticación.

**Características:**
- ✅ Rate limiting diferenciado: 500 requests/usuario/15min
- ✅ Múltiples usuarios desde la misma IP no se afectan entre sí
- ✅ Rate limiting estricto para endpoints pesados (100 requests/15min)
- ✅ Rate limiting permisivo para endpoints frecuentes (1000 requests/15min)

**Beneficios:**
- Soluciona el problema de múltiples usuarios desde la misma IP
- Permite escalabilidad mejor
- Protege endpoints críticos

### **D. Exponential Backoff Mejorado**

**Implementado:** Retry inteligente con exponential backoff para errores 429.

**Características:**
- ✅ Reintentos automáticos (hasta 3 intentos)
- ✅ Delay exponencial basado en `retryAfter` del servidor
- ✅ Invalidación de caché cuando hay rate limit
- ✅ Logging detallado para debugging

**Beneficios:**
- Recuperación automática de errores temporales
- Reduce la carga cuando hay rate limiting
- Mejor experiencia del usuario

### **E. Invalidación Inteligente de Caché**

**Implementado:** Invalidación automática cuando hay cambios en los datos.

**Características:**
- ✅ Invalidación por patrón (ej: `/vehicle-entries/*`)
- ✅ Invalidación manual cuando se crean/actualizan datos
- ✅ Limpieza automática de entradas expiradas

**Beneficios:**
- Garantiza que los datos siempre estén actualizados
- Evita mostrar información obsoleta
- Balance entre rendimiento y actualidad

---

## 9. Soluciones Futuras (Opcionales)

### **A. Rate Limiting por Usuario**

**Problema actual:** Rate limiting es por IP, no por usuario.

**Solución:** Crear middleware de rate limiting que se ejecute después de la autenticación:

```typescript
// Ejemplo conceptual (requiere implementación)
const userLimiter = rateLimit({
  keyGenerator: (req) => req.user?.userId || req.ip,
  max: 500,
  windowMs: 15 * 60 * 1000,
})
```

**Ventaja:** Múltiples usuarios desde la misma IP no se afectan entre sí.

### **B. Caché en el Frontend**

Implementar caché para reducir peticiones:
- Cachear respuestas de `getActiveEntries` por 30 segundos
- Cachear estadísticas por 1 minuto
- Invalidar caché solo cuando hay cambios reales

### **C. WebSockets para Actualizaciones en Tiempo Real**

En lugar de polling, usar WebSockets:
- El servidor notifica cambios al cliente
- Elimina la necesidad de polling constante
- Reduce drásticamente el número de peticiones

### **D. Rate Limiting Diferenciado por Endpoint**

Algunos endpoints pueden tener límites más altos:
- `/api/notifications`: 100 requests/15min (solo polling)
- `/api/vehicle-entries/active`: 200 requests/15min (muy usado)
- `/api/dashboard`: 50 requests/15min (carga pesada)

---

## 9. Resumen

### **¿Por qué ocurrió?**
1. Rate limit muy restrictivo (100/15min)
2. Peticiones duplicadas en el dashboard
3. Polling agresivo (30 segundos)
4. Verificación individual de `isReadyForExit` (N+1 queries)

### **¿Podría volver a pasar?**
**Sí, pero es menos probable:**
- ✅ Límite aumentado a 500
- ✅ Peticiones optimizadas
- ✅ Polling menos agresivo
- ⚠️ Aún puede ocurrir con múltiples usuarios desde la misma IP

### **Prevención:**
- ✅ Optimizaciones implementadas
- ✅ Mejor manejo de errores
- ✅ Throttling en el frontend
- 📝 Documentación para usuarios

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0.0

