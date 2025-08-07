# Salesforce Health Check

Sistema de análisis integral de salud de organizaciones Salesforce que proporciona métricas técnicas y financieras basadas **exclusivamente en datos reales** de la API de Salesforce.

## 🎯 Características Principales

- **Datos 100% Reales** - Sin datos hardcodeados o simulados
- **Análisis Técnico** - Límites de gobernador, calidad de código, rendimiento y seguridad
- **Análisis Financiero** - Costos de licencias, almacenamiento, deuda técnica y riesgos
- **Interfaz Moderna** - React + TypeScript con Material-UI
- **API Directa** - Conexión directa a Salesforce sin intermediarios
- **Métricas Auto-explicativas** - Tooltips y descripciones detalladas

## 📊 Métricas Analizadas

### Técnicas
- **Límites de Gobernador**: SOQL, DML, CPU Time, Heap Size
- **Calidad de Código**: Clases grandes, código legacy, cobertura de pruebas
- **Rendimiento**: Objetos personalizados, campos, flows, reglas de validación
- **Seguridad**: Usuarios inactivos, contraseñas antiguas, intentos fallidos

### Financieras
- **Licencias**: Utilización, desperdicio mensual/anual
- **Almacenamiento**: Uso de datos/archivos, costos de exceso
- **Deuda Técnica**: Horas de refactorización, costos estimados
- **Riesgos**: Incidentes de gobernador, retrasos en despliegues

## 🚀 Instalación

### Prerrequisitos
- Node.js 16+
- Salesforce CLI
- Acceso a una org de Salesforce

### Configuración

1. **Clona el repositorio**:
```bash
git clone <repository-url>
cd coe-health-check-salesforce
```

2. **Instala dependencias**:
```bash
npm install
cd frontend && npm install
```

3. **Configura variables de entorno**:
```bash
# Obtén tu access token de Salesforce
sf org display --verbose

# Configura las variables
export SALESFORCE_ACCESS_TOKEN="tu_access_token"
export SALESFORCE_INSTANCE_URL="https://tu-instancia.my.salesforce.com"
export SALESFORCE_API_VERSION="64.0"
```

4. **Construye el frontend**:
```bash
cd frontend
npm run build
```

5. **Inicia el servidor**:
```bash
cd ..
node server.js
```

6. **Accede a la aplicación**:
```
http://localhost:3000
```

## 📋 Configuración de Variables de Entorno

### Variables Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SALESFORCE_ACCESS_TOKEN` | Token de acceso de Salesforce | `00D...` |
| `SALESFORCE_INSTANCE_URL` | URL de la instancia | `https://tu-org.my.salesforce.com` |
| `SALESFORCE_API_VERSION` | Versión de la API (opcional) | `64.0` |

### Cómo Obtener el Access Token

```bash
# Usando Salesforce CLI
sf org display --verbose

# O desde la interfaz web
# Setup > Session Management > Session Settings > API Session Management
```

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Salesforce    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (API)         │
│                 │    │                 │    │                 │
│ - Dashboard     │    │ - Proxy API     │    │ - REST API      │
│ - Components    │    │ - Data Fetch    │    │ - Tooling API   │
│ - State Mgmt    │    │ - Calculations  │    │ - Limits API    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Desarrollo

### Estructura del Proyecto
```
coe-health-check-salesforce/
├── frontend/                 # React + TypeScript
│   ├── src/
│   │   ├── components/       # Componentes UI
│   │   ├── stores/          # Estado global (Zustand)
│   │   ├── services/        # Servicios de API
│   │   └── types/           # Tipos TypeScript
│   └── package.json
├── server.js                # Servidor Node.js
├── package.json
└── README.md
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo
npm run build        # Construye frontend
npm run start        # Inicia servidor de producción

# Frontend
cd frontend
npm start           # Servidor de desarrollo React
npm run build       # Construcción de producción
npm test            # Ejecuta tests
```

## 📈 API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/health` | GET | Estado del servidor |
| `/api/org-info` | GET | Información de la org |
| `/api/real-data` | GET | Datos técnicos y financieros |
| `/api/analyze` | POST | Ejecuta análisis completo |

## 🔒 Seguridad

- **Sin credenciales hardcodeadas** - Todas las credenciales vienen de variables de entorno
- **Validación de configuración** - El servidor verifica que las variables estén configuradas
- **Manejo de errores** - Errores apropiados cuando la configuración es inválida
- **Logs informativos** - Advertencias cuando faltan variables de entorno

## 🐛 Troubleshooting

### Error: "Configuración de Salesforce no válida"
```bash
# Verifica que las variables estén configuradas
echo $SALESFORCE_ACCESS_TOKEN
echo $SALESFORCE_INSTANCE_URL

# Si no están configuradas, configúralas
export SALESFORCE_ACCESS_TOKEN="tu_token"
export SALESFORCE_INSTANCE_URL="tu_url"
```

### Error: "Access token expired"
```bash
# Genera un nuevo token
sf org display --verbose
```

### Error: "No se pudieron obtener datos"
- Verifica que la org esté activa
- Confirma que el access token tenga permisos suficientes
- Revisa los logs del servidor para más detalles

## 📝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Soporte

Para soporte técnico o preguntas:
- Revisa la documentación en `ENVIRONMENT_SETUP.md`
- Verifica los logs del servidor
- Asegúrate de que todas las variables de entorno estén configuradas correctamente

---

**Nota**: Este sistema utiliza exclusivamente datos reales de la API de Salesforce. No se incluyen datos hardcodeados o simulados para garantizar la precisión de las métricas mostradas.
