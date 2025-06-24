import React, { createContext, useContext } from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Divider, Typography, Button, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import styled from 'styled-components';
import logo from '../logo.svg';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MobileNav from './MobileNav';

const Sidebar = styled(Box).withConfig({ shouldForwardProp: (prop) => prop !== 'collapsed' })`
  width: ${props => props.collapsed ? '64px' : '220px'};
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 3rem;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarLogo = styled('img')`
  width: 40px;
  margin-bottom: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: brightness(0) invert(1);
`;

const SidebarHeader = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const Main = styled(Box).withConfig({ shouldForwardProp: (prop) => prop !== 'collapsed' && prop !== 'isMobile' })`
  flex: 1;
  background: #f6f8fb;
  min-height: 100vh;
  margin-left: ${props => props.collapsed ? '64px' : '220px'};
  padding-bottom: ${props => props.isMobile ? '80px' : '2rem'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem;
    padding-bottom: 100px;
  }
`;

const HamburgerButton = styled(IconButton)`
  position: absolute;
  top: 1.5rem;
  right: -24px;
  background: var(--hamburger-bg);
  color: var(--hamburger-border);
  width: 48px;
  height: 48px;
  box-shadow: 0 2px 8px var(--hamburger-shadow);
  z-index: 101;
  border: 2px solid var(--hamburger-border);
  transition: all 0.3s var(--transition-smooth);
  
  &:hover {
    background: #f8f9fa;
    transform: scale(1.05);
    box-shadow: 0 4px 12px var(--hamburger-hover-shadow);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const menuItems = [
  { label: 'Pelanggan', icon: <PeopleIcon />, path: '/dashboard' },
  { label: 'Paket', icon: <InventoryIcon />, path: '/dashboard/paket', adminOnly: true },
  { label: 'Statistik', icon: <BarChartIcon />, path: '/dashboard/statistik' },
  { label: 'Kelola Alamat', icon: <HomeIcon />, path: '/dashboard/alamat', adminOrSuperadmin: true },
  { label: 'Pengaturan', icon: <SettingsIcon />, path: '/dashboard/settings' },
  { label: 'Kelola Admin & Subadmin', icon: <PeopleIcon />, path: '/dashboard/manage-users', superadminOnly: true },
  { label: 'Log Aktivitas', icon: <BarChartIcon />, path: '/dashboard/activity-logs', superadminOnly: true },
  { label: 'Logout', icon: <LogoutIcon />, path: '/logout', isLogout: true },
];

export const SidebarContext = createContext({ collapsed: false });

export default function Layout({ children, onLogout, user }) {
  const userRole = user?.role || 'subadmin';
  const navigate = useNavigate();
  const location = useLocation();
  const [openLogout, setOpenLogout] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenuClick = (item) => {
    if (item.isLogout) {
      setOpenLogout(true);
    } else {
      navigate(item.path);
    }
  };

  const handleLogoutConfirm = () => {
    setOpenLogout(false);
    onLogout();
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setOpenLogout(false);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <Box display="flex">
        <Sidebar collapsed={collapsed}>
          <SidebarHeader>
            <HamburgerButton onClick={toggleSidebar} size="large">
              <MenuIcon fontSize="large" />
            </HamburgerButton>
            
            <SidebarLogo src={logo} alt="Logo" />
            {!collapsed && (
              <>
                <Typography variant="h6" fontWeight={700} color="#fff">
                  ABIRA
                </Typography>
                <Typography variant="body1" fontWeight={500} color="#fff" sx={{ mt: 1, mb: 0.5, fontSize: 16 }}>
                  Halo, {user?.username || '-'}
                </Typography>
              </>
            )}
          </SidebarHeader>
          
          <List sx={{ width: '100%', mt: 0 }}>
            {menuItems.map(item => {
              if (item.adminOnly && userRole !== 'admin') return null;
              if (item.superadminOnly && userRole !== 'superadmin') return null;
              if (item.adminOrSuperadmin && !(userRole === 'admin' || userRole === 'superadmin')) return null;
              const active = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              const isLogoutItem = item.isLogout;
              
              return (
                <Tooltip 
                  title={collapsed ? item.label : ''} 
                  placement="right"
                  key={item.label}
                >
                  <ListItemButton
                    selected={active}
                    onClick={() => handleMenuClick(item)}
                    sx={{
                      color: '#fff',
                      background: active ? 'var(--sidebar-active)' : 'transparent',
                      '&:hover': { 
                        background: isLogoutItem ? '#ff4444' : 'var(--sidebar-hover)',
                        transform: 'translateX(4px)',
                      },
                      borderRadius: 2,
                      mx: collapsed ? 0.5 : 1,
                      my: 0.5,
                      minHeight: 48,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      border: isLogoutItem ? '1px solid #ff6666' : 'none',
                      transition: 'all 0.2s ease',
                      '&.Mui-selected': {
                        background: isLogoutItem ? '#ff4444' : 'var(--sidebar-active)',
                        '&:hover': {
                          background: isLogoutItem ? '#ff3333' : 'var(--sidebar-active)',
                        }
                      },
                      '& .MuiListItemIcon-root': {
                        transition: 'all 0.2s ease',
                      },
                      '&:hover .MuiListItemIcon-root': {
                        transform: 'scale(1.1)',
                      }
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: isLogoutItem ? '#ffcccc' : '#fff',
                        minWidth: collapsed ? 0 : 40,
                        mr: collapsed ? 0 : 2
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText 
                        primary={item.label} 
                        sx={{ 
                          color: isLogoutItem ? '#ffcccc' : '#fff',
                          '& .MuiListItemText-primary': {
                            fontWeight: isLogoutItem ? 600 : 400
                          }
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </List>
        </Sidebar>
        
        <Main collapsed={collapsed} isMobile={isMobile}>
          <Outlet />
        </Main>
        
        {/* Mobile Navigation */}
        {isMobile && <MobileNav user={user} onLogout={onLogout} />}
        
        <Dialog open={openLogout} onClose={handleLogoutCancel}>
          <DialogTitle>Konfirmasi Logout</DialogTitle>
          <DialogContent>
            <Typography>Anda yakin ingin keluar?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleLogoutCancel} color="primary">Tidak</Button>
            <Button onClick={handleLogoutConfirm} color="error" variant="contained">Ya</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SidebarContext.Provider>
  );
} 