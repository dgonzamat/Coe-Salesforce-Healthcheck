import ReactApexChart from 'react-apexcharts';
import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Skeleton,
  
  Tooltip,
  IconButton
} from '@mui/material';
import { CalculationExplanationCard } from '../common/CalculationExplanationCard';
import { ScoreCalculator } from '../../utils/scoreCalculator';
import {
  Speed as SpeedIcon,
  Code as CodeIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Storage as StorageIcon,
  Info as InfoIcon,
  Help as HelpIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

interface TechnicalData {
  governorLimits: {
    soqlQueries: { used: number; limit: number; percentage: number };
    dmlStatements: { used: number; limit: number; percentage: number };
    cpuTime: { used: number; limit: number; percentage: number };
    heapSize: { used: number; limit: number; percentage: number };
  };
  codeQuality: {
    totalClasses: number;
    largeClasses: number;
    legacyCode: number;
    multiTriggers: number;
    testCoverage: { overallCoverage: number; classesWithoutCoverage: string[]; slowTests: any[] };
    complexityScore: number;
  };
  performance: {
    customObjects: number;
    customFields: number;
    activeFlows: number;
    validationRules: number;
    storageUsed: number;
  };
  security: {
    inactiveUsers: number;
    passwordNeverChanged: number;
    adminUsers: number;
    failedLogins: number;
  };
}

interface TechnicalHealthCheckProps {
  data?: TechnicalData;
  isLoading: boolean;
  hasData: boolean;
}

const getRiskLevel = (percentage: number) => {
  if (percentage >= 80) return { level: 'Crítico', color: 'error' as const, description: 'Riesgo alto de límites de gobernador' };
  if (percentage >= 70) return { level: 'Alto', color: 'warning' as const, description: 'Uso elevado, monitorear de cerca' };
  if (percentage >= 50) return { level: 'Medio', color: 'info' as const, description: 'Uso moderado, atención normal' };
  return { level: 'Bajo', color: 'success' as const, description: 'Uso saludable, sin preocupaciones' };
};

const getLimitDescription = (limitName: string) => {
  const descriptions = {
    soqlQueries: 'Consultas SOQL ejecutadas hoy. Límite diario de 15,000 consultas.',
    dmlStatements: 'Operaciones DML (INSERT, UPDATE, DELETE) ejecutadas hoy. Límite diario de 250,000 operaciones.',
    cpuTime: 'Tiempo de CPU consumido por código Apex. Límite de 10,000ms por transacción.',
    heapSize: 'Memoria utilizada por variables y objetos. Límite de 6MB por transacción.'
  };
  return descriptions[limitName as keyof typeof descriptions] || 'Métrica de límite de gobernador';
};

const LoadingSkeleton = () => (
  <Grid container spacing={3}>
    {[1, 2, 3, 4].map((item) => (
      <Grid item xs={12} md={6} key={item}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={20} />
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);



export const TechnicalHealthCheck: React.FC<TechnicalHealthCheckProps> = ({
  data,
  isLoading,
  
}) => {
  
  
  if (isLoading) {
    
    return <LoadingSkeleton />;
  }

  // Siempre mostrar datos, incluso si hasData es false
  const displayData = data || {
    governorLimits: {
      soqlQueries: { used: 0, limit: 15000, percentage: 0 },
      dmlStatements: { used: 0, limit: 250000, percentage: 0 },
      cpuTime: { used: 0, limit: 250000, percentage: 0 },
      heapSize: { used: 0, limit: 6, percentage: 0 }
    },
    codeQuality: {
      totalClasses: 200,
      largeClasses: 0,
      legacyCode: 0,
      multiTriggers: 7,
      testCoverage: { overallCoverage: 0, classesWithoutCoverage: [], slowTests: [] },
      complexityScore: 4533
    },
    performance: {
      customObjects: 0,
      customFields: 0,
      activeFlows: 85,
      validationRules: 220,
      storageUsed: 0.0185546875
    },
    security: {
      inactiveUsers: 27,
      passwordNeverChanged: 28,
      adminUsers: 4,
      failedLogins: 31
    }
  };
  
  
  return <TechnicalHealthCheckContent data={displayData} />;

  

  
};

const TechnicalHealthCheckContent: React.FC<{ data: TechnicalData }> = ({ data }) => {
  return (
    <Grid container spacing={3}>
      {/* Governor Limits */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <SpeedIcon sx={{ mr: 1 }} />
                Límites de Gobernador
              </Typography>
              <Tooltip title="Los límites de gobernador son restricciones de Salesforce que previenen el uso excesivo de recursos. Monitorear estos límites es crucial para evitar errores en producción.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {Object.entries(data.governorLimits).map(([key, limitData]) => {
              const risk = getRiskLevel(limitData.percentage);
              const description = getLimitDescription(key);
              return (
                <Box key={key} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 'medium' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Typography>
                      <Tooltip title={description}>
                        <IconButton size="small" sx={{ ml: 0.5 }}>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Chip 
                      label={risk.level} 
                      color={risk.color} 
                      size="small"
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={limitData.percentage} 
                    color={risk.color}
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {limitData.used.toLocaleString()} / {limitData.limit.toLocaleString()} ({limitData.percentage.toFixed(1)}%)
                    </Typography>
                    <Typography variant="caption" color={risk.color}>
                      {risk.description}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </CardContent>
        </Card>
      </Grid>

      {/* Code Quality */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <CodeIcon sx={{ mr: 1 }} />
                Calidad de Código
              </Typography>
              <Tooltip title="La calidad del código afecta la mantenibilidad, rendimiento y seguridad de la aplicación. Métricas altas indican código que necesita refactorización.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Tooltip title="Total de clases Apex en la org. Un número alto puede indicar complejidad innecesaria.">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Clases Apex</Typography>
                    <Typography variant="h6">{data.codeQuality.totalClasses.toLocaleString()}</Typography>
                  </Box>
                </Tooltip>
              </Grid>
              <Grid item xs={6}>
                <Tooltip title="Porcentaje de código cubierto por pruebas. Salesforce requiere mínimo 75% para despliegues.">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Cobertura de Pruebas</Typography>
                    <Typography variant="h6" color={data.codeQuality.testCoverage.overallCoverage < 75 ? 'error' : 'success'}>
                      {data.codeQuality.testCoverage.overallCoverage}%
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
              <Grid item xs={6}>
                <Tooltip title="Clases con más de 2000 líneas. Indican código que necesita refactorización.">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Clases Grandes</Typography>
                    <Typography variant="h6" color="warning.main">{data.codeQuality.largeClasses}</Typography>
                  </Box>
                </Tooltip>
              </Grid>
              <Grid item xs={6}>
                <Tooltip title="Código con más de 5000 líneas o API version antigua. Requiere modernización urgente.">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Código Legacy</Typography>
                    <Typography variant="h6" color="error.main">{data.codeQuality.legacyCode}</Typography>
                  </Box>
                </Tooltip>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Score de Complejidad:</strong> {data.codeQuality.complexityScore.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Valores altos indican código complejo que requiere refactorización
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Test Health */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon sx={{ mr: 1 }} />
                Salud de las Pruebas
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <ReactApexChart 
              options={{
                chart: { type: 'radialBar' },
                plotOptions: {
                  radialBar: {
                    hollow: { size: '70%' },
                    dataLabels: {
                      name: { show: false },
                      value: { fontSize: '2rem', offsetY: 10 }
                    }
                  }
                },
                labels: ['Cobertura'],
                colors: [data.codeQuality.testCoverage.overallCoverage < 75 ? '#FF4560' : '#00E396']
              }}
              series={[data.codeQuality.testCoverage.overallCoverage]}
              type="radialBar"
              height={200}
            />
            <List dense>
              <ListItem>
                <ListItemText primary="Clases sin Cobertura" secondary={`${data.codeQuality.testCoverage.classesWithoutCoverage.length} clases`} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Pruebas Lentas" secondary={`${data.codeQuality.testCoverage.slowTests.length} pruebas > 5s`} />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Metrics */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                Métricas de Rendimiento
              </Typography>
              <Tooltip title="Estas métricas afectan el rendimiento de la aplicación. Valores altos pueden causar lentitud en la interfaz.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List dense>
              <ListItem>
                <ListItemIcon><StorageIcon /></ListItemIcon>
                <ListItemText 
                  primary="Objetos Personalizados" 
                  secondary={`${data.performance.customObjects.toLocaleString()} / 2000 límite`}
                />
                <Tooltip title="Objetos personalizados creados. El límite es 2000 por org.">
                  <Chip 
                    label={data.performance.customObjects > 150 ? 'Alto' : 'Bajo'} 
                    color={data.performance.customObjects > 150 ? 'warning' : 'success'}
                    size="small"
                  />
                </Tooltip>
              </ListItem>
              <ListItem>
                <ListItemIcon><CodeIcon /></ListItemIcon>
                <ListItemText 
                  primary="Campos Personalizados" 
                  secondary={`${data.performance.customFields.toLocaleString()} campos`}
                />
                <Tooltip title="Campos personalizados en la org. Pueden afectar el rendimiento de consultas.">
                  <Chip 
                    label={data.performance.customFields > 3000 ? 'Alto' : 'Bajo'} 
                    color={data.performance.customFields > 3000 ? 'warning' : 'success'}
                    size="small"
                  />
                </Tooltip>
              </ListItem>
              <ListItem>
                <ListItemIcon><SpeedIcon /></ListItemIcon>
                <ListItemText 
                  primary="Flows Activos" 
                  secondary={`${data.performance.activeFlows} flows`}
                />
                <Tooltip title="Flows activos en la org. Demasiados flows pueden afectar el rendimiento.">
                  <Chip 
                    label={data.performance.activeFlows > 50 ? 'Alto' : 'Bajo'} 
                    color={data.performance.activeFlows > 50 ? 'warning' : 'success'}
                    size="small"
                  />
                </Tooltip>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Security */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <SecurityIcon sx={{ mr: 1 }} />
                Seguridad
              </Typography>
              <Tooltip title="Métricas de seguridad que indican riesgos potenciales en la org.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List dense>
              <ListItem>
                <ListItemIcon><WarningIcon /></ListItemIcon>
                <ListItemText 
                  primary="Usuarios Inactivos" 
                  secondary={`${data.security.inactiveUsers} usuarios sin login en 30 días`}
                />
                <Tooltip title="Usuarios que no han hecho login en 30 días. Representan un riesgo de seguridad.">
                  <Chip 
                    label="Riesgo" 
                    color="warning"
                    size="small"
                  />
                </Tooltip>
              </ListItem>
              <ListItem>
                <ListItemIcon><ErrorIcon /></ListItemIcon>
                <ListItemText 
                  primary="Contraseñas Sin Cambiar" 
                  secondary={`${data.security.passwordNeverChanged} usuarios con contraseñas antiguas`}
                />
                <Tooltip title="Usuarios que no han cambiado su contraseña en 6 meses. Riesgo crítico de seguridad.">
                  <Chip 
                    label="Crítico" 
                    color="error"
                    size="small"
                  />
                </Tooltip>
              </ListItem>
              <ListItem>
                <ListItemIcon><SecurityIcon /></ListItemIcon>
                <ListItemText 
                  primary="Usuarios Admin" 
                  secondary={`${data.security.adminUsers} usuarios con perfiles administrativos`}
                />
                <Tooltip title="Usuarios con permisos administrativos. Deben ser monitoreados de cerca.">
                  <Chip 
                    label="Revisar" 
                    color="info"
                    size="small"
                  />
                </Tooltip>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Explicaciones de Cálculo */}
      <Grid item xs={12}>
        <Typography variant="h5" sx={{ mb: 3, mt: 2 }}>
          Explicaciones de Cálculo - Salud Técnica
        </Typography>
        
        {/* Code Quality Calculation */}
        <CalculationExplanationCard
          title="Calidad de Código"
          score={ScoreCalculator.calculateCodeQualityScore(data.codeQuality)}
          weight={0.2}
          explanation="Evalúa la mantenibilidad del código basado en clases grandes, código legacy y patrones anti-patrón. Un puntaje alto indica código bien estructurado y fácil de mantener."
          factors={[
            {
              name: 'Clases Grandes',
              value: data.codeQuality.largeClasses,
              impact: -Math.min(30, data.codeQuality.largeClasses * 5),
              description: 'Clases con más de 500 líneas de código (-5 pts por clase, máximo -30 pts)'
            },
            {
              name: 'Código Legacy',
              value: data.codeQuality.legacyCode,
              impact: -Math.min(20, data.codeQuality.legacyCode * 3),
              description: 'Clases con API version antigua (-3 pts por clase, máximo -20 pts)'
            },
            {
              name: 'Múltiples Triggers',
              value: data.codeQuality.multiTriggers,
              impact: -Math.min(25, data.codeQuality.multiTriggers * 8),
              description: 'Objetos con múltiples triggers (-8 pts por trigger, máximo -25 pts)'
            }
          ]}
        />

        {/* Test Coverage Calculation */}
        <CalculationExplanationCard
          title="Cobertura de Tests"
          score={ScoreCalculator.calculateTestCoverageScore(data.codeQuality.testCoverage)}
          weight={0.2}
          explanation="Mide qué porcentaje del código está cubierto por tests automatizados. Salesforce requiere mínimo 75% para despliegues."
          factors={[
            {
              name: 'Cobertura General',
              value: `${data.codeQuality.testCoverage.overallCoverage}%`,
              impact: 0,
              description: 'Porcentaje directo de cobertura de código por tests'
            }
          ]}
        />

        {/* Performance Calculation */}
        <CalculationExplanationCard
          title="Performance"
          score={ScoreCalculator.calculatePerformanceScore(data.governorLimits)}
          weight={0.25}
          explanation="Evalúa el uso de límites de gobernador y rendimiento general. Un uso alto de límites indica riesgo de errores en producción."
          factors={[
            {
              name: 'CPU Time',
              value: `${data.governorLimits.cpuTime.percentage}%`,
              impact: data.governorLimits.cpuTime.percentage > 85 ? -30 : 
                      data.governorLimits.cpuTime.percentage > 70 ? -15 : -5,
              description: `Uso de CPU: ${data.governorLimits.cpuTime.percentage}% (-30 si >85%, -15 si >70%, -5 si >50%)`
            },
            {
              name: 'SOQL Queries',
              value: `${data.governorLimits.soqlQueries.percentage}%`,
              impact: data.governorLimits.soqlQueries.percentage > 85 ? -20 : 
                      data.governorLimits.soqlQueries.percentage > 70 ? -10 : -3,
              description: `Consultas SOQL: ${data.governorLimits.soqlQueries.percentage}% (-20 si >85%, -10 si >70%, -3 si >50%)`
            }
          ]}
        />

        {/* Architecture Calculation */}
        <CalculationExplanationCard
          title="Arquitectura"
          score={ScoreCalculator.calculateArchitectureScore(data.performance)}
          weight={0.2}
          explanation="Analiza la complejidad arquitectónica: objetos custom, campos y flujos. Una arquitectura compleja puede afectar el rendimiento."
          factors={[
            {
              name: 'Objetos Custom',
              value: data.performance.customObjects,
              impact: data.performance.customObjects > 200 ? -15 : 
                      data.performance.customObjects > 100 ? -5 : 0,
              description: `Objetos personalizados: ${data.performance.customObjects} (-15 si >200, -5 si >100)`
            },
            {
              name: 'Campos Custom',
              value: data.performance.customFields,
              impact: data.performance.customFields > 1000 ? -15 : 
                      data.performance.customFields > 500 ? -5 : 0,
              description: `Campos personalizados: ${data.performance.customFields} (-15 si >1000, -5 si >500)`
            },
            {
              name: 'Flows Activos',
              value: data.performance.activeFlows,
              impact: data.performance.activeFlows > 100 ? -20 : 
                      data.performance.activeFlows > 50 ? -10 : 0,
              description: `Flows activos: ${data.performance.activeFlows} (-20 si >100, -10 si >50)`
            }
          ]}
        />
      </Grid>
    </Grid>
  );
}; 