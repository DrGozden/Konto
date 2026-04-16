import { useQuery } from '@apollo/client/react';
import {
  Box, Card, CardContent, Typography, Grid, CircularProgress,
  List, ListItem, ListItemText, Chip, LinearProgress,
} from '@mui/material';
import {
  AccountBalance, TrendingUp, TrendingDown, Flag, Group,
} from '@mui/icons-material';
import { GET_ACCOUNTS, GET_TRANSACTIONS, GET_GOALS, GET_SHARED_BUDGETS } from '../graphql/operations';
import { fmtRSD } from '../utils/format';
import { TransactionType } from '../types';
import type { Account, TransactionConnection, Goal, SharedBudget } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: accData, loading: l1 } = useQuery<{ accounts: Account[] }>(GET_ACCOUNTS);
  const { data: txData, loading: l2 } = useQuery<{ transactions: TransactionConnection }>(
    GET_TRANSACTIONS, { variables: { first: 5 } },
  );
  const { data: goalData, loading: l3 } = useQuery<{ goals: Goal[] }>(GET_GOALS);
  const { data: sharedBudgetData, loading: l4 } = useQuery<{ sharedBudgets: SharedBudget[] }>(GET_SHARED_BUDGETS);

  if (l1 || l2 || l3 || l4) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  const accounts = accData?.accounts ?? [];
  const edges = txData?.transactions.edges ?? [];
  const goals = goalData?.goals ?? [];
  const sharedBudgets = sharedBudgetData?.sharedBudgets ?? [];

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const debit = accounts.find((a) => a.type === 'DEBIT');
  const cash = accounts.find((a) => a.type === 'CASH');

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dobrodošli, {user?.name}!</Typography>

      {/* Balance cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <AccountBalance color="primary" />
                <Typography color="text.secondary" variant="body2">Ukupno stanje</Typography>
              </Box>
              <Typography variant="h5" mt={1}>{fmtRSD(totalBalance)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <TrendingUp color="info" />
                <Typography color="text.secondary" variant="body2">Debitna kartica</Typography>
              </Box>
              <Typography variant="h5" mt={1}>{fmtRSD(debit?.balance ?? 0)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <TrendingDown color="success" />
                <Typography color="text.secondary" variant="body2">Keš</Typography>
              </Box>
              <Typography variant="h5" mt={1}>{fmtRSD(cash?.balance ?? 0)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent transactions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Poslednje transakcije</Typography>
              {edges.length === 0 ? (
                <Typography color="text.secondary">Nema transakcija</Typography>
              ) : (
                <List disablePadding>
                  {edges.map(({ node: t }) => (
                    <ListItem key={t.id} divider sx={{ px: 0 }}>
                      <ListItemText
                        primary={t.description || t.category?.name || 'Transakcija'}
                        secondary={`${t.account?.type ?? ''} · ${t.category?.name ?? ''}`}
                      />
                      <Typography
                        fontWeight="bold"
                        color={t.type === TransactionType.INCOME ? 'success.main' : 'error.main'}
                      >
                        {t.type === TransactionType.INCOME ? '+' : '-'}{fmtRSD(Math.abs(t.amount))}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Goals */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Flag sx={{ verticalAlign: 'middle', mr: 1 }} />
                Finansijski ciljevi
              </Typography>
              {goals.length === 0 ? (
                <Typography color="text.secondary">Nema postavljenih ciljeva</Typography>
              ) : (
                goals.slice(0, 4).map((g) => {
                  const pct = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0;
                  return (
                    <Box key={g.id} mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1">{g.name}</Typography>
                        <Chip label={g.isCompleted ? 'Završen' : `${Math.round(pct)}%`}
                          color={g.isCompleted ? 'success' : 'default'} size="small" />
                      </Box>
                      <LinearProgress variant="determinate" value={pct}
                        sx={{ height: 8, borderRadius: 4, mt: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        {fmtRSD(g.currentAmount)} / {fmtRSD(g.targetAmount)}
                      </Typography>
                    </Box>
                  );
                })
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Shared Budgets */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Group sx={{ verticalAlign: 'middle', mr: 1 }} />
                Zajednički budžeti
              </Typography>
              {sharedBudgets.length === 0 ? (
                <Typography color="text.secondary">Nema aktivnih zajedničkih budžeta</Typography>
              ) : (
                sharedBudgets.slice(0, 3).map((budget) => (
                  <Box key={budget.id} mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1">{budget.name}</Typography>
                      <Chip 
                        label={budget.status === 'COMPLETED' ? 'Završen' : 'Aktivan'}
                        color={budget.status === 'COMPLETED' ? 'success' : 'primary'} 
                        size="small" 
                      />
                    </Box>
                    <Typography variant="h6" color="primary" sx={{ mt: 0.5 }}>
                      {fmtRSD(budget.currentAmount)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {budget.members?.length || 0} član(ova) • Kreator: {budget.creator.name}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
