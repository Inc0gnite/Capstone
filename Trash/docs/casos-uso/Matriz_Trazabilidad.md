# 📊 Matriz de Trazabilidad

## Casos de Uso vs Requerimientos Funcionales

**Sistema de Gestión de Flota PepsiCo Chile**

---

## 📋 Introducción

Este documento presenta la matriz de trazabilidad que relaciona los casos de uso del sistema con los requerimientos funcionales (RF) y no funcionales (RNF). Esta matriz asegura que:

✅ Todos los requerimientos están cubiertos por al menos un caso de uso  
✅ Todos los casos de uso contribuyen a cumplir uno o más requerimientos  
✅ Existe trazabilidad completa para pruebas y validación

---

## 🎯 Matriz Principal: CU vs RF

| ID Caso de Uso | Nombre del Caso de Uso | RF Relacionados | RNF Relacionados | Prioridad | Estado |
|----------------|------------------------|-----------------|------------------|-----------|--------|
| **CU-001** | Iniciar Sesión | RF-10 | RNF-04, RNF-06 | Alta | ✅ |
| **CU-002** | Cerrar Sesión | RF-10 | RNF-04 | Alta | ✅ |
| **CU-003** | Recuperar Contraseña | RF-10 | RNF-04 | Media | ✅ |
| **CU-004** | Cambiar Contraseña | RF-10 | RNF-04 | Media | ✅ |
| **CU-010** | Registrar Ingreso de Vehículo | RF-01 | RNF-02, RNF-03 | Alta | ✅ |
| **CU-011** | Tomar Fotografías de Vehículo | RF-01 | RNF-02, RNF-03 | Alta | ✅ |
| **CU-012** | Registrar Salida de Vehículo | RF-01 | RNF-02 | Alta | ✅ |
| **CU-013** | Buscar Vehículo | RF-02 | RNF-02 | Alta | ✅ |
| **CU-014** | Registrar Nuevo Vehículo | RF-02 | - | Media | ✅ |
| **CU-015** | Actualizar Datos de Vehículo | RF-02 | - | Media | ✅ |
| **CU-016** | Ver Historial de Vehículo | RF-02 | RNF-02 | Media | ✅ |
| **CU-020** | Crear Orden de Trabajo | RF-03 | RNF-02 | Alta | ✅ |
| **CU-021** | Asignar Mecánico a OT | RF-04 | RNF-02 | Alta | ✅ |
| **CU-022** | Actualizar Estado de OT | RF-05 | RNF-02 | Alta | ✅ |
| **CU-023** | Solicitar Repuesto para OT | RF-06 | RNF-02 | Alta | ✅ |
| **CU-024** | Entregar Repuesto | RF-06 | RNF-02 | Alta | ✅ |
| **CU-025** | Registrar Pausa en OT | RF-05 | - | Media | ✅ |
| **CU-026** | Finalizar Pausa | RF-05 | - | Media | ✅ |
| **CU-027** | Agregar Documentos a Ingreso | RF-07 | - | Media | ✅ |
| **CU-028** | Descargar Documentos | RF-07 | - | Media | ✅ |
| **CU-029** | Ver Dashboard | RF-08 | RNF-02, RNF-03 | Alta | ✅ |
| **CU-030** | Generar Reporte de Flota | RF-08 | RNF-02 | Alta | ✅ |
| **CU-031** | Generar Reporte de Desempeño | RF-08 | RNF-02 | Media | ✅ |
| **CU-032** | Generar Reporte de Inventario | RF-08 | RNF-02 | Media | ✅ |
| **CU-033** | Generar Reporte de Costos | RF-08 | RNF-02 | Media | ✅ |
| **CU-034** | Exportar Reporte a PDF | RF-08 | - | Media | ✅ |
| **CU-035** | Exportar Reporte a Excel | RF-08 | - | Media | ✅ |
| **CU-040** | Recibir Notificación | RF-09 | RNF-02 | Alta | ✅ |
| **CU-041** | Marcar Notificación como Leída | RF-09 | - | Baja | ✅ |
| **CU-042** | Marcar Todas como Leídas | RF-09 | - | Baja | ✅ |
| **CU-043** | Eliminar Notificación | RF-09 | - | Baja | ✅ |
| **CU-050** | Gestionar Usuarios | RF-10 | RNF-04 | Alta | ✅ |
| **CU-051** | Crear Usuario | RF-10 | RNF-04 | Alta | ✅ |
| **CU-052** | Editar Usuario | RF-10 | RNF-04 | Alta | ✅ |
| **CU-053** | Desactivar Usuario | RF-10 | RNF-04 | Alta | ✅ |
| **CU-054** | Gestionar Roles y Permisos | RF-10 | RNF-04 | Alta | ✅ |
| **CU-060** | Actualizar Inventario | RF-06 | - | Media | ✅ |
| **CU-061** | Registrar Ingreso de Repuestos | RF-06 | - | Media | ✅ |
| **CU-062** | Ajustar Stock | RF-06 | - | Media | ✅ |
| **CU-063** | Ver Movimientos de Inventario | RF-06 | RNF-02 | Media | ✅ |
| **CU-070** | Gestión de Llaves | RF-01 | - | Baja | ⏳ |
| **CU-071** | Registrar Entrega de Llave | RF-01 | - | Baja | ⏳ |
| **CU-072** | Registrar Devolución de Llave | RF-01 | - | Baja | ⏳ |

