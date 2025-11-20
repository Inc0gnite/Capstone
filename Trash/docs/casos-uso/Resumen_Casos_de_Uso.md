# 📋 Resumen Ejecutivo de Casos de Uso

## Sistema de Gestión de Flota PepsiCo Chile

---

## 🎯 Resumen General

El Sistema de Gestión de Ingreso de Vehículos cuenta con **43 casos de uso** distribuidos en **8 módulos funcionales** que cubren el 100% de los requerimientos funcionales del sistema.

---

## 📊 Cifras Clave

| Métrica | Valor |
|---------|-------|
| **Total de Casos de Uso** | 43 |
| **Casos de Uso Principales** | 12 |
| **Actores del Sistema** | 10 |
| **Módulos Funcionales** | 8 |
| **Cobertura de RF** | 100% (10/10) |
| **Estado de Implementación** | 93% (40/43) |

---

## 🔄 Flujo Principal del Sistema

```
1️⃣ INGRESO
   Guardia registra entrada del vehículo → Toma fotos → Genera código
   
2️⃣ RECEPCIÓN
   Recepcionista valida documentos → Crea orden de trabajo → Define prioridad
   
3️⃣ ASIGNACIÓN
   Jefe de taller asigna mecánico → Programa trabajo → Envía notificación
   
4️⃣ EJECUCIÓN
   Mecánico actualiza estado → Solicita repuestos → Registra trabajo realizado
   
5️⃣ INVENTARIO
   Asistente entrega repuestos → Actualiza stock → Genera alertas
   
6️⃣ FINALIZACIÓN
   Mecánico completa OT → Jefe aprueba → Sistema calcula costos
   
7️⃣ SALIDA
   Guardia registra salida → Verifica documentos → Genera comprobante
   
8️⃣ ANÁLISIS
   Supervisores generan reportes → Analizan métricas → Toman decisiones
```

---

## 🎭 Casos de Uso por Actor

### 👮 Guardia de Acceso (3 CU principales)
- ✅ CU-010: Registrar Ingreso de Vehículo
- ✅ CU-011: Tomar Fotografías
- ✅ CU-012: Registrar Salida de Vehículo

**Impacto:** Punto de entrada y salida del sistema. Crítico para el flujo.

---

### 📝 Recepcionista de Taller (1 CU principal)
- ✅ CU-020: Crear Orden de Trabajo

**Impacto:** Genera las órdenes de trabajo que impulsan todo el proceso.

---

### 👨‍💼 Jefe de Taller (2 CU principales)
- ✅ CU-021: Asignar Mecánico a OT
- ✅ CU-029: Ver Dashboard

**Impacto:** Coordina recursos y supervisa operaciones del taller.

---

### 🔧 Mecánico (3 CU principales)
- ✅ CU-022: Actualizar Estado de OT
- ✅ CU-023: Solicitar Repuesto
- ✅ CU-025: Registrar Pausa

**Impacto:** Ejecuta el trabajo y proporciona feedback del progreso.

---

### 📦 Asistente de Repuestos (2 CU principales)
- ✅ CU-024: Entregar Repuesto
- ✅ CU-060: Actualizar Inventario

**Impacto:** Gestiona el flujo de materiales y control de stock.

---

### 📊 Supervisores y Analistas (7 CU de reportes)
- ✅ CU-030: Generar Reporte de Flota
- ✅ CU-031: Generar Reporte de Desempeño
- ✅ CU-032: Generar Reporte de Inventario
- ✅ CU-033: Generar Reporte de Costos
- ✅ CU-034: Exportar a PDF
- ✅ CU-035: Exportar a Excel
- ✅ CU-029: Ver Dashboard

**Impacto:** Proporciona visibilidad y datos para toma de decisiones.

---

### 👨‍💻 Administrador del Sistema (5 CU de administración)
- ✅ CU-050: Gestionar Usuarios
- ✅ CU-051: Crear Usuario
- ✅ CU-052: Editar Usuario
- ✅ CU-053: Desactivar Usuario
- ✅ CU-054: Gestionar Roles y Permisos

**Impacto:** Mantiene la seguridad y configuración del sistema.

---

## 📦 Casos de Uso por Módulo

### 🔐 Módulo de Autenticación (4 CU)
| ID | Nombre | Prioridad |
|----|--------|-----------|
| CU-001 | Iniciar Sesión | Alta |
| CU-002 | Cerrar Sesión | Alta |
| CU-003 | Recuperar Contraseña | Media |
| CU-004 | Cambiar Contraseña | Media |

**Objetivo:** Gestionar acceso seguro al sistema

---

