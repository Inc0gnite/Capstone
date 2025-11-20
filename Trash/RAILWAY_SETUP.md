# 🚂 Guía de Deployment en Railway

## Configuración Paso a Paso

### 1. Crear cuenta en Railway
- Ve a https://railway.app
- Crea cuenta con GitHub
- Conecta tu cuenta de GitHub

### 2. Crear nuevo proyecto
1. Click en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Selecciona el repositorio `Inc0gnite/Capstone`
4. Selecciona la rama `main`

### 3. Configurar servicios
En Railway necesitarás **DOS servicios** (backend y frontend). Puedes crearlos manualmente o dejando que Railway detecte `railway.json` en la raíz del repo y proponga ambos servicios automáticamente.

#### A) Base de Datos PostgreSQL
1. Click en "+ New" → "Database" → "PostgreSQL"
2. Railway creará automáticamente la base de datos
3. Copia la **DATABASE_URL** que se genera automáticamente
4. Guárdala para el paso siguiente

#### B) Backend API
1. Click en "+ New" → "GitHub Repo"
2. Selecciona nuevamente el repositorio
3. Configure el servicio:

**Settings del servicio:**
- **Name:** `pepsico-backend`
- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run build && npm run db:generate`
- **Start Command:** `npm start` (ejecuta migraciones en `prestart` y levanta Express)

**Variables de entorno:**
```env
DATABASE_URL=postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/BASE?sslmode=require
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://capstone-frontend-chi-five.vercel.app
JWT_SECRET=300719080102
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=imsuicideboys@gmail.com
SMTP_PASS=wwlcqtagrfvuhrhf
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
LOG_LEVEL=info
```

#### C) Frontend (React + Vite)
1. Click en "+ New" → "GitHub Repo"
2. Selecciona el mismo repositorio

**Settings del servicio:**
- **Name:** `pepsico-frontend`
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start` (sirve el build con `vite preview` en `$PORT`)

**Variables de entorno:**
```env
NODE_ENV=production
# URL del backend de Railway (con /api al final)
VITE_API_URL=https://TU_BACKEND.up.railway.app/api
```

### 4. Ejecutar migraciones
Después del primer deploy, necesitas ejecutar las migraciones:

1. En Railway, abre el servicio del backend
2. Ve a la pestaña "Deployments"
3. Click en "Execute Command"
4. Ejecuta: `npm run db:migrate:deploy`

### 5. Obtener URL del backend
1. En Railway, click en el servicio del backend
2. Ve a "Settings" → "Networking"
3. Click en "Generate Domain"
4. Railway te dará una URL como: `pepsico-backend-production-xxxx.up.railway.app`
5. Copia esta URL

### 6. Conectar Frontend con Backend (ambos en Railway)
1. Copia la URL del backend desde Networking, por ejemplo:
   `https://pepsico-backend-production-xxxx.up.railway.app`
2. En el servicio del frontend, en "Variables", configura:
   `VITE_API_URL=https://pepsico-backend-production-xxxx.up.railway.app/api`
3. Redeploy del frontend.

### 7. Configurar dominio personalizado (opcional)
En Railway:
1. Settings → Networking → Custom Domain
2. Agrega tu dominio (ej: `api.fleet.pepsico.cl`)
3. Configura los registros DNS según instrucciones

## ✅ Checklist de Verificación

- [ ] PostgreSQL creado en Railway
- [ ] Backend desplegado y corriendo
- [ ] Migraciones ejecutadas
- [ ] Variables de entorno configuradas
- [ ] Frontend actualizado con nueva URL del backend
- [ ] Probado login desde el frontend
- [ ] Probado creación de órdenes de trabajo
- [ ] Logs funcionando correctamente

## 🐛 Troubleshooting

### Error: "DATABASE_URL not found"
- Verifica que la variable de entorno esté configurada correctamente
- Asegúrate de copiar la URL completa de PostgreSQL

### Error: "Connection refused"
- Verifica que PostgreSQL esté corriendo
- Verifica que `DATABASE_URL` tenga el formato correcto

### Error: "Prisma client not generated"
- Ejecuta manualmente: `npm run db:generate`
- O agrega `npm run db:generate` al build command

### Deploy fallando
- Revisa los logs en Railway
- Verifica que TypeScript compile sin errores
- Asegúrate de que `@vercel/node` NO esté en dependencies (solo en devDependencies)

## 💰 Costos

**Railway:**
- Free: $5 créditos gratis/mes
- Pro: $5/mes + $0.000463 por GB-hour de uso
- PostgreSQL: Incluido en el plan

**Estimación para tu proyecto:**
- Backend: ~$5-10/mes
- PostgreSQL: Incluido

**Total aproximado: $10-15/mes**

## 📊 Monitoreo

Railway te da:
- Logs en tiempo real
- Métricas de CPU/RAM
- Uptime monitoring
- Alertas por email

## 🔄 CI/CD Automático

Cada push a `main` en GitHub:
1. Railway detecta el cambio
2. Ejecuta build automáticamente
3. Despliega nueva versión
4. Mantiene la base de datos intacta

## 📦 railway.json
Este repositorio incluye `railway.json` en la raíz con dos servicios preconfigurados:
- `backend`: construye con TypeScript, ejecuta `prisma generate`, corre migraciones en `prestart` y expone `/health`.
- `frontend`: construye con Vite y sirve el build con `vite preview` en el puerto que asigna Railway.

¡Listo! Tu backend estará funcionando en Railway 🚀

