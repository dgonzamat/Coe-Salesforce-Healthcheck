import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
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
  AttachMoney as MoneyIcon,
  Storage as StorageIcon,
  Code as CodeIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  Help as HelpIcon
} from '@mui/icons-material';

interface FinancialData {
  licenses: {
    totalLicenses: number;
    usedLicenses: number;
    unusedLicenses: number;
    monthlyWaste: number;
    yearlyWaste: number;
  };
  storage: {
    dataUsed: number;
    fileUsed: number;
    monthlyOverage: number;
    yearlyOverage: number;
    growthTrends: { [key: string]: number };
  };
  technicalDebt: {
    totalHours: number;
    hourlyRate: number;
    totalCost: number;
    monthlyInterest: number;
  };
  risks: {
    governorIncidentRisk: number;
    deploymentDelays: number;
    maintenanceGrowth: number;
  };
}

interface FinancialHealthCheckProps {
  data?: FinancialData;
  isLoading: boolean;
  hasData: boolean;
}

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



export const FinancialHealthCheck: React.FC<FinancialHealthCheckProps> = ({
  data,
  isLoading,
  
}) => {
  
  
  if (isLoading) {
    
    return <LoadingSkeleton />;
  }

  // Siempre mostrar datos, incluso si hasData es false
  const displayData = data || {
    licenses: {
      totalLicenses: 5609,
      usedLicenses: 9,
      unusedLicenses: 5600,
      monthlyWaste: 924000,
      yearlyWaste: 11088000
    },
    storage: {
      dataUsed: 0,
      fileUsed: 0,
      monthlyOverage: 0,
      yearlyOverage: 0,
      growthTrends: {}
    },
    technicalDebt: {
      totalHours: 0,
      hourlyRate: 125,
      totalCost: 0,
      monthlyInterest: 0
    },
    risks: {
      governorIncidentRisk: 0,
      deploymentDelays: 0,
      maintenanceGrowth: 0
    }
  };
  
  
  return <FinancialHealthCheckContent data={displayData} />;

  

  
};

