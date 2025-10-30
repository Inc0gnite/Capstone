# 📐 Diagramas de Arquitectura

## Sistema de Gestión de Flota PepsiCo Chile

Esta carpeta contiene todos los diagramas técnicos del sistema organizados por tipo y propósito.

---

## 📊 Diagramas Disponibles

### 🎭 **ANÁLISIS DE REQUERIMIENTOS**

| Diagrama | Archivo | Formato | Estado |
|----------|---------|---------|--------|
| **Casos de Uso** | `Diagrama Casos de Uso.png` | PNG | ✅ |
| **Casos de Uso (docs)** | Ver también: `../casos-uso/` | MD | ✅ |

**Propósito:** Mostrar interacciones entre usuarios y sistema

**Incluye:**
- 10 actores del sistema
- 43 casos de uso
- Relaciones include/extend
- Límites del sistema

---

### 🎨 **DISEÑO DE DATOS**

| Diagrama | Archivo | Formato | Estado |
|----------|---------|---------|--------|
| **Diagrama de Clases** | `Diagrama de Clases.png` | PNG | ✅ |
| **Diagrama Entidad-Relación** | `Diagrama Entidad Relacion.pdf` | PDF | ✅ |

**Propósito:** Modelar la estructura de datos del sistema

**Incluye:**
- 9 clases/entidades principales
- Atributos y métodos
- Relaciones y cardinalidades
- Restricciones y validaciones

---

### 🔄 **DISEÑO DE COMPORTAMIENTO**

| Diagrama | Archivo | Formato | Estado |
|----------|---------|---------|--------|
| **Diagramas de Secuencia** | `Diagrama_Secuencia.md` | Mermaid | ✅ |

**Propósito:** Mostrar flujos de comunicación entre objetos

**Incluye 3 secuencias:**
1. **Autenticación de Usuario** - Login con JWT
2. **Crear Orden de Trabajo** - Flujo completo con notificaciones
3. **Gestión de Inventario** - Solicitud y entrega de repuestos

---

### 🏗️ **DISEÑO DE ARQUITECTURA**

| Diagrama | Archivo | Formato | Estado |
|----------|---------|---------|--------|
| **Arquitectura MVC** | `Diagrama_Arquitectura_MVC.md` | Mermaid | ✅ |
| **Diagrama de Componentes** | `Diagrama_Componentes.md` | Mermaid | ✅ |

**Propósito:** Mostrar estructura del sistema

**Incluye:**
- Patrón MVC (Modelo-Vista-Controlador)
- Arquitectura de 3 capas
- Componentes internos
- Tecnologías por capa
- Separación de responsabilidades

---

### 🚀 **DISEÑO DE DESPLIEGUE**

| Diagrama | Archivo | Formato | Estado |
|----------|---------|---------|--------|
| **Diagrama de Despliegue** | `Diagrama_Despliegue.md` | Mermaid | ✅ |

**Propósito:** Mostrar infraestructura física/cloud

**Incluye:**
- Vercel CDN (Frontend)
- Railway/Render (Backend)
- Neon/Supabase (Database)
- Cloudinary (Imágenes)
- Gmail SMTP (Emails)
- GitHub Actions (CI/CD)
- Entornos (Dev, Staging, Production)

---

## 📊 Resumen de Diagramas

### Por Tipo UML

| Tipo de Diagrama | Cantidad | Archivos | Complejidad |
|------------------|----------|----------|-------------|
| **Casos de Uso** | 1 | PNG | ✅ Simple |
| **Clases** | 1 | PNG | ✅ Simple |
| **Entidad-Relación** | 1 | PDF | ✅ Simple |
| **Secuencia** | 3 | MD (Mermaid) | ✅ **Simplificado** |
| **Componentes** | 1 | MD (Mermaid) | ✅ **Simplificado** |
| **Despliegue** | 1 | MD (Mermaid) | ✅ **Simplificado** |
| **Arquitectura MVC** | 1 | MD (Mermaid) | ✅ **Simplificado** |

**Total:** 9 diagramas - **Todos optimizados para fácil comprensión**

---

### Por Fase del Proyecto

| Fase | Diagramas |
|------|-----------|
| **Análisis** | Casos de Uso |
| **Diseño** | Clases, ER, Secuencia, Arquitectura, Componentes, Despliegue |

---

## 🎨 Cómo Visualizar

### **Diagramas PNG/PDF** (Ya listos)
- `Diagrama Casos de Uso.png` → Abrir directamente
- `Diagrama de Clases.png` → Abrir directamente
- `Diagrama Entidad Relacion.pdf` → Abrir con PDF viewer

---

### **Diagramas Mermaid (.md)** (Se visualizan automáticamente)

#### **Opción 1: GitHub** (Recomendado)
1. Sube los archivos a GitHub
2. Abre cualquier archivo `.md`
3. Los diagramas se renderizan automáticamente como imágenes ✨

**Archivos Mermaid:**
- `Diagrama_Secuencia.md`
- `Diagrama_Arquitectura_MVC.md`
- `Diagrama_Componentes.md`
- `Diagrama_Despliegue.md`

---

