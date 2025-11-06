# 🔧 Configuración para Railway - Variables de Entorno

## 📋 DATABASE_URL para Railway

Copia y pega esta variable en Railway:

```
DATABASE_URL=postgresql://neondb_owner:npg_yWJnS2G0TQvD@ep-withered-bonus-ah13f5bx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**⚠️ IMPORTANTE:**
- NO incluyas las comillas (`"`) cuando lo pegues en Railway
- Railway agregará las comillas automáticamente si es necesario

---

## 📝 Todas las Variables de Entorno para Railway

Copia estas variables una por una en Railway (Settings → Variables):

### 1. Base de Datos (OBLIGATORIO)
```
DATABASE_URL=postgresql://neondb_owner:npg_yWJnS2G0TQvD@ep-withered-bonus-ah13f5bx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. Servidor
```
PORT=3000
NODE_ENV=production
```

### 3. Frontend URL (OBLIGATORIO - Actualiza con tu URL real de Vercel)
```
FRONTEND_URL=https://tu-frontend.vercel.app
```

### 4. JWT Secret (OBLIGATORIO - Genera uno nuevo para producción)
```
JWT_SECRET=109a315bf239cd65ec0f27589a1d15f801bbfc8e989654d8a9ecc55b464aa3a3
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 5. Email (Opcional pero recomendado)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=imsuicideboys@gmail.com
SMTP_PASS=wwlcqtagrfvuhrhf
```

### 6. Cloudinary (Opcional - para imágenes)
```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 7. Logs
```
LOG_LEVEL=info
```

### 8. CORS (Si tienes múltiples dominios)
```
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```

---

## 🎯 Pasos para Configurar en Railway

1. **Ve a Railway Dashboard:** https://railway.app
2. **Selecciona tu proyecto** → **Backend service**
3. **Click en "Variables"** (en el menú lateral)
4. **Click en "New Variable"** para cada una
5. **Copia y pega** cada variable de arriba
6. **Guarda** cada una

---

## ✅ Verificación

Después de configurar todas las variables:

1. **Haz un redeploy** en Railway (o espera a que se actualice automáticamente)
2. **Verifica los logs** para asegurarte de que:
   - Se conecta a la base de datos sin errores
   - El servidor inicia correctamente
3. **Prueba el health check:** `https://tu-backend.railway.app/health`

---

## 🔍 Verificar Conexión a Base de Datos

Si quieres probar la conexión antes de deployar:

```bash
cd backend

# Probar conexión con tu DATABASE_URL
DATABASE_URL="postgresql://neondb_owner:npg_yWJnS2G0TQvD@ep-withered-bonus-ah13f5bx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma migrate deploy
```

Esto aplicará las migraciones y verificará la conexión.

---

## ⚠️ Notas Importantes

1. **Nunca compartas tu connection string públicamente** (ya lo hicimos aquí solo para configurar, pero en producción guárdalo seguro)

2. **El JWT_SECRET que pusimos es solo un ejemplo** - Railway ya debería tener uno generado, o puedes usar el que ya tienes

3. **Actualiza FRONTEND_URL** con la URL real de tu frontend en Vercel antes de hacer deploy

4. **Railway necesita que las migraciones se ejecuten** - esto debería pasar automáticamente en el script `prestart` de tu `package.json`

---

**¿Listo para deployar?** Sigue los pasos en `DEPLOYMENT_PASO_A_PASO.md`

