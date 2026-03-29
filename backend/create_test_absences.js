import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from './src/models/Attendance.js';
import User from './src/models/User.js';

dotenv.config({ path: './.env' });

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);

        const student = await User.findOne({ role: 'student' });
        if (!student) {
            console.log("No student found!");
            process.exit(1);
        }

        console.log(`Creating test absences for ${student.username}...`);

        // Create 20 "Absent" records for this student
        const absences = [];
        const baseDate = new Date();
        for (let i = 0; i < 20; i++) {
            absences.push({
                student: student._id,
                classId: student.classId || (await mongoose.model('Class').findOne())._id,
                subject: 'Trial Defaulter Sub',
                date: new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000),
                period: 1,
                status: 'Absent',
                markedBy: (await User.findOne({ role: 'staff' }))._id
            });
        }

        await Attendance.insertMany(absences);
        console.log(`Success! ${student.username} should now appear on the Defaulter List.`);
        process.exit();
    } catch (err) {
        console.error("FAIL:", err.message);
        process.exit(1);
    }
};

run();
