# 🚨 ACCIÓN URGENTE: API Key Expuesta en GitHub

## ⚠️ Situación Actual
Se ha detectado que una API key de Google (Gemini) fue expuesta en el repositorio de GitHub en el archivo `application.properties`.

**API Key expuesta:** `YOUR_API_KEY_HERE`

## ✅ Acciones Ya Completadas
1. ✓ Creado `.gitignore` para prevenir futuros problemas
2. ✓ Eliminada la API key del código actual
3. ✓ Creado `application-local.properties` para configuración local
4. ✓ Commit realizado: "correccion de error - eliminada API key del código"

## 🔴 ACCIONES CRÍTICAS PENDIENTES

### Paso 1: Limpiar el Historial de Git
La API key todavía existe en el historial de Git. Debes ejecutar:

```powershell
.\remove-api-key-from-history.ps1
```

Este script:
- Reescribirá el historial de Git
- Reemplazará la API key en todos los commits anteriores
- Te pedirá confirmación antes de proceder

### Paso 2: Force Push al Repositorio
Después de limpiar el historial, ejecuta:

```bash
git push origin --force --all
git push origin --force --tags
```

⚠️ **ADVERTENCIA:** Esto reescribirá el historial en GitHub. Si hay colaboradores, deben hacer `git pull --rebase` después.

### Paso 3: REVOCAR LA API KEY INMEDIATAMENTE
**ESTO ES CRÍTICO:** La API key ya está expuesta públicamente. Debes:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Busca la API key: `YOUR_API_KEY_HERE`
3. **REVÓCALA inmediatamente**
4. Genera una nueva API key
5. Configura la nueva key localmente (ver abajo)

### Paso 4: Configurar la Nueva API Key Localmente

Opción A - Usando el archivo local (recomendado):
```bash
# Edita el archivo (NO se subirá a Git):
Content/backend/src/main/resources/application-local.properties

# Cambia la API key por tu nueva key
spring.ai.openai.api-key=TU_NUEVA_API_KEY_AQUI
```

Opción B - Usando variable de entorno:
```powershell
# En PowerShell:
$env:SPRING_AI_OPENAI_API_KEY="TU_NUEVA_API_KEY_AQUI"

# O permanentemente en Windows:
[System.Environment]::SetEnvironmentVariable('SPRING_AI_OPENAI_API_KEY', 'TU_NUEVA_API_KEY_AQUI', 'User')
```

## 📋 Checklist de Seguridad

- [ ] Ejecutar `remove-api-key-from-history.ps1`
- [ ] Force push al repositorio remoto
- [ ] Revocar la API key expuesta en Google Cloud Console
- [ ] Generar nueva API key
- [ ] Configurar nueva API key localmente
- [ ] Verificar que la aplicación funciona con la nueva key
- [ ] Verificar que `application.properties` no contiene secrets en GitHub

## 🔒 Prevención Futura

El `.gitignore` ahora incluye:
- `application-local.properties` - Para configuración local
- `.env` y `*.env` - Para variables de entorno
- `api-key.txt` - Para archivos de keys

**Regla de oro:** NUNCA commitear archivos con API keys, passwords, o tokens.

## 📚 Recursos Adicionales

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Google Cloud: Best practices for API keys](https://cloud.google.com/docs/authentication/api-keys)

---

**Fecha de detección:** 2026-02-08
**Severidad:** CRÍTICA
**Estado:** Parcialmente mitigado (pendiente limpieza de historial y revocación de key)
