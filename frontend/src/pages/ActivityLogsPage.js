import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Alert, Paper } from '@mui/material';

const API = 'http://localhost:5000/abira-api/users/activity-logs';

export default function ActivityLogsPage({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Format data salah');
        setLogs(data);
      } catch (e) {
        setError('Gagal mengambil data log aktivitas');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [token]);

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} color="primary" mb={2}>Log Aktivitas</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : (
        <Paper sx={{ p: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Waktu</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Aksi</TableCell>
                <TableCell>Deskripsi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.timestamp).toLocaleString('id-ID')}</TableCell>
                  <TableCell>{log.User?.username || '-'}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
} 