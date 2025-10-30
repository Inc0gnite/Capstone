# 📘 Documentación Técnica Interna - PepsiCo Fleet Management System

**Versión:** 1.0.0  
**Fecha:** Octubre 15, 2024  
**Equipo:** Joaquín Marín, Benjamin Vilches  
**Cliente:** PepsiCo Chile  

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Base de Datos](#base-de-datos)
4. [Backend (API)](#backend-api)
5. [Frontend](#frontend)
6. [Seguridad](#seguridad)
7. [Deployment](#deployment)
8. [Mantenimiento](#mantenimiento)

---

## 1. Resumen Ejecutivo

### 1.1 Objetivo del Sistema

Sistema web para gestionar el ingreso, mantenimiento y salida de vehículos de la flota de PepsiCo Chile, optimizando el control de talleres mecánicos a nivel nacional.

### 1.2 Alcance

- **Usuarios:** 50+ usuarios concurrentes
- **Vehículos:** 500+ vehículos en flota
- **Talleres:** 10+ talleres en diferentes regiones
- **Órdenes:** 1000+ órdenes de trabajo mensuales
- **Repuestos:** 500+ items en inventario

### 1.3 Stack Tecnológico

#### Backend:
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js 4.19
- **Lenguaje:** TypeScript 5.5
- **ORM:** Prisma 5.20
- **Base de Datos:** PostgreSQL 15
- **Autenticación:** JWT (jsonwebtoken)
- **Seguridad:** bcrypt, helmet, cors
- **Logging:** Winston

#### Frontend:
- **Framework:** React 18.3
- **Lenguaje:** TypeScript 5.5
- **Build Tool:** Vite 5.4
- **Routing:** React Router 6.26
- **State Management:** Zustand 4.5
- **Server State:** TanStack Query 5.56
- **Styling:** TailwindCSS 3.4
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios

#### DevOps:
- **Control de Versiones:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Deployment:** Vercel (Frontend) + Railway (Backend)
- **Database Hosting:** Neon/Supabase

---

## 2. Arquitectura del Sistema

### 2.1 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React + TypeScript + Vite + TailwindCSS                    │
│  - Dashboards personalizados por rol                        │
│  - Componentes reutilizables                                │
│  - Guards de autenticación                                  │
│  - Interceptores de API                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS / JSON
                     │
┌────────────────────▼────────────────────────────────────────┐
│                     BACKEND API                              │
│  Node.js + Express + TypeScript                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Middlewares:                                           │ │
│  │  - Autenticación JWT                                   │ │
│  │  - RBAC (Control de acceso)                           │ │
│  │  - Validación de datos                                │ │
│  │  - Auditoría                                           │ │
│  │  - Rate limiting                                       │ │
│  │  - Helmet (seguridad)                                 │ │
│  │  - CORS                                                │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Capa de Controladores (10 controladores)              │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Capa de Servicios (Lógica de negocio)                 │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Prisma ORM (Acceso a datos)                            │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ SQL
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   BASE DE DATOS                              │
│  PostgreSQL 15                                              │
│  - 20 tablas normalizadas                                   │
│  - Índices optimizados                                      │
│  - Relaciones integridad referencial                        │
│  - Triggers y constraints                                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Patrón Arquitectónico

**Arquitectura en Capas (Layered Architecture)**

```
┌──────────────────────────────────────┐
│  Presentation Layer (Frontend)       │  ← React Components, Pages, UI
├──────────────────────────────────────┤
│  API Layer (Routes)                  │  ← Express Routes, Middlewares
├──────────────────────────────────────┤
│  Business Logic Layer (Services)     │  ← Lógica de negocio, validaciones
├──────────────────────────────────────┤
│  Data Access Layer (Prisma ORM)      │  ← Queries, Transacciones
├──────────────────────────────────────┤
│  Database Layer (PostgreSQL)         │  ← Almacenamiento persistente
└──────────────────────────────────────┘
```

### 2.3 Flujo de Request

```
1. Usuario → Frontend (React)
   ↓
2. HTTP Request con JWT → Backend (Express)
   ↓
3. Middleware de Autenticación → Valida JWT
   ↓
4. Middleware de Autorización → Verifica permisos RBAC
   ↓
5. Middleware de Validación → Valida datos de entrada
   ↓
6. Controller → Recibe request
   ↓
7. Service → Ejecuta lógica de negocio
   ↓
8. Prisma ORM → Consulta/modifica base de datos
   ↓
9. Database (PostgreSQL) → Retorna datos
   ↓
10. Service → Procesa datos
   ↓
11. Controller → Formatea respuesta
   ↓
12. Middleware de Auditoría → Registra acción
   ↓
13. Response → Frontend
   ↓
14. Frontend → Actualiza UI
```

---

## 3. Base de Datos

### 3.1 Modelo de Datos

**20 Tablas organizadas en 6 módulos:**

#### A. Gestión de Usuarios y Seguridad (5 tablas)
```
users
├── id (UUID, PK)
├── rut (String, UNIQUE)
├── firstName (String)
├── lastName (String)
├── email (String, UNIQUE)
├── password (String, hashed)
├── phone (String, nullable)
├── roleId (FK → roles)
├── workshopId (FK → workshops, nullable)
├── isActive (Boolean, default: true)
├── lastLogin (DateTime, nullable)
├── createdAt (DateTime)
└── updatedAt (DateTime)

roles
├── id (UUID, PK)
├── name (String, UNIQUE)
├── description (String, nullable)
├── createdAt (DateTime)
└── updatedAt (DateTime)

permissions
├── id (UUID, PK)
├── resource (String)
├── action (String)
├── description (String, nullable)
├── createdAt (DateTime)
└── UNIQUE(resource, action)

role_permissions
├── roleId (FK → roles, PK)
├── permissionId (FK → permissions, PK)
└── createdAt (DateTime)

audit_logs
├── id (UUID, PK)
├── userId (FK → users)
├── action (String)
├── resource (String)
├── resourceId (String, nullable)
├── details (JSON, nullable)
├── ipAddress (String, nullable)
├── userAgent (String, nullable)
└── createdAt (DateTime)
```

#### B. Gestión de Vehículos (3 tablas)
```
vehicles
├── id (UUID, PK)
├── licensePlate (String, UNIQUE)
├── vehicleType (String)
├── brand (String)
├── model (String)
├── year (Int)
├── vin (String, UNIQUE, nullable)
├── fleetNumber (String, UNIQUE, nullable)
├── regionId (FK → regions)
├── status (String, default: "active")
├── isActive (Boolean, default: true)
├── createdAt (DateTime)
└── updatedAt (DateTime)

vehicle_entries
├── id (UUID, PK)
├── entryCode (String, UNIQUE)
├── vehicleId (FK → vehicles)
├── workshopId (FK → workshops)
├── driverRut (String)
├── driverName (String)
├── driverPhone (String, nullable)
├── entryDate (DateTime)
├── exitDate (DateTime, nullable)
├── entryKm (Int)
├── exitKm (Int, nullable)
├── fuelLevel (String)
├── hasKeys (Boolean, default: true)
├── observations (String, nullable)
├── photos (JSON, nullable)
├── status (String, default: "ingresado")
├── createdById (FK → users)
├── createdAt (DateTime)
└── updatedAt (DateTime)

key_control
├── id (UUID, PK)
├── entryId (FK → vehicle_entries, UNIQUE)
├── keyLocation (String)
├── deliveredTo (String, nullable)
├── deliveredAt (DateTime, nullable)
├── returnedBy (String, nullable)
├── returnedAt (DateTime, nullable)
├── observations (String, nullable)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

#### C. Órdenes de Trabajo (4 tablas)
```
work_orders
├── id (UUID, PK)
├── orderNumber (String, UNIQUE)
├── vehicleId (FK → vehicles)
├── entryId (FK → vehicle_entries)
├── workshopId (FK → workshops)
├── workType (String)
├── priority (String, default: "media")
├── description (String)
├── estimatedHours (Float, nullable)
├── assignedToId (FK → users, nullable)
├── currentStatus (String, default: "pendiente")
├── startedAt (DateTime, nullable)
├── completedAt (DateTime, nullable)
├── totalHours (Float, nullable)
├── observations (String, nullable)
├── createdById (FK → users)
├── createdAt (DateTime)
└── updatedAt (DateTime)

work_order_statuses
├── id (UUID, PK)
├── workOrderId (FK → work_orders)
├── status (String)
├── observations (String, nullable)
├── changedById (String)
├── changedAt (DateTime)

work_order_photos
├── id (UUID, PK)
├── workOrderId (FK → work_orders)
├── url (String)
├── description (String, nullable)
├── photoType (String)
└── uploadedAt (DateTime)

work_pauses
├── id (UUID, PK)
├── workOrderId (FK → work_orders)
├── reason (String)
├── pausedAt (DateTime)
├── resumedAt (DateTime, nullable)
├── duration (Int, nullable, en minutos)
└── observations (String, nullable)
```

#### D. Inventario (3 tablas)
```
spare_parts
├── id (UUID, PK)
├── code (String, UNIQUE)
├── name (String)
├── description (String, nullable)
├── category (String)
├── unitOfMeasure (String)
├── unitPrice (Float)
├── currentStock (Int, default: 0)
├── minStock (Int)
├── maxStock (Int)
├── location (String, nullable)
├── isActive (Boolean, default: true)
├── createdAt (DateTime)
└── updatedAt (DateTime)

work_order_spare_parts
├── id (UUID, PK)
├── workOrderId (FK → work_orders)
├── sparePartId (FK → spare_parts)
├── quantityRequested (Int)
├── quantityDelivered (Int, nullable)
├── status (String, default: "solicitado")
├── requestedAt (DateTime)
├── deliveredAt (DateTime, nullable)
└── observations (String, nullable)

spare_part_movements
├── id (UUID, PK)
├── sparePartId (FK → spare_parts)
├── movementType (String: entrada, salida, ajuste)
├── quantity (Int)
├── previousStock (Int)
├── newStock (Int)
├── reason (String)
├── reference (String, nullable)
└── createdAt (DateTime)
```

#### E. Infraestructura (3 tablas)
```
regions
├── id (UUID, PK)
├── code (String, UNIQUE)
├── name (String)
├── isActive (Boolean, default: true)
└── createdAt (DateTime)

workshops
├── id (UUID, PK)
├── code (String, UNIQUE)
├── name (String)
├── regionId (FK → regions)
├── address (String)
├── city (String)
├── phone (String, nullable)
├── capacity (Int, nullable)
├── isActive (Boolean, default: true)
├── createdAt (DateTime)
└── updatedAt (DateTime)

workshop_schedules
├── id (UUID, PK)
├── workshopId (FK → workshops)
├── dayOfWeek (Int: 0-6, donde 0=Domingo)
├── openTime (String: "HH:MM")
├── closeTime (String: "HH:MM")
└── isActive (Boolean, default: true)
```

#### F. Documentación y Notificaciones (2 tablas)
```
documents
├── id (UUID, PK)
├── name (String)
├── type (String)
├── url (String)
├── relatedTo (String: tabla relacionada)
├── relatedId (String: ID del registro relacionado)
└── uploadedAt (DateTime)

notifications
├── id (UUID, PK)
├── userId (FK → users)
├── title (String)
├── message (String)
├── type (String)
├── relatedTo (String, nullable)
├── relatedId (String, nullable)
├── isRead (Boolean, default: false)
├── readAt (DateTime, nullable)
└── createdAt (DateTime)
```

### 3.2 Índices Optimizados

**Índices implementados para performance:**

```sql
-- users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rut ON users(rut);
CREATE INDEX idx_users_role_id ON users(role_id);

-- vehicles
CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX idx_vehicles_region_id ON vehicles(region_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- vehicle_entries
CREATE INDEX idx_entries_vehicle_id ON vehicle_entries(vehicle_id);
CREATE INDEX idx_entries_workshop_id ON vehicle_entries(workshop_id);
CREATE INDEX idx_entries_entry_date ON vehicle_entries(entry_date);
CREATE INDEX idx_entries_status ON vehicle_entries(status);

-- work_orders
CREATE INDEX idx_work_orders_vehicle_id ON work_orders(vehicle_id);
CREATE INDEX idx_work_orders_entry_id ON work_orders(entry_id);
CREATE INDEX idx_work_orders_workshop_id ON work_orders(workshop_id);
CREATE INDEX idx_work_orders_assigned_to_id ON work_orders(assigned_to_id);
CREATE INDEX idx_work_orders_current_status ON work_orders(current_status);
CREATE INDEX idx_work_orders_created_at ON work_orders(created_at);

-- spare_parts
CREATE INDEX idx_spare_parts_code ON spare_parts(code);
CREATE INDEX idx_spare_parts_category ON spare_parts(category);

-- notifications
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- audit_logs
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource, resource_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
```

### 3.3 Relaciones

**Diagrama de Relaciones Principales:**

```
users ──┬──< audit_logs
        ├──< vehicle_entries (createdBy)
        ├──< work_orders (createdBy)
        ├──< work_orders (assignedTo)
        ├──< notifications
        ├──> roles
        └──> workshops

vehicles ──┬──< vehicle_entries
           └──< work_orders

vehicle_entries ──┬──< work_orders
                  └──< key_control (1:1)

work_orders ──┬──< work_order_statuses
              ├──< work_order_photos
              ├──< work_pauses
              └──< work_order_spare_parts

spare_parts ──┬──< work_order_spare_parts
              └──< spare_part_movements

regions ──┬──< workshops
          └──< vehicles

workshops ──┬──< users
            ├──< vehicle_entries
            ├──< work_orders
            └──< workshop_schedules

roles ──┬──< users
        └──< role_permissions

permissions ──< role_permissions
```

---

## 4. Backend (API)

### 4.1 Estructura de Directorios

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Cliente Prisma singleton
│   │   └── logger.ts            # Configuración Winston
│   │
│   ├── controllers/             # Capa de controladores (10 archivos)
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── roleController.ts
│   │   ├── vehicleController.ts
│   │   ├── vehicleEntryController.ts
│   │   ├── workOrderController.ts
│   │   ├── sparePartController.ts
│   │   ├── workshopController.ts
│   │   ├── regionController.ts
│   │   ├── notificationController.ts
│   │   └── dashboardController.ts
│   │
│   ├── services/                # Lógica de negocio (9 archivos)
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── roleService.ts
│   │   ├── vehicleService.ts
│   │   ├── vehicleEntryService.ts
│   │   ├── workOrderService.ts
│   │   ├── sparePartService.ts
│   │   ├── workshopService.ts
│   │   ├── notificationService.ts
│   │   └── dashboardService.ts
│   │
│   ├── routes/                  # Definición de rutas (11 archivos)
│   │   ├── index.ts             # Router principal
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── roleRoutes.ts
│   │   ├── vehicleRoutes.ts
│   │   ├── vehicleEntryRoutes.ts
│   │   ├── workOrderRoutes.ts
│   │   ├── sparePartRoutes.ts
│   │   ├── workshopRoutes.ts
│   │   ├── regionRoutes.ts
│   │   ├── notificationRoutes.ts
│   │   └── dashboardRoutes.ts
│   │
│   ├── middlewares/             # Middlewares (5 archivos)
│   │   ├── auth.ts              # Autenticación JWT
│   │   ├── rbac.ts              # Control de acceso por roles
│   │   ├── validation.ts        # Validación de datos
│   │   ├── audit.ts             # Auditoría de acciones
│   │   └── errorHandler.ts      # Manejo de errores
│   │
│   ├── utils/                   # Utilidades (4 archivos)
│   │   ├── auth.ts              # Hash, JWT
│   │   ├── validation.ts        # Validaciones (RUT, email, etc.)
│   │   ├── response.ts          # Respuestas estándar
│   │   └── generators.ts        # Códigos únicos
│   │
│   └── index.ts                 # Entry point de la aplicación
│
├── prisma/
│   ├── schema.prisma            # Esquema de base de datos
│   └── seed.ts                  # Datos de prueba
│
├── .env                         # Variables de entorno
├── .env.example                 # Ejemplo de configuración
├── package.json
└── tsconfig.json
```

### 4.2 Patrones Implementados

#### Patrón Singleton
```typescript
// config/database.ts
const prisma = new PrismaClient()
export default prisma
```

#### Patrón Service Layer
```typescript
// services/authService.ts
class AuthService {
  async login(data: LoginRequest) {
    // Lógica de negocio
    const user = await prisma.user.findUnique(...)
    const isValid = await verifyPassword(...)
    const tokens = generateTokens(...)
    return { tokens, user }
  }
}

export default new AuthService()
```

#### Patrón Factory (Generadores)
```typescript
// utils/generators.ts
export function generateEntryCode(): string {
  const date = new Date()
  const random = Math.floor(Math.random() * 10000)
  return `ING-${YYYYMMDD}-${random.padStart(4, '0')}`
}
```

#### Middleware Chain
```typescript
// routes/userRoutes.ts
router.post(
  '/',
  authenticate,              // 1. Verificar autenticación
  requireAdmin,              // 2. Verificar rol
  validateBody([...]),       // 3. Validar datos
  validateEmailField(),      // 4. Validar email específicamente
  auditLog('create', 'users'), // 5. Auditar acción
  userController.create      // 6. Ejecutar
)
```

### 4.3 Seguridad

#### Autenticación JWT
```typescript
// Generación de tokens
const accessToken = jwt.sign(payload, SECRET, { expiresIn: '15m' })
const refreshToken = jwt.sign(payload, SECRET, { expiresIn: '7d' })
```

#### Hash de Contraseñas
```typescript
// bcrypt con 10 salt rounds
const hashedPassword = await bcrypt.hash(password, 10)
const isValid = await bcrypt.compare(password, hashedPassword)
```

#### RBAC (Role-Based Access Control)
```typescript
// Verificación de permisos
const hasPermission = role.permissions.some(
  rp => rp.permission.resource === 'users' && 
        rp.permission.action === 'create'
)
```

#### Rate Limiting
```typescript
// 100 requests por 15 minutos por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})
```

#### Helmet.js
```typescript
// Headers de seguridad
app.use(helmet())
// - X-DNS-Prefetch-Control
// - X-Frame-Options
// - X-Content-Type-Options
// - etc.
```

#### CORS
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
```

### 4.4 Validaciones

#### RUT Chileno
```typescript
export function validateRUT(rut: string): boolean {
  const cleanRUT = rut.replace(/\./g, '').replace(/-/g, '')
  const body = cleanRUT.slice(0, -1)
  const dv = cleanRUT.slice(-1)
  
  // Algoritmo de validación de DV
  let sum = 0
  let multiplier = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  const expectedDV = 11 - (sum % 11)
  // ...
}
```

#### Patente Chilena
```typescript
export function validateLicensePlate(plate: string): boolean {
  const plateRegex = /^[A-Z]{2,4}-?\d{2,4}$/
  return plateRegex.test(plate.toUpperCase())
}
```

#### Contraseña Segura
```typescript
export function validatePassword(password: string) {
  const errors = []
  if (password.length < 8) errors.push('Mínimo 8 caracteres')
  if (!/[A-Z]/.test(password)) errors.push('Falta mayúscula')
  if (!/[a-z]/.test(password)) errors.push('Falta minúscula')
  if (!/[0-9]/.test(password)) errors.push('Falta número')
  return { isValid: errors.length === 0, errors }
}
```

### 4.5 Transacciones

**Ejemplo de transacción atómica:**

```typescript
// Crear ingreso de vehículo con control de llaves
const entry = await prisma.$transaction(async (tx) => {
  // 1. Crear ingreso
  const newEntry = await tx.vehicleEntry.create({ ... })
  
  // 2. Actualizar estado del vehículo
  await tx.vehicle.update({
    where: { id: vehicleId },
    data: { status: 'in_maintenance' }
  })
  
  // 3. Crear control de llaves
  if (hasKeys) {
    await tx.keyControl.create({ ... })
  }
  
  return newEntry
})
```

### 4.6 Logging

**Configuración Winston:**

```typescript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.colorize()
    })
  ]
})
```

**Niveles de log:**
- `error` - Errores críticos
- `warn` - Advertencias
- `info` - Información general
- `debug` - Debug detallado

---

## 5. Frontend

### 5.1 Estructura de Directorios

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   └── MainLayout.tsx       # Layout principal con sidebar
│   │   ├── shared/
│   │   │   ├── Card.tsx             # Componente Card
│   │   │   ├── Button.tsx           # Componente Button
│   │   │   ├── Badge.tsx            # Componente Badge
│   │   │   └── ...
│   │   └── PrivateRoute.tsx         # Guard de rutas
│   │
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx            # Router de dashboards
│   │   └── dashboards/
│   │       ├── AdminDashboard.tsx
│   │       ├── GuardiaDashboard.tsx
│   │       ├── RecepcionistaDashboard.tsx
│   │       ├── MecanicoDashboard.tsx
│   │       ├── JefeTallerDashboard.tsx
│   │       └── InventarioDashboard.tsx
│   │
│   ├── services/
│   │   ├── api.ts                   # Cliente Axios con interceptores
│   │   ├── authService.ts
│   │   ├── dashboardService.ts
│   │   ├── vehicleService.ts
│   │   ├── workOrderService.ts
│   │   └── notificationService.ts
│   │
│   ├── store/
│   │   └── authStore.ts             # Zustand store
│   │
│   ├── hooks/                       # Custom hooks
│   ├── types/                       # TypeScript types
│   ├── utils/                       # Utilidades
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### 5.2 Gestión de Estado

#### Auth Store (Zustand)
```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  getCurrentUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({ ... }),
    { name: 'auth-storage' }
  )
)
```

#### Server State (TanStack Query)
```typescript
// Ejemplo de uso
const { data, isLoading, error } = useQuery({
  queryKey: ['vehicles'],
  queryFn: () => vehicleService.getAll()
})
```

### 5.3 Interceptores de API

**Interceptor de Request:**
```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**Interceptor de Response (Auto-refresh):**
```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      const { data } = await axios.post('/auth/refresh', { refreshToken })
      localStorage.setItem('accessToken', data.accessToken)
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
      return api(originalRequest)
    }
    return Promise.reject(error)
  }
)
```

