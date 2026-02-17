import express from "express";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";

import {
  getCollegeOverallAttendance,
  getDepartmentWiseAttendance,
  getCollegeVsDepartmentAttendance,
  getCollegeWeeklyTrend,
  getDepartmentsAtRisk,
  getAttendanceAlerts
} from "../controllers/managementAnalyticsController.js";

const router = express.Router();

/* ================= DASHBOARD METRICS ================= */

// 1️⃣ Overall college attendance %
router.get(
  "/attendance/overall",
  protect,
  authorize("management"),
  getCollegeOverallAttendance
);

// 2️⃣ Department‑wise attendance %
router.get(
  "/attendance/department",
  protect,
  authorize("management"),
  getDepartmentWiseAttendance
);

// 3️⃣ College vs Department comparison (bar chart)
router.get(
  "/attendance/comparison",
  protect,
  authorize("management"),
  getCollegeVsDepartmentAttendance
);

// 4️⃣ Weekly attendance trend
router.get(
  "/attendance/weekly",
  protect,
  authorize("management"),
  getCollegeWeeklyTrend
);

// 5️⃣ Alerts (at‑risk departments)
router.get(
  "/alerts",
  protect,
  authorize("management"),
  getDepartmentsAtRisk
);

// (Optional / placeholder – already exists in your controller)
router.get(
  "/alerts/basic",
  protect,
  authorize("management"),
  getAttendanceAlerts
);

export default router;
