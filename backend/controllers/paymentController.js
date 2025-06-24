import Payment from "../models/payment_model.js";
import Customer from "../models/customer_model.js";
import { logActivity } from "../utils/logActivity.js";

export const getPayments = async (req, res) => {
  const { bulan, tahun } = req.query;

  const where = {};
  if (bulan && tahun) {
    where.bulan = bulan;
    where.tahun = tahun;
  }

  const payments = await Payment.findAll({
    where,
    include: [{ model: Customer }]
  });

  res.json(payments);
};

export const getCustomerPayments = async (req, res) => {
  const { customer_id } = req.params;
  const payments = await Payment.findAll({
    where: { customer_id }
  });

  res.json(payments);
};

export const createOrUpdatePayment = async (req, res) => {
  const { customer_id, bulan, tahun, status, tanggal_bayar } = req.body;

  const [payment, created] = await Payment.upsert({
    customer_id,
    bulan,
    tahun,
    status,
    tanggal_bayar
  });

  await logActivity({
    user_id: req.user.id,
    action: "update_payment",
    target_type: "customer",
    target_id: customer_id,
    description: `${req.user.username} mengupdate pembayaran bulan ${bulan}/${tahun} (${status})`
  });

  res.json({
    msg: created ? "Data pembayaran ditambahkan" : "Data pembayaran diperbarui"
  });
};

