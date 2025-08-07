const https = require('https');

class SalesforceClient {
  constructor(config) {
    this.config = config;
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.config.accessToken || !this.config.instanceUrl) {
        reject(
          new Error(
            'Configuración de Salesforce no válida. Verifica las variables de entorno.'
          )
        );
        return;
      }

      const requestOptions = {
        hostname: new URL(url).hostname,
        path: new URL(url).pathname + new URL(url).search,
        method: options.method || 'GET',
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      const req = https.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            resolve(data);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  async query(soqlQuery) {
    const url = `${this.config.instanceUrl}/services/data/v${
      this.config.apiVersion
    }/query?q=${encodeURIComponent(soqlQuery)}`;
    return this.makeRequest(url);
  }

  async getLimits() {
    const url = `${this.config.instanceUrl}/services/data/v${this.config.apiVersion}/limits`;
    return this.makeRequest(url);
  }

  async getSObjects() {
    const url = `${this.config.instanceUrl}/services/data/v${this.config.apiVersion}/sobjects/`;
    return this.makeRequest(url);
  }

  async executeAnonymousApex(apexCode) {
    const url = `${this.config.instanceUrl}/services/tooling/executeAnonymous/?anonymousBody=${encodeURIComponent(apexCode)}`;
    return this.makeRequest(url, { method: 'GET' }); // Note: This should ideally be a POST for anonymous apex, but for simple execution GET can work.
  }
}

// Función de conveniencia para compatibilidad con el código existente
function makeSalesforceRequest(url, options = {}) {
  const client = new SalesforceClient({
    accessToken: process.env.SALESFORCE_ACCESS_TOKEN,
    instanceUrl: process.env.SALESFORCE_INSTANCE_URL,
    apiVersion: process.env.SALESFORCE_API_VERSION || '64.0',
  });

  return client.makeRequest(url, options);
}

async function makeToolingRequest(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SALESFORCE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Tooling API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    
    throw error;
  }
}

async function makeMetadataRequest(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SALESFORCE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Metadata API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    
    throw error;
  }
}

async function executeAnonymousApex(apexCode) {
    const client = new SalesforceClient({
        accessToken: process.env.SALESFORCE_ACCESS_TOKEN,
        instanceUrl: process.env.SALESFORCE_INSTANCE_URL,
        apiVersion: process.env.SALESFORCE_API_VERSION || '64.0',
    });

    return client.executeAnonymousApex(apexCode);
}

module.exports = {
  SalesforceClient,
  makeSalesforceRequest,
  makeToolingRequest,
  makeMetadataRequest,
  executeAnonymousApex,
};