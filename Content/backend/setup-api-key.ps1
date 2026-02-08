# Script para configurar la API Key de Google Gemini
# Ejecuta este script antes de arrancar el backend si quieres usar las funcionalidades de IA

Write-Host "🔑 Configuración de API Key para VinIA" -ForegroundColor Cyan
Write-Host ""

# Verificar si ya está configurada
$currentKey = $env:SPRING_AI_GOOGLE_AI_GEMINI_API_KEY
if ($currentKey) {
    Write-Host "✅ API Key ya configurada: $($currentKey.Substring(0, [Math]::Min(10, $currentKey.Length)))..." -ForegroundColor Green
    $overwrite = Read-Host "¿Deseas cambiarla? (s/n)"
    if ($overwrite -ne 's' -and $overwrite -ne 'S') {
        Write-Host "Manteniendo la configuración actual." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "Para obtener una API Key:" -ForegroundColor Yellow
Write-Host "1. Ve a https://makersuite.google.com/app/apikey" -ForegroundColor White
Write-Host "2. Inicia sesión con tu cuenta de Google" -ForegroundColor White
Write-Host "3. Crea una nueva API key" -ForegroundColor White
Write-Host "4. Copia la clave generada" -ForegroundColor White
Write-Host ""

$apiKey = Read-Host "Ingresa tu API Key de Google Gemini (o presiona Enter para cancelar)"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    exit 1
}

# Configurar para la sesión actual
$env:SPRING_AI_GOOGLE_AI_GEMINI_API_KEY = $apiKey
Write-Host "✅ API Key configurada para esta sesión" -ForegroundColor Green

# Preguntar si quiere hacerla permanente
Write-Host ""
$permanent = Read-Host "¿Deseas hacer esta configuración permanente para tu usuario? (s/n)"

if ($permanent -eq 's' -or $permanent -eq 'S') {
    try {
        [System.Environment]::SetEnvironmentVariable('SPRING_AI_GOOGLE_AI_GEMINI_API_KEY', $apiKey, 'User')
        Write-Host "✅ API Key guardada permanentemente" -ForegroundColor Green
        Write-Host "⚠️  Necesitarás reiniciar PowerShell para que tome efecto en nuevas sesiones" -ForegroundColor Yellow
    }
    catch {
        Write-Host "❌ Error al guardar la configuración permanente: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🚀 Ahora puedes arrancar el backend con: cd Content/backend && mvn spring-boot:run" -ForegroundColor Cyan
Write-Host ""
