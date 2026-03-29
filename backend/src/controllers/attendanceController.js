import Attendance from "../models/Attendance.js";
import Timetable from "../models/Timetable.js";

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
      staffId
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
