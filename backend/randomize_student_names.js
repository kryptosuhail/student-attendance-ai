import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Class from './src/models/Class.js';

dotenv.config({ path: './.env' });

const firstNames = [
    "Aditya", "Rajesh", "Sanjay", "Meera", "Ananya", "Vikram", "Priyanka", "Rohan", "Arjun", "Deepika",
    "Karthik", "Sowmya", "Haritha", "Gautam", "Ishwar", "Mohamed", "Ayesha", "Abdul", "Zoya", "Irshad",
];
const initials = ["S.", "K.", "R.", "A.", "M.", "V.", "P.", "D."];

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        
        const students = await User.find({ role: 'student' }).populate('classId');
        console.log(`Updating ${students.length} students with separate Name and RegNo...`);

        for (let i = 0; i < students.length; i++) {
            const first = firstNames[Math.floor(Math.random() * firstNames.length)];
            const initial = initials[Math.floor(Math.random() * initials.length)];
            
            const realName = `${first} ${initial}`;
            
            // Format: English_2_01
            const dept = (students[i].classId?.department || "General").replace(/\s+/g, "");
            const year = students[i].classId?.year || 1;
            const regNo = `${dept}_${year}_${(i + 1).toString().padStart(2, '0')}`;
            
            await User.findByIdAndUpdate(students[i]._id, {
                realName: realName,
                registerNo: regNo,
                // Keep username fixed for login stability (they can still login with old names or we can sync it)
            });

            if (i % 50 === 0) console.log(`Updated ${i}...`);
        }

        console.log("\nSuccess! Student Name and Register No are now separated and formatted.");
        process.exit();
    } catch (err) {
        console.error("FAIL:", err.message);
        process.exit(1);
    }
};

run();
