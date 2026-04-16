import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Box, Typography, CircularProgress, Alert, Card, CardContent,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Grid, LinearProgress, IconButton, Chip, Snackbar, MenuItem,
} from '@mui/material';
import { Add, Delete, AccountBalanceWallet } from '@mui/icons-material';
import {
  GET_GOALS, GET_ACCOUNTS, CREATE_GOAL, ADD_MONEY_TO_GOAL, DELETE_GOAL,
} from '../graphql/operations';
import { fmtRSD } from '../utils/format';
import type { Goal, Account } from '../types';

export default function Goals() {
  const { data, loading, error } = useQuery<{ goals: Goal[] }>(GET_GOALS);
  const { data: accData } = useQuery<{ accounts: Account[] }>(GET_ACCOUNTS);
  const [createGoal, { loading: creating }] = useMutation(CREATE_GOAL, {
    refetchQueries: [{ query: GET_GOALS }],
  });
  const [addMoney, { loading: adding }] = useMutation(ADD_MONEY_TO_GOAL, {
    refetchQueries: [{ query: GET_GOALS }, { query: GET_ACCOUNTS }],
  });
  const [deleteGoal] = useMutation(DELETE_GOAL, {
    refetchQueries: [{ query: GET_GOALS }],
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [addAccountId, setAddAccountId] = useState('');
  const [snack, setSnack] = useState('');
  const [snackErr, setSnackErr] = useState('');

  const accounts = accData?.accounts ?? [];
  const goals = data?.goals ?? [];

  const handleCreate = async () => {
    try {
      await createGoal({ variables: { input: { name, targetAmount: parseFloat(targetAmount) } } });
      setCreateOpen(false);
      setName('');
      setTargetAmount('');
      setSnack('Cilj kreiran!');
    } catch (e: unknown) {
      setSnackErr(e instanceof Error ? e.message : 'Greška');
    }
  };

  const handleAdd = async () => {
    try {
      await addMoney({
        variables: { input: { goalId: selectedGoal, amount: parseFloat(addAmount), accountId: addAccountId } },
      });
      setAddOpen(false);
      setAddAmount('');
      setAddAccountId('');
      setSnack('Novac dodat!');
    } catch (e: unknown) {
      setSnackErr(e instanceof Error ? e.message : 'Greška');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal({ variables: { goalId: id } });
      setSnack('Cilj obrisan!');
    } catch (e: unknown) {
      setSnackErr(e instanceof Error ? e.message : 'Greška');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Finansijski ciljevi</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
          Novi cilj
        </Button>
      </Box>

      {goals.length === 0 ? (
        <Typography color="text.secondary">Nema postavljenih ciljeva. Kreirajte prvi!</Typography>
      ) : (
        <Grid container spacing={3}>
          {goals.map((g) => {
            const pct = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0;
            return (
              <Grid key={g.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6">{g.name}</Typography>
                      <Box>
                        <Chip label={g.isCompleted ? 'Završen' : `${Math.round(pct)}%`}
                          color={g.isCompleted ? 'success' : 'primary'} size="small" />
                      </Box>
                    </Box>
                    <LinearProgress variant="determinate" value={pct}
                      sx={{ height: 10, borderRadius: 5, my: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      {fmtRSD(g.currentAmount)} / {fmtRSD(g.targetAmount)}
                    </Typography>
                    <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                      {!g.isCompleted && (
                        <IconButton color="primary" onClick={() => { setSelectedGoal(g.id); setAddOpen(true); }}>
                          <AccountBalanceWallet />
                        </IconButton>
                      )}
                      <IconButton color="error" onClick={() => handleDelete(g.id)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create goal dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novi finansijski cilj</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Naziv cilja" value={name}
            onChange={(e) => setName(e.target.value)} sx={{ mt: 2, mb: 2 }} />
          <TextField fullWidth label="Ciljani iznos (RSD)" type="number"
            value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Otkaži</Button>
          <Button variant="contained" onClick={handleCreate}
            disabled={!name || !targetAmount || creating}>
            {creating ? 'Kreiranje...' : 'Kreiraj'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add money dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dodaj novac na cilj</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Sa računa" value={addAccountId}
            onChange={(e) => setAddAccountId(e.target.value)} sx={{ mt: 2, mb: 2 }}>
            {accounts.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.type === 'DEBIT' ? 'Debitna kartica' : 'Keš'} ({fmtRSD(a.balance)})
              </MenuItem>
            ))}
          </TextField>
          <TextField fullWidth label="Iznos (RSD)" type="number"
            value={addAmount} onChange={(e) => setAddAmount(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Otkaži</Button>
          <Button variant="contained" onClick={handleAdd}
            disabled={!addAccountId || !addAmount || adding}>
            {adding ? 'Dodavanje...' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} />
      <Snackbar open={!!snackErr} autoHideDuration={4000} onClose={() => setSnackErr('')}>
        <Alert severity="error" onClose={() => setSnackErr('')}>{snackErr}</Alert>
      </Snackbar>
    </Box>
  );
}
