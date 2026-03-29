import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import Class from './src/models/Class.js';

dotenv.config({ path: './.env' });

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        
        const h_password = await bcrypt.hash("123456", 10);
        
        // Find Mythili (currently English_1_student1 but in Economics Dept)
        const student = await User.findOne({ realName: "Mythili S." });
        if (student) {
            const economicsClass = await Class.findOne({ department: "Economics", year: 2, section: "B" });
            const newRegNo = "Econ_SecB_2_302"; // Distinctive economics roll number

            await User.findByIdAndUpdate(student._id, { 
                username: newRegNo,
                password: h_password,
                registerNo: newRegNo,
                classId: economicsClass ? economicsClass._id : student.classId
            });

            console.log("\n--- UPDATED DEMO LOGIN ---");
            console.log("Mythili S. has been moved to Economics Department.");
            console.log(`New Username: ${newRegNo}`);
            console.log("Password: 123456");
        } else {
            console.log("Student Mythili S. not found in DB.");
        }

        process.exit();
    } catch (err) {
        console.error("FAIL:", err.message);
        process.exit(1);
    }
};

run();
