import express from "express";
import { getStudentAISuggestion } from "../controllers/studentAIController.js";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";

import {
  getStudentProfile,
  getMyAttendance,
  getAttendanceSummary,
  getTodayStudentSchedule,
  getWeeklyAttendanceAnalytics
} from "../controllers/studentController.js";

const router = express.Router();



/**
 * @route   GET /api/student/profile
 * @desc    Get logged-in student profile
 * @access  Student
 */
router.get(
  "/profile",
  protect,
  authorize("student"),
  getStudentProfile
);

/**
 * @route   GET /api/student/attendance
 * @desc    Get student attendance records
 * @access  Student
 */
router.get(
  "/attendance",
  protect,
  authorize("student"),
  getMyAttendance
);

/**
 * @route   GET /api/student/attendance/summary
 * @desc    Attendance summary (cards + percentage)
 * @access  Student
 */
router.get(
  "/attendance/summary",
  protect,
  authorize("student"),
  getAttendanceSummary
);

/**
 * @route   GET /api/student/attendance/weekly
 * @desc    Weekly attendance analytics (chart)
 * @access  Student
 */
router.get(
  "/attendance/weekly",
  protect,
  authorize("student"),
  getWeeklyAttendanceAnalytics
);


/**
 * @route   GET /api/student/schedule/today
 * @desc    Get today's full timetable for student
 * @access  Student
 */
router.get(
  "/schedule/today",
  protect,
  authorize("student"),
  getTodayStudentSchedule
);

router.get(
  "/ai-suggestion",
  protect,
  authorize("student"),
  getStudentAISuggestion
);

router.post("/ai/suggestion", getStudentAISuggestion);
export default router;
