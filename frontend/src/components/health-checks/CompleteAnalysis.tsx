import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TrendingUp,
  
  Warning,
  CheckCircle,
  Error,
  
} from '@mui/icons-material';

interface CompleteAnalysisProps {
  data?: any;
  loading?: boolean;
  error?: string;
}

const CompleteAnalysis: React.FC<CompleteAnalysisProps> = ({ data, loading, error }) => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'info';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 90) return <CheckCircle />;
    if (score >= 75) return <TrendingUp />;
    if (score >= 60) return <Warning />;
    return <Error />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error: {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info">
        No hay datos de análisis disponibles. Ejecuta un análisis completo para ver los resultados.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Resumen Ejecutivo */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Resumen Ejecutivo
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h3" color={getHealthColor(data.overallScore)}>
                  {data.overallScore}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Score General
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Estado de Salud: {data.summary?.overallHealth}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Nivel de Riesgo: {data.summary?.riskLevel}
              </Typography>
              
              {data.potentialSavings && (
                <Box mt={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Ahorros Potenciales Anuales:
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    ${data.potentialSavings.total?.toLocaleString() || 0}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Métricas Clave */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Salud Técnica
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                {getHealthIcon(data.technicalHealth?.overallScore)}
                <Typography variant="h4" sx={{ ml: 1 }}>
                  {data.technicalHealth?.overallScore || 0}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={data.technicalHealth?.overallScore || 0}
                color={getHealthColor(data.technicalHealth?.overallScore)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Salud Financiera
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                {getHealthIcon(data.financialHealth?.overallScore)}
                <Typography variant="h4" sx={{ ml: 1 }}>
                  {data.financialHealth?.overallScore || 0}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={data.financialHealth?.overallScore || 0}
                color={getHealthColor(data.financialHealth?.overallScore)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recomendaciones */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recomendaciones Prioritarias
          </Typography>
          
          <Accordion expanded={expanded === 'recommendations'} onChange={handleAccordionChange('recommendations')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Ver todas las recomendaciones ({data.recommendations?.length || 0})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {data.recommendations?.map((rec: any, index: number) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip 
                              label={rec.priority} 
                              color={getPriorityColor(rec.priority)}
                              size="small"
                            />
                            <Typography variant="subtitle1">
                              {rec.title}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {rec.description}
                            </Typography>
                            {rec.monthlySavings && (
                              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                                Ahorro mensual: ${rec.monthlySavings.toLocaleString()}
                              </Typography>
                            )}
                            {rec.effort && (
                              <Typography variant="body2" color="text.secondary">
                                Esfuerzo estimado: {rec.effort} horas
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < data.recommendations.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {/* Detalles Técnicos */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detalles Técnicos
          </Typography>
          
          <Accordion expanded={expanded === 'technical'} onChange={handleAccordionChange('technical')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Análisis de Código y Rendimiento</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {data.technicalHealth?.details && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Calidad de Código
                    </Typography>
                    <Typography variant="body2">
                      Clases totales: {data.technicalHealth.details.codeQuality?.totalClasses || 0}
                    </Typography>
                    <Typography variant="body2">
                      Clases grandes: {data.technicalHealth.details.codeQuality?.largeClasses?.length || 0}
                    </Typography>
                    <Typography variant="body2">
                      Triggers múltiples: {data.technicalHealth.details.codeQuality?.multiTriggers?.length || 0}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Cobertura de Pruebas
                    </Typography>
                    <Typography variant="body2">
                      Cobertura general: {data.technicalHealth.details.testCoverage?.overallCoverage?.toFixed(1) || 0}%
                    </Typography>
                    <Typography variant="body2">
                      Clases sin cobertura: {data.technicalHealth.details.testCoverage?.zeroCoverageClasses?.length || 0}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {/* Detalles Financieros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detalles Financieros
          </Typography>
          
          <Accordion expanded={expanded === 'financial'} onChange={handleAccordionChange('financial')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Análisis de Costos y Licencias</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {data.financialHealth?.details && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Licencias
                    </Typography>
                    <Typography variant="body2">
                      Total: {data.financialHealth.details.licenseAnalysis?.totalLicenses || 0}
                    </Typography>
                    <Typography variant="body2">
                      Utilizadas: {data.financialHealth.details.licenseAnalysis?.usedLicenses || 0}
                    </Typography>
                    <Typography variant="body2">
                      Desperdicio mensual: ${data.financialHealth.details.licenseAnalysis?.monthlyWaste?.toLocaleString() || 0}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Almacenamiento
                    </Typography>
                    <Typography variant="body2">
                      Datos: {data.financialHealth.details.storageAnalysis?.dataStorage?.percentage?.toFixed(1) || 0}%
                    </Typography>
                    <Typography variant="body2">
                      Archivos: {data.financialHealth.details.storageAnalysis?.fileStorage?.percentage?.toFixed(1) || 0}%
                    </Typography>
                    <Typography variant="body2">
                      Exceso anual: ${data.financialHealth.details.storageAnalysis?.yearlyOverage?.toLocaleString() || 0}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {/* Próximos Pasos */}
      {data.summary?.nextSteps && data.summary.nextSteps.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Próximos Pasos
            </Typography>
            
            {data.summary.nextSteps.map((step: any, index: number) => (
              <Box key={index} mb={2}>
                <Typography variant="subtitle1" gutterBottom>
                  {step.action}
                </Typography>
                <List dense>
                  {step.items?.map((item: any, itemIndex: number) => (
                    <ListItem key={itemIndex}>
                      <ListItemText
                        primary={item.title}
                        secondary={item.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CompleteAnalysis;