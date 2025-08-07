/**
 * Unified score calculation logic for both backend and frontend
 * This ensures consistency across the application
 */

class ScoreCalculator {
  // Weights for different components
  static WEIGHTS = {
    technical: {
      codeQuality: 0.2,
      testCoverage: 0.2,
      performance: 0.25,
      architecture: 0.2,
      dataQuality: 0.15,
    },
    financial: {
      licenses: 0.3,
      storage: 0.25,
      technicalDebt: 0.25,
      risks: 0.2,
    },
  };

  // Thresholds for deductions
  static THRESHOLDS = {
    testCoverage: {
      excellent: 85,
      good: 75,
      acceptable: 60,
      poor: 40,
    },
    largeClasses: {
      acceptable: 50,
      warning: 100,
      critical: 200,
    },
    governorLimits: {
      safe: 50,
      warning: 70,
      critical: 85,
    },
    unusedLicenses: {
      acceptable: 5,
      warning: 15,
      critical: 30,
    },
    storageUsage: {
      safe: 60,
      warning: 80,
      critical: 90,
    },
  };

  /**
   * Calculate code quality score
   */
  static calculateCodeQualityScore(codeQuality) {
    if (!codeQuality) return 0;

    let score = 100;

    // Deduct for large classes (5 points per large class, max 30 points)
    const largeClassCount = Array.isArray(codeQuality.largeClasses)
      ? codeQuality.largeClasses.length
      : codeQuality.largeClasses || 0;
    score -= Math.min(30, largeClassCount * 5);

    // Deduct for legacy classes (3 points per legacy class, max 20 points)
    const legacyClassCount = Array.isArray(codeQuality.legacyClasses)
      ? codeQuality.legacyClasses.length
      : codeQuality.legacyCode || 0;
    score -= Math.min(20, legacyClassCount * 3);

    // Deduct for multiple triggers (8 points per trigger, max 25 points)
    const multiTriggerCount = Array.isArray(codeQuality.multiTriggers)
      ? codeQuality.multiTriggers.length
      : 0;
    score -= Math.min(25, multiTriggerCount * 8);

    return Math.max(0, score);
  }

  /**
   * Calculate test coverage score
   */
  static calculateTestCoverageScore(testCoverage) {
    if (!testCoverage) return 0;

    // Si es un objeto, obtener overallCoverage
    const coverage =
      typeof testCoverage === 'object'
        ? testCoverage.overallCoverage || 0
        : testCoverage || 0;

    // Score is directly the coverage percentage
    return Math.min(100, Math.max(0, coverage));
  }

  /**
   * Calculate performance score
   */
  static calculatePerformanceScore(performance) {
    if (!performance) return 100;

    let score = 100;

    // Deduct for CPU time usage
    const cpuUsage = performance.cpuTime?.percentage || 0;
    if (cpuUsage > this.THRESHOLDS.governorLimits.critical) {
      score -= 30;
    } else if (cpuUsage > this.THRESHOLDS.governorLimits.warning) {
      score -= 15;
    } else if (cpuUsage > this.THRESHOLDS.governorLimits.safe) {
      score -= 5;
    }

    // Deduct for slow queries
    const slowQueryCount = Array.isArray(performance.slowQueries)
      ? performance.slowQueries.length
      : 0;
    score -= Math.min(20, slowQueryCount * 4);

    // Deduct for heavy pages
    const heavyPageCount = Array.isArray(performance.heavyPages)
      ? performance.heavyPages.length
      : 0;
    score -= Math.min(20, heavyPageCount * 5);

    return Math.max(0, score);
  }

  /**
   * Calculate architecture score
   */
  static calculateArchitectureScore(architecture) {
    if (!architecture) return 100;

    let score = 100;

    // Deduct for too many custom objects
    const customObjectCount = architecture.customObjects || 0;
    if (customObjectCount > 200) {
      score -= 15;
    } else if (customObjectCount > 100) {
      score -= 5;
    }

    // Deduct for too many active flows
    const activeFlowCount = architecture.activeFlows || 0;
    if (activeFlowCount > 100) {
      score -= 20;
    } else if (activeFlowCount > 50) {
      score -= 10;
    }

    // Deduct for too many custom fields
    const customFieldCount = architecture.customFields || 0;
    if (customFieldCount > 1000) {
      score -= 15;
    } else if (customFieldCount > 500) {
      score -= 5;
    }

    return Math.max(0, score);
  }

