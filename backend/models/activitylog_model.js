import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./users_model.js";

const ActivityLog = db.define("ActivityLog", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  target_type: {
    type: DataTypes.STRING
  },
  target_id: {
    type: DataTypes.INTEGER
  },
  description: {
    type: DataTypes.TEXT
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "activity_logs",
  timestamps: false
});

User.hasMany(ActivityLog, { foreignKey: "user_id" });
ActivityLog.belongsTo(User, { foreignKey: "user_id" });

export default ActivityLog;