### 5.4 Dashboards Personalizados

**6 Dashboards únicos según rol:**

1. **AdminDashboard** - Vista completa del sistema
2. **GuardiaDashboard** - Control de ingreso/salida
3. **RecepcionistaDashboard** - Gestión de ingresos y órdenes
4. **MecanicoDashboard** - Órdenes asignadas
5. **JefeTallerDashboard** - Supervisión del taller
6. **InventarioDashboard** - Gestión de repuestos

**Router dinámico:**
```typescript
const roleName = user.role.name

switch (roleName) {
  case 'Administrador': return <AdminDashboard />
  case 'Guardia': return <GuardiaDashboard />
  case 'Recepcionista': return <RecepcionistaDashboard />
  case 'Mecánico': return <MecanicoDashboard />
  case 'Jefe de Taller': return <JefeTallerDashboard />
  case 'Encargado de Inventario': return <InventarioDashboard />
}
```

### 5.5 Componentes Reutilizables

#### Card Component
```typescript
<Card>
  <CardHeader title="Título" subtitle="Subtítulo" />
  {/* Contenido */}
</Card>
```

#### Button Component
```typescript
<Button variant="primary" size="md" onClick={handleClick}>
  Guardar
</Button>

// Variantes: primary, secondary, danger, success
// Tamaños: sm, md, lg
```

