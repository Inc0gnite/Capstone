# Script de verificacion de archivos convertidos
Write-Host "Verificando archivos convertidos..." -ForegroundColor Green

$outputDir = "docs\manuales\docx"
$expectedFiles = @(
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

$foundCount = 0
$totalSize = 0

Write-Host ""
Write-Host "Archivos esperados:" -ForegroundColor Cyan

foreach ($file in $expectedFiles) {
    $filePath = Join-Path $outputDir $file
    if (Test-Path $filePath) {
        $fileSize = (Get-Item $filePath).Length
        $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
        $totalSize += $fileSize
        Write-Host "  OK $file ($fileSizeKB KB)" -ForegroundColor Green
        $foundCount++
    } else {
        Write-Host "  ERROR $file (no encontrado)" -ForegroundColor Red
    }
}

$totalSizeMB = [math]::Round($totalSize / 1MB, 2)
Write-Host ""
Write-Host "Resumen:" -ForegroundColor Cyan
Write-Host "  Archivos encontrados: $foundCount/$($expectedFiles.Count)" -ForegroundColor White
Write-Host "  Tamaño total: $totalSizeMB MB" -ForegroundColor White

if ($foundCount -eq $expectedFiles.Count) {
    Write-Host ""
    Write-Host "¡Todos los archivos convertidos exitosamente!" -ForegroundColor Green
    Write-Host "Los archivos .docx están listos para usar en Microsoft Word." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Faltan algunos archivos por convertir:" -ForegroundColor Yellow
    $missingFiles = @()
    foreach ($file in $expectedFiles) {
        $filePath = Join-Path $outputDir $file
        if (!(Test-Path $filePath)) {
            $missingFiles += $file
        }
    }
    Write-Host "Archivos faltantes:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "  - $file" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Para completar la conversion:" -ForegroundColor Yellow
    Write-Host "1. Ejecuta: .\convert_online.ps1" -ForegroundColor White
    Write-Host "2. Sigue las instrucciones en las ventanas abiertas" -ForegroundColor White
    Write-Host "3. Vuelve a ejecutar este script para verificar" -ForegroundColor White
}

Write-Host ""
Write-Host "Ubicacion de archivos convertidos: $outputDir" -ForegroundColor Blue

# Abrir carpeta de archivos convertidos si existen
if ($foundCount -gt 0) {
    Write-Host ""
    Write-Host "Abriendo carpeta de archivos convertidos..." -ForegroundColor Blue
    Start-Process explorer.exe -ArgumentList (Resolve-Path $outputDir)
}