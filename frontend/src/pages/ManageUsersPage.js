import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const API = 'https://usahagweh-production.up.railway.app/abira-api/users';

export default function ManageUsersPage({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'admin', wilayah: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError('Gagal mengambil data user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [token]);

  const handleOpen = () => { setOpen(true); setForm({ username: '', password: '', role: 'admin', wilayah: '' }); setError(''); setSuccess(''); };
  const handleClose = () => { setOpen(false); setForm({ username: '', password: '', role: 'admin', wilayah: '' }); setError(''); setSuccess(''); };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async e => {
    e.preventDefault();
    setAddLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Gagal tambah user');
      setSuccess('User berhasil ditambahkan');
      fetchUsers();
      setTimeout(() => handleClose(), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = id => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/${deleteId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Gagal hapus user');
      setSuccess('User berhasil dihapus');
      setOpenDelete(false);
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setOpenDelete(false);
    setDeleteId(null);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} color="primary" mb={2}>Kelola Admin & Subadmin</Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} sx={{ mb: 2 }}>Tambah User</Button>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? <CircularProgress /> : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Wilayah</TableCell>
              <TableCell align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.role === 'subadmin' ? u.wilayah : '-'}</TableCell>
                <TableCell align="right">
                  <IconButton color="error" onClick={() => handleDelete(u.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleAdd}>
          <DialogTitle>Tambah User</DialogTitle>
          <DialogContent>
            <TextField label="Username" name="username" value={form.username} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Password" name="password" value={form.password} onChange={handleChange} fullWidth margin="normal" required type="password" />
            <TextField select label="Role" name="role" value={form.role} onChange={handleChange} fullWidth margin="normal" required>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="subadmin">Subadmin</MenuItem>
            </TextField>
            {form.role === 'subadmin' && (
              <TextField label="Wilayah" name="wilayah" value={form.wilayah} onChange={handleChange} fullWidth margin="normal" required />
            )}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary" disabled={addLoading}>Batal</Button>
            <Button type="submit" variant="contained" color="primary" disabled={addLoading}>{addLoading ? 'Menyimpan...' : 'Simpan'}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={openDelete} onClose={cancelDelete} disableEscapeKeyDown>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography>Anda yakin ingin menghapus user ini?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary" disabled={loading}>Batal</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={loading}>{loading ? 'Menghapus...' : 'Hapus'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 