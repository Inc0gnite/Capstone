# Guía: Cómo Probar la Conexión a la Base de Datos

## 📋 Información de la Base de Datos

Según tu configuración actual:
- **Host:** localhost
- **Puerto:** 5433
- **Base de datos:** pepsico_fleet
- **Usuario:** pepsico_user
- **Contraseña:** postgres

---

## 🔧 Métodos para Probar la Conexión

### Método 1: Script Completo de Prueba (Recomendado)

Este script prueba todo: conexión, autenticación y consultas.

```bash
npm run db:test
```

**Salida esperada si todo está bien:**
```
🔍 Probando conexión a la base de datos...

📋 Información de conexión:
   Host: localhost
   Puerto: 5433
   Base de datos: pepsico_fleet
   Usuario: pepsico_user

✅ Conexión exitosa!
   Tiempo de respuesta: 45ms

📊 Información de la base de datos:
   Hora del servidor: 2024-01-15 10:30:00
   Versión de PostgreSQL: PostgreSQL 14.x
   Tablas en la base de datos: 25

✅ Todas las pruebas pasaron correctamente!
```

---

### Método 2: Probar Solo el Puerto (Rápido)

Este script solo verifica si el puerto está abierto y accesible.

```bash
npm run db:test-port
```

**Salida esperada:**
```
🔍 Probando puerto 5433 en localhost...

✅ Puerto 5433 está abierto y accesible
   Tiempo de respuesta: 12ms
```

---

### Método 3: Desde la Línea de Comandos (Windows)

#### Usando PowerShell Test-NetConnection

```powershell
Test-NetConnection -ComputerName localhost -Port 5433
```

**Salida esperada:**
```
ComputerName: localhost
RemoteAddress: 127.0.0.1
RemotePort: 5433
InterfaceAlias: Loopback Pseudo-Interface 1
SourceAddress: 127.0.0.1
TcpTestSucceeded: True  ← Esto indica que el puerto está abierto
```

#### Usando Telnet (si está disponible)

```cmd
telnet localhost 5433
```

Si el puerto está abierto, verás una conexión establecida. Presiona `Ctrl + ]` y luego escribe `quit` para salir.

---

### Método 4: Verificar con psql (Cliente PostgreSQL)

Si tienes PostgreSQL instalado con las herramientas de línea de comandos:

```bash
psql -h localhost -p 5433 -U pepsico_user -d pepsico_fleet
```

Te pedirá la contraseña (postgres según la configuración).

---

### Método 5: Desde Node.js Directamente

Puedes ejecutar el script directamente:

```bash
cd backend
node scripts/test-database-connection.js
```

O solo el puerto:

```bash
node scripts/test-port-only.js
```

---

## ❌ Solución de Problemas

### Error: "ECONNREFUSED"

**Problema:** PostgreSQL no está ejecutándose o el puerto está cerrado.

**Soluciones:**
1. Inicia el servicio de PostgreSQL:
   ```powershell
   # Busca el servicio de PostgreSQL
   Get-Service | Where-Object {$_.Name -like "*postgresql*"}
   
   # Inicia el servicio (ejemplo)
   Start-Service postgresql-x64-14
   ```

2. Verifica que PostgreSQL esté escuchando en el puerto 5433:
   ```powershell
   netstat -an | findstr 5433
   ```

### Error: "ENOTFOUND"

**Problema:** El host no se puede resolver.

**Solución:** Verifica que el archivo `.env` tenga `localhost` o `127.0.0.1`.

### Error: "28P01" - Credenciales incorrectas

**Problema:** Usuario o contraseña incorrectos.

**Solución:** Verifica en el archivo `.env`:
```env
DATABASE_URL="postgresql://pepsico_user:postgres@localhost:5433/pepsico_fleet?schema=public"
```

### Error: "3D000" - Base de datos no existe

**Problema:** La base de datos `pepsico_fleet` no existe.

**Soluciones:**
1. Crea la base de datos:
   ```bash
   # Conecta a PostgreSQL
   psql -U postgres
   
   # Dentro de psql
   CREATE DATABASE pepsico_fleet;
   \q
   ```

2. O ejecuta las migraciones de Prisma:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

---

## 🛠️ Verificar Estado de PostgreSQL en Windows

### Ver todos los servicios de PostgreSQL

```powershell
Get-Service | Where-Object {$_.DisplayName -like "*PostgreSQL*"}
```

### Iniciar un servicio específico

```powershell
Start-Service postgresql-x64-14
# Reemplaza 'postgresql-x64-14' con el nombre real de tu servicio
```

### Ver puertos en uso

```powershell
netstat -an | findstr "5433"
```

Si ves `0.0.0.0:5433` o `127.0.0.1:5433`, PostgreSQL está escuchando en ese puerto.

---

## 📝 Notas Adicionales

1. **Puerto personalizado:** El proyecto usa el puerto **5433** en lugar del puerto predeterminado de PostgreSQL (5432) para evitar conflictos.

2. **Archivo .env:** Asegúrate de tener un archivo `.env` en la carpeta `backend/` con la configuración correcta.

3. **Firewall:** Si tienes problemas, verifica que el firewall de Windows no esté bloqueando el puerto 5433.

---

## 🚀 Comandos Rápidos de Referencia

```bash
# Probar conexión completa
npm run db:test

# Probar solo el puerto
npm run db:test-port

# Ver logs de PostgreSQL (si está configurado)
# En Windows, los logs suelen estar en:
# C:\Program Files\PostgreSQL\{versión}\data\log\
```

