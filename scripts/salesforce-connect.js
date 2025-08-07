#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

/**
 * Script de utilidad para conectar con Salesforce CLI
 * y actualizar automáticamente la configuración de la aplicación
 */

function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    return null;
  }
}

function updateConfigFromCLI() {
  // Obtener lista de organizaciones
  const orgList = runCommand('sf org list --json');
  if (!orgList) {
    return false;
  }

  try {
    const orgs = JSON.parse(orgList);

    // Buscar la primera organización conectada
    let org = null;
    if (orgs.result.other && orgs.result.other.length > 0) {
      org = orgs.result.other[0];
    } else if (
      orgs.result.nonScratchOrgs &&
      orgs.result.nonScratchOrgs.length > 0
    ) {
      org = orgs.result.nonScratchOrgs[0];
    } else if (orgs.result.scratchOrgs && orgs.result.scratchOrgs.length > 0) {
      org = orgs.result.scratchOrgs[0];
    }

    if (!org) {
      return false;
    }

    // Usar directamente los datos de la lista de organizaciones
    const result = {
      accessToken: org.accessToken,
      instanceUrl: org.instanceUrl,
      apiVersion: org.instanceApiVersion,
      id: org.orgId,
      username: org.username,
    };

    // Crear contenido del archivo de configuración
    const configContent = `# Salesforce Configuration - Auto-generated
SALESFORCE_ACCESS_TOKEN=${result.accessToken}
SALESFORCE_INSTANCE_URL=${result.instanceUrl}
SALESFORCE_API_VERSION=${result.apiVersion}
SALESFORCE_ORG_ID=${result.id}
SALESFORCE_USERNAME=${result.username}

# Application Configuration
NODE_ENV=development
PORT=3000

# Generated at: ${new Date().toISOString()}
`;

    // Escribir archivo de configuración
    fs.writeFileSync('config.env', configContent);

    return true;
  } catch (error) {
    return false;
  }
}

function testConnection() {
  try {
    const configContent = fs.readFileSync('config.env', 'utf8');
    const lines = configContent.split('\n');

    const config = {};
    lines.forEach((line) => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          config[key.trim()] = value.trim();
        }
      }
    });

    if (!config.SALESFORCE_ACCESS_TOKEN || !config.SALESFORCE_INSTANCE_URL) {
      return false;
    }

    // Probar conexión haciendo una llamada a la API
    const https = require('https');
    const url = `${config.SALESFORCE_INSTANCE_URL}/services/data/v${config.SALESFORCE_API_VERSION}/sobjects/`;

    const options = {
      hostname: new URL(url).hostname,
      path: new URL(url).pathname,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.SALESFORCE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        if (res.statusCode === 200) {
        } else {
        }
      });
    });

    req.on('error', () => {});

    req.end();
  } catch (error) {
    return false;
  }
}

function showHelp() {}

// Procesar argumentos de línea de comandos
const command = process.argv[2];

switch (command) {
  case 'update':
    updateConfigFromCLI();
    break;
  case 'test':
    testConnection();
    break;
  case 'help':
    showHelp();
    break;
  default:
    // Si no se proporciona comando, ejecutar actualización automáticamente
    console.log('🔄 Actualizando configuración de Salesforce...');
    const success = updateConfigFromCLI();
    if (success) {
      console.log('✅ Configuración actualizada exitosamente');
      console.log('🔗 Token de acceso regenerado');
      console.log('📋 Archivo config.env actualizado');
    } else {
      console.log('❌ Error actualizando configuración');
      console.log(
        '💡 Asegúrate de estar conectado con: sf org login web --set-default-dev-hub'
      );
    }
    break;
}
