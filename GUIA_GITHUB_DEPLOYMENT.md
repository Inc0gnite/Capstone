# Guia: Subir a GitHub y Deployment Automático

Esta guía te explica paso a paso cómo subir tu proyecto a GitHub y configurarlo para que se despliegue automáticamente usando herramientas modernas.

## Tabla de Contenidos

1. [Preparación Pre-GitHub](#preparación)
2. [Subir a GitHub](#subir-github)
3. [Herramientas de Deployment Recomendadas](#herramientas)
4. [Configuración de Deployment Automático](#deployment-automatico)
5. [Variables de Entorno en Producción](#variables-entorno)
6. [Checklist Final](#checklist)

---

## 1. Preparación Pre-GitHub {#preparación}

### 1.1 Verificar .gitignore

Antes de subir, asegúrate de que tu `.gitignore` esté completo. Ya tienes uno, pero verifica que incluya:

```
- node_modules/
- .env (IMPORTANTE: nunca subir archivos .env)
- dist/ y build/
- logs/
- Base de datos local (prisma/dev.db)
- Archivos sensibles
```

**CRÍTICO:** Nunca subas archivos `.env` con contraseñas o secrets reales.

### 1.2 Limpiar Archivos Temporales

```bash
# Eliminar node_modules (se reinstalarán)
rm -rf node_modules frontend/node_modules backend/node_modules

# Eliminar builds anteriores
rm -rf frontend/dist backend/dist

# Limpiar cache
npm cache clean --force
```

### 1.3 Verificar que no hay Secrets en el Código

```bash
# Buscar posibles secrets en el código
grep -r "password" --include="*.ts" --include="*.js" --include="*.tsx"
grep -r "secret" --include="*.ts" --include="*.js"
grep -r "api_key" --include="*.ts" --include="*.js"
```

**Solución:** Si encuentras secrets, muévelos a variables de entorno.

---

## 2. Subir a GitHub {#subir-github}

### 2.1 Inicializar Git (si no está inicializado)

```bash
# En la raíz del proyecto
git init

# Verificar estado
git status
```

### 2.2 Crear Repositorio en GitHub

1. Ve a https://github.com
2. Click en "New repository"
3. Nombre: `pepsico-fleet-management` (o el que prefieras)
4. **NO marques** "Initialize with README" (ya tienes uno)
5. Clic en "Create repository"

### 2.3 Conectar y Subir

```bash
# Agregar remoto
git remote add origin https://github.com/TU_USUARIO/pepsico-fleet-management.git

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "Initial commit: Plataforma de Gestión de Flota PepsiCo"

# Cambiar a main (si estás en master)
git branch -M main

# Subir
git push -u origin main
```

**Listo:** Tu código está en GitHub.

---

## 3. Herramientas de Deployment Recomendadas {#herramientas}

### 3.1 Stack Recomendado (Mejor para Principiantes)

```
Frontend (React)  →  Vercel (GRATIS, fácil, automático)
Backend (Node.js) →  Railway (FÁCIL, $5/mes) o Render (GRATIS)
Base de Datos     →  Neon (GRATIS hasta 10GB) o Supabase (GRATIS)
```

### 3.2 Comparación Rápida

| Servicio | Tipo | Precio | Dificultad | Auto-deploy |
|----------|------|--------|------------|-------------|
| **Vercel** | Frontend | Gratis | Fácil | Sí |
| **Netlify** | Frontend | Gratis | Fácil | Sí |
| **Railway** | Backend | $5/mes | Medio | Sí |
| **Render** | Backend | Gratis* | Medio | Sí |
| **Neon** | Database | Gratis* | Fácil | N/A |
| **Supabase** | Database | Gratis* | Fácil | N/A |

*Free tier con límites

---

## 4. Configuración de Deployment Automático {#deployment-automatico}

### 4.1 Frontend con Vercel (Recomendado)

#### Paso 1: Conectar GitHub
1. Ve a https://vercel.com
2. "Sign Up" con tu cuenta de GitHub
3. Click en "Add New Project"
4. Selecciona tu repositorio: `pepsico-fleet-management`

#### Paso 2: Configurar Build
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### Paso 3: Variables de Entorno
En la sección "Environment Variables", agrega:

```env
VITE_API_URL=https://tu-backend.railway.app/api
VITE_APP_NAME=Gestión de Flota PepsiCo
```

#### Paso 4: Deploy
- Click en "Deploy"
- Vercel automáticamente:
  - Detecta cambios en `main`
  - Hace build
  - Despliega
  - Te da una URL: `tu-proyecto.vercel.app`

**Cada push a `main` = Deploy automático**

---

### 4.2 Backend con Railway

#### Paso 1: Crear Proyecto
1. Ve a https://railway.app
2. "Start a New Project"
3. "Deploy from GitHub repo"
4. Selecciona tu repositorio

#### Paso 2: Configurar
1. En "Settings" → "Service" → "Root Directory": `backend`
2. Railway detecta automáticamente:
   - Build: `npm install && npm run build`
   - Start: `npm start`

#### Paso 3: Variables de Entorno
En "Variables", agrega todas las de `backend/env.example.txt`:

```env
DATABASE_URL=postgresql://... (de Neon/Supabase)
NODE_ENV=production
PORT=3000
JWT_SECRET=genera-uno-nuevo-y-seguro-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://tu-frontend.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
LOG_LEVEL=info
```

**IMPORTANTE:** 
- Genera un `JWT_SECRET` nuevo y seguro (nunca uses el de desarrollo)
- Railway te da una URL: `backend-production.railway.app`

#### Paso 4: Conectar Base de Datos
1. En Railway, click "New" → "Database" → "Add PostgreSQL"
2. O conecta una base de datos externa (Neon/Supabase)
3. Copia el `DATABASE_URL` y pégalo en Variables de Entorno

#### Paso 5: Ejecutar Migraciones
```bash
# Opción 1: Desde Railway Dashboard
# Settings → Deploy → Post Deploy Command:
npm run db:generate && npm run db:migrate:deploy

# Opción 2: Desde tu máquina local
cd backend
DATABASE_URL="tu-production-db-url" npx prisma migrate deploy
```

**Cada push a `main` = Deploy automático**

---

### 4.3 Base de Datos con Neon (Recomendado)

#### Paso 1: Crear Base de Datos
1. Ve a https://neon.tech
2. "Sign Up" con GitHub
3. "Create Project"
4. Nombre: `pepsico-fleet-prod`
5. Región: La más cercana a Chile (US East/South America)

#### Paso 2: Obtener Connection String
1. En el dashboard, copia el connection string:
   ```
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

#### Paso 3: Aplicar Migraciones
```bash
cd backend

# Conectar y aplicar esquema
DATABASE_URL="tu-neon-url" npx prisma migrate deploy

# (Opcional) Seed inicial (solo roles y permisos)
DATABASE_URL="tu-neon-url" npm run db:seed
```

#### Paso 4: Conectar con Railway
- Pega el `DATABASE_URL` en Variables de Entorno de Railway

**Listo:** Base de datos en la nube

---

### 4.4 Alternativa: Backend con Render (Gratis)

#### Setup Similar:
1. https://render.com → "New Web Service"
2. Conectar GitHub
3. Configurar:
   - Build: `cd backend && npm install && npm run build`
   - Start: `cd backend && npm start`
4. Variables de entorno (mismas que Railway)
5. **Free tier se "duerme" después de inactividad** (primera request lenta)

---

## 5. Variables de Entorno en Producción {#variables-entorno}

### 5.1 Frontend (Vercel)

**Agregar en:** Project Settings → Environment Variables

```env
VITE_API_URL=https://backend-production.railway.app/api
VITE_APP_NAME=Gestión de Flota PepsiCo
```

### 5.2 Backend (Railway/Render)

**Agregar todas las variables de `backend/env.example.txt`** pero con valores de producción:

```env
# CRÍTICAS
DATABASE_URL=postgresql://... (de Neon)
NODE_ENV=production
JWT_SECRET=genera-nuevo-secreto-seguro-32+chars
FRONTEND_URL=https://tu-frontend.vercel.app

# OPCIONALES (si usas estas features)
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu-email@gmail.com
SMTP_PASS=app-password-de-gmail
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 5.3 Generar JWT_SECRET Seguro

```bash
# Opción 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 2: Online
# Ve a https://generate-secret.vercel.app/32
```

---

## 6. Deployment con GitHub Actions (Opcional pero Recomendado) {#github-actions}

Puedes automatizar tests antes de deploy. Ya tienes un workflow creado en `.github/workflows/ci.yml`.

**Nota:** Este workflow solo hace tests. El deploy real lo hacen Vercel y Railway automáticamente.

---

## 7. Flujo Completo de Trabajo {#flujo}

### Desarrollo Normal:

```bash
# 1. Crear feature branch
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar localmente
npm run dev

# 3. Commit
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 4. Push a GitHub
git push origin feature/nueva-funcionalidad

# 5. Crear Pull Request en GitHub
# (GitHub → Pull Requests → New PR)

# 6. Code review y merge a main

# 7. AUTOMÁTICO:
#    - Vercel detecta cambio en main
#    - Railway detecta cambio en main
#    - Ambos hacen deploy automático
#    - Tu app se actualiza sola
```

---

## 8. Verificar que Todo Funciona {#verificar}

### 8.1 Checklist Post-Deploy

```bash
# 1. Frontend responde
curl https://tu-frontend.vercel.app

# 2. Backend health check
curl https://tu-backend.railway.app/health

# 3. Frontend puede comunicarse con backend
# Abre: https://tu-frontend.vercel.app
# Intenta hacer login

# 4. Verificar logs
# Railway Dashboard → Logs
# Vercel Dashboard → Deployments → Logs
```

### 8.2 URLs Importantes

Anota estas URLs:

```
Frontend: https://tu-proyecto.vercel.app
Backend API: https://backend-production.railway.app/api
Health Check: https://backend-production.railway.app/health
Database: (solo para admin, desde Prisma Studio)
```

---

## 9. Troubleshooting Común {#troubleshooting}

### Problema: Frontend no se conecta al backend

**Causa:** CORS o URL incorrecta

**Solución:**
1. Verificar `VITE_API_URL` en Vercel apunta al backend correcto
2. Verificar `FRONTEND_URL` en Railway apunta al frontend correcto
3. Verificar CORS en backend permite el dominio de Vercel

### Problema: Backend da error 500

**Causa:** Variables de entorno faltantes o base de datos no conectada

**Solución:**
1. Revisar logs en Railway
2. Verificar que todas las variables de entorno estén configuradas
3. Verificar que DATABASE_URL es correcta
4. Verificar migraciones aplicadas

### Problema: Build falla

**Causa:** Dependencias o TypeScript errors

**Solución:**
1. Revisar logs del build en Vercel/Railway
2. Probar build local: `npm run build`
3. Verificar que todas las dependencias estén en `package.json`

---

## 10. Checklist Final {#checklist}

### Antes de Subir a GitHub
- [ ] `.gitignore` está completo
- [ ] No hay archivos `.env` en el repositorio
- [ ] No hay secrets hardcodeados en el código
- [ ] `README.md` está actualizado
- [ ] Código funciona localmente (`npm run dev`)

### Después de Subir a GitHub
- [ ] Repositorio creado y código subido
- [ ] `.gitignore` funcionando (no se ven `node_modules/`)

### Configuración de Deployment
- [ ] Vercel conectado y configurado (frontend)
- [ ] Railway/Render conectado y configurado (backend)
- [ ] Neon/Supabase creado (base de datos)
- [ ] Migraciones aplicadas en producción
- [ ] Todas las variables de entorno configuradas

### Post-Deployment
- [ ] Frontend se carga correctamente
- [ ] Backend health check responde
- [ ] Login funciona
- [ ] CORS configurado correctamente
- [ ] Logs se ven en Railway/Vercel

---

## 11. Costos Estimados {#costos}

### Setup Gratis (Para empezar)
```
Frontend (Vercel):     $0/mes (hobby plan)
Backend (Render):      $0/mes (free tier con limitaciones)
Base de Datos (Neon):  $0/mes (hasta 10GB)
────────────────────────────────────────
TOTAL:                 $0/mes
```

### Setup Recomendado (Producción)
```
Frontend (Vercel):     $0-20/mes (hobby/pro)
Backend (Railway):     $5-20/mes (hobby/pro)
Base de Datos (Neon):  $0-20/mes (free/pro)
────────────────────────────────────────
TOTAL:                 $5-60/mes
```

**Recomendación:** Empieza gratis, escala cuando necesites.

---

## 12. Recursos Adicionales {#recursos}

### Documentación Oficial
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Neon Docs](https://neon.tech/docs)
- [GitHub Actions](https://docs.github.com/en/actions)

### Tu Documentación Existente
- `docs/GUIA_DEPLOYMENT.md` - Guía detallada de deployment
- `README.md` - Documentación del proyecto

---

## 13. Siguientes Pasos {#siguientes-pasos}

1. **Ahora:** Sube tu código a GitHub
2. **Luego:** Configura Vercel para frontend
3. **Luego:** Configura Railway para backend
4. **Luego:** Crea base de datos en Neon
5. **Finalmente:** ¡Tu app está en producción!

---

**¿Dudas?** Revisa `docs/GUIA_DEPLOYMENT.md` para más detalles técnicos.

---

**Creado para:** Proyecto Capstone - PepsiCo Fleet Management  
**Fecha:** 2024  
**Versión:** 1.0

