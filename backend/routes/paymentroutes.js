import express from "express";
import {
  getPayments,
  getCustomerPayments,
  createOrUpdatePayment
} from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/verifytoken.js";

const router = express.Router();

router.get("/", verifyToken, getPayments);
router.get("/:customer_id", verifyToken, getCustomerPayments);
router.post("/", verifyToken, createOrUpdatePayment);

export default router;
