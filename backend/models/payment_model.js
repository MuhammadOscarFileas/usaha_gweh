import { DataTypes } from "sequelize";
import db from "../config/database.js";
import Customer from "./customer_model.js";

const Payment = db.define("Payment", {
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  bulan: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tahun: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("Lunas", "Belum", "Block"),
    allowNull: false
  },
  tanggal_bayar: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: "payment_histories",
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['customer_id', 'bulan', 'tahun']
    }
  ]
});

// Relasi
Customer.hasMany(Payment, { foreignKey: "customer_id" });
Payment.belongsTo(Customer, { foreignKey: "customer_id" });

export default Payment;
