# 🚀 Guía: Empezar Desde Cero en Railway

## ✅ Preparación Antes de Empezar

### 1. Verificar que Todo Esté en GitHub

Asegúrate de que todos los cambios estén commiteados y pusheados:

```bash
git status
git log --oneline -3
```

Debes ver los últimos commits relacionados con Prisma y Railway.

---

## 🗑️ Paso 1: Eliminar Servicios Actuales en Railway

### ⚠️ IMPORTANTE: Guarda las Variables de Entorno Primero

**ANTES de eliminar nada:**

1. **Railway → Backend Service → Settings → Variables**
2. **Anota TODAS las variables** (especialmente `DATABASE_URL`, `JWT_SECRET`, etc.)
3. **O exporta/copia cada una** para tenerlas a mano

### Eliminar Servicios:

1. **Railway → Tu Proyecto**
2. **Click en el servicio "backend"**
3. **Settings → Delete Service** (o el botón de eliminar)
4. **Confirma la eliminación**
5. **Repite con el servicio "frontend"** (si lo tienes)
6. **NO elimines el servicio PostgreSQL** (a menos que quieras crear uno nuevo)

---

## 🆕 Paso 2: Crear Nuevo Servicio Backend

### 2.1 Crear el Servicio

1. **Railway → Tu Proyecto → "+ New"**
2. **Selecciona "GitHub Repo"**
3. **Selecciona tu repositorio:** `Inc0gnite/Capstone`
4. **Selecciona la rama:** `master` (o `main`)

### 2.2 Configurar el Servicio

**Settings del servicio:**

- **Name:** `backend`
- **Root Directory:** `backend` ⚠️ **IMPORTANTE: Debe ser `backend`**
- **Build Command:** (dejar vacío o usar el del `railway.json`)
- **Start Command:** (dejar vacío o usar el del `railway.json`)
- **Port:** `3000`

**O mejor aún:** Deja Build Command y Start Command vacíos para que Railway use el `railway.json` automáticamente.

---

## 🔧 Paso 3: Configurar Variables de Entorno

**Railway → Backend Service → Settings → Variables**

Agrega todas las variables que guardaste antes:

```env
DATABASE_URL=postgresql://usuario:password@host:puerto/database?sslmode=require
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://tu-frontend.vercel.app
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_app
LOG_LEVEL=info
```

**IMPORTANTE:** 
- Copia el `DATABASE_URL` del servicio PostgreSQL de Railway
- Si creaste un nuevo PostgreSQL, usa esa URL
- Si mantuviste el PostgreSQL anterior, usa esa URL

---

## 🔗 Paso 4: Conectar PostgreSQL

1. **Railway → Backend Service → Settings → Variables**
2. Si PostgreSQL no está conectado automáticamente:
   - Busca "Add Variable" o "Connect Database"
   - Selecciona tu servicio PostgreSQL
   - Railway agregará automáticamente `DATABASE_URL`

---

## ✅ Paso 5: Verificar railway.json

Asegúrate de que el `railway.json` esté correcto. Debe tener:

```json
{
  "services": [
    {
      "name": "backend",
      "rootDirectory": "backend",
      "buildCommand": "cd backend && npm install && npm run build && npm run db:generate && npm run db:push",
      "startCommand": "cd backend && npm run db:push && node dist/index.js",
      "port": 3000
    }
  ]
}
```

**Si Railway no detecta el `railway.json` automáticamente:**

1. Ve a Settings → Build Command
2. Pega: `cd backend && npm install && npm run build && npm run db:generate && npm run db:push`
3. Ve a Settings → Start Command
4. Pega: `cd backend && npm run db:push && node dist/index.js`

---

## 🚀 Paso 6: Deploy

1. **Railway hará deploy automáticamente** después de crear el servicio
2. **O manualmente:** Click en "Deploy" o "Redeploy"

---

## ✅ Paso 7: Verificar Logs

### Logs del Build:

Busca en los logs:
```
cd backend
npm install
npm run build
npm run db:generate
npm run db:push
Push finished ✅
```

### Logs del Deploy/Start:

Busca:
```
cd backend
npm run db:push
Push finished ✅
Servidor corriendo en http://localhost:3000
```

**NO debe haber:**
- ❌ `sh: 1: prisma: not found`
- ❌ `The table public.users does not exist`

---

## 📋 Checklist Final

Antes de considerar que está funcionando:

- [ ] Servicio backend creado
- [ ] Root Directory configurado como `backend`
- [ ] Build Command tiene `cd backend &&`
- [ ] Start Command tiene `cd backend &&`
- [ ] Variables de entorno configuradas (especialmente `DATABASE_URL`)
- [ ] PostgreSQL conectado
- [ ] Logs del build muestran "Push finished"
- [ ] Logs del start muestran "Servidor corriendo"
- [ ] Health check responde OK

---

## 🆘 Si Algo Falla

### Error: "prisma: not found"
- Verifica que Build Command y Start Command tengan `cd backend &&`
- Verifica que Root Directory sea `backend`

### Error: "table users does not exist"
- Verifica que `npm run db:push` se ejecutó en los logs
- Verifica que `DATABASE_URL` está configurada correctamente

### Error: Build Command falla
- Verifica que Root Directory sea `backend`
- Verifica que el Build Command tenga `cd backend &&` al inicio

---

**Siguiendo estos pasos desde cero, deberías tener un deployment limpio y funcional.**

