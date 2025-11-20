# 📸 Instrucciones para Exportar Diagramas a PNG

## Guía Paso a Paso - Versiones Simplificadas

---

## 🎯 Objetivo

Convertir los diagramas Mermaid simplificados (archivos `.md`) a imágenes PNG de alta calidad para tu informe de titulación.

**✨ Nota:** Todos los diagramas han sido simplificados para ser más amigables a la vista y fáciles de entender.

---

## ⚡ Método Rápido: Mermaid Live Editor (RECOMENDADO)

### **Paso 1: Abrir Mermaid Live**
1. Ve a https://mermaid.live/
2. Se abre el editor online

### **Paso 2: Copiar el Código**
1. Abre uno de estos archivos en VS Code:
   - `Diagrama_Secuencia.md`
   - `Diagrama_Arquitectura_MVC.md`
   - `Diagrama_Componentes.md`
   - `Diagrama_Despliegue.md`

2. Busca el bloque que empieza con:
   ````markdown
   ```mermaid
   ````

3. Copia **TODO** el contenido entre ` ```mermaid ` y ` ``` `

### **Paso 3: Pegar en el Editor**
1. En Mermaid Live, borra el ejemplo que aparece
2. Pega tu código copiado
3. El diagrama se genera automáticamente a la derecha

### **Paso 4: Exportar**
1. Click en botón **"Actions"** (esquina superior derecha)
2. Selecciona **"PNG"**
3. Configuración recomendada:
   - **Scale:** 2 (para alta calidad)
   - **Background:** Transparent o White
4. Click **"Download"**

### **Paso 5: Guardar**
Guarda las imágenes con estos nombres:

**Del archivo `Diagrama_Secuencia.md` (3 diagramas):**
- `Diagrama_Secuencia_Login.png` (Diagrama 1)
- `Diagrama_Secuencia_Crear_OT.png` (Diagrama 2)
- `Diagrama_Secuencia_Inventario.png` (Diagrama 3)

**Otros:**
- `Diagrama_Arquitectura_MVC.png`
- `Diagrama_Componentes.png`
- `Diagrama_Despliegue.png`

### **Paso 6: Guardar en la Carpeta**
Mueve todas las imágenes a:
```
docs/arquitectura/
```

---

## 🖼️ Método Alternativo: Screenshot desde GitHub

### **Paso 1: Subir a GitHub**
```bash
git add docs/arquitectura/*.md
git commit -m "Añadir diagramas de arquitectura"
git push
```

### **Paso 2: Abrir en GitHub**
1. Ve a tu repositorio en GitHub
2. Navega a `docs/arquitectura/`
3. Abre cualquier archivo `.md`
4. Los diagramas Mermaid se renderizan automáticamente

### **Paso 3: Screenshot**
1. **Windows:** Presiona `Win + Shift + S`
2. **Mac:** Presiona `Cmd + Shift + 4`
3. Selecciona solo el diagrama
4. Se guarda en portapapeles

### **Paso 4: Guardar**
1. Abre Paint o cualquier editor de imágenes
2. Pega (Ctrl + V)
3. Guarda como PNG con el nombre correspondiente

---

## 💻 Método para Desarrolladores: Mermaid CLI

### **Instalación (Una sola vez)**

```bash
# Instalar Mermaid CLI globalmente
npm install -g @mermaid-js/mermaid-cli
```

### **Uso**

```bash
# Navegar a la carpeta
cd "docs/arquitectura"

# Generar imágenes individuales
mmdc -i Diagrama_Secuencia.md -o Diagrama_Secuencia_Login.png
mmdc -i Diagrama_Arquitectura_MVC.md -o Diagrama_Arquitectura_MVC.png
mmdc -i Diagrama_Componentes.md -o Diagrama_Componentes.png
mmdc -i Diagrama_Despliegue.md -o Diagrama_Despliegue.png
```

### **Configuración Avanzada**

Crear archivo `mermaid-config.json`:

```json
{
  "theme": "default",
  "width": 1920,
  "height": 1080,
  "backgroundColor": "white",
  "scale": 2
}
```

Usar la configuración:

```bash
mmdc -i Diagrama_Secuencia.md -o Diagrama_Secuencia.png -c mermaid-config.json
```

---

## 🎨 Configuración de Calidad

### Para Informe Impreso:
- **Formato:** PNG
- **Resolución:** 300 DPI
- **Scale:** 2x o 3x
- **Background:** White
- **Tamaño:** 1920x1080 px mínimo

### Para Presentación PowerPoint:
- **Formato:** PNG
- **Resolución:** 150-300 DPI
- **Scale:** 2x
- **Background:** Transparent
- **Tamaño:** 1920x1080 px

### Para Visualización Web:
- **Formato:** PNG o SVG
- **Resolución:** 72-150 DPI
- **Scale:** 1x
- **Background:** Transparent

---

## 📋 Checklist de Exportación

Una vez que exportes todo, deberías tener:

### PNG generados:
- [ ] `Diagrama_Secuencia_Login.png`
- [ ] `Diagrama_Secuencia_Crear_OT.png`
- [ ] `Diagrama_Secuencia_Inventario.png`
- [ ] `Diagrama_Arquitectura_MVC.png`
- [ ] `Diagrama_Componentes.png`
- [ ] `Diagrama_Despliegue.png`

### PNG existentes:
- [x] `Diagrama Casos de Uso.png`
- [x] `Diagrama de Clases.png`

### PDF existentes:
- [x] `Diagrama Entidad Relacion.pdf`

**Total final:** 9 diagramas en PNG/PDF

---

## 🎓 Para tu Informe

Una vez que tengas todos los PNG:

1. **Organiza** por capítulo de tu informe
2. **Inserta** las imágenes en Word
3. **Añade** pies de figura:
   - "Figura 4.1: Diagrama de Arquitectura MVC"
   - "Figura 4.2: Diagrama de Secuencia - Autenticación"
   - etc.

4. **Referencia** en el texto:
   - "Como se observa en la Figura 4.1..."
   - "El flujo se detalla en la Figura 4.2..."

---

## 💡 Tips

### Para mejor calidad:
- Usa **Mermaid Live** en lugar de screenshot
- Exporta a **Scale 2x o 3x**
- Usa fondo **blanco** para impresión
- Guarda también en **SVG** (vectorial, editable)

### Para ahorrar tiempo:
- **Screenshot desde GitHub** es la forma más rápida
- Los diagramas se ven profesionales directamente
- Suficiente calidad para informe

### Si tienes problemas:
- Usa GitHub para visualizar
- Si un diagrama no se renderiza, copia el código a Mermaid Live
- Todos los diagramas están probados y funcionan

---

## 🚀 Resumen Rápido

1. **Sube** los archivos `.md` a GitHub
2. **Abre** cada archivo en GitHub
3. **Screenshot** cada diagrama
4. **Guarda** con nombres descriptivos
5. **Usa** en tu informe

**Tiempo total:** ~10-15 minutos para todos los diagramas

---

**Fecha:** 14/10/2025  
**Última actualización:** 14/10/2025

