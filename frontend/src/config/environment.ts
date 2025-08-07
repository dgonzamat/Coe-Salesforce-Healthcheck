// Environment Configuration
export const environment = {
  nodeEnv: process.env.NODE_ENV || 'development',
  
  salesforce: {
    apiVersion: '64.0',
    loginUrls: {
      production: 'https://login.salesforce.com',
      sandbox: 'https://test.salesforce.com'
    },
    oauth: {
      scopes: ['api', 'refresh_token'],
      authorizationUrl: {
        production: 'https://login.salesforce.com/services/oauth2/authorize',
        sandbox: 'https://test.salesforce.com/services/oauth2/authorize'
      },
      tokenUrl: {
        production: 'https://login.salesforce.com/services/oauth2/token',
        sandbox: 'https://test.salesforce.com/services/oauth2/token'
      }
    },
    // Connected App credentials (opcional)
    connectedApp: {
      clientId: process.env.REACT_APP_SALESFORCE_CLIENT_ID || '',
      clientSecret: process.env.REACT_APP_SALESFORCE_CLIENT_SECRET || ''
    }
  },

  ui: {
    refreshInterval: 30000,
    maxResults: 100,
    monitoringInterval: 5000,
    chartColors: {
      primary: '#1976d2',
      secondary: '#dc004e',
      success: '#2e7d32',
      warning: '#ed6c02',
      error: '#d32f2f'
    },
    breakpoints: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536
    }
  },

  analysis: {
    batchSize: 100,
    timeout: 300000,
    retryAttempts: 2,
    cacheDuration: 3600000,
    sandboxSpecific: {
      enableMockData: false, // DESHABILITADO - Solo datos reales
      maxConcurrentRequests: 5
    }
  },

  development: {
    enableMockData: false, // DESHABILITADO - Solo datos reales
    enableDebugLogging: true,
    enablePerformanceMonitoring: true
  },

  reports: {
    templatesEnabled: true,
    maxSize: 10485760, // 10MB
    timeout: 60000,
    templates: {
      executive: {
        name: 'Executive Summary',
        sections: ['summary', 'critical-issues', 'recommendations']
      },
      technical: {
        name: 'Technical Deep Dive',
        sections: ['code-quality', 'performance', 'security', 'maintenance']
      },
      compliance: {
        name: 'Compliance Report',
        sections: ['security', 'licensing', 'user-adoption']
      }
    },
    defaultSettings: {
      format: 'json',
      includeCharts: true,
      includeRecommendations: true
    }
  }
}; 