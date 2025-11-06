# 📚 Documentación de API - PepsiCo Fleet Management

## 📖 Índice

1. [Autenticación](#autenticación)
2. [Usuarios](#usuarios)
3. [Roles y Permisos](#roles-y-permisos)
4. [Vehículos](#vehículos)
5. [Ingresos de Vehículos](#ingresos-de-vehículos)
6. [Órdenes de Trabajo](#órdenes-de-trabajo)
7. [Inventario de Repuestos](#inventario-de-repuestos)
8. [Talleres y Regiones](#talleres-y-regiones)
9. [Dashboard y Estadísticas](#dashboard-y-estadísticas)
10. [Notificaciones](#notificaciones)

---

## 🔐 Autenticación

### Base URL
```
http://localhost:3000/api
```

### Endpoints Públicos

#### POST /auth/login
Iniciar sesión en el sistema.

**Request:**
```json
{
  "email": "admin@pepsico.cl",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": {
      "id": "uuid",
      "rut": "12.345.678-9",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "admin@pepsico.cl",
      "role": {
        "id": "uuid",
        "name": "Administrador"
      }
    }
  },
  "message": "Login exitoso"
}
```

**Errores:**
- `401` - Credenciales inválidas
- `401` - Usuario inactivo

---

#### POST /auth/register
Registrar nuevo usuario (requiere ser Admin).

**Request:**
```json
{
  "rut": "11.111.111-1",
  "firstName": "Carlos",
  "lastName": "González",
  "email": "carlos@pepsico.cl",
  "password": "password123",
  "phone": "+56912345678",
  "roleId": "uuid",
  "workshopId": "uuid (opcional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": { ... }
  },
  "message": "Usuario registrado exitosamente"
}
```

---

#### POST /auth/refresh
Refrescar access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "nuevo_token",
    "refreshToken": "nuevo_refresh_token"
  }
}
```

---

### Endpoints Protegidos

> **Nota:** Todos estos endpoints requieren el header:
> ```
> Authorization: Bearer {accessToken}
> ```

#### GET /auth/me
Obtener información del usuario actual.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@pepsico.cl",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": {
      "name": "Administrador",
      "permissions": [
        {
          "permission": {
            "resource": "users",
            "action": "read"
          }
        }
      ]
    },
    "workshop": { ... }
  }
}
```

---

#### POST /auth/change-password
Cambiar contraseña del usuario.

**Request:**
```json
{
  "oldPassword": "admin123",
  "newPassword": "newPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Contraseña actualizada exitosamente"
  }
}
```

---

## 👥 Usuarios

### GET /users
Listar usuarios con paginación.

**Query Parameters:**
- `page` (opcional, default: 1)
- `limit` (opcional, default: 10, max: 100)
- `search` (opcional) - Busca en nombre, email, RUT

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "rut": "12.345.678-9",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "admin@pepsico.cl",
      "role": { ... },
      "workshop": { ... },
      "isActive": true,
      "createdAt": "2025-01-15T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Permisos requeridos:** `users:read`

---

### GET /users/:id
Obtener usuario por ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "rut": "12.345.678-9",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "admin@pepsico.cl",
    "phone": "+56912345678",
    "role": {
      "id": "uuid",
      "name": "Administrador",
      "permissions": [ ... ]
    },
    "workshop": null,
    "isActive": true,
    "lastLogin": "2025-01-15T...",
    "createdAt": "2025-01-15T..."
  }
}
```

**Errores:**
- `404` - Usuario no encontrado

---

### POST /users
Crear nuevo usuario.

**Permisos requeridos:** `Administrador`

**Request:**
```json
{
  "rut": "22.222.222-2",
  "firstName": "María",
  "lastName": "González",
  "email": "maria@pepsico.cl",
  "password": "password123",
  "phone": "+56987654321",
  "roleId": "uuid",
  "workshopId": "uuid (opcional)"
}
```

**Validaciones:**
- RUT debe ser válido y único
- Email debe ser válido y único
- Password mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
- roleId debe existir
- workshopId debe existir (si se proporciona)

**Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Usuario creado exitosamente"
}
```

---

### PUT /users/:id
Actualizar usuario.

**Permisos requeridos:** `users:update`

**Request:**
```json
{
  "firstName": "Juan Carlos",
  "phone": "+56911111111",
  "roleId": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Usuario actualizado exitosamente"
}
```

---

### DELETE /users/:id
Eliminar usuario (soft delete).

**Permisos requeridos:** `Administrador`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Usuario eliminado exitosamente"
  }
}
```

---

## 🎭 Roles y Permisos

### GET /roles
Listar todos los roles con sus permisos.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Administrador",
      "description": "Acceso total al sistema",
      "permissions": [
        {
          "permission": {
            "resource": "users",
            "action": "read"
          }
        }
      ],
      "_count": {
        "users": 5
      }
    }
  ]
}
```

---

### GET /roles/:id
Obtener rol específico.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Mecánico",
    "permissions": [ ... ]
  }
}
```

---

### GET /roles/permissions
Listar todos los permisos disponibles.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "resource": "users",
      "action": "read",
      "description": "Ver usuarios"
    },
    {
      "id": "uuid",
      "resource": "vehicles",
      "action": "create",
      "description": "Crear vehículos"
    }
  ]
}
```

---

## 🚗 Vehículos

### GET /vehicles
Listar vehículos con filtros.

**Query Parameters:**
- `page` - Número de página (default: 1)
- `limit` - Items por página (default: 10, max: 100)
- `search` - Buscar en patente, marca, modelo, VIN
- `vehicleType` - Filtrar por tipo (Camión, Camioneta, Furgón)
- `regionId` - Filtrar por región
- `status` - Filtrar por estado (active, in_maintenance, inactive)
- `sortBy` - Campo para ordenar (default: createdAt)
- `sortOrder` - Orden (asc, desc)

**Ejemplo:**
```
GET /vehicles?vehicleType=Camión&status=active&page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "licensePlate": "ABCD-12",
      "vehicleType": "Camión",
      "brand": "Mercedes-Benz",
      "model": "Actros 2644",
      "year": 2020,
      "vin": "WDB9632401L123456",
      "fleetNumber": "FL-001",
      "region": {
        "code": "RM",
        "name": "Región Metropolitana"
      },
      "status": "active",
      "isActive": true,
      "_count": {
        "entries": 15,
        "workOrders": 23
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 124,
    "totalPages": 7
  }
}
```

---

### GET /vehicles/stats
Obtener estadísticas de vehículos.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 124,
    "active": 98,
    "inMaintenance": 23,
    "inactive": 3,
    "byType": [
      { "vehicleType": "Camión", "_count": 85 },
      { "vehicleType": "Camioneta", "_count": 30 },
      { "vehicleType": "Furgón", "_count": 9 }
    ],
    "byRegion": [
      { "regionId": "uuid", "_count": 80 },
      { "regionId": "uuid", "_count": 44 }
    ]
  }
}
```

---

### GET /vehicles/:id
Obtener vehículo por ID con historial.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "licensePlate": "ABCD-12",
    "vehicleType": "Camión",
    "brand": "Mercedes-Benz",
    "model": "Actros 2644",
    "year": 2020,
    "region": { ... },
    "entries": [
      {
        "id": "uuid",
        "entryCode": "ING-20250115-0001",
        "entryDate": "2025-01-15T...",
        "exitDate": null,
        "status": "ingresado"
      }
    ],
    "workOrders": [ ... ]
  }
}
```

