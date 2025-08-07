const TechnicalAnalysisService = require('./technicalAnalysisService');
const FinancialAnalysisService = require('./financialAnalysisService');
const OrganizationService = require('./organizationService');

class AnalysisOrchestrator {
  constructor(salesforceConfig) {
    this.salesforceConfig = salesforceConfig;
    this.technicalService = new TechnicalAnalysisService(salesforceConfig);
    this.financialService = new FinancialAnalysisService(salesforceConfig);
    this.organizationService = new OrganizationService(salesforceConfig);
  }

  async runCompleteAnalysis() {
    try {
      

      // Ejecutar todos los análisis en paralelo
      const [
        technicalHealth,
        financialHealth,
        organizationInfo
      ] = await Promise.all([
        this.technicalService.getTechnicalHealthScore(),
        this.financialService.getFinancialHealthScore(),
        this.organizationService.getOrganizationInfo()
      ]);

      // Calcular score general combinado
      const overallScore = this.calculateOverallScore(technicalHealth, financialHealth);

      // Consolidar recomendaciones
      const allRecommendations = this.consolidateRecommendations(
        technicalHealth.recommendations,
        financialHealth.recommendations
      );

      // Calcular ahorros potenciales
      const potentialSavings = this.calculatePotentialSavings(financialHealth);

      const completeAnalysis = {
        success: true,
        timestamp: new Date().toISOString(),
        overallScore: overallScore,
        technicalHealth: technicalHealth,
        financialHealth: financialHealth,
        organizationInfo: organizationInfo.data,
        recommendations: allRecommendations,
        potentialSavings: potentialSavings,
        summary: this.generateExecutiveSummary(technicalHealth, financialHealth, potentialSavings)
      };

      
      return completeAnalysis;

    } catch (error) {
      
      throw new Error(`Análisis completo falló: ${error.message}`);
    }
  }

  async runTechnicalAnalysis() {
    try {
      
      const technicalHealth = await this.technicalService.getTechnicalHealthScore();
      
      return {
        success: true,
        data: technicalHealth
      };
    } catch (error) {
      
      throw new Error(`Análisis técnico falló: ${error.message}`);
    }
  }

  async runFinancialAnalysis() {
    try {
      
      const financialHealth = await this.financialService.getFinancialHealthScore();
      
      return {
        success: true,
        data: financialHealth
      };
    } catch (error) {
      
      throw new Error(`Análisis financiero falló: ${error.message}`);
    }
  }

  async runOrganizationAnalysis() {
    try {
      
      const organizationHealth = await this.organizationService.getOrganizationHealth();
      
      return {
        success: true,
        data: organizationHealth.data
      };
    } catch (error) {
      
      throw new Error(`Análisis de organización falló: ${error.message}`);
    }
  }

  calculateOverallScore(technicalHealth, financialHealth) {
    // Ponderación: 40% técnico, 40% financiero, 20% organización
    const technicalWeight = 0.4;
    const financialWeight = 0.4;
    const organizationWeight = 0.2;

    const technicalScore = technicalHealth.overallScore;
    const financialScore = financialHealth.overallScore;
    const organizationScore = 85; // Valor por defecto

    const overallScore = Math.round(
      (technicalScore * technicalWeight) +
      (financialScore * financialWeight) +
      (organizationScore * organizationWeight)
    );

    return Math.max(0, Math.min(100, overallScore));
  }

  consolidateRecommendations(technicalRecommendations, financialRecommendations) {
    const allRecommendations = [
      ...technicalRecommendations,
      ...financialRecommendations
    ];

    // Ordenar por prioridad
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    
    return allRecommendations.sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  calculatePotentialSavings(financialHealth) {
    const savings = {
      immediate: 0,
      shortTerm: 0,
      longTerm: 0,
      total: 0
    };

    if (financialHealth.details) {
      // Ahorros inmediatos (licencias no utilizadas)
      if (financialHealth.details.licenseAnalysis) {
        savings.immediate += financialHealth.details.licenseAnalysis.monthlyWaste * 12;
      }

      // Ahorros a corto plazo (almacenamiento, archivo)
      if (financialHealth.details.storageAnalysis) {
        savings.shortTerm += financialHealth.details.storageAnalysis.yearlyOverage * 0.3;
      }

      // Ahorros a largo plazo (deuda técnica)
      if (financialHealth.details.technicalDebt) {
        savings.longTerm += financialHealth.details.technicalDebt.totalCost * 0.5;
      }

      savings.total = savings.immediate + savings.shortTerm + savings.longTerm;
    }

    return savings;
  }

  generateExecutiveSummary(technicalHealth, financialHealth, potentialSavings) {
    const summary = {
      overallHealth: this.getHealthStatus(technicalHealth.overallScore, financialHealth.overallScore),
      keyMetrics: {
        technicalScore: technicalHealth.overallScore,
        financialScore: financialHealth.overallScore,
        potentialAnnualSavings: potentialSavings.total
      },
      topRecommendations: this.getTopRecommendations(technicalHealth.recommendations, financialHealth.recommendations),
      riskLevel: this.calculateRiskLevel(technicalHealth, financialHealth),
      nextSteps: this.generateNextSteps(technicalHealth, financialHealth)
    };

    return summary;
  }

  getHealthStatus(technicalScore, financialScore) {
    const averageScore = (technicalScore + financialScore) / 2;
    
    if (averageScore >= 90) return 'Excellent';
    if (averageScore >= 75) return 'Good';
    if (averageScore >= 60) return 'Fair';
    if (averageScore >= 40) return 'Poor';
    return 'Critical';
  }

  getTopRecommendations(technicalRecommendations, financialRecommendations) {
    const allRecommendations = [...technicalRecommendations, ...financialRecommendations];
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    
    return allRecommendations
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 5); // Top 5 recomendaciones
  }

  calculateRiskLevel(technicalHealth, financialHealth) {
    let riskScore = 0;
    
    // Evaluar riesgos técnicos
    if (technicalHealth.overallScore < 60) riskScore += 3;
    if (technicalHealth.overallScore < 40) riskScore += 2;
    
    // Evaluar riesgos financieros
    if (financialHealth.overallScore < 60) riskScore += 3;
    if (financialHealth.overallScore < 40) riskScore += 2;
    
    if (riskScore >= 6) return 'High';
    if (riskScore >= 3) return 'Medium';
    return 'Low';
  }

  generateNextSteps(technicalHealth, financialHealth) {
    const steps = [];
    
    // Pasos críticos
    const criticalRecommendations = [
      ...technicalHealth.recommendations,
      ...financialHealth.recommendations
    ].filter(rec => rec.priority === 'critical');
    
    if (criticalRecommendations.length > 0) {
      steps.push({
        priority: 'critical',
        action: 'Address critical issues immediately',
        items: criticalRecommendations.slice(0, 3)
      });
    }
    
    // Pasos de alto impacto
    const highImpactRecommendations = [
      ...technicalHealth.recommendations,
      ...financialHealth.recommendations
    ].filter(rec => rec.priority === 'high');
    
    if (highImpactRecommendations.length > 0) {
      steps.push({
        priority: 'high',
        action: 'Plan high-impact improvements',
        items: highImpactRecommendations.slice(0, 3)
      });
    }
    
    return steps;
  }
}

module.exports = AnalysisOrchestrator;