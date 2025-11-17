# Configuración de Dashboards por Rol

## 📋 Resumen

Se han configurado dashboards específicos para cada rol de usuario en el sistema.

## 🔐 Roles y Dashboards

| Rol | Dashboard | Ruta | Estado |
|-----|-----------|------|--------|
| Administrador | AdminDashboard | `/dashboard/administrador` | ✅ Configurado |
| Guardia | GuardiaDashboard | `/dashboard/guardia` | ✅ Configurado |
| Recepcionista | RecepcionistaDashboard | `/dashboard/recepcionista` | ✅ Configurado |
| Mecánico | MecanicoDashboard | `/dashboard/mecanico` | ✅ Configurado |
| Jefe de Taller | JefeTallerDashboard | `/dashboard/jefe-taller` | ✅ Configurado |
| Inventario | InventarioDashboard | `/dashboard/inventario` | ✅ Configurado |

## 🚀 Funcionalidades Implementadas

### 1. Redirección Automática después del Login
- `Login.tsx`: Detecta el rol del usuario y redirige al dashboard apropiado
- Mapeo de roles a dashboards implementado
- Logs de depuración para seguimiento

### 2. Redirección desde Dashboard General
- `Dashboard.tsx`: Redirige automáticamente según el rol
- Evita que usuarios lleguen a dashboards incorrectos
- Usa `window.location.href` para redirección completa

### 3. Redirección en RoleBasedRoute
- `RoleBasedRoute.tsx`: Redirige a usuarios sin permisos al dashboard correcto
- Protege rutas específicas según roles
- Logs de redirección para debugging

## 📁 Archivos Modificados

1. **`frontend/src/App.tsx`**
   - Importa todos los dashboards
   - Define rutas con `RoleBasedRoute` para cada dashboard
   - Configura permisos por rol

2. **`frontend/src/pages/Login.tsx`**
   - Redirección inteligente según rol después del login
   - Mapeo completo de roles a dashboards
   - Logs de debugging

3. **`frontend/src/pages/Dashboard.tsx`**
   - Redirección automática a dashboards específicos
   - Mapeo de roles para redirección
   - Evita loops de redirección

4. **`frontend/src/components/RoleBasedRoute.tsx`**
   - Actualizado mapeo de redirección
   - Agrega logs de redirección
   - Protección mejorada de rutas

## 🔍 Mapeo de Redirección

```typescript
const roleDashboardMap: Record<string, string> = {
  'Administrador': '/dashboard/administrador',
  'Guardia': '/dashboard/guardia',
  'Recepcionista': '/dashboard/recepcionista',
  'Mecánico': '/dashboard/mecanico',
  'Jefe de Taller': '/dashboard/jefe-taller',
  'Inventario': '/dashboard/inventario'
}
```

## ✅ Verificación

Para verificar que todo funciona correctamente:

1. **Inicia sesión como cada rol:**
   - Guardia: `guardia@pepsico.cl` / `admin123`
   - Recepcionista: `recepcion@pepsico.cl` / `admin123`
   - Admin: `admin@pepsico.cl` / `admin123`
   - Mecánico: `mecanico1@pepsico.cl` / `admin123`
   - Jefe de Taller: `jefe@pepsico.cl` / `admin123`
   - Encargado de Inventario: `inventario@pepsico.cl` / `admin123`

2. **Verifica en la consola:**
   - Deberías ver: `🎯 Rol detectado: [ROL]`
   - Deberías ver: `🔄 Redirigiendo a: /dashboard/[rol]`
   - Deberías ser redirigido automáticamente

3. **Verifica redirecciones:**
   - Si un Guardia intenta acceder a `/dashboard/recepcionista`, será redirigido a `/dashboard/guardia`
   - Si un Recepcionista intenta acceder a `/dashboard/guardia`, será redirigido a `/dashboard/recepcionista`

## 📝 Notas

- Todos los dashboards están en: `frontend/src/pages/dashboards/`
- El mapeo de roles es centralizado en múltiples archivos para consistencia
- Los Administradores pueden acceder a todos los dashboards
- Los logs de debugging están habilitados para facilitar troubleshooting



