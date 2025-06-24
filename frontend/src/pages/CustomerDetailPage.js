import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Alert,
  Select
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import InventoryIcon from '@mui/icons-material/Inventory';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import dayjs from 'dayjs';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';

const CustomerDetailPage = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [packages, setPackages] = useState([]);
  const [statusEdit, setStatusEdit] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`https://usahagweh-production.up.railway.app/abira-api/customers/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil data pelanggan');
        }

        const data = await response.json();
        setCustomer(data.customer);
        setActivityLogs(data.activityLogs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [id, token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!customer) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography>Pelanggan tidak ditemukan.</Typography>
      </Box>
    );
  }

  const { name, alias, phone, address, start_date, end_date, Package: pkg, google_maps_link } = customer;

  const handleEditOpen = async () => {
    // Fetch packages
    try {
      const res = await fetch('https://usahagweh-production.up.railway.app/abira-api/packages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPackages(data);
    } catch {
      setPackages([]);
    }
    setEditForm({
      name: customer.name || '',
      alias: customer.alias || '',
      phone: customer.phone || '',
      address: customer.address || '',
      start_date: customer.start_date ? customer.start_date.slice(0, 10) : '',
      end_date: customer.end_date ? customer.end_date.slice(0, 10) : '',
      package_id: customer.package_id ? String(customer.package_id) : '',
      google_maps_link: customer.google_maps_link || '',
    });
    setEditError('');
    setEditSuccess('');
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditForm(null);
    setEditError('');
    setEditSuccess('');
  };

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      const res = await fetch(`https://usahagweh-production.up.railway.app/abira-api/customers/${customer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editForm,
          package_id: Number(editForm.package_id),
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Gagal update pelanggan');
      setEditSuccess('Pelanggan berhasil diupdate');
      setTimeout(() => {
        setEditOpen(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // Handler untuk update status
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatusEdit(newStatus);
    setStatusLoading(true);
    try {
      const body = { status: newStatus };
      if (newStatus === 'inactive' && !customer.end_date) {
        body.end_date = new Date().toISOString().slice(0, 10);
      }
      const res = await fetch(`https://usahagweh-production.up.railway.app/abira-api/customers/${customer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Gagal update status');
      setTimeout(() => window.location.reload(), 500);
    } catch {
      setStatusLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Tooltip title="Kembali ke Dashboard">
        <IconButton onClick={() => navigate('/dashboard')} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          {name}
        </Typography>
        <Tooltip title="Edit Pelanggan">
          <IconButton onClick={handleEditOpen} color="primary">
            <EditIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" color="text.secondary">
            {alias}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">Status:</Typography>
            <Select
              value={statusEdit !== null ? statusEdit : customer.status}
              onChange={handleStatusChange}
              size="small"
              disabled={statusLoading}
              sx={{
                minWidth: 120,
                color: customer.status === 'active' ? 'success.main' : 'error.main',
                fontWeight: 700,
                background: customer.status === 'active' ? '#e8f5e9' : '#ffebee',
                borderRadius: 2
              }}
            >
              <MenuItem value="active">
                <Chip label="Aktif" size="small" sx={{ background: '#4caf50', color: '#fff' }} />
              </MenuItem>
              <MenuItem value="inactive">
                <Chip label="Tidak Aktif" size="small" sx={{ background: '#e53935', color: '#fff' }} />
              </MenuItem>
            </Select>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <ListItem>
              <ListItemIcon><PhoneIcon /></ListItemIcon>
              <ListItemText primary="No. HP" secondary={phone || '-'} />
            </ListItem>
          </Grid>
          <Grid item xs={12} md={6}>
            <ListItem>
              <ListItemIcon><InventoryIcon /></ListItemIcon>
              <ListItemText primary="Paket" secondary={pkg ? `${pkg.name} - Rp${Number(pkg.price).toLocaleString('id-ID')}` : '-'} />
            </ListItem>
          </Grid>
          <Grid item xs={12} md={6}>
            <ListItem>
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary="Handled By" secondary={customer.handled_by_username || '-'} />
            </ListItem>
          </Grid>
          <Grid item xs={12} md={6}>
            <ListItem>
              <ListItemIcon><BarChartIcon /></ListItemIcon>
              <ListItemText primary="Status" secondary={customer.status === 'active' ? 'Aktif' : 'Tidak Aktif'} />
            </ListItem>
          </Grid>
          <Grid item xs={12}>
            <ListItem>
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="Alamat" secondary={address || '-'} />
              {google_maps_link && (
                <Tooltip title="Buka di Google Maps">
                  <IconButton
                    size="small"
                    onClick={() => window.open(google_maps_link, '_blank')}
                    sx={{ color: '#1976d2', ml: 1 }}
                  >
                    <LocationOnIcon />
                  </IconButton>
                </Tooltip>
              )}
            </ListItem>
          </Grid>
          <Grid item xs={12} md={6}>
            <ListItem>
              <ListItemIcon><EventIcon /></ListItemIcon>
              <ListItemText primary="Tanggal Mulai" secondary={start_date ? dayjs(start_date).format('DD MMMM YYYY') : '-'} />
            </ListItem>
          </Grid>
          <Grid item xs={12} md={6}>
            <ListItem>
              <ListItemIcon><EventIcon /></ListItemIcon>
              <ListItemText primary="Tanggal Berakhir" secondary={end_date ? dayjs(end_date).format('DD MMMM YYYY') : '-'} />
            </ListItem>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Log Aktivitas
        </Typography>
        <List>
          {activityLogs.length > 0 ? (
            activityLogs.map((log) => (
              <React.Fragment key={log.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">{log.description}</Typography>
                        <Chip label={log.User.username} size="small" />
                      </Box>
                    }
                    secondary={dayjs(log.timestamp).format('DD MMM YYYY, HH:mm')}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          ) : (
            <Typography sx={{ p: 2, textAlign: 'center' }}>Tidak ada log aktivitas.</Typography>
          )}
        </List>
      </Paper>

      {/* Dialog Edit Pelanggan */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleEditSubmit}>
          <DialogTitle>Edit Pelanggan</DialogTitle>
          <DialogContent>
            <TextField
              label="Nama Lengkap"
              name="name"
              value={editForm?.name || ''}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Alias/Nama Panggilan"
              name="alias"
              value={editForm?.alias || ''}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="No HP"
              name="phone"
              value={editForm?.phone || ''}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Alamat Lengkap"
              name="address"
              value={editForm?.address || ''}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              label="Tanggal Mulai"
              name="start_date"
              type="date"
              value={editForm?.start_date || ''}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Tanggal Berakhir"
              name="end_date"
              type="date"
              value={editForm?.end_date || ''}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Paket"
              name="package_id"
              value={editForm?.package_id || ''}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
              required
            >
              {packages.map(pkg => (
                <MenuItem key={pkg.id} value={pkg.id}>{pkg.name} (Rp{pkg.price})</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Google Maps Link"
              name="google_maps_link"
              value={editForm?.google_maps_link || ''}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
              placeholder="Contoh: https://maps.google.com/maps?q=-7.668330542195574,110.60514511137022"
              helperText="Copy link dari Google Maps dan paste di sini"
            />
            {editError && <Typography color="error" fontSize={14} mt={2}>{editError}</Typography>}
            {editSuccess && <Typography color="primary" fontSize={14} mt={2}>{editSuccess}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose} color="primary" disabled={editLoading}>Batal</Button>
            <Button type="submit" variant="contained" color="primary" disabled={editLoading}>
              {editLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CustomerDetailPage; 