# Script para arrancar VinIA con la API key configurada
# Ejecuta este script en lugar de usar concurrently directamente

Write-Host "🚀 Iniciando VinIA con IA habilitada..." -ForegroundColor Cyan
Write-Host ""

# Configurar la API key
$env:SPRING_AI_GOOGLE_AI_GEMINI_API_KEY = "YOUR_API_KEY_HERE"
Write-Host "✅ API Key configurada" -ForegroundColor Green

# Arrancar backend y frontend
Write-Host "🔄 Arrancando backend y frontend..." -ForegroundColor Yellow
Write-Host ""

npx concurrently --names "BACK,FRONT" --prefix-colors "blue,green" "cd Content/backend && mvn spring-boot:run" "cd Content && npm run dev"
