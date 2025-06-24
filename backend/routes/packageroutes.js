import express from "express";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage
} from "../controllers/packageController.js";
import { verifyToken } from "../middleware/verifytoken.js";

const router = express.Router();

router.get("/", verifyToken, getPackages);
router.post("/", verifyToken, createPackage);
router.put("/:id", verifyToken, updatePackage);
router.delete("/:id", verifyToken, deletePackage);

export default router;
