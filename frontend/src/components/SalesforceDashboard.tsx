// Salesforce Dashboard Component - Health Check Técnico, Financiero y Plan de Acción
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useAnalysisStore } from '../stores/analysisStore';
import { ConnectionStatus } from './common/ConnectionStatus';
import { LoadingSpinner } from './common/LoadingSpinner';
import { Overview } from './health-checks/Overview';
import { TechnicalHealthCheck } from './health-checks/TechnicalHealthCheck';
import { FinancialHealthCheck } from './health-checks/FinancialHealthCheck';
import { ActionPlan } from './health-checks/ActionPlan';
import CompleteAnalysis from './health-checks/CompleteAnalysis';
import { HealthScoreCard } from './HealthScoreCard';
import { CalculationExplanation } from './CalculationExplanation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`health-tabpanel-${index}`}
      aria-labelledby={`health-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const SalesforceDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [completeAnalysisData, setCompleteAnalysisData] = useState<any>(null);
  const [completeAnalysisLoading, setCompleteAnalysisLoading] = useState(false);
  const [completeAnalysisError, setCompleteAnalysisError] = useState<string | null>(null);
  
  const {
    connection,
    analysis,
    autoConnect,
    runAnalysis
  } = useAnalysisStore();

  useEffect(() => {
    // Auto-conectar al cargar el componente
    if (!connection.isConnected && !connection.isLoading) {
      autoConnect();
    }
  }, [connection.isConnected, connection.isLoading, autoConnect]);

  // Ejecutar análisis automáticamente después de conectar
  useEffect(() => {
    if (connection.isConnected && !analysis.isRunning && !analysis.results) {
      runAnalysis();
    }
  }, [connection.isConnected, analysis.isRunning, analysis.results, runAnalysis]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRunAnalysis = async () => {
    try {
      setIsLoading(true);
      await runAnalysis();
    } catch (error) {
      console.error('Error running analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      await autoConnect();
      if (connection.isConnected) {
        await runAnalysis();
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteAnalysis = async () => {
    try {
      setCompleteAnalysisLoading(true);
      setCompleteAnalysisError(null);
      
      const response = await fetch('/api/complete-analysis');
      if (!response.ok) {
        throw new Error('Error al obtener análisis completo');
      }
      
      const data = await response.json();
      setCompleteAnalysisData(data);
    } catch (error) {
      console.error('Error running complete analysis:', error);
      setCompleteAnalysisError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setCompleteAnalysisLoading(false);
    }
  };

  // Verificar si tenemos datos reales
  const results = analysis.results;
  const hasRealData = Boolean(results && (results.technical || results.financial));
  const isConnected = connection.isConnected && connection.orgName;
  
  // Forzar hasRealData a true para debug
  const forceHasRealData = true;
  
  console.log('🔍 DEBUG - Datos detallados:', {
    results: results,
    resultsType: typeof results,
    technical: results?.technical,
    financial: results?.financial,
    hasRealData: hasRealData,
    isConnected: isConnected,
    analysisIsRunning: analysis.isRunning
  });
  
  console.log('📊 SalesforceDashboard - Estado:', {
    connection: {
      isConnected: connection.isConnected,
      orgName: connection.orgName,
      isLoading: connection.isLoading
    },
    analysis: {
      isRunning: analysis.isRunning,
      results: analysis.results,
      error: analysis.error
    },
    hasRealData,
    isConnected
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 3, mt: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Salesforce Health Check
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Análisis integral de salud de tu organización Salesforce
          </Typography>
        </Box>

        {/* Connection Status */}
        <ConnectionStatus 
          connection={{
            isConnected: connection.isConnected,
            orgName: connection.orgName,
            orgId: connection.orgId,
            instanceUrl: connection.instanceUrl,
            environmentType: connection.environmentType,
            connectionDate: connection.connectionDate
          }}
          isRunning={analysis.isRunning}
          error={connection.error}
          isLoading={connection.isLoading}
        />

        {/* Error Messages */}
        {connection.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {connection.error}
          </Alert>
        )}

        {analysis.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error en análisis: {analysis.error}
          </Alert>
        )}

        {/* Loading State */}
        {connection.isLoading || isLoading ? (
          <LoadingSpinner message="Conectando con Salesforce..." />
        ) : (
          <>
            {/* Health Score Card */}
            {isConnected && (
              <Box sx={{ mb: 3 }}>
                <HealthScoreCard />
              </Box>
            )}

            {/* Action Buttons */}
            {isConnected && (
              <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleRunAnalysis}
                  disabled={analysis.isRunning}
                  startIcon={analysis.isRunning ? <CircularProgress size={20} /> : <RefreshIcon />}
                >
                  {analysis.isRunning ? 'Ejecutando...' : 'Ejecutar Análisis'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  Actualizar Datos
                </Button>
              </Box>
            )}

            {/* Main Content */}
            {isConnected && (
              <Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={handleTabChange} aria-label="health check tabs">
                    <Tab label="Overview" />
                    <Tab label="Health Check Técnico" />
                    <Tab label="Health Check Financiero" />
                    <Tab label="Análisis Completo" />
                    <Tab label="Plan de Acción" />
                    <Tab label="Explicaciones de Cálculo" />
                  </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                  <Overview
                    technicalData={results?.technical}
                    financialData={results?.financial}
                    isLoading={false}
                    hasData={forceHasRealData}
                  />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <TechnicalHealthCheck
                    data={results?.technical}
                    isLoading={false}
                    hasData={forceHasRealData}
                  />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <FinancialHealthCheck
                    data={results?.financial}
                    isLoading={false}
                    hasData={forceHasRealData}
                  />
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <Box>
                    <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleCompleteAnalysis}
                        disabled={completeAnalysisLoading}
                        startIcon={completeAnalysisLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
                      >
                        {completeAnalysisLoading ? 'Ejecutando...' : 'Ejecutar Análisis Completo'}
                      </Button>
                    </Box>
                    <CompleteAnalysis
                      data={completeAnalysisData}
                      loading={completeAnalysisLoading}
                      error={completeAnalysisError || undefined}
                    />
                  </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={4}>
                  <ActionPlan
                    technicalData={results?.technical ? {
                      ...results.technical,
                      codeQuality: {
                        ...results.technical.codeQuality,
                        testCoverage: results.technical.codeQuality.testCoverage.overallCoverage
                      }
                    } : undefined}
                    financialData={results?.financial}
                    isLoading={false}
                    hasData={forceHasRealData}
                  />
                </TabPanel>

                <TabPanel value={tabValue} index={5}>
                  <CalculationExplanation />
                </TabPanel>
              </Box>
            )}

            {/* No Data Message */}
            {isConnected && !hasRealData && !analysis.isRunning && (
              <Alert severity="info">
                Ejecuta un análisis para ver los datos de salud de tu organización.
              </Alert>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}; 