import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import {
  Box, Button, TextField, Typography, Paper, Alert, CircularProgress,
} from '@mui/material';
import { LOGIN } from '../graphql/operations';
import { useAuth } from '../contexts/AuthContext';
import type { AuthPayload } from '../types';

interface LoginData { login: AuthPayload }

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  const [doLogin, { loading }] = useMutation<LoginData>(LOGIN, {
    onCompleted(data) {
      login(data.login.token, data.login.user);
      nav('/');
    },
    onError(e) { setErr(e.message); },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    doLogin({ variables: { input: form } });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
          Konto
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
          Prijavite se na vaš nalog
        </Typography>

        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

        <form onSubmit={submit}>
          <TextField fullWidth label="Email" type="email" margin="normal" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField fullWidth label="Lozinka" type="password" margin="normal" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button fullWidth variant="contained" type="submit" size="large" sx={{ mt: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Prijavi se'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
