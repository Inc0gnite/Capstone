# Script simple para convertir archivos Markdown a DOCX
# Usando herramientas online y métodos alternativos

Write-Host "🔄 Iniciando conversión de archivos Markdown a DOCX..." -ForegroundColor Green

# Directorios
$sourceDir = "docs\manuales"
$outputDir = "docs\manuales\docx"

# Crear directorio de salida
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
    Write-Host "📁 Directorio creado: $outputDir" -ForegroundColor Blue
}

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

Write-Host "`n📋 Archivos encontrados en $sourceDir:" -ForegroundColor Cyan
foreach ($file in $files) {
    $filePath = Join-Path $sourceDir $file
    if (Test-Path $filePath) {
        $fileSize = (Get-Item $filePath).Length
        $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
        Write-Host "  ✅ $file ($fileSizeKB KB)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (no encontrado)" -ForegroundColor Red
    }
}

Write-Host "`n💡 Opciones para convertir a DOCX:" -ForegroundColor Yellow
Write-Host "`n1️⃣  MÉTODO RECOMENDADO - Pandoc (requiere instalación):" -ForegroundColor Green
Write-Host "   • Instalar pandoc desde: https://pandoc.org/installing.html" -ForegroundColor White
Write-Host "   • Ejecutar: .\convert_to_docx.ps1" -ForegroundColor White

Write-Host "`n2️⃣  MÉTODO ALTERNATIVO - Python (requiere instalación):" -ForegroundColor Green
Write-Host "   • Instalar Python desde: https://www.python.org/downloads/" -ForegroundColor White
Write-Host "   • Ejecutar: pip install python-docx markdown" -ForegroundColor White
Write-Host "   • Ejecutar: .\convert_to_docx_alternative.ps1" -ForegroundColor White

Write-Host "`n3️⃣  MÉTODO ONLINE - Herramientas web:" -ForegroundColor Green
Write-Host "   • https://pandoc.org/try/ (recomendado)" -ForegroundColor White
Write-Host "   • https://www.markdowntoword.com/" -ForegroundColor White
Write-Host "   • https://word-to-markdown.herokuapp.com/" -ForegroundColor White

Write-Host "`n4️⃣  MÉTODO MANUAL - Microsoft Word:" -ForegroundColor Green
Write-Host "   • Abrir cada archivo .md en un editor de texto" -ForegroundColor White
Write-Host "   • Copiar el contenido" -ForegroundColor White
Write-Host "   • Pegar en Microsoft Word" -ForegroundColor White
Write-Host "   • Guardar como .docx" -ForegroundColor White

# Crear archivo de instrucciones detalladas
$instructions = @"
# 📋 Instrucciones para Convertir Archivos Markdown a DOCX

## 🎯 Objetivo
Convertir todos los archivos de documentación técnica de formato Markdown (.md) a Microsoft Word (.docx).

## 📁 Archivos a Convertir
- AJUSTES_MEJORAS_SISTEMA.md
- CHANGELOG.md
- COMENTARIOS_README_CODIGO.md
- DIAGRAMAS_UML_TECNICOS.md
- EVIDENCIA_INTEGRACION_MODULOS.md
- GUIA_INSTALACION_COMPLETA.md
- INFORME_CONTROL_AVANCES.md
- MANUAL_DESARROLLADOR_ARQUITECTURA.md
- PRUEBAS_INTERNAS.md

## 🛠️ Métodos de Conversión

### Método 1: Pandoc (Recomendado)
1. Instalar pandoc desde: https://pandoc.org/installing.html
2. Ejecutar: .\convert_to_docx.ps1
3. Los archivos se guardarán en: docs\manuales\docx\

### Método 2: Python
1. Instalar Python desde: https://www.python.org/downloads/
2. Instalar dependencias: pip install python-docx markdown
3. Ejecutar: .\convert_to_docx_alternative.ps1

### Método 3: Online (Pandoc Try)
1. Ir a: https://pandoc.org/try/
2. Seleccionar "From: markdown" y "To: docx"
3. Copiar el contenido de cada archivo .md
4. Pegar en el editor online
5. Descargar el archivo .docx resultante

