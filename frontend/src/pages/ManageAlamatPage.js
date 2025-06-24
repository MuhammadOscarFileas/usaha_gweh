import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

const API = 'https://usahagweh-production.up.railway.app/abira-api/customers/alamat';

export default function ManageAlamatPage({ token, user }) {
  const [alamat, setAlamat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nama: '' });
  const [editId, setEditId] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchAlamat = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (Array.isArray(data.alamat) ? data.alamat : []);
      setAlamat(arr);
      if (!Array.isArray(arr)) setError(data.msg || 'Data alamat tidak valid atau token expired.');
      else if (arr.length === 0 && data.msg) setError(data.msg);
    } catch (e) {
      setError('Gagal mengambil data alamat');
      setAlamat([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlamat(); }, [token]);

  const handleOpen = () => { setOpen(true); setForm({ nama: '' }); setError(''); setSuccess(''); setEditId(null); };
  const handleClose = () => { setOpen(false); setForm({ nama: '' }); setError(''); setSuccess(''); setEditId(null); };
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddOrEdit = async e => {
    e.preventDefault();
    setAddLoading(true);
    setError('');
    setSuccess('');
    try {
      let res, data;
      if (editId) {
        res = await fetch(`${API}/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nama: form.nama })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Gagal edit alamat');
        setSuccess('Alamat berhasil diupdate');
      } else {
        res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nama: form.nama })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Gagal tambah alamat');
        setSuccess('Alamat berhasil ditambahkan');
      }
      fetchAlamat();
      setTimeout(() => handleClose(), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setAddLoading(false);
      setEditId(null);
    }
  };

  const handleEdit = (alamat) => {
    setForm({ nama: alamat.nama });
    setEditId(alamat.id);
    setOpen(true);
  };

  const handleDelete = async () => {
    setAddLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Gagal hapus alamat');
      setSuccess('Alamat berhasil dihapus');
      fetchAlamat();
      setOpenDelete(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setAddLoading(false);
      setDeleteId(null);
    }
  };

  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return <Alert severity="error">Anda tidak memiliki akses ke halaman ini.</Alert>;
  }

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} color="primary" mb={2}>Kelola Master Alamat</Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} sx={{ mb: 2 }}>Tambah Alamat</Button>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? <CircularProgress /> : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nama Alamat</TableCell>
              <TableCell align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(alamat) && alamat.length > 0 ? alamat.map(a => (
              <TableRow key={a.id}>
                <TableCell>{a.nama}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEdit(a)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => { setOpenDelete(true); setDeleteId(a.id); }}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={2} align="center">Tidak ada data alamat</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <form onSubmit={handleAddOrEdit}>
          <DialogTitle>{editId ? 'Edit Alamat' : 'Tambah Alamat'}</DialogTitle>
          <DialogContent>
            <TextField label="Nama Alamat" name="nama" value={form.nama} onChange={handleChange} fullWidth margin="normal" required />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary" disabled={addLoading}>Batal</Button>
            <Button type="submit" variant="contained" color="primary" disabled={addLoading}>{addLoading ? 'Menyimpan...' : 'Simpan'}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography>Yakin ingin menghapus alamat ini?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)} color="primary">Batal</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={addLoading}>Hapus</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 