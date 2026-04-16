import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Box, Typography, CircularProgress, Alert, Card, CardContent,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Grid, Tabs, Tab, IconButton, Chip, Snackbar, MenuItem,
  Badge, Paper,
} from '@mui/material';
import {
  Add, Group, CheckCircle, Cancel,
  PersonAdd, AttachMoney, Archive, Delete, ExitToApp,
} from '@mui/icons-material';
import {
  GET_SHARED_BUDGETS, GET_PENDING_INVITATIONS, GET_ACCOUNTS, GET_USERS,
  CREATE_SHARED_BUDGET, INVITE_TO_SHARED_BUDGET, RESPOND_TO_INVITATION,
  CONTRIBUTE_TO_SHARED_BUDGET, COMPLETE_SHARED_BUDGET, LEAVE_SHARED_BUDGET, DELETE_SHARED_BUDGET
} from '../graphql/operations';
import { fmtRSD } from '../utils/format';
import type { SharedBudget, Account, SharedBudgetInvitation, User } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return value === index ? <Box>{children}</Box> : null;
}

export default function SharedBudgets() {
  const { user: currentUser } = useAuth();
  const { data, loading, error } = useQuery<{ sharedBudgets: SharedBudget[] }>(GET_SHARED_BUDGETS);
  const { data: invData, refetch: refetchInvitations } = useQuery<{ pendingInvitations: SharedBudgetInvitation[] }>(GET_PENDING_INVITATIONS);
  const { data: accData } = useQuery<{ accounts: Account[] }>(GET_ACCOUNTS);
  const { data: usersData } = useQuery<{ users: User[] }>(GET_USERS);

  const [createBudget, { loading: creating }] = useMutation(CREATE_SHARED_BUDGET, {
    refetchQueries: [{ query: GET_SHARED_BUDGETS }],
  });
  const [inviteUser, { loading: inviting }] = useMutation(INVITE_TO_SHARED_BUDGET, {
    refetchQueries: [{ query: GET_SHARED_BUDGETS }],
  });
  const [respondToInvite] = useMutation(RESPOND_TO_INVITATION, {
    refetchQueries: [{ query: GET_PENDING_INVITATIONS }, { query: GET_SHARED_BUDGETS }],
  });
  const [contribute, { loading: contributing }] = useMutation(CONTRIBUTE_TO_SHARED_BUDGET, {
    refetchQueries: [{ query: GET_SHARED_BUDGETS }, { query: GET_ACCOUNTS }],
  });
  const [completeBudget] = useMutation(COMPLETE_SHARED_BUDGET, {
    refetchQueries: [{ query: GET_SHARED_BUDGETS }],
  });
  const [leaveBudget] = useMutation(LEAVE_SHARED_BUDGET, {
    refetchQueries: [{ query: GET_SHARED_BUDGETS }, { query: GET_ACCOUNTS }],
  });
  const [deleteBudget] = useMutation(DELETE_SHARED_BUDGET, {
    refetchQueries: [{ query: GET_SHARED_BUDGETS }],
  });

  const [tab, setTab] = useState(0);
  const [autoSwitched, setAutoSwitched] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(false);
  
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteeId, setInviteeId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [contributeAmount, setContributeAmount] = useState('');
  const [contributeAccountId, setContributeAccountId] = useState('');
  const [contributeDescription, setContributeDescription] = useState('');
  
  const [snack, setSnack] = useState('');
  const [snackErr, setSnackErr] = useState('');

  const accounts = accData?.accounts ?? [];
  const sharedBudgets = data?.sharedBudgets ?? [];
  const invitations = invData?.pendingInvitations ?? [];
  const users = usersData?.users ?? [];

  useEffect(() => {
    if (!autoSwitched && invitations.length > 0) {
      setTab(1);
      setAutoSwitched(true);
    }
  }, [invitations, autoSwitched]);

  const handleCreate = async () => {
    try {
      await createBudget({ variables: { input: { name, description } } });
      setCreateOpen(false);
      setName('');
      setDescription('');
      setSnack('Zajednički budžet kreiran!');
    } catch (e: unknown) {
      setSnackErr(e instanceof Error ? e.message : 'Greška');
    }
  };

  const handleInvite = async () => {
    try {
      await inviteUser({ variables: { input: { sharedBudgetId: selectedBudget, inviteeId, message: inviteMessage } } });
      setInviteOpen(false);
      setInviteeId('');
      setInviteMessage('');
      setSnack('Poziv poslat!');
    } catch (e: unknown) {
      setSnackErr(e instanceof Error ? e.message : 'Greška');
    }
  };

  const handleRespondToInvite = async (invitationId: string, accept: boolean) => {
    try {
      await respondToInvite({ variables: { input: { invitationId, accept } } });
      await refetchInvitations();
      setSnack(accept ? 'Poziv prihvaćen!' : 'Poziv odbačen!');
    } catch (e: unknown) {
      setSnackErr(e instanceof Error ? e.message : 'Greška');
    }
  };

  const handleContribute = async () => {
    try {
      await contribute({ 
        variables: { 
          input: { 
            sharedBudgetId: selectedBudget, 
            accountId: contributeAccountId, 
            amount: parseFloat(contributeAmount),
            description: contributeDescription 
          } 
        } 
      });
      setContributeOpen(false);
      setContributeAmount('');
      setContributeAccountId('');
      setContributeDescription('');
      setSnack('Novac dodat!');
    } catch (e: unknown) {
      setSnackErr(e instanceof Error ? e.message : 'Greška');
    }
  };

  const handleComplete = async (budgetId: string) => {
    try {
      await completeBudget({ variables: { sharedBudgetId: budgetId } });
      setSnack('Zajednički budžet završen!');
    } catch (e: unknown) {
      setSnackErr(e instanceof Error ? e.message : 'Greška');
    }
  };

  const handleLeave = async (budgetId: string) => {
    try {
      await leaveBudget({ variables: { sharedBudgetId: budgetId } });
      setSnack('Izašli ste iz zajedničkog budžeta!');
    } catch (e: unknown) {
      setSnackErr(e instanceof Error ? e.message : 'Greška');
    }
  };

  const handleDelete = async (budgetId: string) => {
    try {
      await deleteBudget({ variables: { sharedBudgetId: budgetId } });
      setSnack('Zajednički budžet obrisan, novac vraćen svim članovima!');
    } catch (e: unknown) {
      setSnackErr(e instanceof Error ? e.message : 'Greška');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Zajednički budžeti</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
          Novi budžet
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab 
            label={<Badge badgeContent={sharedBudgets.length} color="primary">Moji budžeti</Badge>} 
            icon={<Group />} 
          />
          <Tab 
            label={<Badge badgeContent={invitations.length} color="secondary">Pozivi</Badge>} 
            icon={<PersonAdd />} 
          />
        </Tabs>
      </Paper>

      <TabPanel value={tab} index={0}>
        {sharedBudgets.length === 0 ? (
          <Typography color="text.secondary">Nema kreiranih budžeta. Kreirajte prvi!</Typography>
        ) : (
          <Grid container spacing={3}>
            {sharedBudgets.map((budget) => (
              <Grid key={budget.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6">{budget.name}</Typography>
                      <Chip 
                        label={budget.status === 'COMPLETED' ? 'Završen' : 'Aktivan'}
                        color={budget.status === 'COMPLETED' ? 'success' : 'primary'} 
                        size="small" 
                      />
                    </Box>
                    
                    {budget.description && (
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {budget.description}
                      </Typography>
                    )}

                    <Typography variant="h5" color="primary" mb={2}>
                      {fmtRSD(budget.currentAmount)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Kreator: {budget.creator.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mb={2}>
                      članova: {budget.members?.length || 0}
                    </Typography>

                    {budget.members && budget.members.length > 0 && (
                      <Box mb={2}>
                        <Typography variant="caption" color="text.secondary">Učešće:</Typography>
                        {budget.members.map((member) => (
                          <Box key={member.id} display="flex" justifyContent="space-between" mt={0.5}>
                            <Typography variant="body2">
                              {member.user.name} {member.role === 'CREATOR' && '👑'}
                            </Typography>
                            <Typography variant="body2">{fmtRSD(member.contributedAmount)}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    <Box display="flex" gap={1} flexWrap="wrap">
                      {budget.status === 'ACTIVE' && (
                        <>
                          <IconButton 
                            color="primary" 
                            onClick={() => { 
                              setSelectedBudget(budget.id); 
                              setContributeOpen(true); 
                            }}
                            title="Dodaj novac"
                          >
                            <AttachMoney />
                          </IconButton>
                          {budget.creatorId === currentUser?.id && (
                            <IconButton 
                              color="secondary" 
                              onClick={() => { 
                                setSelectedBudget(budget.id); 
                                setInviteOpen(true); 
                              }}
                              title="Pozovi korisnika"
                            >
                              <PersonAdd />
                            </IconButton>
                          )}
                        </>
                      )}
                      
                      {budget.status === 'ACTIVE' && budget.creatorId === currentUser?.id && (
                        <IconButton 
                          color="success" 
                          onClick={() => handleComplete(budget.id)}
                          title="Završi budžet"
                        >
                          <Archive />
                        </IconButton>
                      )}

                      {budget.status === 'ACTIVE' && budget.creatorId === currentUser?.id && (
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(budget.id)}
                          title="Obriši budžet (novac se vraća svim članovima)"
                        >
                          <Delete />
                        </IconButton>
                      )}

                      {budget.status === 'ACTIVE' && budget.creatorId !== currentUser?.id && (
                        <IconButton 
                          color="warning" 
                          onClick={() => handleLeave(budget.id)}
                          title="Izađi iz budžeta"
                        >
                          <ExitToApp />
                        </IconButton>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tab} index={1}>
        {invitations.length === 0 ? (
          <Typography color="text.secondary">Nemate pozive.</Typography>
        ) : (
          <Grid container spacing={2}>
            {invitations.map((invitation) => (
              <Grid key={invitation.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" mb={1}>
                      {invitation.sharedBudget?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Poziv od: {invitation.inviter.name}
                    </Typography>
                    {invitation.message && (
                      <Typography variant="body2" mb={2}>
                        "{invitation.message}"
                      </Typography>
                    )}
                    <Box display="flex" gap={1}>
                      <Button
                        variant="contained"
                        startIcon={<CheckCircle />}
                        onClick={() => handleRespondToInvite(invitation.id, true)}
                        size="small"
                      >
                        Prihvati
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={() => handleRespondToInvite(invitation.id, false)}
                        size="small"
                      >
                        Odbaci
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Create budget dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novi zajednički budžet</DialogTitle>
        <DialogContent>
          <TextField 
            fullWidth 
            label="Naziv budžeta" 
            value={name}
            onChange={(e) => setName(e.target.value)} 
            sx={{ mt: 2, mb: 2 }} 
          />
          <TextField 
            fullWidth 
            label="Opis (opciono)" 
            multiline
            rows={3}
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Otkaži</Button>
          <Button 
            variant="contained" 
            onClick={handleCreate}
            disabled={!name || creating}
          >
            {creating ? 'Kreiranje...' : 'Kreiraj'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite user dialog */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Pozovi korisnika</DialogTitle>
        <DialogContent>
          <TextField 
            select
            fullWidth 
            label="Korisnik" 
            value={inviteeId}
            onChange={(e) => setInviteeId(e.target.value)} 
            sx={{ mt: 2, mb: 2 }} 
            helperText="Izaberi korisnika koga pozivate"
          >
            {users
              .filter((user) => {
                if (user.id === currentUser?.id) return false;
                if (user.role === 'ADMIN') return false;
                const budget = sharedBudgets.find((b) => b.id === selectedBudget);
                if (!budget) return true;
                // exclude current members
                if (budget.members?.some((m) => m.user.id === user.id)) return false;
                // exclude users with pending or accepted invitation (already invited or previously member)
                if (budget.invitations?.some((inv) => inv.invitee?.id === user.id && (inv.status === 'PENDING' || inv.status === 'ACCEPTED'))) return false;
                return true;
              })
              .map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
          </TextField>
          <TextField 
            fullWidth 
            label="Poruka (opciono)" 
            multiline
            rows={2}
            value={inviteMessage} 
            onChange={(e) => setInviteMessage(e.target.value)} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)}>Otkaži</Button>
          <Button 
            variant="contained" 
            onClick={handleInvite}
            disabled={!inviteeId || inviting}
          >
            {inviting ? 'Slanje...' : 'Pozovi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contribute money dialog */}
      <Dialog open={contributeOpen} onClose={() => setContributeOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dodaj novac u budžet</DialogTitle>
        <DialogContent>
          <TextField 
            select 
            fullWidth 
            label="Sa računa" 
            value={contributeAccountId}
            onChange={(e) => setContributeAccountId(e.target.value)} 
            sx={{ mt: 2, mb: 2 }}
          >
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.type === 'DEBIT' ? 'Debitna kartica' : 'Keš'} ({fmtRSD(account.balance)})
              </MenuItem>
            ))}
          </TextField>
          <TextField 
            fullWidth 
            label="Iznos (RSD)" 
            type="number"
            value={contributeAmount} 
            onChange={(e) => setContributeAmount(e.target.value)} 
            sx={{ mb: 2 }}
          />
          <TextField 
            fullWidth 
            label="Opis (opciono)" 
            value={contributeDescription} 
            onChange={(e) => setContributeDescription(e.target.value)} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContributeOpen(false)}>Otkaži</Button>
          <Button 
            variant="contained" 
            onClick={handleContribute}
            disabled={!contributeAccountId || !contributeAmount || contributing}
          >
            {contributing ? 'Dodavanje...' : 'Dodaj'}
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