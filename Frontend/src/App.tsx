import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { client } from './graphql/client';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import type { ReactNode } from 'react';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Budgets from './pages/Budgets';
import SharedBudgets from './pages/SharedBudgets';
import Analytics from './pages/Analytics';
import Admin from './pages/Admin';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Layout>{children}</Layout>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/'} replace /> : <Login />} 
      />
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/accounts" 
        element={
          <PrivateRoute>
            <Accounts />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/transactions" 
        element={
          <PrivateRoute>
            <Transactions />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/goals" 
        element={
          <PrivateRoute>
            <Goals />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/budgets" 
        element={
          <PrivateRoute>
            <Budgets />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/shared-budgets" 
        element={
          <PrivateRoute>
            <SharedBudgets />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <PrivateRoute>
            <Analytics />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } 
      />
      <Route path="*" element={<Navigate to={user?.role === 'ADMIN' ? '/admin' : '/'} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