#### Badge Component
```typescript
<Badge variant="success">Completado</Badge>

// Variantes: info, success, warning, danger, default
```

---

## 6. Seguridad

### 6.1 Autenticación

**JWT (JSON Web Tokens):**
- **Access Token:** 15 minutos de duración
- **Refresh Token:** 7 días de duración
- **Algoritmo:** HS256
- **Payload:**
  ```json
  {
    "userId": "uuid",
    "email": "user@pepsico.cl",
    "roleId": "uuid",
    "iat": 1234567890,
    "exp": 1234567890
  }
  ```

### 6.2 Autorización (RBAC)

**Control de acceso basado en roles:**

```typescript
// Middleware de autorización
export function authorize(resource: string, action: string) {
  return async (req, res, next) => {
    const role = await prisma.role.findUnique({
      where: { id: req.user.roleId },
      include: { permissions: { include: { permission: true } } }
    })
    
    const hasPermission = role.permissions.some(
      rp => rp.permission.resource === resource && 
            rp.permission.action === action
    )
    
    if (!hasPermission) {
      return sendError(res, 'Sin permisos', 403)
    }
    
    next()
  }
}
```

### 6.3 Validación de Datos

**Validaciones implementadas:**

- ✅ RUT chileno (algoritmo de DV)
- ✅ Email (regex RFC 5322)
- ✅ Contraseña (8+ chars, mayúscula, minúscula, número)
- ✅ Patente chilena (formatos válidos)
- ✅ Teléfono chileno (+56 9 XXXX XXXX)
- ✅ Paginación (page > 0, limit 1-100)
- ✅ Fechas (ISO 8601)

