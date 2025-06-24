import { DataTypes } from "sequelize";
import db from "../config/database.js";

const AlamatId = db.define("AlamatId", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: "alamat_id",
  timestamps: false
});

export default AlamatId; 