# 🐘 Cómo Instalar PostgreSQL para el Proyecto

## 📊 Situación Actual

- ❌ PostgreSQL NO está instalado
- ❌ Docker NO está instalado
- ✅ Necesitas una base de datos PostgreSQL para ejecutar el proyecto

---

## 🎯 Opciones Disponibles (De Más Rápida a Más Completa)

### ⚡ Opción 1: Usar Base de Datos en la Nube (RECOMENDADO - 5 minutos)

La opción más rápida es usar un servicio gratuito de PostgreSQL en la nube.

#### A) Neon (Recomendado)

1. **Crear cuenta en Neon:**
   - Ve a: https://neon.tech
   - Click en "Sign Up" (puedes usar GitHub)
   - Es completamente gratis

2. **Crear proyecto:**
   - Click en "Create a project"
   - Nombre: `pepsico-fleet`
   - Region: Selecciona la más cercana a ti
   - PostgreSQL version: 15 o 16

3. **Copiar connection string:**
   - Neon te mostrará una URL tipo:
     ```
     postgresql://usuario:password@ep-xxx.us-east-1.aws.neon.tech/pepsico_fleet?sslmode=require
     ```

4. **Actualizar `backend/.env`:**
   
   Abre `backend/.env` y reemplaza el DATABASE_URL:
   
   ```env
   DATABASE_URL="postgresql://usuario:password@ep-xxx.us-east-1.aws.neon.tech/pepsico_fleet?sslmode=require"
   ```

5. **✅ Listo!** Continúa con el paso de Prisma en PASOS_FALTANTES_LOCAL.md

#### B) Supabase (Alternativa)

1. **Crear cuenta en Supabase:**
   - Ve a: https://supabase.com
   - Click en "Start your project"
   - Es gratis

2. **Crear proyecto:**
   - Organization name: PepsiCo Fleet
   - Database password: (guarda esta contraseña)
   - Region: Selecciona la más cercana

3. **Copiar connection string:**
   - Ve a Settings → Database
   - Copia la "Connection string" en formato "URI"
   - Se verá así:
     ```
     postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
     ```

4. **Actualizar `backend/.env`:**
   
   ```env
   DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
   ```

5. **✅ Listo!** Continúa con el paso de Prisma

---

### 🐳 Opción 2: Instalar Docker y PostgreSQL (15 minutos)

#### Paso 1: Instalar Docker Desktop

1. **Descargar Docker Desktop:**
   - Ve a: https://www.docker.com/products/docker-desktop/
   - Click en "Download for Windows"
   - Ejecuta el instalador

2. **Configurar Docker:**
   - Durante la instalación, marca "Use WSL 2 instead of Hyper-V"
   - Reinicia la computadora si es necesario

3. **Verificar instalación:**
```powershell
docker --version
```

#### Paso 2: Ejecutar PostgreSQL en Docker

```powershell
docker run --name pepsico-postgres `
  -e POSTGRES_USER=pepsico_user `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=pepsico_fleet `
  -p 5433:5432 `
  -d postgres:15
```

#### Paso 3: Verificar que está corriendo

```powershell
docker ps
```

Deberías ver un contenedor llamado `pepsico-postgres`.

#### Paso 4: Tu DATABASE_URL ya está configurada

Tu `backend/.env` ya tiene la configuración correcta:
```env
DATABASE_URL="postgresql://pepsico_user:postgres@localhost:5433/pepsico_fleet?schema=public"
```

✅ **Listo!** Continúa con el paso de Prisma

---

### 🖥️ Opción 3: Instalar PostgreSQL en Windows (30 minutos)

#### Paso 1: Descargar PostgreSQL

1. **Descargar instalador:**
   - Ve a: https://www.postgresql.org/download/windows/
   - Click en "Download the installer"
   - Selecciona la versión 15 o 16

2. **Ejecutar instalador:**
   - Guarda el archivo
   - Ejecuta el instalador como Administrador

#### Paso 2: Configurar PostgreSQL

Durante la instalación:

1. **Directory:** Deja el directorio por defecto
   ```
   C:\Program Files\PostgreSQL\16
   ```

2. **Components:** Selecciona:
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (opcional, pero útil)
   - ✅ Command Line Tools

3. **Data Directory:** Deja por defecto
   ```
   C:\Program Files\PostgreSQL\16\data
   ```

