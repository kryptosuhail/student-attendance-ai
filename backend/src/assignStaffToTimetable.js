import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "./models/User.js";
import Timetable from "./models/Timetable.js";

dotenv.config({ path: "../.env" });

await mongoose.connect(process.env.MONGO_URI);

try {
  console.log("🔄 Assigning staff to timetable...");

  const staffMembers = await User.find({ role: "staff" });

  const timetables = await Timetable.find();

  for (const timetable of timetables) {
    const subject = timetable.subject;

    const matchedStaff = staffMembers.find(staff =>
      staff.subjects && staff.subjects.includes(subject)
    );

    if (matchedStaff) {
      timetable.staffId = matchedStaff._id;
      await timetable.save();
    }
  }

  console.log("✅ Staff assigned to timetable successfully");
  process.exit();

} catch (error) {
  console.error(error);
  process.exit(1);
}