### 6.4 Protección contra Ataques

**OWASP Top 10 Mitigado:**

1. **Injection (SQL)** - Prisma ORM con prepared statements
2. **Broken Authentication** - JWT + bcrypt + refresh tokens
3. **Sensitive Data Exposure** - Passwords hasheados, HTTPS
4. **XML External Entities** - JSON only, no XML
5. **Broken Access Control** - RBAC granular
6. **Security Misconfiguration** - Helmet.js
7. **XSS** - React escapa automáticamente
8. **Insecure Deserialization** - JSON parse seguro
9. **Using Components with Known Vulnerabilities** - npm audit
10. **Insufficient Logging** - Winston logger + audit_logs

### 6.5 Auditoría

**Todas las acciones críticas se registran:**

```typescript
{
  userId: "uuid",
  action: "create",
  resource: "work-orders",
  resourceId: "uuid",
  details: {
    method: "POST",
    path: "/api/work-orders",
    body: { ... },
    params: { ... }
  },
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  createdAt: "2024-10-15T..."
}
```

**Acciones auditadas:**
- Login/Logout
- Creación/modificación/eliminación de registros
- Cambios de estado de órdenes
- Movimientos de inventario
- Cambios de permisos

---

## 7. Deployment

### 7.1 Entornos

#### Development
```env
DATABASE_URL=postgresql://localhost:5432/pepsico_dev
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=dev_secret
```