---

### GET /vehicles/plate/:licensePlate
Buscar vehículo por patente.

**Ejemplo:**
```
GET /vehicles/plate/ABCD12
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Errores:**
- `404` - Vehículo no encontrado

---

### POST /vehicles
Crear nuevo vehículo.

**Permisos requeridos:** `vehicles:create`

**Request:**
```json
{
  "licensePlate": "WXYZ-99",
  "vehicleType": "Camión",
  "brand": "Volvo",
  "model": "FH16",
  "year": 2023,
  "vin": "YV2A20A30DA123456 (opcional)",
  "fleetNumber": "FL-150 (opcional)",
  "regionId": "uuid"
}
```

**Validaciones:**
- licensePlate: formato chileno válido (ABCD12, AB1234)
- year: número entre 1990 y año actual + 1
- regionId: debe existir

**Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Vehículo creado exitosamente"
}
```

---

### PUT /vehicles/:id
Actualizar vehículo.

**Permisos requeridos:** `vehicles:update`

**Request:**
```json
{
  "status": "in_maintenance",
  "fleetNumber": "FL-151"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Vehículo actualizado exitosamente"
}
```

---

### DELETE /vehicles/:id
Eliminar vehículo (soft delete).

**Permisos requeridos:** `vehicles:delete`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Vehículo eliminado exitosamente"
  }
}
```

---

## 📝 Ingresos de Vehículos

### GET /vehicle-entries
Listar ingresos con filtros.

**Query Parameters:**
- `page`, `limit` - Paginación
- `search` - Buscar en código, conductor, patente
- `workshopId` - Filtrar por taller
- `status` - Filtrar por estado (ingresado, salida)
- `dateFrom`, `dateTo` - Rango de fechas

**Ejemplo:**
```
GET /vehicle-entries?status=ingresado&workshopId=uuid&page=1
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "entryCode": "ING-20250115-0001",
      "vehicle": {
        "licensePlate": "ABCD-12",
        "brand": "Mercedes-Benz",
        "model": "Actros 2644"
      },
      "workshop": {
        "name": "Taller Quilicura"
      },
      "driverRut": "16.666.666-6",
      "driverName": "Roberto González",
      "driverPhone": "+56912345678",
      "entryDate": "2025-01-15T08:30:00Z",
      "exitDate": null,
      "entryKm": 125000,
      "exitKm": null,
      "fuelLevel": "3/4",
      "hasKeys": true,
      "observations": "Vehículo con ruido en motor",
      "status": "ingresado",
      "keyControl": {
        "keyLocation": "Casillero 15"
      }
    }
  ],
  "pagination": { ... }
}
```

---

### POST /vehicle-entries
Crear nuevo ingreso de vehículo.

**Permisos requeridos:** `vehicle-entries:create`

**Request:**
```json
{
  "vehicleId": "uuid",
  "workshopId": "uuid",
  "driverRut": "16.666.666-6",
  "driverName": "Roberto González",
  "driverPhone": "+56912345678",
  "entryKm": 125000,
  "fuelLevel": "3/4",
  "hasKeys": true,
  "observations": "Vehículo presenta ruido en motor",
  "photos": ["url1", "url2"],
  "keyLocation": "Casillero 15 (si hasKeys=true)"
}
```

**Lógica automática:**
- Genera `entryCode` único (ING-YYYYMMDD-XXXX)
- Establece `entryDate` = ahora
- Establece `status` = "ingresado"
- Actualiza vehículo a `status` = "in_maintenance"
- Crea registro de `keyControl` si hasKeys=true
- Asigna `createdById` = usuario actual

**Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Ingreso creado exitosamente"
}
```

