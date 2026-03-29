import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Class from './src/models/Class.js';
import User from './src/models/User.js';

dotenv.config({ path: './.env' });

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        
        const staff = await User.findOne({ role: 'staff' });
        if (!staff) throw new Error("No staff found!");

        // Update all existing classes to have this staff as Incharge
        const result = await Class.updateMany({}, { inchargeStaff: staff._id });
        console.log(`Success! Updated ${result.modifiedCount} classes with Incharge: ${staff.realName || staff.username}`);
        
        process.exit();
    } catch (err) {
        console.error("FAIL:", err.message);
        process.exit(1);
    }
};

run();
