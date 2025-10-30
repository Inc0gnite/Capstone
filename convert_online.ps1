# Script para convertir archivos Markdown a DOCX usando herramientas online

Write-Host "Iniciando conversion online de archivos Markdown a DOCX..." -ForegroundColor Green

# Directorios
$sourceDir = "docs\manuales"
$outputDir = "docs\manuales\docx"

# Lista de archivos
$files = @(
    "AJUSTES_MEJORAS_SISTEMA.md",
    "CHANGELOG.md", 
    "COMENTARIOS_README_CODIGO.md",
    "DIAGRAMAS_UML_TECNICOS.md",
    "EVIDENCIA_INTEGRACION_MODULOS.md",
    "GUIA_INSTALACION_COMPLETA.md",
    "INFORME_CONTROL_AVANCES.md",
    "MANUAL_DESARROLLADOR_ARQUITECTURA.md",
    "PRUEBAS_INTERNAS.md"
)

Write-Host ""
Write-Host "Archivos a convertir:" -ForegroundColor Cyan
foreach ($file in $files) {
    $filePath = Join-Path $sourceDir $file
    if (Test-Path $filePath) {
        $fileSize = (Get-Item $filePath).Length
        $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
        Write-Host "  $file ($fileSizeKB KB)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Abriendo herramientas online para conversion..." -ForegroundColor Yellow

# Abrir Pandoc Try (recomendado)
Write-Host "1. Abriendo Pandoc Try (recomendado)..." -ForegroundColor Green
Start-Process "https://pandoc.org/try/"

# Abrir Markdown to Word
Write-Host "2. Abriendo Markdown to Word..." -ForegroundColor Green
Start-Process "https://www.markdowntoword.com/"

# Abrir carpeta de archivos fuente
Write-Host "3. Abriendo carpeta de archivos fuente..." -ForegroundColor Green
Start-Process explorer.exe -ArgumentList (Resolve-Path $sourceDir)

# Abrir carpeta de destino
Write-Host "4. Abriendo carpeta de destino..." -ForegroundColor Green
Start-Process explorer.exe -ArgumentList (Resolve-Path $outputDir)

Write-Host ""
Write-Host "INSTRUCCIONES PARA CONVERSION ONLINE:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. En Pandoc Try:" -ForegroundColor White
Write-Host "   - Selecciona 'From: markdown'" -ForegroundColor Gray
Write-Host "   - Selecciona 'To: docx'" -ForegroundColor Gray
Write-Host "   - Copia el contenido de cada archivo .md" -ForegroundColor Gray
Write-Host "   - Pega en el editor online" -ForegroundColor Gray
Write-Host "   - Descarga el archivo .docx resultante" -ForegroundColor Gray
Write-Host ""
Write-Host "2. En Markdown to Word:" -ForegroundColor White
Write-Host "   - Arrastra y suelta cada archivo .md" -ForegroundColor Gray
Write-Host "   - Descarga el archivo .docx resultante" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Guarda todos los archivos .docx en:" -ForegroundColor White
Write-Host "   $outputDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Verifica la conversion con:" -ForegroundColor White
Write-Host "   .\verificar_conversion.ps1" -ForegroundColor Cyan

# Crear archivo de instrucciones detalladas
$instructions = @"
# Instrucciones Detalladas para Conversion Online

## Herramientas Online Disponibles

### 1. Pandoc Try (Recomendado)
- URL: https://pandoc.org/try/
- Ventajas: Mas opciones de formato, mejor calidad
- Instrucciones:
  1. Selecciona "From: markdown"
  2. Selecciona "To: docx"
  3. Copia el contenido de cada archivo .md
  4. Pega en el editor online
  5. Descarga el archivo .docx resultante

### 2. Markdown to Word
- URL: https://www.markdowntoword.com/
- Ventajas: Mas simple, arrastrar y soltar
- Instrucciones:
  1. Arrastra y suelta cada archivo .md
  2. Descarga el archivo .docx resultante

## Archivos a Convertir

1. AJUSTES_MEJORAS_SISTEMA.md (33.38 KB)
2. CHANGELOG.md (16.09 KB)
3. COMENTARIOS_README_CODIGO.md (25.28 KB)
4. DIAGRAMAS_UML_TECNICOS.md (31.64 KB)
5. EVIDENCIA_INTEGRACION_MODULOS.md (35.2 KB)
6. GUIA_INSTALACION_COMPLETA.md (24.72 KB)
7. INFORME_CONTROL_AVANCES.md (25.92 KB)
8. MANUAL_DESARROLLADOR_ARQUITECTURA.md (24.16 KB)
9. PRUEBAS_INTERNAS.md (32.15 KB)

## Proceso de Conversion

### Paso 1: Preparacion
- Abrir la herramienta online seleccionada
- Tener listos los archivos .md en la carpeta docs\manuales

### Paso 2: Conversion
- Para cada archivo .md:
  1. Abrir el archivo en un editor de texto
  2. Copiar todo el contenido (Ctrl+A, Ctrl+C)
  3. Pegar en la herramienta online
  4. Descargar el archivo .docx resultante
  5. Guardar en la carpeta docs\manuales\docx

### Paso 3: Verificacion
- Verificar que todos los archivos .docx se hayan creado
- Comprobar que el formato se vea correctamente
- Ejecutar: .\verificar_conversion.ps1

## Consejos para Mejor Conversion

### Formato de Titulos
- Los titulos con # se convertiran a estilos de Word
- Usar # para titulo principal, ## para subtitulos, etc.

### Listas
- Las listas con - o * se convertiran a listas con viñetas
- Las listas numeradas se convertiran a listas numeradas

### Codigo
- Los bloques de codigo con ``` se convertiran a texto con formato
- El codigo inline con ` se convertiran a texto con formato

### Tablas
- Las tablas en Markdown se convertiran a tablas de Word
- Verificar que las tablas se vean correctamente

## Solucion de Problemas

### Si la conversion no funciona:
1. Verificar que el archivo .md no tenga caracteres especiales
2. Intentar con una herramienta online diferente
3. Convertir archivo por archivo en lugar de todos juntos

### Si el formato no se ve bien:
1. Ajustar manualmente en Word después de la conversion
2. Usar estilos de Word para mejorar el formato
3. Revisar que las tablas y listas se vean correctamente

## Resultado Esperado
- 9 archivos .docx en la carpeta docs\manuales\docx
- Formato profesional con titulos, listas y tablas
- Compatible con Microsoft Word
- Listo para presentaciones o impresion
"@

$instructions | Out-File -FilePath "INSTRUCCIONES_CONVERSION_ONLINE.md" -Encoding UTF8

Write-Host ""
Write-Host "Archivo de instrucciones detalladas creado: INSTRUCCIONES_CONVERSION_ONLINE.md" -ForegroundColor Blue

Write-Host ""
Write-Host "¡Conversion online iniciada!" -ForegroundColor Green
Write-Host "Sigue las instrucciones en las ventanas abiertas para completar la conversion." -ForegroundColor Yellow









