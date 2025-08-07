# Configuración de Variables de Entorno

## Variables Requeridas

Para que el Health Check funcione correctamente, necesitas configurar las siguientes variables de entorno:

### 1. SALESFORCE_ACCESS_TOKEN
**Descripción**: Token de acceso de Salesforce para autenticación con la API.

**Cómo obtenerlo**:
```bash
# Usando Salesforce CLI
sf org display --verbose

# O desde la interfaz web de Salesforce
# Setup > Session Management > Session Settings > API Session Management
```

### 2. SALESFORCE_INSTANCE_URL
**Descripción**: URL de tu instancia de Salesforce.

**Ejemplos**:
- Production: `https://login.salesforce.com`
- Sandbox: `https://test.salesforce.com`
- Developer Edition: `https://tu-org-dev-ed.my.salesforce.com`

### 3. SALESFORCE_API_VERSION (Opcional)
**Descripción**: Versión de la API de Salesforce a usar.
**Valor por defecto**: `64.0`

## Configuración

### Opción 1: Variables de Entorno del Sistema

En Windows (PowerShell):
```powershell
$env:SALESFORCE_ACCESS_TOKEN="tu_access_token"
$env:SALESFORCE_INSTANCE_URL="https://tu-instancia.my.salesforce.com"
$env:SALESFORCE_API_VERSION="64.0"
```

En Linux/Mac:
```bash
export SALESFORCE_ACCESS_TOKEN="tu_access_token"
export SALESFORCE_INSTANCE_URL="https://tu-instancia.my.salesforce.com"
export SALESFORCE_API_VERSION="64.0"
```

### Opción 2: Archivo .env

Crea un archivo `.env` en la raíz del proyecto:
```env
SALESFORCE_ACCESS_TOKEN=tu_access_token_aqui
SALESFORCE_INSTANCE_URL=https://tu-instancia.my.salesforce.com
SALESFORCE_API_VERSION=64.0
```

### Opción 3: Configuración Temporal

Para pruebas rápidas, puedes configurar las variables directamente en el código:

```javascript
// En server.js (solo para desarrollo)
const SALESFORCE_CONFIG = {
  accessToken: 'tu_access_token_aqui',
  instanceUrl: 'https://tu-instancia.my.salesforce.com',
  apiVersion: '64.0',
};
```

## Verificación

Para verificar que la configuración es correcta:

1. Inicia el servidor:
```bash
node server.js
```

2. Deberías ver en la consola:
```
🚀 Servidor ejecutándose en http://localhost:3000
📊 API endpoints disponibles:
   - GET  /api/health
   - GET  /api/org-info
   - GET  /api/real-data
   - POST /api/analyze
```

3. Si las variables no están configuradas, verás:
```
⚠️  ADVERTENCIA: Variables de entorno de Salesforce no configuradas
   Configura las siguientes variables de entorno:
   - SALESFORCE_ACCESS_TOKEN
   - SALESFORCE_INSTANCE_URL
   - SALESFORCE_API_VERSION (opcional, por defecto: 64.0)
```

## Seguridad

⚠️ **IMPORTANTE**: 
- Nunca commits el archivo `.env` con credenciales reales
- Usa variables de entorno del sistema en producción
- Rota los access tokens regularmente
- Considera usar Connected Apps para mayor seguridad

## Troubleshooting

### Error: "Configuración de Salesforce no válida"
- Verifica que las variables de entorno estén configuradas
- Asegúrate de que el access token sea válido
- Confirma que la URL de la instancia sea correcta

### Error: "Access token expired"
- Genera un nuevo access token
- Actualiza la variable `SALESFORCE_ACCESS_TOKEN`

### Error: "Invalid endpoint"
- Verifica que `SALESFORCE_INSTANCE_URL` sea correcta
- Asegúrate de que la org esté activa 