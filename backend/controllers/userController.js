import User from "../models/users_model.js";
import bcrypt from "bcrypt";
import { logActivity } from "../utils/logActivity.js";
import ActivityLog from "../models/activitylog_model.js";

export const updateProfile = async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Ambil user yang sedang login
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    // Validasi username unik jika diubah
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ msg: "Username sudah digunakan" });
      }
    }

    // Update username
    if (username) {
      user.username = username;
    }

    // Update password jika ada
    if (currentPassword && newPassword) {
      // Validasi password saat ini
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ msg: "Password saat ini salah" });
      }

      // Hash password baru
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // Simpan perubahan
    await user.save();

    // Log aktivitas
    await logActivity({
      user_id: userId,
      action: "update_profile",
      target_type: "user",
      target_id: userId,
      description: `${req.user.username} mengupdate profil`
    });

    res.json({ 
      msg: "Profil berhasil diupdate",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        wilayah: user.wilayah
      }
    });

  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'role', 'wilayah']
    });

    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error getting profile:", err);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};

export const getAllUsers = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return res.status(403).json({ msg: 'Hanya admin/superadmin yang boleh.' });
  const users = await User.findAll({
    where: { role: ['admin', 'subadmin'] },
    attributes: ['id', 'username', 'role', 'wilayah']
  });
  res.json(users);
};

export const createUser = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return res.status(403).json({ msg: 'Hanya admin/superadmin yang boleh.' });
  const { username, password, role, wilayah } = req.body;
  if (!username || !password || !role || !['admin', 'subadmin'].includes(role)) {
    return res.status(400).json({ msg: 'Data tidak valid' });
  }
  const existing = await User.findOne({ where: { username } });
  if (existing) return res.status(400).json({ msg: 'Username sudah digunakan' });
  const bcrypt = (await import('bcrypt')).default;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashed, role, wilayah: role === 'subadmin' ? wilayah : null });
  res.status(201).json({ msg: 'User berhasil dibuat', user: { id: user.id, username: user.username, role: user.role, wilayah: user.wilayah } });
};

export const deleteUser = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return res.status(403).json({ msg: 'Hanya admin/superadmin yang boleh.' });
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user || !['admin', 'subadmin'].includes(user.role)) return res.status(404).json({ msg: 'User tidak ditemukan' });
  await user.destroy();
  res.json({ msg: 'User berhasil dihapus' });
};

export const getAllActivityLogs = async (req, res) => {
  if (req.user.role !== 'superadmin') return res.status(403).json({ msg: 'Hanya superadmin yang boleh.' });
  const logs = await ActivityLog.findAll({
    order: [['timestamp', 'DESC']],
    limit: 50,
    include: [{ model: User, attributes: ['username'] }]
  });
  res.json(logs);
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  const userToEdit = await User.findByPk(id);
  if (!userToEdit) return res.status(404).json({ msg: 'User tidak ditemukan' });

  // Hanya admin bisa edit admin, superadmin bisa edit semua kecuali superadmin lain
  if (req.user.role === 'admin') {
    if (userToEdit.role !== 'admin') return res.status(403).json({ msg: 'Admin hanya bisa edit admin lain' });
  } else if (req.user.role === 'superadmin') {
    if (userToEdit.role === 'superadmin' && req.user.id !== userToEdit.id) {
      return res.status(403).json({ msg: 'Superadmin tidak bisa edit superadmin lain' });
    }
  } else {
    return res.status(403).json({ msg: 'Tidak diizinkan' });
  }

  if (username) userToEdit.username = username;
  if (password) {
    const bcrypt = (await import('bcrypt')).default;
    userToEdit.password = await bcrypt.hash(password, 10);
  }
  await userToEdit.save();
  res.json({ msg: 'User berhasil diupdate', user: { id: userToEdit.id, username: userToEdit.username, role: userToEdit.role } });
}; 