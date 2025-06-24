import express from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from "../controllers/customerController.js";
import { verifyToken } from "../middleware/verifytoken.js";
//import multer from "multer";

const router = express.Router();
//const upload = multer({ dest: "uploads/" });

router.get("/", verifyToken, getCustomers);
router.get("/:id", verifyToken, getCustomerById);
router.post("/", verifyToken, createCustomer);
router.put("/:id", verifyToken, updateCustomer);
router.delete("/:id", verifyToken, deleteCustomer);

// Import dari Excel
//router.post("/import", verifyToken, upload.single("file"), importCustomers);

router.get("/customers", verifyToken, getCustomers);
router.post("/customers", verifyToken, createCustomer);
router.get("/customers/:id", verifyToken, getCustomerById);
router.put("/customers/:id", verifyToken, updateCustomer);
router.delete("/customers/:id", verifyToken, deleteCustomer);

export default router;
