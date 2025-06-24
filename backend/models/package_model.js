import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Package = db.define("Package", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: "packages",
  timestamps: false
});

export default Package;
