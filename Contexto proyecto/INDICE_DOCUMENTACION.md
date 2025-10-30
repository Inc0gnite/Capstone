# 📚 Índice General de Documentación

## Sistema de Gestión de Flota PepsiCo Chile

**Proyecto de Titulación - Duoc UC**  
**Fecha:** Octubre 2025

---

## 🗂️ Estructura Completa del Proyecto

```
Capstone_github/
│
├── 📁 Contexto proyecto/              ← DOCUMENTACIÓN METODOLOGÍA TRADICIONAL
│   │
│   ├── 📘 README.md                   ← Índice principal
│   │
│   ├── 📂 planificacion-inicial/      ← FASE 1: PLANIFICACIÓN
│   │   ├── README.md
│   │   ├── 📄 Acta de Constitución del Proyecto
│   │   ├── 📄 Plan de Proyecto
│   │   ├── 📊 Carta Gantt (CSV)
│   │   ├── 📋 Diccionario EDT
│   │   ├── 🖼️ Matriz EDT (PNG)
│   │   ├── 👥 Matriz RACI (CSV)
│   │   ├── ⚠️ Matriz de Riesgos (CSV)
│   │   └── 📄 Resumen Completo Planificación
│   │
│   └── 📂 analisis-diseño/            ← FASE 2: ANÁLISIS Y DISEÑO
│       ├── README.md
│       ├── 📋 Especificación de Requerimientos (ERS)
│       ├── 🎭 Casos de Uso Detallados
│       ├── 💾 Modelo de Datos y Diagrama ER
│       ├── 🏗️ Arquitectura del Sistema
│       ├── 🛠️ Stack Tecnológico
│       ├── 🔌 API Endpoints Especificación
│       ├── 🎨 Mockups y Diseño UI
│       └── ✅ Plan de Pruebas Detallado
│
├── 📁 docs/                           ← DOCUMENTACIÓN TÉCNICA
│   │
│   ├── 📂 arquitectura/
│   │   ├── Diagrama Casos de Uso.png
│   │   ├── Diagrama de Clases.png
│   │   └── Diagrama Entidad Relacion.pdf
│   │
│   ├── 📂 casos-uso/
│   │   ├── README.md
│   │   ├── Diagrama_Casos_de_Uso.png
│   │   ├── Actores_del_Sistema.md
│   │   ├── Matriz_Trazabilidad.md
│   │   └── Resumen_Casos_de_Uso.md
│   │
│   ├── 📂 api/
│   ├── 📂 manuales/
│   └── SETUP.md
│
├── 📁 frontend/                       ← CÓDIGO REACT
│   ├── src/
│   ├── package.json
│   └── README.md
│
├── 📁 backend/                        ← CÓDIGO NODE.JS
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── README.md
│
└── 📁 shared/                         ← CÓDIGO COMPARTIDO
    ├── types/
    └── schemas/
```

---

## 📋 FASE 1: PLANIFICACIÓN INICIAL

### 📂 `Contexto proyecto/planificacion-inicial/` (8 documentos)

| # | Documento | Páginas | Propósito |
|---|-----------|---------|-----------|
| 1 | **Acta de Constitución del Proyecto** | 4 | Autoriza formalmente el proyecto |
| 2 | **Plan de Proyecto** | 15 | Plan maestro con alcance, tiempo, costos |
| 3 | **Carta Gantt** | 1 | Cronograma visual con hitos |
| 4 | **Diccionario EDT** | 8 | Definición de paquetes de trabajo |
| 5 | **Matriz EDT** | 1 | Diagrama visual de EDT |
| 6 | **Matriz RACI** | 1 | Roles y responsabilidades |
| 7 | **Matriz de Riesgos** | 1 | Identificación y mitigación de riesgos |
| 8 | **Resumen Completo Planificación** | 25 | Consolidado de toda la planificación |

**Total:** ~55 páginas de documentación de gestión

---

## 🎨 FASE 2: ANÁLISIS Y DISEÑO

### 📂 `Contexto proyecto/analisis-diseño/` (8 documentos)

| # | Documento | Páginas | Propósito |
|---|-----------|---------|-----------|
| 1 | **Especificación de Requerimientos (ERS)** | 12 | 10 RF + 7 RNF según IEEE 29148 |
| 2 | **Casos de Uso Detallados** | 28 | 43 casos de uso con flujos |
| 3 | **Modelo de Datos y Diagrama ER** | 38 | Modelo relacional completo |
| 4 | **Arquitectura del Sistema** | 30 | MVC + 3 capas + patrones |
| 5 | **Stack Tecnológico** | 20 | Tecnologías seleccionadas |
| 6 | **API Endpoints Especificación** | 15 | Contratos REST API |
| 7 | **Mockups y Diseño UI** | 30 | Sistema de diseño + 15 pantallas |
| 8 | **Plan de Pruebas Detallado** | 35 | Estrategia y casos de prueba |

