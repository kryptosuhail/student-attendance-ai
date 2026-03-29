import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config({ path: './.env' });

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        
        // 1. UPDATE STUDENT USERNAMES
        const students = await User.find({ role: 'student' });
        console.log(`Matching student usernames to their Register Numbers...`);

        for (let s of students) {
            if (s.registerNo) {
                // Ensure unique name (the registerNo IS unique)
                await User.findByIdAndUpdate(s._id, { username: s.registerNo });
            }
        }

        // 2. RE-SYNC DEMO USERS
        const demoStudent = await User.findOne({ realName: "Mythili S." });
        if (demoStudent) {
            await User.findByIdAndUpdate(demoStudent._id, { 
                username: "Economics_2_28",
                password: "password123" 
            });
        }

        const demoStaff = await User.findOne({ realName: "Dr. Saranya K." });
        if (demoStaff) {
            await User.findByIdAndUpdate(demoStaff._id, { 
                username: "demonstration_staff",
                password: "password123" 
            });
        }

        console.log("\n--- UPDATED DEMO CREDENTIALS ---");
        console.log("STAFF:");
        console.log("  Username: demonstration_staff (Password: password123)");
        
        console.log("\nSTUDENT:");
        console.log("  Username: Economics_2_28 (Password: password123)");
        console.log("  Note: All student login IDs are now their Register Numbers.");
        
        process.exit();
    } catch (err) {
        console.error("FAIL:", err.message);
        process.exit(1);
    }
};

run();
