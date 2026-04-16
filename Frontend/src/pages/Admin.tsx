import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Box, Typography, CircularProgress, Alert, Card, CardContent, Grid,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Snackbar, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip,
} from '@mui/material';
import { PersonAdd, Category, AttachMoney } from '@mui/icons-material';
import {
  GET_CATEGORIES, CREATE_USER, CREATE_CATEGORY, ADD_MONEY_TO_USER,
  GET_USERS,
} from '../graphql/operations';
import type { Category as CategoryType, User } from '../types';

export default function Admin() {
  const { data: catData, loading: categoriesLoading } = useQuery<{ categories: CategoryType[] }>(GET_CATEGORIES);
  const { data: usersData, loading: usersLoading } = useQuery<{ users: User[] }>(GET_USERS);
  const [createUser, { loading: cu }] = useMutation(CREATE_USER);
  const [createCategory, { loading: cc }] = useMutation(CREATE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }],
  });
  const [addMoney, { loading: am }] = useMutation(ADD_MONEY_TO_USER);

  const [userOpen, setUserOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [moneyOpen, setMoneyOpen] = useState(false);

  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [catForm, setCatForm] = useState({ name: '' });
  const [moneyForm, setMoneyForm] = useState({ userId: '', amount: '' });

  const [snack, setSnack] = useState('');
  const [snackErr, setSnackErr] = useState('');

  const categories = catData?.categories ?? [];
  const users = usersData?.users ?? [];

  const handleCreateUser = async () => {
    try {
      await createUser({
        variables: {
          input: { name: userForm.name, email: userForm.email, password: userForm.password, role: userForm.role },
        },
      });
      setUserOpen(false);
      setUserForm({ name: '', email: '', password: '', role: 'USER' });
      setSnack('Korisnik kreiran!');
    } catch (e: unknown) {
      setSnackErr(e instanceof Error ? e.message : 'Greška');
    }
  };

  const handleCreateCategory = async () => {
    try {
      await createCategory({ variables: { input: { name: catForm.name } } });
      setCatOpen(false);
      setCatForm({ name: '' });
      setSnack('Kategorija kreirana!');
    } catch (e: unknown) {
      setSnackErr(e instanceof Error ? e.message : 'Greška');
    }
  };

  const handleAddMoney = async () => {
    try {
      await addMoney({
        variables: { input: { userId: moneyForm.userId, amount: parseFloat(moneyForm.amount) } },
      });
      setMoneyOpen(false);
      setMoneyForm({ userId: '', amount: '' });
      setSnack('Novac dodat!');
    } catch (e: unknown) {
      setSnackErr(e instanceof Error ? e.message : 'Greška');
    }
  };

  if (categoriesLoading || usersLoading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Administracija</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => setUserOpen(true)}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PersonAdd sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Kreiraj korisnika</Typography>
              <Typography variant="body2" color="text.secondary">Dodaj novog korisnika u sistem</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => setCatOpen(true)}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Category sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6">Nova kategorija</Typography>
              <Typography variant="body2" color="text.secondary">Kreiraj kategoriju transakcija</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => setMoneyOpen(true)}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">Dodaj novac</Typography>
              <Typography variant="body2" color="text.secondary">Dodaj novac korisniku</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Categories table */}
      <Typography variant="h6" gutterBottom>Kategorije</Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Naziv</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell><Chip label={c.id} size="small" variant="outlined" /></TableCell>
                <TableCell>{c.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create user dialog */}
      <Dialog open={userOpen} onClose={() => setUserOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Kreiraj korisnika</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Ime" value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} sx={{ mt: 2, mb: 2 }} />
          <TextField fullWidth label="Email" type="email" value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth label="Lozinka" type="password" value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} sx={{ mb: 2 }} />
          <TextField select fullWidth label="Uloga" value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
            <MenuItem value="USER">Korisnik</MenuItem>
            <MenuItem value="ADMIN">Administrator</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserOpen(false)}>Otkaži</Button>
          <Button variant="contained" onClick={handleCreateUser}
            disabled={!userForm.name || !userForm.email || !userForm.password || cu}>
            {cu ? 'Kreiranje...' : 'Kreiraj'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create category dialog */}
      <Dialog open={catOpen} onClose={() => setCatOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova kategorija</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Naziv kategorije" value={catForm.name}
            onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCatOpen(false)}>Otkaži</Button>
          <Button variant="contained" onClick={handleCreateCategory}
            disabled={!catForm.name || cc}>
            {cc ? 'Kreiranje...' : 'Kreiraj'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add money dialog */}
      <Dialog open={moneyOpen} onClose={() => setMoneyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dodaj novac korisniku</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Korisnik" value={moneyForm.userId}
            onChange={(e) => setMoneyForm({ ...moneyForm, userId: e.target.value })} sx={{ mt: 2, mb: 2 }}>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>{user.name} ({user.email})</MenuItem>
            ))}
          </TextField>
          <TextField fullWidth label="Iznos (RSD)" type="number" value={moneyForm.amount}
            onChange={(e) => setMoneyForm({ ...moneyForm, amount: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoneyOpen(false)}>Otkaži</Button>
          <Button variant="contained" onClick={handleAddMoney}
            disabled={!moneyForm.userId || !moneyForm.amount || am}>
            {am ? 'Dodavanje...' : 'Dodaj'}
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
