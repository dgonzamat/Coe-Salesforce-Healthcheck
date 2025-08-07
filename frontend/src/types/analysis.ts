// Import from salesforce types
import { SalesforceCredentials, SalesforceOrgInfo, SalesforceAnalysisResults } from './salesforce';

// Analysis Types
export interface AnalysisScope {
  codeQuality: boolean;
  governorLimits: boolean;
  performance: boolean;
  testCoverage: boolean;
  licensing: boolean;
  userAdoption: boolean;
  technicalDebt: boolean;
  security: boolean;
  maintenance: boolean;
}

export interface AnalysisState {
  isRunning: boolean;
  progress: number;
  currentStep: string;
  results: SalesforceAnalysisResults | null;
  error: string | null;
}

export interface ConnectionState {
  isConnected: boolean;
  orgInfo?: SalesforceOrgInfo;
  sessionId?: string;
  instanceUrl?: string;
  environmentType: 'production' | 'sandbox';
  sandboxName?: string;
}

export interface AnalysisStore {
  connection: ConnectionState;
  analysis: AnalysisState;
  connectToOrg: (credentials: SalesforceCredentials) => Promise<void>;
  runAnalysis: (scope: AnalysisScope) => Promise<void>;
  generateReport: (template: ReportTemplate) => Promise<Blob>;
  getHealthScore: () => number;
  getCriticalIssues: () => CriticalIssue[];
  getOrgLimitsUsage: () => OrgLimitUsage[];
}

export interface CriticalIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  file?: string;
  line?: number;
  remediation?: string;
}

export interface OrgLimitUsage {
  name: string;
  used: number;
  max: number;
  percentage: number;
}

export interface ReportTemplate {
  name: string;
  format: 'json' | 'pdf' | 'html';
  sections: string[];
}