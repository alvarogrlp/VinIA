# Script para arrancar VinIA sin IA
# Usa este script si no necesitas las funcionalidades de IA

Write-Host "🚀 Iniciando VinIA (sin IA)..." -ForegroundColor Cyan
Write-Host ""
Write-Host "ℹ️  Las funcionalidades de IA estarán deshabilitadas" -ForegroundColor Yellow
Write-Host "   Para habilitar IA, usa: .\start-with-ai.ps1" -ForegroundColor Yellow
Write-Host ""

# Arrancar backend y frontend
npx concurrently --names "BACK,FRONT" --prefix-colors "blue,green" "cd Content/backend && mvn spring-boot:run" "cd Content && npm run dev"
