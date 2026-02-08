# Script para eliminar la API key del historial de Git
# ADVERTENCIA: Este script reescribe el historial de Git

Write-Host "=== Limpieza de API Key del Historial de Git ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "Este script va a:" -ForegroundColor Cyan
Write-Host "1. Reescribir el historial de Git para eliminar la API key expuesta" -ForegroundColor Cyan
Write-Host "2. Reemplazar la API key con un placeholder en todos los commits" -ForegroundColor Cyan
Write-Host "3. Requerir un force push para actualizar el repositorio remoto" -ForegroundColor Cyan
Write-Host ""
Write-Host "ADVERTENCIA: Esto reescribirá el historial. Asegúrate de que nadie más esté trabajando en el repo." -ForegroundColor Red
Write-Host ""

$confirmation = Read-Host "¿Deseas continuar? (escribe 'SI' para confirmar)"
if ($confirmation -ne "SI") {
    Write-Host "Operación cancelada." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Iniciando limpieza del historial..." -ForegroundColor Green

# Crear un script temporal para sed
$sedScript = @"
s/spring\.ai\.openai\.api-key=YOUR_API_KEY_HERE/spring.ai.openai.api-key=\${SPRING_AI_OPENAI_API_KEY:}/g
"@

$sedScript | Out-File -FilePath ".\temp-sed-script.txt" -Encoding ASCII

# Usar git filter-branch para reemplazar la API key en el historial
$env:FILTER_BRANCH_SQUELCH_WARNING = "1"

git filter-branch --force --tree-filter "if (Test-Path 'Content\backend\src\main\resources\application.properties') { (Get-Content 'Content\backend\src\main\resources\application.properties' -Raw) -replace 'spring\.ai\.openai\.api-key=YOUR_API_KEY_HERE', 'spring.ai.openai.api-key=`${SPRING_AI_OPENAI_API_KEY:}' | Set-Content 'Content\backend\src\main\resources\application.properties' -NoNewline }" --tag-name-filter cat -- --all

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Historial limpiado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Verifica los cambios con: git log --oneline -5" -ForegroundColor White
    Write-Host "2. Haz force push con: git push origin --force --all" -ForegroundColor White
    Write-Host "3. IMPORTANTE: Revoca la API key expuesta en Google Cloud Console" -ForegroundColor Red
    Write-Host "4. Genera una nueva API key" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "✗ Error al limpiar el historial" -ForegroundColor Red
    Write-Host "Revisa los errores arriba" -ForegroundColor Yellow
}

# Limpiar archivo temporal
if (Test-Path ".\temp-sed-script.txt") {
    Remove-Item ".\temp-sed-script.txt"
}
