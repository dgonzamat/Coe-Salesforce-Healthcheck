const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Importar servicios
const AnalysisOrchestrator = require('./src/services/analysisOrchestrator');
const OrganizationService = require('./src/services/organizationService');
const TechnicalAnalysisService = require('./src/services/technicalAnalysisService');
const FinancialAnalysisService = require('./src/services/financialAnalysisService');

// Cargar variables de entorno desde config.env
function loadEnvConfig() {
  try {
    const envFile = fs.readFileSync('config.env', 'utf8');
    const lines = envFile.split('\n');

    lines.forEach((line) => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
  } catch (error) {}
}

loadEnvConfig();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de Salesforce desde variables de entorno
const SALESFORCE_CONFIG = {
  accessToken: process.env.SALESFORCE_ACCESS_TOKEN || '',
  instanceUrl: process.env.SALESFORCE_INSTANCE_URL || '',
  apiVersion: process.env.SALESFORCE_API_VERSION || '64.0',
};

// Inicializar servicios
const orchestrator = new AnalysisOrchestrator(SALESFORCE_CONFIG);
const organizationService = new OrganizationService(SALESFORCE_CONFIG);
const technicalService = new TechnicalAnalysisService(SALESFORCE_CONFIG);
const financialService = new FinancialAnalysisService(SALESFORCE_CONFIG);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend/build')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    services: {
      orchestrator: 'ready',
      organization: 'ready',
      technical: 'ready',
      financial: 'ready',
    },
  });
});

