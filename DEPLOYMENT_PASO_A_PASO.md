# 🚀 Guía de Deployment - Backend y Base de Datos

Esta guía te ayudará a subir el backend y la base de datos para que funcione con tu frontend en Vercel.

## 📋 Checklist Pre-Deployment

- [x] Backend configurado localmente
- [x] Base de datos local funcionando
- [x] Frontend en Vercel (ya configurado)
- [ ] Base de datos en producción (Neon)
- [ ] Backend en producción (Railway)

---

## Paso 1: Crear Base de Datos en Neon 🗄️

### 1.1 Crear cuenta y proyecto

1. Ve a **https://neon.tech**
2. Click en **"Sign Up"** (puedes usar GitHub)
3. Click en **"Create a project"**
4. Configuración:
   - **Nombre del proyecto:** `pepsico-fleet-prod`
   - **Región:** Elige la más cercana (US East o South America)
   - **PostgreSQL version:** 15 o superior
5. Click en **"Create project"**

### 1.2 Obtener Connection String

1. En el dashboard de Neon, verás tu proyecto
2. En la sección **"Connection Details"**, verás algo como:
   ```
   postgresql://usuario:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. **COPIA esta URL completa** - la necesitarás en el siguiente paso
4. Puedes hacer click en **"Copy connection string"** para copiarlo fácilmente

### 1.3 Aplicar Migraciones a la Base de Datos de Producción

Una vez que tengas el `DATABASE_URL` de Neon, ejecuta:

```bash
cd backend

# Reemplaza "TU_DATABASE_URL_DE_NEON" con la URL que copiaste
DATABASE_URL="postgresql://usuario:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require" npx prisma migrate deploy
```

Esto creará todas las tablas en tu base de datos de producción.

### 1.4 (Opcional) Poblar Datos Iniciales

Si quieres tener datos de prueba en producción:

```bash
cd backend
DATABASE_URL="TU_DATABASE_URL_DE_NEON" npm run db:seed
```

**⚠️ NOTA:** El seed crea datos de prueba. En producción real, tal vez solo quieras roles y permisos.

---

## Paso 2: Desplegar Backend en Railway 🚂

### 2.1 Crear cuenta en Railway

1. Ve a **https://railway.app**
2. Click en **"Start a New Project"**
3. Selecciona **"Login with GitHub"**
4. Autoriza Railway para acceder a tus repositorios

### 2.2 Crear Proyecto y Conectar Repositorio

1. Click en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Si tu repositorio no aparece:
   - Click en **"Configure GitHub App"**
   - Selecciona el repositorio que contiene tu proyecto
   - Click en **"Install"**
4. Selecciona tu repositorio: `Capstone_github - copia` (o el nombre que tenga)
5. Railway debería detectar automáticamente el `railway.json` y proponer el servicio de backend

### 2.3 Configurar el Servicio Backend

Si Railway no detectó automáticamente, configura manualmente:

1. Click en **"+ New"** → **"GitHub Repo"**
2. Selecciona tu repositorio
3. En **Settings** del servicio:
   - **Name:** `pepsico-backend`
   - **Root Directory:** `backend`
   - **Build Command:** (Railway lo detecta automáticamente, pero puedes verificar)
   - **Start Command:** `npm start`

### 2.4 Configurar Variables de Entorno

En Railway, ve a tu servicio backend → **Variables** y agrega:

```env
# Base de Datos (USA LA URL DE NEON QUE COPIaste)
DATABASE_URL=postgresql://usuario:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require

# Servidor
PORT=3000
NODE_ENV=production

# Frontend URL (actualiza con la URL real de tu frontend en Vercel)
FRONTEND_URL=https://tu-frontend.vercel.app

