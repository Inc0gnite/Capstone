# 🔧 Qué Falta para Ejecutar el Proyecto Localmente

## ✅ Lo que ya está Listo

- ✅ Dependencias del proyecto instaladas (node_modules existe en raíz, backend y frontend)
- ✅ Archivos `.env` creados (backend/.env y frontend/.env)
- ✅ Estructura del proyecto configurada

---

## 🚨 Lo que Falta por Hacer

### 1. ⚙️ Configurar Node.js en el PATH

**Problema:** Node.js no se reconoce en PowerShell

**Solución:**

1. Busca dónde está instalado Node.js:
   ```
   C:\Program Files\nodejs\
   ```
   o
   ```
   C:\Users\[TU_USUARIO]\AppData\Roaming\npm
   ```

2. Agrega Node.js al PATH del sistema:
   - Presiona `Win + Pausa` para abrir configuración del sistema
   - Click en "Configuración avanzada del sistema"
   - Click en "Variables de entorno"
   - En "Variables del sistema", busca y selecciona "Path"
   - Click en "Editar"
   - Click en "Nuevo" y agrega la ruta donde está Node.js
   - Guarda todo y reinicia la terminal

3. **Alternativa rápida:** Usa la terminal integrada de VS Code o abre una nueva ventana de PowerShell

**Verificar:**
```powershell
node --version
npm --version
```

---

### 2. 🐘 **INSTALAR PostgreSQL** ⚠️ PRIORIDAD ALTA

**Problema:** PostgreSQL NO está instalado en tu sistema

**👉 IMPORTANTE:** Necesitas seguir primero las instrucciones completas en el archivo:
**`INSTALACION_POSTGRESQL.md`**

**Opciones rápidas:**

#### Opción A: Base de Datos en la Nube (RECOMENDADO - 5 minutos)

1. **Ve a:** https://neon.tech
2. **Crea cuenta gratuita** (puedes usar GitHub)
3. **Crea un proyecto** → Copia el connection string
4. **Actualiza `backend/.env`** con el nuevo DATABASE_URL
5. ✅ **Listo!** Salta al paso 4

#### Opción B: Docker (15 minutos)

Ver instrucciones completas en `INSTALACION_POSTGRESQL.md`

#### Opción C: Instalar PostgreSQL en Windows (30 minutos)

Ver instrucciones completas en `INSTALACION_POSTGRESQL.md`

**Una vez instalado PostgreSQL, continúa con los siguientes pasos...**

---

### 3. 🔧 Configurar el Cliente Prisma

Ejecuta desde la raíz del proyecto:

```powershell
# Navegar al backend
cd backend

# Generar cliente Prisma (lee schema.prisma y genera código)
npm run db:generate

# Aplicar migraciones (crea las tablas en PostgreSQL)
npm run db:migrate
```

**Nota:** Si los comandos npm no funcionan, verifica que Node.js esté en el PATH (Paso 1).

---

### 4. 📊 Poblar Base de Datos con Datos de Prueba (Opcional pero Recomendado)

```powershell
# Desde backend/
npm run db:seed
```

Esto creará:
- Usuarios de prueba
- Roles y permisos
- Talleres y regiones
- Vehículos de ejemplo

**Credenciales de prueba después del seed:**
```
Email: admin@pepsico.cl
Contraseña: Admin123!
```

---

### 5. 🚀 Ejecutar el Proyecto

#### Opción A: Ejecutar todo desde la raíz (Recomendado)

```powershell
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará automáticamente:
- ✅ Backend en http://localhost:3000
- ✅ Frontend en http://localhost:5173

#### Opción B: Ejecutar por separado

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

---

## 🧪 Verificar que Todo Funcione

### 1. Verificar PostgreSQL

```powershell
cd backend
npm run db:test
```

### 2. Verificar Backend

Abre en el navegador: http://localhost:3000/health

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Verificar Frontend

Abre en el navegador: http://localhost:5173

Deberías ver la pantalla de login.

### 4. Probar Login

- Email: `admin@pepsico.cl`
- Contraseña: `Admin123!`

---

## 🐛 Solución de Problemas Comunes

### Error: "Cannot find module"

```powershell
# Reinstalar dependencias
cd backend
rmdir /s /q node_modules
npm install

cd ..\frontend
rmdir /s /q node_modules
npm install
```

### Error: "Cannot connect to database"

1. Verifica que PostgreSQL esté corriendo: `Get-Service postgresql-*`
2. Verifica el DATABASE_URL en `backend/.env`
3. Prueba la conexión: `npm run db:test`

### Error: "Port already in use"

**Puerto 3000 ocupado:**
```powershell
# Ver qué proceso usa el puerto 3000
netstat -ano | findstr :3000

# Detener el proceso (reemplaza PID con el número que encontraste)
taskkill /PID [PID] /F
```

**Puerto 5173 ocupado:**
Cambiar en `frontend/vite.config.ts`

### Error: "Prisma client not generated"

```powershell
cd backend
npm run db:generate
```

---

## 📝 Checklist Final

Antes de ejecutar, verifica:

- [ ] Node.js instalado y en PATH
- [ ] PostgreSQL iniciado y corriendo
- [ ] Base de datos `pepsico_fleet` creada
- [ ] Usuario `pepsico_user` creado con permisos
- [ ] Archivos `.env` creados (backend y frontend)
- [ ] Cliente Prisma generado (`npm run db:generate`)
- [ ] Migraciones aplicadas (`npm run db:migrate`)
- [ ] Datos de prueba importados (`npm run db:seed`)

---

## 🎉 Una vez completado

Ejecuta desde la raíz:
```powershell
npm run dev
```

Accede a:
- 🎨 Frontend: http://localhost:5173
- 🔌 Backend: http://localhost:3000
- 📊 Prisma Studio: `npm run db:studio` (http://localhost:5555)

---

## 📞 Si Necesitas Ayuda

- Revisa `SETUP_LOCAL.md` para más detalles
- Revisa `backend/COMO_PROBAR_PUERTO.md` para troubleshooting de PostgreSQL
- Revisa `docs/MANUAL_DESARROLLO.md` para el flujo de trabajo

¡Éxito con tu proyecto! 🚀
