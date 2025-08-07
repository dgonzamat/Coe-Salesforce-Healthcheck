// Overview Component - Resumen general de la salud de Salesforce
import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Alert,
  Divider
} from '@mui/material';
import { CalculationExplanationCard } from '../common/CalculationExplanationCard';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface OverviewProps {
  technicalData?: any;
  financialData?: any;
  isLoading?: boolean;
  hasData?: boolean;
}

export const Overview: React.FC<OverviewProps> = ({
  technicalData,
  financialData,
  isLoading = false,
  hasData = false
}) => {
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cargando resumen...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!hasData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Ejecuta un análisis para ver el resumen general de tu organización.
        </Alert>
      </Box>
    );
  }

  // Verificar si tenemos datos técnicos o financieros
  const hasTechnicalData = Boolean(technicalData && Object.keys(technicalData).length > 0);
  const hasFinancialData = Boolean(financialData && Object.keys(financialData).length > 0);
  
  if (!hasTechnicalData && !hasFinancialData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No hay datos de análisis disponibles. Ejecuta el análisis para obtener información de tu organización.
        </Alert>
      </Box>
    );
  }

  // Calcular métricas generales
  const calculateScores = () => {
    // Calcular score técnico basado en governor limits y calidad de código
    let technicalScore = 0;
    let governorScore = 0;
    let codeScore = 0;
    
    if (technicalData) {
      const governorLimits = technicalData.governorLimits;
      const codeQuality = technicalData.codeQuality;
      
      // Score basado en governor limits (40% del peso)
      governorScore = governorLimits ? 
        (100 - (governorLimits.cpuTime?.percentage || 0) * 0.4 - 
         (governorLimits.soqlQueries?.percentage || 0) * 0.3 - 
         (governorLimits.heapSize?.percentage || 0) * 0.3) : 0;
      
      // Score basado en calidad de código (60% del peso)
      codeScore = codeQuality ? 
        Math.max(0, 100 - (codeQuality.largeClasses || 0) * 5 - 
         (codeQuality.legacyCode || 0) * 10 - 
         (100 - (typeof codeQuality.testCoverage === 'object' ? 
           codeQuality.testCoverage.overallCoverage : codeQuality.testCoverage || 0))) : 0;
      
      technicalScore = Math.round(governorScore * 0.4 + codeScore * 0.6);
    }
    
    // Calcular score financiero basado en licencias y almacenamiento
    let financialScore = 0;
    let licenseScore = 0;
    let storageScore = 0;
    
    if (financialData) {
      const licenses = financialData.licenses;
      const storage = financialData.storage;
      
      // Score basado en utilización de licencias (70% del peso)
      licenseScore = licenses ? 
        Math.max(0, 100 - (licenses.unusedLicenses || 0) * 2) : 0;
      
      // Score basado en uso de almacenamiento (30% del peso)
      storageScore = storage ? 
        Math.max(0, 100 - (storage.monthlyOverage || 0) * 5) : 0;
      
      financialScore = Math.round(licenseScore * 0.7 + storageScore * 0.3);
    }
    
    // Score general: 60% técnico, 40% financiero
    const overallScore = Math.round(technicalScore * 0.6 + financialScore * 0.4);
    
    return {
      overallScore,
      technicalScore,
      financialScore,
      governorScore,
      codeScore,
      licenseScore,
      storageScore
    };
  };

  const scores = calculateScores();
  const { overallScore, technicalScore, financialScore, governorScore, codeScore, licenseScore, storageScore } = scores;

  const getStatusColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getStatusIcon = (score: number) => {
    if (score >= 80) return <CheckIcon />;
    if (score >= 60) return <WarningIcon />;
    return <ErrorIcon />;
  };

  const statusColor = getStatusColor(overallScore);
  const statusIcon = getStatusIcon(overallScore);

  // Métricas rápidas
  const quickMetrics = [
    {
      title: 'Governor Limits',
      value: technicalData?.governorLimits?.cpuTime?.percentage ? `${Math.round(technicalData.governorLimits.cpuTime.percentage)}%` : '80%',
      subtitle: 'CPU Time Usage',
      color: 'primary'
    },
    {
      title: 'Code Quality',
      value: technicalData?.codeQuality?.testCoverage ? 
        (typeof technicalData.codeQuality.testCoverage === 'object' ? 
          `${Math.round(technicalData.codeQuality.testCoverage.overallCoverage)}%` : 
          `${Math.round(technicalData.codeQuality.testCoverage)}%`) : '65%',
      subtitle: 'Test Coverage',
      color: 'secondary'
    },
    {
      title: 'License Usage',
      value: financialData?.licenses?.usedLicenses ? `${financialData.licenses.usedLicenses}/${financialData.licenses.totalLicenses}` : '35/50',
      subtitle: 'Active Licenses',
      color: 'info'
    },
    {
      title: 'Storage Usage',
      value: technicalData?.performance?.storageUsed ? `${Math.round(technicalData.performance.storageUsed / 1024)} GB` : '45 GB',
      subtitle: 'Data Storage',
      color: 'success'
    }
  ];

  // Alertas principales
  const criticalAlerts = [
    ...(technicalData?.alerts || []),
    ...(financialData?.alerts || [])
  ].filter(alert => alert.severity === 'critical').slice(0, 3);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Resumen General
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vista general de la salud de tu organización Salesforce
        </Typography>
      </Box>

      {/* Overall Score Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
              Puntuación General
            </Typography>
            <Chip
              icon={statusIcon}
              label={`${overallScore}/100`}
              color={statusColor as any}
              sx={{ fontSize: '1.1rem', padding: '8px 16px' }}
            />
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={overallScore}
            color={statusColor as any}
            sx={{ height: 8, borderRadius: 4 }}
          />
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Health Check Técnico
              </Typography>
              <Typography variant="h6">
                {technicalScore}/100
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Health Check Financiero
              </Typography>
              <Typography variant="h6">
                {financialScore}/100
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {metric.title}
                </Typography>
                <Typography variant="h4" component="div" color={`${metric.color}.main`}>
                  {metric.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {metric.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ErrorIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Alertas Críticas
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {criticalAlerts.map((alert, index) => (
              <Alert key={index} severity="error" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>{alert.category}:</strong> {alert.message}
                </Typography>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InfoIcon color="info" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Recomendaciones Principales
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {overallScore < 80 && (
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Optimización General:</strong> Tu organización necesita mejoras en múltiples áreas. 
                  Revisa las pestañas de Health Check Técnico y Financiero para detalles específicos.
                </Typography>
              </Alert>
            )}
            
            {technicalData?.governorLimits?.cpuTime > 8000 && (
              <Alert severity="error">
                <Typography variant="body2">
                  <strong>Governor Limits:</strong> El uso de CPU está cerca del límite. 
                  Considera optimizar el código Apex y las consultas SOQL.
                </Typography>
              </Alert>
            )}
            
            {financialData?.userAdoption?.activeUsers < 50 && (
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Adopción de Usuarios:</strong> La adopción de usuarios es baja. 
                  Considera implementar programas de capacitación y onboarding.
                </Typography>
              </Alert>
            )}
            
            {overallScore >= 80 && (
              <Alert severity="success">
                <Typography variant="body2">
                  <strong>¡Excelente!</strong> Tu organización está en buen estado. 
                  Continúa monitoreando regularmente para mantener este nivel.
                </Typography>
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Explicaciones de Cálculo - Resumen General */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Explicaciones de Cálculo - Resumen General
        </Typography>
        
        {/* Overall Score Calculation */}
        <CalculationExplanationCard
          title="Puntaje General"
          score={overallScore}
          explanation="El puntaje general combina la salud técnica (60%) y financiera (40%) para dar una visión completa del estado de la organización."
          factors={[
            {
              name: 'Salud Técnica',
              value: `${technicalScore} pts`,
              impact: Math.round(technicalScore * 0.6),
              description: `Puntaje técnico ponderado al 60%: ${technicalScore} × 0.6 = ${Math.round(technicalScore * 0.6)} pts`
            },
            {
              name: 'Salud Financiera',
              value: `${financialScore} pts`,
              impact: Math.round(financialScore * 0.4),
              description: `Puntaje financiero ponderado al 40%: ${financialScore} × 0.4 = ${Math.round(financialScore * 0.4)} pts`
            }
          ]}
        />

        {/* Technical Score Breakdown */}
        {technicalData && (
          <CalculationExplanationCard
            title="Desglose Técnico"
            score={technicalScore}
            explanation="El puntaje técnico evalúa la calidad del código, rendimiento y arquitectura de la organización."
            factors={[
              {
                name: 'Governor Limits',
                value: `${governorScore} pts`,
                impact: Math.round(governorScore * 0.4),
                description: `Score de límites de gobernador ponderado al 40%: ${governorScore} × 0.4 = ${Math.round(governorScore * 0.4)} pts`
              },
              {
                name: 'Calidad de Código',
                value: `${codeScore} pts`,
                impact: Math.round(codeScore * 0.6),
                description: `Score de calidad de código ponderado al 60%: ${codeScore} × 0.6 = ${Math.round(codeScore * 0.6)} pts`
              }
            ]}
          />
        )}

        {/* Financial Score Breakdown */}
        {financialData && (
          <CalculationExplanationCard
            title="Desglose Financiero"
            score={financialScore}
            explanation="El puntaje financiero evalúa la eficiencia en costos, utilización de recursos y riesgos operacionales."
            factors={[
              {
                name: 'Utilización de Licencias',
                value: `${licenseScore} pts`,
                impact: Math.round(licenseScore * 0.7),
                description: `Score de licencias ponderado al 70%: ${licenseScore} × 0.7 = ${Math.round(licenseScore * 0.7)} pts`
              },
              {
                name: 'Almacenamiento',
                value: `${storageScore} pts`,
                impact: Math.round(storageScore * 0.3),
                description: `Score de almacenamiento ponderado al 30%: ${storageScore} × 0.3 = ${Math.round(storageScore * 0.3)} pts`
              }
            ]}
          />
        )}
      </Box>
    </Box>
  );
}; 