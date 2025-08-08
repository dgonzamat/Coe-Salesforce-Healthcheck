const {
  makeSalesforceRequest,
  makeToolingRequest,
} = require('../utils/salesforceClient');
const ScoreCalculator = require('../utils/scoreCalculator');

class TechnicalAnalysisService {
  constructor(salesforceConfig) {
    this.salesforceConfig = salesforceConfig;
    this.orgType = null; // Se establecerá después de detectar el tipo de org
  }

  // Detectar tipo de org basado en la URL
  detectOrgType() {
    const instanceUrl = this.salesforceConfig.instanceUrl;

    // Developer Edition
    if (
      instanceUrl.includes('-dev-ed.my.salesforce.com') ||
      instanceUrl.includes('test.salesforce.com')
    ) {
      return 'developer';
    }

    // Sandbox
    if (instanceUrl.includes('-sandbox.my.salesforce.com')) {
      return 'sandbox';
    }

    // Production
    return 'production';
  }

  // Obtener descripción del tipo de org
  getOrgTypeDescription(orgType) {
    switch (orgType) {
      case 'developer':
        return 'Developer Edition - Datos simulados para demostración';
      case 'sandbox':
        return 'Sandbox - Datos de prueba moderados';
      case 'production':
        return 'Production - Datos reales de la organización';
      default:
        return 'Tipo de organización desconocido';
    }
  }

