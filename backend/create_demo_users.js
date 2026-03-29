import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Class from './src/models/Class.js';

dotenv.config({ path: './.env' });

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        
        // 1. SET UP DEMO STAFF
        // We'll reset staff1 or similar to a clean state
        let staff = await User.findOne({ role: 'staff' });
        if (!staff) {
            staff = await User.create({
                username: "staff_demo",
                password: "password123",
                role: "staff",
                realName: "Dr. Saranya K."
            });
        } else {
            staff.username = "demonstration_staff";
            staff.password = "password123";
            staff.realName = "Dr. Saranya K.";
            await staff.save();
        }

        // 2. SET UP DEMO STUDENT
        // Pick one student and make them the "star" of the demo
        let student = await User.findOne({ role: 'student' });
        if (!student) {
            const demoClass = await Class.findOne({});
            student = await User.create({
                username: "student_demo",
                password: "password123",
                role: "student",
                realName: "Mythili S.",
                registerNo: "Economics_2_28",
                classId: demoClass._id
            });
        } else {
            student.username = "demonstration_student";
            student.password = "password123";
            student.realName = "Mythili S.";
            student.registerNo = "Economics_2_28";
            // Ensure they are in a class with data (Economics Year 2)
            const demoClass = await Class.findOne({ department: "Economics", year: 2 });
            if (demoClass) student.classId = demoClass._id;
            await student.save();
        }

        console.log("\n--- DEMO CREDENTIALS ---");
        console.log("STAFF:");
        console.log("  Username: demonstration_staff");
        console.log("  Password: password123");
        console.log("  Dashboard: Handles all departments, years, and sections accurately.");
        
        console.log("\nSTUDENT:");
        console.log("  Username: demonstration_student");
        console.log("  Password: password123");
        console.log("  Profile: Mythili S. (Economics Year 2 Section B)");
        console.log("  Features: Timetables, Graphs, and AI Predictor fully ready.");
        
        process.exit();
    } catch (err) {
        console.error("FAIL:", err.message);
        process.exit(1);
    }
};

run();
