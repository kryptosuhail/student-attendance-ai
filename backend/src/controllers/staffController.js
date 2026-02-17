import Timetable from "../models/Timetable.js";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

/* 🔔 Period → Time mapping (adjust if needed) */
const PERIOD_SLOTS = [
  { period: 1, start: "09:00", end: "09:50" },
  { period: 2, start: "09:50", end: "10:40" },
  { period: 3, start: "10:40", end: "11:30" },
  { period: 4, start: "11:30", end: "12:20" }
];

const getTodayName = () =>
  ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
  [new Date().getDay()];

/* ===============================
   📅 Staff – Today’s Full Schedule
   =============================== */
export const getTodaySchedule = async (req, res) => {
  try {
    const today = getTodayName();

    const schedule = await Timetable.find({
      staffId: req.user._id,
      day: today
    }).populate("classId", "name");

    res.json({
      message: "Today's schedule fetched",
      schedule
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching schedule",
      error: error.message
    });
  }
};

/* ==================================
   ⏱️ Staff – Current Period Class
   ================================== */
export const getCurrentPeriodClass = async (req, res) => {
  try {
    const today = getTodayName();

    const now = new Date();
    const currentTime =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    const activeSlot = PERIOD_SLOTS.find(
      slot => currentTime >= slot.start && currentTime < slot.end
    );

    if (!activeSlot) {
      return res.json({
        message: "No active class right now",
        currentPeriod: null
      });
    }

    const currentClass = await Timetable.findOne({
      staffId: req.user._id,
      day: today,
      period: activeSlot.period
    })
      .populate("classId", "name")
      .populate("staffId", "username");

    if (!currentClass) {
      return res.json({
        message: "No class assigned for current period",
        currentPeriod: activeSlot.period
      });
    }

    res.json({
      message: "Current period class fetched",
      currentPeriod: activeSlot.period,
      subject: currentClass.subject,
      className: currentClass.classId.name,
      staffName: currentClass.staffId.username
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching current period",
      error: error.message
    });
  }
};

/* =========================================
   📊 Staff – Class Attendance Summary (Today)
   ========================================= */
export const getClassAttendanceSummary = async (req, res) => {
  try {
    const today = getTodayName();

    const classesToday = await Timetable.find({
      staffId: req.user._id,
      day: today
    }).populate("classId", "name");

    if (!classesToday.length) {
      return res.json({
        message: "No classes for today",
        summary: []
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const summary = await Promise.all(
      classesToday.map(async (cls) => {
        const total = await Attendance.countDocuments({
          classId: cls.classId._id,
          date: { $gte: startOfDay }
        });

        const present = await Attendance.countDocuments({
          classId: cls.classId._id,
          status: "Present",
          date: { $gte: startOfDay }
        });

        return {
          className: cls.classId.name,
          subject: cls.subject,
          totalStudents: total,
          present,
          absent: total - present
        };
      })
    );

    res.json({
      message: "Class attendance summary fetched",
      summary
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching class attendance summary",
      error: error.message
    });
  }
};

/* =========================================
   🚨 Staff – Low Attendance Students (Risk)
   ========================================= */
export const getLowAttendanceStudents = async (req, res) => {
  try {
    const RISK_PERCENTAGE = 75;
    const today = getTodayName();

    const classesToday = await Timetable.find({
      staffId: req.user._id,
      day: today
    });

    if (!classesToday.length) {
      return res.json({
        message: "No classes for today",
        students: []
      });
    }

    const classIds = classesToday.map(c => c.classId);

    const result = await Attendance.aggregate([
      {
        $match: {
          classId: { $in: classIds }
        }
      },
      {
        $group: {
          _id: "$student",
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
          percentage: {
            $round: [
              { $multiply: [{ $divide: ["$present", "$total"] }, 100] },
              0
            ]
          }
        }
      },
      {
        $match: {
          percentage: { $lt: RISK_PERCENTAGE }
        }
      }
    ]);

    const students = await Promise.all(
      result.map(async (r) => {
        const student = await User.findById(r._id).select("username");
        return {
          studentId: r._id,
          name: student?.username || "Student",
          attendancePercentage: r.percentage
        };
      })
    );

    res.json({
      message: "Low attendance students fetched",
      threshold: RISK_PERCENTAGE,
      count: students.length,
      students
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching low attendance students",
      error: error.message
    });
  }
};

/* =========================================
   🟢 Staff – Overall Attendance (Pie Chart)
   ========================================= */
export const getOverallAttendanceSummary = async (req, res) => {
  try {
    const today = getTodayName();

    const now = new Date();
    const currentTime =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    const activeSlot = PERIOD_SLOTS.find(
      slot => currentTime >= slot.start && currentTime < slot.end
    );

    if (!activeSlot) {
      return res.json({ present: 0, absent: 0, percentage: 0 });
    }

    const currentClass = await Timetable.findOne({
      staffId: req.user._id,
      day: today,
      period: activeSlot.period
    });

    if (!currentClass) {
      return res.json({ present: 0, absent: 0, percentage: 0 });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const total = await Attendance.countDocuments({
      classId: currentClass.classId,
      date: { $gte: startOfDay }
    });

    const present = await Attendance.countDocuments({
      classId: currentClass.classId,
      status: "Present",
      date: { $gte: startOfDay }
    });

    const absent = total - present;
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

    res.json({
      present,
      absent,
      percentage
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching overall attendance",
      error: error.message
    });
  }
};
