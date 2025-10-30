# Script para convertir archivos Markdown a DOCX
# Requiere pandoc instalado

Write-Host "🔄 Iniciando conversión de archivos Markdown a DOCX..." -ForegroundColor Green

# Verificar si pandoc está instalado
try {
    $pandocVersion = pandoc --version
    Write-Host "✅ Pandoc encontrado: $($pandocVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Pandoc no está instalado. Por favor instala pandoc desde: https://pandoc.org/installing.html" -ForegroundColor Red
    Write-Host "💡 Alternativa: Puedes usar pandoc online en: https://pandoc.org/try/" -ForegroundColor Yellow
    exit 1
}

# Directorio de origen y destino
$sourceDir = "docs\manuales"
$outputDir = "docs\manuales\docx"

# Crear directorio de salida si no existe
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
    Write-Host "📁 Directorio creado: $outputDir" -ForegroundColor Blue
}

# Lista de archivos a convertir
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

$successCount = 0
$errorCount = 0

Write-Host "`n📋 Archivos a convertir:" -ForegroundColor Cyan
foreach ($file in $files) {
    Write-Host "  • $file" -ForegroundColor White
}

Write-Host "`n🚀 Iniciando conversión..." -ForegroundColor Yellow

foreach ($file in $files) {
    $inputFile = Join-Path $sourceDir $file
    $outputFile = Join-Path $outputDir ($file -replace '\.md$', '.docx')
    
    if (Test-Path $inputFile) {
        try {
            Write-Host "`n🔄 Convirtiendo: $file" -ForegroundColor Blue
            
            # Comando pandoc con opciones para mejorar el formato
            $pandocArgs = @(
                $inputFile,
                "-o", $outputFile,
                "--from", "markdown",
                "--to", "docx",
                "--reference-doc=template.docx",  # Si tienes una plantilla
                "--toc",                          # Tabla de contenidos
                "--toc-depth=3",                  # Profundidad del TOC
                "--highlight-style=github",       # Estilo de resaltado de código
                "--metadata", "title=$($file -replace '\.md$', '')",
                "--metadata", "author=Joaquín Marín & Benjamin Vilches",
                "--metadata", "date=$(Get-Date -Format 'yyyy-MM-dd')"
            )
            
            # Ejecutar pandoc
            & pandoc $pandocArgs
            
            if (Test-Path $outputFile) {
                $fileSize = (Get-Item $outputFile).Length
                $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
                Write-Host "  ✅ Convertido exitosamente: $($file -replace '\.md$', '.docx') ($fileSizeKB KB)" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "  ❌ Error: Archivo no se creó" -ForegroundColor Red
                $errorCount++
            }
        } catch {
            Write-Host "  ❌ Error al convertir $file`: $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
    } else {
        Write-Host "  ⚠️  Archivo no encontrado: $inputFile" -ForegroundColor Yellow
        $errorCount++
    }
}

# Resumen final
Write-Host "`n📊 Resumen de conversión:" -ForegroundColor Cyan
Write-Host "  ✅ Exitosos: $successCount" -ForegroundColor Green
Write-Host "  ❌ Errores: $errorCount" -ForegroundColor Red
Write-Host "  📁 Archivos guardados en: $outputDir" -ForegroundColor Blue

if ($successCount -gt 0) {
    Write-Host "`n🎉 Conversión completada!" -ForegroundColor Green
    Write-Host "💡 Los archivos DOCX están listos para usar en Microsoft Word" -ForegroundColor Yellow
}

# Abrir carpeta de destino
if (Test-Path $outputDir) {
    Write-Host "`n📂 Abriendo carpeta de destino..." -ForegroundColor Blue
    Start-Process explorer.exe -ArgumentList $outputDir
}