#### Production
```env
DATABASE_URL=postgresql://user:pass@prod-host/db?sslmode=require
NODE_ENV=production
FRONTEND_URL=https://fleet.pepsico.cl
JWT_SECRET=super_secret_production_key
```

### 7.2 Proceso de Deployment

#### Backend (Railway/Render/Heroku):

```bash
# 1. Build
npm run build

# 2. Generar cliente Prisma
npm run db:generate

# 3. Aplicar migraciones
npm run db:migrate

# 4. Iniciar en producción
npm start
```

**Variables de entorno requeridas:**
- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `NODE_ENV=production`

#### Frontend (Vercel/Netlify):

```bash
# 1. Build
npm run build

# 2. Deploy carpeta dist/
```

**Variables de entorno:**
- `VITE_API_URL=https://api.fleet.pepsico.cl`

### 7.3 CI/CD con GitHub Actions

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run lint
      - run: npm run build
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Vercel
        # ...
```

---

## 8. Mantenimiento

### 8.1 Comandos Útiles

#### Backend:
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start

# Prisma
npm run db:generate   # Generar cliente
npm run db:migrate    # Crear migración
npm run db:push       # Push directo (dev)
npm run db:seed       # Poblar datos
npm run db:studio     # GUI de base de datos
```

#### Frontend:
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

