# 🏠 Configuración para Desarrollo Local

## ✅ Pasos Completados

- ✅ Git instalado
- ✅ Node.js 25.1.0 instalado
- ✅ npm 11.6.2 instalado
- ✅ Dependencias del proyecto instaladas

## 📝 Pasos Pendientes

### 1. Crear archivos .env

Necesitas crear archivos `.env` para configurar las variables de entorno.

#### Backend (.env)

**Ubicación:** `backend/.env`

**Crear el archivo:**
```bash
cd backend
copy env.example.txt .env
```

**O manualmente:** Crea el archivo `backend/.env` con este contenido:

```env
# Base de Datos
DATABASE_URL="postgresql://pepsico_user:postgres@localhost:5433/pepsico_fleet?schema=public"

# Servidor
PORT=3000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=300719080102
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Nodemailer) - Opcional para desarrollo
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_de_aplicacion

# Cloudinary (Imágenes) - Opcional para desarrollo
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Configuración de Logs
LOG_LEVEL=info
```

#### Frontend (.env)

**Ubicación:** `frontend/.env`

**Crear el archivo:**
```bash
cd frontend
copy env.example.txt .env
```

**O manualmente:** Crea el archivo `frontend/.env` con este contenido:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Gestión de Flota PepsiCo
```

### 2. Configurar PostgreSQL

Necesitas tener PostgreSQL instalado y corriendo localmente.

#### Opción A: Instalar PostgreSQL

1. Descargar PostgreSQL desde: https://www.postgresql.org/download/windows/
2. Durante la instalación, configura:
   - Puerto: `5433` (o cambiar el DATABASE_URL)
   - Usuario: `pepsico_user`
   - Contraseña: `postgres`
3. Crea la base de datos: `pepsico_fleet`

#### Opción B: Usar Docker (Recomendado)

Si tienes Docker instalado:

```bash
docker run --name pepsico-postgres -e POSTGRES_USER=pepsico_user -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pepsico_fleet -p 5433:5432 -d postgres:15
```

### 3. Configurar Base de Datos

```bash
cd backend

# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# (Opcional) Poblar con datos de prueba
npm run db:seed
```

### 4. Ejecutar el Proyecto

#### Opción A: Ejecutar todo desde la raíz

```bash
# En la raíz del proyecto
npm run dev
```

Esto iniciará:
- Frontend en http://localhost:5173
- Backend en http://localhost:3000

#### Opción B: Ejecutar por separado

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Acceder a la Aplicación

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health
- **Prisma Studio:** http://localhost:5555 (si ejecutas `npm run db:studio`)

## 🔐 Credenciales de Prueba

Si ejecutaste el seed, puedes usar estas credenciales:

```
Email: admin@pepsico.cl
Contraseña: Admin123!
```

O consulta el archivo `backend/prisma/seed.ts` para ver todas las credenciales de prueba.

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
cd backend
rm -rf node_modules
npm install

cd ../frontend
rm -rf node_modules
npm install
```

### Error: "Cannot connect to database"
1. Verifica que PostgreSQL esté corriendo
2. Verifica el DATABASE_URL en `.env`
3. Prueba la conexión: `npm run db:test`

### Error: "Port already in use"
- Frontend: Cambia el puerto en `vite.config.ts`
- Backend: Cambia el puerto en `backend/.env`

## 📚 Comandos Útiles

### Backend

```bash
cd backend

# Desarrollo
npm run dev

# Build
npm run build

# Ejecutar build
npm start

# Base de datos
npm run db:generate    # Generar cliente Prisma
npm run db:migrate     # Crear migración
npm run db:push        # Push cambios sin migración
npm run db:seed        # Poblar datos de prueba
npm run db:studio      # Abrir Prisma Studio

# Linting y formato
npm run lint
npm run format
```

### Frontend

```bash
cd frontend

# Desarrollo
npm run dev

# Build
npm run build

# Preview del build
npm run preview

# Linting y formato
npm run lint
npm run format
```

## ✅ Checklist

Antes de ejecutar, verifica:

- [ ] Archivos `.env` creados (backend y frontend)
- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `pepsico_fleet` creada
- [ ] Migraciones ejecutadas (`npm run db:migrate`)
- [ ] Cliente Prisma generado (`npm run db:generate`)
- [ ] Dependencias instaladas (`npm install`)

## 🎉 ¡Listo!

Una vez completados los pasos, ejecuta `npm run dev` desde la raíz y accede a http://localhost:5173

¡Disfruta desarrollando! 🚀