---

### POST /vehicle-entries/:id/exit
Registrar salida del vehículo.

**Request:**
```json
{
  "exitKm": 125500
}
```

**Lógica automática:**
- Establece `exitDate` = ahora
- Establece `status` = "salida"
- Actualiza vehículo a `status` = "active"

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Salida registrada exitosamente"
}
```

---

### PUT /vehicle-entries/:id/keys
Actualizar control de llaves.

**Request:**
```json
{
  "keyLocation": "Casillero 20",
  "deliveredTo": "Carlos Silva",
  "deliveredAt": "2025-01-15T09:00:00Z",
  "returnedBy": "Carlos Silva",
  "returnedAt": "2025-01-15T15:00:00Z",
  "observations": "Llaves entregadas al mecánico"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Control de llaves actualizado"
}
```

---

## 🔨 Órdenes de Trabajo

### GET /work-orders
Listar órdenes con filtros avanzados.

**Query Parameters:**
- `page`, `limit` - Paginación
- `search` - Buscar en número de orden, descripción, patente
- `status` - pendiente, en_progreso, pausado, completado, cancelado
- `priority` - baja, media, alta, critica
- `workshopId` - Filtrar por taller
- `assignedToId` - Filtrar por mecánico asignado
- `dateFrom`, `dateTo` - Rango de fechas de creación
- `sortBy`, `sortOrder` - Ordenamiento

**Ejemplo:**
```
GET /work-orders?status=en_progreso&priority=alta&assignedToId=uuid
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "orderNumber": "OT-20250115-0001",
      "vehicle": {
        "licensePlate": "ABCD-12",
        "brand": "Mercedes-Benz"
      },
      "workshop": {
        "name": "Taller Quilicura"
      },
      "workType": "Mantenimiento Preventivo",
      "priority": "alta",
      "description": "Cambio de aceite y filtros",
      "estimatedHours": 4,
      "assignedTo": {
        "firstName": "Carlos",
        "lastName": "Silva"
      },
      "currentStatus": "en_progreso",
      "startedAt": "2025-01-15T08:00:00Z",
      "completedAt": null,
      "totalHours": null,
      "_count": {
        "spareParts": 3,
        "photos": 2,
        "pauses": 1
      },
      "createdAt": "2025-01-15T07:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /work-orders/stats
