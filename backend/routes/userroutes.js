import express from "express";
//import { createUser } from "../controller/usercontroller.js";
import { login, getUsers } from "../controllers/authController.js";
import { updateProfile, getProfile, getAllUsers, createUser, deleteUser, getAllActivityLogs } from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifytoken.js";
//import { isAdmin } from "../middleware/isAdmin.js";
const router = express.Router();

router.post("/login", login);
router.get("/", getUsers);
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.get("/all", verifyToken, getAllUsers);
router.post("/", verifyToken, createUser);
router.delete("/:id", verifyToken, deleteUser);
router.get("/activity-logs", verifyToken, getAllActivityLogs);
//router.post("/", verifyToken, isAdmin, createUser); // hanya admin boleh nambah user

export default router;
