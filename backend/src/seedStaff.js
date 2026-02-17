import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "./models/User.js";

dotenv.config({ path: "../.env" });

await mongoose.connect(process.env.MONGO_URI);

try {
  console.log("🔄 Seeding staff...");

  const hashedPassword = await bcrypt.hash("123456", 10);

  const staffMembers = [
    {
      username: "cs_staff_1",
      password: hashedPassword,
      role: "staff",
      subjects: ["DBMS", "Operating Systems"]
    },
    {
      username: "cs_staff_2",
      password: hashedPassword,
      role: "staff",
      subjects: ["Computer Networks", "Artificial Intelligence"]
    },
    {
      username: "tamil_staff",
      password: hashedPassword,
      role: "staff",
      subjects: [
        "Tamil Literature",
        "Modern Tamil",
        "Tamil Grammar",
        "Classical Tamil"
      ]
    },
    {
      username: "english_staff",
      password: hashedPassword,
      role: "staff",
      subjects: [
        "English Literature",
        "British Poetry",
        "American Literature",
        "Linguistics"
      ]
    }
  ];

  await User.insertMany(staffMembers);

  console.log("✅ Staff seeded successfully");
  process.exit();

} catch (error) {
  console.error(error);
  process.exit(1);
}
