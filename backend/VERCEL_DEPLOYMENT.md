# 🚀 Guía de Deployment en Vercel

## Configuración Actual

He configurado tu backend para funcionar en Vercel como funciones serverless. Aquí está lo que necesitas hacer:

## ✅ Archivos Creados

1. **`vercel.json`** - Configuración de Vercel
2. **`api/index.ts`** - Handler serverless que exporta tu aplicación Express

## 📋 Pasos para Deploy

### 1. Mover `@vercel/node` a dependencies (IMPORTANTE)

Necesitas editar `package.json` y mover `@vercel/node` de `devDependencies` a `dependencies`:

```json
{
  "dependencies": {
    "@vercel/node": "^3.0.0",
    // ... resto de dependencias
  },
  "devDependencies": {
    // ... resto sin @vercel/node
  }
}
```

### 2. Agregar script de postinstall

En `package.json`, agrega:

```json
{
  "scripts": {
    "postinstall": "npm run db:generate"
  }
}
```

### 3. Configurar Variables de Entorno en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables y agrega:

```
DATABASE_URL=postgresql://tu_url_de_postgresql
NODE_ENV=production
FRONTEND_URL=https://tu-frontend.vercel.app
JWT_SECRET=tu_jwt_secret_seguro
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password
LOG_LEVEL=error
```

**⚠️ IMPORTANTE**: Cambia `LOG_LEVEL=error` porque Winston intenta escribir archivos localmente que no funcionan en Vercel.

### 4. Hacer el Deploy

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Deploy
cd backend
vercel

# O si ya tienes el proyecto vinculado
vercel --prod
```

### 5. Ejecutar Migraciones de Prisma

Después del primer deploy:

1. Ve a tu dashboard de Vercel
2. Abre tu proyecto
3. Ve a la pestaña "Functions"
4. Click en "..." de una función
5. Selecciona "Run Command"
6. Ejecuta: `npm run db:migrate:deploy`

## ⚠️ Problemas Conocidos y Soluciones

### Problema 1: Winston escribiendo archivos locales

**Solución**: Modifica `src/config/logger.ts`:

```typescript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'pepsico-fleet-api' },
  transports: process.env.NODE_ENV === 'production'
    ? [
        // En producción solo console (Vercel captura logs automáticamente)
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        })
      ]
    : [
        // En desarrollo: archivos + console
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  )
}
```

### Problema 2: Prisma Client no generado

**Solución**: Asegúrate de que `postinstall` esté en package.json y esté ejecutándose.

### Problema 3: Las migraciones no se ejecutan automáticamente

**Solución**: Ejecuta manualmente como se indica en el paso 5 anterior.

## 🔍 Verificar que Funciona

1. Abre tu URL de Vercel: `https://tu-backend.vercel.app/health`
2. Deberías ver: `{"status":"OK","message":"API de Gestión de Flota PepsiCo",...}`
3. Prueba login: `POST https://tu-backend.vercel.app/api/auth/login`

## 📚 Referencias

- [Vercel Express Guide](https://vercel.com/docs/frameworks/backend/express)
- [Prisma Vercel Deploy](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel Functions](https://vercel.com/docs/functions/serverless-functions)

## 🆘 ¿Sigues con problemas?

1. Revisa los logs en Vercel Dashboard → Deployments → tu deploy → Functions → logs
2. Asegúrate de que DATABASE_URL esté correctamente configurado
3. Verifica que todas las variables de entorno estén definidas
4. Comprueba que Prisma Client se haya generado (debería haber una carpeta `node_modules/.prisma/client`)