### 8.2 Logs

**Ubicación:**
```
backend/
├── error.log          # Solo errores
├── combined.log       # Todos los logs
└── console           # Tiempo real con colores
```

**Consultar logs:**
```bash
# Ver últimos errores
tail -f backend/error.log

# Buscar en logs
grep "user login" backend/combined.log
```

### 8.3 Backup de Base de Datos

```bash
# Backup
pg_dump -U usuario -d pepsico_fleet > backup_$(date +%Y%m%d).sql

# Restore
psql -U usuario -d pepsico_fleet < backup_20241015.sql
```

### 8.4 Monitoring

**Métricas a monitorear:**
- Tiempo de respuesta de API (< 200ms ideal)
- Uso de memoria del backend
- Queries lentas de base de datos
- Tasa de errores 5xx
- Uptime del sistema
- Cantidad de usuarios activos

**Herramientas sugeridas:**
- New Relic / Datadog para APM
- Sentry para error tracking
- LogRocket para session replay

---

## 9. Guías de Desarrollo

### 9.1 Agregar un Nuevo Endpoint

1. **Crear Service:**
```typescript
// backend/src/services/myService.ts
export class MyService {
  async myMethod() {
    return await prisma.myTable.findMany()
  }
}
export default new MyService()
```

2. **Crear Controller:**
```typescript
// backend/src/controllers/myController.ts
export class MyController {
  async myMethod(req: Request, res: Response) {
    const result = await myService.myMethod()
    return sendSuccess(res, result)
  }
}
export default new MyController()
```