**Total:** ~208 páginas de documentación técnica

---

## 📊 DOCUMENTACIÓN ADICIONAL

### 📂 `docs/arquitectura/` (3 diagramas visuales)

| Diagrama | Formato | Propósito |
|----------|---------|-----------|
| Diagrama Casos de Uso | PNG | Visualización de interacciones |
| Diagrama de Clases | PNG | Modelo de dominio UML |
| Diagrama Entidad-Relación | PDF | Estructura de base de datos |

### 📂 `docs/casos-uso/` (5 documentos)

| Documento | Propósito |
|-----------|-----------|
| README.md | Índice de casos de uso |
| Diagrama_Casos_de_Uso.png | Diagrama visual |
| Actores_del_Sistema.md | 10 actores detallados |
| Matriz_Trazabilidad.md | CU ↔ RF (100% cobertura) |
| Resumen_Casos_de_Uso.md | Vista ejecutiva |

---

## 🎯 Resumen por Fase del Proyecto

### ✅ Fase 1: Iniciación y Planificación (Semanas 1-2)
**Carpeta:** `planificacion-inicial/`

**Entregables:**
- [x] Acta de Constitución
- [x] Identificación de stakeholders
- [x] Plan de Proyecto
- [x] EDT y Diccionario
- [x] Carta Gantt
- [x] Matriz RACI
- [x] Matriz de Riesgos

**Estado:** ✅ **Completo 100%**

---

### ✅ Fase 2: Análisis y Diseño (Semanas 2-4)
**Carpeta:** `analisis-diseño/`

**Entregables:**
- [x] Especificación de Requerimientos (ERS)
- [x] Casos de Uso Detallados
- [x] Modelo de Datos
- [x] Arquitectura del Sistema
- [x] Stack Tecnológico
- [x] Diseño de API
- [x] Mockups de Interfaz
- [x] Plan de Pruebas

**Estado:** ✅ **Completo 100%**

---

### 🔄 Fase 3: Implementación (Semanas 5-10)
**Carpetas:** `frontend/`, `backend/`, `shared/`

**Entregables:**
- [x] Estructura de proyecto configurada
- [ ] Módulo de autenticación
- [ ] Módulo de ingresos
- [ ] Módulo de órdenes de trabajo
- [ ] Módulo de inventario
- [ ] Módulo de reportes
- [ ] Módulo de administración

**Estado:** 🔄 **En Progreso (~20%)**

---

### ⏳ Fase 4: Pruebas (Semanas 10-11)
**Carpetas:** `frontend/tests/`, `backend/tests/`

**Entregables:**
- [ ] Pruebas unitarias (≥70% cobertura)
- [ ] Pruebas de integración
- [ ] Pruebas funcionales
- [ ] Pruebas de usabilidad
- [ ] Pruebas de seguridad
- [ ] Reporte de pruebas

**Estado:** ⏳ **Pendiente**

---

### ⏳ Fase 5: Cierre (Semana 12)
**Entregables:**
- [ ] Informe final de titulación
- [ ] Presentación PowerPoint
- [ ] Manual de usuario
- [ ] Manual técnico
- [ ] Video demostración

**Estado:** ⏳ **Pendiente**

---

## 📊 Estadísticas Generales

### Documentación
| Categoría | Documentos | Páginas | Estado |
|-----------|------------|---------|--------|
| **Planificación Inicial** | 8 | ~55 | ✅ 100% |
| **Análisis y Diseño** | 8 | ~208 | ✅ 100% |
| **Documentación Adicional** | 8 | ~40 | ✅ 100% |
| **Diagramas Visuales** | 3 | - | ✅ 100% |
| **TOTAL** | **27** | **~303** | ✅ **100%** |

### Cobertura
- ✅ **Requerimientos Funcionales:** 10/10 (100%)
- ✅ **Requerimientos No Funcionales:** 7/7 (100%)
- ✅ **Casos de Uso:** 43 documentados
- ✅ **Actores:** 10 descritos
- ✅ **Trazabilidad:** 100% CU ↔ RF

---

## 🎓 Uso para Informe de Titulación

### Capítulo 1: Introducción
- Usa: `planificacion-inicial/Acta_de_Constitución_Proyecto.docx.txt`
- Secciones: Contexto, justificación, objetivos

### Capítulo 2: Marco Teórico
- Usa: `analisis-diseño/Stack_Tecnológico_Definición.txt`
- Secciones: Tecnologías, fundamentos

### Capítulo 3: Análisis del Sistema
- Usa: `analisis-diseño/Especificación de Requerimientos del Sistema.docx .txt`
- Usa: `analisis-diseño/Casos_de_Uso_Detallados.txt`
- Usa: `docs/casos-uso/Actores_del_Sistema.md`

