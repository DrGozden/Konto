import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import {
  AppBar, Box, CssBaseline, Drawer, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography,
  Avatar, Menu, MenuItem, Divider, Badge,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard as DashboardIcon,
  AccountBalance as AccountsIcon, Receipt as TxIcon,
  Flag as GoalsIcon, Savings as BudgetsIcon, Group as SharedBudgetsIcon,
  BarChart as AnalyticsIcon, AdminPanelSettings as AdminIcon, Logout,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { GET_PENDING_INVITATIONS } from '../graphql/operations';
import { Role } from '../types';
import type { SharedBudgetInvitation } from '../types';
import type { ReactNode } from 'react';

const W = 240;

export default function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const nav = useNavigate();
  const loc = useLocation();
  const { user, logout } = useAuth();
  const { data: invData } = useQuery<{ pendingInvitations: SharedBudgetInvitation[] }>(
    GET_PENDING_INVITATIONS,
    { skip: !user || user.role === 'ADMIN', pollInterval: 30000 },
  );
  const pendingCount = invData?.pendingInvitations?.length ?? 0;

  const items = user?.role === Role.ADMIN
    ? [{ label: 'Admin', icon: <AdminIcon />, to: '/admin' }]
    : [
        { label: 'Dashboard', icon: <DashboardIcon />, to: '/' },
        { label: 'Računi', icon: <AccountsIcon />, to: '/accounts' },
        { label: 'Transakcije', icon: <TxIcon />, to: '/transactions' },
        { label: 'Ciljevi', icon: <GoalsIcon />, to: '/goals' },
        { label: 'Budžeti', icon: <BudgetsIcon />, to: '/budgets' },
        { label: 'Zajednički', icon: <Badge badgeContent={pendingCount} color="error"><SharedBudgetsIcon /></Badge>, to: '/shared-budgets' },
        { label: 'Analitika', icon: <AnalyticsIcon />, to: '/analytics' },
      ];

  const drawer = (
    <>
      <Toolbar>
        <Typography variant="h6" fontWeight="bold">Konto</Typography>
      </Toolbar>
      <Divider />
      <List>
        {items.map((i) => (
          <ListItem key={i.to} disablePadding>
            <ListItemButton
              selected={loc.pathname === i.to}
              onClick={() => { nav(i.to); setMobileOpen(false); }}
            >
              <ListItemIcon>{i.icon}</ListItemIcon>
              <ListItemText primary={i.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${W}px)` }, ml: { sm: `${W}px` } }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>Lične Finansije</Typography>
          <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>{user?.name}</Typography>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32 }}>{user?.name?.[0]}</Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: W }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: W } }}
        >{drawer}</Drawer>
        <Drawer variant="permanent" open
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: W } }}
        >{drawer}</Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${W}px)` } }}>
        <Toolbar />
        {children}
      </Box>

      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { setAnchorEl(null); logout(); }}>
          <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
          Odjavi se
        </MenuItem>
      </Menu>
    </Box>
  );
}
