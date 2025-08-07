import React from 'react';
import {
  Alert,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';

interface ConnectionStatusProps {
  connection: {
    isConnected: boolean;
    orgName: string;
    orgId: string;
    instanceUrl: string;
    environmentType: 'production' | 'sandbox';
    connectionDate: string;
  };
  isRunning: boolean;
  error: string | null;
  isLoading: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connection,
  isRunning,
  error,
  isLoading
}) => {
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="body1">
          ❌ Error: {error}
        </Typography>
      </Alert>
    );
  }

  if (connection.isConnected && connection.orgName) {
    return (
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          <strong>✅ Conectado a:</strong> {connection.orgName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Org ID:</strong> {connection.orgId} | 
          <strong> Ambiente:</strong> {connection.environmentType} | 
          <strong> Conectado:</strong> {new Date(connection.connectionDate).toLocaleString()}
        </Typography>
      </Alert>
    );
  }

  return (
    <Alert severity="info" sx={{ mb: 3 }}>
      <Typography variant="body1">
        🔄 Conectando a Salesforce...
      </Typography>
      {(isRunning || isLoading) && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2">
            Obteniendo datos de la org...
          </Typography>
        </Box>
      )}
    </Alert>
  );
}; 