# JWT (GENERA UNO NUEVO Y SEGURO - NO USES EL DE DESARROLLO)
JWT_SECRET=genera-un-secreto-muy-largo-y-seguro-minimo-32-caracteres
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (opcional, pero necesario para notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=imsuicideboys@gmail.com
SMTP_PASS=wwlcqtagrfvuhrhf

# Cloudinary (opcional, para imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Logs
LOG_LEVEL=info
```

**⚠️ IMPORTANTE:** 
- Genera un `JWT_SECRET` nuevo y seguro (mínimo 32 caracteres)
- Puedes generar uno con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 2.5 Obtener URL del Backend

1. En Railway, ve a tu servicio backend
2. Click en **Settings** → **Networking**
3. Click en **"Generate Domain"**
4. Railway te dará una URL como: `pepsico-backend-production-xxxx.up.railway.app`
5. **COPIA esta URL** - la necesitarás para el frontend

### 2.6 Verificar que el Backend Funciona

1. Abre en tu navegador: `https://tu-backend-url.up.railway.app/health`
2. Deberías ver algo como:
   ```json
   {
     "status": "OK",
     "message": "API de Gestión de Flota PepsiCo",
     "timestamp": "...",
     "environment": "production"
   }
   ```

---

## Paso 3: Actualizar Frontend en Vercel 🔄

### 3.1 Obtener URL del Backend

Asegúrate de tener la URL del backend de Railway (del paso 2.5).

### 3.2 Configurar Variable de Entorno en Vercel

1. Ve a tu proyecto en **https://vercel.com**
2. Ve a **Settings** → **Environment Variables**
3. Busca o crea la variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://tu-backend-url.up.railway.app/api`
   - **Environments:** Production, Preview, Development (marca todas)
4. Click en **"Save"**

### 3.3 Redeploy del Frontend

1. En Vercel, ve a **Deployments**
2. Click en los tres puntos (**...**) del último deployment
3. Selecciona **"Redeploy"**
4. O simplemente haz un push a tu repositorio en GitHub

---

## Paso 4: Verificar que Todo Funciona ✅

### 4.1 Checklist de Verificación

- [ ] **Backend Health Check funciona:**
  - Abre: `https://tu-backend-url.up.railway.app/health`
  - Debe responder con status "OK"

- [ ] **Frontend carga correctamente:**
  - Abre: `https://tu-frontend.vercel.app`
  - Debe cargar sin errores en la consola

- [ ] **Login funciona:**
  - Intenta hacer login con credenciales de prueba
  - Debe conectarse al backend y autenticar

- [ ] **CORS configurado:**
  - Si ves errores de CORS, verifica que `FRONTEND_URL` en Railway sea correcta

### 4.2 Pruebas con Credenciales de Prueba

Si ejecutaste el seed en producción, puedes usar:
```
Email: admin@pepsico.cl
Password: admin123
```

---

## Paso 5: Monitoreo y Logs 🔍

### 5.1 Ver Logs del Backend

1. En Railway, ve a tu servicio backend
2. Click en la pestaña **"Deployments"**
3. Selecciona el último deployment
4. Verás los logs en tiempo real

### 5.2 Ver Logs del Frontend

1. En Vercel, ve a tu proyecto
2. Click en **Deployments**
3. Selecciona un deployment
4. Verás los logs del build y runtime

---

## Troubleshooting 🔧

### Problema: Backend no inicia

**Solución:**
1. Revisa los logs en Railway
2. Verifica que todas las variables de entorno estén configuradas
3. Verifica que `DATABASE_URL` sea correcta
4. Verifica que las migraciones se hayan ejecutado

### Problema: Error "Cannot connect to database"

**Solución:**
1. Verifica que `DATABASE_URL` en Railway sea la correcta de Neon
2. Verifica que Neon esté activo (no en pausa)
3. Prueba la conexión manualmente con Prisma Studio

### Problema: Frontend no se conecta al backend

**Solución:**
1. Verifica que `VITE_API_URL` en Vercel sea correcta
2. Verifica que `FRONTEND_URL` en Railway sea correcta (debe ser la URL de Vercel)
3. Revisa la consola del navegador para errores de CORS
4. Verifica que el backend esté corriendo (health check)

### Problema: Errores de CORS

**Solución:**
1. En Railway, agrega en Variables:
   ```
   ALLOWED_ORIGINS=https://tu-frontend.vercel.app
   ```
2. O agrega múltiples orígenes separados por coma:
   ```
   ALLOWED_ORIGINS=https://frontend.vercel.app,https://otro-dominio.com
   ```

---

## URLs Finales

Después de completar todos los pasos, tendrás:

```
Frontend:  https://tu-frontend.vercel.app
Backend:   https://tu-backend-url.up.railway.app/api
Health:    https://tu-backend-url.up.railway.app/health
Database:  (Neon dashboard - solo para admin)
```

---

## Costos Estimados 💰

### Opción Gratuita/Barata:
- **Neon:** $0/mes (free tier hasta 3GB)
- **Railway:** $5/mes (hobby plan, 500 horas gratis)
- **Vercel:** $0/mes (hobby plan)
- **Total:** ~$5/mes

### Opción Recomendada para Producción:
- **Neon:** $0-20/mes (según uso)
- **Railway:** $5-20/mes (según tráfico)
- **Vercel:** $0-20/mes (según tráfico)
- **Total:** ~$10-60/mes

---

## Próximos Pasos 🎯

Una vez que todo esté funcionando:

1. **Configurar dominio personalizado** (opcional)
   - En Railway: Settings → Networking → Custom Domain
   - En Vercel: Settings → Domains

2. **Configurar backups automáticos**
   - Neon tiene backups automáticos
   - Puedes configurar backups adicionales si necesitas

3. **Configurar monitoreo**
   - Railway tiene logs integrados
   - Puedes usar servicios como UptimeRobot para alertas

4. **Optimizar para producción**
   - Revisar rate limits
   - Configurar CDN para assets
   - Optimizar queries de base de datos

---

**¿Necesitas ayuda?** Revisa los logs en Railway y Vercel para más detalles de errores específicos.

