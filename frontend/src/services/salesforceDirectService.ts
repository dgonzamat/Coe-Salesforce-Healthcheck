// Salesforce Service - Conecta a través del servidor
import { SalesforceCredentials, SalesforceConnection } from '../types/salesforce';
import { AnalysisScope } from '../types/analysis';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class SalesforceDirectService {
  private connection: SalesforceConnection = {
    isConnected: false,
    environmentType: 'production'
  };

  // Conectar a Salesforce a través del servidor
  async connectToOrg(credentials: SalesforceCredentials): Promise<SalesforceConnection> {
    try {
      console.log('🔐 Intentando conectar a Salesforce...');
      
      // Obtener información de la org desde el servidor
      const response = await fetch('/api/org-info');
      
      if (!response.ok) {
        throw new Error(`Error de conexión: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      const orgInfo = result.data;
      console.log('✅ Información de org obtenida:', orgInfo.name);

      this.connection = {
        isConnected: true,
        orgInfo,
        sessionId: undefined,
        instanceUrl: orgInfo.instanceUrl,
        environmentType: 'production',
        sandboxName: undefined
      };

      return this.connection;
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      throw error;
    }
  }

  // Obtener información de la org desde el servidor
  async getOrgInfo(): Promise<any> {
    try {
      console.log('📊 Obteniendo información de la org...');
      
      const response = await fetch('/api/org-info');
      
      if (!response.ok) {
        throw new Error(`Error obteniendo info de org: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      console.log('✅ Información de org obtenida exitosamente');
      return result.data;
    } catch (error) {
      console.error('Error getting org info:', error);
      throw error;
    }
  }

  // Obtener datos reales desde el servidor
  async getRealData(): Promise<ApiResponse<any>> {
    try {
      console.log('📊 Obteniendo datos REALES de Salesforce...');
      
      const response = await fetch('/api/real-data');
      
      if (!response.ok) {
        throw new Error(`Error obteniendo datos reales: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      console.log('✅ Datos REALES obtenidos exitosamente');
      return result;
    } catch (error) {
      console.error('Get real data error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Ejecutar análisis desde el servidor
  async runAnalysis(scope: AnalysisScope): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 Ejecutando análisis con datos reales...');
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scope })
      });
      
      if (!response.ok) {
        throw new Error(`Error ejecutando análisis: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      console.log('✅ Análisis completado exitosamente');
      return result;
    } catch (error) {
      console.error('Analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Validar conexión
  async validateConnection(): Promise<boolean> {
    try {
      console.log('🔍 Validando conexión con Salesforce...');
      
      const response = await fetch('/api/health');
      const isValid = response.ok;
      
      console.log('✅ Conexión válida:', isValid);
      return isValid;
    } catch (error) {
      console.error('❌ Error de validación:', error);
      return false;
    }
  }
}

export const salesforceDirectService = new SalesforceDirectService(); 