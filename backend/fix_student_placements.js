import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Class from './src/models/Class.js';

dotenv.config({ path: './.env' });

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        
        const students = await User.find({ role: 'student' });
        const classes = await Class.find({});

        // Create a lookup for classes by Dept, Year, Section
        const classMap = {};
        classes.forEach(c => {
            const key = `${c.department}_${c.year}_${c.section}`.toLowerCase();
            classMap[key] = c._id;
        });

        console.log(`Matching ${students.length} students to their correct classrooms...`);

        let matched = 0;
        let fallback = 0;

        for (let s of students) {
            // My previous script generated registerNo as English_2_01
            // We can use this to map them correctly!
            const regNo = s.registerNo || "";
            const parts = regNo.split('_'); // [English, 2, 01]
            
            if (parts.length >= 2) {
                const dept = parts[0];
                const year = parts[1];
                
                // Section logic: If regNo was built with round-robin, some students should be A, some B
                // Let's use the sequence number to alternate sections
                const sequenceNum = parseInt(parts[2] || "1");
                const section = sequenceNum % 2 === 0 ? 'B' : 'A';
                
                const key = `${dept}_${year}_${section}`.toLowerCase();
                const classId = classMap[key] || classMap[`${dept}_${year}_a`.toLowerCase()];
                
                if (classId) {
                    await User.findByIdAndUpdate(s._id, { classId: classId });
                    matched++;
                } else {
                    fallback++;
                }
            }
        }

        console.log(`\nSuccess!`);
        console.log(`- Matched: ${matched} students to their specific department/year/section.`);
        console.log(`- Fallback: ${fallback} (kept in general pool or not found).`);
        process.exit();
    } catch (err) {
        console.error("FAIL:", err.message);
        process.exit(1);
    }
};

run();
