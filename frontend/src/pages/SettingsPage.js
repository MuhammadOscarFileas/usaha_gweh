import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Grid, Alert, Divider, Card, CardContent, Avatar, InputAdornment, IconButton
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function SettingsPage({ user, token }) {
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validasi password
      if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
        throw new Error('Password baru dan konfirmasi password tidak cocok');
      }

      if (profileForm.newPassword && profileForm.newPassword.length < 6) {
        throw new Error('Password minimal 6 karakter');
      }

      const updateData = {
        username: profileForm.username
      };

      if (profileForm.currentPassword && profileForm.newPassword) {
        updateData.currentPassword = profileForm.currentPassword;
        updateData.newPassword = profileForm.newPassword;
      }

      const response = await fetch(`https://usahagweh-production.up.railway.app/abira-api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Gagal mengupdate profil');
      }

      setSuccess('Profil berhasil diupdate');
      setEditMode(false);
      
      // Update user data in localStorage if username changed
      if (data.user) {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          try {
            const tokenParts = currentToken.split('.');
            const payload = JSON.parse(atob(tokenParts[1]));
            payload.username = data.user.username;
            payload.role = data.user.role;
            payload.wilayah = data.user.wilayah;
            
            // Create new token with updated payload
            const newToken = `${tokenParts[0]}.${btoa(JSON.stringify(payload))}.${tokenParts[2]}`;
            localStorage.setItem('token', newToken);
            
            // Update user state if parent component provides setUser function
            if (window.updateUserData) {
              window.updateUserData(data.user);
            }
          } catch (err) {
            console.error('Error updating token:', err);
          }
        }
      }
      
      // Reset password fields
      setProfileForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileForm({
      username: user?.username || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setEditMode(false);
    setError('');
    setSuccess('');
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} color="primary" mb={3}>
        Pengaturan Akun
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Informasi Profil
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Update informasi akun Anda
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleSaveProfile}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Username"
                    name="username"
                    value={profileForm.username}
                    onChange={handleProfileChange}
                    fullWidth
                    required
                    disabled={!editMode}
                    placeholder="Masukkan username baru"
                  />
                </Grid>

                {editMode && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          <LockIcon sx={{ mr: 1, fontSize: 16 }} />
                          Ubah Password
                        </Typography>
                      </Divider>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Password Saat Ini"
                        name="currentPassword"
                        type={showCurrent ? 'text' : 'password'}
                        value={profileForm.currentPassword}
                        onChange={handleProfileChange}
                        fullWidth
                        placeholder="Masukkan password saat ini"
                        helperText="Wajib diisi jika ingin mengubah password"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={showCurrent ? 'Sembunyikan password' : 'Tampilkan password'}
                                onClick={() => setShowCurrent(s => !s)}
                                edge="end"
                                tabIndex={-1}
                              >
                                {showCurrent ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Password Baru"
                        name="newPassword"
                        type={showNew ? 'text' : 'password'}
                        value={profileForm.newPassword}
                        onChange={handleProfileChange}
                        fullWidth
                        placeholder="Minimal 6 karakter"
                        helperText={profileForm.newPassword && profileForm.newPassword.length < 6 ? "Minimal 6 karakter" : ""}
                        error={profileForm.newPassword && profileForm.newPassword.length < 6}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={showNew ? 'Sembunyikan password' : 'Tampilkan password'}
                                onClick={() => setShowNew(s => !s)}
                                edge="end"
                                tabIndex={-1}
                              >
                                {showNew ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Konfirmasi Password Baru"
                        name="confirmPassword"
                        type={showConfirm ? 'text' : 'password'}
                        value={profileForm.confirmPassword}
                        onChange={handleProfileChange}
                        fullWidth
                        placeholder="Ulangi password baru"
                        helperText={profileForm.newPassword && profileForm.confirmPassword && profileForm.newPassword !== profileForm.confirmPassword ? "Password tidak cocok" : ""}
                        error={profileForm.newPassword && profileForm.confirmPassword && profileForm.newPassword !== profileForm.confirmPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
                                onClick={() => setShowConfirm(s => !s)}
                                edge="end"
                                tabIndex={-1}
                              >
                                {showConfirm ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                  </>
                )}

                {error && (
                  <Grid item xs={12}>
                    <Alert severity="error">{error}</Alert>
                  </Grid>
                )}

                {success && (
                  <Grid item xs={12}>
                    <Alert severity="success">{success}</Alert>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    {editMode ? (
                      <>
                        <Button
                          onClick={handleCancel}
                          variant="outlined"
                          disabled={loading}
                          startIcon={<CancelIcon />}
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading}
                          startIcon={<SaveIcon />}
                        >
                          {loading ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setEditMode(true)}
                        variant="contained"
                        startIcon={<PersonIcon />}
                      >
                        Edit Profil
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* User Info Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {user?.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.role === 'admin' ? 'Administrator' : 'Sub Administrator'}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Username
                </Typography>
                <Typography variant="body1" fontWeight={500} mb={2}>
                  {user?.username}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Role
                </Typography>
                <Typography variant="body1" fontWeight={500} mb={2}>
                  {user?.role === 'admin' ? 'Administrator' : 'Sub Administrator'}
                </Typography>

                {user?.wilayah && (
                  <>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Wilayah
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user.wilayah}
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 