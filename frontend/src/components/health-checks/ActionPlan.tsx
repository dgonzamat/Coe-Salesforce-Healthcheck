import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  
  Skeleton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  PriorityHigh as PriorityHighIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ExpandMore as ExpandMoreIcon
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
    testCoverage: number;
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

interface ActionPlanProps {
  technicalData?: TechnicalData;
  financialData?: FinancialData;
  isLoading: boolean;
  hasData: boolean;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'P0': return 'error';
    case 'P1': return 'warning';
    case 'P2': return 'info';
    case 'P3': return 'success';
    default: return 'default';
  }
};

const generatePriorityMatrix = (technicalData?: TechnicalData, financialData?: FinancialData) => {
  const matrix = [];

  // P0 - Critical Issues
  if (technicalData?.codeQuality.testCoverage && technicalData.codeQuality.testCoverage < 75) {
    matrix.push({
      priority: 'P0',
      issue: 'Code Coverage <75%',
      threshold: 'Required',
      realCostImpact: 'Blocks deployment',
      effort: '24-80h',
      roi: 'N/A',
      status: 'Critical'
    });
  }

  if (technicalData?.governorLimits?.soqlQueries?.percentage && technicalData.governorLimits.soqlQueries.percentage > 85) {
    matrix.push({
      priority: 'P0',
      issue: 'API Usage >85%',
      threshold: 'Critical',
      realCostImpact: 'Service disruption',
      effort: '8-16h',
      roi: 'High',
      status: 'Critical'
    });
  }

  // P1 - High Priority
  if (financialData?.licenses?.unusedLicenses && financialData.licenses.unusedLicenses > 20) {
    matrix.push({
      priority: 'P1',
      issue: 'Unused Licenses >20%',
      threshold: 'Best Practice',
      realCostImpact: '$5-20k/month',
      effort: '8-16h',
      roi: '500%+',
      status: 'High'
    });
  }

  if (technicalData?.codeQuality?.multiTriggers && technicalData.codeQuality.multiTriggers > 0) {
    matrix.push({
      priority: 'P1',
      issue: 'Multiple Triggers',
      threshold: 'Architecture',
      realCostImpact: 'Debug complexity',
      effort: '40-80h',
      roi: '200%',
      status: 'High'
    });
  }

  // P2 - Medium Priority
  if (technicalData?.performance?.customObjects && technicalData.performance.customObjects > 200) {
    matrix.push({
      priority: 'P2',
      issue: 'Objects >200',
      threshold: 'Complexity',
      realCostImpact: 'Maintenance cost',
      effort: '160h+',
      roi: '100%',
      status: 'Medium'
    });
  }

  // P3 - Low Priority
  matrix.push({
    priority: 'P3',
    issue: 'Documentation <50%',
    threshold: 'Quality',
    realCostImpact: 'Onboarding time',
    effort: '80h',
    roi: '50%',
    status: 'Low'
  });

  return matrix;
};

