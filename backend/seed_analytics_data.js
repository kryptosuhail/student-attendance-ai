import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from './src/models/Attendance.js';
import Class from './src/models/Class.js';
import User from './src/models/User.js';

dotenv.config({ path: './.env' });

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        
        const classes = await Class.find({});
        const students = await User.find({ role: 'student' });
        const staff = await User.findOne({ role: 'staff' });

        console.log(`Generating 500 fake attendance records for ${classes.length} classes...`);

        const records = [];
        const daysToGenerate = 14; // Past 2 weeks
        const baseDate = new Date();

        for (let i = 0; i < 500; i++) {
            const randomClass = classes[Math.floor(Math.random() * classes.length)];
            const randomStudent = students.find(s => s.classId?.toString() === randomClass._id.toString()) || students[Math.floor(Math.random() * students.length)];
            
            const randomDayOffset = Math.floor(Math.random() * daysToGenerate);
            const date = new Date(baseDate);
            date.setDate(date.getDate() - randomDayOffset);
            
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;

            records.push({
                student: randomStudent._id,
                classId: randomClass._id,
                subject: "Analytics Test",
                date: date,
                period: Math.floor(Math.random() * 4) + 1,
                status: Math.random() > 0.15 ? "Present" : "Absent", // 85% attendance
                markedBy: staff._id
            });
        }

        await Attendance.insertMany(records);
        console.log("Success! Analytics charts should now show data.");
        process.exit();
    } catch (err) {
        console.error("FAIL:", err.message);
        process.exit(1);
    }
};

run();
