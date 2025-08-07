import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ExpandMore,
  Info,
  TrendingUp,
  TrendingDown,
  CheckCircle
} from '@mui/icons-material';

interface CalculationFactor {
  name: string;
  value: string | number;
  impact: number;
  description: string;
}

interface CalculationExplanationProps {
  title: string;
  score: number;
  factors: CalculationFactor[];
  explanation: string;
  weight?: number;
}

export const CalculationExplanationCard: React.FC<CalculationExplanationProps> = ({
  title,
  score,
  factors,
  explanation,
  weight
}) => {
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

  const getImpactIcon = (impact: number) => {
    if (impact > 0) return <TrendingUp color="success" />;
    if (impact < 0) return <TrendingDown color="error" />;
    return <CheckCircle color="info" />;
  };

  const getImpactColor = (impact: number) => {
    if (impact > 0) return 'success';
    if (impact < 0) return 'error';
    return 'info';
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={`${score} pts`}
              color={getScoreColor(score)}
              size="small"
            />
            {weight && (
              <Chip
                label={`Peso: ${(weight * 100).toFixed(0)}%`}
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          {explanation}
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <Info fontSize="small" />
              <Typography variant="subtitle2">
                Ver factores de cálculo
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {factors.map((factor, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getImpactIcon(factor.impact)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight="medium">
                          {factor.name}
                        </Typography>
                        <Chip
                          label={factor.value}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`${factor.impact > 0 ? '+' : ''}${factor.impact} pts`}
                          color={getImpactColor(factor.impact)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={factor.description}
                  />
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="medium">
                Puntaje final:
              </Typography>
              <Chip
                label={`${score} puntos - ${getScoreLabel(score)}`}
                color={getScoreColor(score)}
                size="small"
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};
