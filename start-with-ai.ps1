# Script para arrancar VinIA con la API key configurada
# Ejecuta este script en lugar de usar concurrently directamente

Write-Host "🚀 Iniciando VinIA con IA habilitada..." -ForegroundColor Cyan
Write-Host ""

# Verificar si la API key está configurada como variable de entorno
if (-not $env:SPRING_AI_GOOGLE_AI_GEMINI_API_KEY) {
    # Intentar leer desde archivo local .env.local (no debe estar en git)
    $envFile = Join-Path $PSScriptRoot ".env.local"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match "^SPRING_AI_GOOGLE_AI_GEMINI_API_KEY=(.+)$") {
                $env:SPRING_AI_GOOGLE_AI_GEMINI_API_KEY = $matches[1]
            }
        }
    }
}

if ($env:SPRING_AI_GOOGLE_AI_GEMINI_API_KEY) {
    Write-Host "✅ API Key configurada" -ForegroundColor Green
}
else {
    Write-Host "⚠️  API Key no configurada. La IA no estará disponible." -ForegroundColor Yellow
    Write-Host "   Crea un archivo .env.local con: SPRING_AI_GOOGLE_AI_GEMINI_API_KEY=tu_clave" -ForegroundColor Yellow
}

# Arrancar backend y frontend
Write-Host "🔄 Arrancando backend y frontend..." -ForegroundColor Yellow
Write-Host ""

npx concurrently --names "BACK,FRONT" --prefix-colors "blue,green" "cd Content/backend && mvn spring-boot:run" "cd Content && npm run dev"
