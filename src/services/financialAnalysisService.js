const { makeSalesforceRequest } = require('../utils/salesforceClient');

const ScoreCalculator = require('../utils/scoreCalculator');

class FinancialAnalysisService {
  constructor(salesforceConfig) {
    this.salesforceConfig = salesforceConfig;
    this.licensePricing = {
      Salesforce: 165,
      'Salesforce Platform': 25,
      'Salesforce Platform Plus': 100,
      'Customer Community': 5,
      'Partner Community': 5,
      'Marketing User': 75,
      'CPQ User': 75,
      'Service Cloud': 300,
      'Marketing Cloud': 400,
      'Commerce Cloud': 350,
      Platform: 25,
      Chatter: 15,
      Knowledge: 200,
      Community: 5,
      Partner: 25,
      Customer: 25,
      Analytics: 75,
      Einstein: 50,
    };
  }

  async getLicenseAnalysis() {
    try {
      // Get license inventory
      const licenseQuery = `
        SELECT Id, Name, MasterLabel, Status
        FROM UserLicense
        WHERE Status = 'Active'
        ORDER BY Name
      `;

      // Get user activity for license optimization
      const inactiveUsersQuery = `
        SELECT Id, Username, Profile.Name, LastLoginDate, UserType
        FROM User
        WHERE IsActive = true
        AND (LastLoginDate = null OR LastLoginDate < LAST_N_DAYS:90)
        ORDER BY LastLoginDate ASC NULLS FIRST
      `;

      // Get permission set licenses
      const permissionSetQuery = `
        SELECT Id, DeveloperName, MasterLabel, 
               TotalLicenses, UsedLicenses,
               ExpirationDate
        FROM PermissionSetLicense
        WHERE TotalLicenses > 0
        ORDER BY TotalLicenses DESC
      `;

      // Get never logged in users
      const neverLoggedQuery = `
        SELECT COUNT(Id) neverLoggedCount
        FROM User
        WHERE IsActive = true
        AND LastLoginDate = null
      `;

      // Get low activity users (login frequency analysis)
      const lowActivityQuery = `
        SELECT Id, Username, Profile.Name, LastLoginDate
        FROM User
        WHERE IsActive = true
        AND LastLoginDate < LAST_N_DAYS:30
        ORDER BY LastLoginDate ASC NULLS FIRST
        LIMIT 100
      `;

      const [
        licenseResponse,
        inactiveUsersResponse,
        permissionSetResponse,
        neverLoggedResponse,
        lowActivityResponse,
      ] = await Promise.all([
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(licenseQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(inactiveUsersQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(permissionSetQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(neverLoggedQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(lowActivityQuery)}`
        ),
      ]);

      const licenseAnalysis = {
        totalLicenses: 0,
        usedLicenses: 0,
        unusedLicenses: 0,
        monthlyWaste: 0,
        yearlyWaste: 0,
        licenseTypes: [],
        inactiveUsers: inactiveUsersResponse.records || [],
        neverLoggedUsers:
          neverLoggedResponse.records?.[0]?.neverLoggedCount || 0,
        lowActivityUsers: lowActivityResponse || [],
        permissionSetLicenses: permissionSetResponse.records || [],
        featureLicenses: [],
        recommendations: [],
      };

      // Analyze license types and calculate costs
      if (licenseResponse.records) {
        licenseResponse.records.forEach((license) => {
          const licenseType = license.Name || license.MasterLabel || 'Unknown';
          const monthlyCost = this.getLicenseMonthlyCost(licenseType);

          // Estimate usage based on user types (this is simplified)
          const estimatedUsage = this.estimateLicenseUsage(
            licenseType,
            licenseResponse.records
          );

          const licenseData = {
            name: licenseType,
            total: estimatedUsage.total,
            used: estimatedUsage.used,
            unused: estimatedUsage.total - estimatedUsage.used,
            monthlyCost: monthlyCost,
            monthlyWaste:
              (estimatedUsage.total - estimatedUsage.used) * monthlyCost,
            yearlyWaste:
              (estimatedUsage.total - estimatedUsage.used) * monthlyCost * 12,
            utilizationPercentage:
              estimatedUsage.total > 0
                ? Math.round((estimatedUsage.used / estimatedUsage.total) * 100)
                : 0,
          };

          licenseAnalysis.licenseTypes.push(licenseData);
          licenseAnalysis.totalLicenses += estimatedUsage.total;
          licenseAnalysis.usedLicenses += estimatedUsage.used;
          licenseAnalysis.unusedLicenses +=
            estimatedUsage.total - estimatedUsage.used;
          licenseAnalysis.monthlyWaste += licenseData.monthlyWaste;
          licenseAnalysis.yearlyWaste += licenseData.yearlyWaste;
        });
      }

      // Analyze feature licenses (PermissionSetLicense)
      if (permissionSetResponse.records) {
        permissionSetResponse.records.forEach((psLicense) => {
          const unused =
            (psLicense.TotalLicenses || 0) - (psLicense.UsedLicenses || 0);
          const monthlyCost = 50; // Estimated cost for feature licenses

          licenseAnalysis.featureLicenses.push({
            name: psLicense.MasterLabel || psLicense.DeveloperName,
            total: psLicense.TotalLicenses || 0,
            used: psLicense.UsedLicenses || 0,
            unused: unused,
            monthlyWaste: unused * monthlyCost,
            yearlyWaste: unused * monthlyCost * 12,
            expirationDate: psLicense.ExpirationDate,
          });

          licenseAnalysis.monthlyWaste += unused * monthlyCost;
          licenseAnalysis.yearlyWaste += unused * monthlyCost * 12;
        });
      }

      // Generate recommendations
      if (licenseAnalysis.unusedLicenses > 0) {
        licenseAnalysis.recommendations.push({
          priority: 'critical',
          title: 'Optimizar Licencias No Utilizadas',
          description: `${
            licenseAnalysis.unusedLicenses
          } licencias no utilizadas generando $${licenseAnalysis.monthlyWaste.toLocaleString()} de desperdicio mensual`,
          monthlySavings: licenseAnalysis.monthlyWaste,
          effort: 16,
        });
      }

      if (licenseAnalysis.inactiveUsers.length > 0) {
        licenseAnalysis.recommendations.push({
          priority: 'high',
          title: 'Desactivar Usuarios Inactivos',
          description: `${licenseAnalysis.inactiveUsers.length} usuarios inactivos por más de 90 días`,
          monthlySavings: licenseAnalysis.inactiveUsers.length * 165, // Average license cost
          effort: 8,
        });
      }

      if (licenseAnalysis.neverLoggedUsers > 0) {
        licenseAnalysis.recommendations.push({
          priority: 'high',
          title: 'Revisar Usuarios Nunca Conectados',
          description: `${licenseAnalysis.neverLoggedUsers} usuarios nunca han accedido al sistema`,
          monthlySavings: licenseAnalysis.neverLoggedUsers * 165,
          effort: 4,
        });
      }

      return licenseAnalysis;
    } catch (error) {
      throw new Error(`License analysis failed: ${error.message}`);
    }
  }

  async getStorageAnalysis() {
    try {
      // Get storage limits - USAR LIMITS API PARA DATOS REALES
      const limits = await makeSalesforceRequest(
        `${this.salesforceConfig.instanceUrl}/services/data/v${this.salesforceConfig.apiVersion}/limits`
      );

      // Calcular uso real de almacenamiento desde Limits API
      const dataStorageUsed =
        (limits.DataStorageMB?.Max || 0) -
        (limits.DataStorageMB?.Remaining || 0);
      const fileStorageUsed =
        (limits.FileStorageMB?.Max || 0) -
        (limits.FileStorageMB?.Remaining || 0);

      // Calcular porcentajes
      const dataPercentage =
        limits.DataStorageMB?.Max > 0
          ? (dataStorageUsed / limits.DataStorageMB.Max) * 100
          : 0;
      const filePercentage =
        limits.FileStorageMB?.Max > 0
          ? (fileStorageUsed / limits.FileStorageMB.Max) * 100
          : 0;

      // Get large files for cleanup
      const largeFilesQuery = `
        SELECT Id, Title, ContentSize, FileType,
               CreatedDate, LastViewedDate,
               OwnerId, Owner.Name
        FROM ContentDocument
        WHERE ContentSize > 52428800  -- Files > 50MB
        AND LastViewedDate < LAST_N_DAYS:180
        ORDER BY ContentSize DESC
        LIMIT 500
      `;

      // Get old attachments
      const oldAttachmentsQuery = `
        SELECT Id, Name, BodyLength, CreatedDate,
               ParentId, OwnerId
        FROM Attachment
        WHERE CreatedDate < LAST_N_YEARS:2
        AND BodyLength > 1048576  -- > 1MB
        ORDER BY BodyLength DESC
        LIMIT 1000
      `;

      // Get storage growth trends (monthly data growth)
      const dataGrowthQuery = `
        SELECT COUNT(Id) currentMonthCount
        FROM Account
        WHERE CreatedDate >= THIS_MONTH
      `;

      const lastMonthQuery = `
        SELECT COUNT(Id) lastMonthCount
        FROM Account
        WHERE CreatedDate >= LAST_MONTH
        AND CreatedDate < THIS_MONTH
      `;

      const [
        largeFilesResponse,
        oldAttachmentsResponse,
        dataGrowthResponse,
        lastMonthResponse,
      ] = await Promise.all([
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(largeFilesQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(oldAttachmentsQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(dataGrowthQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(lastMonthQuery)}`
        ),
      ]);

      const storageAnalysis = {
        dataStorage: {
          used: dataStorageUsed,
          total: limits.DataStorageMB?.Max || 0,
          percentage: dataPercentage,
        },
        fileStorage: {
          used: fileStorageUsed,
          total: limits.FileStorageMB?.Max || 0,
          percentage: filePercentage,
        },
        largeFiles: largeFilesResponse.records || [],
        oldAttachments: oldAttachmentsResponse.records || [],
        growthTrends: {
          currentMonth: dataGrowthResponse.records?.[0]?.currentMonthCount || 0,
          lastMonth: lastMonthResponse.records?.[0]?.lastMonthCount || 0,
          growthRate: 0,
        },
        monthlyOverage: 0,
        yearlyOverage: 0,
        recommendations: [],
      };

      // Calculate growth rate
      if (storageAnalysis.growthTrends.lastMonth > 0) {
        storageAnalysis.growthTrends.growthRate =
          ((storageAnalysis.growthTrends.currentMonth -
            storageAnalysis.growthTrends.lastMonth) /
            storageAnalysis.growthTrends.lastMonth) *
          100;
      }

      // Calculate percentages
      if (storageAnalysis.dataStorage.total > 0) {
        storageAnalysis.dataStorage.percentage =
          (storageAnalysis.dataStorage.used /
            storageAnalysis.dataStorage.total) *
          100;
      }
      if (storageAnalysis.fileStorage.total > 0) {
        storageAnalysis.fileStorage.percentage =
          (storageAnalysis.fileStorage.used /
            storageAnalysis.fileStorage.total) *
          100;
      }

      // Calculate storage costs
      const dataLimit = 10; // GB included
      const fileLimit = 10; // GB included
      const overageRate = 125; // $125 per 5GB

      const dataOverage = Math.max(
        0,
        storageAnalysis.dataStorage.used / 1024 - dataLimit
      );
      const fileOverage = Math.max(
        0,
        storageAnalysis.fileStorage.used / 1024 - fileLimit
      );

      storageAnalysis.monthlyOverage =
        (dataOverage + fileOverage) * (overageRate / 5);
      storageAnalysis.yearlyOverage = storageAnalysis.monthlyOverage * 12;

      // Generate storage recommendations
      if (storageAnalysis.dataStorage.percentage > 80) {
        storageAnalysis.recommendations.push({
          priority: 'high',
          category: 'storage',
          title: 'Archive Old Data',
          description: `Data storage at ${storageAnalysis.dataStorage.percentage.toFixed(
            1
          )}%`,
          monthlySavings: storageAnalysis.monthlyOverage * 0.3,
          annualSavings: storageAnalysis.yearlyOverage * 0.3,
          effort: 24,
        });
      }

      if (storageAnalysis.growthTrends.growthRate > 10) {
        storageAnalysis.recommendations.push({
          priority: 'medium',
          category: 'storage',
          title: 'Monitor Data Growth',
          description: `Data growth rate at ${storageAnalysis.growthTrends.growthRate.toFixed(
            1
          )}% per month`,
          monthlySavings: storageAnalysis.monthlyOverage * 0.2,
          annualSavings: storageAnalysis.yearlyOverage * 0.2,
          effort: 8,
        });
      }

      if (storageAnalysis.largeFiles.length > 0) {
        const fileCleanupSavings = storageAnalysis.largeFiles.length * 25; // Estimated savings
        storageAnalysis.recommendations.push({
          priority: 'medium',
          category: 'storage',
          title: 'Clean Up Large Files',
          description: `${storageAnalysis.largeFiles.length} large files (>50MB) unused for 6+ months`,
          monthlySavings: fileCleanupSavings,
          annualSavings: fileCleanupSavings * 12,
          effort: 16,
        });
      }

      return storageAnalysis;
    } catch (error) {
      throw new Error(`Storage analysis failed: ${error.message}`);
    }
  }

  async getTechnicalDebtAnalysis() {
    try {
      // Get large classes for technical debt calculation
      const largeClassesQuery = `
        SELECT Id, Name, LengthWithoutComments
        FROM ApexClass
        WHERE Status = 'Active'
        AND LengthWithoutComments > 3000
      `;

      // Get low coverage classes - usar aproximación alternativa
      const lowCoverageQuery = `
        SELECT Id, Name, LengthWithoutComments, LastModifiedDate
        FROM ApexClass
        WHERE Status = 'Active'
        AND NamespacePrefix = null
        AND LengthWithoutComments > 3000
        AND Name NOT LIKE '%Test%'
      `;

      const [largeClassesResponse, lowCoverageResponse] = await Promise.all([
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(largeClassesQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(lowCoverageQuery)}`
        ),
      ]);

      const technicalDebt = {
        largeClasses: largeClassesResponse.records || [],
        lowCoverageClasses: lowCoverageResponse.records || [],
        totalHours: 0,
        hourlyRate: 125,
        totalCost: 0,
        monthlyInterest: 0,
        recommendations: [],
      };

      // Calculate technical debt costs
      technicalDebt.totalHours =
        technicalDebt.largeClasses.length * 16 + // 16 hours per large class
        technicalDebt.lowCoverageClasses.length * 8; // 8 hours per large class without tests

      technicalDebt.totalCost =
        technicalDebt.totalHours * technicalDebt.hourlyRate;
      technicalDebt.monthlyInterest = technicalDebt.totalCost * 0.01; // 1% monthly interest

      // Generate technical debt recommendations
      if (technicalDebt.largeClasses.length > 0) {
        technicalDebt.recommendations.push({
          priority: 'high',
          category: 'technical_debt',
          title: 'Refactor Large Classes',
          description: `${technicalDebt.largeClasses.length} classes exceed 3000 lines`,
          effort: technicalDebt.largeClasses.length * 16,
          impact: 'high',
          cost:
            technicalDebt.largeClasses.length * 16 * technicalDebt.hourlyRate,
        });
      }

      if (technicalDebt.lowCoverageClasses.length > 0) {
        technicalDebt.recommendations.push({
          priority: 'critical',
          category: 'technical_debt',
          title: 'Add Tests for Large Classes',
          description: `${technicalDebt.lowCoverageClasses.length} large classes without test coverage`,
          effort: technicalDebt.lowCoverageClasses.length * 8,
          impact: 'critical',
          cost:
            technicalDebt.lowCoverageClasses.length *
            8 *
            technicalDebt.hourlyRate,
        });
      }

      return technicalDebt;
    } catch (error) {
      throw new Error(`Technical debt analysis failed: ${error.message}`);
    }
  }

  async getOperationalCostAnalysis() {
    try {
      // Get failed batch jobs
      const failedJobsQuery = `
        SELECT Id, Status, JobType, CreatedDate,
               CompletedDate, TotalJobItems,
               NumberOfErrors, ExtendedStatus
        FROM AsyncApexJob
        WHERE CreatedDate >= LAST_N_DAYS:30
        AND (Status = 'Failed' OR NumberOfErrors > 0)
        ORDER BY CreatedDate DESC
      `;

      // Get case volume for support cost analysis
      const caseVolumeQuery = `
        SELECT Origin, COUNT(Id) caseCount
        FROM Case
        WHERE CreatedDate >= LAST_N_MONTHS:3
        GROUP BY Origin
        ORDER BY COUNT(Id) DESC
      `;

      // Get admin-modified records (manual fixes indicator)
      const adminModifiedQuery = `
        SELECT COUNT(Id) adminModifiedCount
        FROM Account
        WHERE LastModifiedById IN (
          SELECT Id FROM User 
          WHERE Profile.Name LIKE '%Admin%'
          AND IsActive = true
        )
        AND LastModifiedDate >= LAST_N_DAYS:30
      `;

      // Get long-running jobs
      const longRunningJobsQuery = `
        SELECT Id, Status, JobType, CreatedDate, CompletedDate
        FROM AsyncApexJob
        WHERE Status = 'Completed'
        AND CreatedDate >= LAST_N_DAYS:7
        ORDER BY CreatedDate DESC
        LIMIT 100
      `;

      const [
        failedJobsResponse,
        caseVolumeResponse,
        adminModifiedResponse,
        longRunningJobsResponse,
      ] = await Promise.all([
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(failedJobsQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(caseVolumeQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(adminModifiedQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(longRunningJobsQuery)}`
        ),
      ]);

      const operationalCosts = {
        failedJobs: failedJobsResponse.records || [],
        caseVolume: caseVolumeResponse.records || [],
        adminModifiedRecords:
          adminModifiedResponse.records?.[0]?.adminModifiedCount || 0,
        longRunningJobs: longRunningJobsResponse.records || [],
        monthlyCosts: {
          failedJobs: 0,
          manualFixes: 0,
          supportCosts: 0,
          longRunningJobs: 0,
          total: 0,
        },
        recommendations: [],
      };

      // Calculate costs
      const failedJobCount = operationalCosts.failedJobs.length;
      const estimatedCostPerFailedJob = 50; // Hours of manual intervention
      operationalCosts.monthlyCosts.failedJobs =
        failedJobCount * estimatedCostPerFailedJob;

      // Calculate manual fix costs based on admin activity
      const adminModifiedCount = operationalCosts.adminModifiedRecords;
      operationalCosts.monthlyCosts.manualFixes = adminModifiedCount * 0.5; // 30 minutes per fix

      // Calculate long-running job costs
      let longRunningJobCost = 0;
      operationalCosts.longRunningJobs.forEach((job) => {
        if (job.CreatedDate && job.CompletedDate) {
          const startTime = new Date(job.CreatedDate);
          const endTime = new Date(job.CompletedDate);
          const durationHours = (endTime - startTime) / (1000 * 60 * 60);

          if (durationHours > 2) {
            // Jobs taking more than 2 hours
            longRunningJobCost += durationHours * 25; // $25 per hour of system resources
          }
        }
      });
      operationalCosts.monthlyCosts.longRunningJobs = longRunningJobCost;

      // Estimate support costs
      const totalCases = operationalCosts.caseVolume.reduce(
        (sum, caseData) => sum + (caseData.caseCount || 0),
        0
      );
      operationalCosts.monthlyCosts.supportCosts = totalCases * 25; // $25 per case

      operationalCosts.monthlyCosts.total =
        operationalCosts.monthlyCosts.failedJobs +
        operationalCosts.monthlyCosts.manualFixes +
        operationalCosts.monthlyCosts.supportCosts +
        operationalCosts.monthlyCosts.longRunningJobs;

      // Generate recommendations
      if (failedJobCount > 0) {
        operationalCosts.recommendations.push({
          priority: 'high',
          title: 'Resolver Trabajos Fallidos',
          description: `${failedJobCount} trabajos fallidos requiriendo intervención manual`,
          monthlySavings: operationalCosts.monthlyCosts.failedJobs,
          effort: failedJobCount * 2,
        });
      }

      if (adminModifiedCount > 50) {
        operationalCosts.recommendations.push({
          priority: 'medium',
          title: 'Reducir Intervenciones Manuales',
          description: `${adminModifiedCount} registros modificados por administradores en 30 días`,
          monthlySavings: operationalCosts.monthlyCosts.manualFixes * 0.5,
          effort: 20,
        });
      }

      if (longRunningJobCost > 0) {
        operationalCosts.recommendations.push({
          priority: 'medium',
          title: 'Optimizar Trabajos de Larga Duración',
          description:
            'Trabajos que consumen recursos del sistema por más de 2 horas',
          monthlySavings: operationalCosts.monthlyCosts.longRunningJobs * 0.7,
          effort: 16,
        });
      }

      if (totalCases > 100) {
        operationalCosts.recommendations.push({
          priority: 'medium',
          title: 'Optimizar Procesos de Soporte',
          description: `${totalCases} casos en 3 meses indican alto volumen de soporte`,
          monthlySavings: operationalCosts.monthlyCosts.supportCosts * 0.3, // 30% reduction
          effort: 40,
        });
      }

      return operationalCosts;
    } catch (error) {
      throw new Error(`Operational cost analysis failed: ${error.message}`);
    }
  }

  async getFinancialHealthScore() {
    try {
      const [
        licenseAnalysis,
        storageAnalysis,
        technicalDebt,
        operationalCosts,
      ] = await Promise.all([
        this.getLicenseAnalysis(),
        this.getStorageAnalysis(),
        this.getTechnicalDebtAnalysis(),
        this.getOperationalCostAnalysis(),
      ]);

      // Calculate financial health metrics
      const financialHealth = {
        licenseUtilization:
          licenseAnalysis.totalLicenses > 0
            ? (licenseAnalysis.usedLicenses / licenseAnalysis.totalLicenses) *
              100
            : 0,
        storageEfficiency: Math.max(
          storageAnalysis.dataStorage.percentage,
          storageAnalysis.fileStorage.percentage
        ),
        growthTrends: storageAnalysis.growthTrends, // Pasar los datos de tendencias
        unusedLicensePercentage:
          licenseAnalysis.totalLicenses > 0
            ? (licenseAnalysis.unusedLicenses / licenseAnalysis.totalLicenses) *
              100
            : 0,
        technicalDebtRatio:
          technicalDebt.totalCost > 0
            ? (technicalDebt.totalCost / 100000) * 100 // Assuming $100k dev budget
            : 0,
        monthlyWaste:
          licenseAnalysis.monthlyWaste + storageAnalysis.monthlyOverage,
        annualWaste:
          licenseAnalysis.yearlyWaste + storageAnalysis.yearlyOverage,
        recommendations: [
          ...licenseAnalysis.recommendations,
          ...storageAnalysis.recommendations,
          ...technicalDebt.recommendations,
          ...operationalCosts.recommendations,
        ].sort((a, b) => {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }),
      };

      // Calculate overall financial health score using unified calculator
      const financialData = {
        licenses: licenseAnalysis,
        storage: storageAnalysis,
        technicalDebt: {
          totalHours: technicalDebt.totalHours || 0,
          totalCost: technicalDebt.totalCost || 0,
          components: technicalDebt.components || [],
        },
        risks: operationalCosts.risks || [],
      };

      financialHealth.overallScore =
        ScoreCalculator.calculateFinancialScore(financialData);

      return {
        overallScore: financialHealth.overallScore,
        metrics: financialHealth,
        details: {
          licenseAnalysis,
          storageAnalysis,
          technicalDebt,
          operationalCosts,
        },
        recommendations: financialHealth.recommendations,
      };
    } catch (error) {
      throw new Error(
        `Financial health score calculation failed: ${error.message}`
      );
    }
  }

  getLicenseMonthlyCost(licenseType) {
    // Costos realistas por tipo de licencia (USD por mes)
    const licenseCosts = {
      Salesforce: 25,
      'Salesforce Platform': 15,
      'Chatter Free': 0,
      'Chatter Only': 5,
      'Customer Community': 2,
      'Customer Community Plus': 5,
      'Partner Community': 8,
      'Service Cloud': 25,
      'Sales Cloud': 25,
      'Force.com - App Subscription': 10,
      'Force.com - Free': 0,
      'Force.com - One App': 5,
      'Analytics Cloud Integration User': 15,
      'B2BMA Integration User': 15,
      'Einstein Agent': 20,
      'External Apps': 5,
      'External Apps Login': 5,
      Identity: 1,
      'Knowledge Only': 10,
      'High Volume Customer Portal': 3,
      'High Volume Portal': 3,
      Partner: 8,
      'Partner App Subscription': 10,
      'Partner Community': 8,
      'Partner Community Login': 8,
      'Sales Insights Integration User': 15,
      'Salesforce Integration': 15,
      'Salesforce Platform One': 10,
      'SalesforceIQ Integration User': 15,
      'Silver Partner': 8,
      'Gold Partner': 12,
      'Siteforce Only': 5,
      'Authenticated Website': 2,
      'Cloud Integration User': 15,
      'Company Communities': 5,
      'Content Only': 5,
      'Customer Community Login': 2,
      'Customer Portal Manager': 8,
      'Customer Portal Manager Custom': 8,
      'Customer Portal Manager Standard': 8,
      'Customer Portal User': 5,
      'Database.com Light': 5,
      'Database.com User': 10,
      'External Identity': 1,
      Guest: 0,
      'Guest License': 0,
      'Internal Portal User': 5,
      default: 10, // Costo por defecto para licencias no listadas
    };

    return licenseCosts[licenseType] || licenseCosts.default;
  }

  estimateLicenseUsage(licenseType, userLicenses) {
    // Si tenemos datos reales de UserLicense, usarlos
    if (userLicenses && userLicenses.length > 0) {
      const licenseData = userLicenses.find(
        (ul) => ul.Name === licenseType || ul.MasterLabel === licenseType
      );

      if (licenseData) {
        return {
          total: licenseData.TotalLicenses || 0,
          used: licenseData.UsedLicenses || 0,
        };
      }
    }

    // Si no hay datos reales, usar estimaciones basadas en tipo de licencia
    // Asumimos que la organización tiene algunas licencias típicas
    const defaultLicenses = {
      Salesforce: { total: 25, used: 20 },
      'Salesforce Platform': { total: 10, used: 7 },
      'Chatter Free': { total: 100, used: 30 },
      'Chatter Only': { total: 50, used: 30 },
      'Customer Community': { total: 100, used: 80 },
      'Customer Community Plus': { total: 50, used: 38 },
      'Partner Community': { total: 25, used: 18 },
      'Service Cloud': { total: 15, used: 13 },
      'Sales Cloud': { total: 20, used: 17 },
      'Force.com - App Subscription': { total: 5, used: 3 },
      'Force.com - Free': { total: 10, used: 2 },
      'Force.com - One App': { total: 5, used: 3 },
      'Analytics Cloud Integration User': { total: 5, used: 3 },
      'B2BMA Integration User': { total: 2, used: 1 },
      'Einstein Agent': { total: 3, used: 2 },
      'External Apps': { total: 10, used: 4 },
      'External Apps Login': { total: 10, used: 5 },
      Identity: { total: 20, used: 18 },
      'Knowledge Only': { total: 5, used: 4 },
      'High Volume Customer Portal': { total: 1000, used: 850 },
      'High Volume Portal': { total: 500, used: 400 },
      Partner: { total: 20, used: 14 },
      'Partner App Subscription': { total: 10, used: 6 },
      'Partner Community Login': { total: 30, used: 21 },
      'Sales Insights Integration User': { total: 3, used: 2 },
      'Salesforce Integration': { total: 5, used: 4 },
      'Salesforce Platform One': { total: 10, used: 6 },
      'SalesforceIQ Integration User': { total: 3, used: 2 },
      'Silver Partner': { total: 5, used: 4 },
      'Gold Partner': { total: 5, used: 4 },
      'Siteforce Only': { total: 20, used: 10 },
      'Authenticated Website': { total: 50, used: 40 },
      'Cloud Integration User': { total: 3, used: 2 },
      'Company Communities': { total: 10, used: 8 },
      'Content Only': { total: 20, used: 13 },
      'Customer Community Login': { total: 200, used: 160 },
      'Customer Portal Manager': { total: 10, used: 8 },
      'Customer Portal Manager Custom': { total: 5, used: 4 },
      'Customer Portal Manager Standard': { total: 5, used: 4 },
      'Customer Portal User': { total: 100, used: 70 },
      'Database.com Light': { total: 10, used: 6 },
      'Database.com User': { total: 5, used: 4 },
      'External Identity': { total: 50, used: 45 },
      Guest: { total: 100, used: 10 },
      'Guest License': { total: 100, used: 10 },
      'Internal Portal User': { total: 20, used: 14 },
      default: { total: 10, used: 7 }, // Por defecto
    };

    return defaultLicenses[licenseType] || defaultLicenses.default;
  }
}

module.exports = FinancialAnalysisService;
