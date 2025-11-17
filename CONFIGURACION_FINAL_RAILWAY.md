# ✅ Configuración Final - Backend en Railway

## 🔗 Tu URL de Backend
```
https://backend-production-2561.up.railway.app
```

---

## 🔧 Paso 1: Configurar Variables en Railway

Ve a **Railway Dashboard** → Tu proyecto → Servicio Backend → **Variables**

### Variables OBLIGATORIAS para CORS:

#### Variable 1: FRONTEND_URL
```
Name: FRONTEND_URL
Value: https://capstone-frontend-wine.vercel.app
```

#### Variable 2: ALLOWED_ORIGINS
```
Name: ALLOWED_ORIGINS
Value: https://capstone-frontend-wine.vercel.app
```

### Otras Variables Necesarias:

```
DATABASE_URL=postgresql://neondb_owner:npg_yWJnS2G0TQvD@ep-withered-bonus-ah13f5bx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
PORT=3000
JWT_SECRET=109a315bf239cd65ec0f27589a1d15f801bbfc8e989654d8a9ecc55b464aa3a3
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=pepsicomanager@gmail.com
SMTP_PASS=[GENERA_UNA_CONTRASEÑA_DE_APLICACIÓN_DE_16_CARACTERES]
LOG_LEVEL=info
```

---

## 🔧 Paso 2: Actualizar Frontend en Vercel

Ve a **Vercel Dashboard** → Tu proyecto Frontend → **Settings** → **Environment Variables**

### Variable a Actualizar/Crear:

```
Name: VITE_API_URL
Value: https://backend-production-2561.up.railway.app/api
```

**⚠️ IMPORTANTE:**
- Incluye `https://` al inicio
- Incluye `/api` al final
- Sin trailing slash

**Marcar para todos los ambientes:**
- ✅ Production
- ✅ Preview  
- ✅ Development

---

## ✅ Verificación

### 1. Health Check del Backend

Abre en tu navegador:
```
https://backend-production-2561.up.railway.app/health
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

### 2. Endpoint de API Info

Abre:
```
https://backend-production-2561.up.railway.app/api
```

Deberías ver la lista de endpoints disponibles.

### 3. Probar Login

1. Abre: `https://capstone-frontend-wine.vercel.app`
2. Intenta hacer login con:
   - Email: `guardia@pepsico.cl`
   - Password: `admin123`
3. Verifica en la consola del navegador que **NO haya errores de CORS**

---

## 🐛 Si Sigue Habiendo Errores de CORS

### Opción 1: Verificar que las Variables Estén Configuradas

En Railway:
1. Ve a Variables
2. Verifica que `FRONTEND_URL` sea exactamente: `https://capstone-frontend-wine.vercel.app`
3. Verifica que `ALLOWED_ORIGINS` tenga el mismo valor

### Opción 2: Permitir Todos los Orígenes (Solo Testing)

Si necesitas una solución rápida para testing:

En Railway, cambia:
```
ALLOWED_ORIGINS=*
```

**⚠️ Esto es menos seguro, solo para testing**

### Opción 3: Verificar Redeploy

1. En Railway, ve a Deployments
2. Verifica que el último deployment esté en "Active"
3. Si no, haz click en "Redeploy"

---

## 📋 URLs Finales

```
Frontend:     https://capstone-frontend-wine.vercel.app
Backend:      https://backend-production-2561.up.railway.app
Health:       https://backend-production-2561.up.railway.app/health
API Info:     https://backend-production-2561.up.railway.app/api
Login:        https://backend-production-2561.up.railway.app/api/auth/login
```

---

## 🎯 Checklist Final

- [ ] `FRONTEND_URL` configurado en Railway: `https://capstone-frontend-wine.vercel.app`
- [ ] `ALLOWED_ORIGINS` configurado en Railway: `https://capstone-frontend-wine.vercel.app`
- [ ] `DATABASE_URL` configurado en Railway
- [ ] `VITE_API_URL` actualizado en Vercel: `https://backend-production-2561.up.railway.app/api`
- [ ] Backend redeployed en Railway
- [ ] Frontend redeployed en Vercel
- [ ] Health check funciona
- [ ] Login funciona sin errores de CORS

---

**¡Después de configurar estas variables y hacer redeploy, debería funcionar perfectamente!**