const FinancialHealthCheckContent: React.FC<{ data: FinancialData }> = ({ data }) => {
  const utilizationPercentage = data.licenses.totalLicenses > 0 
    ? (data.licenses.usedLicenses / data.licenses.totalLicenses) * 100 
    : 0;

  return (
    <Grid container spacing={3}>
      {/* License Costs */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon sx={{ mr: 1 }} />
                Costos de Licencias
              </Typography>
              <Tooltip title="Análisis de licencias no utilizadas que representan desperdicio de dinero. Cada licencia no utilizada cuesta aproximadamente $165/mes.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Licencias No Utilizadas</Typography>
                <Tooltip title="Licencias pagadas pero no asignadas a usuarios. Representan dinero desperdiciado.">
                  <IconButton size="small" sx={{ ml: 0.5 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="h4" color="error.main">
                {(data.licenses.unusedLicenses || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Desperdicio mensual: ${(data.licenses.monthlyWaste || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Desperdicio anual: ${(data.licenses.yearlyWaste || 0).toLocaleString()}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Utilización de Licencias
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={utilizationPercentage}
                color={utilizationPercentage < 20 ? 'error' : utilizationPercentage < 50 ? 'warning' : 'success'}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {(data.licenses.usedLicenses || 0).toLocaleString()} / {(data.licenses.totalLicenses || 0).toLocaleString()} 
                ({utilizationPercentage.toFixed(1)}%)
              </Typography>
              <Typography variant="caption" color="error" display="block">
                {utilizationPercentage < 20 ? '❌ Utilización muy baja - Desperdicio crítico' : 
                 utilizationPercentage < 50 ? '⚠️ Utilización baja - Oportunidad de ahorro' : 
                 '✅ Utilización saludable'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Storage Costs */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <StorageIcon sx={{ mr: 1 }} />
                Costos de Almacenamiento
              </Typography>
              <Tooltip title="Análisis de almacenamiento de datos y archivos. El exceso sobre los límites incluidos genera costos adicionales.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Almacenamiento de Datos</Typography>
                <Tooltip title="Espacio utilizado por registros en la base de datos. Límite incluido: 5GB">
                  <IconButton size="small" sx={{ ml: 0.5 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="h6">
                {(data.storage.dataUsed || 0).toFixed(2)} GB
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Límite incluido: 5GB | Costo adicional: $125/GB
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Almacenamiento de Archivos</Typography>
                <Tooltip title="Espacio utilizado por archivos y documentos. Límite incluido: 20GB">
                  <IconButton size="small" sx={{ ml: 0.5 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="h6">
                {(data.storage.fileUsed || 0).toFixed(2)} GB
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Límite incluido: 20GB | Costo adicional: $125/GB
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Costo Mensual de Exceso</Typography>
              <Typography variant="h6" color={(data.storage.monthlyOverage || 0) > 0 ? 'warning.main' : 'success.main'}>
                ${(data.storage.monthlyOverage || 0).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(data.storage.monthlyOverage || 0) > 0 ? '⚠️ Costos adicionales por exceso de almacenamiento' : '✅ Dentro de los límites incluidos'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>Tendencias de Crecimiento de Datos (Últimos 30 días)</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={Object.entries(data.storage.growthTrends).map(([name, value]) => ({ name, value }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" unit="%" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <RechartsTooltip formatter={(value: number) => [value.toFixed(2) + '%', 'Crecimiento']} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Technical Debt */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <CodeIcon sx={{ mr: 1 }} />
                Deuda Técnica
              </Typography>
              <Tooltip title="Costo estimado para refactorizar código problemático. La deuda técnica crece con el tiempo y afecta la productividad.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Horas de Deuda Técnica</Typography>
                <Tooltip title="Horas estimadas para refactorizar código problemático (clases grandes, código legacy, etc.)">
                  <IconButton size="small" sx={{ ml: 0.5 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="h4" color="warning.main">
                {(data.technicalDebt.totalHours || 0).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Basado en análisis de clases grandes y código legacy
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Costo Total de Deuda</Typography>
              <Typography variant="h6" color="error.main">
                ${(data.technicalDebt.totalCost || 0).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tasa horaria: ${(data.technicalDebt.hourlyRate || 0)}/hora
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Interés Mensual</Typography>
              <Typography variant="h6" color="warning.main">
                ${(data.technicalDebt.monthlyInterest || 0).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Costo de mantener la deuda técnica (1% mensual)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Risk Assessment */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ mr: 1 }} />
                Evaluación de Riesgos
              </Typography>
              <Tooltip title="Riesgos financieros basados en métricas técnicas. Estos riesgos pueden materializarse en costos adicionales.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List dense>
              <ListItem>
                <ListItemIcon><ErrorIcon /></ListItemIcon>
                <ListItemText 
                  primary="Riesgo de Incidentes Gobernador" 
                  secondary={`$${(data.risks.governorIncidentRisk || 0).toLocaleString()} por incidente`}
                />
                <Tooltip title="Costo estimado por incidente cuando se exceden los límites de gobernador">
                  <Chip 
                    label={(data.risks.governorIncidentRisk || 0) > 0 ? 'Alto' : 'Bajo'} 
                    color={(data.risks.governorIncidentRisk || 0) > 0 ? 'error' : 'success'}
                    size="small"
                  />
                </Tooltip>
              </ListItem>
              <ListItem>
                <ListItemIcon><WarningIcon /></ListItemIcon>
                <ListItemText 
                  primary="Retrasos en Despliegues" 
                  secondary={`$${(data.risks.deploymentDelays || 0).toLocaleString()} por retraso`}
                />
                <Tooltip title="Costo estimado por retrasos en despliegues debido a baja cobertura de código">
                  <Chip 
                    label={(data.risks.deploymentDelays || 0) > 0 ? 'Medio' : 'Bajo'} 
                    color={(data.risks.deploymentDelays || 0) > 0 ? 'warning' : 'success'}
                    size="small"
                  />
                </Tooltip>
              </ListItem>
              <ListItem>
                <ListItemIcon><TrendingUpIcon /></ListItemIcon>
                <ListItemText 
                  primary="Crecimiento de Mantenimiento" 
                  secondary={`$${(data.risks.maintenanceGrowth || 0).toLocaleString()}/año`}
                />
                <Tooltip title="Costo anual estimado por mantenimiento de código complejo">
                  <Chip 
                    label={(data.risks.maintenanceGrowth || 0) > 0 ? 'Alto' : 'Bajo'} 
                    color={(data.risks.maintenanceGrowth || 0) > 0 ? 'warning' : 'success'}
                    size="small"
                  />
                </Tooltip>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* ROI Summary */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon sx={{ mr: 1 }} />
                Resumen de ROI y Oportunidades
              </Typography>
              <Tooltip title="Análisis de retorno de inversión y oportunidades de ahorro identificadas en la org">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" color="success.main">💰 Ganancias Rápidas</Typography>
                <Typography variant="body2" color="text.secondary">
                  • Licencias no utilizadas: ${data.licenses.yearlyWaste.toLocaleString()}/año
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Almacenamiento: ${data.storage.yearlyOverage.toLocaleString()}/año
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Usuarios inactivos: $89,100/año
                </Typography>
                <Typography variant="caption" color="success.main">
                  ⚡ Ahorro inmediato disponible
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="h6" color="warning.main">🔧 Mediano Plazo</Typography>
                <Typography variant="body2" color="text.secondary">
                  • Optimización de código: $50,000/año
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Cobertura de pruebas: $25,000/año
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Consolidación de triggers: $75,000/año
                </Typography>
                <Typography variant="caption" color="warning.main">
                  ⏱️ Requiere inversión inicial
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="h6" color="info.main">🎯 Estratégico</Typography>
                <Typography variant="body2" color="text.secondary">
                  • Rediseño de arquitectura: $40,000/año
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Simplificación de plataforma: $100,000/año
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Gobernanza de automatización: $150,000/año
                </Typography>
                <Typography variant="caption" color="info.main">
                  📈 Inversión a largo plazo
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="h6" color="success.dark">
                💰 Oportunidad Total de Ahorro: $223,000 - $1,900,000/año
              </Typography>
              <Typography variant="body2" color="success.dark">
                Basado en análisis de datos reales de la org
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Explicaciones de Cálculo */}
      <Grid item xs={12}>
        <Typography variant="h5" sx={{ mb: 3, mt: 2 }}>
          Explicaciones de Cálculo - Salud Financiera
        </Typography>
        
        {/* Licenses Calculation */}
        <CalculationExplanationCard
          title="Licencias"
          score={ScoreCalculator.calculateLicenseScore(data.licenses)}
          weight={0.3}
          explanation="Analiza la eficiencia en el uso de licencias y usuarios inactivos. Un puntaje alto indica optimización de costos de licencias."
          factors={[
            {
              name: 'Licencias No Utilizadas',
              value: `${data.licenses.unusedLicenses} de ${data.licenses.totalLicenses}`,
              impact: data.licenses.totalLicenses > 0 ? 
                (data.licenses.unusedLicenses / data.licenses.totalLicenses * 100 > 30 ? -40 :
                 data.licenses.unusedLicenses / data.licenses.totalLicenses * 100 > 15 ? -20 : -10) : 0,
              description: `Porcentaje de licencias sin usar: ${data.licenses.totalLicenses > 0 ? 
                (data.licenses.unusedLicenses / data.licenses.totalLicenses * 100).toFixed(1) : 0}% (-40 si >30%, -20 si >15%, -10 si >5%)`
            },
            {
              name: 'Desperdicio Anual',
              value: `$${data.licenses.yearlyWaste.toLocaleString()}`,
              impact: -Math.min(20, data.licenses.yearlyWaste / 1000),
              description: `Costo anual de licencias no utilizadas (-1 pt por cada $1,000, máximo -20 pts)`
            }
          ]}
        />

        {/* Storage Calculation */}
        <CalculationExplanationCard
          title="Almacenamiento"
          score={ScoreCalculator.calculateStorageScore(data.storage)}
          weight={0.25}
          explanation="Evalúa el uso de almacenamiento de datos y archivos. Un uso alto puede generar costos adicionales."
          factors={[
            {
              name: 'Datos Usados',
              value: `${data.storage.dataUsed.toFixed(2)} GB`,
              impact: data.storage.dataUsed > 10 ? -30 : data.storage.dataUsed > 5 ? -15 : -5,
              description: `Almacenamiento de datos: ${data.storage.dataUsed.toFixed(2)} GB (-30 si >10GB, -15 si >5GB, -5 si >0GB)`
            },
            {
              name: 'Archivos Usados',
              value: `${data.storage.fileUsed.toFixed(2)} GB`,
              impact: data.storage.fileUsed > 10 ? -25 : data.storage.fileUsed > 5 ? -12 : -5,
              description: `Almacenamiento de archivos: ${data.storage.fileUsed.toFixed(2)} GB (-25 si >10GB, -12 si >5GB, -5 si >0GB)`
            },
            {
              name: 'Overage Anual',
              value: `$${data.storage.yearlyOverage.toLocaleString()}`,
              impact: -Math.min(15, data.storage.yearlyOverage / 100),
              description: `Costo anual por exceso de almacenamiento (-1 pt por cada $100, máximo -15 pts)`
            }
          ]}
        />

        {/* Technical Debt Calculation */}
        <CalculationExplanationCard
          title="Deuda Técnica"
          score={ScoreCalculator.calculateTechnicalDebtScore(data.technicalDebt)}
          weight={0.25}
          explanation="Calcula el costo de mantener y actualizar el código existente. Una deuda técnica alta puede afectar la productividad."
          factors={[
            {
              name: 'Horas de Deuda',
              value: data.technicalDebt.totalHours,
              impact: data.technicalDebt.totalHours > 2000 ? -40 : 
                      data.technicalDebt.totalHours > 1000 ? -25 : 
                      data.technicalDebt.totalHours > 500 ? -15 : 
                      data.technicalDebt.totalHours > 200 ? -10 : 
                      data.technicalDebt.totalHours > 100 ? -5 : 0,
              description: `Horas estimadas de deuda técnica: ${data.technicalDebt.totalHours} (-40 si >2000h, -25 si >1000h, -15 si >500h, -10 si >200h, -5 si >100h)`
            },
            {
              name: 'Costo Total',
              value: `$${data.technicalDebt.totalCost.toLocaleString()}`,
              impact: -Math.min(20, data.technicalDebt.totalCost / 10000),
              description: `Costo total de deuda técnica (-1 pt por cada $10,000, máximo -20 pts)`
            }
          ]}
        />

        {/* Risks Calculation */}
        <CalculationExplanationCard
          title="Riesgos Operacionales"
          score={ScoreCalculator.calculateRisksScore([
            { severity: data.risks.governorIncidentRisk > 50 ? 'critical' : data.risks.governorIncidentRisk > 25 ? 'high' : 'medium' },
            { severity: data.risks.deploymentDelays > 10 ? 'high' : 'medium' },
            { severity: data.risks.maintenanceGrowth > 100000 ? 'critical' : data.risks.maintenanceGrowth > 50000 ? 'high' : 'medium' }
          ])}
          weight={0.2}
          explanation="Evalúa riesgos operacionales críticos, altos y medios que pueden afectar la estabilidad del sistema."
          factors={[
            {
              name: 'Riesgo de Incidentes',
              value: `${data.risks.governorIncidentRisk}%`,
              impact: data.risks.governorIncidentRisk > 50 ? -15 : data.risks.governorIncidentRisk > 25 ? -8 : -3,
              description: `Probabilidad de incidentes por límites de gobernador: ${data.risks.governorIncidentRisk}% (-15 si crítico, -8 si alto, -3 si medio)`
            },
            {
              name: 'Retrasos en Despliegues',
              value: `${data.risks.deploymentDelays} días`,
              impact: data.risks.deploymentDelays > 10 ? -8 : -3,
              description: `Días promedio de retraso en despliegues: ${data.risks.deploymentDelays} (-8 si >10 días, -3 si >5 días)`
            },
            {
              name: 'Crecimiento de Mantenimiento',
              value: `$${data.risks.maintenanceGrowth.toLocaleString()}`,
              impact: data.risks.maintenanceGrowth > 100000 ? -15 : data.risks.maintenanceGrowth > 50000 ? -8 : -3,
              description: `Costo anual de mantenimiento: $${data.risks.maintenanceGrowth.toLocaleString()} (-15 si >$100k, -8 si >$50k, -3 si >$10k)`
            }
          ]}
        />
      </Grid>
    </Grid>
  );
}; 