#### **Opción 2: VS Code**
1. Instala extensión "Markdown Preview Mermaid Support"
2. Abre el archivo `.md`
3. Presiona `Ctrl+Shift+V` (Preview)
4. Los diagramas aparecen automáticamente

---

#### **Opción 3: Mermaid Live Editor**
1. Ve a https://mermaid.live/
2. Copia el código Mermaid del archivo
3. Pega en el editor
4. El diagrama se muestra automáticamente
5. Click "Actions" → "Export PNG" (300 DPI)

---

## 🖼️ Generar Imágenes PNG

### **Método 1: Screenshot desde GitHub** (Más rápido)
1. Sube archivos a GitHub
2. Abre el archivo `.md` en GitHub
3. Los diagramas se renderizan
4. Screenshot (Win + Shift + S)
5. Pega en Word/PowerPoint

---

### **Método 2: Mermaid Live** (Mejor calidad)
1. Abre https://mermaid.live/
2. Copia el código del diagrama
3. Pega en el editor
4. Click "Actions"
5. "Export PNG" (selecciona 300 DPI para informe)
6. Guarda como:
   - `Diagrama_Secuencia_Login.png`
   - `Diagrama_Secuencia_Crear_OT.png`
   - `Diagrama_Secuencia_Inventario.png`
   - `Diagrama_Arquitectura_MVC.png`
   - `Diagrama_Componentes.png`
   - `Diagrama_Despliegue.png`

---

### **Método 3: Mermaid CLI** (Automático)

```bash
# Instalar (una sola vez)
npm install -g @mermaid-js/mermaid-cli

# Generar todas las imágenes
cd "docs/arquitectura"

mmdc -i Diagrama_Secuencia.md -o Diagrama_Secuencia_Login.png
mmdc -i Diagrama_Arquitectura_MVC.md -o Diagrama_Arquitectura_MVC.png
mmdc -i Diagrama_Componentes.md -o Diagrama_Componentes.png
mmdc -i Diagrama_Despliegue.md -o Diagrama_Despliegue.png
```

---

## 📁 Estructura Recomendada

### Después de Generar PNGs:

```
docs/arquitectura/
├── README.md                              ← Este archivo
│
├── [PNG/PDF - Listos para informe]
├── Diagrama Casos de Uso.png              ✅
├── Diagrama de Clases.png                 ✅
├── Diagrama Entidad Relacion.pdf          ✅
├── Diagrama_Secuencia_Login.png           ⏳ Generar
├── Diagrama_Secuencia_Crear_OT.png        ⏳ Generar
├── Diagrama_Secuencia_Inventario.png      ⏳ Generar
├── Diagrama_Arquitectura_MVC.png          ⏳ Generar
├── Diagrama_Componentes.png               ⏳ Generar
├── Diagrama_Despliegue.png                ⏳ Generar
│
└── [Archivos fuente - Mermaid editables]
    ├── Diagrama_Secuencia.md               ✅
    ├── Diagrama_Arquitectura_MVC.md        ✅
    ├── Diagrama_Componentes.md             ✅
    └── Diagrama_Despliegue.md              ✅
```

---

## 🎯 Uso en Informe de Titulación

### Capítulo 4: Diseño del Sistema

**4.1 Arquitectura General**
- Usar: `Diagrama_Arquitectura_MVC.png`
- Descripción: Patrón MVC y 3 capas

**4.2 Diseño de Componentes**
- Usar: `Diagrama_Componentes.png`
- Descripción: Estructura interna del sistema

**4.3 Modelo de Datos**
- Usar: `Diagrama de Clases.png`
- Usar: `Diagrama Entidad Relacion.pdf`

**4.4 Diseño Dinámico (Comportamiento)**
- Usar: `Diagrama_Secuencia_Login.png`
- Usar: `Diagrama_Secuencia_Crear_OT.png`
- Descripción: Flujos principales del sistema

**4.5 Infraestructura de Despliegue**
- Usar: `Diagrama_Despliegue.png`
- Descripción: Arquitectura cloud

---

## ✅ Checklist de Diagramas

### Obligatorios (Para aprobar):
- [x] Diagrama de Casos de Uso
- [x] Diagrama de Clases
- [x] Diagrama Entidad-Relación
- [x] Diagrama de Secuencia (al menos 1)
- [x] Diagrama de Arquitectura

**Mínimo:** 5/5 = ✅ **100%**

### Recomendados (Para destacar):
- [x] Diagrama de Componentes
- [x] Diagrama de Despliegue
- [x] Múltiples secuencias (3)

**Adicionales:** 3/3 = ✅ **100%**

---

## 📝 Próximos Pasos

1. **Visualiza** los archivos `.md` en GitHub o VS Code
2. **Exporta** a PNG usando Mermaid Live
3. **Guarda** los PNG en esta carpeta
4. **Usa** los PNG en tu informe

---

**Total de Diagramas:** 9  
**Formatos:** PNG (3), PDF (1), Mermaid (4)  
**Estado:** ✅ Completo  
**Listos para:** Informe de Titulación

**Fecha:** 14/10/2025  
**Autor:** Equipo de Desarrollo PepsiCo Fleet Management

