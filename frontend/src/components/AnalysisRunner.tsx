// Analysis Runner Component
import React from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { useAnalysisStore } from '../stores/analysisStore';

export const AnalysisRunner: React.FC = () => {
  const { analysis, runAnalysis } = useAnalysisStore();
  

  const handleRunAnalysis = async () => {
    try {
      
      await runAnalysis();
    } catch (error) {
      console.error('Error running analysis:', error);
    } finally {
      
    }
  };

  const getAnalysisStatus = () => {
    if (analysis.isRunning) return 'Ejecutando análisis...';
    if (analysis.error) return `Error: ${analysis.error}`;
    if (analysis.results) return 'Análisis completado';
    return 'Listo para ejecutar';
  };

  

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Ejecutar Análisis
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {getAnalysisStatus()}
          </Typography>
        </Box>

        {analysis.isRunning && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="indeterminate" />
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={analysis.isRunning ? <Stop /> : <PlayArrow />}
            onClick={handleRunAnalysis}
            disabled={analysis.isRunning}
            fullWidth
          >
            {analysis.isRunning ? 'Detener' : 'Ejecutar Análisis'}
          </Button>
        </Box>

        {analysis.results && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Resultados del Análisis:
            </Typography>
            <Grid container spacing={1}>
              <Grid item>
                <Chip
                  label={`Clases: ${analysis.results.technical.codeQuality.totalClasses}`}
                  size="small"
                  color="primary"
                />
              </Grid>
              <Grid item>
                <Chip
                  label={`Cobertura: ${analysis.results.technical.codeQuality.testCoverage.overallCoverage}%`}
                  size="small"
                  color={analysis.results.technical.codeQuality.testCoverage.overallCoverage >= 75 ? 'success' : 'warning'}
                />
              </Grid>
              <Grid item>
                <Chip
                  label={`CPU: ${analysis.results.technical.governorLimits.cpuTime.percentage.toFixed(1)}%`}
                  size="small"
                  color={analysis.results.technical.governorLimits.cpuTime.percentage > 80 ? 'error' : 'success'}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {analysis.error && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="body2" color="error.dark">
              Error: {analysis.error}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};