# 👥 Actores del Sistema

## Sistema de Gestión de Flota PepsiCo Chile

---

## 📋 Introducción

Este documento describe todos los actores que interactúan con el Sistema de Gestión de Ingreso de Vehículos. Cada actor representa un rol específico con responsabilidades y permisos definidos.

---

## 🎭 Actores Principales

### 1. **Guardia de Acceso** 👮

**Rol:** Primer punto de contacto con el sistema

**Descripción:**  
Personal de seguridad en la entrada del taller que registra el ingreso y salida de vehículos, así como el estado inicial de los mismos.

**Responsabilidades:**
- ✅ Registrar ingreso de vehículos al taller
- ✅ Capturar fotografías del estado del vehículo
- ✅ Registrar datos del conductor
- ✅ Verificar documentación básica
- ✅ Registrar salida de vehículos
- ✅ Verificar devolución de documentos
- ✅ Generar comprobantes de ingreso/salida

**Permisos del Sistema:**
- `entries.create` - Crear ingresos
- `entries.read` - Ver ingresos
- `entries.update` - Actualizar datos de ingreso/salida
- `photos.upload` - Subir fotografías
- `vehicles.read` - Consultar vehículos

**Casos de Uso Principales:**
- CU-010: Registrar Ingreso de Vehículo
- CU-011: Tomar Fotografías de Vehículo
- CU-012: Registrar Salida de Vehículo

**Características:**
- Trabaja en turnos de 8 horas
- Usa principalmente dispositivo móvil (tablet)
- Requiere proceso rápido (menos de 5 minutos por ingreso)
- Maneja situaciones de alta concurrencia (varios vehículos simultáneos)

---

### 2. **Recepcionista de Taller** 📝

**Rol:** Validación y documentación

**Descripción:**  
Personal administrativo que valida la documentación completa del vehículo y crea las órdenes de trabajo según el servicio solicitado.

**Responsabilidades:**
- ✅ Validar documentación del vehículo
- ✅ Revisar fotografías tomadas en el ingreso
- ✅ Crear órdenes de trabajo
- ✅ Definir prioridades de servicio
- ✅ Actualizar información del ingreso
- ✅ Coordinar con el jefe de taller

**Permisos del Sistema:**
- `entries.read` - Ver ingresos
- `entries.update` - Actualizar ingresos
- `work-orders.create` - Crear órdenes de trabajo
- `work-orders.read` - Ver órdenes de trabajo
- `documents.upload` - Subir documentos
- `vehicles.read` - Consultar vehículos

**Casos de Uso Principales:**
- CU-020: Crear Orden de Trabajo
- CU-027: Agregar Documentos a Ingreso
- CU-013: Buscar Vehículo

**Características:**
- Trabaja en horario de oficina
- Usa computador de escritorio
- Maneja múltiples ingresos simultáneamente
- Requiere atención al detalle

---

### 3. **Jefe de Taller** 👨‍💼

**Rol:** Supervisión y asignación

**Descripción:**  
Supervisor técnico responsable de asignar trabajos a los mecánicos, controlar la agenda del taller y supervisar el cumplimiento de las órdenes de trabajo.

**Responsabilidades:**
- ✅ Asignar mecánicos a órdenes de trabajo
- ✅ Supervisar progreso de las OT
- ✅ Controlar agenda y capacidad del taller
- ✅ Aprobar trabajos que requieren autorización
- ✅ Resolver conflictos y prioridades
- ✅ Generar reportes de desempeño
- ✅ Gestionar recursos del taller

**Permisos del Sistema:**
- `work-orders.read` - Ver todas las órdenes de trabajo
- `work-orders.update` - Actualizar OT
- `work-orders.assign` - Asignar mecánicos
- `work-orders.approve` - Aprobar trabajos
- `reports.generate` - Generar reportes del taller
- `users.read` - Ver mecánicos disponibles
- `dashboard.view` - Ver dashboard del taller

