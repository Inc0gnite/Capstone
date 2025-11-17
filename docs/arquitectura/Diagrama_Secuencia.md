# 🔄 Diagramas de Secuencia - Simplificados

## Sistema de Gestión de Flota PepsiCo Chile

---

## 1. Secuencia: Login de Usuario

```mermaid
sequenceDiagram
    actor Usuario
    participant Vista as "Vista (React)"
    participant API as "API (Express)"
    participant BD as "Base de Datos"
  
    Usuario->>Vista: "Ingresa credenciales"
    Vista->>API: "POST /auth/login"
    API->>BD: "Verificar usuario"
    BD-->>API: "Respuesta válida"
    API->>Vista: "Retorna token JWT"
    Vista->>Usuario: "Acceso a Dashboard"
```

---

## 2. Secuencia: Crear Orden de Trabajo

```mermaid
sequenceDiagram
    actor Jefe as "Jefe de Taller"
    participant Vista as "Vista (React)"
    participant API as "API (Backend)"
    participant BD as "Base de Datos"
    participant Email as "Servicio Email"
  
    Jefe->>Vista: "Completa formulario OT"
    Vista->>API: "POST /work-orders"
    API->>API: "Verifica permisos"
    API->>BD: "Crea OT"
    BD-->>API: "OT creada (ID)"
    API->>BD: "Actualiza estado ingreso"
    API->>Email: "Envía notificación"
    Email-->>API: "Confirmación"
    API-->>Vista: "Respuesta OK"
    Vista-->>Jefe: "OT creada exitosamente"
```

---

## 3. Secuencia: Solicitar Repuesto

```mermaid
sequenceDiagram
    actor Mecanico as "Mecánico"
    participant Vista as "Vista"
    participant API as "API"
    participant BD as "BD"
    participant Email as "Email"
  
    Mecanico->>Vista: "Buscar y seleccionar repuesto"
    Vista->>API: "POST /api/spare-parts/request"
    API->>BD: "Verificar stock disponible"
  
    alt Stock disponible
        BD-->>API: "Stock suficiente"
        API->>BD: "Registrar solicitud"
        API->>Email: "Notificar asistente"
        API-->>Vista: "Confirmación"
        Vista-->>Mecanico: "Repuesto solicitado"
    else Stock insuficiente
        BD-->>API: "Stock bajo"
        API-->>Vista: "Advertencia"
        Vista-->>Mecanico: "Stock insuficiente"
    end
```

---

## 4. Procesos por Rol (Vista General)

> Diagramas de flujo simplificados para explicar qué hace cada actor dentro del sistema.

### Guardia de Portería

```mermaid
flowchart TD
    A[Ingreso al sistema] --> B[Registrar datos del vehículo]
    B --> C[Registrar datos del conductor]
    C --> D{¿Capturar fotos?}
    D -- Sí --> E[Subir/Tomar fotografías]
    D -- No --> F[Revisar resumen]
    E --> F
    F --> G[Confirmar ingreso]
    G --> H[Vehículo queda "En taller"]
```

### Recepcionista de Taller

```mermaid
flowchart TD
    A[Dashboard Recepcionista] --> B[Revisar ingresos pendientes]
    B --> C[Crear Orden de Trabajo]
    C --> D{¿Asignar mecánico?}
    D -- Sí --> E[Asignar mecánico disponible]
    D -- No --> F[Dejar OT pendiente para Jefe]
    E --> G[Monitorear avances y notificaciones]
    F --> G
    G --> H[Registrar salida de vehículos listos]
```

### Jefe de Taller

```mermaid
flowchart TD
    A[Dashboard Jefe] --> B[Revisar órdenes activas]
    B --> C[Crear/Editar OT]
    C --> D[Asignar mecánicos y recursos]
    D --> E[Supervisar estados y checklist]
    E --> F{¿Orden completada?}
    F -- Sí --> G[Validar y liberar vehículo]
    F -- No --> H[Solicitar actualizaciones]
    G --> I[Reportar indicadores]
```

### Mecánico

```mermaid
flowchart TD
    A[Dashboard Mecánico] --> B[Seleccionar OT asignada]
    B --> C[Revisar checklist y fotos iniciales]
    C --> D[Iniciar trabajo - cambiar estado]
    D --> E[Actualizar checklist y observaciones]
    E --> F{¿Necesita repuesto?}
    F -- Sí --> G[Solicitar repuesto]
    G --> H[Continuar trabajo]
    F -- No --> H
    H --> I[Subir fotos del proceso]
    I --> J[Completar checklist]
    J --> K[Marcar OT completada]
```

### Encargado de Inventario

```mermaid
flowchart TD
    A[Dashboard Inventario] --> B[Revisar stock y alertas]
    B --> C[Atender solicitudes de repuestos]
    C --> D{¿Stock disponible?}
    D -- Sí --> E[Registrar entrega y actualizar stock]
    D -- No --> F[Generar alerta de reposición]
    E --> G[Registrar movimiento de inventario]
    F --> G
    G --> H[Reportar consumos y niveles]
```

### Administrador del Sistema

```mermaid
flowchart TD
    A[Dashboard Admin] --> B[Gestionar usuarios y roles]
    B --> C[Configurar talleres y capacidades]
    C --> D[Auditar acciones y logs]
    D --> E[Supervisar despliegues e integraciones]
    E --> F[Actualizar documentación y reportes]
```

---

**Exportar a PNG:** https://mermaid.live/
