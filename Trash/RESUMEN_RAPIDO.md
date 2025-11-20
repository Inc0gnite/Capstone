# 🎯 Resumen Rápido: Cómo Empezar

## ✅ Ya Tienes

- ✅ Dependencias instaladas
- ✅ Archivos `.env` creados
- ⚠️ **Node.js** puede no estar en PATH

---

## 🚨 FALTA: PostgreSQL

**PostgreSQL NO está instalado.** Tienes 3 opciones:

### ⚡ Opción 1: Neon (5 min) - RECOMENDADO

1. Ve a https://neon.tech
2. Crea cuenta con GitHub
3. Crea proyecto → Copia connection string
4. Actualiza `backend/.env` con ese string
5. ✅ Listo!

👉 **Ver detalles:** `INSTALACION_POSTGRESQL.md` (Opción 1)

---

### 🐳 Opción 2: Docker (15 min)

1. Instala Docker Desktop
2. Ejecuta: `docker run --name pepsico-postgres -e POSTGRES_USER=pepsico_user -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pepsico_fleet -p 5433:5432 -d postgres:15`
3. ✅ Listo!

👉 **Ver detalles:** `INSTALACION_POSTGRESQL.md` (Opción 2)

---

### 🖥️ Opción 3: Instalar PostgreSQL (30 min)

1. Descarga de https://www.postgresql.org/download/
2. Instala con puerto 5433
3. Crea base de datos
4. ✅ Listo!

👉 **Ver detalles:** `INSTALACION_POSTGRESQL.md` (Opción 3)

---

## 🔧 Después de PostgreSQL

```powershell
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed
cd ..
npm run dev
```

Accede a: http://localhost:5173

Login de prueba: `admin@pepsico.cl` / `Admin123!`

---

## 📚 Documentación Completa

- **Instalar PostgreSQL:** `INSTALACION_POSTGRESQL.md`
- **Pasos detallados:** `PASOS_FALTANTES_LOCAL.md`
- **Setup general:** `SETUP_LOCAL.md`

---

## ⚡ Opción Más Rápida

**Usar Neon (5 minutos):**

```bash
# 1. Ir a https://neon.tech
# 2. Crear cuenta/proyecto
# 3. Copiar connection string
# 4. Pegar en backend/.env
# 5. Ejecutar:
cd backend && npm run db:generate && npm run db:migrate && npm run db:seed
cd .. && npm run dev
```

¡Y listo! 🎉

