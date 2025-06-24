import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./users_model.js";
import Package from "./package_model.js";

const Customer = db.define("Customer", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  alias: DataTypes.STRING,
  address: DataTypes.TEXT,
  phone: DataTypes.STRING,
  start_date: DataTypes.DATEONLY,
  end_date: DataTypes.DATEONLY,
  google_maps_link: DataTypes.TEXT,
  handled_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  package_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'packages',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: "customers",
  timestamps: true // perbaiki
});

// Relasi
User.hasMany(Customer, { foreignKey: "handled_by" });
Customer.belongsTo(User, { foreignKey: "handled_by" });

Package.hasMany(Customer, { foreignKey: "package_id" });
Customer.belongsTo(Package, { foreignKey: "package_id" });

export default Customer;
