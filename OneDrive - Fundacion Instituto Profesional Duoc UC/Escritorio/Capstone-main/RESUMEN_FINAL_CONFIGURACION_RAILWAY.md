# 📋 Resumen Final: Configuración Completa para Railway

## ✅ Estado Actual del Código en GitHub

Todos los cambios están commiteados y pusheados:
- ✅ Prisma en `dependencies`
- ✅ Scripts usando `npx prisma`
- ✅ `railway.json` configurado correctamente
- ✅ `prestart` simplificado

---

## 🚀 Configuración para Nuevo Servicio en Railway

### 1. Settings del Servicio

**Name:** `backend`

**Root Directory:** `backend` ⚠️ **MUY IMPORTANTE**

**Build Command:**
```
cd backend && npm install && npm run build && npm run db:generate && npm run db:push
```

**Start Command:**
```
cd backend && npm run db:push && node dist/index.js
```

**Port:** `3000`

---

## 🔐 Variables de Entorno (Corregidas)

### ⚠️ CORRECCIONES IMPORTANTES:

- `SMPT_PASS` → **`SMTP_PASS`** (había un typo)
- `SMTP_HOT` → **`SMTP_HOST`** (había un typo)
- `FRONTEND_URL` → Agregar `https://` al inicio

### Lista Completa (Copia y Pega en Railway):

```
ALLOWED_ORIGINS=https://frontend-production-8642.up.railway.app
DATABASE_URL=postgresql://postgres:MbgsRtXxNWsBzNlmrwuQpABOnqtofrgD@tramway.proxy.rlwy.net:16998/railway?sslmode=require
FRONTEND_URL=https://frontend-production-8642.up.railway.app
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_SECRET=300719080102
LOG_LEVEL=info
NODE_ENV=production
PORT=3000
SMTP_PASS=wwlcqtagrfvuhrhf
SMTP_PORT=587
SMTP_HOST=smtp.gmail.com
SMTP_USER=imsuicideboys@gmail.com
```

---

## 📝 Pasos para Empezar Desde Cero

### Paso 1: Eliminar Servicio Actual
1. Railway → Backend Service → Settings → Delete Service
2. **Guarda las variables antes de eliminar** (ya las tienes arriba)

### Paso 2: Crear Nuevo Servicio
1. Railway → "+ New" → "GitHub Repo"
2. Repositorio: `Inc0gnite/Capstone`
3. Rama: `master`

### Paso 3: Configurar Settings
- Root Directory: `backend`
- Build Command: `cd backend && npm install && npm run build && npm run db:generate && npm run db:push`
- Start Command: `cd backend && npm run db:push && node dist/index.js`
- Port: `3000`

### Paso 4: Agregar Variables de Entorno
Copia las variables de arriba (ya corregidas) en Railway → Variables

### Paso 5: Conectar PostgreSQL
Si no se conecta automáticamente:
- Railway → Variables → Connect Database
- Selecciona tu PostgreSQL

---

## ✅ Verificación Después del Deploy

### Logs del Build:
```
cd backend
npm install
npm run build
npm run db:generate
npm run db:push
Push finished ✅
```

### Logs del Start:
```
cd backend
npm run db:push
Push finished ✅
Servidor corriendo en http://localhost:3000 ✅
```

### Health Check:
Visita: `https://tu-backend.up.railway.app/health`
Debe responder: `{"status": "OK", ...}`

---

**Con esta configuración, el sistema debería funcionar correctamente desde cero.**

