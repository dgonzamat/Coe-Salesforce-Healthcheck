# PROCEDIMIENTO DE QA INTEGRAL - SALESFORCE HEALTH CHECK

## 📋 RESUMEN EJECUTIVO
Este documento define el procedimiento completo de Quality Assurance para la aplicación Salesforce Health Check, incluyendo pruebas automatizadas, manuales y validaciones de integración.

---

## 🎯 OBJETIVOS DEL QA

### Objetivos Principales
- ✅ Verificar funcionamiento completo de frontend y backend
- ✅ Validar conexión con Salesforce API
- ✅ Asegurar datos realistas y sin errores
- ✅ Confirmar interfaz de usuario funcional
- ✅ Validar cálculos y métricas correctas

### Criterios de Aceptación
- [ ] Backend responde en puerto 3001
- [ ] Frontend responde en puerto 3000
- [ ] Datos de Salesforce se obtienen correctamente
- [ ] No hay errores de JavaScript en consola
- [ ] Interfaz muestra datos realistas
- [ ] Cálculos de métricas son correctos

---

## 🔧 PREPARACIÓN DEL ENTORNO

### 1. Verificación de Dependencias
```bash
# Verificar Node.js instalado
node --version
npm --version

# Verificar dependencias del proyecto
npm list --depth=0
cd frontend && npm list --depth=0
```

### 2. Configuración de Variables de Entorno
```bash
# Verificar config.env
cat config.env
# Debe contener:
# - SALESFORCE_ACCESS_TOKEN
# - SALESFORCE_INSTANCE_URL
# - PORT=3001
```

### 3. Limpieza de Procesos
```powershell
# Terminar procesos existentes
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
```

---

## 🚀 PROCEDIMIENTO DE INICIO

### Paso 1: Iniciar Backend
```bash
# En directorio raíz
node server.js
```
**Resultado Esperado:**
```
🚀 Servidor backend ejecutándose en puerto 3001
📊 APIs disponibles:
   - GET  /api/org-info
   - GET  /api/real-data
   - GET  /api/technical-analysis
   - GET  /api/financial-analysis
   - GET  /api/complete-analysis
   - GET  /api/metrics/:type
   - POST /api/analyze
```

### Paso 2: Iniciar Frontend
```bash
# En directorio frontend
npm start
```
**Resultado Esperado:**
```
Local:            http://localhost:3000
On Your Network:  http://192.168.1.127:3000
webpack compiled successfully
```

---

## 🧪 PRUEBAS AUTOMATIZADAS

### 1. Prueba de Conectividad Backend
```bash
# Test 1: Verificar que el backend responde
curl http://localhost:3001/api/org-info

# Resultado Esperado:
# StatusCode: 200
# Content: {"success":true,"data":{...}}
```

### 2. Prueba de Datos Reales
```bash
# Test 2: Verificar datos de Salesforce
curl http://localhost:3001/api/real-data

# Resultado Esperado:
# - success: true
# - governorLimits con valores realistas (no 0%)
# - codeQuality con datos válidos
```

### 3. Prueba de Proxy Frontend
```bash
# Test 3: Verificar que frontend puede acceder al backend
curl http://localhost:3000/api/org-info

# Resultado Esperado:
# StatusCode: 200
# Datos de la organización
```

---

## 👀 PRUEBAS MANUALES

### 1. Prueba de Navegación
**Pasos:**
1. Abrir http://localhost:3000 en navegador
2. Verificar que la página carga sin errores
3. Navegar entre las diferentes secciones

**Resultado Esperado:**
- ✅ Página carga completamente
- ✅ No hay errores en consola del navegador
- ✅ Navegación fluida entre secciones

### 2. Prueba de Datos en Interfaz
**Pasos:**
1. Ir a "HEALTH CHECK TÉCNICO"
2. Verificar sección "Límites de Gobernador"
3. Verificar sección "Calidad de Código"

**Resultado Esperado:**
- ✅ Governor Limits muestran porcentajes realistas (10-40%)
- ✅ Cobertura de tests muestra valor > 0%
- ✅ No hay valores "NaN" o "undefined"

### 3. Prueba de Cálculos
**Pasos:**
1. Verificar que los porcentajes se calculan correctamente
2. Verificar que los estados (Bajo, Medio, Alto, Crítico) son correctos
3. Verificar que las barras de progreso funcionan

**Resultado Esperado:**
- ✅ Porcentajes calculados: (used/limit) * 100
- ✅ Estados correctos según porcentaje
- ✅ Barras de progreso visibles y funcionales

---

## 🔍 PRUEBAS ESPECÍFICAS DE ERRORES

### 1. Prueba de Validación de Datos
**Objetivo:** Verificar que la aplicación maneja datos faltantes correctamente

**Pasos:**
1. Simular datos incompletos en el backend
2. Verificar que el frontend muestra valores por defecto
3. Verificar que no hay errores de "Cannot read properties of undefined"

**Resultado Esperado:**
- ✅ Valores por defecto mostrados cuando faltan datos
- ✅ No hay errores de JavaScript
- ✅ Interfaz sigue siendo funcional

### 2. Prueba de Conectividad Salesforce
**Objetivo:** Verificar que la conexión con Salesforce funciona

