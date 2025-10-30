# Problema de Login del Guardia

## Diagnóstico

Basándome en los logs proporcionados, el problema es:

**El guardia está siendo redirigido al dashboard de recepcionista en lugar de su propio dashboard.**

### Evidencia

Los logs muestran:
```
useWorkOrders.ts:23 🔄 Cargando órdenes de trabajo con workshopId: dcb29955-8985-47cf-9142-8c68efc2554f
❌ Error en petición: /work-orders/stats 403 
{success: false, error: 'No tiene permisos para read en work-orders'}
```

El hook `useWorkOrders` es usado SOLO por el `RecepcionistaDashboard`, NO por el `GuardiaDashboard`.

## Problema Identificado

El guardia está accediendo a `/dashboard/recepcionista` en lugar de `/dashboard/guardia`.

## Acciones Tomadas

1. ✅ Agregados logs en Login.tsx para mostrar redirección
2. ✅ Agregados logs en Dashboard.tsx para mostrar redirección automática
3. ✅ Agregados logs en GuardiaDashboard para confirmar carga
4. ✅ Agregados logs en RecepcionistaDashboard para confirmar carga

## Próximos Pasos

1. **Verificar URL actual:** ¿A qué URL está siendo redirigido el guardia?
2. **Verificar logs de redirección:** ¿Aparecen los logs de Login.tsx o Dashboard.tsx?
3. **Verificar dashboard cargado:** ¿Aparece el log de GuardiaDashboard o RecepcionistaDashboard?

## Posibles Causas

1. **URL manual:** El usuario está navegando manualmente a `/dashboard/recepcionista`
2. **Sesión anterior:** Hay una sesión previa de recepcionista guardada
3. **Redirección incorrecta:** El código de redirección no está funcionando
4. **Rol incorrecto:** El rol del guardia no se está detectando correctamente

## Solución Esperada

El guardia debe ser redirigido a `/dashboard/guardia` que:
- NO usa `useWorkOrders`
- Usa `useStats` (para estadísticas de vehículos)
- Permite crear ingresos de vehículos
- Permite buscar vehículos por patente

## Logs Esperados

Después de hacer login como guardia, deberías ver:
```
🔐 Iniciando login para: guardia@pepsico.cl
✅ Login exitoso: guardia@pepsico.cl Rol: Guardia
🎯 Rol detectado: Guardia
🔄 Redirigiendo a: /dashboard/guardia
🏠 GuardiaDashboard cargado correctamente
```

## Logs NO Esperados

NO deberías ver:
```
🏠 RecepcionistaDashboard cargado correctamente
useWorkOrders.ts:23 🔄 Cargando órdenes de trabajo
```



