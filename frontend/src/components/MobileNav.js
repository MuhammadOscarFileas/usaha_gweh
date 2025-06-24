import React from 'react';
import { 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper,
  Badge
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MobileNav({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Pelanggan', icon: <PeopleIcon />, path: '/dashboard' },
    ...(user.role === 'admin' ? [{ label: 'Paket', icon: <InventoryIcon />, path: '/dashboard/paket' }] : []),
    { label: 'Statistik', icon: <BarChartIcon />, path: '/dashboard/statistik' },
    ...(user.role === 'superadmin' ? [
      { label: 'Kelola Admin', icon: <AdminPanelSettingsIcon />, path: '/dashboard/manage-users' },
      { label: 'Log Aktivitas', icon: <BarChartIcon />, path: '/dashboard/activity-logs' },
    ] : []),
    { label: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' },
    { label: 'Logout', icon: <LogoutIcon />, path: '/logout', isLogout: true },
  ];

  const getCurrentValue = () => {
    const idx = menuItems.findIndex(item => location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path)));
    return idx === -1 ? 0 : idx;
  };

  const handleChange = (event, newValue) => {
    const item = menuItems[newValue];
    if (!item) return;
    if (item.isLogout) {
      onLogout();
      navigate('/login');
    } else {
      navigate(item.path);
    }
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        borderTop: '1px solid #e0e0e0',
        backgroundColor: 'white'
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={handleChange}
        showLabels
        sx={{
          height: 80,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 12px 8px',
            color: '#666',
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            marginTop: '4px',
          },
          '& .Mui-selected': {
            color: 'var(--primary-color)',
          },
          '& .MuiBottomNavigationAction-root.Mui-selected': {
            color: 'var(--primary-color)',
          },
        }}
      >
        {menuItems.map((item, idx) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={item.icon}
            sx={item.isLogout ? {
              color: '#e53935',
              '&.Mui-selected': { color: '#e53935' }
            } : {}}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
} 