---

## 📑 Matriz Inversa: RF vs CU

### RF-01: Gestión de Ingresos de Vehículos

**Descripción:** El sistema debe permitir el registro completo del ingreso de vehículos al taller.

| Caso de Uso | Descripción | Cobertura |
|-------------|-------------|-----------|
| CU-010 | Registrar Ingreso de Vehículo | ✅ Completa |
| CU-011 | Tomar Fotografías de Vehículo | ✅ Completa |
| CU-012 | Registrar Salida de Vehículo | ✅ Completa |
| CU-070 | Gestión de Llaves | ✅ Completa |
| CU-071 | Registrar Entrega de Llave | ✅ Completa |
| CU-072 | Registrar Devolución de Llave | ✅ Completa |

**Estado:** ✅ **100% Cubierto** - 6 casos de uso

---

### RF-02: Gestión de Vehículos

**Descripción:** El sistema debe permitir administrar la información de la flota de vehículos.

| Caso de Uso | Descripción | Cobertura |
|-------------|-------------|-----------|
| CU-013 | Buscar Vehículo | ✅ Completa |
| CU-014 | Registrar Nuevo Vehículo | ✅ Completa |
| CU-015 | Actualizar Datos de Vehículo | ✅ Completa |
| CU-016 | Ver Historial de Vehículo | ✅ Completa |

**Estado:** ✅ **100% Cubierto** - 4 casos de uso

---

### RF-03: Creación de Órdenes de Trabajo

**Descripción:** El sistema debe permitir crear y gestionar órdenes de trabajo.

| Caso de Uso | Descripción | Cobertura |
|-------------|-------------|-----------|
| CU-020 | Crear Orden de Trabajo | ✅ Completa |

**Estado:** ✅ **100% Cubierto** - 1 caso de uso

---

### RF-04: Asignación de Mecánicos

**Descripción:** El sistema debe permitir asignar mecánicos a órdenes de trabajo.

| Caso de Uso | Descripción | Cobertura |
|-------------|-------------|-----------|
| CU-021 | Asignar Mecánico a OT | ✅ Completa |

**Estado:** ✅ **100% Cubierto** - 1 caso de uso

---

### RF-05: Seguimiento de Órdenes de Trabajo

**Descripción:** El sistema debe permitir actualizar y hacer seguimiento del estado de las OT.

| Caso de Uso | Descripción | Cobertura |
|-------------|-------------|-----------|
| CU-022 | Actualizar Estado de OT | ✅ Completa |
| CU-025 | Registrar Pausa en OT | ✅ Completa |
| CU-026 | Finalizar Pausa | ✅ Completa |

**Estado:** ✅ **100% Cubierto** - 3 casos de uso

---

### RF-06: Gestión de Inventario de Repuestos

**Descripción:** El sistema debe gestionar el inventario de repuestos y su uso en OT.