  /**
   * Calculate data quality score
   */
  static calculateDataQualityScore(dataQuality) {
    if (!dataQuality) return 100;

    let score = 100;

    // Deduct for duplicate records
    const duplicateCount = dataQuality.duplicateRecords || 0;
    if (duplicateCount > 1000) {
      score -= 25;
    } else if (duplicateCount > 500) {
      score -= 15;
    } else if (duplicateCount > 100) {
      score -= 5;
    }

    // Deduct for incomplete records
    const incompleteCount = dataQuality.incompleteRecords || 0;
    if (incompleteCount > 5000) {
      score -= 20;
    } else if (incompleteCount > 1000) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  /**
   * Calculate financial license score
   */
  static calculateLicenseScore(licenses) {
    if (!licenses) return 100;

    let score = 100;

    // Calculate unused license percentage
    const totalLicenses = licenses.totalLicenses || 0;
    const unusedLicenses = licenses.unusedLicenses || 0;
    const unusedPercentage =
      totalLicenses > 0 ? (unusedLicenses / totalLicenses) * 100 : 0;

    // Deduct based on unused percentage
    if (unusedPercentage > this.THRESHOLDS.unusedLicenses.critical) {
      score -= 40;
    } else if (unusedPercentage > this.THRESHOLDS.unusedLicenses.warning) {
      score -= 20;
    } else if (unusedPercentage > this.THRESHOLDS.unusedLicenses.acceptable) {
      score -= 10;
    }

    // Additional deduction for inactive users
    const inactiveUserCount = Array.isArray(licenses.inactiveUsers)
      ? licenses.inactiveUsers.length
      : 0;
    if (inactiveUserCount > 50) {
      score -= 15;
    } else if (inactiveUserCount > 20) {
      score -= 10;
    } else if (inactiveUserCount > 10) {
      score -= 5;
    }

    return Math.max(0, score);
  }

  /**
   * Calculate storage score
   */
  static calculateStorageScore(storage) {
    if (!storage) return 100;

    let score = 100;

    // Check data storage usage (using percentage from backend data structure)
    const dataUsagePercentage =
      storage.dataStorage?.percentage || storage.dataUsed || 0;
    if (dataUsagePercentage > this.THRESHOLDS.storageUsage.critical) {
      score -= 30;
    } else if (dataUsagePercentage > this.THRESHOLDS.storageUsage.warning) {
      score -= 15;
    } else if (dataUsagePercentage > this.THRESHOLDS.storageUsage.safe) {
      score -= 5;
    }

    // Check file storage usage
    const fileUsagePercentage =
      storage.fileStorage?.percentage || storage.fileUsed || 0;
    if (fileUsagePercentage > this.THRESHOLDS.storageUsage.critical) {
      score -= 25;
    } else if (fileUsagePercentage > this.THRESHOLDS.storageUsage.warning) {
      score -= 12;
    } else if (fileUsagePercentage > this.THRESHOLDS.storageUsage.safe) {
      score -= 5;
    }

    // Deduct for large old files
    const largeFileCount = Array.isArray(storage.largeFiles)
      ? storage.largeFiles.length
      : 0;
    score -= Math.min(15, largeFileCount * 3);

    return Math.max(0, score);
  }

  /**
   * Calculate technical debt score
   */
  static calculateTechnicalDebtScore(technicalDebt) {
    if (!technicalDebt) return 100;

    let score = 100;
    const totalHours = technicalDebt.totalHours || 0;

    // Deduct based on total hours of debt
    if (totalHours > 2000) {
      score -= 40;
    } else if (totalHours > 1000) {
      score -= 25;
    } else if (totalHours > 500) {
      score -= 15;
    } else if (totalHours > 200) {
      score -= 10;
    } else if (totalHours > 100) {
      score -= 5;
    }

    return Math.max(0, score);
  }

  /**
   * Calculate risks score
   */
  static calculateRisksScore(risks) {
    if (!risks || !Array.isArray(risks)) return 100;

    let score = 100;

    // Count risks by severity
    const criticalCount = risks.filter((r) => r.severity === 'critical').length;
    const highCount = risks.filter((r) => r.severity === 'high').length;
    const mediumCount = risks.filter((r) => r.severity === 'medium').length;

    // Deduct based on risk counts
    score -= criticalCount * 15;
    score -= highCount * 8;
    score -= mediumCount * 3;

    return Math.max(0, score);
  }

  /**
   * Calculate overall technical score
   */
  static calculateTechnicalScore(technicalData) {
    if (!technicalData) return 0;

    const scores = {
      codeQuality: this.calculateCodeQualityScore(technicalData.codeQuality),
      testCoverage: this.calculateTestCoverageScore(
        technicalData.codeQuality?.testCoverage || technicalData.testCoverage
      ),
      performance: this.calculatePerformanceScore(
        technicalData.performance || technicalData.governorLimits
      ),
      architecture: this.calculateArchitectureScore(technicalData.architecture),
      dataQuality: this.calculateDataQualityScore(technicalData.dataQuality),
    };

    // Calculate weighted average
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(scores).forEach(([key, score]) => {
      const weight = this.WEIGHTS.technical[key] || 0;
      totalScore += score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  /**
   * Calculate overall financial score
   */
  static calculateFinancialScore(financialData) {
    if (!financialData) return 0;

    const scores = {
      licenses: this.calculateLicenseScore(financialData.licenses),
      storage: this.calculateStorageScore(financialData.storage),
      technicalDebt: this.calculateTechnicalDebtScore(
        financialData.technicalDebt
      ),
      risks: this.calculateRisksScore(financialData.risks),
    };

    // Calculate weighted average
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(scores).forEach(([key, score]) => {
      const weight = this.WEIGHTS.financial[key] || 0;
      totalScore += score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  /**
   * Calculate overall health score
   */
  static calculateOverallScore(technicalData, financialData) {
    const technicalScore = this.calculateTechnicalScore(technicalData);
    const financialScore = this.calculateFinancialScore(financialData);

    // Overall score is 60% technical, 40% financial
    return Math.round(technicalScore * 0.6 + financialScore * 0.4);
  }

  /**
   * Get score breakdown for explanation
   */
  static getScoreBreakdown(technicalData, financialData) {
    const breakdown = {
      technical: {
        total: this.calculateTechnicalScore(technicalData),
        components: {
          codeQuality: {
            score: this.calculateCodeQualityScore(technicalData?.codeQuality),
            weight: this.WEIGHTS.technical.codeQuality,
            factors: [],
          },
          testCoverage: {
            score: this.calculateTestCoverageScore(
              technicalData?.codeQuality?.testCoverage ||
                technicalData?.testCoverage
            ),
            weight: this.WEIGHTS.technical.testCoverage,
            factors: [],
          },
          performance: {
            score: this.calculatePerformanceScore(
              technicalData?.performance || technicalData?.governorLimits
            ),
            weight: this.WEIGHTS.technical.performance,
            factors: [],
          },
          architecture: {
            score: this.calculateArchitectureScore(technicalData?.architecture),
            weight: this.WEIGHTS.technical.architecture,
            factors: [],
          },
          dataQuality: {
            score: this.calculateDataQualityScore(technicalData?.dataQuality),
            weight: this.WEIGHTS.technical.dataQuality,
            factors: [],
          },
        },
      },
      financial: {
        total: this.calculateFinancialScore(financialData),
        components: {
          licenses: {
            score: this.calculateLicenseScore(financialData?.licenses),
            weight: this.WEIGHTS.financial.licenses,
            factors: [],
          },
          storage: {
            score: this.calculateStorageScore(financialData?.storage),
            weight: this.WEIGHTS.financial.storage,
            factors: [],
          },
          technicalDebt: {
            score: this.calculateTechnicalDebtScore(
              financialData?.technicalDebt
            ),
            weight: this.WEIGHTS.financial.technicalDebt,
            factors: [],
          },
          risks: {
            score: this.calculateRisksScore(financialData?.risks),
            weight: this.WEIGHTS.financial.risks,
            factors: [],
          },
        },
      },
      overall: this.calculateOverallScore(technicalData, financialData),
    };

    // Add factors for technical components
    if (technicalData?.codeQuality) {
      const largeClassCount = Array.isArray(
        technicalData.codeQuality.largeClasses
      )
        ? technicalData.codeQuality.largeClasses.length
        : technicalData.codeQuality.largeClasses || 0;

      if (largeClassCount > 0) {
        breakdown.technical.components.codeQuality.factors.push({
          name: 'Clases grandes',
          value: largeClassCount,
          impact: -Math.min(30, largeClassCount * 5),
        });
      }
    }

    return breakdown;
  }
}

// Export for use in both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoreCalculator;
}