### 🚗 Módulo de Gestión de Ingresos (7 CU)
| ID | Nombre | Prioridad |
|----|--------|-----------|
| CU-010 | Registrar Ingreso de Vehículo | Alta |
| CU-011 | Tomar Fotografías | Alta |
| CU-012 | Registrar Salida de Vehículo | Alta |
| CU-070 | Gestión de Llaves | Baja |
| CU-071 | Registrar Entrega de Llave | Baja |
| CU-072 | Registrar Devolución de Llave | Baja |
| CU-027 | Agregar Documentos | Media |

**Objetivo:** Controlar entrada/salida de vehículos

---

### 🚙 Módulo de Gestión de Vehículos (4 CU)
| ID | Nombre | Prioridad |
|----|--------|-----------|
| CU-013 | Buscar Vehículo | Alta |
| CU-014 | Registrar Nuevo Vehículo | Media |
| CU-015 | Actualizar Datos de Vehículo | Media |
| CU-016 | Ver Historial de Vehículo | Media |

**Objetivo:** Administrar información de la flota

---

### 📋 Módulo de Órdenes de Trabajo (7 CU)
| ID | Nombre | Prioridad |
|----|--------|-----------|
| CU-020 | Crear Orden de Trabajo | Alta |
| CU-021 | Asignar Mecánico a OT | Alta |
| CU-022 | Actualizar Estado de OT | Alta |
| CU-023 | Solicitar Repuesto | Alta |
| CU-025 | Registrar Pausa | Media |
| CU-026 | Finalizar Pausa | Media |
| CU-028 | Descargar Documentos | Media |

**Objetivo:** Gestionar trabajos de mantenimiento

---

### 📦 Módulo de Inventario (6 CU)
| ID | Nombre | Prioridad |
|----|--------|-----------|
| CU-024 | Entregar Repuesto | Alta |
| CU-060 | Actualizar Inventario | Media |
| CU-061 | Registrar Ingreso de Repuestos | Media |
| CU-062 | Ajustar Stock | Media |
| CU-063 | Ver Movimientos | Media |
| CU-023 | Solicitar Repuesto (desde OT) | Alta |

**Objetivo:** Controlar stock de repuestos

---

### 📊 Módulo de Reportes (7 CU)
| ID | Nombre | Prioridad |
|----|--------|-----------|
| CU-029 | Ver Dashboard | Alta |
| CU-030 | Generar Reporte de Flota | Alta |
| CU-031 | Generar Reporte de Desempeño | Media |
| CU-032 | Generar Reporte de Inventario | Media |
| CU-033 | Generar Reporte de Costos | Media |
| CU-034 | Exportar a PDF | Media |
| CU-035 | Exportar a Excel | Media |

**Objetivo:** Proporcionar información para decisiones

---

### 🔔 Módulo de Notificaciones (4 CU)
| ID | Nombre | Prioridad |
|----|--------|-----------|
| CU-040 | Recibir Notificación | Alta |
| CU-041 | Marcar como Leída | Baja |
| CU-042 | Marcar Todas como Leídas | Baja |
| CU-043 | Eliminar Notificación | Baja |

**Objetivo:** Mantener usuarios informados

---

### 👥 Módulo de Administración (5 CU)
| ID | Nombre | Prioridad |
|----|--------|-----------|
| CU-050 | Gestionar Usuarios | Alta |
| CU-051 | Crear Usuario | Alta |
| CU-052 | Editar Usuario | Alta |
| CU-053 | Desactivar Usuario | Alta |
| CU-054 | Gestionar Roles y Permisos | Alta |

**Objetivo:** Configurar y mantener el sistema

---

## 🎯 Casos de Uso Críticos

### Top 5 Casos de Uso Más Importantes:

#### 1️⃣ CU-010: Registrar Ingreso de Vehículo
**Impacto:** Muy Alto  
**Razón:** Punto de entrada principal al sistema. Sin este CU, no hay flujo.  
**Actores:** Guardia de Acceso  
**Frecuencia de uso:** 20-50 veces/día por taller

#### 2️⃣ CU-020: Crear Orden de Trabajo
**Impacto:** Muy Alto  
**Razón:** Genera las OT que impulsan todo el proceso de mantenimiento.  
**Actores:** Recepcionista  
**Frecuencia de uso:** 15-40 veces/día por taller

#### 3️⃣ CU-022: Actualizar Estado de OT
**Impacto:** Alto  
**Razón:** Proporciona visibilidad del progreso en tiempo real.  
**Actores:** Mecánico  
**Frecuencia de uso:** 50-100 actualizaciones/día

#### 4️⃣ CU-001: Iniciar Sesión
**Impacto:** Crítico  
**Razón:** Requerido para acceder a todas las funcionalidades.  
**Actores:** Todos  
**Frecuencia de uso:** 100+ veces/día

