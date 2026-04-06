import Attendance from "../models/Attendance.js";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";
import Class from "../models/Class.js";

// same PERIOD_SLOTS used earlier
const PERIOD_SLOTS = [
  { period: 1, start: "09:00", end: "09:50" },
  { period: 2, start: "09:50", end: "10:40" },
  { period: 3, start: "10:40", end: "11:30" },
  { period: 4, start: "11:30", end: "12:20" }
];

export const markAttendanceLocked = async (req, res) => {
  try {
    const staffId = req.user._id;
    const now = new Date();

    const today = now.toLocaleDateString("en-US", { weekday: "long" });
    const dateOnly = new Date(now.toDateString());

    const currentTime =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");



    const { students, classId, subject, period } = req.body;

    const PERIOD_SLOTS = [
      { period: 1, start: "09:00", end: "09:50" },
      { period: 2, start: "09:50", end: "10:40" },
      { period: 3, start: "10:40", end: "11:30" },
      { period: 4, start: "11:30", end: "12:20" }
    ];
    const activeSlot = PERIOD_SLOTS.find(
      slot => currentTime >= slot.start && currentTime < slot.end
    );

    // Use passed period or default to 1 for testing if activeSlot is missing
    const activePeriod = period !== "N/A" ? period : (activeSlot ? activeSlot.period : 1);

    // 3️⃣ Prevent duplicate attendance
    const alreadyMarked = await Attendance.findOne({
      classId: classId,
      date: dateOnly,
      period: activePeriod
    });

    if (alreadyMarked) {
      return res.status(409).json({
        message: "Attendance already marked for this period"
      });
    }

    const records = students.map(s => ({
      student: s.studentId,
      status: s.status,
      classId: classId,
      subject: subject || "General",
      period: activePeriod,
      date: dateOnly,
      markedBy: staffId
    }));

    await Attendance.insertMany(records);

    res.status(201).json({
      message: "Attendance marked successfully",
      period: activePeriod
    });

  } catch (error) {
    res.status(500).json({
      message: "Error marking attendance",
      error: error.message
    });
  }
};

// Webhook for Google Forms Integration
export const markAttendanceGoogleForm = async (req, res) => {
  try {
    const { secret, staffUsername, department, year, section, subject, period, absentRegisterNos } = req.body;

    // A simple shared secret to verify the request comes from your Google Sheet Apps Script
    if (secret !== "ATTENDANCE_FORM_SECRET_123") {
      return res.status(401).json({ message: "Unauthorized webhook" });
    }

    const staff = await User.findOne({ username: staffUsername, role: "staff" });
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    const classDoc = await Class.findOne({ department, year: Number(year), section });
    if (!classDoc) return res.status(404).json({ message: "Class not found" });

    // Find all students in this class
    const allStudents = await User.find({ classId: classDoc._id, role: "student" });
    
    // Parse absent register numbers
    const absentArr = (absentRegisterNos || "")
      .split(",")
      .map(s => s.trim().toUpperCase())
      .filter(s => s);

    const now = new Date();
    const dateOnly = new Date(now.toDateString());

    const alreadyMarked = await Attendance.findOne({
      classId: classDoc._id,
      date: dateOnly,
      period: Number(period)
    });

    if (alreadyMarked) {
      return res.status(409).json({ message: "Attendance already marked for this period via Google Forms" });
    }

    const records = allStudents.map(student => ({
      student: student._id,
      status: absentArr.includes(student.registerNo?.toUpperCase()) ? "Absent" : "Present",
      classId: classDoc._id,
      subject: subject || "General",
      period: Number(period),
      date: dateOnly,
      markedBy: staff._id
    }));

    await Attendance.insertMany(records);

    res.status(201).json({ message: "Attendance synced from Google Form successfully!" });
  } catch (error) {
    console.error("Google Form Webhook Error:", error);
    res.status(500).json({ message: "Webhook error", error: error.message });
  }
};
