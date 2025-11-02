# 🔧 Solución: Error de CORS - Backend en Railway, Frontend en Vercel

## 🚨 Problema Detectado

Tu frontend (`https://capstone-frontend-wine.vercel.app`) no puede conectarse al backend en Railway debido a **error de CORS**.

El backend necesita saber qué orígenes permitir.

---

## ✅ Solución: Configurar Variables en Railway

### Paso 1: Ir a Railway Dashboard

1. Ve a **https://railway.app**
2. Selecciona tu proyecto
3. Selecciona el servicio **backend**

### Paso 2: Configurar Variables de Entorno

Ve a **Variables** (en el menú lateral) y agrega/modifica estas variables:

#### 🔴 OBLIGATORIA: FRONTEND_URL

```
Name: FRONTEND_URL
Value: https://capstone-frontend-wine.vercel.app
```

**⚠️ IMPORTANTE:** 
- Sin trailing slash (`/`) al final
- Debe ser exactamente esta URL (con `https://`)

#### 🔴 OBLIGATORIA: ALLOWED_ORIGINS

```
Name: ALLOWED_ORIGINS
Value: https://capstone-frontend-wine.vercel.app
```

**O si necesitas múltiples orígenes (separados por coma):**
```
Name: ALLOWED_ORIGINS
Value: https://capstone-frontend-wine.vercel.app,https://otro-dominio.com
```

**O para testing rápido (permite todos los orígenes):**
```
Name: ALLOWED_ORIGINS
Value: *
```

### Paso 3: Verificar Variables Existentes

Asegúrate de tener estas variables configuradas:

#### Base de Datos:
```
DATABASE_URL=postgresql://neondb_owner:npg_yWJnS2G0TQvD@ep-withered-bonus-ah13f5bx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### Servidor:
```
NODE_ENV=production
PORT=3000
```

#### JWT:
```
JWT_SECRET=109a315bf239cd65ec0f27589a1d15f801bbfc8e989654d8a9ecc55b464aa3a3
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Paso 4: Obtener URL del Backend en Railway

1. En Railway, ve a tu servicio backend
2. Click en **Settings** → **Networking**
3. Si no tienes un dominio, click en **"Generate Domain"**
4. Railway te dará una URL como: `tu-backend-production-xxxx.up.railway.app`
5. **COPIA esta URL** - la necesitarás para el frontend

### Paso 5: Redeploy en Railway

Después de agregar/modificar las variables:
1. Railway debería redeployear automáticamente
2. O puedes hacer click en **Deployments** → **Redeploy**

---

## ✅ Actualizar Frontend en Vercel

Ahora necesitas actualizar el frontend para que apunte al backend de Railway:

### Paso 1: Ir a Vercel Dashboard (Frontend)

1. Ve a **https://vercel.com/dashboard**
2. Selecciona tu proyecto: **capstone-frontend-wine** (o el nombre que tenga)

### Paso 2: Actualizar Variable de Entorno

1. Ve a **Settings** → **Environment Variables**
2. Busca o crea la variable:

```
Name: VITE_API_URL
Value: https://tu-backend-url.up.railway.app/api
```

**⚠️ IMPORTANTE:** 
- Reemplaza `tu-backend-url.up.railway.app` con la URL real de Railway (del Paso 4)
- Incluye `/api` al final

### Paso 3: Redeploy del Frontend

1. Ve a **Deployments**
2. Click en **...** (tres puntos) → **Redeploy**
3. O haz un push a tu repositorio

---

## ✅ Verificación Completa

### 1. Verificar Backend en Railway

Abre en tu navegador:
```
https://tu-backend-url.up.railway.app/health
```

Deberías ver:
```json
{
  "status": "OK",
  "message": "API de Gestión de Flota PepsiCo",
  "timestamp": "...",
  "environment": "production"
}
```

### 2. Verificar CORS en Backend

Abre en tu navegador (desde DevTools):
```javascript
fetch('https://tu-backend-url.up.railway.app/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email: 'test@test.com', password: 'test' })
})
```

Si no ves errores de CORS en la consola, está funcionando.

### 3. Probar Login en Frontend

1. Abre: `https://capstone-frontend-wine.vercel.app`
2. Intenta hacer login
3. Verifica en la consola que no haya errores de CORS

---

## 📋 Resumen de URLs

- **Frontend:** `https://capstone-frontend-wine.vercel.app`
- **Backend:** `https://tu-backend-url.up.railway.app` (obtén la URL real de Railway)
- **Health Check:** `https://tu-backend-url.up.railway.app/health`
- **API Login:** `https://tu-backend-url.up.railway.app/api/auth/login`

---

## 🐛 Troubleshooting

### Error: "CORS bloqueado para origen"

**Solución:**
1. Verifica que `FRONTEND_URL` en Railway sea exactamente: `https://capstone-frontend-wine.vercel.app`
2. Verifica que `ALLOWED_ORIGINS` incluya el mismo dominio
3. Asegúrate de hacer redeploy después de cambiar las variables

### Error: "Network Error" o "404"

**Solución:**
1. Verifica que `VITE_API_URL` en Vercel apunte al backend de Railway correcto
2. Verifica que incluya `/api` al final
3. Verifica que el backend esté corriendo (health check)

### Error: "Cannot connect to database"

**Solución:**
1. Verifica que `DATABASE_URL` en Railway sea correcta
2. Verifica que Neon esté activo

---

## 📝 Checklist Final

- [ ] `FRONTEND_URL` configurado en Railway
- [ ] `ALLOWED_ORIGINS` configurado en Railway
- [ ] `DATABASE_URL` configurado en Railway
- [ ] URL del backend obtenida de Railway
- [ ] `VITE_API_URL` actualizado en Vercel con la URL de Railway
- [ ] Backend redeployed en Railway
- [ ] Frontend redeployed en Vercel
- [ ] Health check funciona
- [ ] Login funciona sin errores de CORS

---

**¡Listo! Después de configurar estas variables en Railway y actualizar Vercel, debería funcionar correctamente.**

