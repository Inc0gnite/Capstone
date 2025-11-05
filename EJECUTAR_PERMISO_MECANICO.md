# Cómo asignar permiso spare-parts:update al rol Mecánico

## ✅ Opción 1: Ejecutar script localmente (Más rápido - 2 minutos)

Si tienes acceso a la variable `DATABASE_URL` de producción:

1. **Obtén la DATABASE_URL de Railway:**
   - Ve a Railway Dashboard → Tu proyecto → Variables
   - Copia el valor de `DATABASE_URL`

2. **Ejecuta el script localmente:**
   ```bash
   cd backend
   
   # Configurar DATABASE_URL temporalmente
   $env:DATABASE_URL="postgresql://...tu_url_de_produccion..."
   
   # Ejecutar el script
   npm run fix:mecanico-spare-parts-permission
   ```

   O en PowerShell:
   ```powershell
   cd backend
   $env:DATABASE_URL = "postgresql://tu_url_aqui"
   npm run fix:mecanico-spare-parts-permission
   ```

## ✅ Opción 2: Usar el endpoint API (Después del deploy - 5 minutos)

Cuando Railway despliegue el nuevo código (en ~2-3 minutos):

1. **Inicia sesión como administrador** en el frontend
2. **Abre la consola del navegador** (F12)
3. **Ejecuta este código:**

```javascript
// Obtener el token de autenticación
const auth = JSON.parse(localStorage.getItem('auth-storage') || '{}');
const token = auth?.state?.token || auth?.token;

if (!token) {
  alert('❌ No estás autenticado. Por favor inicia sesión primero.');
} else {
  fetch('https://backend-production-2561.up.railway.app/api/roles/assign-permission', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      roleName: 'Mecánico',
      resource: 'spare-parts',
      action: 'update'
    })
  })
  .then(r => r.json())
  .then(data => {
    console.log('✅ Resultado:', data);
    if (data.success) {
      alert('✅ Permiso asignado exitosamente!\n\nLos mecánicos ahora pueden solicitar repuestos.');
    } else {
      alert('❌ Error: ' + (data.error || 'Error desconocido'));
    }
  })
  .catch(err => {
    console.error('❌ Error:', err);
    alert('❌ Error al ejecutar la petición: ' + err.message);
  });
}
```

## ✅ Opción 3: Ejecutar desde Railway (Si tienes acceso SSH)

```bash
# Conectar a Railway via SSH (si está habilitado)
railway run bash

# O ejecutar directamente
railway run npm run fix:mecanico-spare-parts-permission --workspace=backend
```

## 🔍 Verificar que funcionó

Después de ejecutar cualquiera de las opciones, verifica:

1. Un mecánico debería poder solicitar repuestos sin error 403
2. O puedes verificar en la base de datos:
   ```sql
   SELECT r.name as rol, p.resource, p.action 
   FROM "RolePermission" rp
   JOIN "Role" r ON r.id = rp."roleId"
   JOIN "Permission" p ON p.id = rp."permissionId"
   WHERE r.name = 'Mecánico' AND p.resource = 'spare-parts' AND p.action = 'update';
   ```

