import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Box, Typography, CircularProgress, Alert,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Snackbar, IconButton, TableSortLabel,
} from '@mui/material';
import { Add, ArrowForward } from '@mui/icons-material';
import { GET_TRANSACTIONS, GET_ACCOUNTS, GET_CATEGORIES, GET_BUDGETS, CREATE_TRANSACTION } from '../graphql/operations';
import { fmtRSD, fmtDate } from '../utils/format';
import { TransactionType } from '../types';
import type { Account, Category, TransactionConnection } from '../types';

export default function Transactions() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filter: Record<string, unknown> = {};
  if (filterCat) filter.categoryId = filterCat;
  if (filterType) filter.type = filterType;

  const transactionVariables = {
    first: 15,
    after: cursor,
    filter: Object.keys(filter).length ? filter : undefined,
  };

  const { data, loading, error, refetch } = useQuery<{ transactions: TransactionConnection }>(GET_TRANSACTIONS, {
    variables: transactionVariables,
  });
  const { data: accData } = useQuery<{ accounts: Account[] }>(GET_ACCOUNTS);
  const { data: catData } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);
  const [createTx, { loading: creating }] = useMutation(CREATE_TRANSACTION, {
    refetchQueries: [{ query: GET_ACCOUNTS }, { query: GET_BUDGETS }],
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ accountId: '', categoryId: '', amount: '', type: '', description: '' });
  const [snack, setSnack] = useState('');
  const [snackErr, setSnackErr] = useState('');

  const accounts = accData?.accounts ?? [];
  const categories = catData?.categories ?? [];
  const edges = data?.transactions.edges ?? [];
  const pageInfo = data?.transactions.pageInfo;

  const handleCreate = async () => {
    try {
      await createTx({
        variables: {
          input: {
            accountId: form.accountId,
            categoryId: form.categoryId,
            amount: parseFloat(form.amount),
            type: form.type,
            description: form.description || undefined,
          },
        },
      });
      setCursor(null);
      await refetch({ ...transactionVariables, after: null });
      setOpen(false);
      setForm({ accountId: '', categoryId: '', amount: '', type: '', description: '' });
      setSnack('Transakcija kreirana!');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Greška';
      setSnackErr(msg);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Transakcije</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
          Nova transakcija
        </Button>
      </Box>

      {/* Filters */}
      <Box display="flex" gap={2} mb={3}>
        <TextField select label="Kategorija" value={filterCat}
          onChange={(e) => { setFilterCat(e.target.value); setCursor(null); }}
          sx={{ minWidth: 180 }} size="small">
          <MenuItem value="">Sve</MenuItem>
          {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </TextField>
        <TextField select label="Tip" value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setCursor(null); }}
          sx={{ minWidth: 150 }} size="small">
          <MenuItem value="">Svi</MenuItem>
          <MenuItem value="INCOME">Prihod</MenuItem>
          <MenuItem value="EXPENSE">Rashod</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel active={sortBy === 'date'} direction={sortBy === 'date' ? sortDir : 'desc'}
                  onClick={() => { if (sortBy === 'date') { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); } else { setSortBy('date'); setSortDir('desc'); } }}>
                  Datum
                </TableSortLabel>
              </TableCell>
              <TableCell>Opis</TableCell>
              <TableCell>Kategorija</TableCell>
              <TableCell>Račun</TableCell>
              <TableCell>Tip</TableCell>
              <TableCell align="right">
                <TableSortLabel active={sortBy === 'amount'} direction={sortBy === 'amount' ? sortDir : 'desc'}
                  onClick={() => { if (sortBy === 'amount') { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); } else { setSortBy('amount'); setSortDir('desc'); } }}>
                  Iznos
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {edges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Nema transakcija</TableCell>
              </TableRow>
            ) : (
              [...edges].sort((a, b) => {
                let cmp = 0;
                if (sortBy === 'date') cmp = new Date(a.node.createdAt).getTime() - new Date(b.node.createdAt).getTime();
                else cmp = a.node.amount - b.node.amount;
                return sortDir === 'asc' ? cmp : -cmp;
              }).map(({ node: t }) => (
                <TableRow key={t.id}>
                  <TableCell>{fmtDate(t.createdAt)}</TableCell>
                  <TableCell>{t.description || '—'}</TableCell>
                  <TableCell>{t.category?.name ?? '—'}</TableCell>
                  <TableCell>{t.account?.type === 'DEBIT' ? 'Debitna' : 'Keš'}</TableCell>
                  <TableCell>
                    <Chip label={t.type === TransactionType.INCOME ? 'Prihod' : 'Rashod'}
                      color={t.type === TransactionType.INCOME ? 'success' : 'error'} size="small" />
                  </TableCell>
                  <TableCell align="right" sx={{
                    fontWeight: 'bold',
                    color: t.type === TransactionType.INCOME ? 'success.main' : 'error.main',
                  }}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}{fmtRSD(Math.abs(t.amount))}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pageInfo?.hasNextPage && (
        <Box display="flex" justifyContent="center" mt={2}>
          <IconButton onClick={() => setCursor(pageInfo.endCursor ?? null)}>
            <ArrowForward />
          </IconButton>
        </Box>
      )}

      {/* Create transaction dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova transakcija</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Račun" value={form.accountId}
            onChange={(e) => setForm({ ...form, accountId: e.target.value })} sx={{ mt: 2, mb: 2 }}>
            {accounts.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.type === 'DEBIT' ? 'Debitna kartica' : 'Keš'} ({fmtRSD(a.balance)})
              </MenuItem>
            ))}
          </TextField>
          <TextField select fullWidth label="Kategorija" value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })} sx={{ mb: 2 }}>
            {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField select fullWidth label="Tip" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })} sx={{ mb: 2 }}>
            <MenuItem value="INCOME">Prihod</MenuItem>
            <MenuItem value="EXPENSE">Rashod</MenuItem>
          </TextField>
          <TextField fullWidth label="Iznos (RSD)" type="number" value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth label="Opis (opciono)" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Otkaži</Button>
          <Button variant="contained" onClick={handleCreate}
            disabled={!form.accountId || !form.categoryId || !form.amount || !form.type || creating}>
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