### Método 4: Manual con Word
1. Abrir cada archivo .md en un editor de texto
2. Copiar todo el contenido
3. Abrir Microsoft Word
4. Pegar el contenido
5. Aplicar formato (títulos, listas, etc.)
6. Guardar como .docx

## 📊 Resultado Esperado
- 9 archivos .docx en la carpeta docs\manuales\docx\
- Formato profesional con títulos, listas y tablas
- Compatible con Microsoft Word
- Listo para presentaciones o impresión

## 🔧 Solución de Problemas

### Error: "pandoc no se reconoce como comando"
- Instalar pandoc y reiniciar la terminal
- Verificar que pandoc esté en el PATH del sistema

### Error: "python no se reconoce como comando"
- Instalar Python y marcar "Add to PATH" durante la instalación
- Reiniciar la terminal después de la instalación

### Error: "pip no se reconoce como comando"
- Usar: python -m pip install python-docx markdown
- O instalar pip por separado

## 📞 Soporte
Si tienes problemas con la conversión, contacta al equipo de desarrollo:
- Joaquín Marín (Frontend)
- Benjamin Vilches (Backend)
"@

$instructions | Out-File -FilePath "INSTRUCCIONES_CONVERSION_DOCX.md" -Encoding UTF8

Write-Host "`n📝 Archivo de instrucciones creado: INSTRUCCIONES_CONVERSION_DOCX.md" -ForegroundColor Blue

# Crear script de verificación
$verificationScript = @"
# Script de verificación de archivos convertidos
Write-Host "🔍 Verificando archivos convertidos..." -ForegroundColor Green

`$outputDir = "docs\manuales\docx"
`$expectedFiles = @(
    "AJUSTES_MEJORAS_SISTEMA.docx",
    "CHANGELOG.docx",
    "COMENTARIOS_README_CODIGO.docx",
    "DIAGRAMAS_UML_TECNICOS.docx",
    "EVIDENCIA_INTEGRACION_MODULOS.docx",
    "GUIA_INSTALACION_COMPLETA.docx",
    "INFORME_CONTROL_AVANCES.docx",
    "MANUAL_DESARROLLADOR_ARQUITECTURA.docx",
    "PRUEBAS_INTERNAS.docx"
)

`$foundCount = 0
`$totalSize = 0

foreach (`$file in `$expectedFiles) {
    `$filePath = Join-Path `$outputDir `$file
    if (Test-Path `$filePath) {
        `$fileSize = (Get-Item `$filePath).Length
        `$fileSizeKB = [math]::Round(`$fileSize / 1KB, 2)
        `$totalSize += `$fileSize
        Write-Host "  ✅ `$file (`$fileSizeKB KB)" -ForegroundColor Green
        `$foundCount++
    } else {
        Write-Host "  ❌ `$file (no encontrado)" -ForegroundColor Red
    }
}

`$totalSizeMB = [math]::Round(`$totalSize / 1MB, 2)
Write-Host "`n📊 Resumen:" -ForegroundColor Cyan
Write-Host "  Archivos encontrados: `$foundCount/`$(`$expectedFiles.Count)" -ForegroundColor White
Write-Host "  Tamaño total: `$totalSizeMB MB" -ForegroundColor White

if (`$foundCount -eq `$expectedFiles.Count) {
    Write-Host "`n🎉 ¡Todos los archivos convertidos exitosamente!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Faltan algunos archivos por convertir" -ForegroundColor Yellow
}
"@

$verificationScript | Out-File -FilePath "verificar_conversion.ps1" -Encoding UTF8

Write-Host "`n📝 Script de verificación creado: verificar_conversion.ps1" -ForegroundColor Blue

Write-Host "`n🎯 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Elige un método de conversión de los listados arriba" -ForegroundColor White
Write-Host "2. Ejecuta el método seleccionado" -ForegroundColor White
Write-Host "3. Verifica los resultados con: .\verificar_conversion.ps1" -ForegroundColor White
Write-Host "4. Los archivos .docx estarán en: $outputDir" -ForegroundColor White

# Abrir carpeta de archivos fuente
Write-Host "`n📂 Abriendo carpeta de archivos fuente..." -ForegroundColor Blue
Start-Process explorer.exe -ArgumentList (Resolve-Path $sourceDir)









