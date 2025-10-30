# Script alternativo para convertir archivos Markdown a DOCX
# Usando Python con python-docx y markdown

Write-Host "🔄 Iniciando conversión alternativa de archivos Markdown a DOCX..." -ForegroundColor Green

# Verificar si Python está instalado
try {
    $pythonVersion = python --version
    Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Python no está instalado. Por favor instala Python desde: https://www.python.org/downloads/" -ForegroundColor Red
    exit 1
}

# Crear script Python para la conversión
$pythonScript = @"
import os
import re
from pathlib import Path
import markdown
from docx import Document
from docx.shared import Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE

def markdown_to_docx(md_file, docx_file):
    '''Convierte un archivo Markdown a DOCX'''
    
    # Leer archivo Markdown
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Crear documento Word
    doc = Document()
    
    # Configurar estilos
    styles = doc.styles
    
    # Estilo para títulos
    if 'Heading 1' not in [style.name for style in styles]:
        heading1_style = styles.add_style('Heading 1', WD_STYLE_TYPE.PARAGRAPH)
        heading1_style.font.size = Inches(0.25)
        heading1_style.font.bold = True
    
    # Dividir contenido por líneas
    lines = md_content.split('\n')
    
    for line in lines:
        line = line.strip()
        
        if not line:
            # Línea vacía
            doc.add_paragraph()
            continue
            
        # Títulos
        if line.startswith('#'):
            level = len(line) - len(line.lstrip('#'))
            title_text = line.lstrip('#').strip()
            
            if level == 1:
                heading = doc.add_heading(title_text, level=1)
            elif level == 2:
                heading = doc.add_heading(title_text, level=2)
            elif level == 3:
                heading = doc.add_heading(title_text, level=3)
            else:
                heading = doc.add_heading(title_text, level=4)
                
        # Listas
        elif line.startswith('- ') or line.startswith('* '):
            item_text = line[2:].strip()
            doc.add_paragraph(item_text, style='List Bullet')
            
        elif re.match(r'^\d+\.', line):
            item_text = re.sub(r'^\d+\.\s*', '', line)
            doc.add_paragraph(item_text, style='List Number')
            
        # Código
        elif line.startswith('```'):
            continue  # Saltar líneas de código por ahora
            
        # Tablas (básico)
        elif '|' in line and line.count('|') > 1:
            # Procesar tabla
            cells = [cell.strip() for cell in line.split('|') if cell.strip()]
            if cells and not all(cell.startswith('-') for cell in cells):
                # Crear tabla
                table = doc.add_table(rows=1, cols=len(cells))
                table.style = 'Table Grid'
                hdr_cells = table.rows[0].cells
                for i, cell in enumerate(cells):
                    hdr_cells[i].text = cell
                    
        # Texto normal
        else:
            if line:
                # Procesar texto con formato básico
                paragraph = doc.add_paragraph()
                
                # Buscar texto en negrita
                parts = re.split(r'(\*\*.*?\*\*)', line)
                for part in parts:
                    if part.startswith('**') and part.endswith('**'):
                        run = paragraph.add_run(part[2:-2])
                        run.bold = True
                    else:
                        paragraph.add_run(part)
    
    # Guardar documento
    doc.save(docx_file)
    return True

def main():
    # Directorios
    source_dir = Path('docs/manuales')
    output_dir = Path('docs/manuales/docx')
    
    # Crear directorio de salida
    output_dir.mkdir(exist_ok=True)
    
    # Archivos a convertir
    files = [
        'AJUSTES_MEJORAS_SISTEMA.md',
        'CHANGELOG.md', 
        'COMENTARIOS_README_CODIGO.md',
        'DIAGRAMAS_UML_TECNICOS.md',
        'EVIDENCIA_INTEGRACION_MODULOS.md',
        'GUIA_INSTALACION_COMPLETA.md',
        'INFORME_CONTROL_AVANCES.md',
        'MANUAL_DESARROLLADOR_ARQUITECTURA.md',
        'PRUEBAS_INTERNAS.md'
    ]
    
    success_count = 0
    error_count = 0
    
    print(f"🔄 Convirtiendo {len(files)} archivos...")
    
    for file in files:
        input_file = source_dir / file
        output_file = output_dir / file.replace('.md', '.docx')
        
        if input_file.exists():
            try:
                print(f"🔄 Convirtiendo: {file}")
                markdown_to_docx(input_file, output_file)
                
                if output_file.exists():
                    file_size = output_file.stat().st_size
                    file_size_kb = round(file_size / 1024, 2)
                    print(f"  ✅ Convertido: {file.replace('.md', '.docx')} ({file_size_kb} KB)")
                    success_count += 1
                else:
                    print(f"  ❌ Error: Archivo no se creó")
                    error_count += 1
                    
            except Exception as e:
                print(f"  ❌ Error al convertir {file}: {str(e)}")
                error_count += 1
        else:
            print(f"  ⚠️  Archivo no encontrado: {input_file}")
            error_count += 1
    
    print(f"\n📊 Resumen:")
    print(f"  ✅ Exitosos: {success_count}")
    print(f"  ❌ Errores: {error_count}")
    print(f"  📁 Archivos guardados en: {output_dir}")

if __name__ == "__main__":
    main()
"@

# Guardar script Python
$pythonScript | Out-File -FilePath "convert_markdown_to_docx.py" -Encoding UTF8

Write-Host "📝 Script Python creado: convert_markdown_to_docx.py" -ForegroundColor Blue

# Instalar dependencias necesarias
Write-Host "`n📦 Instalando dependencias de Python..." -ForegroundColor Yellow
try {
    pip install python-docx markdown
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al instalar dependencias. Ejecuta manualmente: pip install python-docx markdown" -ForegroundColor Red
}

# Ejecutar conversión
Write-Host "`n🚀 Ejecutando conversión..." -ForegroundColor Yellow
try {
    python convert_markdown_to_docx.py
} catch {
    Write-Host "❌ Error al ejecutar el script de conversión" -ForegroundColor Red
}

Write-Host "`n💡 Alternativa: Puedes usar herramientas online como:" -ForegroundColor Cyan
Write-Host "  • https://pandoc.org/try/" -ForegroundColor White
Write-Host "  • https://www.markdowntoword.com/" -ForegroundColor White
Write-Host "  • https://word-to-markdown.herokuapp.com/" -ForegroundColor White