Obtener estadísticas de órdenes.

**Query Parameters:**
- `workshopId` (opcional) - Filtrar por taller

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "pending": 12,
    "inProgress": 18,
    "paused": 3,
    "completed": 115,
    "cancelled": 2,
    "byPriority": [
      { "priority": "baja", "_count": 30 },
      { "priority": "media", "_count": 80 },
      { "priority": "alta", "_count": 35 },
      { "priority": "critica", "_count": 5 }
    ]
  }
}
```

---

### GET /work-orders/:id
Obtener orden completa con detalles.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "OT-20250115-0001",
    "vehicle": { ... },
    "entry": { ... },
    "workshop": { ... },
    "assignedTo": { ... },
    "createdBy": { ... },
    "statuses": [
      {
        "status": "pendiente",
        "observations": "Orden creada",
        "changedAt": "2025-01-15T07:30:00Z"
      },
      {
        "status": "en_progreso",
        "observations": "Iniciando trabajos",
        "changedAt": "2025-01-15T08:00:00Z"
      }
    ],
    "photos": [
      {
        "url": "https://...",
        "description": "Estado inicial",
        "photoType": "before",
        "uploadedAt": "2025-01-15T08:05:00Z"
      }
    ],
    "spareParts": [
      {
        "sparePart": {
          "code": "REP-001",
          "name": "Filtro de aceite"
        },
        "quantityRequested": 1,
        "quantityDelivered": 1,
        "status": "entregado"
      }
    ],
    "pauses": [
      {
        "reason": "Esperando repuestos",
        "pausedAt": "2025-01-15T10:00:00Z",
        "resumedAt": "2025-01-15T10:30:00Z",
        "duration": 30
      }
    ]
  }
}
```

---

### POST /work-orders
Crear orden de trabajo.

**Permisos requeridos:** `work-orders:create`

**Request:**
```json
{
  "vehicleId": "uuid",
  "entryId": "uuid",
  "workshopId": "uuid",
  "workType": "Mantenimiento Preventivo",
  "priority": "media",
  "description": "Cambio de aceite, filtros y revisión general",
  "estimatedHours": 4,
  "assignedToId": "uuid (opcional)"
}
```

**Lógica automática:**
- Genera `orderNumber` único (OT-YYYYMMDD-XXXX)
- Establece `currentStatus` = "pendiente"
- Crea primer registro en `work_order_statuses`
- Asigna `createdById` = usuario actual

**Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Orden creada exitosamente"
}
```

---

### POST /work-orders/:id/status
Cambiar estado de la orden.

**Request:**
```json
{
  "status": "en_progreso",
  "observations": "Iniciando trabajos de mantenimiento"
}
```

**Estados válidos:**
- `pendiente`
- `en_progreso`
- `pausado`
- `completado`
- `cancelado`

**Lógica automática:**
- Si cambia a `en_progreso` por primera vez, establece `startedAt`
- Si cambia a `completado`, establece `completedAt` y calcula `totalHours`
- Crea registro en `work_order_statuses`

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Estado actualizado exitosamente"
}
```

---

### POST /work-orders/:id/pause
Pausar orden de trabajo.

