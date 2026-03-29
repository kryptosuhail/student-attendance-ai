import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Class from './src/models/Class.js';
import Timetable from './src/models/Timetable.js';

dotenv.config({ path: './.env' });

const DEPARTMENTS = [
    'Computer Science', 'English', 'Tamil', 'Economics', 'History', 'Mathematics', 'Chemistry', 'Physics'
];

const SUBJECT_MAP = {
    'Computer Science': ["Data Structures", "DBMS", "Web Dev", "AI", "ML", "OS", "Networking", "Cyber Security"],
    'English': ["Shakespeare", "Victorian Poetry", "Modern Prose", "Criticism", "Linguistics", "Rhetoric", "Communication", "Classical Lit"],
    'Tamil': ["Sangam Lit", "Bhakti Lit", "Modern Poetry", "History of Tamil", "Grammar", "Tamil Epics", "Folklore", "Journalism"],
    'Economics': ["Micro", "Macro", "Intl Trade", "Development", "Indian Economy", "Statistics", "Finance", "Economic Thought"],
    'History': ["Ancient India", "Medieval India", "Modern World", "European History", "Archaeology", "Architecture", "Pol Science", "Intl Relations"],
    'Mathematics': ["Calculus", "Linear Algebra", "Real Analysis", "Algebra", "Diff Equations", "Number Theory", "Probability", "Numerical"],
    'Chemistry': ["Organic", "Inorganic", "Physical", "Analytical", "Biochemistry"],
    'Physics': ["Quantum", "Electromagnetism", "Thermodynamics", "Optics", "Solid State"]
};

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        
        const staff = await User.findOne({ role: 'staff' });
        if (!staff) throw new Error("No staff user found to assign classes to!");

        console.log(`Using staff: ${staff.username} for all classes.`);

        // 1. CLEAR existing classes and timetables to avoid mess
        await Class.deleteMany({});
        await Timetable.deleteMany({});
        console.log("Cleared old data.");

        // 2. CREATE classes for EVERY department, EVERY year (1-3), and SECTION (A, B)
        const years = [1, 2, 3];
        const sections = ['A', 'B'];

        for (const dept of DEPARTMENTS) {
            console.log(`Creating classes for ${dept}...`);
            for (const year of years) {
                for (const section of sections) {
                    const newClass = await Class.create({
                        department: dept,
                        year: year,
                        section: section,
                        students: [] // Users will be linked via classId in User model
                    });

                    // 3. CREATE Timetable for this class
                    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
                    const subjects = SUBJECT_MAP[dept] || SUBJECT_MAP['English'];

                    for (const day of days) {
                        for (let period = 1; period <= 4; period++) {
                            const subject = subjects[Math.floor(Math.random() * subjects.length)];
                            await Timetable.create({
                                classId: newClass._id,
                                staffId: staff._id,
                                day: day,
                                period: period,
                                subject: subject
                            });
                        }
                    }
                    
                    // 4. Update existing students to this class (round robin)
                    // (Skipping for now to keep it clean, but you'll see empty classes if we don't)
                }
            }
        }

        // 5. RE-LINK students to these new classes (just a few per class so they show up)
        const students = await User.find({ role: 'student' });
        const allNewClasses = await Class.find({});
        console.log(`Linking ${students.length} students to ${allNewClasses.length} classes...`);

        for (let i = 0; i < students.length; i++) {
            const assignedClass = allNewClasses[i % allNewClasses.length];
            await User.findByIdAndUpdate(students[i]._id, { classId: assignedClass._id });
        }

        console.log("\nSuccess! Database fully populated with complete Dept/Year/Section hierarchy.");
        process.exit();
    } catch (err) {
        console.error("FAIL:", err.message);
        process.exit(1);
    }
};

run();
