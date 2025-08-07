// Connection Dialog Component
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  Box,
  Typography
} from '@mui/material';
import { SalesforceCredentials } from '../types/salesforce';

interface ConnectionDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ConnectionDialog: React.FC<ConnectionDialogProps> = ({ open, onClose }) => {
  const [credentials, setCredentials] = useState<SalesforceCredentials>({
    username: '',
    password: '',
    securityToken: '',
    isSandbox: false,
    sandboxName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Configure credentials
      const response = await fetch('http://localhost:5000/api/salesforce/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          securityToken: credentials.securityToken,
          loginUrl: credentials.isSandbox ? 'https://test.salesforce.com' : 'https://login.salesforce.com',
          clientId: '3MVG9A2kN3mk17ZvHIzQlTlNtJcBpCqfZAtN62wd8GzcvC.9HmM6H_9qXm3Zhg9lGR5QZPQFL6KjRAyqQ',
          clientSecret: ''
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Credenciales configuradas exitosamente');
        setTimeout(() => {
          onClose();
          window.location.reload(); // Reload to reconnect
        }, 2000);
      } else {
        setError(result.error || 'Error al configurar credenciales');
      }
    } catch (error) {
      setError('Error de conexión. Verifica que el servidor esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof SalesforceCredentials) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      isSandbox: event.target.checked
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configurar Credenciales de Salesforce</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Ingresa tus credenciales de Salesforce para conectar a tu org.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Usuario"
          value={credentials.username}
          onChange={handleChange('username')}
          margin="normal"
          required
          placeholder="tu.usuario@tuempresa.com"
        />

        <TextField
          fullWidth
          label="Contraseña"
          type="password"
          value={credentials.password}
          onChange={handleChange('password')}
          margin="normal"
          required
          placeholder="Tu contraseña"
        />

        <TextField
          fullWidth
          label="Token de Seguridad"
          value={credentials.securityToken}
          onChange={handleChange('securityToken')}
          margin="normal"
          required
          placeholder="Tu token de seguridad"
          helperText="Obtén tu token de seguridad desde Salesforce: Configuración > Mi Información Personal > Reset My Security Token"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={credentials.isSandbox}
              onChange={handleCheckboxChange}
            />
          }
          label="Es un Sandbox"
          sx={{ mt: 1 }}
        />

        {credentials.isSandbox && (
          <TextField
            fullWidth
            label="Nombre del Sandbox"
            value={credentials.sandboxName}
            onChange={handleChange('sandboxName')}
            margin="normal"
            placeholder="Nombre del sandbox (opcional)"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !credentials.username || !credentials.password || !credentials.securityToken}
        >
          {loading ? 'Configurando...' : 'Configurar Credenciales'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 