**Request:**
```json
{
  "reason": "Esperando repuestos",
  "observations": "Falta filtro de aceite"
}
```

**Lógica automática:**
- Cambia `currentStatus` a "pausado"
- Crea registro en `work_pauses` con `pausedAt`

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Orden pausada exitosamente"
}
```

---

### POST /work-orders/:id/resume
Reanudar orden pausada.

**Lógica automática:**
- Actualiza último registro de `work_pauses`:
  - Establece `resumedAt`
  - Calcula `duration` en minutos
- Cambia `currentStatus` a "en_progreso"

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Orden reanudada exitosamente"
}
```

---

### POST /work-orders/:id/photos
Agregar foto a la orden.

**Request:**
```json
{
  "url": "https://cloudinary.com/...",
  "description": "Estado del motor",
  "photoType": "during"
}
```

**Tipos de foto:**
- `before` - Antes del trabajo
- `during` - Durante el trabajo
- `after` - Después del trabajo
- `general` - General

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://...",
    "description": "Estado del motor",
    "photoType": "during",
    "uploadedAt": "2025-01-15T..."
  },
  "message": "Foto agregada exitosamente"
}
```

---

## 🔧 Inventario de Repuestos

### GET /spare-parts
Listar repuestos.

**Query Parameters:**
- `page`, `limit` - Paginación
- `search` - Buscar en código, nombre, descripción
- `category` - Filtrar por categoría
- `lowStock` - Solo items con stock bajo (boolean)

**Ejemplo:**
```
GET /spare-parts?category=Filtros&lowStock=true
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "REP-001",
      "name": "Filtro de Aceite",
      "description": "Filtro universal",
      "category": "Filtros",
      "unitOfMeasure": "unidad",
      "unitPrice": 15000,
      "currentStock": 3,
      "minStock": 10,
      "maxStock": 100,
      "location": "Estante A1",
      "isActive": true
    }
  ],
  "pagination": { ... }
}
```

---

### GET /spare-parts/low-stock
Obtener repuestos con stock bajo.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "code": "REP-001",
      "name": "Filtro de Aceite",
      "currentStock": 3,
      "minStock": 10,
      "location": "Estante A1"
    }
  ]
}
```

---

### POST /spare-parts
Crear repuesto.

**Permisos requeridos:** `spare-parts:create`

**Request:**
```json
{
  "code": "REP-100",
  "name": "Amortiguador Delantero",
  "description": "Amortiguador para camión",
  "category": "Suspensión",
  "unitOfMeasure": "unidad",
  "unitPrice": 85000,
  "currentStock": 10,
  "minStock": 3,
  "maxStock": 25,
  "location": "Estante E5"
}
```

**Lógica automática:**
- Convierte `code` a mayúsculas
- Crea movimiento inicial de stock

**Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Repuesto creado exitosamente"
}
```

---

### POST /spare-parts/:id/adjust-stock
Ajustar stock de repuesto.

**Request:**
```json
{
  "quantity": 50,
  "movementType": "entrada",
  "reason": "Compra mensual",
  "reference": "OC-2025-001"
}
```

**Tipos de movimiento:**
- `entrada` - Suma al stock actual
- `salida` - Resta del stock actual
- `ajuste` - Establece stock exacto

**Lógica automática:**
- Actualiza `currentStock`
- Crea registro en `spare_part_movements`
- Valida que no quede stock negativo

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Stock ajustado exitosamente"
}
```

---

### POST /spare-parts/request
Solicitar repuesto para orden de trabajo.

**Request:**
```json
{
  "workOrderId": "uuid",
  "sparePartId": "uuid",
  "quantity": 2,
  "observations": "Urgente para orden crítica"
}
```

**Validaciones:**
- workOrder debe existir
- sparePart debe existir
- Debe haber stock suficiente

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "solicitado",
    "requestedAt": "2025-01-15T..."
  },
  "message": "Repuesto solicitado exitosamente"
}
```

---

### POST /spare-parts/deliver/:id
Entregar repuesto solicitado.

**Request:**
```json
{
  "quantityDelivered": 2
}
```

**Lógica automática:**
- Cambia status a "entregado"
- Establece `deliveredAt`
- Decrementa stock del repuesto
- Crea movimiento de salida

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Repuesto entregado exitosamente"
}
```

