import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "./models/User.js";
import Class from "./models/Class.js";

dotenv.config({ path: "../.env" });

await mongoose.connect(process.env.MONGO_URI);

try {
  console.log("🔄 Seeding students...");

  const classes = await Class.find();

  if (classes.length === 0) {
    console.log("❌ No classes found. Seed classes first.");
    process.exit();
  }

  const studentsToInsert = [];

  for (const cls of classes) {
    for (let i = 1; i <= 10; i++) {
      const hashedPassword = await bcrypt.hash("123456", 10);

      studentsToInsert.push({
        username: `${cls.department}_${cls.year}_student${i}`,
        password: hashedPassword,
        role: "student",
        classId: cls._id
      });
    }
  }

  await User.insertMany(studentsToInsert);

  console.log("✅ 10 students per class inserted successfully");
  process.exit();

} catch (error) {
  console.error(error);
  process.exit(1);
}
