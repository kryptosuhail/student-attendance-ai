import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";

/**
 * Utility: % calculation
 */
const percentageExpr = {
  $round: [
    {
      $multiply: [
        { $divide: ["$present", "$total"] },
        100
      ]
    },
    0
  ]
};

/* =========================================================
  1️⃣ OVERALL COLLEGE ATTENDANCE %
========================================================= */
export const getCollegeOverallAttendance = async (req, res) => {
  try {
    const result = await Attendance.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          attendancePercentage: percentageExpr
        }
      }
    ]);

    res.json({
      attendancePercentage: result[0]?.attendancePercentage || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
  2️⃣ DEPARTMENT‑WISE ATTENDANCE %
========================================================= */
export const getDepartmentWiseAttendance = async (req, res) => {
  try {
    const departments = await Attendance.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },

      {
        $group: {
          _id: "$student.department",
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          attendancePercentage: percentageExpr
        }
      },
      { $sort: { department: 1 } }
    ]);

    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
  3️⃣ COLLEGE vs DEPARTMENT (BAR CHART)
========================================================= */
export const getCollegeVsDepartmentAttendance = async (req, res) => {
  try {
    const deptStats = await Attendance.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },

      {
        $group: {
          _id: "$student.department",
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          department: "$_id",
          attendance: percentageExpr
        }
      }
    ]);

    const college = await Attendance.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          average: percentageExpr
        }
      }
    ]);

    const collegeAverage = college[0]?.average || 0;

    const departments = deptStats.map((d) => ({
      department: d.department,
      attendance: d.attendance,
      collegeAverage
    }));

    res.json({ collegeAverage, departments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
  4️⃣ WEEKLY COLLEGE ATTENDANCE TREND
========================================================= */
export const getCollegeWeeklyTrend = async (req, res) => {
  try {
    const result = await Attendance.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: "$date" },
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          day: "$_id",
          percentage: percentageExpr
        }
      },
      { $sort: { day: 1 } }
    ]);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const weekly = result.map((r) => ({
      day: days[r.day - 1],
      attendance: r.percentage
    }));

    res.json({ weekly });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
  5️⃣ DEPARTMENTS AT RISK (ALERTS)
========================================================= */
export const getDepartmentsAtRisk = async (req, res) => {
  try {
    const THRESHOLD = 75;

    const result = await Attendance.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },

      {
        $group: {
          _id: "$student.department",
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          department: "$_id",
          attendancePercentage: percentageExpr
        }
      },
      {
        $match: {
          attendancePercentage: { $lt: THRESHOLD }
        }
      }
    ]);

    res.json({
      threshold: THRESHOLD,
      count: result.length,
      departments: result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendanceAlerts = async (req, res) => {
  try {
    // TEMP / BASIC RESPONSE (can improve later)
    res.json({
      alerts: [],
      message: "Attendance alerts API working"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

