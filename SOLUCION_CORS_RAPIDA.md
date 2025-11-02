# 🚀 Solución Rápida: Error de CORS en Vercel

## ⚡ Solución Inmediata

Tu backend en Vercel necesita configurar las variables de entorno para permitir CORS desde tu frontend.

### Paso 1: Ir a Vercel Dashboard

1. Ve a **https://vercel.com/dashboard**
2. Selecciona tu proyecto: **capstone-backend-beryl-phi**

### Paso 2: Configurar Variables de Entorno

**Settings** → **Environment Variables** → **Add New**

#### Variable 1: FRONTEND_URL
```
Name: FRONTEND_URL
Value: https://capstone-frontend-wine.vercel.app
Environment: Production, Preview, Development
```

#### Variable 2: ALLOWED_ORIGINS (Solución Rápida)
```
Name: ALLOWED_ORIGINS
Value: https://capstone-frontend-wine.vercel.app
Environment: Production, Preview, Development
```

**O para permitir todos los orígenes (solo testing):**
```
Name: ALLOWED_ORIGINS
Value: *
Environment: Production, Preview, Development
```

### Paso 3: Verificar Variables Existentes

Asegúrate de tener estas variables también:

```
DATABASE_URL=postgresql://neondb_owner:npg_yWJnS2G0TQvD@ep-withered-bonus-ah13f5bx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
JWT_SECRET=109a315bf239cd65ec0f27589a1d15f801bbfc8e989654d8a9ecc55b464aa3a3
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Paso 4: Redeploy

1. Ve a **Deployments**
2. Click en **...** (tres puntos) del último deployment
3. **Redeploy**

---

## ✅ Verificación

Después del redeploy:

1. Abre: `https://capstone-backend-beryl-phi.vercel.app/health`
   - Debe responder: `{"status":"OK",...}`

2. Abre: `https://capstone-frontend-wine.vercel.app`
   - Intenta hacer login
   - No debe haber errores de CORS

---

## 🔍 Si el 404 Persiste

El 404 podría ser porque:
1. El backend no está desplegado correctamente
2. Las rutas no están configuradas bien en `vercel.json`

Verifica en Vercel → **Deployments** → **Logs** para ver si hay errores de build o runtime.

---

**¡Listo! Después de configurar estas variables y hacer redeploy, debería funcionar.**

