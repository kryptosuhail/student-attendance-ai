import express from "express";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";
import { markAttendanceLocked, markAttendanceGoogleForm } from "../controllers/attendanceController.js";

const router = express.Router();

/* ✅ Staff – Period Locked Attendance */
router.post(
  "/mark",
  protect,
  authorize("staff"),
  markAttendanceLocked
);

/* ✅ Google Forms Webhook - No App Auth, Uses Secret */
router.post("/webhook", markAttendanceGoogleForm);

export default router;
