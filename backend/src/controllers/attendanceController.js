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

    // 1️⃣ Detect active period
    const activeSlot = PERIOD_SLOTS.find(
      slot => currentTime >= slot.start && currentTime < slot.end
    );

    if (!activeSlot) {
      return res.status(403).json({
        message: "Attendance locked – no active period"
      });
    }

    // 2️⃣ Confirm staff is teaching now
    const currentClass = await Timetable.findOne({
      staffId,
      day: today,
      period: activeSlot.period
    });

    if (!currentClass) {
      return res.status(403).json({
        message: "You are not assigned to this period"
      });
    }

    // 3️⃣ Prevent duplicate attendance
    const alreadyMarked = await Attendance.findOne({
      classId: currentClass.classId,
      date: dateOnly,
      period: activeSlot.period
    });

    if (alreadyMarked) {
      return res.status(409).json({
        message: "Attendance already marked for this period"
      });
    }

    // 4️⃣ Proceed (frontend sends student list)
    const { students } = req.body;

    const records = students.map(s => ({
      student: s.studentId,
      status: s.status,
      classId: currentClass.classId,
      subject: currentClass.subject,
      period: activeSlot.period,
      date: dateOnly,
      staffId
    }));

    await Attendance.insertMany(records);

    res.status(201).json({
      message: "Attendance marked successfully",
      period: activeSlot.period
    });

  } catch (error) {
    res.status(500).json({
      message: "Error marking attendance",
      error: error.message
    });
  }
};