const LoadingSkeleton = () => (
  <Grid container spacing={3}>
    {[1, 2, 3].map((item) => (
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

const NoDataMessage = () => (
  <Alert severity="info" sx={{ mb: 3 }}>
    <Typography variant="body1">
      📊 No hay datos disponibles para generar el plan de acción. Ejecuta un análisis para ver las recomendaciones.
    </Typography>
  </Alert>
);

export const ActionPlan: React.FC<ActionPlanProps> = ({
  technicalData,
  financialData,
  isLoading,
  hasData
}) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!hasData || (!technicalData && !financialData)) {
    return <NoDataMessage />;
  }

  const priorityMatrix = generatePriorityMatrix(technicalData, financialData);

  // Métricas de monitoreo alineadas con Salesforce
  const monitoringMetrics = {
    reliability: {
      errorRate: '<1%',
      availability: '>99.9%',
      mttr: '<2 hours'
    },
    performance: {
      pageLoadTime: '<3 seconds',
      batchJobTime: '<2 hours',
      apiResponseTime: '<1 second'
    },
    operational: {
      deploymentFrequency: 'Weekly',
      leadTimeForChanges: '<1 week',
      changeFailureRate: '<5%'
    },
    cost: {
      costPerUser: '<$200/month',
      unusedLicenseRate: '<10%',
      technicalDebtRatio: '<20%'
    }
  };

  // Plan de acción priorizado basado en datos reales
  const actionPlan = {
    immediate: {
      timeline: '1-2 semanas',
      actions: [
        { 
          action: 'Remover licencias no utilizadas', 
          savings: financialData?.licenses.yearlyWaste ? `$${financialData.licenses.yearlyWaste.toLocaleString()}/año` : '$10-50k/mo', 
          effort: '2 días' 
        },
        { 
          action: 'Desactivar usuarios inactivos', 
          savings: technicalData?.security.inactiveUsers ? `$${technicalData.security.inactiveUsers * 150 * 12}/año` : '$5-20k/mo', 
          effort: '1 día' 
        },
        { 
          action: 'Archivar datos antiguos', 
          savings: financialData?.storage.yearlyOverage ? `$${financialData.storage.yearlyOverage.toLocaleString()}/año` : '$500-5k/mo', 
          effort: '3 días' 
        }
      ]
    },
    shortTerm: {
      timeline: '1-3 meses',
      actions: [
        { 
          action: 'Optimización de código', 
          savings: technicalData?.codeQuality.complexityScore ? `$${Math.round(technicalData.codeQuality.complexityScore * 10)}/año` : '$50k/año', 
          effort: '2 meses' 
        },
        { 
          action: 'Mejorar cobertura de pruebas', 
          savings: technicalData?.codeQuality.testCoverage && technicalData.codeQuality.testCoverage < 75 ? '$25k/año' : '$25k/año', 
          effort: '2 meses' 
        },
        { 
          action: 'Consolidar triggers', 
          savings: technicalData?.codeQuality.multiTriggers ? `$${technicalData.codeQuality.multiTriggers * 10000}/año` : '$75k/año', 
          effort: '1 mes' 
        }
      ]
    },
    strategic: {
      timeline: '6-12 meses',
      actions: [
        { 
          action: 'Rediseño de arquitectura', 
          savings: technicalData?.performance.customObjects && technicalData.performance.customObjects > 200 ? '$40k/año' : '$40k/año', 
          effort: '6-9 meses' 
        },
        { 
          action: 'Simplificación de plataforma', 
          savings: technicalData?.codeQuality.totalClasses ? `$${Math.round(technicalData.codeQuality.totalClasses * 50)}/año` : '$100k/año', 
          effort: '9-12 meses' 
        },
        { 
          action: 'Gobernanza de automatización', 
          savings: technicalData?.performance.activeFlows && technicalData.performance.activeFlows > 50 ? '$150k/año' : '$150k/año', 
          effort: '2 meses' 
        }
      ]
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Priority Matrix */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PriorityHighIcon sx={{ mr: 1 }} />
              Matriz de Prioridades
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Prioridad</strong></TableCell>
                    <TableCell><strong>Problema</strong></TableCell>
                    <TableCell><strong>Umbral</strong></TableCell>
                    <TableCell><strong>Impacto Real</strong></TableCell>
                    <TableCell><strong>Esfuerzo</strong></TableCell>
                    <TableCell><strong>ROI</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {priorityMatrix.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip 
                          label={row.priority} 
                          color={getPriorityColor(row.priority) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{row.issue}</TableCell>
                      <TableCell>{row.threshold}</TableCell>
                      <TableCell>{row.realCostImpact}</TableCell>
                      <TableCell>{row.effort}</TableCell>
                      <TableCell>{row.roi}</TableCell>
                      <TableCell>
                        <Chip 
                          label={row.status} 
                          color={row.status === 'Critical' ? 'error' : 
                                 row.status === 'High' ? 'warning' : 
                                 row.status === 'Medium' ? 'info' : 'success'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Monitoring Metrics */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ mr: 1 }} />
              Métricas de Monitoreo
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Confiabilidad</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Tasa de Error" 
                      secondary={`< ${monitoringMetrics.reliability.errorRate}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Disponibilidad" 
                      secondary={monitoringMetrics.reliability.availability}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="MTTR" 
                      secondary={monitoringMetrics.reliability.mttr}
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Rendimiento</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Tiempo de Carga" 
                      secondary={monitoringMetrics.performance.pageLoadTime}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Tiempo de Trabajo por Lotes" 
                      secondary={monitoringMetrics.performance.batchJobTime}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Tiempo de Respuesta API" 
                      secondary={monitoringMetrics.performance.apiResponseTime}
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Operacional</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Frecuencia de Despliegue" 
                      secondary={monitoringMetrics.operational.deploymentFrequency}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Tiempo de Líder para Cambios" 
                      secondary={monitoringMetrics.operational.leadTimeForChanges}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Tasa de Fallo de Cambios" 
                      secondary={monitoringMetrics.operational.changeFailureRate}
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      </Grid>

      {/* Action Plan */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TimelineIcon sx={{ mr: 1 }} />
              Plan de Acción Priorizado
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" color="success.main">
                  Inmediato ({actionPlan.immediate.timeline})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {actionPlan.immediate.actions.map((action, index) => (
                    <ListItem key={index}>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary={action.action}
                        secondary={`Ahorro: ${action.savings} | Esfuerzo: ${action.effort}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" color="warning.main">
                  Corto Plazo ({actionPlan.shortTerm.timeline})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {actionPlan.shortTerm.actions.map((action, index) => (
                    <ListItem key={index}>
                      <ListItemIcon><TrendingUpIcon color="warning" /></ListItemIcon>
                      <ListItemText 
                        primary={action.action}
                        secondary={`Ahorro: ${action.savings} | Esfuerzo: ${action.effort}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" color="info.main">
                  Estratégico ({actionPlan.strategic.timeline})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {actionPlan.strategic.actions.map((action, index) => (
                    <ListItem key={index}>
                      <ListItemIcon><TrendingDownIcon color="info" /></ListItemIcon>
                      <ListItemText 
                        primary={action.action}
                        secondary={`Ahorro: ${action.savings} | Esfuerzo: ${action.effort}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      </Grid>

      {/* Implementation Guide */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TimelineIcon sx={{ mr: 1 }} />
              Guía de Implementación
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Typography variant="h6" color="primary">Paso 1: Extracción API (1 hora)</Typography>
                <Typography variant="body2" color="text.secondary">
                  • Conectar a Salesforce<br/>
                  • Extraer todas las métricas<br/>
                  • Generar reporte de costos
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Typography variant="h6" color="success.main">Paso 2: Ganancias Rápidas (1 día)</Typography>
                <Typography variant="body2" color="text.secondary">
                  • Licencias no utilizadas {'>'} $5k/mes<br/>
                  • Usuarios inactivos {'>'} 10<br/>
                  • Almacenamiento {'>'} 80%<br/>
                  • Uso de API {'>'} 70%
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Typography variant="h6" color="warning.main">Paso 3: Plan de Remedación (1 semana)</Typography>
                <Typography variant="body2" color="text.secondary">
                  • Prioridad P0: Riesgos inmediatos<br/>
                  • Prioridad P1: Elementos de alto ROI<br/>
                  • Prioridad P2: Mejoras a mediano plazo<br/>
                  • Prioridad P3: Iniciativas estratégicas
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Typography variant="h6" color="info.main">Paso 4: Seguimiento (Mensual)</Typography>
                <Typography variant="body2" color="text.secondary">
                  • Re-ejecutar extracción API<br/>
                  • Comparar métricas<br/>
                  • Calcular ahorros realizados<br/>
                  • Ajustar prioridades
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};