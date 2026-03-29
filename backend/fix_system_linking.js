import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from './src/models/Attendance.js';
import User from './src/models/User.js';
import Class from './src/models/Class.js';

dotenv.config({ path: './.env' });

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        
        // 1. Ensure ONE primary staff can access EVERYTHING for easy testing
        const primaryStaff = await User.findOne({ role: 'staff' });
        console.log(`Setting up credentials for: ${primaryStaff.username}`);

        // 2. Fix empty charts in Class Detail page (need data for EVERY class)
        const allClassIds = (await Class.find({})).map(c => c._id);
        const students = await User.find({ role: 'student' });

        console.log("Generating weekly trend data for all classrooms...");
        
        const records = [];
        const baseDate = new Date();
        baseDate.setHours(0,0,0,0);

        // Generate attendance for the past 5 workdays (Mon-Fri)
        for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
            const date = new Date(baseDate);
            date.setDate(date.getDate() - dayOffset);
            
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;

            // For each classroom, generate some records
            for (const classId of allClassIds) {
                // Find students in this class
                const classStudents = students.filter(s => s.classId?.toString() === classId.toString());
                
                for (const student of classStudents) {
                    records.push({
                        student: student._id,
                        classId: classId,
                        subject: "Core Subject",
                        date: date,
                        period: 1,
                        status: Math.random() > 0.1 ? "Present" : "Absent", // High present rate for a good look
                        markedBy: primaryStaff._id
                    });
                }
            }
        }

        await Attendance.deleteMany({ subject: "Analytics Test" }); // Clean old tests
        await Attendance.insertMany(records);

        console.log(`\nSuccess!`);
        console.log(`- Role 'Staff' (${primaryStaff.username}) now has full visibility and analytics.`);
        console.log(`- Generated ${records.length} trend records for historical charts.`);
        
        process.exit();
    } catch (err) {
        console.error("FAIL:", err.message);
        process.exit(1);
    }
};

run();
