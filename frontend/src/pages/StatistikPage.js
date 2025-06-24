import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Card, CardContent, Grid, MenuItem, Select, CircularProgress, Alert, LinearProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';

export default function StatistikPage({ user, token }) {
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [packages, setPackages] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  useEffect(() => {
    setLoadingCustomers(true);
    setFetchError('');
    fetch('https://usahagweh-production.up.railway.app/abira-api/customers', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(() => {
        setCustomers([]);
        setFetchError('Gagal mengambil data pelanggan.');
      })
      .finally(() => setLoadingCustomers(false));
  }, [token]);

  useEffect(() => {
    // Fetch payments for selected month/year
    fetch(`https://usahagweh-production.up.railway.app/abira-api/payments?tahun=${year}&bulan=${month}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPayments(data))
      .catch(() => setPayments([]));
  }, [token, month, year]);

  useEffect(() => {
    // Fetch packages for price lookup
    fetch('https://usahagweh-production.up.railway.app/abira-api/packages', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPackages(data))
      .catch(() => setPackages([]));
  }, [token]);

  // Total pelanggan aktif & tidak aktif
  const pelangganAktif = (user.role === 'admin' || user.role === 'superadmin')
    ? customers.filter(c => c.status === 'active')
    : customers.filter(c => c.status === 'active' && c.handled_by === user.id);
  const pelangganInaktif = (user.role === 'admin' || user.role === 'superadmin')
    ? customers.filter(c => c.status === 'inactive')
    : customers.filter(c => c.status === 'inactive' && c.handled_by === user.id);
  const totalPelanggan = pelangganAktif.length;
  const totalPelangganInaktif = pelangganInaktif.length;

  // Grafik penambahan pelanggan baru per bulan (hanya pelanggan aktif)
  const penambahanBulan = Array(12).fill(0).map((_, i) => {
    // Bulan ke-i (0=Jan)
    const bulan = i + 1;
    const jumlah = pelangganAktif.filter(c => {
      const created = c.createdAt ? dayjs(c.createdAt) : (c.created_at ? dayjs(c.created_at) : null);
      if (!created) return false;
      const isThisYear = created.year() === year;
      const isThisMonth = created.month() + 1 === bulan;
      return isThisYear && isThisMonth;
    }).length;
    return { bulan: monthNames[i], jumlah };
  });

  // Helper: get price by customer_id
  const getPrice = (customer_id) => {
    const cust = customers.find(c => c.id === customer_id);
    if (!cust) return 0;
    const pkg = packages.find(p => p.id === cust.package_id);
    return pkg ? pkg.price : 0;
  };
  // Total uang masuk bulan ini
  const totalMasuk = payments.filter(p => p.status === 'Lunas').reduce((sum, p) => sum + getPrice(p.customer_id), 0);
  // Total uang belum masuk bulan ini (hanya status 'Belum')
  const totalBelum = payments.filter(p => p.status === 'Belum').reduce((sum, p) => sum + getPrice(p.customer_id), 0);

  // Pelanggan yang sudah bayar bulan ini
  const pelangganSudahBayar = pelangganAktif.filter(c =>
    payments.some(p => p.customer_id === c.id && p.status === 'Lunas')
  ).length;
  const pelangganBelumBayar = Math.max(totalPelanggan - pelangganSudahBayar, 0);
  const persenBayar = totalPelanggan > 0 ? Math.round((pelangganSudahBayar / totalPelanggan) * 100) : 0;

  if (loadingCustomers) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (fetchError) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Alert severity="error">{fetchError}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} color="primary" mb={2}>
        Statistik
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography>Bulan:</Typography>
        <Select value={month} onChange={e => setMonth(Number(e.target.value))}>
          {monthNames.map((m, i) => (
            <MenuItem key={i} value={i + 1}>{m}</MenuItem>
          ))}
        </Select>
        <Typography>Tahun:</Typography>
        <Select value={year} onChange={e => setYear(Number(e.target.value))}>
          {[...Array(5)].map((_, i) => (
            <MenuItem key={i} value={year - 2 + i}>{year - 2 + i}</MenuItem>
          ))}
        </Select>
      </Box>
      {/* Baris 1: Total pelanggan aktif & tidak aktif, sudah bayar */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Pelanggan Aktif</Typography>
              <Typography variant="h4" color="success.main">{totalPelanggan}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Pelanggan Tidak Aktif</Typography>
              <Typography variant="h4" color="error.main">{totalPelangganInaktif}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Sudah Bayar Bulan Ini</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" color="success.main">{pelangganSudahBayar}</Typography>
                <Typography variant="h6" color="text.secondary">/</Typography>
                <Typography variant="h4" color="error.main">{pelangganBelumBayar}</Typography>
              </Box>
              <Box sx={{ mt: 1 }}>
                <LinearProgress variant="determinate" value={persenBayar} sx={{ height: 10, borderRadius: 5, background: '#eee', '& .MuiLinearProgress-bar': { background: '#4caf50' } }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{persenBayar}% pelanggan sudah bayar</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Baris 2: Grafik penambahan pelanggan per bulan */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Penambahan Pelanggan Baru (per Bulan)</Typography>
              <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={penambahanBulan} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bulan" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="jumlah" fill="#1976d2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Baris 3: Total uang masuk dan belum masuk */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Uang Masuk / Belum Masuk</Typography>
              <Typography variant="h6" color="success.main">Rp{totalMasuk.toLocaleString()}</Typography>
              <Typography variant="h6" color="error.main">Rp{totalBelum.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 