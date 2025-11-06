# 📚 Documentación del Proyecto

## Sistema de Gestión de Flota PepsiCo Chile

**Metodología:** Tradicional (Cascada)  
**Fecha de Inicio:** 07/10/2025  
**Equipo:** Joaquín Marín y Benjamin Vilches  
**Cliente:** PepsiCo Chile

---

## 📂 Estructura de Carpetas

```
Contexto proyecto/
├── planificacion-inicial/          ← Gestión de Proyecto
│   ├── Acta de Constitución
│   ├── Plan de Proyecto
│   ├── Carta Gantt
│   ├── EDT y Diccionario
│   ├── Matriz RACI
│   ├── Matriz de Riesgos
│   └── Resumen de Planificación
│
└── analisis-diseño/                ← Análisis y Diseño Técnico
    ├── Especificación de Requerimientos (ERS)
    ├── Casos de Uso Detallados
    ├── Modelo de Datos y Diagrama ER
    ├── Arquitectura del Sistema
    ├── Stack Tecnológico
    ├── Especificación de API
    ├── Mockups y Diseño UI
    └── Plan de Pruebas
```

---

## 📋 1. Planificación Inicial

### 📁 [planificacion-inicial/](./planificacion-inicial/)

**Fase:** Iniciación y Planificación  
**Documentos:** 8 archivos  
**Estado:** ✅ Completo

#### Contenido:
- ✅ Acta de Constitución del Proyecto
- ✅ Plan de Proyecto
- ✅ Carta Gantt (Cronograma)
- ✅ Estructura de Desglose del Trabajo (EDT)
- ✅ Diccionario EDT
- ✅ Matriz RACI (Roles y responsabilidades)
- ✅ Matriz de Riesgos
- ✅ Resumen Completo de Planificación

**Ver más:** [planificacion-inicial/README.md](./planificacion-inicial/README.md)

---

## 🎨 2. Análisis y Diseño

### 📁 [analisis-diseño/](./analisis-diseño/)

**Fase:** Análisis y Diseño  
**Documentos:** 8 archivos  
**Estado:** ✅ Completo

#### Contenido:
- ✅ Especificación de Requerimientos del Sistema (ERS)
  - 10 Requerimientos Funcionales
  - 7 Requerimientos No Funcionales
- ✅ Casos de Uso Detallados (43 casos de uso)
- ✅ Modelo de Datos y Diagrama ER
- ✅ Arquitectura del Sistema (MVC + 3 Capas)
- ✅ Stack Tecnológico (React + Node.js + PostgreSQL)
- ✅ Especificación de API (REST)
- ✅ Mockups y Diseño UI/UX (15+ pantallas)
- ✅ Plan de Pruebas Detallado (7 tipos)

**Ver más:** [analisis-diseño/README.md](./analisis-diseño/README.md)

---

## 📊 Resumen del Proyecto

### Información General

| Campo | Valor |
|-------|-------|
| **Proyecto** | Plataforma de Gestión de Ingreso de Vehículos |
| **Cliente** | PepsiCo Chile |
| **Duración** | 18 semanas (12 semanas académicas) |
| **Metodología** | Cascada (Tradicional) |
| **Presupuesto** | $0 (Tecnologías Open Source) |
| **Equipo** | 2 personas |

### Fases del Proyecto

| Fase | Semanas | Estado | Entregables |
|------|---------|--------|-------------|
| **1. Iniciación y Planificación** | 1-2 | ✅ Completo | Acta, Plan, EDT, RACI, Riesgos, Gantt |
| **2. Análisis y Diseño** | 2-4 | ✅ Completo | ERS, Casos de Uso, Arquitectura, Mockups |
| **3. Implementación** | 5-10 | 🔄 En progreso | Código frontend + backend |
| **4. Pruebas** | 10-11 | ⏳ Pendiente | Casos de prueba ejecutados |
| **5. Cierre** | 12 | ⏳ Pendiente | Informe final, presentación |

---

## 🎯 Objetivos del Proyecto

### Objetivo General
Desarrollar e implementar una plataforma web centralizada que automatice y digitalice el proceso de ingreso de vehículos a los talleres de mantenimiento de PepsiCo Chile.

