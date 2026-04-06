import Timetable from "../models/Timetable.js";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import Class from "../models/Class.js";

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

/* =========================================
   📈 Staff – Weekly Analytics per Dept
   ========================================= */
export const getStaffWeeklyAnalytics = async (req, res) => {
  try {
    const classes = await Timetable.find({ staffId: req.user._id }).populate("classId");
    
    // Get unique departments the staff teaches
    const departmentsList = [...new Set(classes.map(c => c.classId.department))];
    
    const weeklyData = {};
    const daysMap = { 1: "Sun", 2: "Mon", 3: "Tue", 4: "Wed", 5: "Thu", 6: "Fri", 7: "Sat" };

    for (const dept of departmentsList) {
      const deptClassIds = classes.filter(c => c.classId.department === dept).map(c => c.classId._id);
      
      const result = await Attendance.aggregate([
        { $match: { classId: { $in: deptClassIds } } },
        {
          $group: {
             _id: { $dayOfWeek: "$date" },
             total: { $sum: 1 },
             present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } }
          }
        },
        { $sort: { "_id": 1 } }
      ]);
      
      const chartData = [
         { day: "Mon", percent: 0 },
         { day: "Tue", percent: 0 },
         { day: "Wed", percent: 0 },
         { day: "Thu", percent: 0 },
         { day: "Fri", percent: 0 }
      ];
      
      result.forEach(item => {
         const dayName = daysMap[item._id];
         const dayObj = chartData.find(d => d.day === dayName);
         if (dayObj) {
            dayObj.percent = Math.round((item.present / item.total) * 100);
         }
      });
      
      weeklyData[dept] = chartData;
    }

    const uniqueDepts = [...new Set(classes.map(c => c.classId?.department || "General"))];
    const departmentCards = uniqueDepts.map(name => ({ name }));

    res.json({
      departments: departmentCards,
      weeklyData
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching staff analytics", error: error.message });
  }
};

/* =========================================
   🎓 Staff – Class Details & Students
   ========================================= */
export const getStaffClassDetails = async (req, res) => {
  try {
    const { dept, year, section } = req.params;

    // Use regex to loosely match Class
    let classInfo = await Class.findOne({ 
      department: new RegExp(`^${dept}$`, "i"),
      year: parseInt(year),
      section: new RegExp(`^${section}$`, "i")
    });

    if (!classInfo) {
      return res.status(404).json({ message: "Class not found" });
    }

    // NEW: Populate incharge info
    await classInfo.populate("inchargeStaff", "realName username");

    // Fetch students dynamically from User collection
    const classStudents = await User.find({ classId: classInfo._id, role: "student" });

    // 1. Fetch ALL attendance for this class (for total percentage)
    const allAttendances = await Attendance.find({ classId: classInfo._id });

    // 2. Define start of current week for the 'weekly' snapshot
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const students = classStudents.map(s => {
      // Overall percentage logic
      const studentAllAtt = allAttendances.filter(a => a.student.toString() === s._id.toString());
      const totalOverall = studentAllAtt.length;
      const presentOverall = studentAllAtt.filter(a => a.status === "Present").length;

      // Current week trend logic
      const weekly = [0, 0, 0, 0, 0];
      const studentWeeklyAtt = studentAllAtt.filter(a => new Date(a.date) >= startOfWeek);
      
      studentWeeklyAtt.forEach(a => {
        const d = new Date(a.date).getDay();
        if (d >= 1 && d <= 5) {
          // If they were present at least once in any period on that day, show as 1
          if (a.status === "Present") weekly[d-1] = 1;
        }
      });

      return {
        studentId: s._id,
        roll: s.registerNo || s.username,
        name: s.realName || s.username,
        present: true, 
        weekly,
        percent: totalOverall === 0 ? 100 : Math.round((presentOverall / totalOverall) * 100),
      };
    });

    // Find if this staff is actually teaching this class right now
    const now = new Date();
    const today = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][now.getDay()];
    const currentTime = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
    const PERIOD_SLOTS = [
      { period: 1, start: "09:00", end: "09:50" },
      { period: 2, start: "09:50", end: "10:40" },
      { period: 3, start: "10:40", end: "11:30" },
      { period: 4, start: "11:30", end: "12:20" }
    ];
    let activeSlot = PERIOD_SLOTS.find(slot => currentTime >= slot.start && currentTime < slot.end);

    let currentSubject = "N/A";
    let currentPeriod = "N/A";
    // DEFAULT: Class Incharge
    let activeStaffName = classInfo.inchargeStaff?.realName || classInfo.inchargeStaff?.username || "No Incharge";

    if (activeSlot) {
      const currentTimetable = await Timetable.findOne({
        day: today,
        period: activeSlot.period,
        classId: classInfo._id
      }).populate("staffId", "realName username");

      if (currentTimetable) {
        currentSubject = currentTimetable.subject;
        currentPeriod = activeSlot.period;
        // IF someone is teaching NOW, show them instead
        if (currentTimetable.staffId) {
            activeStaffName = currentTimetable.staffId.realName || currentTimetable.staffId.username;
        }
      }
    }

    res.json({
      department: classInfo.department || dept,
      year: classInfo.year || year,
      section: classInfo.section || section || "A",
      classId: classInfo._id,
      staffName: activeStaffName,
      subject: currentSubject,
      period: currentPeriod,
      totalStudents: students.length,
      students
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching class details", error: error.message });
  }
};

/* ✅ Staff – Full Weekly Timetable */
export const getStaffFullTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.find({ staffId: req.user._id })
      .populate("classId", "department section year")
      .sort({ day: 1, period: 1 });

    res.status(200).json({ timetable });
  } catch (error) {
    res.status(500).json({ message: "Error fetching staff timetable", error: error.message });
  }
};

/* =========================================
   🏢 Staff – All Classes in a Department
   ========================================= */
export const getDepartmentClasses = async (req, res) => {
  try {
    const { dept } = req.params;
    
    const classes = await Timetable.find({ 
      staffId: req.user._id 
    }).populate("classId");

    const deptClasses = classes
      .filter(c => c.classId?.department.toLowerCase() === dept.toLowerCase())
      .map(c => ({
        id: c.classId._id,
        year: c.classId.year,
        section: c.classId.section,
        department: c.classId.department
      }));

    const unique = [];
    const seen = new Set();
    deptClasses.forEach(c => {
       const key = `${c.year}-${c.section}`;
       if (!seen.has(key)) {
          seen.add(key);
          unique.push(c);
       }
    });

    res.json({ classes: unique.sort((a,b) => a.year - b.year || a.section.localeCompare(b.section)) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching department classes", error: error.message });
  }
};