// Endpoint para información de la organización
app.get('/api/org-info', async (req, res) => {
  try {
    if (!SALESFORCE_CONFIG.accessToken || !SALESFORCE_CONFIG.instanceUrl) {
      return res.status(500).json({
        success: false,
        error:
          'Configuración de Salesforce no válida. Verifica las variables de entorno.',
      });
    }

    const orgInfo = await organizationService.getOrganizationInfo();
    res.json(orgInfo);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint para análisis completo
app.get('/api/complete-analysis', async (req, res) => {
  try {
    if (!SALESFORCE_CONFIG.accessToken || !SALESFORCE_CONFIG.instanceUrl) {
      return res.status(500).json({
        success: false,
        error:
          'Configuración de Salesforce no válida. Verifica las variables de entorno.',
      });
    }

    const analysis = await orchestrator.runCompleteAnalysis();
    res.json(analysis);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint para análisis técnico
app.get('/api/technical-analysis', async (req, res) => {
  try {
    if (!SALESFORCE_CONFIG.accessToken || !SALESFORCE_CONFIG.instanceUrl) {
      return res.status(500).json({
        success: false,
        error:
          'Configuración de Salesforce no válida. Verifica las variables de entorno.',
      });
    }

    const analysis = await orchestrator.runTechnicalAnalysis();
    res.json(analysis);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint para análisis financiero
app.get('/api/financial-analysis', async (req, res) => {
  try {
    if (!SALESFORCE_CONFIG.accessToken || !SALESFORCE_CONFIG.instanceUrl) {
      return res.status(500).json({
        success: false,
        error:
          'Configuración de Salesforce no válida. Verifica las variables de entorno.',
      });
    }

    const analysis = await orchestrator.runFinancialAnalysis();
    res.json(analysis);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint para análisis de organización
app.get('/api/organization-analysis', async (req, res) => {
  try {
    if (!SALESFORCE_CONFIG.accessToken || !SALESFORCE_CONFIG.instanceUrl) {
      return res.status(500).json({
        success: false,
        error:
          'Configuración de Salesforce no válida. Verifica las variables de entorno.',
      });
    }

    const analysis = await orchestrator.runOrganizationAnalysis();
    res.json(analysis);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint para datos REALES únicamente (sin simulados)
app.get('/api/real-data', async (req, res) => {
  try {
    if (!SALESFORCE_CONFIG.accessToken || !SALESFORCE_CONFIG.instanceUrl) {
      return res.status(500).json({
        success: false,
        error:
          'Configuración de Salesforce no válida. Verifica las variables de entorno.',
      });
    }

    // Obtener análisis técnico y financiero REALES
    const [
      technicalHealth,
      financialHealth,
      securityAnalysis,
      storageAnalysis,
    ] = await Promise.all([
      technicalService.getTechnicalHealthScore(),
      financialService.getFinancialHealthScore(),
      technicalService.getSecurityAnalysis(),
      financialService.getStorageAnalysis(),
    ]);

    // Formatear respuesta para el frontend
    const response = {
      success: true,
      data: {
        technical: {
          governorLimits: {
            soqlQueries:
              technicalHealth.details.performance.governorLimits.soqlQueries,
            dmlStatements:
              technicalHealth.details.performance.governorLimits.dmlStatements,
            cpuTime: technicalHealth.details.performance.governorLimits.cpuTime,
            heapSize:
              technicalHealth.details.performance.governorLimits.heapSize,
          },
          codeQuality: {
            totalClasses: technicalHealth.details.codeQuality.totalClasses,
            largeClasses:
              technicalHealth.details.codeQuality.largeClasses.length,
            legacyCode:
              technicalHealth.details.codeQuality.legacyClasses.length,
            multiTriggers:
              technicalHealth.details.codeQuality.multiTriggers.length,
            testCoverage: {
              overallCoverage: technicalHealth.details.codeQuality.testCoverage,
              classesWithoutCoverage:
                technicalHealth.details.codeQuality.classesWithoutCoverage ||
                [],
              slowTests: [],
            },
            complexityScore:
              technicalHealth.details.codeQuality.complexityScore || 0,
          },
          performance: {
            customObjects:
              technicalHealth.details.architecture?.customObjects || 0,
            customFields:
              technicalHealth.details.architecture?.customFields || 0,
            activeFlows: technicalHealth.details.architecture?.activeFlows || 0,
            validationRules: 0, // No disponible sin Tooling API
            storageUsed: technicalHealth.details.performance?.storageUsed || 0,
          },
          security: {
            inactiveUsers: securityAnalysis.inactiveUsers || 0,
            passwordNeverChanged: securityAnalysis.passwordNeverChanged || 0,
            adminUsers: securityAnalysis.adminUsers || 0,
            failedLogins: securityAnalysis.failedLogins || 0,
          },
        },
        financial: {
          licenses: {
            totalLicenses:
              financialHealth.details.licenseAnalysis.totalLicenses,
            usedLicenses: financialHealth.details.licenseAnalysis.usedLicenses,
            unusedLicenses:
              financialHealth.details.licenseAnalysis.unusedLicenses,
            monthlyWaste: financialHealth.details.licenseAnalysis.monthlyWaste,
            yearlyWaste: financialHealth.details.licenseAnalysis.yearlyWaste,
          },
          storage: {
            dataUsed: storageAnalysis.dataStorage.used || 0,
            fileUsed: storageAnalysis.fileStorage.used || 0,
            monthlyOverage: storageAnalysis.monthlyOverage || 0,
            yearlyOverage: storageAnalysis.yearlyOverage || 0,
            growthTrends: storageAnalysis.growthTrends || [],
          },
          technicalDebt: {
            totalHours: financialHealth.details.technicalDebt?.totalHours || 0,
            hourlyRate: financialHealth.details.technicalDebt?.hourlyRate || 0,
            totalCost: financialHealth.details.technicalDebt?.totalCost || 0,
            monthlyInterest:
              financialHealth.details.technicalDebt?.monthlyInterest || 0,
          },
          risks: {
            governorIncidentRisk:
              financialHealth.details.operationalCosts?.governorIncidentRisk ||
              0,
            deploymentDelays: 0, // No disponible sin Tooling API
            maintenanceGrowth: 0, // No disponible sin Tooling API
          },
        },
        summary: {
          totalClasses: technicalHealth.details.codeQuality.totalClasses,
          totalTriggers: technicalHealth.details.codeQuality.totalTriggers,
          avgCodeCoverage: technicalHealth.details.codeQuality.testCoverage,
          overallScore: Math.round(
            (technicalHealth.overallScore + financialHealth.overallScore) / 2
          ),
        },
      },
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Error obteniendo datos reales: ${error.message}`,
    });
  }
});

// Endpoint para análisis personalizado
app.post('/api/analyze', async (req, res) => {
  try {
    if (!SALESFORCE_CONFIG.accessToken || !SALESFORCE_CONFIG.instanceUrl) {
      return res.status(500).json({
        success: false,
        error:
          'Configuración de Salesforce no válida. Verifica las variables de entorno.',
      });
    }

    const { analysisType } = req.body;

    let analysis;
    switch (analysisType) {
      case 'technical':
        analysis = await orchestrator.runTechnicalAnalysis();
        break;
      case 'financial':
        analysis = await orchestrator.runFinancialAnalysis();
        break;
      case 'organization':
        analysis = await orchestrator.runOrganizationAnalysis();
        break;
      case 'complete':
      default:
        analysis = await orchestrator.runCompleteAnalysis();
        break;
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint para métricas específicas
app.get('/api/metrics/:type', async (req, res) => {
  try {
    if (!SALESFORCE_CONFIG.accessToken || !SALESFORCE_CONFIG.instanceUrl) {
      return res.status(500).json({
        success: false,
        error:
          'Configuración de Salesforce no válida. Verifica las variables de entorno.',
      });
    }

    const { type } = req.params;
    let metrics;

    switch (type) {
      case 'governor-limits':
        const performance = await technicalService.getPerformanceAnalysis();
        metrics = performance.governorLimits;
        break;
      case 'code-quality':
        metrics = await technicalService.getCodeQualityAnalysis();
        break;
      case 'test-coverage':
        metrics = await technicalService.getTestCoverageAnalysis();
        break;
      case 'licenses':
        metrics = await financialService.getLicenseAnalysis();
        break;
      case 'storage':
        metrics = await financialService.getStorageAnalysis();
        break;
      case 'technical-debt':
        metrics = await financialService.getTechnicalDebtAnalysis();
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Tipo de métrica no válido',
        });
    }

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`);
  console.log(`📊 APIs disponibles:`);
  console.log(`   - GET  /api/org-info`);
  console.log(`   - GET  /api/real-data`);
  console.log(`   - GET  /api/technical-analysis`);
  console.log(`   - GET  /api/financial-analysis`);
  console.log(`   - GET  /api/complete-analysis`);
  console.log(`   - GET  /api/metrics/:type`);
  console.log(`   - POST /api/analyze`);
});
