# 🗄️ Documentación de Base de Datos - PepsiCo Fleet Management

## 📋 Índice

1. [Visión General](#visión-general)
2. [Esquema Completo](#esquema-completo)
3. [Tablas Detalladas](#tablas-detalladas)
4. [Relaciones](#relaciones)
5. [Índices y Performance](#índices)
6. [Triggers y Constraints](#triggers)
7. [Migraciones](#migraciones)
8. [Queries Comunes](#queries-comunes)
9. [Optimización](#optimización)
10. [Mantenimiento](#mantenimiento)

---

## 1. Visión General

### 1.1 Estadísticas

- **DBMS:** PostgreSQL 15
- **ORM:** Prisma 5.20
- **Total de Tablas:** 20
- **Total de Índices:** 25+
- **Relaciones:** 30+
- **Tamaño Estimado:** 5-10GB (para 500 vehículos, 1 año de datos)

### 1.2 Módulos

```
20 TABLAS organizadas en 6 módulos:

A. Usuarios y Seguridad (5 tablas)
   ├── users
   ├── roles
   ├── permissions
   ├── role_permissions
   └── audit_logs

B. Vehículos (3 tablas)
   ├── vehicles
   ├── vehicle_entries
   └── key_control

C. Órdenes de Trabajo (4 tablas)
   ├── work_orders
   ├── work_order_statuses
   ├── work_order_photos
   └── work_pauses

D. Inventario (3 tablas)
   ├── spare_parts
   ├── work_order_spare_parts
   └── spare_part_movements

E. Infraestructura (3 tablas)
   ├── regions
   ├── workshops
   └── workshop_schedules

F. Documentación (2 tablas)
   ├── documents
   └── notifications
```

---

## 2. Esquema Completo

### 2.1 Diagrama ER Simplificado

```
┌────────────┐         ┌─────────────┐         ┌──────────────┐
│   roles    │◄───┐    │    users    │◄────────┤ audit_logs   │
└────────────┘    │    └──────┬──────┘         └──────────────┘
                  │           │
┌────────────┐    │           │
│permissions │◄───┼───────────┼──────────┐
└────────────┘    │           │          │
       ▲          │           │          │
       │          │           ▼          ▼
┌──────┴──────┐   │    ┌─────────────────────────┐
│role_perms   │◄──┘    │   vehicle_entries       │
└─────────────┘        └──────┬──────────────────┘
                              │
┌────────────┐                │
│  regions   │◄───┐           ├──────┐
└────────────┘    │           │      │
       ▲          │           ▼      ▼
       │          │    ┌─────────┐ ┌──────────┐
┌──────┴──────┐   │    │vehicles │ │key_control│
│  workshops  │◄──┘    └────┬────┘ └──────────┘
└─────────────┘             │
       ▲                    │
       │                    ▼
       │             ┌──────────────┐
       └─────────────┤ work_orders  │
                     └───┬──────────┘
                         │
        ┌────────────────┼───────────────┐
        │                │               │
        ▼                ▼               ▼
┌───────────────┐ ┌──────────────┐ ┌──────────┐
│work_order_    │ │work_order_   │ │work_     │
│statuses       │ │photos        │ │pauses    │
└───────────────┘ └──────────────┘ └──────────┘

┌────────────┐         ┌─────────────────────────┐
│spare_parts │◄────────┤work_order_spare_parts   │
└─────┬──────┘         └─────────────────────────┘
      │
      ▼
┌─────────────────────┐
│spare_part_movements │
└─────────────────────┘
```

---

## 3. Tablas Detalladas

### 3.1 users

**Propósito:** Almacenar información de usuarios del sistema.

**Estructura:**
```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rut             VARCHAR(12) UNIQUE NOT NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password        VARCHAR(255) NOT NULL,  -- bcrypt hash
  phone           VARCHAR(20),
  role_id         UUID NOT NULL REFERENCES roles(id),
  workshop_id     UUID REFERENCES workshops(id),
  is_active       BOOLEAN DEFAULT true,
  last_login      TIMESTAMP,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rut ON users(rut);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_workshop_id ON users(workshop_id);
```

**Datos de Ejemplo:**
```sql
INSERT INTO users (rut, first_name, last_name, email, password, role_id)
VALUES 
  ('12.345.678-9', 'Juan', 'Pérez', 'admin@pepsico.cl', '$2b$10$...', 'role_uuid'),
  ('23.456.789-0', 'María', 'González', 'guardia@pepsico.cl', '$2b$10$...', 'role_uuid');
```

**Reglas de Negocio:**
- RUT debe ser único y válido (algoritmo chileno)
- Email debe ser único
- Password debe estar hasheado con bcrypt (salt rounds: 10)
- is_active = false es soft delete
- last_login se actualiza en cada login exitoso

---

### 3.2 roles

**Propósito:** Definir roles del sistema.

**Estructura:**
```sql
CREATE TABLE roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(50) UNIQUE NOT NULL,
  description     TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Roles del Sistema:**
```sql
INSERT INTO roles (name, description) VALUES
  ('Administrador', 'Acceso total al sistema'),
  ('Guardia', 'Control de acceso vehicular'),
  ('Recepcionista', 'Gestión de ingresos y órdenes'),
  ('Mecánico', 'Ejecución de trabajos'),
  ('Jefe de Taller', 'Supervisión del taller'),
  ('Encargado de Inventario', 'Gestión de repuestos');
```

---

### 3.3 permissions

**Propósito:** Definir permisos granulares.

**Estructura:**
```sql
CREATE TABLE permissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource        VARCHAR(50) NOT NULL,
  action          VARCHAR(50) NOT NULL,
  description     TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(resource, action)
);
```

**Permisos Implementados:**
```sql
-- Dashboard
('dashboard', 'read', 'Ver dashboard')

-- Usuarios
('users', 'read', 'Ver usuarios')
('users', 'create', 'Crear usuarios')
('users', 'update', 'Actualizar usuarios')
('users', 'delete', 'Eliminar usuarios')

-- Vehículos
('vehicles', 'read', 'Ver vehículos')
('vehicles', 'create', 'Crear vehículos')
('vehicles', 'update', 'Actualizar vehículos')
('vehicles', 'delete', 'Eliminar vehículos')

-- Y más... (20+ permisos en total)
```

---

### 3.4 vehicles

**Propósito:** Catálogo de vehículos de la flota.

**Estructura:**
```sql
CREATE TABLE vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_plate   VARCHAR(10) UNIQUE NOT NULL,
  vehicle_type    VARCHAR(50) NOT NULL,  -- Camión, Camioneta, Furgón
  brand           VARCHAR(50) NOT NULL,
  model           VARCHAR(100) NOT NULL,
  year            INTEGER NOT NULL,
  vin             VARCHAR(17) UNIQUE,  -- VIN internacional
  fleet_number    VARCHAR(20) UNIQUE,
  region_id       UUID NOT NULL REFERENCES regions(id),
  status          VARCHAR(20) DEFAULT 'active',  -- active, in_maintenance, inactive
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX idx_vehicles_region_id ON vehicles(region_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
```

**Validaciones:**
- license_plate: formato chileno (ABCD12, AB1234)
- year: entre 1990 y año actual + 1
- status: solo valores permitidos

---

### 3.5 vehicle_entries

**Propósito:** Registrar ingresos y salidas de vehículos al taller.

**Estructura:**
```sql
CREATE TABLE vehicle_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_code      VARCHAR(20) UNIQUE NOT NULL,  -- ING-YYYYMMDD-XXXX
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
  workshop_id     UUID NOT NULL REFERENCES workshops(id),
  driver_rut      VARCHAR(12) NOT NULL,
  driver_name     VARCHAR(200) NOT NULL,
  driver_phone    VARCHAR(20),
  entry_date      TIMESTAMP NOT NULL,
  exit_date       TIMESTAMP,
  entry_km        INTEGER NOT NULL,
  exit_km         INTEGER,
  fuel_level      VARCHAR(10) NOT NULL,  -- 1/4, 1/2, 3/4, Lleno
  has_keys        BOOLEAN DEFAULT true,
  observations    TEXT,
  photos          JSONB,  -- Array de URLs
  status          VARCHAR(20) DEFAULT 'ingresado',  -- ingresado, salida
  created_by_id   UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_exit_km CHECK (exit_km IS NULL OR exit_km >= entry_km)
);

CREATE INDEX idx_entries_vehicle_id ON vehicle_entries(vehicle_id);
CREATE INDEX idx_entries_workshop_id ON vehicle_entries(workshop_id);
CREATE INDEX idx_entries_entry_date ON vehicle_entries(entry_date);
CREATE INDEX idx_entries_status ON vehicle_entries(status);
```

**Reglas:**
- entry_code generado automáticamente
- exit_date solo si vehículo salió
- exit_km debe ser >= entry_km
- status cambia a "salida" cuando se registra salida

---

### 3.6 work_orders

**Propósito:** Órdenes de trabajo para vehículos.

**Estructura:**
```sql
CREATE TABLE work_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      VARCHAR(20) UNIQUE NOT NULL,  -- OT-YYYYMMDD-XXXX
  vehicle_id        UUID NOT NULL REFERENCES vehicles(id),
  entry_id          UUID NOT NULL REFERENCES vehicle_entries(id),
  workshop_id       UUID NOT NULL REFERENCES workshops(id),
  work_type         VARCHAR(100) NOT NULL,
  priority          VARCHAR(20) DEFAULT 'media',  -- baja, media, alta, critica
  description       TEXT NOT NULL,
  estimated_hours   DECIMAL(10,2),
  assigned_to_id    UUID REFERENCES users(id),
  current_status    VARCHAR(20) DEFAULT 'pendiente',
  started_at        TIMESTAMP,
  completed_at      TIMESTAMP,
  total_hours       DECIMAL(10,2),
  observations      TEXT,
  created_by_id     UUID NOT NULL REFERENCES users(id),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_total_hours CHECK (total_hours >= 0),
  CONSTRAINT chk_completion CHECK (
    (current_status = 'completado' AND completed_at IS NOT NULL) OR
    (current_status != 'completado')
  )
);

CREATE INDEX idx_work_orders_vehicle_id ON work_orders(vehicle_id);
CREATE INDEX idx_work_orders_entry_id ON work_orders(entry_id);
CREATE INDEX idx_work_orders_workshop_id ON work_orders(workshop_id);
CREATE INDEX idx_work_orders_assigned_to_id ON work_orders(assigned_to_id);
CREATE INDEX idx_work_orders_current_status ON work_orders(current_status);
CREATE INDEX idx_work_orders_created_at ON work_orders(created_at);
```

**Estados del Ciclo de Vida:**
```
pendiente → en_progreso → completado
            ↓           ↑
            pausado ────┘
            
cancelado (desde cualquier estado)
```

**Cálculo de total_hours:**
```sql
-- Se calcula automáticamente cuando status = 'completado'
total_hours = (completed_at - started_at) / 3600  -- en horas
```

---

### 3.7 spare_parts

**Propósito:** Catálogo de repuestos.

**Estructura:**
```sql
CREATE TABLE spare_parts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              VARCHAR(20) UNIQUE NOT NULL,
  name              VARCHAR(200) NOT NULL,
  description       TEXT,
  category          VARCHAR(50) NOT NULL,
  unit_of_measure   VARCHAR(20) NOT NULL,  -- unidad, litro, juego, etc.
  unit_price        DECIMAL(10,2) NOT NULL,
  current_stock     INTEGER DEFAULT 0,
  min_stock         INTEGER NOT NULL,
  max_stock         INTEGER NOT NULL,
  location          VARCHAR(100),
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_stock_positive CHECK (current_stock >= 0),
  CONSTRAINT chk_stock_limits CHECK (min_stock <= max_stock)
);

CREATE INDEX idx_spare_parts_code ON spare_parts(code);
CREATE INDEX idx_spare_parts_category ON spare_parts(category);
CREATE INDEX idx_spare_parts_stock ON spare_parts(current_stock);
```

**Categorías Comunes:**
- Filtros
- Frenos
- Lubricantes
- Eléctrico
- Neumáticos
- Suspensión
- Motor
- Transmisión

**Alertas de Stock:**
```sql
-- Stock bajo
SELECT * FROM spare_parts 
WHERE current_stock <= min_stock AND is_active = true;

-- Sin stock
SELECT * FROM spare_parts 
WHERE current_stock = 0 AND is_active = true;
```

---

### 3.8 spare_part_movements

**Propósito:** Historial de movimientos de inventario.

**Estructura:**
```sql
CREATE TABLE spare_part_movements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spare_part_id     UUID NOT NULL REFERENCES spare_parts(id),
  movement_type     VARCHAR(20) NOT NULL,  -- entrada, salida, ajuste
  quantity          INTEGER NOT NULL,
  previous_stock    INTEGER NOT NULL,
  new_stock         INTEGER NOT NULL,
  reason            VARCHAR(200) NOT NULL,
  reference         VARCHAR(100),  -- OT-XXX, OC-XXX, etc.
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_quantity_positive CHECK (quantity > 0),
  CONSTRAINT chk_stock_consistency CHECK (
    (movement_type = 'entrada' AND new_stock = previous_stock + quantity) OR
    (movement_type = 'salida' AND new_stock = previous_stock - quantity) OR
    (movement_type = 'ajuste')
  )
);

CREATE INDEX idx_movements_spare_part_id ON spare_part_movements(spare_part_id);
CREATE INDEX idx_movements_created_at ON spare_part_movements(created_at);
CREATE INDEX idx_movements_type ON spare_part_movements(movement_type);
```

**Trazabilidad Completa:**
- Cada cambio de stock se registra
- Se guarda stock anterior y nuevo
- Se referencia el motivo y documento relacionado

---

## 4. Relaciones

### 4.1 One-to-Many (1:N)

```sql
-- Un rol tiene muchos usuarios
roles (1) ──< users (N)

-- Una región tiene muchos talleres
regions (1) ──< workshops (N)

-- Un vehículo tiene muchos ingresos
vehicles (1) ──< vehicle_entries (N)

-- Un ingreso tiene muchas órdenes
vehicle_entries (1) ──< work_orders (N)

-- Una orden tiene muchos estados
work_orders (1) ──< work_order_statuses (N)

-- Un repuesto tiene muchos movimientos
spare_parts (1) ──< spare_part_movements (N)
```

### 4.2 Many-to-Many (N:M)

```sql
-- Roles y Permisos (tabla intermedia: role_permissions)
roles (N) ──< role_permissions >── permissions (N)

-- Órdenes y Repuestos (tabla intermedia: work_order_spare_parts)
work_orders (N) ──< work_order_spare_parts >── spare_parts (N)
```

### 4.3 One-to-One (1:1)

```sql
-- Un ingreso tiene un control de llaves
vehicle_entries (1) ──< key_control (1)
```

**Implementación:**
```sql
CREATE TABLE key_control (
  id        UUID PRIMARY KEY,
  entry_id  UUID UNIQUE NOT NULL REFERENCES vehicle_entries(id),
  ...
);
```

---

## 5. Índices y Performance

### 5.1 Índices Implementados

**Por Tabla:**

```sql
-- users (4 índices)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rut ON users(rut);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_workshop_id ON users(workshop_id);

-- vehicles (3 índices)
CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX idx_vehicles_region_id ON vehicles(region_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- vehicle_entries (4 índices)
CREATE INDEX idx_entries_vehicle_id ON vehicle_entries(vehicle_id);
CREATE INDEX idx_entries_workshop_id ON vehicle_entries(workshop_id);
CREATE INDEX idx_entries_entry_date ON vehicle_entries(entry_date);
CREATE INDEX idx_entries_status ON vehicle_entries(status);

-- work_orders (6 índices)
CREATE INDEX idx_work_orders_vehicle_id ON work_orders(vehicle_id);
CREATE INDEX idx_work_orders_entry_id ON work_orders(entry_id);
CREATE INDEX idx_work_orders_workshop_id ON work_orders(workshop_id);
CREATE INDEX idx_work_orders_assigned_to_id ON work_orders(assigned_to_id);
CREATE INDEX idx_work_orders_current_status ON work_orders(current_status);
CREATE INDEX idx_work_orders_created_at ON work_orders(created_at);

-- spare_parts (3 índices)
CREATE INDEX idx_spare_parts_code ON spare_parts(code);
CREATE INDEX idx_spare_parts_category ON spare_parts(category);
CREATE INDEX idx_spare_parts_stock ON spare_parts(current_stock);

-- notifications (2 índices)
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- audit_logs (3 índices)
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource, resource_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
```

### 5.2 Análisis de Performance

**Ver queries lentas:**
```sql
-- Habilitar pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Queries más lentas
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Explain de queries:**
```sql
EXPLAIN ANALYZE 
SELECT * FROM work_orders 
WHERE current_status = 'en_progreso' 
AND workshop_id = 'uuid';

-- Si no usa índice, agregarlo:
CREATE INDEX idx_work_orders_status_workshop 
ON work_orders(current_status, workshop_id);
```

---

## 6. Constraints y Validaciones

### 6.1 Constraints Implementados

**Check Constraints:**
```sql
-- vehicle_entries: kilometraje de salida >= entrada
CONSTRAINT chk_exit_km CHECK (exit_km IS NULL OR exit_km >= entry_km)

-- work_orders: horas positivas
CONSTRAINT chk_total_hours CHECK (total_hours >= 0)

-- spare_parts: stock no negativo
CONSTRAINT chk_stock_positive CHECK (current_stock >= 0)

-- spare_parts: límites de stock
CONSTRAINT chk_stock_limits CHECK (min_stock <= max_stock)
```

**Foreign Key Cascades:**
```sql
-- Al eliminar un rol, NO se pueden eliminar usuarios
role_id UUID REFERENCES roles(id) ON DELETE RESTRICT

-- Al eliminar una orden, SÍ se eliminan sus estados
work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE

-- Al eliminar un usuario, las órdenes quedan sin asignar
assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL
```

### 6.2 Triggers (Futuros)

**Ejemplo de trigger para actualizar updated_at:**

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## 7. Migraciones

### 7.1 Estrategia de Migraciones

**Desarrollo:**
```bash
# Crear migración
npx prisma migrate dev --name descripcion_cambio

# Aplicar migración
npx prisma migrate deploy
```

**Producción:**
```bash
# SOLO usar migrate deploy
DATABASE_URL="production_url" npx prisma migrate deploy

# NUNCA usar db:push en producción
```

### 7.2 Migrations Aplicadas

```
migrations/
├── 20241001_init/
│   └── migration.sql          # Creación inicial de tablas
├── 20241005_add_indexes/
│   └── migration.sql          # Índices adicionales
└── 20241010_add_constraints/
    └── migration.sql          # Constraints de validación
```

### 7.3 Rollback de Migración

```bash
# Marcar como revertida
npx prisma migrate resolve --rolled-back <migration-name>

# Aplicar estado anterior
# (requiere crear nueva migración que revierta cambios)
```

---

## 8. Queries Comunes

### 8.1 Reportes

**Vehículos en taller por más de 7 días:**
```sql
SELECT 
  ve.entry_code,
  v.license_plate,
  v.brand,
  v.model,
  ve.entry_date,
  EXTRACT(DAY FROM (CURRENT_TIMESTAMP - ve.entry_date)) as days_in_workshop,
  wo.order_number,
  wo.current_status
FROM vehicle_entries ve
JOIN vehicles v ON ve.vehicle_id = v.id
LEFT JOIN work_orders wo ON ve.id = wo.entry_id
WHERE ve.exit_date IS NULL
  AND ve.entry_date < CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY ve.entry_date;
```

**Mecánicos más productivos del mes:**
```sql
SELECT 
  u.first_name || ' ' || u.last_name as mechanic,
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE wo.current_status = 'completado') as completed,
  ROUND(AVG(wo.total_hours), 2) as avg_hours,
  SUM(wo.total_hours) as total_hours
FROM users u
JOIN work_orders wo ON u.id = wo.assigned_to_id
WHERE u.role_id = (SELECT id FROM roles WHERE name = 'Mecánico')
  AND wo.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY u.id, u.first_name, u.last_name
ORDER BY completed DESC, avg_hours ASC;
```

**Repuestos más utilizados:**
```sql
SELECT 
  sp.code,
  sp.name,
  sp.category,
  COUNT(wosp.id) as times_requested,
  SUM(wosp.quantity_delivered) as total_quantity
FROM spare_parts sp
JOIN work_order_spare_parts wosp ON sp.id = wosp.spare_part_id
WHERE wosp.status = 'entregado'
  AND wosp.delivered_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY sp.id, sp.code, sp.name, sp.category
ORDER BY total_quantity DESC
LIMIT 10;
```

**Órdenes por prioridad y taller:**
```sql
SELECT 
  w.name as workshop,
  wo.priority,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE wo.current_status = 'completado') as completed,
  COUNT(*) FILTER (WHERE wo.current_status IN ('pendiente', 'en_progreso')) as active
FROM work_orders wo
JOIN workshops w ON wo.workshop_id = w.id
WHERE wo.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY w.id, w.name, wo.priority
ORDER BY w.name, 
  CASE wo.priority 
    WHEN 'critica' THEN 1 
    WHEN 'alta' THEN 2 
    WHEN 'media' THEN 3 
    WHEN 'baja' THEN 4 
  END;
```

### 8.2 Auditoría

**Acciones de un usuario en un día:**
```sql
SELECT 
  al.action,
  al.resource,
  al.resource_id,
  al.details,
  al.created_at
FROM audit_logs al
WHERE al.user_id = 'uuid'
  AND DATE(al.created_at) = CURRENT_DATE
ORDER BY al.created_at DESC;
```

**Cambios en un registro específico:**
```sql
SELECT 
  u.first_name || ' ' || u.last_name as user,
  al.action,
  al.details,
  al.created_at
FROM audit_logs al
JOIN users u ON al.user_id = u.id
WHERE al.resource = 'work-orders'
  AND al.resource_id = 'order_uuid'
ORDER BY al.created_at;
```

### 8.3 Estadísticas

**Resumen diario del taller:**
```sql
SELECT 
  DATE(ve.entry_date) as date,
  COUNT(DISTINCT ve.id) as total_entries,
  COUNT(DISTINCT ve.id) FILTER (WHERE ve.exit_date IS NOT NULL) as exits,
  COUNT(DISTINCT wo.id) as work_orders_created,
  COUNT(DISTINCT wo.id) FILTER (WHERE wo.current_status = 'completado') as completed_orders
FROM vehicle_entries ve
LEFT JOIN work_orders wo ON ve.id = wo.entry_id
WHERE ve.workshop_id = 'taller_uuid'
  AND ve.entry_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(ve.entry_date)
ORDER BY date DESC;
```

---

## 9. Optimización

### 9.1 Queries N+1

**❌ Problema (N+1):**
```typescript
const users = await prisma.user.findMany()  // 1 query
for (const user of users) {
  const role = await prisma.role.findUnique({  // N queries
    where: { id: user.roleId }
  })
}
```

**✅ Solución (Eager Loading):**
```typescript
const users = await prisma.user.findMany({  // 1 query
  include: {
    role: true
  }
})
```

### 9.2 Select Específico

**❌ Malo:**
```typescript
const users = await prisma.user.findMany()  // Trae todos los campos
```

**✅ Bueno:**
```typescript
const users = await prisma.user.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    role: {
      select: { name: true }
    }
  }
})
```

### 9.3 Paginación

**Siempre paginar listas largas:**
```typescript
const page = 1
const limit = 10
const skip = (page - 1) * limit

const [items, total] = await Promise.all([
  prisma.vehicles.findMany({ skip, take: limit }),
  prisma.vehicles.count()
])
```

### 9.4 Índices Compuestos

**Para queries frecuentes con múltiples filtros:**
```sql
-- Query común:
SELECT * FROM work_orders 
WHERE workshop_id = 'uuid' AND current_status = 'en_progreso';

-- Índice compuesto:
CREATE INDEX idx_work_orders_workshop_status 
ON work_orders(workshop_id, current_status);
```

---

## 10. Mantenimiento

### 10.1 Limpieza de Datos

**Eliminar audit_logs antiguos (>1 año):**
```sql
DELETE FROM audit_logs 
WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
```

**Archivar órdenes completadas antiguas:**
```sql
-- Crear tabla de archivo
CREATE TABLE work_orders_archive (
  LIKE work_orders INCLUDING ALL
);

-- Mover registros
INSERT INTO work_orders_archive
SELECT * FROM work_orders
WHERE current_status = 'completado'
  AND completed_at < CURRENT_DATE - INTERVAL '2 years';

-- Eliminar de tabla principal
DELETE FROM work_orders
WHERE id IN (SELECT id FROM work_orders_archive);
```

### 10.2 Vacuum y Analyze

**Mantenimiento regular de PostgreSQL:**
```sql
-- Vacuum para liberar espacio
VACUUM FULL spare_parts;

-- Analyze para actualizar estadísticas
ANALYZE work_orders;

-- O ambos
VACUUM ANALYZE;
```

**Configurar autovacuum:**
```sql
-- Ver configuración actual
SHOW autovacuum;

-- Ajustar (postgresql.conf)
autovacuum = on
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_scale_factor = 0.05
```

### 10.3 Reindexación

**Cuando los índices se fragmentan:**
```sql
-- Reindexar tabla específica
REINDEX TABLE work_orders;

-- Reindexar índice específico
REINDEX INDEX idx_work_orders_current_status;

-- Reindexar toda la base
REINDEX DATABASE pepsico_fleet;
```

---

## 11. Backup y Restore

### 11.1 Backup Completo

```bash
# Backup de toda la base
pg_dump -U pepsico -h host -d pepsico_fleet -F c -f backup.dump

# Con compresión
pg_dump -U pepsico -h host -d pepsico_fleet | gzip > backup.sql.gz

# Solo schema (sin datos)
pg_dump -U pepsico -h host -d pepsico_fleet -s > schema.sql

# Solo datos
pg_dump -U pepsico -h host -d pepsico_fleet -a > data.sql
```

### 11.2 Backup Selectivo

```bash
# Solo tablas específicas
pg_dump -U pepsico -h host -d pepsico_fleet \
  -t users -t roles -t vehicles > critical_tables.sql

# Excluir tablas grandes
pg_dump -U pepsico -h host -d pepsico_fleet \
  -T audit_logs -T notifications > backup_without_logs.sql
```

### 11.3 Restore

```bash
# Desde dump comprimido
pg_restore -U pepsico -h host -d pepsico_fleet backup.dump

# Desde SQL
psql -U pepsico -h host -d pepsico_fleet < backup.sql

# Desde SQL comprimido
gunzip -c backup.sql.gz | psql -U pepsico -h host -d pepsico_fleet
```

### 11.4 Point-in-Time Recovery

**Si usas Neon:**
- Dashboard → Branch → Restore from History
- Selecciona timestamp
- Crea nueva branch con ese estado

**Si usas PostgreSQL propio:**
- Requiere WAL archiving configurado
- Ver documentación de PostgreSQL PITR

---

## 12. Seguridad de Base de Datos

### 12.1 Usuarios y Roles de PostgreSQL

```sql
-- Usuario para aplicación (solo lo necesario)
CREATE USER pepsico_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE pepsico_fleet TO pepsico_app;
GRANT USAGE ON SCHEMA public TO pepsico_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pepsico_app;

-- Usuario para backups (solo lectura)
CREATE USER pepsico_backup WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE pepsico_fleet TO pepsico_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO pepsico_backup;

-- Usuario para reportes (solo lectura, sin datos sensibles)
CREATE USER pepsico_reports WITH PASSWORD 'secure_password';
GRANT SELECT ON vehicles, work_orders, spare_parts TO pepsico_reports;
REVOKE SELECT ON users FROM pepsico_reports;  -- No ver datos de usuarios
```

### 12.2 Encriptación

**En tránsito:**
- Siempre usar `?sslmode=require` en DATABASE_URL
- Certificados SSL/TLS válidos

**En reposo:**
- Neon/Supabase: encriptación automática
- PostgreSQL propio: configurar pgcrypto

### 12.3 Row-Level Security (RLS)

**Ejemplo para futura implementación:**
```sql
-- Habilitar RLS
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Mecánicos solo ven sus propias órdenes
CREATE POLICY mechanic_own_orders ON work_orders
FOR SELECT
USING (
  assigned_to_id = current_user_id() OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = current_user_id() 
    AND role_id IN (SELECT id FROM roles WHERE name = 'Administrador')
  )
);
```

---

## 13. Monitoring de Database

### 13.1 Métricas Clave

**Tamaño de tablas:**
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Índices no utilizados:**
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'pg_toast%'
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Queries activas:**
```sql
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query,
  query_start
FROM pg_stat_activity
WHERE state = 'active'
  AND query NOT LIKE '%pg_stat_activity%';
```

**Locks:**
```sql
SELECT 
  pg_class.relname,
  pg_locks.locktype,
  pg_locks.mode,
  pg_locks.granted
FROM pg_locks
JOIN pg_class ON pg_locks.relation = pg_class.oid
WHERE pg_locks.pid != pg_backend_pid();
```

### 13.2 Alertas Recomendadas

```
- Database size > 8GB (si en plan free)
- Conexiones activas > 90% del límite
- Queries > 1 segundo
- Locks > 30 segundos
- Replication lag > 1 minuto (si aplica)
- Disk usage > 80%
```

---

## 14. Integridad de Datos

### 14.1 Validaciones Automáticas

**A nivel de base de datos:**
```sql
-- RUT válido (trigger)
CREATE OR REPLACE FUNCTION validate_rut()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT is_valid_chilean_rut(NEW.rut) THEN
    RAISE EXCEPTION 'RUT inválido: %', NEW.rut;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_rut_before_insert
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION validate_rut();
```

**A nivel de aplicación (Prisma):**
```typescript
// Validación antes de insertar
if (!validateRUT(data.rut)) {
  throw new Error('RUT inválido')
}
```

### 14.2 Consistencia

**Transacciones ACID:**
```typescript
await prisma.$transaction(async (tx) => {
  // Todas estas operaciones son atómicas
  const entry = await tx.vehicleEntry.create({ ... })
  await tx.vehicle.update({ ... })
  await tx.keyControl.create({ ... })
  // Si una falla, todas se revierten
})
```

### 14.3 Auditoría de Cambios

**Todos los cambios críticos se registran:**
```sql
SELECT 
  u.email,
  al.action,
  al.resource,
  al.details->>'field' as changed_field,
  al.details->>'from' as old_value,
  al.details->>'to' as new_value,
  al.created_at
FROM audit_logs al
JOIN users u ON al.user_id = u.id
WHERE al.resource = 'work_orders'
  AND al.resource_id = 'order_uuid'
ORDER BY al.created_at;
```

---

## 15. Anexos

### 15.1 Convenciones

**Nombres de tablas:** `snake_case` plural  
**Nombres de columnas:** `snake_case`  
**Primary keys:** `id` (UUID)  
**Foreign keys:** `tabla_id`  
**Timestamps:** `created_at`, `updated_at`  
**Soft deletes:** `is_active` (boolean)  

### 15.2 Tipos de Datos

```sql
-- IDs
UUID                 -- Identificadores únicos

-- Strings
VARCHAR(n)           -- Texto con límite
TEXT                 -- Texto ilimitado

-- Números
INTEGER              -- Enteros
DECIMAL(10,2)        -- Decimales (precios, horas)

-- Fechas
TIMESTAMP            -- Fecha y hora
DATE                 -- Solo fecha

-- Booleanos
BOOLEAN              -- true/false

-- JSON
JSONB                -- JSON binario (más eficiente)
```

### 15.3 Scripts Útiles

**Resetear secuencias:**
```sql
SELECT setval('tabla_id_seq', (SELECT MAX(id) FROM tabla));
```

**Duplicar base de datos:**
```sql
CREATE DATABASE pepsico_fleet_staging 
WITH TEMPLATE pepsico_fleet OWNER pepsico;
```

**Ver tamaño total:**
```sql
SELECT pg_size_pretty(pg_database_size('pepsico_fleet'));
```

---

**Documento preparado por:** Benjamin Vilches  
**Fecha:** Octubre 15, 2024  
**Versión:** 1.0.0


