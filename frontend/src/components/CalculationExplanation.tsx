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
  Divider
} from '@mui/material';
import { ExpandMore, Info, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useAnalysisStore } from '../stores/analysisStore';
import { ScoreCalculator } from '../utils/scoreCalculator';

interface CalculationBreakdown {
  category: string;
  score: number;
  factors: Array<{
    name: string;
    value: number;
    impact: number;
    description: string;
  }>;
  explanation: string;
}

export const CalculationExplanation: React.FC = () => {
  const results = useAnalysisStore(state => state.analysis.results);

  if (!results) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Explicación de Cálculos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ejecuta un análisis para ver cómo se calculan los puntajes
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getCalculationBreakdown = (): CalculationBreakdown[] => {
    const scoreBreakdown = ScoreCalculator.getScoreBreakdown(results.technical, results.financial);
    const breakdown: CalculationBreakdown[] = [];

    // Technical Components
    Object.entries(scoreBreakdown.technical.components).forEach(([key, component]: [string, any]) => {
      const categoryNames: { [key: string]: string } = {
        codeQuality: 'Calidad de Código',
        testCoverage: 'Cobertura de Tests',
        performance: 'Performance',
        architecture: 'Arquitectura',
        dataQuality: 'Calidad de Datos'
      };

      const explanations: { [key: string]: string } = {
        codeQuality: 'Evalúa la mantenibilidad del código basado en clases grandes, código legacy y patrones anti-patrón.',
        testCoverage: 'Mide qué porcentaje del código está cubierto por tests automatizados.',
        performance: 'Evalúa el uso de límites de gobernador y rendimiento general.',
        architecture: 'Analiza la complejidad arquitectónica: objetos custom, campos y flujos.',
        dataQuality: 'Evalúa la calidad de los datos: duplicados e información incompleta.'
      };

      // Get detailed factors for each component
      const factors = [];
      
      if (key === 'codeQuality' && results.technical?.codeQuality) {
        const codeQuality = results.technical.codeQuality;
        const largeClassCount = Array.isArray(codeQuality.largeClasses) 
          ? codeQuality.largeClasses.length 
          : (codeQuality.largeClasses || 0);
        const legacyClassCount = codeQuality.legacyCode || 0;
        const multiTriggerCount = Array.isArray(codeQuality.multiTriggers)
          ? codeQuality.multiTriggers.length
          : 0;

        if (largeClassCount > 0) {
          factors.push({
            name: 'Clases Grandes',
            value: largeClassCount,
            impact: -Math.min(30, largeClassCount * 5),
            description: 'Clases con más de 500 líneas de código'
          });
        }
        
        if (legacyClassCount > 0) {
          factors.push({
            name: 'Código Legacy',
            value: legacyClassCount,
            impact: -Math.min(20, legacyClassCount * 3),
            description: 'Clases con API version antigua'
          });
        }
        
        if (multiTriggerCount > 0) {
          factors.push({
            name: 'Múltiples Triggers',
            value: multiTriggerCount,
            impact: -Math.min(25, multiTriggerCount * 8),
            description: 'Objetos con múltiples triggers'
          });
        }
      } else if (key === 'testCoverage' && results.technical?.codeQuality?.testCoverage) {
        const coverage = results.technical.codeQuality.testCoverage.overallCoverage || 0;
        factors.push({
          name: 'Cobertura General',
          value: coverage,
          impact: 0,
          description: `${coverage}% de código cubierto por tests`
        });
      } else if (key === 'performance' && results.technical?.governorLimits) {
        const cpuUsage = results.technical.governorLimits.cpuTime?.percentage || 0;
        if (cpuUsage > 50) {
          factors.push({
            name: 'CPU Time',
            value: cpuUsage,
            impact: cpuUsage > 85 ? -30 : cpuUsage > 70 ? -15 : -5,
            description: `Uso de CPU: ${cpuUsage}%`
          });
        }
      }

      breakdown.push({
        category: categoryNames[key] || key,
        score: component.score,
        factors: factors.length > 0 ? factors : [{
          name: 'Base',
          value: component.score,
          impact: 0,
          description: 'Puntaje base sin deducciones'
        }],
        explanation: explanations[key] || `Peso: ${(component.weight * 100).toFixed(0)}%`
      });
    });

    // Financial Components
    Object.entries(scoreBreakdown.financial.components).forEach(([key, component]: [string, any]) => {
      const categoryNames: { [key: string]: string } = {
        licenses: 'Licencias',
        storage: 'Almacenamiento',
        technicalDebt: 'Deuda Técnica',
        risks: 'Riesgos Operacionales'
      };

      const explanations: { [key: string]: string } = {
        licenses: 'Analiza la eficiencia en el uso de licencias y usuarios inactivos.',
        storage: 'Evalúa el uso de almacenamiento de datos y archivos.',
        technicalDebt: 'Calcula el costo de mantener y actualizar el código existente.',
        risks: 'Evalúa riesgos operacionales críticos, altos y medios.'
      };

      // Get detailed factors for each component
      const factors = [];
      
      if (key === 'licenses' && results.financial?.licenses) {
        const licenses = results.financial.licenses;
        const totalLicenses = licenses.totalLicenses || 0;
        const unusedLicenses = licenses.unusedLicenses || 0;
        const unusedPercentage = totalLicenses > 0 ? (unusedLicenses / totalLicenses) * 100 : 0;
        
        if (unusedPercentage > 5) {
          factors.push({
            name: 'Licencias No Utilizadas',
            value: unusedPercentage.toFixed(1),
            impact: unusedPercentage > 30 ? -40 : unusedPercentage > 15 ? -20 : -10,
            description: `${unusedPercentage.toFixed(1)}% de licencias sin usar`
          });
        }

        // Note: inactiveUsers data comes from security, not licenses
        // We'll skip this factor for now as it's not in the licenses type
      } else if (key === 'storage' && results.financial?.storage) {
        const storage = results.financial.storage;
        // Calculate percentages based on dataUsed and fileUsed
        // Since we don't have max values in the type, we'll use the raw values
        const dataUsed = storage.dataUsed || 0;
        const fileUsed = storage.fileUsed || 0;
        
        if (dataUsed > 0) {
          factors.push({
            name: 'Almacenamiento de Datos',
            value: dataUsed.toFixed(2),
            impact: dataUsed > 10 ? -30 : dataUsed > 5 ? -15 : -5,
            description: `${dataUsed.toFixed(2)} GB de datos usados`
          });
        }
        
        if (fileUsed > 0) {
          factors.push({
            name: 'Almacenamiento de Archivos',
            value: fileUsed.toFixed(2),
            impact: fileUsed > 10 ? -25 : fileUsed > 5 ? -12 : -5,
            description: `${fileUsed.toFixed(2)} GB de archivos usados`
          });
        }
      } else if (key === 'technicalDebt' && results.financial?.technicalDebt) {
        const debtHours = results.financial.technicalDebt.totalHours || 0;
        if (debtHours > 100) {
          factors.push({
            name: 'Horas de Deuda Técnica',
            value: debtHours,
            impact: debtHours > 2000 ? -40 : debtHours > 1000 ? -25 : debtHours > 500 ? -15 : -10,
            description: `${debtHours} horas estimadas`
          });
        }
      }

      breakdown.push({
        category: categoryNames[key] || key,
        score: component.score,
        factors: factors.length > 0 ? factors : [{
          name: 'Base',
          value: component.score,
          impact: 0,
          description: 'Puntaje base sin deducciones'
        }],
        explanation: explanations[key] || `Peso: ${(component.weight * 100).toFixed(0)}%`
      });
    });

    return breakdown;
  };

  const breakdown = getCalculationBreakdown();

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

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Info color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            ¿Cómo se Calculan los Puntajes?
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" mb={3}>
          Cada categoría se evalúa de 0 a 100 puntos. Los factores que afectan negativamente 
          reducen puntos del puntaje base de 100.
        </Typography>

        {breakdown.map((category, index) => (
          <Accordion key={index} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box display="flex" alignItems="center" width="100%">
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  {category.category}
                </Typography>
                <Chip
                  label={`${category.score} pts`}
                  color={getScoreColor(category.score)}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={getScoreLabel(category.score)}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </AccordionSummary>
            
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {category.explanation}
              </Typography>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Factores que Afectan el Puntaje:
              </Typography>
              
              {category.factors.map((factor, factorIndex) => (
                <Box key={factorIndex} display="flex" alignItems="center" mb={1}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">
                      {factor.name}: {factor.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {factor.description}
                    </Typography>
                  </Box>
                  
                  {factor.impact !== 0 && (
                    <Chip
                      icon={factor.impact < 0 ? <TrendingDown /> : <TrendingUp />}
                      label={`${factor.impact > 0 ? '+' : ''}${factor.impact} pts`}
                      color={factor.impact < 0 ? 'error' : 'success'}
                      size="small"
                    />
                  )}
                </Box>
              ))}
              
              <Box mt={2} p={1} bgcolor="grey.50" borderRadius={1}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Fórmula:</strong> 100 + (suma de impactos) = {category.score} puntos
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        <Box mt={3} p={2} bgcolor="primary.50" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            💡 Consejo:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enfócate en mejorar las categorías con puntajes más bajos para obtener 
            el mayor impacto en tu puntuación general.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
