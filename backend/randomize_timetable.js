import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Timetable from './src/models/Timetable.js';
import Class from './src/models/Class.js';
import User from './src/models/User.js';

dotenv.config({ path: './.env' });

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Updating Timetables...");

        const subjects = [
            "Data Analytics", "Mobile App Dev", "Cloud Computing", "AI Fundamentals", 
            "Internet of Things", "Cyber Security", "Distributed Systems", "Software Design"
        ];
        const staffList = await User.find({ role: 'staff' }).select('_id username');
        
        if (staffList.length < 1) {
            console.log("No staff found to assign!");
            process.exit(1);
        }

        const timetables = await Timetable.find({});
        console.log(`Found ${timetables.length} records to update...`);

        for (let i = 0; i < timetables.length; i++) {
            const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
            const randomStaff = staffList[Math.floor(Math.random() * staffList.length)];
            
            await Timetable.findByIdAndUpdate(timetables[i]._id, {
                subject: randomSubject,
                staffId: randomStaff._id
            });

            if (i % 50 === 0) console.log(`Updated ${i}...`);
        }

        console.log("Successfully randomized all timetable entries!");
        process.exit();
    } catch (err) {
        console.error("FAIL:", err.message);
        process.exit(1);
    }
};

run();
