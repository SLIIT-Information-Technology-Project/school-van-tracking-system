import express from "express";
<<<<<<< HEAD
import {
  markPickup,
  markDropoff,
  markNotComing,
  getAttendanceByDate,
  getAttendanceByStudent,
  getSystemAttendanceByDate,
  getSystemAttendanceToday,
  updateAttendanceNotes,
  deleteAttendance,
  getTodaysSummary
} from "../controllers/attendanceController.js";

const router = express.Router();

// Mark a student as picked up
router.post("/pickup", markPickup);

// Mark a student as dropped off
router.post("/dropoff", markDropoff);

// Mark a student as not coming
router.post("/not-coming", markNotComing);

// Get attendance record for a specific student on a specific date
router.get("/student/:studentId/date/:date", getAttendanceByDate);

// Get all attendance records for a student (with optional date range)
router.get("/student/:studentId", getAttendanceByStudent);

// Get all attendance records for a system on a specific date
router.get("/system/:systemId/date/:date", getSystemAttendanceByDate);

// Get all attendance records for a system today
router.get("/system/:systemId/today", getSystemAttendanceToday);

// Get today's pickup/dropoff summary for a student
router.get("/summary/:studentId", getTodaysSummary);

// Update attendance notes
router.put("/:attendanceId/notes", updateAttendanceNotes);

// Delete an attendance record
router.delete("/:attendanceId", deleteAttendance);
=======
import { markAttendance, getStudentActivities } from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/mark", markAttendance);
router.get("/:studentId", getStudentActivities);
>>>>>>> 52be61626046d8dd6cbb81cb9e57ec573efd1789

export default router;