4. **Password:** (MUY IMPORTANTE - GUÁRDALA)
   ```
   postgres
   ```

5. **Port:** Cambia a:
   ```
   5433
   ```
   (importante porque el .env espera el puerto 5433)

6. **Locale:** Deja por defecto

#### Paso 3: Verificar Instalación

Abre una nueva terminal PowerShell:
```powershell
psql -U postgres -p 5433
```

Si te pide contraseña, ingresa: `postgres`

#### Paso 4: Crear Base de Datos

Dentro de psql, ejecuta:
```sql
-- Crear usuario
CREATE USER pepsico_user WITH PASSWORD 'postgres';

-- Crear base de datos
CREATE DATABASE pepsico_fleet;

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE pepsico_fleet TO pepsico_user;

-- Salir
\q
```

#### Paso 5: Iniciar Servicio PostgreSQL

El servicio debería iniciarse automáticamente, pero por si acaso:

```powershell
Start-Service postgresql-x64-16
```

O busca "Services" en el menú inicio y busca "postgresql-x64-16"

✅ **Listo!** Continúa con el paso de Prisma

---

## 🔧 Después de Cualquiera de las Opciones

Una vez que tengas PostgreSQL funcionando (en la nube o localmente), continúa con:

### 1. Configurar Prisma

```powershell
cd backend

# Generar cliente Prisma
npm run db:generate

# Crear tablas en la base de datos
npm run db:migrate

# Poblar con datos de prueba
npm run db:seed
```

### 2. Verificar Conexión

```powershell
npm run db:test
```

**Salida esperada:**
```
✅ Conexión exitosa!
📊 Información de la base de datos:
   Hora del servidor: 2024-01-15 10:30:00
   Versión de PostgreSQL: PostgreSQL 15.x
```

### 3. Ejecutar el Proyecto

```powershell
# Desde la raíz del proyecto
npm run dev
```

---

## 📊 Comparación de Opciones

| Opción | Tiempo | Dificultad | Gratis | Recomendado |
|--------|--------|------------|--------|-------------|
| **Neon (Cloud)** | ⚡ 5 min | ⭐ Fácil | ✅ Sí | ⭐⭐⭐⭐⭐ |
| **Supabase (Cloud)** | ⚡ 5 min | ⭐ Fácil | ✅ Sí | ⭐⭐⭐⭐ |
| **Docker** | 🐌 15 min | ⭐⭐ Media | ✅ Sí | ⭐⭐⭐ |
| **Instalación Local** | 🐌 30 min | ⭐⭐⭐ Difícil | ✅ Sí | ⭐⭐ |

---

## 🆘 Problemas Comunes

### Problema: "Cannot connect to database"

**Solución:**
1. Si usas Neon/Supabase: Verifica que copiaste bien el connection string
2. Si usas Docker: Verifica que el contenedor está corriendo
   ```powershell
   docker ps
   ```
3. Si usas local: Verifica que el servicio está corriendo
   ```powershell
   Get-Service postgresql-*
   ```

### Problema: "Port 5433 already in use"

**Solución:**
```powershell
# Ver qué usa el puerto 5433
netstat -ano | findstr :5433

# Detener ese proceso
taskkill /PID [número] /F
```

### Problema: Olvidé la contraseña de PostgreSQL

**Solución:**

Si instalaste PostgreSQL localmente:
1. Ve a la carpeta de datos de PostgreSQL
2. Edita `pg_hba.conf`
3. Cambia `scram-sha-256` por `trust`
4. Reinicia PostgreSQL
5. Conéctate sin contraseña:
   ```powershell
   psql -U postgres
   ```
6. Cambia la contraseña:
   ```sql
   ALTER USER postgres PASSWORD 'postgres';
   ```

---

## ✅ Checklist

- [ ] Elegí una opción (Cloud/Docker/Local)
- [ ] PostgreSQL está funcionando
- [ ] Base de datos `pepsico_fleet` creada
- [ ] `backend/.env` actualizado con DATABASE_URL correcta
- [ ] `npm run db:generate` ejecutado
- [ ] `npm run db:migrate` ejecutado
- [ ] `npm run db:test` muestra conexión exitosa
- [ ] `npm run db:seed` ejecutado (opcional)
- [ ] `npm run dev` funciona

---

## 🎉 ¡Listo para Continuar!

Una vez completado cualquiera de estos pasos, continúa con:
👉 `PASOS_FALTANTES_LOCAL.md`

