import Attendance from "../models/Attendance.js";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";   // ✅ ADD THIS

/* ✅ Student Profile */
export const getStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .populate("classId");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
  user: {
    username: student.username,
    department: student.classId?.department || "N/A",
    year: student.classId?.year || "N/A",
    section: student.classId?.section || "N/A"
  }
});

  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message
    });
  }
};


/* ✅ Student Attendance List */
export const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({
      student: req.user._id
    })
      .select("subject date period status")
      .sort({ date: -1 });

    res.status(200).json({
      message: "Student attendance fetched",
      attendance
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendance",
      error: error.message
    });
  }
};

/* ✅ Attendance Summary */
export const getAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.user._id;

    const totalClasses = await Attendance.countDocuments({
      student: studentId
    });

    const presentCount = await Attendance.countDocuments({
      student: studentId,
      status: "Present"
    });

    const absentCount = totalClasses - presentCount;

    const percentage =
      totalClasses === 0
        ? 0
        : Math.round((presentCount / totalClasses) * 100);

    res.status(200).json({
      message: "Attendance summary fetched",
      totalClasses,
      present: presentCount,
      absent: absentCount,
      percentage
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendance summary",
      error: error.message
    });
  }
};

/* ✅ Student – Today’s Schedule (UI READY) */
export const getTodayStudentSchedule = async (req, res) => {
  try {
    const student = req.user;

    if (!student.classId) {
      return res.status(400).json({
        message: "Student is not assigned to any class"
      });
    }

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long"
    });

    const schedule = await Timetable.find({
      classId: student.classId,
      day: today
    })
      .populate("staffId", "username")
      .sort({ period: 1 });

    const formattedSchedule = schedule.map(item => ({
      period: item.period,
      subject: item.subject,
      staffName: item.staffId.username
    }));

    res.status(200).json({
      message: "Today's schedule fetched",
      schedule: formattedSchedule
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching student schedule",
      error: error.message
    });
  }
};

export const getWeeklyAttendanceAnalytics = async (req, res) => {
  try {
    const studentId = req.user._id;

    const result = await Attendance.aggregate([
      {
        $match: {
          student: studentId
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$date" }, // 1 = Sunday
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
            }
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const days = {
      1: "Sun",
      2: "Mon",
      3: "Tue",
      4: "Wed",
      5: "Thu",
      6: "Fri",
      7: "Sat"
    };

    const weekly = result.map(item => ({
      day: days[item._id],
      present: item.present,
      total: item.total
    }));

    res.status(200).json({
      message: "Weekly attendance analytics",
      weekly
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching weekly analytics",
      error: error.message
    });
  }
};