**Casos de Uso Principales:**
- CU-021: Asignar Mecánico a Orden de Trabajo
- CU-029: Ver Dashboard
- CU-031: Generar Reporte de Desempeño de Taller

**Características:**
- Toma decisiones operativas críticas
- Requiere vista en tiempo real del taller
- Maneja múltiples prioridades
- Experiencia técnica requerida

---

### 4. **Mecánico** 🔧

**Rol:** Ejecución de trabajos

**Descripción:**  
Personal técnico que realiza los trabajos de mantenimiento y reparación asignados en las órdenes de trabajo.

**Responsabilidades:**
- ✅ Ejecutar trabajos asignados en las OT
- ✅ Actualizar estado de progreso
- ✅ Solicitar repuestos necesarios
- ✅ Registrar trabajo realizado
- ✅ Tomar fotografías del proceso
- ✅ Reportar pausas y contratiempos
- ✅ Completar OT con diagnóstico final

**Permisos del Sistema:**
- `work-orders.read` - Ver sus OT asignadas
- `work-orders.update` - Actualizar estado de sus OT
- `spare-parts.request` - Solicitar repuestos
- `photos.upload` - Subir fotos del proceso
- `work-orders.pause` - Registrar pausas

**Casos de Uso Principales:**
- CU-022: Actualizar Estado de Orden de Trabajo
- CU-023: Solicitar Repuesto para OT
- CU-025: Registrar Pausa en OT
- CU-011: Tomar Fotografías de Vehículo

**Características:**
- Usa dispositivo móvil o tablet en el taller
- Trabaja con las manos, necesita interfaz simple
- Múltiples OT simultáneas
- Requiere acceso rápido a información

---

### 5. **Asistente de Repuestos** 📦

**Rol:** Gestión de inventario

**Descripción:**  
Personal encargado del almacén que gestiona la entrega de repuestos, actualiza inventario y genera alertas de stock bajo.

**Responsabilidades:**
- ✅ Entregar repuestos solicitados
- ✅ Actualizar stock en tiempo real
- ✅ Registrar movimientos de inventario
- ✅ Generar alertas de stock bajo
- ✅ Realizar ajustes de inventario
- ✅ Coordinar reposición de stock
- ✅ Verificar estado físico vs sistema

**Permisos del Sistema:**
- `spare-parts.read` - Ver inventario
- `spare-parts.update` - Actualizar stock
- `spare-parts.deliver` - Confirmar entregas
- `inventory.movements` - Registrar movimientos
- `reports.inventory` - Generar reportes de inventario

**Casos de Uso Principales:**
- CU-024: Entregar Repuesto
- CU-060: Actualizar Inventario
- CU-061: Registrar Ingreso de Repuestos
- CU-062: Ajustar Stock
- CU-063: Ver Movimientos de Inventario

**Características:**
- Trabaja en el almacén de repuestos
- Requiere precisión en conteos
- Maneja alertas automáticas
- Coordina con proveedores

---

### 6. **Coordinador de Zona** 🌍

**Rol:** Supervisión regional

**Descripción:**  
Supervisor de múltiples talleres en una región, responsable de coordinar recursos, analizar desempeño regional y gestionar inventario a nivel zonal.

**Responsabilidades:**
- ✅ Supervisar múltiples talleres de la zona
- ✅ Gestionar inventario regional
- ✅ Coordinar transferencias entre talleres
- ✅ Analizar desempeño de la zona
- ✅ Generar reportes regionales
- ✅ Tomar decisiones de reubicación de recursos
- ✅ Aprobar compras de repuestos

**Permisos del Sistema:**
- `reports.regional` - Reportes regionales
- `work-orders.read` - Ver OT de su región
- `inventory.read` - Ver inventario regional
- `inventory.transfer` - Autorizar transferencias
- `dashboard.regional` - Dashboard regional
- `users.read` - Ver usuarios de la región

