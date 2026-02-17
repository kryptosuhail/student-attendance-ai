import mongoose from "mongoose";
import dotenv from "dotenv";
import Class from "./models/Class.js";
import Timetable from "./models/Timetable.js";

dotenv.config({ path: "../.env" });

await mongoose.connect(process.env.MONGO_URI);

const departmentSubjects = {
  Tamil: [
    "Tamil Literature",
    "Modern Tamil",
    "Tamil Grammar",
    "Classical Tamil"
  ],
  English: [
    "English Literature",
    "British Poetry",
    "American Literature",
    "Linguistics"
  ],
  History: [
    "World History",
    "Indian History",
    "Archaeology",
    "Political History"
  ],
  Economics: [
    "Micro Economics",
    "Macro Economics",
    "Banking",
    "Public Finance"
  ],
  "Computer Science": [
    "DBMS",
    "Operating Systems",
    "Computer Networks",
    "Artificial Intelligence"
  ],
  Mathematics: [
    "Algebra",
    "Calculus",
    "Statistics",
    "Discrete Mathematics"
  ],
  Physics: [
    "Quantum Physics",
    "Electronics",
    "Thermodynamics",
    "Mechanics"
  ],
  Chemistry: [
    "Organic Chemistry",
    "Inorganic Chemistry",
    "Physical Chemistry",
    "Analytical Chemistry"
  ]
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const seedTimetable = async () => {
  try {
    await Timetable.deleteMany(); // optional: clears old timetable

    const classes = await Class.find();

    let timetableData = [];

    for (const cls of classes) {
      const subjects = departmentSubjects[cls.department];

      if (!subjects) continue;

      for (const day of days) {
        for (let i = 0; i < 4; i++) {
          timetableData.push({
            classId: cls._id,
            staffId: null, // can update later
            subject: subjects[i],
            day: day,
            period: i + 1
          });
        }
      }
    }

    await Timetable.insertMany(timetableData);

    console.log("✅ Timetable seeded successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedTimetable();
