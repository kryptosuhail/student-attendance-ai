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

        // Index classes by "Dept_Year_Section" (lowercase) for fast lookup
        const classMap = {};
        classes.forEach(c => {
            const key = `${c.department}_${c.year}_${c.section}`.toLowerCase().replace(/\s+/g, '');
            classMap[key] = c._id;
        });

        console.log(`Starting forced cleanup and reassignment for ${students.length} students...`);

        let matched = 0;
        let randomFix = 0;

        for (let s of students) {
            const regNo = s.registerNo || "";
            // Format: English_2_01 OR ComputerScience_3_10
            const parts = regNo.split('_'); 
            
            if (parts.length >= 3) {
                const dept = parts[0].toLowerCase().replace(/\s+/g, '');
                const year = parts[1];
                // Use the sequence number to assign A or B
                const seq = parseInt(parts[2]);
                const section = seq % 2 === 0 ? 'b' : 'a';
                
                const key = `${dept}_${year}_${section}`;
                let classId = classMap[key];

                // Exact department match fallback (if Dept name is "Computer Science" but regNo has "ComputerScience")
                if (!classId) {
                   const possibleKey = Object.keys(classMap).find(k => k.startsWith(dept) && k.includes(`_${year}_${section}`));
                   if (possibleKey) classId = classMap[possibleKey];
                }

                if (classId) {
                    await User.findByIdAndUpdate(s._id, { classId: classId });
                    matched++;
                } else {
                    // Worst case: Assign to ANY class that matches the department and year
                    const fallbackClass = classes.find(c => 
                        c.department.toLowerCase().replace(/\s+/g, '') === dept && 
                        c.year === parseInt(year)
                    );
                    if (fallbackClass) {
                        await User.findByIdAndUpdate(s._id, { classId: fallbackClass._id });
                        randomFix++;
                    }
                }
            }
        }

        console.log(`\nFinal Statistics:`);
        console.log(`- Perfectly Matched (Dept+Year+Section): ${matched}`);
        console.log(`- Fallback Assigned (Dept+Year only): ${randomFix}`);
        console.log(`- Unassigned: ${students.length - matched - randomFix}`);
        
        process.exit();
    } catch (err) {
        console.error("CRITICAL FAIL:", err.message);
        process.exit(1);
    }
};

run();
