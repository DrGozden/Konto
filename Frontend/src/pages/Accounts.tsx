import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Box, Card, CardContent, Typography, Grid, CircularProgress,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Alert, Snackbar,
} from '@mui/material';
import { SwapHoriz } from '@mui/icons-material';
import { GET_ACCOUNTS } from '../graphql/operations';
import { TRANSFER_BETWEEN_ACCOUNTS } from '../graphql/operations';
import { fmtRSD } from '../utils/format';
import type { Account } from '../types';

export default function Accounts() {
  const { data, loading, error } = useQuery<{ accounts: Account[] }>(GET_ACCOUNTS);
  const [transfer, { loading: tLoading }] = useMutation(TRANSFER_BETWEEN_ACCOUNTS, {
    refetchQueries: [{ query: GET_ACCOUNTS }],
  });
  const [open, setOpen] = useState(false);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [snack, setSnack] = useState('');
  const [snackErr, setSnackErr] = useState('');

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  const accounts = data?.accounts ?? [];

  const handleTransfer = async () => {
    try {
      await transfer({
        variables: {
          input: { fromAccountId: fromId, toAccountId: toId, amount: parseFloat(amount) },
        },
      });
      setOpen(false);
      setFromId('');
      setToId('');
      setAmount('');
      setSnack('Transfer uspešan!');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Greška';
      setSnackErr(msg);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Računi</Typography>
        {accounts.length >= 2 && (
          <Button variant="contained" startIcon={<SwapHoriz />} onClick={() => setOpen(true)}>
            Transfer
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {accounts.map((acc) => (
          <Grid key={acc.id} size={{ xs: 12, sm: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  {acc.type === 'DEBIT' ? 'Debitna kartica' : 'Keš'}
                </Typography>
                <Typography variant="h4" fontWeight="bold">{fmtRSD(acc.balance)}</Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Tip: {acc.type}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Transfer dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer između računa</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Sa računa" value={fromId}
            onChange={(e) => setFromId(e.target.value)} sx={{ mt: 2, mb: 2 }}>
            {accounts.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.type === 'DEBIT' ? 'Debitna kartica' : 'Keš'} ({fmtRSD(a.balance)})
              </MenuItem>
            ))}
          </TextField>
          <TextField select fullWidth label="Na račun" value={toId}
            onChange={(e) => setToId(e.target.value)} sx={{ mb: 2 }}>
            {accounts.filter((a) => a.id !== fromId).map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.type === 'DEBIT' ? 'Debitna kartica' : 'Keš'} ({fmtRSD(a.balance)})
              </MenuItem>
            ))}
          </TextField>
          <TextField fullWidth label="Iznos (RSD)" type="number" value={amount}
            onChange={(e) => setAmount(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Otkaži</Button>
          <Button variant="contained" onClick={handleTransfer}
            disabled={!fromId || !toId || !amount || tLoading}>
            {tLoading ? 'Slanje...' : 'Prenesi'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack} />
      <Snackbar open={!!snackErr} autoHideDuration={4000} onClose={() => setSnackErr('')}>
        <Alert severity="error" onClose={() => setSnackErr('')}>{snackErr}</Alert>
      </Snackbar>
    </Box>
  );
}