### Objetivos Específicos
1. ✅ Reducir tiempo de registro de vehículos de 15 min → 5 min
2. ✅ Centralizar información en tiempo real
3. ✅ Mejorar trazabilidad del mantenimiento
4. ✅ Optimizar control de inventario de repuestos
5. ✅ Generar reportes automáticos para toma de decisiones

---

## 👥 Stakeholders

| Nombre | Rol | Organización |
|--------|-----|--------------|
| **Alexis González** | Patrocinador - Subgerente de Flota Nacional | PepsiCo Chile |
| **Joaquín Marín** | Gerente de Proyecto / Desarrollador Frontend | Duoc UC |
| **Benjamin Vilches** | Gerente de Proyecto / Desarrollador Backend | Duoc UC |
| **Fabián Álvarez** | Docente Guía | Duoc UC |
| **Usuarios Finales** | 10 perfiles (Guardias, Mecánicos, Jefes, etc.) | PepsiCo Chile |

---

## 📈 Indicadores de Éxito

| Indicador | Meta | Estado |
|-----------|------|--------|
| **Funcionalidades implementadas** | 10/10 RF | 🔄 En progreso |
| **Tiempo de desarrollo** | ≤ 12 semanas | ✅ En tiempo |
| **Bugs críticos** | 0 | ⏳ Pendiente validar |
| **Cobertura de pruebas** | ≥ 70% | ⏳ Pendiente |
| **Satisfacción usuario** | ≥ 80% | ⏳ Pendiente UAT |

---

## 🛠️ Stack Tecnológico

### Frontend
- React 18 + TypeScript
- Vite + Tailwind CSS
- Zustand + React Query

### Backend
- Node.js 20 + Express.js
- TypeScript + Prisma ORM
- JWT + bcrypt

### Base de Datos
- PostgreSQL 15+

### Hosting
- Frontend: Vercel
- Backend: Railway/Render
- Database: Neon/Supabase

---

## 📚 Documentación Adicional

### En otras carpetas del proyecto:

- **`docs/arquitectura/`** - Diagramas visuales (PNG/PDF)
  - Diagrama de Casos de Uso
  - Diagrama de Clases
  - Diagrama Entidad-Relación

- **`docs/casos-uso/`** - Documentación complementaria
  - Actores del Sistema
  - Matriz de Trazabilidad CU ↔ RF
  - Resumen Ejecutivo

- **`frontend/`** - Código fuente React
- **`backend/`** - Código fuente Node.js
- **`shared/`** - Código compartido (types, schemas)

---

## 📖 Guía de Navegación

### Para Entender el Proyecto:
1. **Empieza aquí:** `planificacion-inicial/Acta_de_Constitución_Proyecto.docx.txt`
2. **Luego:** `planificacion-inicial/RESUMEN_COMPLETO_PLANIFICACION.txt`
3. **Después:** `analisis-diseño/Especificación de Requerimientos del Sistema.docx .txt`

### Para Implementar:
1. **Arquitectura:** `analisis-diseño/Arquitectura_del_Sistema.txt`
2. **Casos de Uso:** `analisis-diseño/Casos_de_Uso_Detallados.txt`
3. **API:** `analisis-diseño/API_Endpoints_Especificación.txt`
4. **UI:** `analisis-diseño/Mockups_y_Diseño_UI.txt`

### Para Probar:
1. **Plan:** `analisis-diseño/Plan_de_Pruebas_Detallado.txt`
2. **Casos de Uso:** Para generar casos de prueba

---

## ✅ Estado de Documentación

| Fase | Documentos | Completitud |
|------|------------|-------------|
| **Planificación Inicial** | 8/8 | ✅ 100% |
| **Análisis y Diseño** | 8/8 | ✅ 100% |
| **Implementación** | - | 🔄 En progreso |
| **Pruebas** | - | ⏳ Pendiente |

---

## 🎓 Uso Académico

Esta documentación cumple con los requisitos de:
- ✅ Proyecto de Titulación Duoc UC
- ✅ Metodología Tradicional (Cascada)
- ✅ Estándares IEEE (29148 para requerimientos)
- ✅ Gestión de Proyectos PMBOK

**Apta para:**
- Informe de Titulación
- Presentación Final
- Defensa del Proyecto
- Portfolio Profesional

---

**Fecha:** 14/10/2025  
**Versión:** 1.1  
**Estado:** ✅ Documentación Completa  
**Responsables:** Joaquín Marín y Benjamin Vilches  
**Institución:** Duoc UC

