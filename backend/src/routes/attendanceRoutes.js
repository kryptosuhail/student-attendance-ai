import express from "express";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";
import { markAttendanceLocked } from "../controllers/attendanceController.js";

const router = express.Router();

/* ✅ Staff – Period Locked Attendance */
router.post(
  "/mark",
  protect,
  authorize("staff"),
  markAttendanceLocked
);

export default router;