**Pasos:**
1. Verificar que el token de acceso es válido
2. Verificar que las consultas SOQL funcionan
3. Verificar que se obtienen datos reales

**Resultado Esperado:**
- ✅ Conexión exitosa a Salesforce
- ✅ Datos reales obtenidos (no simulados)
- ✅ Métricas calculadas correctamente

---

## 📊 VALIDACIÓN DE MÉTRICAS

### 1. Governor Limits
**Métricas a Verificar:**
- SOQL Queries: 10-40% de uso
- DML Statements: 10-40% de uso
- CPU Time: 10-40% de uso
- Heap Size: 10-40% de uso

**Validación:**
```javascript
// Verificar que los valores están en rango
const percentage = (used / limit) * 100;
const isValid = percentage >= 10 && percentage <= 40;
```

### 2. Code Quality
**Métricas a Verificar:**
- Total Classes: > 0
- Test Coverage: 20-85%
- Large Classes: >= 0
- Legacy Code: >= 0

### 3. Performance
**Métricas a Verificar:**
- Custom Objects: >= 0
- Custom Fields: >= 0
- Active Flows: >= 0

---

## 🚨 PRUEBAS DE ERRORES Y RECUPERACIÓN

### 1. Prueba de Backend No Disponible
**Pasos:**
1. Detener el backend
2. Intentar cargar datos en el frontend
3. Verificar manejo de errores

**Resultado Esperado:**
- ✅ Frontend muestra mensaje de error apropiado
- ✅ No hay crashes de la aplicación
- ✅ Interfaz sigue siendo navegable

### 2. Prueba de Datos Corruptos
**Pasos:**
1. Simular respuesta con datos malformados
2. Verificar que el frontend maneja el error
3. Verificar que se muestran valores por defecto

**Resultado Esperado:**
- ✅ Aplicación no se rompe
- ✅ Se muestran valores por defecto
- ✅ No hay errores de JavaScript

---

## 📝 CHECKLIST DE QA

### ✅ Preparación
- [ ] Node.js instalado y funcionando
- [ ] Dependencias instaladas
- [ ] Variables de entorno configuradas
- [ ] Procesos anteriores terminados

### ✅ Inicio de Servicios
- [ ] Backend inicia en puerto 3001
- [ ] Frontend inicia en puerto 3000
- [ ] No hay conflictos de puertos
- [ ] Ambos servicios responden

### ✅ Conectividad
- [ ] Backend responde a /api/org-info
- [ ] Backend responde a /api/real-data
- [ ] Frontend puede acceder al backend
- [ ] Conexión con Salesforce funciona

### ✅ Interfaz de Usuario
- [ ] Página principal carga sin errores
- [ ] Navegación entre secciones funciona
- [ ] No hay errores en consola del navegador
- [ ] Datos se muestran correctamente

### ✅ Datos y Cálculos
- [ ] Governor Limits muestran valores realistas
- [ ] Code Quality muestra métricas válidas
- [ ] Porcentajes se calculan correctamente
- [ ] Estados se muestran apropiadamente

### ✅ Manejo de Errores
- [ ] Aplicación maneja datos faltantes
- [ ] No hay errores de "undefined"
- [ ] Valores por defecto se muestran
- [ ] Interfaz sigue siendo funcional

---

## 🔄 PROCEDIMIENTO DE REINICIO

### Si hay problemas:
1. **Terminar todos los procesos:**
   ```powershell
   Stop-Process -Name "node" -Force
   ```

2. **Verificar puertos libres:**
   ```powershell
   Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
   Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
   ```

3. **Reiniciar servicios:**
   ```bash
   # Terminal 1: Backend
   node server.js
   
   # Terminal 2: Frontend
   cd frontend && npm start
   ```

---

## 📈 MÉTRICAS DE ÉXITO

### Criterios de Aprobación
- ✅ **100%** de las APIs responden correctamente
- ✅ **0 errores** de JavaScript en consola
- ✅ **Datos realistas** mostrados (no todos en 0%)
- ✅ **Interfaz funcional** en todos los navegadores
- ✅ **Cálculos correctos** en todas las métricas

### Criterios de Rechazo
- ❌ Cualquier error de "Cannot read properties of undefined"
- ❌ Backend no responde en puerto 3001
- ❌ Frontend no responde en puerto 3000
- ❌ Datos completamente vacíos (todos en 0%)
- ❌ Errores de conexión con Salesforce

---

## 📋 REPORTE DE QA

### Plantilla de Reporte
```
Fecha: _______________
QA Engineer: _______________
Versión: _______________

✅ PASÓ / ❌ FALLÓ

1. Preparación del Entorno: ___
2. Inicio de Servicios: ___
3. Conectividad: ___
4. Interfaz de Usuario: ___
5. Datos y Cálculos: ___
6. Manejo de Errores: ___

Observaciones:
_________________________________
_________________________________

Recomendaciones:
_________________________________
_________________________________

Estado Final: APROBADO / RECHAZADO
```

---

## 🎯 CONCLUSIÓN

Este procedimiento de QA integral asegura que la aplicación Salesforce Health Check funcione correctamente en todos los aspectos críticos, desde la conectividad hasta la interfaz de usuario, garantizando una experiencia de usuario fluida y datos precisos.
