# 🎨 Análisis y Diseño del Sistema

## Sistema de Gestión de Flota PepsiCo Chile

Esta carpeta contiene todos los documentos de **Análisis y Diseño** del sistema, correspondientes a las fases técnicas de especificación, modelado y arquitectura.

---

## 📁 Documentos Incluidos

### 📋 Especificación de Requerimientos

| Documento | Descripción | Líneas |
|-----------|-------------|--------|
| **Especificación de Requerimientos del Sistema.docx .txt** | ERS/SRS completo con 10 Requerimientos Funcionales y 7 No Funcionales según ISO/IEC/IEEE 29148 | 274 |

### 🎭 Casos de Uso

| Documento | Descripción | Líneas |
|-----------|-------------|--------|
| **Casos_de_Uso_Detallados.txt** | 43 casos de uso detallados con actores, flujos principales, alternativos y de excepción | 758 |

### 💾 Modelo de Datos

| Documento | Descripción | Líneas |
|-----------|-------------|--------|
| **Modelo_de_Datos_Diagrama_ER.txt** | Diagrama Entidad-Relación completo con 20 tablas (versión detallada en ASCII) | 1,021 |

### 🏗️ Arquitectura del Sistema

| Documento | Descripción | Líneas |
|-----------|-------------|--------|
| **Arquitectura_del_Sistema.txt** | Arquitectura de 3 capas (MVC), componentes, flujos de datos, patrones de diseño, seguridad | 806 |
| **Stack_Tecnológico_Definición.txt** | Tecnologías seleccionadas para frontend, backend y base de datos con justificación | 526 |

### 🔌 Diseño de API

| Documento | Descripción | Líneas |
|-----------|-------------|--------|
| **API_Endpoints_Especificación.txt** | Especificación completa de endpoints REST con métodos, parámetros y respuestas | - |

### 🎨 Diseño de Interfaz

| Documento | Descripción | Líneas |
|-----------|-------------|--------|
| **Mockups_y_Diseño_UI.txt** | Sistema de diseño, paleta de colores, tipografía, mockups de 15+ pantallas | 810 |

### ✅ Pruebas

| Documento | Descripción | Líneas |
|-----------|-------------|--------|
| **Plan_de_Pruebas_Detallado.txt** | Estrategia de pruebas, casos de prueba, criterios de aceptación (7 tipos de prueba) | 969 |

---

## 🎯 Cobertura

### Requerimientos Funcionales (RF)
- RF-01: Gestión de Ingresos de Vehículos
- RF-02: Gestión de Vehículos
- RF-03: Creación de Órdenes de Trabajo
- RF-04: Asignación de Mecánicos
- RF-05: Seguimiento de OT
- RF-06: Gestión de Inventario
- RF-07: Gestión de Documentos
- RF-08: Generación de Reportes
- RF-09: Sistema de Notificaciones
- RF-10: Gestión de Usuarios y Seguridad

**Estado:** ✅ **100% de RF cubiertos**

### Requerimientos No Funcionales (RNF)
- RNF-01: Disponibilidad 99.9%
- RNF-02: Tiempo de respuesta < 3s
- RNF-03: Interfaz responsive
- RNF-04: Seguridad robusta
- RNF-05: Escalabilidad
- RNF-06: Compatibilidad navegadores
- RNF-07: Backups automáticos

**Estado:** ✅ **100% de RNF especificados**

---

## 🏛️ Arquitectura

### Patrón Arquitectónico
**Modelo-Vista-Controlador (MVC)** + API RESTful

```
Vista (Frontend)
├── React 18 + TypeScript
├── Tailwind CSS + shadcn/ui
└── Zustand + React Query

Controlador (Backend)
├── Node.js 20 + Express.js
├── TypeScript + JWT + bcrypt
└── Middleware: Auth, RBAC, Validation

Modelo (Database)
├── PostgreSQL 15+
├── Prisma ORM
└── 9 tablas principales (versión simplificada)
```

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| **Total de Casos de Uso** | 43 |
| **Actores del Sistema** | 10 |
| **Tablas de Base de Datos** | 20 (detallado) / 9 (simplificado) |
| **Pantallas Diseñadas** | 15+ |
| **Endpoints API** | 30+ |
| **Tipos de Prueba** | 7 |
| **Cobertura de RF** | 100% |

---

## 🔗 Documentación Relacionada

### En otras carpetas:
- **Diagramas Visuales:** `docs/arquitectura/`
  - Diagrama Entidad-Relación (PDF)
  - Diagrama de Clases (PNG)
  - Diagrama de Casos de Uso (PNG)

- **Casos de Uso Adicionales:** `docs/casos-uso/`
  - Actores del Sistema
  - Matriz de Trazabilidad
  - Resumen Ejecutivo

- **Planificación:** `planificacion-inicial/`
  - Acta de Constitución
  - Carta Gantt
  - Matrices (RACI, Riesgos, EDT)

---

## ✅ Checklist de Documentos

- [x] Documento de Especificación de Requerimientos (ERS)
- [x] Casos de Uso Detallados
- [x] Modelo de Datos y Diagrama ER
- [x] Arquitectura del Sistema
- [x] Stack Tecnológico
- [x] Especificación de API
- [x] Mockups de Interfaz
- [x] Plan de Pruebas

**Estado:** ✅ **100% Completo**

---

## 📖 Uso Recomendado

### Para Desarrollo:
1. Lee **Arquitectura_del_Sistema.txt** - Entender estructura general
2. Consulta **Casos_de_Uso_Detallados.txt** - Funcionalidades específicas
3. Revisa **Modelo_de_Datos_Diagrama_ER.txt** - Estructura de BD
4. Usa **API_Endpoints_Especificación.txt** - Contratos de API

### Para Testing:
1. **Plan_de_Pruebas_Detallado.txt** - Estrategia y casos
2. **Casos_de_Uso_Detallados.txt** - Escenarios de prueba
3. **Especificación de Requerimientos** - Validación de RF/RNF

### Para Diseño:
1. **Mockups_y_Diseño_UI.txt** - Sistema de diseño y pantallas
2. **Casos_de_Uso_Detallados.txt** - Flujos de usuario

---

**Fecha de Creación:** 13/10/2025  
**Última Actualización:** 14/10/2025  
**Responsables:** Joaquín Marín y Benjamin Vilches  
**Institución:** Duoc UC  
**Cliente:** PepsiCo Chile

