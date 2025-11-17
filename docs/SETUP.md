# Guía de Configuración del Proyecto

Esta guía te ayudará a configurar el proyecto desde cero.

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js** versión 20 o superior
   - Descargar desde: https://nodejs.org/
   - Verificar: `node --version`

2. **npm** versión 10 o superior
   - Viene con Node.js
   - Verificar: `npm --version`

3. **PostgreSQL** versión 15 o superior
   - Descargar desde: https://www.postgresql.org/download/
   - O usar servicios cloud como Neon o Supabase

4. **Git**
   - Descargar desde: https://git-scm.com/
   - Verificar: `git --version`

## Paso 1: Configurar PostgreSQL

### Opción A: PostgreSQL Local

1. Instalar PostgreSQL
2. Crear base de datos:
```sql
CREATE DATABASE pepsico_fleet;
CREATE USER fleet_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE pepsico_fleet TO fleet_user;
```

3. Tu DATABASE_URL será:
```
postgresql://fleet_user:tu_password_seguro@localhost:5432/pepsico_fleet
```

### Opción B: Neon (Recomendado para desarrollo)

1. Ir a https://neon.tech/
2. Crear cuenta gratuita
3. Crear nuevo proyecto
4. Copiar la DATABASE_URL que te proporcionan

### Opción C: Supabase

1. Ir a https://supabase.com/
2. Crear cuenta gratuita
3. Crear nuevo proyecto
4. Ir a Settings > Database
5. Copiar la Connection String (URI)

## Paso 2: Clonar e Instalar

```bash
# Clonar repositorio
git clone [URL_DEL_REPO]
cd Capstone_github

# Instalar dependencias de todo el monorepo
npm install
```

## Paso 3: Configurar Variables de Entorno

### Backend

```bash
cd backend
cp env.example.txt .env
```

Editar `backend/.env`:

```env
# Base de Datos (usar la URL de PostgreSQL del Paso 1)
DATABASE_URL="postgresql://usuario:password@host:5432/pepsico_fleet"

# Servidor
PORT=3000
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173

# JWT (cambiar por un secreto seguro)
JWT_SECRET=genera_un_secreto_aleatorio_muy_largo_y_seguro
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (opcional para desarrollo, necesario para producción)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password

# Cloudinary (opcional, para carga de imágenes)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend

```bash
cd frontend
cp env.example.txt .env
```

Editar `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Gestión de Flota PepsiCo
```

## Paso 4: Configurar Base de Datos con Prisma

```bash
cd backend

# Generar cliente de Prisma
npm run db:generate

# Crear las tablas en la base de datos
npm run db:migrate

# (Opcional) Poblar con datos de prueba
npm run db:seed
```

Si todo salió bien, verás un mensaje confirmando que se crearon las migraciones.

## Paso 5: Ejecutar el Proyecto

### Opción 1: Todo junto (Recomendado)

Desde la raíz del proyecto:

```bash
npm run dev
```

Esto iniciará frontend y backend simultáneamente.

### Opción 2: Por separado

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## Paso 6: Verificar que Funciona

1. **Backend**: Abre http://localhost:3000/health
   - Deberías ver un JSON con status "OK"

2. **Frontend**: Abre http://localhost:5173
   - Deberías ver la página de login

3. **Prisma Studio** (opcional): Visualizar datos
   ```bash
   cd backend
   npm run db:studio
   ```
   - Se abrirá en http://localhost:5555

## Troubleshooting

### Error: "Cannot connect to database"

- Verificar que PostgreSQL está corriendo
- Verificar que DATABASE_URL es correcta
- Verificar que la base de datos existe
- Verificar credenciales de usuario

### Error: "Port 3000 already in use"

```bash
# En Windows
netstat -ano | findstr :3000
taskkill /PID [numero_pid] /F

# En Mac/Linux
lsof -ti:3000 | xargs kill
```

O cambiar PORT en `.env`

### Error: "Module not found"

```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules
rm package-lock.json
npm install
```

### Error en migraciones de Prisma

```bash
cd backend

# Reset completo de la base de datos (CUIDADO: borra todos los datos)
npx prisma migrate reset

# O push directo del schema sin migraciones
npm run db:push
```

## Siguientes Pasos

1. Revisar documentación en `/docs`
2. Ver casos de uso en `/Contexto proyecto/Casos_de_Uso_Detallados.txt`
3. Revisar arquitectura en `/Contexto proyecto/Arquitectura_del_Sistema.txt`
4. Comenzar a desarrollar según el plan de proyecto

## Obtener Ayuda

Si tienes problemas:
1. Revisar logs de consola
2. Revisar documentación de Prisma: https://www.prisma.io/docs
3. Revisar documentación de Vite: https://vitejs.dev
4. Contactar al equipo:
   - Joaquín: jo.marinm@duocuc.cl
   - Benjamin: benj.vilches@duocuc.cl





