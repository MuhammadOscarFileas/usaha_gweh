import { DataTypes } from "sequelize";
import db from "../config/database.js";

const User = db.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM("superadmin", "admin", "subadmin"),
    allowNull: false
  },
  wilayah: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "users",
  timestamps: false
});

export default User;
