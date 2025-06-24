import User from "../models/users_model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: "Password salah" });
    console.log("Compare result:", await bcrypt.compare(password, user.password));

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const where = req.query.role ? { role: req.query.role } : {};
    const users = await User.findAll({
      where,
      attributes: ['id', 'username', 'role']
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