### Capítulo 4: Diseño del Sistema
- Usa: `analisis-diseño/Arquitectura_del_Sistema.txt`
- Usa: `analisis-diseño/Modelo_de_Datos_Diagrama_ER.txt`
- Usa: `docs/arquitectura/` (diagramas PNG/PDF)

### Capítulo 5: Diseño de Interfaz
- Usa: `analisis-diseño/Mockups_y_Diseño_UI.txt`

### Capítulo 6: Implementación
- Usa: Código en `frontend/` y `backend/`

### Capítulo 7: Pruebas
- Usa: `analisis-diseño/Plan_de_Pruebas_Detallado.txt`

### Capítulo 8: Gestión del Proyecto
- Usa: `planificacion-inicial/` (todos los archivos)

---

## 🔗 Enlaces Rápidos

### Documentos Principales:
- [README General del Proyecto](./README.md)
- [Planificación Inicial](./planificacion-inicial/README.md)
- [Análisis y Diseño](./analisis-diseño/README.md)

### Diagramas:
- [Casos de Uso (Documentación)](../docs/casos-uso/README.md)
- [Arquitectura (Diagramas)](../docs/arquitectura/)

### Código:
- [Frontend React](../frontend/README.md)
- [Backend Node.js](../backend/README.md)
- [Setup General](../docs/SETUP.md)

---

## ✅ Checklist de Entregables Académicos

### Documentación de Gestión (Metodología Tradicional)
- [x] Acta de Constitución del Proyecto
- [x] Identificación de Stakeholders
- [x] Plan de Proyecto
- [x] EDT y Diccionario
- [x] Carta Gantt
- [x] Matriz RACI
- [x] Matriz de Riesgos

### Documentación Técnica
- [x] Especificación de Requerimientos (ERS/SRS)
- [x] Casos de Uso Detallados
- [x] Diagrama de Casos de Uso
- [x] Modelo de Datos (ER)
- [x] Diagrama de Clases
- [x] Arquitectura del Sistema
- [x] Diseño de API REST
- [x] Mockups de Interfaz
- [x] Plan de Pruebas

### Código
- [x] Estructura de proyecto configurada
- [ ] Implementación (en progreso)
- [ ] Pruebas unitarias
- [ ] Pruebas de integración

### Entrega Final
- [ ] Informe escrito
- [ ] Presentación PowerPoint
- [ ] Video demostración
- [ ] Manuales de usuario
- [ ] Código fuente en GitHub

---

## 📈 Progreso Global

```
Planificación:     ████████████████████ 100% ✅
Análisis/Diseño:   ████████████████████ 100% ✅
Implementación:    ████░░░░░░░░░░░░░░░░  20% 🔄
Pruebas:           ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Cierre:            ░░░░░░░░░░░░░░░░░░░░   0% ⏳

TOTAL:             ████████░░░░░░░░░░░░  44% 🔄
```

---

## 🎯 Próximos Pasos

1. **Implementación del Backend** (Semanas 5-7)
   - Configurar Prisma y base de datos
   - Implementar autenticación JWT
   - Desarrollar endpoints API
   - Crear servicios de negocio

2. **Implementación del Frontend** (Semanas 7-9)
   - Configurar React Router
   - Implementar autenticación
   - Desarrollar páginas principales
   - Integrar con API

3. **Pruebas** (Semanas 10-11)
   - Ejecutar plan de pruebas
   - Corregir bugs
   - Optimizar rendimiento

4. **Cierre** (Semana 12)
   - Documentar código
   - Crear manuales
   - Preparar presentación
   - Defensa final

---

## 📞 Contacto

**Equipo de Desarrollo:**
- **Joaquín Marín** - Gerente de Proyecto / Frontend Developer
- **Benjamin Vilches** - Gerente de Proyecto / Backend Developer

**Institución:** Duoc UC  
**Docente Guía:** Fabián Álvarez  
**Cliente:** PepsiCo Chile  
**Patrocinador:** Alexis González

---

## 📅 Calendario de Hitos

| Hito | Semana | Fecha Estimada | Estado |
|------|--------|----------------|--------|
| Acta de Constitución aprobada | 1 | 07/10/2025 | ✅ |
| Planificación completa | 2 | 14/10/2025 | ✅ |
| Análisis y diseño completo | 4 | 28/10/2025 | ✅ |
| Prototipo funcional | 8 | 25/11/2025 | 🔄 |
| Sistema completo | 10 | 09/12/2025 | ⏳ |
| Pruebas finalizadas | 11 | 16/12/2025 | ⏳ |
| Defensa final | 12 | 23/12/2025 | ⏳ |

---

**Última Actualización:** 14/10/2025  
**Versión:** 1.0  
**Estado General:** 📈 **En progreso - 44% completado**

