# 🔗 Configuración de Salesforce CLI

Esta guía te ayudará a conectar la aplicación con Salesforce usando Salesforce CLI.

## 📋 Prerrequisitos

1. **Salesforce CLI instalado**
   ```bash
   # Verificar instalación
   sf --version
   ```

2. **Organización de Salesforce**
   - Una organización de desarrollo, sandbox o producción
   - Credenciales de acceso

## 🚀 Configuración Rápida

### 1. Conectar con Salesforce CLI

```bash
# Autenticarse con Salesforce
sf org login web

# O usar autenticación por usuario/contraseña
sf org login web --set-default-dev-hub
```

### 2. Actualizar configuración automáticamente

```bash
# Actualizar configuración desde CLI
npm run sf:connect

# Probar conexión
npm run sf:test
```

### 3. Iniciar aplicación

```bash
# Iniciar servidor con configuración actualizada
npm start
```

## 🔧 Comandos Disponibles

### Gestión de Conexión

```bash
# Actualizar configuración desde CLI
npm run sf:connect

# Probar conexión con Salesforce
npm run sf:test

# Ver ayuda del script
npm run sf:help
```

### Gestión de Organizaciones

```bash
# Listar organizaciones conectadas
sf org list

# Ver información detallada de una organización
sf org display --target-org [username]

# Conectar a una nueva organización
sf org login web --alias [nombre-alias]
```

## 📊 Verificación de Conexión

### 1. Verificar CLI
```bash
sf org list
```

### 2. Verificar API
```bash
# Probar endpoint de salud
curl http://localhost:3000/api/health

# Probar endpoint de información de organización
curl http://localhost:3000/api/org-info
```

### 3. Verificar en Navegador
- Abrir: http://localhost:3000
- Verificar que los datos se cargan correctamente

## 🔐 Configuración Manual

Si prefieres configurar manualmente, edita el archivo `config.env`:

```env
# Salesforce Configuration
SALESFORCE_ACCESS_TOKEN=tu_token_de_acceso
SALESFORCE_INSTANCE_URL=tu_url_de_instancia
SALESFORCE_API_VERSION=64.0
SALESFORCE_ORG_ID=tu_org_id
SALESFORCE_USERNAME=tu_usuario

# Application Configuration
NODE_ENV=development
PORT=3000
```

## 🛠️ Solución de Problemas

### Error: "No hay organizaciones conectadas"
```bash
# Conectar a una organización
sf org login web
```

### Error: "Token expirado"
```bash
# Renovar token
sf org login web --target-org [username]
```

### Error: "Configuración incompleta"
```bash
# Regenerar configuración
npm run sf:connect
```

### Error: "Conexión fallida"
1. Verificar credenciales
2. Verificar URL de instancia
3. Verificar permisos de API

## 📈 Monitoreo

### Variables de Entorno Importantes

- `SALESFORCE_ACCESS_TOKEN`: Token de acceso para API
- `SALESFORCE_INSTANCE_URL`: URL de la instancia de Salesforce
- `SALESFORCE_API_VERSION`: Versión de la API (recomendado: 64.0)
- `SALESFORCE_ORG_ID`: ID de la organización
- `SALESFORCE_USERNAME`: Usuario de Salesforce

### Endpoints de Verificación

- `GET /api/health`: Estado del servidor
- `GET /api/org-info`: Información de la organización
- `GET /api/real-data`: Datos técnicos y financieros
- `POST /api/analyze`: Análisis completo

## 🔄 Actualización Automática

El script `salesforce-connect.js` puede actualizar automáticamente la configuración:

```bash
# Actualizar desde CLI
node scripts/salesforce-connect.js update

# Probar conexión
node scripts/salesforce-connect.js test
```

## 📝 Notas Importantes

1. **Seguridad**: Los tokens de acceso son sensibles, no los compartas
2. **Expiración**: Los tokens expiran, renóvalos periódicamente
3. **Permisos**: Asegúrate de tener permisos de API en Salesforce
4. **Sandbox**: Para desarrollo, usa organizaciones sandbox
5. **Producción**: Para producción, usa organizaciones de producción

## 🆘 Soporte

Si tienes problemas:

1. Verificar que Salesforce CLI esté instalado
2. Verificar que tengas una organización conectada
3. Ejecutar `npm run sf:test` para diagnosticar
4. Revisar logs del servidor en la consola 