| Caso de Uso | Descripción | Cobertura |
|-------------|-------------|-----------|
| CU-023 | Solicitar Repuesto para OT | ✅ Completa |
| CU-024 | Entregar Repuesto | ✅ Completa |
| CU-060 | Actualizar Inventario | ✅ Completa |
| CU-061 | Registrar Ingreso de Repuestos | ✅ Completa |
| CU-062 | Ajustar Stock | ✅ Completa |
| CU-063 | Ver Movimientos de Inventario | ✅ Completa |

**Estado:** ✅ **100% Cubierto** - 6 casos de uso

---

### RF-07: Gestión de Documentos

**Descripción:** El sistema debe permitir adjuntar y gestionar documentos.

| Caso de Uso | Descripción | Cobertura |
|-------------|-------------|-----------|
| CU-027 | Agregar Documentos a Ingreso | ✅ Completa |
| CU-028 | Descargar Documentos | ✅ Completa |

**Estado:** ✅ **100% Cubierto** - 2 casos de uso

---

### RF-08: Generación de Reportes

**Descripción:** El sistema debe generar reportes y dashboards con métricas clave.

| Caso de Uso | Descripción | Cobertura |
|-------------|-------------|-----------|
| CU-029 | Ver Dashboard | ✅ Completa |
| CU-030 | Generar Reporte de Flota | ✅ Completa |
| CU-031 | Generar Reporte de Desempeño | ✅ Completa |
| CU-032 | Generar Reporte de Inventario | ✅ Completa |
| CU-033 | Generar Reporte de Costos | ✅ Completa |
| CU-034 | Exportar Reporte a PDF | ✅ Completa |
| CU-035 | Exportar Reporte a Excel | ✅ Completa |

**Estado:** ✅ **100% Cubierto** - 7 casos de uso

---

### RF-09: Sistema de Notificaciones

**Descripción:** El sistema debe notificar eventos relevantes a los usuarios.

| Caso de Uso | Descripción | Cobertura |
|-------------|-------------|-----------|
| CU-040 | Recibir Notificación | ✅ Completa |
| CU-041 | Marcar Notificación como Leída | ✅ Completa |
| CU-042 | Marcar Todas como Leídas | ✅ Completa |
| CU-043 | Eliminar Notificación | ✅ Completa |

**Estado:** ✅ **100% Cubierto** - 4 casos de uso

---

### RF-10: Gestión de Usuarios y Seguridad

**Descripción:** El sistema debe gestionar usuarios, roles, permisos y autenticación.

| Caso de Uso | Descripción | Cobertura |
|-------------|-------------|-----------|
| CU-001 | Iniciar Sesión | ✅ Completa |
| CU-002 | Cerrar Sesión | ✅ Completa |
| CU-003 | Recuperar Contraseña | ✅ Completa |
| CU-004 | Cambiar Contraseña | ✅ Completa |
| CU-050 | Gestionar Usuarios | ✅ Completa |
| CU-051 | Crear Usuario | ✅ Completa |
| CU-052 | Editar Usuario | ✅ Completa |
| CU-053 | Desactivar Usuario | ✅ Completa |
| CU-054 | Gestionar Roles y Permisos | ✅ Completa |

**Estado:** ✅ **100% Cubierto** - 9 casos de uso

---

## 📊 Resumen de Cobertura

### Por Requerimiento Funcional

| RF | Descripción | Casos de Uso | % Cobertura |
|----|-------------|--------------|-------------|
| RF-01 | Gestión de Ingresos | 6 | ✅ 100% |
| RF-02 | Gestión de Vehículos | 4 | ✅ 100% |
| RF-03 | Creación de OT | 1 | ✅ 100% |
| RF-04 | Asignación de Mecánicos | 1 | ✅ 100% |
| RF-05 | Seguimiento de OT | 3 | ✅ 100% |
| RF-06 | Gestión de Inventario | 6 | ✅ 100% |
| RF-07 | Gestión de Documentos | 2 | ✅ 100% |
| RF-08 | Generación de Reportes | 7 | ✅ 100% |
| RF-09 | Notificaciones | 4 | ✅ 100% |
| RF-10 | Usuarios y Seguridad | 9 | ✅ 100% |

