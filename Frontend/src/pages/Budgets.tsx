import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Box, Typography, CircularProgress, Alert, Card, CardContent,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Grid, LinearProgress, Chip, Snackbar, MenuItem, IconButton,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import {
  GET_BUDGETS, GET_CATEGORIES, CREATE_BUDGET, DELETE_BUDGET,
} from '../graphql/operations';
import { fmtRSD } from '../utils/format';
import type { Budget, Category } from '../types';
import { BudgetPeriod } from '../types';

export default function Budgets() {
  const { data, loading, error } = useQuery<{ budgets: Budget[] }>(GET_BUDGETS);
  const { data: catData } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);
  const [createBudget, { loading: creating }] = useMutation(CREATE_BUDGET, {
    refetchQueries: [{ query: GET_BUDGETS }],
  });
  const [deleteBudget] = useMutation(DELETE_BUDGET, {
    refetchQueries: [{ query: GET_BUDGETS }],
  });

  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [period, setPeriod] = useState<string>(BudgetPeriod.MONTHLY);
  const [snack, setSnack] = useState('');
  const [snackErr, setSnackErr] = useState('');

  const budgets = data?.budgets ?? [];
  const categories = catData?.categories ?? [];

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget({ variables: { budgetId: id } });
      setSnack('Budžet obrisan!');
    } catch (e: unknown) {
      setSnackErr(e instanceof Error ? e.message : 'Greška');
    }
  };

  const handleCreate = async () => {
    try {
      await createBudget({
        variables: {
          input: {
            categoryId,
            limitAmount: parseFloat(limitAmount),
            period,
          },
        },
      });
      setOpen(false);
      setCategoryId('');
      setLimitAmount('');
      setPeriod(BudgetPeriod.MONTHLY);
      setSnack('Budžet kreiran!');
    } catch (e: unknown) {
      setSnackErr(e instanceof Error ? e.message : 'Greška');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Budžeti</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
          Novi budžet
        </Button>
      </Box>

      {budgets.length === 0 ? (
        <Typography color="text.secondary">Nema budžeta. Kreirajte prvi!</Typography>
      ) : (
        <Grid container spacing={3}>
          {budgets.map((b) => {
            const pct = b.limitAmount > 0 ? Math.min((b.currentSpent / b.limitAmount) * 100, 100) : 0;
            const overBudget = b.currentSpent > b.limitAmount;
            return (
              <Grid key={b.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6">{b.category?.name ?? 'Kategorija'}</Typography>
                      <Chip
                        label={b.period === 'MONTHLY' ? 'Mesečno' : 'Nedeljno'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        color={overBudget ? 'error' : pct > 80 ? 'warning' : 'primary'}
                        sx={{ height: 10, borderRadius: 5, flexGrow: 1 }}
                      />
                      <Chip
                        label={overBudget ? 'Prekoračen' : `${Math.round(pct)}%`}
                        color={overBudget ? 'error' : pct > 80 ? 'warning' : 'success'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Potrošeno: {fmtRSD(b.currentSpent)} / {fmtRSD(b.limitAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      Preostalo: {fmtRSD(Math.max(b.limitAmount - b.currentSpent, 0))}
                    </Typography>
                    <Box display="flex" justifyContent="flex-end" mt={2}>
                      <IconButton color="error" onClick={() => handleDelete(b.id)}>
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

      {/* Create budget dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novi budžet</DialogTitle>
        <DialogContent>
          <TextField
            select fullWidth label="Kategorija" value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)} sx={{ mt: 2, mb: 2 }}
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth label="Limit (RSD)" type="number"
            value={limitAmount} onChange={(e) => setLimitAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            select fullWidth label="Period" value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <MenuItem value={BudgetPeriod.MONTHLY}>Mesečno</MenuItem>
            <MenuItem value={BudgetPeriod.WEEKLY}>Nedeljno</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Otkaži</Button>
          <Button
            variant="contained" onClick={handleCreate}
            disabled={!categoryId || !limitAmount || creating}
          >
            {creating ? 'Kreiranje...' : 'Kreiraj'}
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
