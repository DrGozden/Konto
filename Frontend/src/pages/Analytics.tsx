import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  Box, Typography, CircularProgress, Card, CardContent, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  LinearProgress, Chip,
} from '@mui/material';
import { Group } from '@mui/icons-material';
import { GET_TRANSACTIONS, GET_CATEGORIES, GET_SHARED_BUDGETS } from '../graphql/operations';
import { fmtRSD } from '../utils/format';
import { TransactionType } from '../types';
import type { TransactionConnection, Category, SharedBudget } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function Analytics() {
  const { user: currentUser } = useAuth();
  const { data: txData, loading: l1 } = useQuery<{ transactions: TransactionConnection }>(
    GET_TRANSACTIONS, { variables: { first: 500 } },
  );
  const { data: catData, loading: l2 } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);
  const { data: sbData, loading: l3 } = useQuery<{ sharedBudgets: SharedBudget[] }>(GET_SHARED_BUDGETS);

  const edges = txData?.transactions.edges ?? [];
  const categories = catData?.categories ?? [];
  const sharedBudgets = sbData?.sharedBudgets ?? [];

  const { byCategory, totalIncome, totalExpense, monthly } = useMemo(() => {
    const txs = edges.map((e) => e.node);

    let inc = 0;
    let exp = 0;
    const catMap = new Map<string, { name: string; income: number; expense: number }>();
    const monthMap = new Map<string, { income: number; expense: number }>();

    for (const t of txs) {
      const catName = t.category?.name ?? 'Bez kategorije';
      const catId = t.category?.id ?? 'none';

      if (!catMap.has(catId)) catMap.set(catId, { name: catName, income: 0, expense: 0 });
      const entry = catMap.get(catId)!;

      if (t.type === TransactionType.INCOME) {
        inc += t.amount;
        entry.income += t.amount;
      } else {
        exp += Math.abs(t.amount);
        entry.expense += Math.abs(t.amount);
      }

      const month = t.createdAt.substring(0, 7);
      if (!monthMap.has(month)) monthMap.set(month, { income: 0, expense: 0 });
      const me = monthMap.get(month)!;
      if (t.type === TransactionType.INCOME) me.income += t.amount;
      else me.expense += Math.abs(t.amount);
    }

    const byCat = Array.from(catMap.entries())
      .map(([id, v]) => ({ id, ...v, total: v.income + v.expense }))
      .sort((a, b) => b.total - a.total);

    const mon = Array.from(monthMap.entries())
      .map(([m, v]) => ({ month: m, ...v }))
      .sort((a, b) => b.month.localeCompare(a.month));

    return { byCategory: byCat, totalIncome: inc, totalExpense: exp, monthly: mon };
  }, [edges]);

  // Shared budget analytics
  const { totalContributed, sharedBudgetRows } = useMemo(() => {
    let total = 0;
    const rows = sharedBudgets.map((b) => {
      const myMember = b.members?.find((m) => m.user.id === currentUser?.id);
      const myContrib = myMember?.contributedAmount ?? 0;
      total += myContrib;
      return {
        id: b.id,
        name: b.name,
        status: b.status,
        isCreator: b.creatorId === currentUser?.id,
        myContrib,
        totalAmount: b.currentAmount,
        memberCount: b.members?.length ?? 0,
      };
    });
    return { totalContributed: total, sharedBudgetRows: rows };
  }, [sharedBudgets, currentUser]);

  if (l1 || l2 || l3) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  const maxCatTotal = Math.max(...byCategory.map((c) => c.total), 1);

  // Suppress unused warning -- categories used implicitly through query cache
  void categories;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Analitika</Typography>

      {/* Summary cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Ukupni prihodi</Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">{fmtRSD(totalIncome)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Ukupni rashodi</Typography>
              <Typography variant="h5" color="error.main" fontWeight="bold">{fmtRSD(totalExpense)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Bilans (lični)</Typography>
              <Typography variant="h5" fontWeight="bold"
                color={totalIncome - totalExpense >= 0 ? 'success.main' : 'error.main'}>
                {fmtRSD(totalIncome - totalExpense)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Card sx={{ borderLeft: 4, borderColor: 'secondary.main' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Group fontSize="small" color="secondary" />
                <Typography color="text.secondary" variant="body2">Uloženo u zajedničke</Typography>
              </Box>
              <Typography variant="h5" color="secondary.main" fontWeight="bold">{fmtRSD(totalContributed)}</Typography>
              <Typography variant="caption" color="text.secondary">{sharedBudgetRows.length} budžeta</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* By category */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Po kategorijama</Typography>
              {byCategory.length === 0 ? (
                <Typography color="text.secondary">Nema podataka</Typography>
              ) : (
                byCategory.map((c) => (
                  <Box key={c.id} mb={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">{c.name}</Typography>
                      <Typography variant="body2" fontWeight="bold">{fmtRSD(c.total)}</Typography>
                    </Box>
                    <LinearProgress variant="determinate"
                      value={(c.total / maxCatTotal) * 100}
                      sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Mesečni pregled</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Mesec</TableCell>
                      <TableCell align="right">Prihod</TableCell>
                      <TableCell align="right">Rashod</TableCell>
                      <TableCell align="right">Bilans</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {monthly.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">Nema podataka</TableCell>
                      </TableRow>
                    ) : (
                      monthly.map((m) => (
                        <TableRow key={m.month}>
                          <TableCell>{m.month}</TableCell>
                          <TableCell align="right" sx={{ color: 'success.main' }}>+{fmtRSD(m.income)}</TableCell>
                          <TableCell align="right" sx={{ color: 'error.main' }}>-{fmtRSD(m.expense)}</TableCell>
                          <TableCell align="right" sx={{
                            fontWeight: 'bold',
                            color: m.income - m.expense >= 0 ? 'success.main' : 'error.main',
                          }}>
                            {fmtRSD(m.income - m.expense)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Shared budgets section */}
      {sharedBudgetRows.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Group /> Zajednički budžeti
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Naziv</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Uloga</TableCell>
                  <TableCell align="right">Moj doprinos</TableCell>
                  <TableCell align="right">Ukupno u budžetu</TableCell>
                  <TableCell align="right">Članova</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sharedBudgetRows.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={b.status === 'ACTIVE' ? 'Aktivan' : 'Završen'}
                        color={b.status === 'ACTIVE' ? 'primary' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={b.isCreator ? 'Kreator' : 'Član'}
                        color={b.isCreator ? 'secondary' : 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                      {fmtRSD(b.myContrib)}
                    </TableCell>
                    <TableCell align="right">{fmtRSD(b.totalAmount)}</TableCell>
                    <TableCell align="right">{b.memberCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}
