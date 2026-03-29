import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config({ path: "./.env" });

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  const totalUsers = await User.countDocuments();
  console.log(`Total Users: ${totalUsers}`);
  
  const noClassStudents = await User.find({ role: "student", classId: null });
  console.log(`Students with NO classId: ${noClassStudents.length}`);
  
  if (noClassStudents.length > 0) {
    console.log(`Example students with NO classId:`, noClassStudents.slice(0,3).map(u => ({ username: u.username })));
  }
  
  process.exit();
};

run();