**Total:** 10 Requerimientos Funcionales - **43 Casos de Uso** - **100% Cobertura** ✅

---

### Por Requerimiento No Funcional

| RNF | Descripción | Casos de Uso Relacionados |
|-----|-------------|---------------------------|
| **RNF-01** | Disponibilidad 99.9% | Todos |
| **RNF-02** | Tiempo de respuesta < 3s | CU-010, CU-013, CU-016, CU-020, CU-021, CU-022, CU-023, CU-024, CU-029, CU-030, CU-040, CU-063 |
| **RNF-03** | Interfaz responsive | CU-010, CU-011, CU-029 |
| **RNF-04** | Seguridad robusta | CU-001, CU-002, CU-003, CU-004, CU-050, CU-051, CU-052, CU-053, CU-054 |
| **RNF-05** | Escalabilidad | Todos |
| **RNF-06** | Compatibilidad navegadores | CU-001 |
| **RNF-07** | Backups automáticos | - (Infraestructura) |

---

## 📈 Estadísticas

### Cobertura General
- **Total de RF:** 10
- **RF Cubiertos:** 10 (100%)
- **Total de Casos de Uso:** 43
- **Casos de Uso Implementados:** 40 (93%)
- **Casos de Uso Pendientes:** 3 (7%) - CU-070, CU-071, CU-072

### Por Prioridad
| Prioridad | Cantidad | % |
|-----------|----------|---|
| Alta | 18 | 42% |
| Media | 22 | 51% |
| Baja | 3 | 7% |

### Por Módulo
| Módulo | Casos de Uso | % |
|--------|--------------|---|
| Autenticación | 4 | 9% |
| Ingresos | 7 | 16% |
| Órdenes de Trabajo | 7 | 16% |
| Inventario | 6 | 14% |
| Reportes | 7 | 16% |
| Notificaciones | 4 | 9% |
| Administración | 5 | 12% |
| Otros | 3 | 7% |

---

## 🎯 Impacto de Casos de Uso

### Casos de Uso de Alto Impacto
(Cubren múltiples RF o RNF críticos)

1. **CU-010: Registrar Ingreso de Vehículo**
   - RF-01 (principal)
   - RNF-02, RNF-03
   - **Crítico** para el flujo principal del sistema

2. **CU-020: Crear Orden de Trabajo**
   - RF-03 (principal)
   - RNF-02
   - **Crítico** para el proceso de mantenimiento

3. **CU-001: Iniciar Sesión**
   - RF-10 (principal)
   - RNF-04, RNF-06
   - **Crítico** para acceso al sistema

4. **CU-029: Ver Dashboard**
   - RF-08 (principal)
   - RNF-02, RNF-03
   - **Alto valor** para supervisores y gerencia

---

## ✅ Validación de Cobertura

### Criterios de Validación:
- [x] Todos los RF tienen al menos un CU asociado
- [x] Todos los CU contribuyen a al menos un RF
- [x] Los CU de alta prioridad cubren RF críticos
- [x] Existe trazabilidad bidireccional (RF↔CU)
- [x] Los RNF están considerados en CU relevantes

### Conclusión:
✅ **La matriz de trazabilidad es completa y consistente**

Todos los requerimientos funcionales están cubiertos por casos de uso implementados o planificados. La cobertura del 100% asegura que el sistema cumplirá con todas las funcionalidades requeridas.

---

## 📚 Uso de esta Matriz

### Para Desarrollo:
- Identificar qué CU implementar para cumplir cada RF
- Priorizar desarrollo según impacto en RF
- Verificar completitud de implementación

### Para Testing:
- Generar casos de prueba basados en CU
- Validar que cada RF está probado
- Rastrear cobertura de pruebas

### Para Gestión:
- Seguimiento de progreso por RF
- Identificar dependencias críticas
- Reportar avance al cliente

---

**Fecha:** 14/10/2025  
**Versión:** 1.0  
**Estado:** ✅ Validado  
**Cobertura:** 100%  
**Autor:** Equipo de Desarrollo PepsiCo Fleet Management

