# Asignar Permiso spare-parts:update al rol Mecánico

## Opción 1: Usar el endpoint API (Recomendado)

Después de desplegar el backend, puedes ejecutar esta petición desde el frontend o con curl:

```bash
curl -X POST https://backend-production-2561.up.railway.app/api/roles/assign-permission \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_DE_ADMIN" \
  -d '{
    "roleName": "Mecánico",
    "resource": "spare-parts",
    "action": "update"
  }'
```

O desde el frontend (usando la consola del navegador con un usuario admin autenticado):

```javascript
fetch('https://backend-production-2561.up.railway.app/api/roles/assign-permission', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth-token')}` // o como almacenes el token
  },
  body: JSON.stringify({
    roleName: 'Mecánico',
    resource: 'spare-parts',
    action: 'update'
  })
})
.then(r => r.json())
.then(console.log)
```

## Opción 2: Ejecutar el script directamente

```bash
cd backend
npm run fix:mecanico-spare-parts-permission
```

## Opción 3: Usar Prisma Studio o SQL directo

Si tienes acceso a la base de datos:

```sql
-- Primero, obtener el ID del rol Mecánico
SELECT id FROM "Role" WHERE name = 'Mecánico';

-- Luego, obtener el ID del permiso spare-parts:update
SELECT id FROM "Permission" WHERE resource = 'spare-parts' AND action = 'update';

-- Finalmente, insertar la relación (reemplazar los IDs)
INSERT INTO "RolePermission" ("roleId", "permissionId", "createdAt", "updatedAt")
VALUES (
  'ID_DEL_ROL_MECANICO',
  'ID_DEL_PERMISO',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;
```