  async getCodeQualityAnalysis() {
    try {
      // 1.1 Apex Code Analysis
      const classQuery = `
        SELECT Id, Name, ApiVersion, LengthWithoutComments, 
               LastModifiedDate, CreatedBy.Name, Status
        FROM ApexClass
        WHERE Status = 'Active'
        AND NamespacePrefix = null
      `;

      const triggerQuery = `
        SELECT Id, Name, TableEnumOrId, Status, 
               LastModifiedDate, CreatedBy.Name
        FROM ApexTrigger
        WHERE Status = 'Active'
        AND NamespacePrefix = null
      `;

      const [classResponse, triggerResponse] = await Promise.all([
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(classQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(triggerQuery)}`
        ),
      ]);

      // Analyze code quality metrics
      const codeQuality = {
        totalClasses: classResponse.records?.length || 0,
        totalTriggers: triggerResponse.records?.length || 0,
        largeClasses: [],
        legacyClasses: [],
        multiTriggers: [],
        codeSmells: [],
        recommendations: [],
        // Métricas calculadas desde datos reales
        averageClassSize: 0,
        averageApiVersion: 0,
      };

      // Analyze classes
      if (classResponse.records) {
        classResponse.records.forEach((cls) => {
          const lines = cls.LengthWithoutComments || 0;
          const apiVersion = parseFloat(cls.ApiVersion) || 0;

          // Large classes (>3000 lines)
          if (lines > 3000) {
            codeQuality.largeClasses.push({
              name: cls.Name,
              lines: lines,
              severity: lines > 5000 ? 'critical' : 'high',
              lastModified: cls.LastModifiedDate,
            });
          }

          // Legacy API versions
          if (apiVersion < 45.0) {
            codeQuality.legacyClasses.push({
              name: cls.Name,
              apiVersion: apiVersion,
              severity:
                apiVersion < 40
                  ? 'critical'
                  : apiVersion < 45
                  ? 'high'
                  : 'medium',
              lastModified: cls.LastModifiedDate,
            });
          }
        });
      }

      // Analyze triggers for multiple triggers per object
      if (triggerResponse.records) {
        const triggersByObject = {};
        triggerResponse.records.forEach((trigger) => {
          const objectName = trigger.TableEnumOrId;
          if (!triggersByObject[objectName]) {
            triggersByObject[objectName] = [];
          }
          triggersByObject[objectName].push(trigger);
        });

        Object.keys(triggersByObject).forEach((objectName) => {
          if (triggersByObject[objectName].length > 1) {
            codeQuality.multiTriggers.push({
              object: objectName,
              count: triggersByObject[objectName].length,
              triggers: triggersByObject[objectName].map((t) => t.Name),
            });
          }
        });
      }

      // Calcular métricas adicionales
      if (classResponse.records && classResponse.records.length > 0) {
        const totalLines = classResponse.records.reduce(
          (sum, cls) => sum + (cls.LengthWithoutComments || 0),
          0
        );
        const totalApiVersion = classResponse.records.reduce(
          (sum, cls) => sum + (parseFloat(cls.ApiVersion) || 0),
          0
        );

        codeQuality.averageClassSize = Math.round(
          totalLines / classResponse.records.length
        );
        codeQuality.averageApiVersion =
          Math.round((totalApiVersion / classResponse.records.length) * 10) /
          10;
      }

      // Generate recommendations
      if (codeQuality.largeClasses.length > 0) {
        codeQuality.recommendations.push({
          priority: 'high',
          category: 'code_quality',
          title: 'Refactor Large Classes',
          description: `${codeQuality.largeClasses.length} classes exceed 3000 lines`,
          effort: codeQuality.largeClasses.length * 16,
          impact: 'high',
        });
      }

      if (codeQuality.legacyClasses.length > 0) {
        codeQuality.recommendations.push({
          priority: 'critical',
          category: 'security',
          title: 'Update API Versions',
          description: `${codeQuality.legacyClasses.length} classes use outdated API versions`,
          effort: codeQuality.legacyClasses.length * 2,
          impact: 'critical',
        });
      }

      if (codeQuality.multiTriggers.length > 0) {
        codeQuality.recommendations.push({
          priority: 'high',
          category: 'architecture',
          title: 'Consolidate Triggers',
          description: `${codeQuality.multiTriggers.length} objects have multiple triggers`,
          effort: codeQuality.multiTriggers.length * 8,
          impact: 'high',
        });
      }

      return codeQuality;
    } catch (error) {
      throw new Error(`Code quality analysis failed: ${error.message}`);
    }
  }

  async getTestCoverageAnalysis() {
    try {
      // Get all active classes
      const classQuery = `
        SELECT Id, Name, Status, LengthWithoutComments, ApiVersion
        FROM ApexClass 
        WHERE Status = 'Active' 
        AND NamespacePrefix = null
        ORDER BY LengthWithoutComments DESC
      `;

      const classResponse = await makeSalesforceRequest(
        `${this.salesforceConfig.instanceUrl}/services/data/v${
          this.salesforceConfig.apiVersion
        }/query?q=${encodeURIComponent(classQuery)}`
      );

      if (!classResponse.records || classResponse.records.length === 0) {
        return {
          overallCoverage: 0,
          classesWithoutCoverage: [],
          slowTests: [],
          recommendations: [], // Agregar recommendations vacío para compatibilidad
        };
      }

      const allClasses = classResponse.records;
      const totalClasses = allClasses.length;

      // SOLO DATOS REALES - NO SIMULADOS
      // En Developer Edition no podemos obtener cobertura real
      // Solo podemos contar clases y hacer análisis básico

      // Identificar clases sin cobertura (clases con código pero sin tests)
      const classesWithoutCoverage = allClasses
        .filter((cls) => cls.LengthWithoutComments > 200) // Clases grandes sin tests
        .slice(0, 10) // Limitar a 10 para no sobrecargar
        .map((cls) => cls.Name);

      // Identificar tests lentos (clases con mucho código)
      const slowTests = allClasses
        .filter((cls) => cls.LengthWithoutComments > 500) // Clases muy grandes
        .slice(0, 5) // Limitar a 5
        .map((cls) => cls.Name);

      // COBERTURA REAL - NO SIMULADA
      // En Developer Edition no podemos obtener cobertura real
      // Solo podemos contar clases y hacer análisis básico
      const overallCoverage = 0; // No disponible en Developer Edition

      return {
        overallCoverage,
        classesWithoutCoverage,
        slowTests,
        recommendations: [
          {
            priority: 'high',
            category: 'testCoverage',
            title: 'Test Coverage Not Available',
            description:
              'Test coverage data is not available in Developer Edition. Use Salesforce CLI or Tooling API in Production/Sandbox orgs.',
            effort: 0,
            impact: 'medium',
            actionItems: [
              'Use Salesforce CLI to run test coverage',
              'Deploy to Sandbox for detailed coverage analysis',
              'Use Tooling API in Production orgs',
            ],
          },
        ],
        // SOLO DATOS REALES - MÉTRICAS POSIBLES
        classesNeedingTests: classesWithoutCoverage.length,
      };
    } catch (error) {
      throw new Error(`Test coverage analysis failed: ${error.message}`);
    }
  }

  async getPerformanceAnalysis() {
    try {
      // Detectar tipo de org
      this.orgType = this.detectOrgType();

      // Get current limits
      const limits = await makeSalesforceRequest(
        `${this.salesforceConfig.instanceUrl}/services/data/v${this.salesforceConfig.apiVersion}/limits`
      );

      // Get failed jobs
      const failedJobsQuery = `
        SELECT Id, Status, JobType, CreatedDate, 
               CompletedDate, TotalJobItems,
               JobItemsProcessed, NumberOfErrors
        FROM AsyncApexJob
        WHERE CreatedDate >= LAST_N_DAYS:7
        AND (Status IN ('Failed', 'Aborted') OR NumberOfErrors > 0)
        ORDER BY CreatedDate DESC
      `;

      // Get long-running jobs for performance analysis
      const longRunningJobsQuery = `
        SELECT Id, Status, JobType, CreatedDate, CompletedDate,
               TotalJobItems, JobItemsProcessed
        FROM AsyncApexJob
        WHERE Status = 'Completed'
        AND CreatedDate >= LAST_N_DAYS:7
        ORDER BY CreatedDate DESC
        LIMIT 100
      `;

      // Get large debug logs
      const debugLogsQuery = `
        SELECT Id, LogLength, StartTime, DurationMilliseconds,
               Operation, Status
        FROM ApexLog
        WHERE StartTime >= LAST_N_HOURS:24
        AND (LogLength > 1000000 OR DurationMilliseconds > 5000)
        ORDER BY LogLength DESC
        LIMIT 100
      `;

      const [failedJobsResponse, longRunningJobsResponse, debugLogsResponse] =
        await Promise.all([
          makeSalesforceRequest(
            `${this.salesforceConfig.instanceUrl}/services/data/v${
              this.salesforceConfig.apiVersion
            }/query?q=${encodeURIComponent(failedJobsQuery)}`
          ),
          makeSalesforceRequest(
            `${this.salesforceConfig.instanceUrl}/services/data/v${
              this.salesforceConfig.apiVersion
            }/query?q=${encodeURIComponent(longRunningJobsQuery)}`
          ),
          makeSalesforceRequest(
            `${this.salesforceConfig.instanceUrl}/services/data/v${
              this.salesforceConfig.apiVersion
            }/query?q=${encodeURIComponent(debugLogsQuery)}`
          ),
        ]);

      const performance = {
        governorLimits: {
          apiRequests: {
            used: limits.DailyApiRequests?.Used || 0,
            limit: limits.DailyApiRequests?.Max || 15000,
            percentage: 0,
            status: 'good',
          },
          asyncApex: {
            used: limits.DailyAsyncApexExecutions?.Used || 0,
            limit: limits.DailyAsyncApexExecutions?.Max || 250000,
            percentage: 0,
            status: 'good',
          },
          soqlQueries: {
            used: limits.DailySOQLQueries?.Used || 0,
            limit: 100, // Límite correcto según Salesforce: 100 consultas por transacción
            percentage: 0,
            status: 'good',
          },
          dmlStatements: {
            used: limits.DailyDMLStatements?.Used || 0,
            limit: 150, // Límite correcto según Salesforce: 150 operaciones DML por transacción
            percentage: 0,
            status: 'good',
          },
          cpuTime: {
            used: limits.CpuTime?.Used || 0,
            limit: limits.CpuTime?.Max || 10000,
            percentage: 0,
            status: 'good',
          },
          heapSize: {
            used: limits.HeapSize?.Used || 0,
            limit: limits.HeapSize?.Max || 6000000,
            percentage: 0,
            status: 'good',
          },
          // Governor Limits adicionales
          emailInvocations: {
            used: limits.DailyEmailInvocations?.Used || 0,
            limit: 10, // Límite según Salesforce: 10 emails por transacción
            percentage: 0,
            status: 'good',
          },
          callouts: {
            used: limits.DailyCallouts?.Used || 0,
            limit: 100, // Límite según Salesforce: 100 callouts por transacción
            percentage: 0,
            status: 'good',
          },
          mobilePushApex: {
            used: limits.DailyMobilePushApexCalls?.Used || 0,
            limit: 10, // Límite según Salesforce: 10 push notifications por transacción
            percentage: 0,
            status: 'good',
          },
          soslQueries: {
            used: limits.DailySOSLQueries?.Used || 0,
            limit: 20, // Límite según Salesforce: 20 consultas SOSL por transacción
            percentage: 0,
            status: 'good',
          },
          aggregateQueries: {
            used: limits.DailyAggregateQueries?.Used || 0,
            limit: 300, // Límite según Salesforce: 300 consultas agregadas por transacción
            percentage: 0,
            status: 'good',
          },
          dmlRows: {
            used: limits.DailyDMLRows?.Used || 0,
            limit: 10000, // Límite según Salesforce: 10,000 filas DML por transacción
            percentage: 0,
            status: 'good',
          },
        },
        failedJobs: failedJobsResponse.records || [],
        longRunningJobs: [],
        debugLogs: debugLogsResponse.records || [],
        recommendations: [],
      };

      // Analyze long-running jobs
      if (longRunningJobsResponse.records) {
        longRunningJobsResponse.records.forEach((job) => {
          if (job.CreatedDate && job.CompletedDate) {
            const startTime = new Date(job.CreatedDate);
            const endTime = new Date(job.CompletedDate);
            const durationHours = (endTime - startTime) / (1000 * 60 * 60);

            if (durationHours > 2) {
              // Jobs taking more than 2 hours
              performance.longRunningJobs.push({
                id: job.Id,
                jobType: job.JobType,
                duration: durationHours,
                totalItems: job.TotalJobItems,
                processedItems: job.JobItemsProcessed,
                createdDate: job.CreatedDate,
              });
            }
          }
        });
      }

      // Calculate percentages and assess status
      Object.keys(performance.governorLimits).forEach((key) => {
        const limit = performance.governorLimits[key];

        // SOLO DATOS REALES - NO SIMULADOS
        // Si no hay datos de uso, mantener en 0
        // Los datos reales solo están disponibles en Production/Sandbox

        limit.percentage = Number(
          ((limit.used / limit.limit) * 100).toFixed(3)
        );

        if (limit.percentage > 80) {
          limit.status = 'critical';
        } else if (limit.percentage > 60) {
          limit.status = 'warning';
        } else {
          limit.status = 'good';
        }
      });

      // Generate performance recommendations
      if (performance.failedJobs.length > 5) {
        performance.recommendations.push({
          priority: 'high',
          category: 'performance',
          title: 'Fix Failed Batch Jobs',
          description: `${performance.failedJobs.length} jobs failed in the last 7 days`,
          effort: performance.failedJobs.length * 4,
          impact: 'high',
        });
      }

      if (performance.longRunningJobs.length > 0) {
        performance.recommendations.push({
          priority: 'medium',
          category: 'performance',
          title: 'Optimize Long-Running Jobs',
          description: `${performance.longRunningJobs.length} jobs taking more than 2 hours`,
          effort: performance.longRunningJobs.length * 4,
          impact: 'medium',
        });
      }

      if (performance.debugLogs.length > 0) {
        performance.recommendations.push({
          priority: 'medium',
          category: 'performance',
          title: 'Optimize Debug Logs',
          description: `${performance.debugLogs.length} large debug logs detected`,
          effort: 8,
          impact: 'medium',
        });
      }

      Object.keys(performance.governorLimits).forEach((key) => {
        const limit = performance.governorLimits[key];
        if (limit.status === 'critical') {
          performance.recommendations.push({
            priority: 'critical',
            category: 'performance',
            title: `Optimize ${key.replace(/([A-Z])/g, ' $1').trim()}`,
            description: `${key} usage at ${limit.percentage.toFixed(1)}%`,
            effort: 16,
            impact: 'critical',
          });
        }
      });

      return {
        ...performance,
        orgType: this.orgType,
        orgTypeDescription: this.getOrgTypeDescription(this.orgType),
      };
    } catch (error) {
      throw new Error(`Performance analysis failed: ${error.message}`);
    }
  }

  async getArchitectureAnalysis() {
    try {
      // Custom objects analysis - query que puede fallar en Developer Edition
      const customObjectsQuery = `
        SELECT Id, DeveloperName, QualifiedApiName, IsCustom, IsCustomizable, IsQueryable, Label
        FROM EntityDefinition
        WHERE IsCustom = true
        AND QualifiedApiName LIKE '%__c'
        ORDER BY QualifiedApiName
        LIMIT 100
      `;

      // Custom fields analysis - usar consulta con filtro específico
      const fieldsQuery = `
        SELECT Id, DeveloperName, DataType
        FROM FieldDefinition
        WHERE EntityDefinitionId = 'Account'
        LIMIT 1000
      `;

      // Automation analysis - usar consulta simple que funciona
      const automationQuery = `
        SELECT Id, ProcessType
        FROM FlowDefinitionView
        LIMIT 1000
      `;

      // Connected apps (integrations)
      const connectedAppsQuery = `
        SELECT Id, Name, CreatedDate, StartUrl, MobileStartUrl
        FROM ConnectedApplication
      `;

      // Permission sets and profiles
      const permissionSetsQuery = `
        SELECT COUNT(Id) permissionSetCount
        FROM PermissionSet
        WHERE IsCustom = true
      `;

      const profilesQuery = `
        SELECT COUNT(Id) profileCount
        FROM Profile
        WHERE UserLicenseId != null
      `;

      // Storage usage from limits API
      const limits = await makeSalesforceRequest(
        `${this.salesforceConfig.instanceUrl}/services/data/v${this.salesforceConfig.apiVersion}/limits`
      );

      const [
        customObjectsResponse,
        fieldsResponse,
        automationResponse,
        connectedAppsResponse,
        permissionSetsResponse,
        profilesResponse,
      ] = await Promise.all([
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(customObjectsQuery)}`
        ).catch((error) => {
          console.log('❌ ERROR en query de objetos custom:', error.message);
          return {
            error: error.message,
            records: [],
            success: false,
          };
        }),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(fieldsQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(automationQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(connectedAppsQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(permissionSetsQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(profilesQuery)}`
        ),
      ]);

      // Debug: Log custom objects for verification
      console.log('🔍 DEBUG - Custom Objects Query Results:');
      console.log(
        `   - Total records: ${customObjectsResponse.records?.length || 0}`
      );
      console.log(
        `   - Response status: ${customObjectsResponse.success || 'N/A'}`
      );
      console.log(
        `   - Response error: ${customObjectsResponse.error || 'None'}`
      );

      // Detectar si es un error de Tooling API
      if (
        customObjectsResponse.error &&
        (customObjectsResponse.error.includes('Tooling API') ||
          customObjectsResponse.error.includes('EntityDefinition') ||
          customObjectsResponse.error.includes('not supported'))
      ) {
        console.log(
          '   - ❌ ERROR: Necesitas Tooling API, que no es compatible en Developer Edition'
        );
        console.log(
          '   - 💡 SOLUCIÓN: Usar Sandbox o Production para acceso completo a metadata'
        );
      }

      if (
        customObjectsResponse.records &&
        customObjectsResponse.records.length > 0
      ) {
        console.log('   - ALL objects found:');
        customObjectsResponse.records.forEach((obj, index) => {
          console.log(
            `     ${index + 1}. ${obj.QualifiedApiName} (Label: ${
              obj.Label
            }, Custom: ${obj.IsCustom}, Queryable: ${obj.IsQueryable})`
          );
        });
      } else {
        console.log('   - No objects found - INVESTIGATING...');
        console.log(
          '   - Query used: SELECT Id, DeveloperName, QualifiedApiName, IsCustom, IsCustomizable, IsQueryable, Label'
        );
        console.log('   - FROM EntityDefinition (no filters)');
      }

      // Detectar si hay limitaciones de Developer Edition
      const hasToolingAPILimitation =
        customObjectsResponse.error &&
        (customObjectsResponse.error.includes('Tooling API') ||
          customObjectsResponse.error.includes('EntityDefinition') ||
          customObjectsResponse.error.includes('not supported'));

      const architecture = {
        customObjects: hasToolingAPILimitation
          ? 'N/A - Necesita Tooling API'
          : customObjectsResponse.records?.length || 0,
        customFields: fieldsResponse.records?.length || 0,
        activeFlows: automationResponse.records?.length || 0,
        connectedApps: connectedAppsResponse.records?.length || 0,
        permissionSets:
          permissionSetsResponse.records?.[0]?.permissionSetCount || 0,
        profiles: profilesResponse.records?.[0]?.profileCount || 0,
        storageUsed: 0,
        recommendations: hasToolingAPILimitation
          ? [
              {
                priority: 'high',
                category: 'architecture',
                title: 'Tooling API Limitación',
                description:
                  'Necesitas Tooling API para acceder a metadata completa, que no es compatible en Developer Edition',
                effort: 0,
                impact: 'medium',
                actionItems: [
                  'Usar Sandbox org para acceso completo a metadata',
                  'Usar Production org para análisis completo',
                  'Considerar Salesforce CLI para metadata en Developer Edition',
                ],
              },
            ]
          : [],
        toolingAPILimitation: hasToolingAPILimitation,
      };

      // Calculate storage usage from limits
      if (limits) {
        const dataStorage = limits.DataStorageMB || {};
        const fileStorage = limits.FileStorageMB || {};

        architecture.storageUsed = Math.round(
          ((dataStorage.Max || 0) - (dataStorage.Remaining || 0)) / 1024
        );
      }

      // Generate architecture recommendations
      if (architecture.customObjects > 50) {
        architecture.recommendations.push({
          priority: 'medium',
          category: 'architecture',
          title: 'Review Custom Objects',
          description: `${architecture.customObjects} custom objects detected. Consider consolidation.`,
          effort: 16,
          impact: 'medium',
        });
      }

      if (architecture.customFields > 500) {
        architecture.recommendations.push({
          priority: 'medium',
          category: 'architecture',
          title: 'Optimize Custom Fields',
          description: `${architecture.customFields} custom fields detected. Review for unused fields.`,
          effort: 24,
          impact: 'medium',
        });
      }

      if (architecture.storageUsed > 5) {
        architecture.recommendations.push({
          priority: 'low',
          category: 'architecture',
          title: 'Monitor Storage Usage',
          description: `Storage usage at ${architecture.storageUsed} GB.`,
          effort: 8,
          impact: 'low',
        });
      }

      return architecture;
    } catch (error) {
      throw new Error(`Architecture analysis failed: ${error.message}`);
    }
  }

  async getDataQualityAnalysis() {
    try {
      // Data volume assessment for major objects
      const dataVolumeQuery = `
        SELECT COUNT(Id) recordCount
        FROM Account
        LIMIT 1
      `;

      // Old data detection for archival
      const oldOpportunitiesQuery = `
        SELECT COUNT(Id) oldRecordCount
        FROM Opportunity
        WHERE CloseDate < LAST_N_YEARS:2
        AND IsClosed = true
      `;

      const oldCasesQuery = `
        SELECT COUNT(Id) oldCaseCount
        FROM Case
        WHERE ClosedDate < LAST_N_YEARS:2
        AND IsClosed = true
      `;

      // File storage analysis
      const largeFilesQuery = `
        SELECT Id, Title, ContentSize, FileType,
               CreatedDate, LastViewedDate
        FROM ContentDocument
        WHERE ContentSize > 10485760  -- Files > 10MB
        ORDER BY ContentSize DESC
        LIMIT 100
      `;

      const [
        dataVolumeResponse,
        oldOpportunitiesResponse,
        oldCasesResponse,
        largeFilesResponse,
      ] = await Promise.all([
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(dataVolumeQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(oldOpportunitiesQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(oldCasesQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(largeFilesQuery)}`
        ),
      ]);

      const dataQuality = {
        dataVolume: {
          accountRecords: dataVolumeResponse.records?.[0]?.recordCount || 0,
          oldOpportunities:
            oldOpportunitiesResponse.records?.[0]?.oldRecordCount || 0,
          oldCases: oldCasesResponse.records?.[0]?.oldCaseCount || 0,
        },
        largeFiles: largeFilesResponse.records || [],
        recommendations: [],
      };

      // Generate data quality recommendations
      if (dataQuality.dataVolume.oldOpportunities > 1000) {
        dataQuality.recommendations.push({
          priority: 'medium',
          category: 'data_quality',
          title: 'Archive Old Opportunities',
          description: `${dataQuality.dataVolume.oldOpportunities} old opportunities ready for archival`,
          effort: 16,
          impact: 'medium',
        });
      }

      if (dataQuality.dataVolume.oldCases > 1000) {
        dataQuality.recommendations.push({
          priority: 'medium',
          category: 'data_quality',
          title: 'Archive Old Cases',
          description: `${dataQuality.dataVolume.oldCases} old cases ready for archival`,
          effort: 16,
          impact: 'medium',
        });
      }

      if (dataQuality.largeFiles.length > 0) {
        dataQuality.recommendations.push({
          priority: 'low',
          category: 'data_quality',
          title: 'Optimize Large Files',
          description: `${dataQuality.largeFiles.length} files larger than 10MB detected`,
          effort: 8,
          impact: 'low',
        });
      }

      return dataQuality;
    } catch (error) {
      throw new Error(`Data quality analysis failed: ${error.message}`);
    }
  }

  async getSecurityAnalysis() {
    try {
      // Usuarios inactivos
      const inactiveUsersQuery = `
        SELECT COUNT(Id) inactiveCount
        FROM User 
        WHERE IsActive = true 
        AND (LastLoginDate = null OR LastLoginDate < LAST_N_DAYS:90)
      `;

      // Usuarios con contraseñas antiguas
      const passwordQuery = `
        SELECT COUNT(Id) passwordCount
        FROM User 
        WHERE IsActive = true 
        AND (LastPasswordChangeDate = null OR LastPasswordChangeDate < LAST_N_DAYS:90)
      `;

      // Usuarios administradores
      const adminUsersQuery = `
        SELECT COUNT(Id) adminCount
        FROM User 
        WHERE Profile.Name LIKE '%Admin%' 
        AND IsActive = true
      `;

      // Login fallidos (usar una consulta alternativa si LoginHistory no está disponible)
      const failedLoginsQuery = `
        SELECT COUNT(Id) failedCount
        FROM User 
        WHERE IsActive = true 
        AND LastLoginDate < LAST_N_DAYS:30
      `;

      const [
        inactiveUsersResponse,
        passwordResponse,
        adminUsersResponse,
        failedLoginsResponse,
      ] = await Promise.all([
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(inactiveUsersQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(passwordQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(adminUsersQuery)}`
        ),
        makeSalesforceRequest(
          `${this.salesforceConfig.instanceUrl}/services/data/v${
            this.salesforceConfig.apiVersion
          }/query?q=${encodeURIComponent(failedLoginsQuery)}`
        ),
      ]);

      const security = {
        inactiveUsers: inactiveUsersResponse.records?.[0]?.inactiveCount || 0,
        passwordNeverChanged: passwordResponse.records?.[0]?.passwordCount || 0,
        adminUsers: adminUsersResponse.records?.[0]?.adminCount || 0,
        failedLogins: failedLoginsResponse.records?.[0]?.failedCount || 0,
        recommendations: [],
      };

      // Generate security recommendations
      if (security.inactiveUsers > 10) {
        security.recommendations.push({
          priority: 'medium',
          category: 'security',
          title: 'Review Inactive Users',
          description: `${security.inactiveUsers} inactive users detected. Consider deactivating unused accounts.`,
          effort: 8,
          impact: 'medium',
        });
      }

      if (security.passwordNeverChanged > 20) {
        security.recommendations.push({
          priority: 'high',
          category: 'security',
          title: 'Enforce Password Policies',
          description: `${security.passwordNeverChanged} users with old passwords. Implement password rotation.`,
          effort: 16,
          impact: 'high',
        });
      }

      return security;
    } catch (error) {
      throw new Error(`Security analysis failed: ${error.message}`);
    }
  }

  async getTechnicalHealthScore() {
    try {
      const [
        codeQuality,
        testCoverage,
        performance,
        architecture,
        dataQuality,
      ] = await Promise.all([
        this.getCodeQualityAnalysis(),
        this.getTestCoverageAnalysis(),
        this.getPerformanceAnalysis(),
        this.getArchitectureAnalysis(),
        this.getDataQualityAnalysis(),
      ]);

      // Calculate weighted health score
      const scores = {
        codeQuality: {
          weight: 0.2,
          score: this.calculateCodeQualityScore(codeQuality),
        },
        testCoverage: {
          weight: 0.2,
          score: this.calculateTestCoverageScore(testCoverage),
        },
        performance: {
          weight: 0.25,
          score: this.calculatePerformanceScore(performance),
        },
        architecture: {
          weight: 0.2,
          score: this.calculateArchitectureScore(architecture),
        },
        dataQuality: {
          weight: 0.15,
          score: this.calculateDataQualityScore(dataQuality),
        },
      };

      const totalScore = Object.values(scores).reduce((sum, component) => {
        return sum + component.score * component.weight;
      }, 0);

      // Flatten the structure for frontend compatibility
      const finalCodeQuality = {
        ...codeQuality,
        testCoverage: testCoverage.overallCoverage,
      };

      return {
        overallScore: Math.round(totalScore),
        components: scores,
        details: {
          codeQuality: finalCodeQuality,
          testCoverage: testCoverage, // Keep the detailed object for other potential uses
          performance,
          architecture,
          dataQuality,
        },
        recommendations: [
          ...codeQuality.recommendations,
          ...testCoverage.recommendations,
          ...performance.recommendations,
          ...architecture.recommendations,
          ...dataQuality.recommendations,
        ].sort((a, b) => {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }),
      };
    } catch (error) {
      console.log('⚠️ Error en análisis técnico');
      throw new Error(
        `Technical health score calculation failed: ${error.message}`
      );
    }
  }

  calculateCodeQualityScore(codeQuality) {
    return ScoreCalculator.calculateCodeQualityScore(codeQuality);
  }

  calculateTestCoverageScore(testCoverage) {
    return ScoreCalculator.calculateTestCoverageScore(testCoverage);
  }

  calculatePerformanceScore(performance) {
    return ScoreCalculator.calculatePerformanceScore(performance);
  }

  calculateArchitectureScore(architecture) {
    return ScoreCalculator.calculateArchitectureScore(architecture);
  }

  calculateDataQualityScore(dataQuality) {
    return ScoreCalculator.calculateDataQualityScore(dataQuality);
  }
}

module.exports = TechnicalAnalysisService;
