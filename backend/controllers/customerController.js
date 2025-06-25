import Customer from "../models/customer_model.js";
import Package from "../models/package_model.js";
import User from "../models/users_model.js";
import ActivityLog from "../models/activitylog_model.js";
import { logActivity } from "../utils/logActivity.js";
import Payment from "../models/payment_model.js";

export const getCustomers = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === "subadmin") {
      where = { handled_by: req.user.id, status: 'active' };
    }
    // Untuk admin/superadmin, tampilkan semua status

    const customers = await Customer.findAll({
      where,
      include: [
        { model: Package, attributes: ['name'] },
        { model: User, attributes: ['username'] },
      ]
    });

    // Map hasil agar package_name dan alamat_nama ada di root object
    const result = customers.map(c => {
      const obj = c.toJSON();
      return {
        ...obj,
        package_name: obj.Package?.name || null,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    // Subadmin tidak boleh akses detail customer sama sekali
    if (req.user.role === "subadmin") {
      return res.status(403).json({ msg: "Subadmin tidak diizinkan melihat detail customer" });
    }
    let where = { id: req.params.id };
    const customer = await Customer.findOne({
      where,
      include: [
        {
          model: Package,
          as: "Package",
          attributes: ["name", "price"],
        },
        {
          model: Payment,
          as: "Payments",
        },
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });

    if (!customer) {
      return res.status(404).json({ msg: "Pelanggan tidak ditemukan" });
    }

    const activityLogs = await ActivityLog.findAll({
      where: {
        target_type: "customer",
        target_id: req.params.id,
      },
      order: [["timestamp", "DESC"]],
      include: {
        model: User,
        attributes: ["username"],
      },
    });

    // Tambahkan status, handled_by (username), dan alamat_nama ke response
    const customerObj = customer.toJSON();
    customerObj.handled_by_username = customerObj.User?.username || null;

    res.json({
      customer: customerObj,
      activityLogs,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.status) data.status = 'active';
    // Validasi manual field wajib
    if (!data.name || !data.handled_by || !data.package_id) {
      return res.status(400).json({ msg: "Field wajib tidak boleh kosong" });
    }
    const newCustomer = await Customer.create(data);

    await logActivity({
      user_id: req.user.id,
      action: "create_customer",
      target_type: "customer",
      target_id: newCustomer.id,
      description: `${req.user.username} menambahkan pelanggan ${req.body.name}`
    });

    res.status(201).json({ msg: "Pelanggan berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const data = { ...req.body };

  // Jika status diubah ke inactive, set end_date ke hari ini jika belum ada
  if (data.status === 'inactive') {
    if (!data.end_date) {
      data.end_date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    }
  }

  await Customer.update(data, { where: { id } });

  await logActivity({
    user_id: req.user.id,
    action: "update_customer",
    target_type: "customer",
    target_id: id,
    description: `${req.user.username} mengubah data pelanggan ID ${id}`
  });

  res.json({ msg: "Pelanggan berhasil diperbarui" });
};

export const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  await Customer.destroy({ where: { id } });
  res.json({ msg: "Pelanggan berhasil dihapus" });
};
