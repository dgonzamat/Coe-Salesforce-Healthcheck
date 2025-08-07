// Salesforce Types
export interface SalesforceCredentials {
  username: string;
  password: string;
  securityToken: string;
  isSandbox: boolean;
  sandboxName?: string;
}

export interface SalesforceConnection {
  isConnected: boolean;
  orgInfo?: SalesforceOrgInfo;
  sessionId?: string;
  instanceUrl?: string;
  environmentType: 'production' | 'sandbox';
  sandboxName?: string;
}

export interface SalesforceOrgInfo {
  id: string;
  name: string;
  instanceUrl: string;
  organizationType: string;
  isSandbox: boolean;
  sandboxType?: string;
  createdDate: string;
  limits: Record<string, {
    Max: number;
    Remaining: number;
    Used: number;
  }>;
  licensing: {
    userLicenses: Array<{
      name: string;
      totalLicenses: number;
      usedLicenses: number;
      availableLicenses: number;
      usagePercentage: number;
      status: string;
      monthlyLogins: number;
      lastLoginDate: string;
    }>;
    permissionSetLicenses: any[];
    packageLicenses: any[];
    featureLicenses: any[];
  };
  edition: string;
  features: Record<string, boolean>;
  stats?: {
    totalObjects: number;
    activeUsers: number;
    apiVersion: string;
    orgId: string;
    userId: string;
    username: string;
  };
}

export interface SalesforceAnalysisSummary {
  totalObjects: number;
  totalUsers: number;
  totalProfiles: number;
  totalPermissionSets: number;
  apiUsage: number;
  storageUsage: number;
  totalClasses: number;
  totalTriggers: number;
  totalTestClasses: number;
  avgCodeCoverage: number;
  governorLimitRisks: number;
  performanceIssues: number;
  codeQualityIssues: number;
  technicalDebtScore: number;
  securityScore: number;
  adoptionScore: number;
}

export interface GovernorLimitIssue {
  file: string;
  line: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  context: string;
}

export interface GovernorLimitsAnalysis {
  issues: GovernorLimitIssue[];
  riskScore: number;
  recommendations: string[];
  limits: {
    apiRequests: { used: number; remaining: number; percentage: number };
    asyncExecutions: { used: number; remaining: number; percentage: number };
    bulkApiRequests: { used: number; remaining: number; percentage: number };
    streamingApiEvents: { used: number; remaining: number; percentage: number };
    dataStorage: { used: number; remaining: number; percentage: number };
    fileStorage: { used: number; remaining: number; percentage: number };
  };
}

export interface CodeQualityIssue {
  type: string;
  file: string;
  line: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion: string;
}

export interface CodeQualityMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;
  technicalDebtRatio: number;
  linesOfCode: number;
  commentLines: number;
  blankLines: number;
  codeLines: number;
}

export interface CodeQualityAnalysis {
  issues: CodeQualityIssue[];
  metrics: CodeQualityMetrics;
  apexClasses: {
    total: number;
    details: any[];
  };
  triggers: {
    total: number;
    details: any[];
  };
  components: {
    total: number;
    details: any[];
  };
}

export interface PerformanceIssue {
  type: string;
  file: string;
  line: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  peakResponseTime: number;
  throughput: number;
  errorRate: number;
}

export interface PerformanceAnalysis {
  issues: PerformanceIssue[];
  metrics: PerformanceMetrics;
}

export interface TestCoverageClass {
  className: string;
  coverage: number;
  coveredLines: number;
  totalLines: number;
  status: 'good' | 'warning' | 'critical';
}

export interface TestCoverageAnalysis {
  classCoverage: TestCoverageClass[];
  overallCoverage: number;
  failingTests: number;
  flakyTests: number;
  recommendations: string[];
}

export interface LicensingSummary {
  totalCost: number;
  utilizationRate: number;
  wastedLicenses: number;
  expiringLicenses: any[];
}

export interface UserLicense {
  type: string;
  total: number;
  used: number;
  available: number;
  cost: number;
  recommendations: string[];
}

export interface FeatureLicense {
  feature: string;
  enabled: boolean;
  usage: number;
  recommendation: string;
}

export interface LicensingAnalysis {
  summary: LicensingSummary;
  userLicenses: UserLicense[];
  featureLicenses: FeatureLicense[];
}

export interface UserAdoptionMetrics {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  adoptionTrend: 'increasing' | 'decreasing' | 'stable';
  inactiveUsers: {
    count: number;
    percentage: number;
    profiles: string[];
  };
}

export interface UserAdoptionRecommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: number;
}

export interface UserAdoptionAnalysis {
  overallScore: number;
  metrics: UserAdoptionMetrics;
  recommendations: UserAdoptionRecommendation[];
}

export interface TechnicalDebtCategory {
  category: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
  estimatedHours: number;
}

export interface TechnicalDebtIssue {
  type: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
  estimatedHours: number;
  description: string;
}

export interface TechnicalDebtTrend {
  month: string;
  debtScore: number;
  newIssues: number;
  resolvedIssues: number;
}

export interface TechnicalDebtAnalysis {
  totalDebtScore: number;
  estimatedRemediationHours: number;
  debtByCategory: TechnicalDebtCategory[];
  topIssues: TechnicalDebtIssue[];
  trends: TechnicalDebtTrend[];
}

export interface SecurityVulnerability {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  description: string;
  remediation: string;
}

export interface SecurityCompliance {
  sox: number;
  gdpr: number;
  pci: number;
}

export interface SecurityRecommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  effort: number;
}

export interface SecurityAnalysis {
  overallScore: number;
  vulnerabilities: SecurityVulnerability[];
  compliance: SecurityCompliance;
  recommendations: SecurityRecommendation[];
}

export interface MaintenanceStaleCode {
  classes: number;
  triggers: number;
  components: number;
  risk: 'low' | 'medium' | 'high';
}

export interface MaintenanceHotspot {
  file: string;
  modifications: number;
  contributors: number;
  lastModified: string;
}

export interface MaintenanceLastModifiedAnalysis {
  staleCode: MaintenanceStaleCode;
  hotspots: MaintenanceHotspot[];
}

export interface MaintenanceDocumentationCoverage {
  overall: number;
  classes: number;
  methods: number;
  triggers: number;
}

export interface MaintenanceTestMaintenance {
  failingTests: number;
  flakyTests: number;
  outdatedTests: number;
  testExecutionTime: number;
}

export interface MaintenanceAnalysis {
  lastModifiedAnalysis: MaintenanceLastModifiedAnalysis;
  documentationCoverage: MaintenanceDocumentationCoverage;
  testMaintenance: MaintenanceTestMaintenance;
}

export interface SalesforceAnalysisResults {
  timestamp: string;
  orgInfo: SalesforceOrgInfo;
  summary: SalesforceAnalysisSummary;
  governorLimits: GovernorLimitsAnalysis;
  codeQuality: CodeQualityAnalysis;
  performance: PerformanceAnalysis;
  testCoverage: TestCoverageAnalysis;
  licensing: LicensingAnalysis;
  userAdoption: UserAdoptionAnalysis;
  technicalDebt: TechnicalDebtAnalysis;
  security: SecurityAnalysis;
  maintenance: MaintenanceAnalysis;
} 