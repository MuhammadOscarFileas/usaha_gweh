import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import logo from '../logo.svg';
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Grid, Select, IconButton, Menu, InputAdornment, Tooltip, useMediaQuery, useTheme, CircularProgress, Alert
} from '@mui/material';
import dayjs from 'dayjs';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import './DashboardTableFix.css';
import { useNavigate } from 'react-router-dom';
import { SidebarContext } from '../components/Layout';

const DashboardWrapper = styled(Box)`
  padding: 2rem;
`;

const LogoSmall = styled('img')`
  width: 32px;
  margin-bottom: 8px;
`;

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const currentYear = new Date().getFullYear();

export default function Dashboard({ user, token }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    nik: '',
    address: '',
    phone: '',
    start_date: '',
    end_date: '',
    google_maps_link: '',
    package_id: '',
    handled_by: '',
    alamat_id: '',
  });
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customers, setCustomers] = useState([]);
  const [subadmins, setSubadmins] = useState([]);
  const [year, setYear] = useState(currentYear);
  const [payments, setPayments] = useState([]);
  const tableContainerRef = useRef(null);
  const [editId, setEditId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [filterBarHeight, setFilterBarHeight] = useState(0);
  const filterBarRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const { collapsed } = React.useContext(SidebarContext);
  const sidebarWidth = isMobile ? 0 : (collapsed ? 64 : 220);

  const navigate = useNavigate();

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) {
      return;
    }

    const handleWheel = (e) => {
      // Check if the user is primarily scrolling vertically (e.g., mouse wheel)
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // And if the container is horizontally scrollable
        if (container.scrollWidth > container.clientWidth) {
          // Prevent the default vertical scroll
          e.preventDefault();
          // Apply the scroll amount to the horizontal scroll
          container.scrollLeft += e.deltaY;
        }
      }
      // For horizontal trackpad swipes (deltaX), we let the browser handle it naturally.
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, []); // The empty dependency array ensures this effect runs only once

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch('https://usahagweh-production.up.railway.app/abira-api/packages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPackages(data);
    } catch (err) {
      setPackages([]);
    }
  }, [token]);

  useEffect(() => {
    if (open) fetchPackages();
  }, [open, fetchPackages]);

  // Fetch customers saat komponen mount atau setelah tambah pelanggan
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      setFetchError('');
      try {
        const res = await fetch('https://usahagweh-production.up.railway.app/abira-api/customers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        setCustomers([]);
        setFetchError('Gagal mengambil data pelanggan. Silakan coba lagi.');
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, [open]);

  const fetchSubadmins = useCallback(() => {
    if ((['admin', 'superadmin', 'subadmin'].includes(user.role))) {
      fetch('https://usahagweh-production.up.railway.app/abira-api/users?role=subadmin', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setSubadmins(data))
        .catch(() => setSubadmins([]));
    }
  }, [user.role, token]);

  useEffect(() => {
    if (open) {
      fetchPackages();
      fetchSubadmins();
    }
  }, [open, fetchSubadmins]);

  // Fetch payments for selected year
  useEffect(() => {
    fetch(`https://usahagweh-production.up.railway.app/abira-api/payments?tahun=${year}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPayments(data))
      .catch(() => setPayments([]));
  }, [year, token, open]);

  useEffect(() => {
    if (filterBarRef.current) {
      setFilterBarHeight(filterBarRef.current.offsetHeight);
    }
  }, [isMobile]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({
      name: '', nik: '', address: '', phone: '', start_date: '', end_date: '', google_maps_link: '', package_id: '', handled_by: '', alamat_id: '',
    });
    setError('');
    setSuccess('');
    setEditId(null);
  };
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleOpenMenu = (event, customer) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };
  const handleEditCustomer = () => {
    if (selectedCustomer) {
      fetchSubadmins();
      setForm({
        name: selectedCustomer.name || '',
        nik: selectedCustomer.nik || '',
        address: selectedCustomer.address || '',
        phone: selectedCustomer.phone || '',
        start_date: selectedCustomer.start_date ? selectedCustomer.start_date.slice(0, 10) : '',
        end_date: selectedCustomer.end_date ? selectedCustomer.end_date.slice(0, 10) : '',
        google_maps_link: selectedCustomer.google_maps_link || '',
        package_id: selectedCustomer.package_id ? String(selectedCustomer.package_id) : '',
        handled_by: selectedCustomer.handled_by || '',
        alamat_id: selectedCustomer.alamat_id || '',
      });
      setEditId(selectedCustomer.id);
      setOpen(true);
    }
    handleCloseMenu();
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let res, data;
      if (editId) {
        res = await fetch(`https://usahagweh-production.up.railway.app/abira-api/customers/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...form,
            handled_by: form.handled_by || null,
            package_id: Number(form.package_id),
            google_maps_link: form.google_maps_link || null,
            alamat_id: form.alamat_id,
          })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Gagal edit pelanggan');
        setSuccess('Pelanggan berhasil diupdate');
      } else {
        res = await fetch('https://usahagweh-production.up.railway.app/abira-api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...form,
            handled_by: form.handled_by || null,
            package_id: Number(form.package_id),
            google_maps_link: form.google_maps_link || null,
            alamat_id: form.alamat_id,
          })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Gagal tambah pelanggan');
        setSuccess('Pelanggan berhasil ditambahkan');
      }
      setTimeout(() => handleClose(), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setEditId(null);
    }
  };

  // Helper: get payment status for customer, month, year
  const getPaymentStatus = (customer_id, bulan) => {
    const p = payments.find(
      x => x.customer_id === customer_id && x.bulan === bulan && x.tahun === year
    );
    return p ? p.status : 'Belum';
  };

  // Helper: get payment id (if exists)
  const getPaymentId = (customer_id, bulan) => {
    const p = payments.find(
      x => x.customer_id === customer_id && x.bulan === bulan && x.tahun === year
    );
    return p ? p.id : null;
  };

  // Update payment status
  const handlePaymentChange = async (customer_id, bulan, status) => {
    const tanggal_bayar = status === 'Lunas' ? dayjs().format('YYYY-MM-DD') : null;
    await fetch('https://usahagweh-production.up.railway.app/abira-api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        customer_id,
        bulan,
        tahun: year,
        status,
        tanggal_bayar
      })
    });
    // Refresh payments
    fetch(`https://usahagweh-production.up.railway.app/abira-api/payments?tahun=${year}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPayments(data))
      .catch(() => setPayments([]));
  };

  // Filter customers by search (trimmed)
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <DashboardWrapper sx={{ pt: `${filterBarHeight}px` }}>
      <LogoSmall src={logo} alt="Logo" />
      <Typography variant="h5" fontWeight={700} color="primary" mb={2}>
        Dashboard
      </Typography>
      {/* Floating/Sticky Filter Bar benar-benar fixed di atas, tidak menutupi sidebar */}
      <Box
        ref={filterBarRef}
        className="dashboard-floating-filter"
        sx={{
          position: 'fixed',
          top: 0,
          left: { xs: 0, md: `${sidebarWidth}px` },
          width: { xs: '100vw', md: `calc(100vw - ${sidebarWidth}px)` },
          zIndex: 120,
          background: '#fff',
          pt: 2,
          pb: 2,
          mb: 2,
          borderBottom: '1px solid #eee',
          boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
          transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row', maxWidth: 1400, mx: 'auto', px: 2 }}>
          {(user.role === 'admin' || user.role === 'superadmin' || user.role === 'subadmin') ? (
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mb: isMobile ? 1 : 0, width: isMobile ? '100%' : 'auto', height: isMobile ? 48 : 40 }} 
              onClick={handleOpen}
            >
              + Tambah Pelanggan
            </Button>
          ) : null}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: isMobile ? '100%' : 'auto' }}>
            <Typography variant="h6" sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}>
              Tahun:
            </Typography>
            <Select 
              value={year} 
              onChange={e => setYear(Number(e.target.value))}
              size="small"
              sx={{ minWidth: isMobile ? '100%' : 120 }}
            >
              {[...Array(5)].map((_, i) => (
                <MenuItem key={i} value={currentYear - 2 + i}>{currentYear - 2 + i}</MenuItem>
              ))}
            </Select>
          </Box>
          <TextField
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama pelanggan..."
            size="small"
            sx={{ minWidth: isMobile ? '100%' : 200, maxWidth: isMobile ? '100%' : 300, flex: isMobile ? 'none' : 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>
      </Box>
      <Paper sx={{ p: isMobile ? 0 : 2, mt: 2, maxWidth: '100%', pb: 0, mb: 0, boxShadow: 'none' }}
        style={{ height: 'auto', overflow: 'visible' }}>
        <Box sx={{ px: isMobile ? 2 : 0, pb: 0, mb: 0 }}
          style={{ height: 'auto', overflow: 'visible' }}>
          {loadingCustomers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : fetchError ? (
            <Alert severity="error" sx={{ my: 4 }}>{fetchError}</Alert>
          ) : filteredCustomers.length === 0 ? (
            <Typography color="text.secondary" className="empty-state">
              Tidak ada pelanggan ditemukan.
            </Typography>
          ) : (
            <Box
              ref={tableContainerRef}
              className="dashboard-table-container"
              sx={{
                overflowX: 'auto',
                overflowY: 'auto',
                width: 'calc(100% - 32px)',
                maxWidth: 'calc(100vw - 64px)',
                marginRight: '16px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                height: 'auto',
                background: '#fff',
              }}
              style={{ height: 'auto', overflow: 'visible', background: '#fff' }}
            >
              <table 
                className="dashboard-table"
                style={{
                  minWidth: '1400px',
                  width: 'max-content',
                  borderCollapse: 'collapse',
                  background: 'white',
                }}
              >
                <thead>
                  <tr>
                    <th className="sticky-name" style={{ minWidth: 260, maxWidth: 260 }}>Nama</th>
                    <th className="sticky-address" style={{ minWidth: 160, maxWidth: 160 }}>Alamat</th>
                    <th className="sticky-package">Paket</th>
                    {monthNames.map((m, idx) => (
                      <th key={m} style={{ minWidth: 100, width: 100 }}>{m}</th>
                    ))}
                    <th style={{ minWidth: 200, background: '#fafafa' }}>...</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c, idx) => {
                    const start = c.start_date ? dayjs(c.start_date) : null;
                    const isInactive = c.status === 'inactive';
                    return (
                      <tr
                        key={c.id}
                        onClick={user.role === 'subadmin' ? undefined : () => navigate(`/dashboard/customer/${c.id}`)}
                        style={{
                          cursor: user.role === 'subadmin' ? 'not-allowed' : 'pointer',
                          background: isInactive ? '#f5f5f5' : undefined,
                          textDecoration: isInactive ? 'line-through' : undefined,
                          color: isInactive ? '#888' : undefined
                        }}
                      >
                        <td className="sticky-name">
                          <div className="customer-name-cell">
                            <span className="customer-name" title={c.name} style={{ textDecoration: isInactive ? 'line-through' : undefined, color: isInactive ? '#888' : undefined }}>{c.name}</span>
                            <div className="customer-actions">
                              {c.google_maps_link && (
                                <Tooltip title="Buka di Google Maps">
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(c.google_maps_link, '_blank');
                                    }}
                                    sx={{ color: '#1976d2', flexShrink: 0 }}
                                  >
                                    <LocationOnIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="sticky-address" style={{ textDecoration: isInactive ? 'line-through' : undefined, color: isInactive ? '#888' : undefined }}>{c.address}</td>
                        <td className="sticky-package" style={{ textDecoration: isInactive ? 'line-through' : undefined, color: isInactive ? '#888' : undefined }}>{c.package_name || '-'}</td>
                        {monthNames.map((m, idx) => {
                          const bulan = idx + 1;
                          const cellDate = dayjs(`${year}-${String(bulan).padStart(2, '0')}-01`);
                          const disabled = !start || cellDate.isBefore(start, 'month') || isInactive;
                          const status = getPaymentStatus(c.id, bulan);
                          let colorClass = 'payment-belum';
                          if (status === 'Lunas') colorClass = 'payment-lunas';
                          if (status === 'Block') colorClass = 'payment-block';
                          if (disabled) colorClass = 'payment-disabled';
                          
                          return (
                            <td key={`${c.id}-${bulan}`} className="payment-cell">
                              <Select
                                value={status}
                                onChange={e => handlePaymentChange(c.id, bulan, e.target.value)}
                                size="small"
                                disabled={disabled}
                                className={`payment-select ${colorClass}`}
                                onClick={e => e.stopPropagation()}
                              >
                                <MenuItem value="Lunas">LUNAS</MenuItem>
                                <MenuItem value="Block">BLOKIR</MenuItem>
                                <MenuItem value="Belum">BELUM</MenuItem>
                              </Select>
                            </td>
                          );
                        })}
                        <td style={{ background: '#fafafa' }}></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          )}
        </Box>
      </Paper>
      <Dialog 
        open={open} 
        onClose={() => {}} 
        disableEscapeKeyDown
        maxWidth={isMobile ? "xs" : "md"}
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>{editId ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={isMobile ? 2 : 3}>
              <Grid item xs={12}>
                <TextField 
                  label="Nama Lengkap" 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  fullWidth 
                  margin="normal" 
                  required 
                  placeholder="Masukkan nama lengkap pelanggan"
                  inputProps={{ maxLength: 100 }}
                  helperText={`${form.name.length}/100 karakter`}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="NIK"
                  name="nik"
                  value={form.nik}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  required
                  placeholder="Masukkan NIK pelanggan"
                  inputProps={{ maxLength: 32 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="No HP" 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  fullWidth 
                  margin="normal" 
                  placeholder="081234567890"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Alamat"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  required
                  placeholder="Masukkan alamat pelanggan"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Tanggal Mulai" 
                  name="start_date" 
                  type="date" 
                  value={form.start_date} 
                  onChange={handleChange} 
                  fullWidth 
                  margin="normal" 
                  InputLabelProps={{ shrink: true }} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Tanggal Berakhir" 
                  name="end_date" 
                  type="date" 
                  value={form.end_date} 
                  onChange={handleChange} 
                  fullWidth 
                  margin="normal" 
                  InputLabelProps={{ shrink: true }} 
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Google Maps Link"
                  name="google_maps_link"
                  value={form.google_maps_link}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  placeholder="Contoh: https://maps.google.com/maps?q=-7.668330542195574,110.60514511137022"
                  helperText="Copy link dari Google Maps dan paste di sini"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Paket"
                  name="package_id"
                  value={form.package_id}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  required
                >
                  {packages.map(pkg => (
                    <MenuItem key={pkg.id} value={pkg.id}>{pkg.name} (Rp{pkg.price})</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Handled By (Subadmin)"
                  name="handled_by"
                  value={form.handled_by || ''}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="">- Tidak Ditentukan -</MenuItem>
                  {(subadmins && subadmins.length > 0) ? subadmins.map(sa => (
                    <MenuItem key={sa.id} value={sa.id}>{sa.username}</MenuItem>
                  )) : null}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Alamat Id"
                  name="alamat_id"
                  value={form.alamat_id || ''}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  placeholder="Masukkan Alamat Id"
                />
              </Grid>
            </Grid>
            {error && <Typography color="error" fontSize={14} mt={2}>{error}</Typography>}
            {success && <Typography color="primary" fontSize={14} mt={2}>{success}</Typography>}
          </DialogContent>
          <DialogActions sx={{ p: isMobile ? 2 : 3, pt: 1 }}>
            <Button onClick={handleClose} color="primary" disabled={loading}>Batal</Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? 'Menyimpan...' : (editId ? 'Update' : 'Simpan')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleEditCustomer}>Edit</MenuItem>
      </Menu>
    </DashboardWrapper>
  );
}