3. **Crear Route:**
```typescript
// backend/src/routes/myRoutes.ts
router.get(
  '/',
  authenticate,
  authorize('resource', 'read'),
  myController.myMethod
)
```

4. **Registrar en Router Principal:**
```typescript
// backend/src/routes/index.ts
import myRoutes from './myRoutes'
router.use('/my-resource', myRoutes)
```

### 9.2 Agregar una Nueva Tabla

1. **Editar schema.prisma:**
```prisma
model MyTable {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  
  @@map("my_table")
}
```

2. **Crear migración:**
```bash
npx prisma migrate dev --name add_my_table
```

3. **Generar cliente:**
```bash
npm run db:generate
```

### 9.3 Agregar un Nuevo Rol

1. **Crear en seed o admin panel:**
```typescript
await prisma.role.create({
  data: {
    name: 'Nuevo Rol',
    description: 'Descripción del rol'
  }
})
```

2. **Asignar permisos:**
```typescript
await prisma.rolePermission.create({
  data: {
    roleId: newRole.id,
    permissionId: permission.id
  }
})
```

3. **Crear dashboard en frontend:**
```typescript
// frontend/src/pages/dashboards/NuevoRolDashboard.tsx
export default function NuevoRolDashboard() {
  return <MainLayout>...</MainLayout>
}
```

4. **Agregar al router:**
```typescript
// frontend/src/pages/Dashboard.tsx
case 'Nuevo Rol':
  return <NuevoRolDashboard />
```

---

## 10. Troubleshooting

### 10.1 Problemas Comunes

#### "Cannot connect to database"
```bash
# Verificar connection string
echo $DATABASE_URL

# Test de conexión
npx prisma db pull
```

#### "Module not found"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

#### "Port already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

#### "Token inválido"
- Verificar que JWT_SECRET sea el mismo en desarrollo y producción
- Verificar que el token no haya expirado
- Verificar headers Authorization

### 10.2 Debug