---

## 🏭 Talleres y Regiones

### GET /regions
Listar regiones.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "RM",
      "name": "Región Metropolitana",
      "isActive": true,
      "_count": {
        "workshops": 2,
        "vehicles": 80
      }
    }
  ]
}
```

---

### GET /workshops
Listar talleres.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "TAL-RM-01",
      "name": "Taller Quilicura",
      "region": {
        "code": "RM",
        "name": "Región Metropolitana"
      },
      "address": "Av. Los Pajaritos 1234",
      "city": "Quilicura",
      "phone": "+56223456789",
      "capacity": 20,
      "schedules": [
        {
          "dayOfWeek": 1,
          "openTime": "08:00",
          "closeTime": "18:00"
        }
      ],
      "_count": {
        "users": 8,
        "entries": 45,
        "workOrders": 120
      }
    }
  ]
}
```

---

### GET /workshops/:id/stats
Obtener estadísticas del taller.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalEntries": 450,
    "activeEntries": 23,
    "totalWorkOrders": 380,
    "activeWorkOrders": 18,
    "completedToday": 7
  }
}
```

---

## 📊 Dashboard y Estadísticas

### GET /dashboard/stats
Estadísticas generales del sistema.

**Query Parameters:**
- `workshopId` (opcional) - Filtrar por taller

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalVehicles": 124,
    "vehiclesInWorkshop": 23,
    "activeWorkOrders": 18,
    "completedToday": 7,
    "pendingWorkOrders": 12,
    "lowStockItems": 8,
    "recentEntries": [
      {
        "entryCode": "ING-20250115-0005",
        "vehicle": { "licensePlate": "WXYZ-99" },
        "entryDate": "2025-01-15T12:30:00Z"
      }
    ],
    "urgentWorkOrders": [
      {
        "orderNumber": "OT-20250115-0008",
        "priority": "critica",
        "vehicle": { "licensePlate": "ABCD-12" }
      }
    ]
  }
}
```

---

### GET /dashboard/stats/:period
Estadísticas por período.

**Períodos válidos:** `day`, `week`, `month`

**Ejemplo:**
```
GET /dashboard/stats/week?workshopId=uuid
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": "week",
    "startDate": "2025-01-08T...",
    "endDate": "2025-01-15T...",
    "entriesCount": 45,
    "completedWorkOrders": 38,
    "averageCompletionTime": 4.5,
    "workOrdersByStatus": [
      { "currentStatus": "pendiente", "_count": 8 },
      { "currentStatus": "en_progreso", "_count": 15 },
      { "currentStatus": "completado", "_count": 38 }
    ],
    "workOrdersByPriority": [
      { "priority": "baja", "_count": 12 },
      { "priority": "media", "_count": 35 },
      { "priority": "alta", "_count": 12 },
      { "priority": "critica", "_count": 2 }
    ]
  }
}
```

---

### GET /dashboard/mechanics-performance
Rendimiento de mecánicos.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Carlos Silva",
      "totalOrders": 45,
      "completedOrders": 42,
      "inProgressOrders": 3,
      "totalHours": 185.5,
      "averageHours": 4.4
    }
  ]
}
```

---

### GET /dashboard/activity
Actividad reciente del sistema.

**Query Parameters:**
- `workshopId` (opcional)
- `limit` (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "type": "entry",
      "timestamp": "2025-01-15T12:30:00Z",
      "description": "Vehículo WXYZ-99 ingresado",
      "user": "María González",
      "data": { ... }
    },
    {
      "type": "work_order",
      "timestamp": "2025-01-15T11:00:00Z",
      "description": "Orden OT-2025-110 creada para ABCD-12",
      "user": "Pedro Rodríguez",
      "data": { ... }
    },
    {
      "type": "status_change",
      "timestamp": "2025-01-15T10:30:00Z",
      "description": "Orden OT-2025-105 cambió a completado",
      "data": { ... }
    }
  ]
}
```

---

## 🔔 Notificaciones

### GET /notifications
Obtener notificaciones del usuario actual.

