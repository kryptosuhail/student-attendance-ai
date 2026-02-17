import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "./models/User.js";
import Attendance from "./models/Attendance.js";
import Timetable from "./models/Timetable.js";

dotenv.config({ path: "../.env" });

await mongoose.connect(process.env.MONGO_URI);

try {
  console.log("🔄 Connected to DB");

  const students = await User.find({ role: "student" });
  console.log("👨‍🎓 Students found:", students.length);

  if (!students.length) {
    console.log("❌ No students found in database");
    process.exit();
  }

  const attendanceRecords = [];

  for (const student of students) {
    console.log("➡ Processing student:", student.username);

    if (!student.classId) {
      console.log("⚠ Student has no classId");
      continue;
    }

    const timetable = await Timetable.find({
      classId: student.classId
    });

    console.log("📅 Timetable entries:", timetable.length);

    if (!timetable.length) {
      console.log("⚠ No timetable for this class");
      continue;
    }

    const date = new Date();

    for (const periodData of timetable) {
      if (!periodData.staffId) {
        console.log("⚠ Missing staffId for subject:", periodData.subject);
        continue;
      }

      attendanceRecords.push({
        student: student._id,
        classId: student.classId,
        subject: periodData.subject,
        date,
        period: periodData.period,
        status: "Present",
        markedBy: periodData.staffId
      });
    }
  }

  console.log("📦 Records to insert:", attendanceRecords.length);

  if (attendanceRecords.length === 0) {
    console.log("❌ No records created. Check classId or timetable.");
    process.exit();
  }

  await Attendance.insertMany(attendanceRecords);

  console.log("✅ Attendance inserted successfully!");
  process.exit();

} catch (error) {
  console.error("❌ Error:", error);
  process.exit(1);
}
