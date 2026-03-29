import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Timetable from './src/models/Timetable.js';
import Class from './src/models/Class.js';
import User from './src/models/User.js';

dotenv.config({ path: './.env' });

const SUBJECT_MAP = {
    'Computer Science': [
        "Data Structures", "Database Management", "Web Development", "Artificial Intelligence", 
        "Machine Learning", "Operating Systems", "Networking", "Cyber Security"
    ],
    'English': [
        "Shakespearean Drama", "Victorian Poetry", "Modern English Prose", "Literary Criticism", 
        "Linguistics", "Rhetoric and Composition", "Communication Skills", "Classical Literatures"
    ],
    'Tamil': [
        "Sangam Literature", "Bhakti Literature", "Modern Poetry", "History of Tamil Language", 
        "Tamil Grammar", "Epics of Tamil", "Folklore", "Journalism in Tamil"
    ],
    'Economics': [
        "Microeconomics", "Macroeconomics", "International Trade", "Development Economics", 
        "Indian Economy", "Statistical Methods", "Public Finance", "History of Economic Thought"
    ],
    'History': [
        "Ancient Indian History", "Medieval Indian History", "Modern World History", "European History", 
        "Archaeology", "History of Architecture", "Political Science", "International Relations"
    ],
    'Tamil Heritage': [
       "Tamil Heritage and Culture", "History of Tamil Nadu", "Tamil Ethos"
    ],
    'Mathematics': [
        "Calculus", "Linear Algebra", "Real Analysis", "Abstract Algebra", 
        "Differential Equations", "Number Theory", "Probability & Statistics", "Numerical Methods"
    ],
    'Chemistry': [
       "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Analytical Chemistry", "Biochemistry"
    ],
    'Physics': [
       "Quantum Mechanics", "Electromagnetism", "Thermodynamics", "Optics", "Solid State Physics"
    ]
};

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        // Map staff into their departments based on their usernames (heuristic)
        const staff = await User.find({ role: 'staff' });
        const deptStaffMap = {};
        staff.forEach(s => {
           let dept = 'General';
           if (s.username.toLowerCase().includes('cs')) dept = 'Computer Science';
           else if (s.username.toLowerCase().includes('english')) dept = 'English';
           else if (s.username.toLowerCase().includes('tamil')) dept = 'Tamil';
           else if (s.username.toLowerCase().includes('hist')) dept = 'History';
           else if (s.username.toLowerCase().includes('math')) dept = 'Mathematics';
           else if (s.username.toLowerCase().includes('chem')) dept = 'Chemistry';
           else if (s.username.toLowerCase().includes('econ')) dept = 'Economics';

           if (!deptStaffMap[dept]) deptStaffMap[dept] = [];
           deptStaffMap[dept].push(s);
        });

        const timetables = await Timetable.find({}).populate('classId');
        console.log(`Found ${timetables.length} records. Re-assigning smartly...`);

        for (let i = 0; i < timetables.length; i++) {
            const t = timetables[i];
            const classDept = t.classId?.department || "English"; // Fallback
            
            // Pick subject from mapped department list or general list
            const possibleSubjects = SUBJECT_MAP[classDept] || SUBJECT_MAP['English'];
            const randomSubject = possibleSubjects[Math.floor(Math.random() * possibleSubjects.length)];

            // Try to find staff that matches department
            const matchedStaff = deptStaffMap[classDept] || staff; 
            const randomStaff = matchedStaff[Math.floor(Math.random() * matchedStaff.length)];
            
            await Timetable.findByIdAndUpdate(t._id, {
                subject: randomSubject,
                staffId: randomStaff._id
            });

            if (i % 50 === 0) console.log(`Smart updated ${i}...`);
        }

        console.log("\nSuccess! All subjects are now relevant to their specific departments.");
        process.exit();
    } catch (err) {
        console.error("FAIL:", err.message);
        process.exit(1);
    }
};

run();