**Backend:**
```typescript
// Agregar breakpoints con debugger
debugger

// Logs detallados
logger.debug('Variable value:', myVar)

// Prisma debug
const result = await prisma.user.findMany()
console.log(JSON.stringify(result, null, 2))
```

**Frontend:**
```typescript
// React DevTools
console.log('State:', useAuthStore.getState())

// Network tab en browser
// Ver todas las peticiones HTTP
```

---

## 11. Performance

### 11.1 Optimizaciones Implementadas

#### Backend:
- ✅ Índices en columnas frecuentemente consultadas
- ✅ Paginación en todas las listas
- ✅ Select específico en Prisma (no `SELECT *`)
- ✅ Eager loading con `include` para evitar N+1
- ✅ Transacciones para operaciones múltiples
- ✅ Compresión de respuestas (gzip)
- ✅ Rate limiting

#### Frontend:
- ✅ Code splitting por ruta
- ✅ Lazy loading de componentes
- ✅ Memoización con useMemo/useCallback
- ✅ Virtual scrolling para listas largas
- ✅ Debounce en búsquedas
- ✅ Cache de TanStack Query (5 min stale time)

### 11.2 Límites y Capacidad

- **Usuarios concurrentes:** 100+
- **Requests por segundo:** 1000+
- **Tamaño máximo de payload:** 10MB
- **Timeout de requests:** 30 segundos
- **Límite de paginación:** 100 items por página

---

## 12. Convenciones de Código

### 12.1 Naming Conventions

**TypeScript:**
- Clases: `PascalCase` (UserService, AuthController)
- Funciones: `camelCase` (getUserById, validateEmail)
- Constantes: `UPPER_SNAKE_CASE` (JWT_SECRET, API_URL)
- Interfaces: `PascalCase` (User, LoginRequest)
- Enums: `PascalCase` (UserRole, VehicleStatus)

**Base de Datos:**
- Tablas: `snake_case` (users, work_orders)
- Columnas: `snake_case` (first_name, created_at)

**Archivos:**
- Components: `PascalCase.tsx` (LoginPage.tsx)
- Services: `camelCase.ts` (authService.ts)
- Utilities: `camelCase.ts` (validation.ts)

### 12.2 Estructura de Archivos

**Un archivo por:**
- Controller
- Service
- Route
- Component
- Page

**Máximo 300 líneas por archivo** (refactorizar si excede)

### 12.3 Comentarios

```typescript
/**
 * Descripción de la función
 * @param id - ID del usuario
 * @returns Usuario encontrado
 * @throws Error si usuario no existe
 */
async function getUserById(id: string): Promise<User> {
  // Implementación
}
```

---

## 13. Testing

### 13.1 Estrategia de Testing

#### Unitarias (Jest):
```typescript
describe('AuthService', () => {
  test('login with valid credentials', async () => {
    const result = await authService.login({
      email: 'test@test.com',
      password: 'password123'
    })
    expect(result.accessToken).toBeDefined()
  })
})
```

#### Integración (Supertest):
```typescript
describe('POST /api/auth/login', () => {
  test('returns token on valid login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password123' })
    
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })
})
```

#### E2E (Playwright):
```typescript
test('complete login flow', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.fill('#email', 'admin@pepsico.cl')
  await page.fill('#password', 'admin123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
})
```

### 13.2 Cobertura Objetivo

- **Unitarias:** 80% del código
- **Integración:** Todos los endpoints críticos
- **E2E:** Flujos principales de cada rol

---

## 14. Glosario

| Término | Definición |
|---------|------------|
| **RBAC** | Role-Based Access Control - Control de acceso basado en roles |
| **JWT** | JSON Web Token - Token de autenticación |
| **ORM** | Object-Relational Mapping - Mapeo objeto-relacional |
| **CRUD** | Create, Read, Update, Delete - Operaciones básicas |
| **Soft Delete** | Eliminación lógica (marca como inactivo, no borra) |
| **Middleware** | Función intermedia en el flujo de request |
| **Guard** | Protección de ruta en frontend |
| **Interceptor** | Modificador de requests/responses |
| **Seed** | Datos iniciales de prueba |

---

## 15. Anexos

### 15.1 Diagrama ER

Ver: `docs/arquitectura/Diagrama Entidad Relacion.pdf`

### 15.2 Diagrama de Casos de Uso

Ver: `docs/casos-uso/Diagrama_Casos_de_Uso.png`

### 15.3 API Reference Completa

Ver: `docs/api/README.md`

---

**Documento preparado por:**  
Joaquín Marín & Benjamin Vilches  
**Fecha:** Octubre 15, 2024  
**Versión:** 1.0.0


