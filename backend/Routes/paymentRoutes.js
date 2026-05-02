import express from "express";
import {
  createOrUpdatePayment,
  getPaymentByStudentMonth,
  getStudentPayments,
  getSystemPayments,
  getParentPayments,
  updatePaymentStatus,
  deletePayment,
  getSystemPaymentSummary,
} from "../controllers/paymentController.js";

const router = express.Router();

// Create or update payment
router.post("/", createOrUpdatePayment);

// Get payment by student and month
router.get("/student/:studentId/month/:month", getPaymentByStudentMonth);

// Get all payments for a student
router.get("/student/:studentId", getStudentPayments);

// Get all payments for a system
router.get("/system/:systemId", getSystemPayments);

// Get payments for a parent
router.get("/parent/:parentId", getParentPayments);

// Get payment summary for a system
router.get("/system/:systemId/summary", getSystemPaymentSummary);

// Update payment status
router.put("/:paymentId/status", updatePaymentStatus);

// Delete a payment
router.delete("/:paymentId", deletePayment);

export default router;
