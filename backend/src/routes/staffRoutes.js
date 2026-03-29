import express from "express";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";
import {
  getTodaySchedule,
  getCurrentPeriodClass,
  getClassAttendanceSummary,
  getLowAttendanceStudents,
  getOverallAttendanceSummary,
  getStaffWeeklyAnalytics,
  getStaffClassDetails,
  getStaffFullTimetable,
  getDepartmentClasses
} from "../controllers/staffController.js";

const router = express.Router();

/* ✅ Staff – Today’s Full Schedule */
router.get(
  "/schedule/today",
  protect,
  authorize("staff"),
  getTodaySchedule
);

/* ✅ Staff – Current Period (LIVE class card) */
router.get(
  "/schedule/current",
  protect,
  authorize("staff"),
  getCurrentPeriodClass
);

router.get(
  "/attendance/summary",
  protect,
  authorize("staff"),
  getClassAttendanceSummary
);

router.get(
  "/attendance/risk",
  protect,
  authorize("staff"),
  getLowAttendanceStudents
);

router.get(
  "/attendance/overall",
  protect,
  authorize("staff"),
  getOverallAttendanceSummary
);

router.get(
  "/attendance/weekly",
  protect,
  authorize("staff"),
  getStaffWeeklyAnalytics
);

router.get(
  "/class/:dept/:year/:section",
  protect,
  authorize("staff"),
  getStaffClassDetails
);

router.get(
  "/schedule/weekly",
  protect,
  authorize("staff"),
  getStaffFullTimetable
);

router.get(
  "/department/:dept/classes",
  protect,
  authorize("staff"),
  getDepartmentClasses
);

export default router;
