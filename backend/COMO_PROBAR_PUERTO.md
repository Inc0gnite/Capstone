# 🔍 Cómo Probar el Puerto de la Base de Datos

## 📊 Configuración Actual

Según tu archivo `.env`:
- **Puerto:** 5433
- **Host:** localhost
- **Base de datos:** pepsico_fleet
- **Usuario:** pepsico_user
- **Contraseña:** postgres

---

## ⚠️ Estado Actual

**PostgreSQL NO está ejecutándose** en este momento.

**Servicios detectados:**
- `postgresql-x64-18` (PARADO)
- `postgresql-x64-17` (PARADO)
- `pgagent-pg17` (PARADO)

---

## 🚀 Cómo Iniciar PostgreSQL

### Opción 1: Desde PowerShell (como Administrador)

1. Abre PowerShell como Administrador:
   - Presiona `Win + X`
   - Selecciona "Windows PowerShell (Administrador)" o "Terminal (Administrador)"

2. Inicia el servicio:
```powershell
Start-Service postgresql-x64-18
```

3. Verifica el estado:
```powershell
Get-Service postgresql-x64-18
```

### Opción 2: Desde el Panel de Control

1. Abre el Panel de Control
2. Ve a "Servicios" (Services)
3. Busca "postgresql-x64-18"
4. Clic derecho → Iniciar

### Opción 3: Desde pgAdmin (si lo tienes instalado)

1. Abre pgAdmin
2. Intenta conectar al servidor
3. Si falla, verifica la configuración del servidor

---

## ✅ Después de Iniciar PostgreSQL

### 1. Probar el Puerto (Método Rápido)

```bash
npm run db:test-port
```

**Salida esperada:**
```
🔍 Probando puerto 5433 en localhost...

✅ Puerto 5433 está abierto y accesible
   Tiempo de respuesta: 12ms
```

### 2. Probar Conexión Completa

```bash
npm run db:test
```

**Salida esperada:**
```
🔍 Probando conexión a la base de datos...

📋 Información de conexión:
   Host: localhost
   Puerto: 5433
   Base de datos: pepsico_fleet
   Usuario: pepsico_user

✅ Conexión exitosa!

📊 Información de la base de datos:
   Hora del servidor: 2024-01-15 10:30:00
   Versión de PostgreSQL: PostgreSQL 17.x
   Tablas en la base de datos: 25

✅ Todas las pruebas pasaron correctamente!
```

### 3. Desde PowerShell

```powershell
Test-NetConnection -ComputerName localhost -Port 5433
```

Si `TcpTestSucceeded: True` → Puerto está abierto ✅

---

## 🛠️ Alternativas para Verificar

### Ver todos los puertos PostgreSQL en uso:

```powershell
netstat -an | findstr "543"
```

### Ver el estado de los servicios de PostgreSQL:

```powershell
Get-Service | Where-Object {$_.DisplayName -like "*PostgreSQL*"}
```

### Verificar si PostgreSQL está escuchando:

```powershell
# Ver procesos de PostgreSQL
Get-Process | Where-Object {$_.ProcessName -like "*postgres*"}
```

---

## 🔧 Configuración de Puerto

Tu proyecto está configurado para usar el puerto **5433** (no el puerto estándar 5432).

Si necesitas cambiar el puerto, edita `backend/.env`:

```env
DATABASE_URL="postgresql://pepsico_user:postgres@localhost:5433/pepsico_fleet?schema=public"
```

---

## 📝 Scripts Disponibles

Agregué dos nuevos scripts a `package.json`:

```bash
# Prueba solo el puerto (rápido)
npm run db:test-port

# Prueba conexión completa (incluye autenticación y consultas)
npm run db:test
```

---

## ❌ Solución de Problemas

### Error: "ECONNREFUSED"

**Causa:** PostgreSQL no está ejecutándose

**Solución:**
```powershell
Start-Service postgresql-x64-18
```

### Error: "El servicio no se puede iniciar"

**Causa:** Falta de permisos de administrador

**Solución:**
1. Abre PowerShell como Administrador
2. Ejecuta: `Start-Service postgresql-x64-18`

### Error: "Base de datos no existe"

**Causa:** La base de datos `pepsico_fleet` no ha sido creada

**Solución:**
```bash
# Generar cliente de Prisma
npm run db:generate

# Crear y aplicar migraciones
npm run db:migrate

# O empujar el esquema directamente
npm run db:push
```

### PostgreSQL está escuchando en un puerto diferente

**Verificar:**
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "postgres"} | ForEach-Object { netstat -ano | findstr $_.Id }
```

**Cambiar puerto en postgresql.conf** si es necesario.

---

## 📚 Más Información

- **Guía completa:** `backend/docs/TEST_DATABASE.md`
- **Esquema de base de datos:** `backend/prisma/schema.prisma`
- **Variables de entorno:** `backend/env.example.txt`

---

## 🎯 Resumen

**Para probar el puerto de la base de datos:**

1. ✅ **Inicia PostgreSQL:**
   ```powershell
   Start-Service postgresql-x64-18
   ```

2. ✅ **Prueba el puerto:**
   ```bash
   npm run db:test-port
   ```

3. ✅ **Prueba la conexión completa:**
   ```bash
   npm run db:test
   ```

---

**¿Necesitas más ayuda?** Revisa `backend/docs/TEST_DATABASE.md` para más información detallada.

