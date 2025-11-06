# 🚀 Guía de Deployment - PepsiCo Fleet Management

## 📋 Índice

1. [Preparación para Producción](#preparación)
2. [Deployment de Base de Datos](#base-de-datos)
3. [Deployment del Backend](#backend)
4. [Deployment del Frontend](#frontend)
5. [Configuración de Dominios](#dominios)
6. [Monitoreo y Logs](#monitoreo)
7. [Rollback y Recuperación](#rollback)

---

## 1. Preparación para Producción

### 1.1 Checklist Pre-Deployment

**Backend:**
- [ ] Todas las variables de entorno configuradas
- [ ] JWT_SECRET cambiado (no usar el de desarrollo)
- [ ] NODE_ENV=production
- [ ] Rate limiting configurado
- [ ] CORS configurado con dominio correcto
- [ ] Logs configurados
- [ ] Database migrations aplicadas
- [ ] Seed de producción preparado (solo datos necesarios)
- [ ] Tests pasando
- [ ] No hay console.logs en código

**Frontend:**
- [ ] VITE_API_URL apunta a producción
- [ ] Build optimizado (npm run build)
- [ ] Imágenes optimizadas
- [ ] No hay console.logs en código
- [ ] Error boundaries implementados
- [ ] Loading states en todas las requests

**Base de Datos:**
- [ ] Backup realizado
- [ ] Migraciones probadas en staging
- [ ] Índices optimizados
- [ ] Constraints configurados

### 1.2 Ambientes

**Recomendación:**

```
Development  →  Staging  →  Production
(localhost)     (staging)    (producción)
```

**URLs de ejemplo:**
```
Development:
- Backend:  http://localhost:3000
- Frontend: http://localhost:5173
- Database: localhost:5432

Staging:
- Backend:  https://api-staging.fleet.pepsico.cl
- Frontend: https://staging.fleet.pepsico.cl
- Database: staging-db.neon.tech

Production:
- Backend:  https://api.fleet.pepsico.cl
- Frontend: https://fleet.pepsico.cl
- Database: prod-db.neon.tech
```

---

## 2. Deployment de Base de Datos

### 2.1 Opción A: Neon (Recomendado)

**Ventajas:**
- ✅ Gratis hasta 10GB
- ✅ Serverless (escala automáticamente)
- ✅ Backups automáticos
- ✅ Point-in-time recovery
- ✅ SSL/TLS incluido

**Setup:**

1. **Crear cuenta en https://neon.tech**

2. **Crear proyecto de producción:**
   - Nombre: `pepsico-fleet-prod`
   - Región: `US East (Ohio)` o más cercana

3. **Copiar connection string:**
   ```
   postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

4. **Aplicar migraciones:**
   ```bash
   cd backend
   DATABASE_URL="tu_connection_string" npx prisma migrate deploy
   ```

5. **Seed de producción (opcional):**
   ```bash
   # Solo roles, permisos y datos maestros
   DATABASE_URL="tu_connection_string" npm run db:seed:prod
   ```

### 2.2 Opción B: Supabase

**Setup similar a Neon:**

1. Crear proyecto en https://supabase.com
2. Obtener connection string
3. Aplicar migraciones

### 2.3 Opción C: PostgreSQL Propio

**En servidor:**

```bash
# Instalar PostgreSQL
sudo apt-get install postgresql-15

# Crear usuario y base de datos
sudo -u postgres psql
CREATE USER pepsico WITH PASSWORD 'secure_password';
CREATE DATABASE pepsico_fleet OWNER pepsico;
GRANT ALL PRIVILEGES ON DATABASE pepsico_fleet TO pepsico;
\q

# Configurar acceso remoto
sudo nano /etc/postgresql/15/main/pg_hba.conf
# Agregar: host all all 0.0.0.0/0 md5

# Reiniciar
sudo systemctl restart postgresql
```

### 2.4 Backups

**Backup automático (cron job):**

```bash
# Crear script de backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U pepsico -h host -d pepsico_fleet > /backups/db_$DATE.sql
gzip /backups/db_$DATE.sql

# Eliminar backups antiguos (más de 30 días)
find /backups -name "*.sql.gz" -mtime +30 -delete

# Agregar a crontab (diario a las 2 AM)
0 2 * * * /path/to/backup_script.sh
```

---

## 3. Deployment del Backend

### 3.1 Opción A: Railway (Recomendado)

**Ventajas:**
- ✅ Deploy automático desde GitHub
- ✅ Variables de entorno fáciles
- ✅ Logs en tiempo real
- ✅ $5/mes plan inicial

**Setup:**

1. **Ir a https://railway.app**

2. **New Project → Deploy from GitHub**

3. **Seleccionar repositorio y branch `main`**

4. **Configurar:**
   - Root directory: `backend`
   - Build command: `npm run build`
   - Start command: `npm start`

5. **Variables de entorno:**
   ```env
   DATABASE_URL=postgresql://...
   NODE_ENV=production
   JWT_SECRET=generar-secreto-seguro
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   FRONTEND_URL=https://fleet.pepsico.cl
   PORT=3000
   ```

6. **Deploy automático:**
   - Cada push a `main` despliega automáticamente

7. **Obtener URL:**
   - Railway te dará una URL como: `backend-production-xxxx.up.railway.app`
   - O puedes configurar dominio custom

### 3.2 Opción B: Render

**Setup similar a Railway:**

1. Crear cuenta en https://render.com
2. New Web Service → Connect GitHub
3. Configurar:
   - Build: `cd backend && npm install && npm run build`
   - Start: `cd backend && npm start`
4. Variables de entorno
5. Deploy

### 3.3 Opción C: VPS Propio (Digital Ocean, AWS EC2, etc.)

**Setup en Ubuntu:**

```bash
# 1. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Instalar PM2
sudo npm install -g pm2

# 3. Clonar repositorio
git clone <repo-url>
cd backend

# 4. Instalar dependencias
npm install

# 5. Crear .env
nano .env
# Pegar variables de producción

# 6. Build
npm run build

# 7. Generar Prisma
npm run db:generate

# 8. Migraciones
npm run db:migrate

# 9. Iniciar con PM2
pm2 start dist/index.js --name pepsico-backend

# 10. Configurar inicio automático
pm2 startup
pm2 save

# 11. Logs
pm2 logs pepsico-backend
```

**Nginx como reverse proxy:**

```nginx
# /etc/nginx/sites-available/pepsico-api
server {
    listen 80;
    server_name api.fleet.pepsico.cl;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Habilitar
sudo ln -s /etc/nginx/sites-available/pepsico-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**SSL con Let's Encrypt:**

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.fleet.pepsico.cl
```

---

## 4. Deployment del Frontend

### 4.1 Opción A: Vercel (Recomendado)

**Ventajas:**
- ✅ Deploy automático desde GitHub
- ✅ CDN global
- ✅ SSL automático
- ✅ Preview deployments para PRs
- ✅ Gratis para proyectos personales

**Setup:**

1. **Ir a https://vercel.com**

2. **Import Project → GitHub**

3. **Configurar:**
   - Framework: Vite
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`

4. **Variables de entorno:**
   ```env
   VITE_API_URL=https://backend-production.up.railway.app/api
   VITE_APP_NAME=Gestión de Flota PepsiCo
   ```

5. **Deploy:**
   - Push a `main` despliega automáticamente
   - Vercel te da URL: `pepsico-fleet.vercel.app`

6. **Dominio custom (opcional):**
   - Settings → Domains
   - Agregar: `fleet.pepsico.cl`
   - Configurar DNS según instrucciones

### 4.2 Opción B: Netlify

**Setup:**

1. Conectar GitHub
2. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. Variables de entorno
4. Deploy

### 4.3 Opción C: VPS con Nginx

```bash
# 1. Build local
cd frontend
npm run build

# 2. Subir carpeta dist/ al servidor
scp -r dist/* user@servidor:/var/www/fleet

# 3. Nginx config
server {
    listen 80;
    server_name fleet.pepsico.cl;
    root /var/www/fleet;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# 4. SSL
sudo certbot --nginx -d fleet.pepsico.cl
```

---

## 5. Configuración de Dominios

### 5.1 DNS Records

**Para Backend (Railway/Render):**

```
Type: CNAME
Name: api
Value: backend-production-xxxx.up.railway.app
TTL: 3600
```

**Para Frontend (Vercel):**

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

### 5.2 SSL/TLS

**Automático en:**
- ✅ Vercel (frontend)
- ✅ Railway (backend)
- ✅ Render
- ✅ Netlify

**Manual en VPS:**
```bash
sudo certbot --nginx -d api.fleet.pepsico.cl -d fleet.pepsico.cl
```

---

## 6. Monitoreo y Logs

### 6.1 Railway Logs

```bash
# CLI de Railway
npm install -g @railway/cli

# Login
railway login

# Ver logs
railway logs

# Logs en tiempo real
railway logs --follow
```

### 6.2 Sentry (Error Tracking)

**Setup:**

```bash
npm install @sentry/node @sentry/react
```

**Backend:**
```typescript
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
})

app.use(Sentry.Handlers.errorHandler())
```

**Frontend:**
```typescript
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE
})
```

### 6.3 Uptime Monitoring

**Opciones:**
- UptimeRobot (gratis)
- Pingdom
- StatusCake

**Configurar checks:**
```
GET https://api.fleet.pepsico.cl/health
Intervalo: 5 minutos
Alerta si falla 3 veces consecutivas
```

---

## 7. Rollback y Recuperación

### 7.1 Rollback de Backend (Railway)

```bash
# Ver deployments anteriores
railway deployments

# Rollback a deployment anterior
railway rollback <deployment-id>
```

### 7.2 Rollback de Frontend (Vercel)

1. Dashboard de Vercel
2. Deployments
3. Click en deployment anterior
4. "Promote to Production"

### 7.3 Rollback de Database

**Opción 1: Restore desde backup**
```bash
# Si usas pg_dump
psql -U usuario -d pepsico_fleet < backup_20241015.sql
```

**Opción 2: Revert migration (Prisma)**
```bash
# Ver migraciones
npx prisma migrate status

# Revert última migración
npx prisma migrate resolve --rolled-back <migration-name>

# Aplicar migración anterior
npx prisma migrate deploy
```

### 7.4 Disaster Recovery Plan

**Escenario 1: Backend caído**
1. Verificar logs en Railway
2. Verificar health endpoint
3. Si es necesario, rollback
4. Notificar al equipo

**Escenario 2: Base de datos corrupta**
1. Detener aplicación
2. Restore último backup
3. Aplicar migraciones pendientes
4. Verificar integridad
5. Reiniciar aplicación

**Escenario 3: Frontend no carga**
1. Verificar Vercel status
2. Verificar VITE_API_URL
3. Rollback a deployment anterior
4. Rebuild si es necesario

---

## 8. CI/CD con GitHub Actions

### 8.1 Workflow Completo

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install Backend Dependencies
        working-directory: ./backend
        run: npm install
      
      - name: Lint Backend
        working-directory: ./backend
        run: npm run lint
      
      - name: Build Backend
        working-directory: ./backend
        run: npm run build
      
      - name: Run Backend Tests
        working-directory: ./backend
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Install Frontend Dependencies
        working-directory: ./frontend
        run: npm install
      
      - name: Lint Frontend
        working-directory: ./frontend
        run: npm run lint
      
      - name: Build Frontend
        working-directory: ./frontend
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

### 8.2 Secrets de GitHub

**Configurar en:** Repository Settings → Secrets and variables → Actions

```
DATABASE_URL=postgresql://...
RAILWAY_TOKEN=xxx
VERCEL_TOKEN=xxx
VERCEL_ORG_ID=xxx
VERCEL_PROJECT_ID=xxx
VITE_API_URL=https://api.fleet.pepsico.cl/api
JWT_SECRET=super-secret-production-key
```

---

## 9. Performance y Escalabilidad

### 9.1 Optimización de Backend

**Horizontal Scaling:**
```
Load Balancer
    ├── Backend Instance 1
    ├── Backend Instance 2
    └── Backend Instance 3
        ↓
    Database (shared)
```

**Configurar en Railway:**
- Settings → Scaling
- Horizontal Autoscaling: ON
- Min instances: 1
- Max instances: 5

**Caching con Redis:**
```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

// Cache de queries frecuentes
async function getVehicles() {
  const cached = await redis.get('vehicles:all')
  if (cached) return JSON.parse(cached)
  
  const vehicles = await prisma.vehicle.findMany()
  await redis.setex('vehicles:all', 300, JSON.stringify(vehicles))
  return vehicles
}
```

### 9.2 Optimización de Frontend

**Code Splitting:**
```typescript
// Lazy load de páginas
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard'))

// En Routes
<Route path="/admin" element={
  <Suspense fallback={<Loading />}>
    <AdminDashboard />
  </Suspense>
} />
```

**CDN para Assets:**
- Imágenes en Cloudinary
- Archivos estáticos en CDN de Vercel/Cloudflare

---

## 10. Monitoreo Post-Deployment

### 10.1 Health Checks

**Configurar checks periódicos:**

```typescript
// backend/src/routes/health.ts
router.get('/health/full', async (req, res) => {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`
    
    // Check Redis (si se usa)
    // await redis.ping()
    
    return res.json({
      status: 'OK',
      database: 'connected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return res.status(503).json({
      status: 'ERROR',
      error: error.message
    })
  }
})
```

**Monitorear con UptimeRobot:**
- URL: `https://api.fleet.pepsico.cl/health`
- Intervalo: 5 minutos
- Alertas a: email del equipo

### 10.2 Logs Centralizados

**Opciones:**
- Papertrail (gratis hasta 50MB/mes)
- Logtail
- DataDog

**Configurar Winston con transporte remoto:**

```typescript
import WinstonCloudwatch from 'winston-cloudwatch'

logger.add(new WinstonCloudwatch({
  logGroupName: 'pepsico-fleet',
  logStreamName: 'backend-production',
  awsRegion: 'us-east-1',
  jsonMessage: true
}))
```

### 10.3 Alertas

**Configurar alertas para:**
- ❌ Endpoint down por >5 minutos
- ⚠️ Tasa de errores >5%
- ⚠️ Response time >1 segundo
- ⚠️ CPU >80% por >10 minutos
- ⚠️ Memoria >90%
- ❌ Database connection failed

---

## 11. Actualización en Producción

### 11.1 Proceso de Actualización

```bash
# 1. Feature branch
git checkout -b feature/nueva-feature

# 2. Desarrollo
# ... codificar ...

# 3. Tests
npm test

# 4. PR a develop
git push origin feature/nueva-feature
# Crear PR en GitHub

# 5. Code review

# 6. Merge a develop

# 7. Deploy a staging
git checkout develop
git pull
# Auto-deploy a staging

# 8. QA en staging

# 9. PR de develop a main

# 10. Deploy a producción
git checkout main
git pull
# Auto-deploy a producción

# 11. Verificar en producción

# 12. Tag de versión
git tag v1.1.0
git push --tags
```

### 11.2 Migrations en Producción

**Nunca usar `db:push` en producción. Siempre usar migrations:**

```bash
# Crear migración en desarrollo
npx prisma migrate dev --name add_new_feature

# Aplicar en producción
DATABASE_URL="production_url" npx prisma migrate deploy
```

**Con zero-downtime:**

1. Crear migración backward-compatible
2. Deploy nuevo código
3. Ejecutar migración
4. Verificar
5. Cleanup de código legacy (en siguiente release)

---

## 12. Security Checklist

### 12.1 Pre-Deployment

- [ ] Todas las secrets en variables de entorno (no en código)
- [ ] JWT_SECRET es único y seguro (min 32 chars)
- [ ] CORS configurado con dominios específicos
- [ ] Rate limiting activado
- [ ] Helmet.js configurado
- [ ] Inputs sanitizados
- [ ] SQL injection mitigado (Prisma)
- [ ] XSS mitigado (React)
- [ ] HTTPS enforced
- [ ] Passwords hasheadas con bcrypt
- [ ] Audit logs activados

### 12.2 Post-Deployment

- [ ] Penetration testing
- [ ] npm audit sin vulnerabilidades críticas
- [ ] Backup automático configurado
- [ ] Monitoring activado
- [ ] SSL/TLS válido
- [ ] Security headers verificados
- [ ] Rate limiting probado

---

## 13. Costos Estimados

### 13.1 Setup Recomendado (Startup/Growth)

```
Base de Datos (Neon):
├── Free tier: $0/mes (hasta 10GB)
└── Pro: $20/mes (escala automática)

Backend (Railway):
├── Hobby: $5/mes (500 horas)
└── Pro: $20/mes (ilimitado)

Frontend (Vercel):
├── Hobby: $0/mes (ilimitado)
└── Pro: $20/mes (features avanzadas)

Monitoring (UptimeRobot):
├── Free: $0/mes (50 monitors)
└── Pro: $7/mes (más features)

CDN/Storage (Cloudinary):
├── Free: $0/mes (25GB)
└── Plus: $99/mes (más storage)

TOTAL MÍNIMO: ~$0-5/mes (desarrollo)
TOTAL RECOMENDADO: ~$50-70/mes (producción)
```

### 13.2 Setup Enterprise

```
Database (AWS RDS PostgreSQL):
└── $200-500/mes

Backend (AWS EC2 + Load Balancer):
└── $300-800/mes

Frontend (CloudFront CDN):
└── $50-100/mes

Monitoring (DataDog):
└── $15-150/mes

TOTAL: $565-1550/mes
```

---

## 14. Mantenimiento Post-Deployment

### 14.1 Tareas Diarias

```bash
# Verificar health
curl https://api.fleet.pepsico.cl/health

# Verificar logs
railway logs --tail 100

# Verificar uptime
# Dashboard de UptimeRobot
```

### 14.2 Tareas Semanales

- Revisar errores en Sentry
- Revisar usage de Railway/Vercel
- Verificar backups de database
- Revisar audit logs para actividad sospechosa
- npm audit y actualizar dependencias críticas

### 14.3 Tareas Mensuales

- Actualizar dependencias (npm update)
- Revisar performance metrics
- Optimizar queries lentas
- Limpiar logs antiguos
- Revisar costos
- Backup manual adicional
- Revisar y actualizar documentación

---

## 15. Troubleshooting en Producción

### 15.1 Backend No Responde

```bash
# 1. Verificar health
curl https://api.fleet.pepsico.cl/health

# 2. Ver logs
railway logs

# 3. Verificar métricas
railway status

# 4. Restart service
railway restart

# 5. Si persiste, rollback
railway rollback
```

### 15.2 Errores 500

```bash
# 1. Ver logs específicos
railway logs | grep "ERROR"

# 2. Identificar endpoint
# Ver en logs la ruta que falla

# 3. Reproducir en staging

# 4. Fix y deploy
git commit -m "fix: corregir error en endpoint X"
git push
```

### 15.3 Database Connection Issues

```bash
# 1. Verificar connection string
echo $DATABASE_URL

# 2. Test de conexión
npx prisma db pull

# 3. Verificar estado de Neon
# Dashboard de Neon

# 4. Verificar límites
# Conexiones activas, storage usado
```

---

## 16. Escalabilidad

### 16.1 Cómo Escalar

**Cuando tienes >100 usuarios:**
1. Activar horizontal scaling en Railway (2-3 instances)
2. Agregar Redis para caching
3. Optimizar queries con índices adicionales
4. Considerar CDN para assets

**Cuando tienes >1000 usuarios:**
1. Migrar a AWS/Google Cloud
2. Load balancer
3. Database read replicas
4. Microservicios (separar módulos)
5. Message queue (Bull/RabbitMQ)

### 16.2 Cuellos de Botella Comunes

**Database:**
- Queries sin índices
- N+1 queries
- Falta de pooling de conexiones

**Solución:**
```typescript
// Prisma connection pool
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
  // Connection pool
  __internal: {
    engine: {
      connection_limit: 20
    }
  }
})
```

**Backend:**
- Procesamiento síncrono de tareas pesadas

**Solución:**
```typescript
// Usar queue para tareas pesadas
import Bull from 'bull'

const emailQueue = new Bull('email', REDIS_URL)

emailQueue.process(async (job) => {
  await sendEmail(job.data)
})

// En controller
emailQueue.add({ to: user.email, subject: '...' })
```

---

## 17. Checklist Final

### Pre-Deployment
- [ ] Tests pasando (100% unitarios críticos)
- [ ] Linter sin errores
- [ ] Build sin warnings
- [ ] Variables de entorno configuradas
- [ ] Secrets rotados
- [ ] Documentación actualizada
- [ ] Backups configurados
- [ ] Monitoring configurado

### Post-Deployment
- [ ] Health check OK
- [ ] Login funcional
- [ ] Crear registro de prueba
- [ ] Verificar permisos
- [ ] Logs funcionando
- [ ] Alertas configuradas
- [ ] DNS propagado
- [ ] SSL válido
- [ ] Performance acceptable (<500ms)

---

## 18. Contactos de Emergencia

### Equipo Técnico
- **Joaquín Marín**: +56 9 XXXX XXXX
- **Benjamin Vilches**: +56 9 XXXX XXXX

### Proveedores
- **Neon Support**: support@neon.tech
- **Railway Support**: team@railway.app
- **Vercel Support**: support@vercel.com

### Escalación
1. Equipo técnico (respuesta: inmediata)
2. Docente supervisor (respuesta: 24h)
3. Cliente PepsiCo (respuesta: 48h)

---

**Documento preparado por:** Joaquín Marín & Benjamin Vilches  
**Fecha:** Octubre 15, 2024  
**Versión:** 1.0.0  
**Próxima revisión:** Noviembre 15, 2024