**Query Parameters:**
- `page`, `limit` - Paginación
- `unreadOnly` - Solo no leídas (boolean)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Nueva orden asignada",
      "message": "Se le ha asignado la orden OT-2025-110",
      "type": "work_order_assigned",
      "relatedTo": "work-orders",
      "relatedId": "uuid",
      "isRead": false,
      "readAt": null,
      "createdAt": "2025-01-15T11:00:00Z"
    }
  ],
  "pagination": { ... },
  "unreadCount": 5
}
```

**Tipos de notificación:**
- `work_order_assigned` - Orden asignada
- `work_order_completed` - Orden completada
- `vehicle_entry` - Nuevo ingreso
- `low_stock` - Stock bajo
- `system` - Notificación del sistema

---

### PUT /notifications/:id/read
Marcar notificación como leída.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "isRead": true,
    "readAt": "2025-01-15T13:00:00Z"
  },
  "message": "Notificación marcada como leída"
}
```

---

### PUT /notifications/read-all
Marcar todas las notificaciones como leídas.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Todas las notificaciones marcadas como leídas"
  }
}
```

---

## 📝 Convenciones de la API

### Formato de Respuesta

**Éxito:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Mensaje opcional"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Mensaje de error"
}
```

**Paginación:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 124,
    "totalPages": 13
  }
}
```

---

### Códigos de Estado HTTP

- `200` - OK (operación exitosa)
- `201` - Created (recurso creado)
- `400` - Bad Request (datos inválidos)
- `401` - Unauthorized (no autenticado)
- `403` - Forbidden (sin permisos)
- `404` - Not Found (recurso no encontrado)
- `500` - Internal Server Error (error del servidor)

---

### Headers Requeridos

**Para endpoints protegidos:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

---

### Rate Limiting

- **Límite:** 100 requests por 15 minutos
- **Scope:** Por IP
- **Aplica a:** Todas las rutas `/api/*`

**Respuesta cuando se excede:**
```json
{
  "message": "Demasiadas solicitudes desde esta IP, por favor intente más tarde."
}
```

---

## 🔒 Sistema de Permisos

### Recursos y Acciones

| Recurso | Acciones Disponibles |
|---------|---------------------|
| `users` | read, create, update, delete |
| `vehicles` | read, create, update, delete |
| `vehicle-entries` | read, create, update |
| `work-orders` | read, create, update |
| `spare-parts` | read, create, update |
| `workshops` | read |
| `regions` | read |
| `dashboard` | read |

### Roles y Permisos

#### Administrador
- Todos los permisos

#### Guardia
- `dashboard:read`
- `vehicles:read`
- `vehicle-entries:read`
- `vehicle-entries:create`

#### Recepcionista
- `dashboard:read`
- `vehicles:read`
- `vehicle-entries:read`
- `vehicle-entries:create`
- `vehicle-entries:update`
- `work-orders:read`
- `work-orders:create`

#### Mecánico
- `dashboard:read`
- `work-orders:read` (solo propias)
- `work-orders:update` (solo propias)
- `spare-parts:read`

#### Jefe de Taller
- `dashboard:read`
- `vehicles:read`
- `work-orders:read`
- `work-orders:create`
- `work-orders:update`
- `spare-parts:read`
- `users:read`

#### Encargado de Inventario
- `dashboard:read`
- `spare-parts:read`
- `spare-parts:create`
- `spare-parts:update`
- `work-orders:read`

---

## 🧪 Testing

### Colección de Insomnia

Importa el archivo `insomnia_collection.json` para tener todas las requests pre-configuradas.

### Credenciales de Prueba

```
Admin:          admin@pepsico.cl / admin123
Guardia:        guardia@pepsico.cl / admin123
Recepcionista:  recepcion@pepsico.cl / admin123
Mecánico 1:     mecanico1@pepsico.cl / admin123
Mecánico 2:     mecanico2@pepsico.cl / admin123
Jefe Taller:    jefe@pepsico.cl / admin123
```

---

## 📞 Soporte

- **Joaquín Marín**: jo.marinm@duocuc.cl
- **Benjamin Vilches**: benj.vilches@duocuc.cl

---

**Versión API:** 1.0.0  
**Última actualización:** Enero 2025


