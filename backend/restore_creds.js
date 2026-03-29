import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

dotenv.config({ path: './.env' });

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        
        // 1. RE-SYNC STAFF CREDENTIALS
        const h_password = await bcrypt.hash("123456", 10);
        
        const staff = await User.findOne({ role: 'staff' });
        if (staff) {
            await User.findByIdAndUpdate(staff._id, { 
                username: "staff1",
                password: h_password,
                realName: "Dr. Saranya"
            });
            console.log("Updated Staff: staff1 / 123456");
        }

        // 2. RE-SYNC STUDENT CREDENTIALS
        const student = await User.findOne({ role: 'student' });
        if (student) {
            await User.findByIdAndUpdate(student._id, { 
                username: "English_1_student1",
                password: h_password,
                realName: "Mythili S.",
                registerNo: "English_1_student1"
            });
            console.log("Updated Student: English_1_student1 / 123456");
        }

        console.log("\n--- READY FOR LOGIN ---");
        process.exit();
    } catch (err) {
        console.error("FAIL:", err.message);
        process.exit(1);
    }
};

run();
