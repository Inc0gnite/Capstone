# Script simple para convertir archivos Markdown a DOCX

Write-Host "Iniciando conversion de archivos Markdown a DOCX..." -ForegroundColor Green

# Directorios
$sourceDir = "docs\manuales"
$outputDir = "docs\manuales\docx"

# Crear directorio de salida
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
    Write-Host "Directorio creado: $outputDir" -ForegroundColor Blue
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

Write-Host ""
Write-Host "Archivos encontrados:" -ForegroundColor Cyan
foreach ($file in $files) {
    $filePath = Join-Path $sourceDir $file
    if (Test-Path $filePath) {
        $fileSize = (Get-Item $filePath).Length
        $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
        Write-Host "  OK $file ($fileSizeKB KB)" -ForegroundColor Green
    } else {
        Write-Host "  ERROR $file (no encontrado)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Opciones para convertir a DOCX:" -ForegroundColor Yellow

Write-Host ""
Write-Host "1. METODO RECOMENDADO - Pandoc:" -ForegroundColor Green
Write-Host "   - Instalar pandoc desde: https://pandoc.org/installing.html" -ForegroundColor White
Write-Host "   - Ejecutar: .\convert_to_docx.ps1" -ForegroundColor White

Write-Host ""
Write-Host "2. METODO ALTERNATIVO - Python:" -ForegroundColor Green
Write-Host "   - Instalar Python desde: https://www.python.org/downloads/" -ForegroundColor White
Write-Host "   - Ejecutar: pip install python-docx markdown" -ForegroundColor White
Write-Host "   - Ejecutar: .\convert_to_docx_alternative.ps1" -ForegroundColor White

Write-Host ""
Write-Host "3. METODO ONLINE - Herramientas web:" -ForegroundColor Green
Write-Host "   - https://pandoc.org/try/ (recomendado)" -ForegroundColor White
Write-Host "   - https://www.markdowntoword.com/" -ForegroundColor White

Write-Host ""
Write-Host "4. METODO MANUAL - Microsoft Word:" -ForegroundColor Green
Write-Host "   - Abrir cada archivo .md en un editor de texto" -ForegroundColor White
Write-Host "   - Copiar el contenido" -ForegroundColor White
Write-Host "   - Pegar en Microsoft Word" -ForegroundColor White
Write-Host "   - Guardar como .docx" -ForegroundColor White

Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "1. Elige un metodo de conversion de los listados arriba" -ForegroundColor White
Write-Host "2. Ejecuta el metodo seleccionado" -ForegroundColor White
Write-Host "3. Los archivos .docx estaran en: $outputDir" -ForegroundColor White

# Abrir carpeta de archivos fuente
Write-Host ""
Write-Host "Abriendo carpeta de archivos fuente..." -ForegroundColor Blue
Start-Process explorer.exe -ArgumentList (Resolve-Path $sourceDir)









