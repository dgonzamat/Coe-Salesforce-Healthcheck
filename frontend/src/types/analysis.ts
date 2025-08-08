// Tipos compartidos para análisis de Salesforce
export interface TechnicalData {
  governorLimits: {
    soqlQueries: { used: number; limit: number; percentage: number };
    dmlStatements: { used: number; limit: number; percentage: number };
    cpuTime: { used: number; limit: number; percentage: number };
    heapSize: { used: number; limit: number; percentage: number };
    emailInvocations: { used: number; limit: number; percentage: number };
    callouts: { used: number; limit: number; percentage: number };
    mobilePushApex: { used: number; limit: number; percentage: number };
    soslQueries: { used: number; limit: number; percentage: number };
    aggregateQueries: { used: number; limit: number; percentage: number };
    dmlRows: { used: number; limit: number; percentage: number };
  };
      codeQuality: {
      totalClasses: number;
      largeClasses: number;
      legacyCode: number;
      multiTriggers: number;
      testCoverage: { 
        overallCoverage: number; 
        classesWithoutCoverage: string[]; 
        slowTests: any[];
        classesNeedingTests?: number;
      };
      complexityScore: number;
      averageClassSize: number;
      averageApiVersion: number;
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
  orgType?: string;
  orgTypeDescription?: string;
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