# Script para crear archivos .env desde los ejemplos
# Ejecutar: powershell -ExecutionPolicy Bypass -File setup-env.ps1

Write-Host "📝 Creando archivos .env..." -ForegroundColor Cyan

# Backend .env
if (Test-Path "backend\.env") {
    Write-Host "⚠️  backend\.env ya existe, omitiendo..." -ForegroundColor Yellow
} else {
    if (Test-Path "backend\env.example.txt") {
        Copy-Item "backend\env.example.txt" "backend\.env"
        Write-Host "✅ Creado backend\.env" -ForegroundColor Green
    } else {
        Write-Host "❌ backend\env.example.txt no encontrado" -ForegroundColor Red
    }
}

# Frontend .env
if (Test-Path "frontend\.env") {
    Write-Host "⚠️  frontend\.env ya existe, omitiendo..." -ForegroundColor Yellow
} else {
    if (Test-Path "frontend\env.example.txt") {
        Copy-Item "frontend\env.example.txt" "frontend\.env"
        Write-Host "✅ Creado frontend\.env" -ForegroundColor Green
    } else {
        Write-Host "❌ frontend\env.example.txt no encontrado" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 ¡Completado!" -ForegroundColor Green
Write-Host ""
Write-Host "Siguiente paso: Edita los archivos .env con tus configuraciones" -ForegroundColor Cyan
Write-Host "  - backend\.env" -ForegroundColor White
Write-Host "  - frontend\.env" -ForegroundColor White