**Casos de Uso Principales:**
- CU-030: Generar Reporte de Flota (regional)
- CU-032: Generar Reporte de Inventario
- CU-029: Ver Dashboard

**Características:**
- Vista multi-taller
- Análisis de tendencias
- Toma decisiones estratégicas regionales
- Requiere reportes consolidados

---

### 7. **Supervisor de Flota** 🚗

**Rol:** Gestión global

**Descripción:**  
Responsable de la gestión integral de toda la flota de vehículos a nivel nacional, análisis de desempeño global y planificación estratégica.

**Responsabilidades:**
- ✅ Supervisar toda la flota nacional
- ✅ Analizar indicadores globales de desempeño
- ✅ Planificar mantenimientos preventivos
- ✅ Auditar sistema y procesos
- ✅ Generar reportes ejecutivos
- ✅ Tomar decisiones estratégicas
- ✅ Definir políticas de mantenimiento

**Permisos del Sistema:**
- `reports.global` - Reportes nacionales
- `work-orders.read` - Ver todas las OT
- `vehicles.read` - Ver toda la flota
- `dashboard.executive` - Dashboard ejecutivo
- `audit.read` - Acceso a auditoría
- `analytics.advanced` - Análisis avanzado

**Casos de Uso Principales:**
- CU-030: Generar Reporte de Flota (global)
- CU-033: Generar Reporte de Costos
- CU-016: Ver Historial de Vehículo
- CU-029: Ver Dashboard

**Características:**
- Vista estratégica y global
- Análisis de KPIs
- Toma decisiones de alto nivel
- Requiere información consolidada

---

### 8. **Administrador del Sistema** 👨‍💻

**Rol:** Configuración y administración

**Descripción:**  
Responsable técnico de la configuración del sistema, gestión de usuarios, roles, permisos y mantenimiento de la plataforma.

**Responsabilidades:**
- ✅ Gestionar usuarios del sistema
- ✅ Configurar roles y permisos
- ✅ Administrar talleres y regiones
- ✅ Configurar parámetros del sistema
- ✅ Monitorear salud del sistema
- ✅ Gestionar backups
- ✅ Soporte técnico a usuarios

**Permisos del Sistema:**
- `users.manage` - Gestión completa de usuarios
- `roles.manage` - Gestión de roles y permisos
- `system.config` - Configuración del sistema
- `audit.read` - Acceso a logs de auditoría
- `system.monitor` - Monitoreo del sistema
- **Acceso total al sistema**

**Casos de Uso Principales:**
- CU-050: Gestionar Usuarios
- CU-051: Crear Usuario
- CU-052: Editar Usuario
- CU-053: Desactivar Usuario
- CU-054: Gestionar Roles y Permisos

**Características:**
- Conocimiento técnico avanzado
- Acceso privilegiado
- Responsable de seguridad
- Soporte de primer nivel

---

### 9. **Analista de Datos** 📊

**Rol:** Análisis y reportes

**Descripción:**  
Especialista en análisis de datos que genera reportes avanzados, identifica tendencias y proporciona insights para la toma de decisiones.

**Responsabilidades:**
- ✅ Generar reportes personalizados
- ✅ Analizar tendencias y patrones
- ✅ Crear dashboards analíticos
- ✅ Exportar datos para análisis externo
- ✅ Identificar oportunidades de mejora
- ✅ Calcular KPIs y métricas
- ✅ Presentar insights a gerencia

**Permisos del Sistema:**
- `reports.all` - Todos los tipos de reportes
- `reports.custom` - Reportes personalizados
- `analytics.read` - Acceso a análisis avanzado
- `data.export` - Exportar datos
- `dashboard.all` - Todos los dashboards

**Casos de Uso Principales:**
- CU-030: Generar Reporte de Flota
- CU-031: Generar Reporte de Desempeño de Taller
- CU-032: Generar Reporte de Inventario
- CU-033: Generar Reporte de Costos
- CU-034: Exportar Reporte a PDF
- CU-035: Exportar Reporte a Excel

