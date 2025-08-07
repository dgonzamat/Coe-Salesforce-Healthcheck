const { SalesforceClient } = require('../utils/salesforceClient');

class OrganizationService {
  constructor(salesforceConfig) {
    this.salesforceConfig = salesforceConfig;
    this.client = new SalesforceClient(salesforceConfig);
  }

  async getOrganizationInfo() {
    try {
      // Obtener información básica de la org
      const orgInfo = await this.client.getSObjects();
      const limits = await this.client.getLimits();

      // Obtener información detallada de usuarios
      const userQuery = `
        SELECT Id, Name, Email, Profile.Name, IsActive, LastLoginDate, CreatedDate, 
               Department, Title, CompanyName, Manager.Name 
        FROM User 
        WHERE IsActive = true 
        LIMIT 50
      `;
      const userResponse = await this.client.query(userQuery);

      // Obtener información de licencias
      const licenseQuery = `
        SELECT Id, Name, MasterLabel, Status
        FROM UserLicense
        WHERE Status = 'Active'
        ORDER BY Name
      `;
      const licenseResponse = await this.client.query(licenseQuery);

      // Obtener información de la organización
      let orgResponse = { records: [] };
      try {
        const orgQuery = `
          SELECT Id, Name, OrganizationType, IsSandbox, CreatedDate, Language, 
                 CurrencyIsoCode, Country, State, City, Street, PostalCode, Phone, 
                 Fax, Website, Industry, NumberOfEmployees, AnnualRevenue, Description 
          FROM Organization 
          LIMIT 1
        `;
        orgResponse = await this.client.query(orgQuery);
      } catch (error) {}

      // Determinar información de la organización
      const instanceUrlParts = this.salesforceConfig.instanceUrl.split('.');
      const orgName =
        instanceUrlParts.length > 0
          ? instanceUrlParts[0].replace('https://', '')
          : 'Unknown Organization';

      const isSandbox =
        this.salesforceConfig.instanceUrl.includes('test.salesforce.com') ||
        this.salesforceConfig.instanceUrl.includes(
          '-dev-ed.my.salesforce.com'
        ) ||
        this.salesforceConfig.instanceUrl.includes(
          '-sandbox.my.salesforce.com'
        );

      // Usar orgId de la variable de entorno como respaldo si la consulta SOQL no lo retorna
      const orgId =
        orgResponse.records?.[0]?.Id ||
        process.env.SALESFORCE_ORG_ID ||
        'unknown';

      const orgData = {
        id: orgId,
        name: orgResponse.records?.[0]?.Name || orgName,
        instanceUrl: this.salesforceConfig.instanceUrl,
        organizationType:
          orgResponse.records?.[0]?.OrganizationType || 'Developer Edition',
        isSandbox:
          orgResponse.records?.[0]?.IsSandbox !== undefined
            ? orgResponse.records?.[0]?.IsSandbox
            : isSandbox,
        sandboxType:
          orgResponse.records?.[0]?.IsSandbox || isSandbox
            ? 'Developer'
            : 'Production',
        createdDate: orgResponse.records?.[0]?.CreatedDate || 'Unknown',
        company: {
          language: orgResponse.records?.[0]?.Language || 'Unknown',
          currency: orgResponse.records?.[0]?.CurrencyIsoCode || 'USD',
          country: orgResponse.records?.[0]?.Country || 'Unknown',
          state: orgResponse.records?.[0]?.State || 'Unknown',
          city: orgResponse.records?.[0]?.City || 'Unknown',
          address: {
            street: orgResponse.records?.[0]?.Street || 'Unknown',
            postalCode: orgResponse.records?.[0]?.PostalCode || 'Unknown',
          },
          contact: {
            phone: orgResponse.records?.[0]?.Phone || 'Unknown',
            fax: orgResponse.records?.[0]?.Fax || 'Unknown',
            website: orgResponse.records?.[0]?.Website || 'Unknown',
          },
          business: {
            industry: orgResponse.records?.[0]?.Industry || 'Unknown',
            employees: orgResponse.records?.[0]?.NumberOfEmployees || 0,
            revenue: orgResponse.records?.[0]?.AnnualRevenue || 0,
            description:
              orgResponse.records?.[0]?.Description ||
              'No description available',
          },
        },
        limits: limits,
        licensing: {
          totalLicenses: userResponse.totalSize || 0,
          usedLicenses: userResponse.totalSize || 0,
          availableLicenses: 0,
          licenseTypes:
            licenseResponse.records?.map((license) => ({
              name: license.Name || license.MasterLabel || 'Unknown',
              total: 0,
              used: 0,
              available: 0,
              status: license.Status || 'Unknown',
              definitionKey: license.Id || 'Unknown',
              isUsed: false,
              isProvisioned: false,
              utilizationPercentage: 0,
            })) || [],
        },
        edition: orgResponse.records?.[0]?.OrganizationType || 'Unknown',
        features: {
          hasApex: true,
          hasLightning: true,
          hasCommunities: true,
        },
        stats: {
          totalObjects: Object.keys(orgInfo.sobjects || {}).length,
          activeUsers: userResponse.totalSize || 0,
          apiVersion: this.salesforceConfig.apiVersion,
          orgId: orgResponse.records?.[0]?.Id || 'unknown',
          userId: 'unknown',
          username: 'unknown',
        },
      };

      return {
        success: true,
        data: orgData,
      };
    } catch (error) {
      throw new Error(`Organization info failed: ${error.message}`);
    }
  }

  async getOrganizationHealth() {
    try {
      const orgInfo = await this.getOrganizationInfo();

      // Calcular métricas de salud de la organización
      const healthMetrics = {
        userAdoption: this.calculateUserAdoption(orgInfo.data),
        dataQuality: this.calculateDataQuality(),
        systemHealth: this.calculateSystemHealth(),
        overallScore: 0,
      };

      // Calcular score general
      healthMetrics.overallScore = Math.round(
        (healthMetrics.userAdoption +
          healthMetrics.dataQuality +
          healthMetrics.systemHealth) /
          3
      );

      return {
        success: true,
        data: {
          ...orgInfo.data,
          health: healthMetrics,
        },
      };
    } catch (error) {
      throw new Error(`Organization health failed: ${error.message}`);
    }
  }

  calculateUserAdoption(orgData) {
    // Lógica simplificada para calcular adopción de usuarios
    const activeUsers = orgData.stats.activeUsers;
    const totalLicenses = orgData.licensing.totalLicenses;

    if (totalLicenses === 0) return 100;

    return Math.min(100, Math.round((activeUsers / totalLicenses) * 100));
  }

  calculateDataQuality() {
    // Lógica simplificada para calcular calidad de datos
    // En una implementación real, esto analizaría duplicados, datos incompletos, etc.
    return 85; // Valor por defecto
  }

  calculateSystemHealth() {
    // Lógica simplificada para calcular salud del sistema
    // En una implementación real, esto analizaría errores, rendimiento, etc.
    return 90; // Valor por defecto
  }
}

module.exports = OrganizationService;
