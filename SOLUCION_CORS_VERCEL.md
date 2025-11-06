# 🔧 Solución: Error de CORS en Vercel

## 🚨 Problema Detectado

Tu frontend (`https://capstone-frontend-wine.vercel.app`) no puede conectarse al backend (`https://capstone-backend-beryl-phi.vercel.app`) debido a:

1. **Error de CORS**: El backend no permite el origen del frontend
2. **404 Error**: Posible problema de configuración de rutas en Vercel

---

## ✅ Solución: Configurar Variables de Entorno en Vercel (Backend)

### Paso 1: Ir a Vercel Dashboard

1. Ve a **https://vercel.com**
2. Selecciona tu proyecto del **backend**: `capstone-backend-beryl-phi`

### Paso 2: Configurar Variables de Entorno

Ve a **Settings** → **Environment Variables** y agrega:

#### Variables OBLIGATORIAS:

```
FRONTEND_URL=https://capstone-frontend-wine.vercel.app
```

```
ALLOWED_ORIGINS=https://capstone-frontend-wine.vercel.app
```

#### Variables de Base de Datos:

```
DATABASE_URL=postgresql://neondb_owner:npg_yWJnS2G0TQvD@ep-withered-bonus-ah13f5bx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### Variables de Servidor:

```
NODE_ENV=production
PORT=3000
```

#### Variables de JWT:

```
JWT_SECRET=109a315bf239cd65ec0f27589a1d15f801bbfc8e989654d8a9ecc55b464aa3a3
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

#### Variables de Email (opcional):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=imsuicideboys@gmail.com
SMTP_PASS=wwlcqtagrfvuhrhf
```

#### Variables de Logs:

```
LOG_LEVEL=info
```

### Paso 3: Seleccionar Ambientes

Para cada variable, asegúrate de seleccionar:
- ✅ **Production**
- ✅ **Preview** (opcional)
- ✅ **Development** (opcional)

### Paso 4: Redeploy

1. Ve a **Deployments**
2. Click en los **tres puntos (...)** del último deployment
3. Selecciona **"Redeploy"**
4. O simplemente haz un push a tu repositorio

---

## 🔍 Verificar que Funciona

### 1. Health Check del Backend

Abre en tu navegador:
```
https://capstone-backend-beryl-phi.vercel.app/health
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

### 2. Probar Login

1. Abre tu frontend: `https://capstone-frontend-wine.vercel.app`
2. Intenta hacer login
3. Verifica en la consola que no haya errores de CORS

---

## 🐛 Si el 404 Persiste

Si después de configurar CORS sigues viendo el error 404:

### Opción 1: Verificar que el Backend esté Corriendo

1. En Vercel, ve a tu proyecto backend
2. Ve a **Deployments**
3. Verifica que el último deployment sea **Ready** (verde)
4. Revisa los **Logs** para ver si hay errores

### Opción 2: Verificar Rutas en Vercel

El archivo `vercel.json` debería tener:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.ts"
    }
  ]
}
```

### Opción 3: Verificar que `api/index.ts` Exporte Correctamente

El archivo `backend/api/index.ts` debe exportar tu app Express correctamente.

---

## 📝 Resumen de URLs

- **Frontend:** `https://capstone-frontend-wine.vercel.app`
- **Backend:** `https://capstone-backend-beryl-phi.vercel.app`
- **Health Check:** `https://capstone-backend-beryl-phi.vercel.app/health`
- **API Login:** `https://capstone-backend-beryl-phi.vercel.app/api/auth/login`

---

## ⚠️ Importante

**FRONTEND_URL** debe ser exactamente:
```
https://capstone-frontend-wine.vercel.app
```

**ALLOWED_ORIGINS** debe incluir:
```
https://capstone-frontend-wine.vercel.app
```

Sin trailing slash (`/`) al final.

---

## 🔄 Alternativa: Permitir Todos los Orígenes (Solo para Testing)

Si necesitas una solución rápida para testing (NO recomendado para producción):

En Vercel, agrega:
```
ALLOWED_ORIGINS=*
```

Esto permitirá todos los orígenes, pero es menos seguro.

---

**Después de configurar, haz redeploy del backend y prueba el login nuevamente.**