**Características:**
- Conocimientos en análisis de datos
- Uso intensivo de reportes
- Exportación frecuente de datos
- Requiere flexibilidad en consultas

---

### 10. **Gerente de Operaciones** 👔

**Rol:** Decisiones estratégicas

**Descripción:**  
Ejecutivo responsable de las operaciones de mantenimiento de flota, toma decisiones estratégicas basadas en reportes y define objetivos operacionales.

**Responsabilidades:**
- ✅ Revisar reportes ejecutivos
- ✅ Tomar decisiones estratégicas
- ✅ Definir objetivos y KPIs
- ✅ Aprobar inversiones significativas
- ✅ Evaluar desempeño global
- ✅ Planificación estratégica
- ✅ Relacionamiento con stakeholders

**Permisos del Sistema:**
- `reports.executive` - Reportes ejecutivos
- `dashboard.executive` - Dashboard ejecutivo
- `analytics.strategic` - Análisis estratégico
- `reports.export` - Exportar reportes

**Casos de Uso Principales:**
- CU-029: Ver Dashboard (ejecutivo)
- CU-030: Generar Reporte de Flota
- CU-033: Generar Reporte de Costos

**Características:**
- Vista de alto nivel
- Foco en KPIs estratégicos
- Toma decisiones de negocio
- Requiere información resumida y clara

---

## 📊 Matriz de Actores vs Casos de Uso

| Caso de Uso | Guardia | Recepcionista | Jefe Taller | Mecánico | Asist. Repuestos | Coord. Zona | Superv. Flota | Admin | Analista | Gerente |
|-------------|---------|---------------|-------------|----------|------------------|-------------|---------------|-------|----------|---------|
| CU-001: Iniciar Sesión | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CU-010: Registrar Ingreso | ✅ | | | | | | | | | |
| CU-011: Tomar Fotografías | ✅ | | | ✅ | | | | | | |
| CU-012: Registrar Salida | ✅ | | | | | | | | | |
| CU-020: Crear OT | | ✅ | | | | | | | | |
| CU-021: Asignar Mecánico | | | ✅ | | | | | | | |
| CU-022: Actualizar Estado OT | | | | ✅ | | | | | | |
| CU-023: Solicitar Repuesto | | | | ✅ | | | | | | |
| CU-024: Entregar Repuesto | | | | | ✅ | | | | | |
| CU-029: Ver Dashboard | | ✅ | ✅ | | | ✅ | ✅ | ✅ | ✅ | ✅ |
| CU-030: Generar Reportes | | | ✅ | | | ✅ | ✅ | ✅ | ✅ | ✅ |
| CU-050: Gestionar Usuarios | | | | | | | | ✅ | | |

---

## 🔐 Jerarquía de Permisos

```
Nivel 1 - Operativo
├── Guardia de Acceso
├── Mecánico
└── Asistente de Repuestos

Nivel 2 - Supervisión
├── Recepcionista de Taller
└── Jefe de Taller

Nivel 3 - Gestión
├── Coordinador de Zona
└── Supervisor de Flota

Nivel 4 - Ejecutivo/Administrativo
├── Gerente de Operaciones
├── Analista de Datos
└── Administrador del Sistema
```

---

## 📝 Notas Adicionales

### Consideraciones de Diseño:
- Cada actor tiene acceso limitado solo a la información necesaria para su rol
- Los permisos siguen el principio de menor privilegio
- La auditoría registra todas las acciones de todos los actores
- Los roles son configurables por el administrador del sistema

### Características Comunes:
- Todos los actores deben autenticarse (CU-001)
- Todos reciben notificaciones relevantes a su rol (CU-040)
- Todos tienen acceso a ayuda contextual
- Todos pueden cambiar su contraseña (CU-004)

---

**Fecha:** 14/10/2025  
**Versión:** 1.0  
**Autor:** Equipo de Desarrollo PepsiCo Fleet Management

