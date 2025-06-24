// utils/logActivity.js
import ActivityLog from "../models/activitylog_model.js";

export const logActivity = async ({
  user_id,
  action,
  target_type,
  target_id,
  description
}) => {
  try {
    await ActivityLog.create({
      user_id,
      action,
      target_type,
      target_id,
      description
    });
  } catch (err) {
    console.error("Gagal menyimpan log aktivitas:", err.message);
  }
};
