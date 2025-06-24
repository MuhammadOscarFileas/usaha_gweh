import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function PackagePage({ token }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', price: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [packages, setPackages] = useState([]);
  const [editId, setEditId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchPackages = async () => {
    try {
      const res = await fetch('http://localhost:5000/abira-api/packages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPackages(data);
    } catch {
      setPackages([]);
    }
  };

  useEffect(() => {
    fetchPackages();
    // eslint-disable-next-line
  }, []);

  const handleOpen = () => {
    setEditId(null);
    setForm({ name: '', price: '' });
    setOpen(true);
  };
  const handleEdit = pkg => {
    setEditId(pkg.id);
    setForm({ name: pkg.name, price: pkg.price });
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setForm({ name: '', price: '' });
    setError('');
    setSuccess('');
    setEditId(null);
  };
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let res, data;
      if (editId) {
        res = await fetch(`http://localhost:5000/abira-api/packages/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: form.name,
            price: Number(form.price)
          })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Gagal edit paket');
        setSuccess('Paket berhasil diupdate');
      } else {
        res = await fetch('http://localhost:5000/abira-api/packages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: form.name,
            price: Number(form.price)
          })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Gagal tambah paket');
        setSuccess('Paket berhasil ditambahkan');
      }
      setTimeout(() => {
        handleClose();
        fetchPackages();
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = id => {
    setDeleteId(id);
    setOpenDelete(true);
  };
  const confirmDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/abira-api/packages/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Gagal hapus paket');
      setOpenDelete(false);
      setDeleteId(null);
      fetchPackages();
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
      <Typography variant="h5" fontWeight={700} color="primary" mb={2}>
        Data Paket
      </Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={handleOpen}>
        + Tambah Paket
      </Button>
      <Paper sx={{ p: 2 }}>
        {packages.length === 0 ? (
          <Typography color="text.secondary">Belum ada data paket.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nama Paket</TableCell>
                <TableCell>Harga</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packages.map(pkg => (
                <TableRow key={pkg.id}>
                  <TableCell>{pkg.name}</TableCell>
                  <TableCell>Rp{pkg.price.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleEdit(pkg)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(pkg.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
      <Dialog open={open} onClose={() => {}} disableEscapeKeyDown>
        <DialogTitle>{editId ? 'Edit Paket' : 'Tambah Paket'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              label="Nama Paket"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Harga"
              name="price"
              value={form.price}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              type="number"
            />
            {error && <Typography color="error" fontSize={14} mt={1}>{error}</Typography>}
            {success && <Typography color="primary" fontSize={14} mt={1}>{success}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary" disabled={loading}>Batal</Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>{loading ? 'Menyimpan...' : (editId ? 'Update' : 'Simpan')}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={openDelete} onClose={cancelDelete} disableEscapeKeyDown>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography>Anda yakin ingin menghapus paket ini?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">Batal</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={loading}>Hapus</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 