#### 5️⃣ CU-029: Ver Dashboard
**Impacto:** Alto  
**Razón:** Proporciona visibilidad operacional para toma de decisiones.  
**Actores:** Supervisores, Jefes de Taller, Gerencia  
**Frecuencia de uso:** Constante (pantallas de monitoreo)

---

## 📈 Beneficios por Caso de Uso

### Eficiencia Operacional:
- **CU-010, CU-012:** Reducen tiempo de registro de 15 min → 5 min
- **CU-021:** Optimiza asignación de carga de trabajo
- **CU-029:** Visibilidad en tiempo real elimina llamadas y consultas

### Control y Trazabilidad:
- **CU-011:** Evidencia fotográfica protege contra reclamaciones
- **CU-016:** Historial completo del vehículo para decisiones
- **CU-063:** Trazabilidad completa de inventario

### Gestión de Costos:
- **CU-024:** Control de uso de repuestos
- **CU-033:** Análisis de costos por vehículo/taller
- **CU-060-063:** Reducción de pérdidas por descontrol de stock

### Comunicación:
- **CU-040:** Notificaciones automáticas eliminan demoras
- **CU-030-035:** Reportes automatizados ahorran horas/mes

---

## ⏱️ Tiempos Estimados por Caso de Uso

| Caso de Uso | Tiempo Promedio | Frecuencia |
|-------------|-----------------|------------|
| CU-001: Iniciar Sesión | 30 segundos | Diaria |
| CU-010: Registrar Ingreso | 5-7 minutos | 20-50/día |
| CU-011: Tomar Fotografías | 2 minutos | 20-50/día |
| CU-012: Registrar Salida | 3 minutos | 20-50/día |
| CU-020: Crear OT | 3-5 minutos | 15-40/día |
| CU-021: Asignar Mecánico | 1 minuto | 15-40/día |
| CU-022: Actualizar Estado | 2 minutos | 50-100/día |
| CU-023: Solicitar Repuesto | 1 minuto | 10-30/día |
| CU-024: Entregar Repuesto | 2 minutos | 10-30/día |
| CU-030: Generar Reporte | 30 segundos | 5-10/semana |

---

## 📊 Distribución de Prioridades

```
Alta:    █████████████████████ 18 CU (42%)
Media:   ██████████████████████████ 22 CU (51%)
Baja:    ████ 3 CU (7%)
```

**Estrategia de Implementación:**
1. **Sprint 1-3:** Todos los CU de prioridad Alta (18)
2. **Sprint 4-6:** CU de prioridad Media críticos (12)
3. **Sprint 7-8:** CU de prioridad Media restantes (10)
4. **Sprint 9:** CU de prioridad Baja (3)

---

## ✅ Estado de Implementación

| Estado | Cantidad | % |
|--------|----------|---|
| ✅ Implementado | 40 | 93% |
| ⏳ Pendiente | 3 | 7% |
| **Total** | **43** | **100%** |

**Casos de Uso Pendientes:**
- CU-070: Gestión de Llaves
- CU-071: Registrar Entrega de Llave
- CU-072: Registrar Devolución de Llave

*Estos CU están planificados para Sprint 9 (prioridad baja)*

---

## 🎯 Objetivos Cumplidos

✅ **Cobertura Funcional:** 100% de los RF cubiertos  
✅ **Usabilidad:** Procesos optimizados para cada rol  
✅ **Eficiencia:** Reducción de tiempos operativos  
✅ **Trazabilidad:** Control completo del flujo  
✅ **Visibilidad:** Dashboards y reportes en tiempo real  
✅ **Seguridad:** Control de acceso por roles  
✅ **Escalabilidad:** Arquitectura preparada para crecer  

---

## 📚 Documentos Relacionados

- [Especificación Completa de Casos de Uso](../../Contexto%20proyecto/Casos_de_Uso_Detallados.txt)
- [Actores del Sistema](./Actores_del_Sistema.md)
- [Matriz de Trazabilidad](./Matriz_Trazabilidad.md)
- [Diagrama de Casos de Uso](./Diagrama_Casos_de_Uso.png)

---

**Conclusión:**

El sistema cuenta con una cobertura completa y robusta de casos de uso que garantizan el cumplimiento de todos los requerimientos funcionales. La distribución balanceada por prioridades y el enfoque en los casos de uso críticos aseguran una implementación exitosa.

---

**Fecha:** 14/10/2025  
**Versión:** 1.0  
**Autor:** Equipo de Desarrollo PepsiCo Fleet Management  
**Estado:** ✅ Aprobado

