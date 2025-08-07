// Health Score Card Component
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { useAnalysisStore } from '../stores/analysisStore';
import { ScoreCalculator } from '../utils/scoreCalculator';

export const HealthScoreCard: React.FC = () => {
  const results = useAnalysisStore(state => state.analysis.results);

  if (!results) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Puntuación de Salud
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ejecuta un análisis para ver la puntuación
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Calculate health score using unified calculator
  const calculateHealthScore = () => {
    return ScoreCalculator.calculateOverallScore(results.technical, results.financial);
  };

  const healthScore = calculateHealthScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Crítico';
  };

  const getTrendIcon = () => {
    // Basado en datos reales del análisis
    const trend = results.summary?.overallScore || 0;
    return <TrendingUp color={trend >= 80 ? 'success' : trend >= 60 ? 'warning' : 'error'} />;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div">
            Puntuación de Salud
          </Typography>
          {getTrendIcon()}
        </Box>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h2" component="div" color={`${getScoreColor(healthScore)}.main`}>
            {healthScore}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getScoreLabel(healthScore)}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Progreso</Typography>
            <Typography variant="body2">{healthScore}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={healthScore}
            color={getScoreColor(healthScore) as any}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {results.summary && (
            <Chip
              label={`Cobertura: ${results.summary.avgCodeCoverage || 0}%`}
              size="small"
              color={(results.summary.avgCodeCoverage || 0) >= 80 ? 'success' : 'warning'}
            />
          )}
          {results.technical && (
            <Chip
              label={`Clases: ${results.technical.codeQuality?.totalClasses || 0}`}
              size="small"
              color="primary"
            />
          )}
          {results.financial && (
            <Chip
              label={`Ahorro: $${(results.financial.licenses?.yearlyWaste || 0).toLocaleString()}`}
              size="small"
              color="error"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}; 