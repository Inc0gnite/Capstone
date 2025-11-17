# 🌱 Solución: Poblar Base de Datos en Producción (Neon)

## 🚨 Problema

El backend está funcionando pero no hay usuarios en la base de datos de producción (Neon), por lo que el login falla con "Credenciales inválidas".

## ✅ Solución: Ejecutar Seed en Producción

### Opción 1: Ejecutar Seed Localmente (Recomendado)

Desde tu máquina local, ejecuta el seed apuntando a la base de datos de producción:

```bash
cd backend

# Ejecutar seed en la base de datos de producción (Neon)
DATABASE_URL="postgresql://neondb_owner:npg_yWJnS2G0TQvD@ep-withered-bonus-ah13f5bx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npm run db:seed
```

Esto creará:
- 6 usuarios de prueba
- Roles y permisos
- Regiones y talleres
- Vehículos de prueba
- Repuestos
- Datos iniciales

### Opción 2: Ejecutar Seed desde Railway

1. Ve a Railway Dashboard
2. Selecciona tu servicio backend
3. Ve a **Deployments**
4. Selecciona el último deployment
5. Click en **"..."** (tres puntos)
6. Selecciona **"Execute Command"** o **"Terminal"**
7. Ejecuta:
   ```bash
   npm run db:seed
   ```

---

## 🔑 Credenciales de Prueba

Después de ejecutar el seed, podrás usar:

```
Admin:       admin@pepsico.cl / admin123
Guardia:     guardia@pepsico.cl / admin123
Recepción:   recepcion@pepsico.cl / admin123
Mecánico:    mecanico1@pepsico.cl / admin123
Jefe Taller: jefe@pepsico.cl / admin123
```

---

## ✅ Verificar que Funciona

1. Ejecuta el seed (Opción 1 o 2)
2. Abre tu frontend: `https://capstone-frontend-wine.vercel.app`
3. Intenta hacer login con: `guardia@pepsico.cl` / `admin123`
4. Debería funcionar correctamente

---

**¡Después de ejecutar el seed, debería funcionar el login correctamente!**

