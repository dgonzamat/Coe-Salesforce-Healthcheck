// Analysis Store with Zustand
import { create } from 'zustand';

// Types
export interface SalesforceConnection {
  isConnected: boolean;
  orgName: string;
  orgId: string;
  instanceUrl: string;
  environmentType: 'production' | 'sandbox';
  connectionDate: string;
}

export interface ConnectionState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  orgName: string;
  orgId: string;
  instanceUrl: string;
  environmentType: 'production' | 'sandbox';
  connectionDate: string;
}

export interface TechnicalData {
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

export interface FinancialData {
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

export interface AnalysisResults {
  technical: TechnicalData;
  financial: FinancialData;
  summary: {
    totalClasses: number;
    totalTriggers: number;
    avgCodeCoverage: number;
    overallScore: number;
  };
}

export interface AnalysisState {
  isRunning: boolean;
  results: AnalysisResults | null;
  error: string | null;
}

export interface AnalysisStore {
  // Connection state
  connection: ConnectionState;
  
  // Analysis state
  analysis: AnalysisState;
  
  // Actions
  setConnection: (connection: Partial<ConnectionState>) => void;
  setConnectionError: (error: string) => void;
  clearConnectionError: () => void;
  
  setAnalysisRunning: (isRunning: boolean) => void;
  setAnalysisResults: (results: AnalysisResults | null) => void;
  setAnalysisError: (error: string) => void;
  clearAnalysisError: () => void;
  
  // Auto-connection
  autoConnect: () => Promise<void>;
  
  // Analysis actions
  runAnalysis: () => Promise<void>;
  clearResults: () => void;
}

// Store
export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  // Initial state
  connection: {
    isConnected: false,
    isLoading: false,
    error: null,
    orgName: '',
    orgId: '',
    instanceUrl: '',
    environmentType: 'production',
    connectionDate: '',
  },
  
  analysis: {
    isRunning: false,
    results: {
      technical: {
        governorLimits: {
          soqlQueries: { used: 0, limit: 0, percentage: 0 },
          dmlStatements: { used: 0, limit: 0, percentage: 0 },
          cpuTime: { used: 0, limit: 0, percentage: 0 },
          heapSize: { used: 0, limit: 0, percentage: 0 },
        },
        codeQuality: {
          totalClasses: 0,
          largeClasses: 0,
          legacyCode: 0,
          multiTriggers: 0,
          testCoverage: { overallCoverage: 0, classesWithoutCoverage: [], slowTests: [] },
          complexityScore: 0,
        },
        performance: {
          customObjects: 0,
          customFields: 0,
          activeFlows: 0,
          validationRules: 0,
          storageUsed: 0,
        },
        security: {
          inactiveUsers: 0,
          passwordNeverChanged: 0,
          adminUsers: 0,
          failedLogins: 0,
        },
      },
      financial: {
        licenses: {
          totalLicenses: 0,
          usedLicenses: 0,
          unusedLicenses: 0,
          monthlyWaste: 0,
          yearlyWaste: 0,
        },
        storage: {
          dataUsed: 0,
          fileUsed: 0,
          monthlyOverage: 0,
          yearlyOverage: 0,
          growthTrends: {},
        },
        technicalDebt: {
          totalHours: 0,
          hourlyRate: 0,
          totalCost: 0,
          monthlyInterest: 0,
        },
        risks: {
          governorIncidentRisk: 0,
          deploymentDelays: 0,
          maintenanceGrowth: 0,
        },
      },
      summary: {
        totalClasses: 0,
        totalTriggers: 0,
        avgCodeCoverage: 0,
        overallScore: 0,
      },
    },
    error: null,
  },
  
  // Connection actions
  setConnection: (connection) =>
    set((state) => ({
      connection: { ...state.connection, ...connection },
    })),
    
  setConnectionError: (error) =>
    set((state) => ({
      connection: { ...state.connection, error, isLoading: false },
    })),
    
  clearConnectionError: () =>
    set((state) => ({
      connection: { ...state.connection, error: null },
    })),
  
  // Analysis actions
  setAnalysisRunning: (isRunning) =>
    set((state) => ({
      analysis: { ...state.analysis, isRunning },
    })),
    
  setAnalysisResults: (results) =>
    set((state) => ({
      analysis: { ...state.analysis, results, error: null },
    })),
    
  setAnalysisError: (error) =>
    set((state) => ({
      analysis: { ...state.analysis, error, isRunning: false },
    })),
    
  clearAnalysisError: () =>
    set((state) => ({
      analysis: { ...state.analysis, error: null },
    })),
  
  // Auto-connection
  autoConnect: async () => {
    const { setConnection, setConnectionError } = get();
    
    console.log('🔄 Iniciando auto-conexión...');
    setConnection({ isLoading: true, error: null });
    
    try {
      console.log('📡 Haciendo fetch a /api/org-info...');
      const response = await fetch('/api/org-info');
      const data = await response.json();
      
      console.log('📊 Respuesta recibida:', data);
      
      if (data.success) {
        const orgData = data.data;
        console.log('✅ Conexión exitosa con org:', orgData.name);
        setConnection({
          isConnected: true,
          isLoading: false,
          orgName: orgData.name,
          orgId: orgData.id,
          instanceUrl: orgData.instanceUrl,
          environmentType: orgData.isSandbox ? 'sandbox' : 'production',
          connectionDate: new Date().toISOString(),
        });
      } else {
        console.error('❌ Error en respuesta:', data.error);
        setConnectionError(data.error || 'Error al conectar con Salesforce');
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      setConnectionError(error instanceof Error ? error.message : 'Error de conexión');
    }
  },
  
  // Analysis actions
  runAnalysis: async () => {
    const { setAnalysisRunning, setAnalysisResults, setAnalysisError } = get();
    
    console.log('🔍 Iniciando análisis...');
    setAnalysisRunning(true);
    
    try {
      console.log('📡 Haciendo fetch a /api/real-data...');
      const response = await fetch('/api/real-data');
      const data = await response.json();
      
      console.log('📊 Datos de análisis recibidos:', data);
      
      if (data.success) {
        console.log('✅ Análisis completado exitosamente');
        setAnalysisResults(data.data);
      } else {
        console.error('❌ Error en análisis:', data.error);
        setAnalysisError(data.error || 'Error al ejecutar el análisis');
      }
    } catch (error) {
      console.error('❌ Error de análisis:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Error de análisis');
    }
  },
  
  clearResults: () => {
    const { setAnalysisResults, clearAnalysisError } = get();
    setAnalysisResults(null);
    clearAnalysisError();
  },
})); 