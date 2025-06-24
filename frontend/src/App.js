import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PackagePage from './pages/PackagePage';
import SettingsPage from './pages/SettingsPage';
import StatistikPage from './pages/StatistikPage';
import Layout from './components/Layout';
import CustomerDetailPage from './pages/CustomerDetailPage';
import ManageUsersPage from './pages/ManageUsersPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import ManageAlamatPage from './pages/ManageAlamatPage';
import './App.css';

// Helper function to decode JWT
const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setUser(decodeToken(storedToken));
    }
    setLoading(false);
  }, []);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const decodedUser = decodeToken(newToken);
    setUser(decodedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Memuat...
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <Route path="/" element={<Layout onLogout={handleLogout} user={user} />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard token={token} user={user} />} />
            <Route path="dashboard/paket" element={<PackagePage token={token} user={user} />} />
            <Route path="dashboard/statistik" element={<StatistikPage token={token} user={user} />} />
            <Route path="dashboard/settings" element={<SettingsPage token={token} user={user} />} />
            <Route path="dashboard/customer/:id" element={<CustomerDetailPage token={token} user={user} />} />
            <Route path="dashboard/manage-users" element={user?.role === 'superadmin' ? <ManageUsersPage token={token} /> : <Navigate to="/dashboard" />} />
            <Route path="dashboard/activity-logs" element={user?.role === 'superadmin' ? <ActivityLogsPage token={token} /> : <Navigate to="/dashboard" />} />
            <Route path="dashboard/alamat" element={user?.role === 'admin' || user?.role === 'superadmin' ? <ManageAlamatPage token={token} user={user} /> : <Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        )}
      </Routes>
    </div>
  );
}

export default App;
