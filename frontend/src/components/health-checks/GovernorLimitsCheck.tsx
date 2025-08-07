// Governor Limits Check Component
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
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Help as HelpIcon
} from '@mui/icons-material';

interface GovernorLimitsData {
  soqlQueries: { used: number; limit: number; percentage: number };
  dmlStatements: { used: number; limit: number; percentage: number };
  cpuTime: { used: number; limit: number; percentage: number };
  heapSize: { used: number; limit: number; percentage: number };
}

interface GovernorLimitsCheckProps {
  data?: GovernorLimitsData;
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

const NoDataMessage = () => (
  <Alert severity="info" sx={{ mb: 3 }}>
    <Typography variant="body1">
      ⚡ No hay datos de Governor Limits disponibles. Ejecuta un análisis para ver los resultados.
    </Typography>
  </Alert>
);

export const GovernorLimitsCheck: React.FC<GovernorLimitsCheckProps> = ({
  data,
  isLoading,
  hasData
}) => {
  console.log('⚡ GovernorLimitsCheck - Props:', { data, isLoading, hasData });
  
  if (isLoading) {
    console.log('⏳ Mostrando skeleton de carga de governor limits...');
    return <LoadingSkeleton />;
  }

  if (!hasData || !data) {
    console.log('📭 No hay datos de governor limits');
    return <NoDataMessage />;
  }

  console.log('✅ Mostrando datos de governor limits:', data);

  const governorLimits = [
    {
      name: 'SOQL Queries',
      data: data.soqlQueries,
      icon: <SpeedIcon />,
      description: 'Consultas SOQL ejecutadas'
    },
    {
      name: 'DML Statements',
      data: data.dmlStatements,
      icon: <SpeedIcon />,
      description: 'Operaciones DML ejecutadas'
    },
    {
      name: 'CPU Time',
      data: data.cpuTime,
      icon: <SpeedIcon />,
      description: 'Tiempo de CPU consumido'
    },
    {
      name: 'Heap Size',
      data: data.heapSize,
      icon: <SpeedIcon />,
      description: 'Memoria utilizada'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Governor Limits
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Análisis de los límites de gobernador de Salesforce
        </Typography>
      </Box>

      {/* Governor Limits Grid */}
      <Grid container spacing={3}>
        {governorLimits.map((limit, index) => {
          const riskLevel = getRiskLevel(limit.data.percentage);
          
          return (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ mr: 2, color: 'primary.main' }}>
                      {limit.icon}
                    </Box>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {limit.name}
                    </Typography>
                    <Tooltip title={getLimitDescription(limit.name.toLowerCase().replace(' ', ''))}>
                      <IconButton size="small">
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Uso: {limit.data.used.toLocaleString()} / {limit.data.limit.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {limit.data.percentage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={limit.data.percentage}
                      color={riskLevel.color}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip
                      label={riskLevel.level}
                      color={riskLevel.color}
                      size="small"
                      icon={riskLevel.color === 'error' ? <ErrorIcon /> : 
                            riskLevel.color === 'warning' ? <WarningIcon /> : <InfoIcon />}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {riskLevel.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Recommendations */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recomendaciones para Governor Limits
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {data.cpuTime.percentage > 70 && (
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Optimizar código Apex"
                  secondary="El uso de CPU está elevado. Considera optimizar consultas SOQL y reducir la complejidad del código."
                />
              </ListItem>
            )}
            
            {data.soqlQueries.percentage > 70 && (
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Reducir consultas SOQL"
                  secondary="Considera usar consultas más eficientes o implementar caché para reducir el número de consultas."
                />
              </ListItem>
            )}
            
            {data.heapSize.percentage > 70 && (
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Optimizar uso de memoria"
                  secondary="El uso de heap está elevado. Considera liberar variables innecesarias y optimizar colecciones."
                />
              </ListItem>
            )}
            
            {data.cpuTime.percentage <= 50 && data.soqlQueries.percentage <= 50 && (
              <ListItem>
                <ListItemIcon>
                  <InfoIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Uso saludable"
                  secondary="Los governor limits están en niveles saludables. Continúa monitoreando regularmente."
                />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}; 