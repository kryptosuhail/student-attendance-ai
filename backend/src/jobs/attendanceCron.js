import cron from 'node-cron';
import { sendAttendanceAlert } from '../services/emailService.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';

// Runs every Monday at 8:00 AM
cron.schedule('0 8 * * 1', async () => {
  console.log('Running weekly attendance alert job...');
  try {
    const students = await User.find({ role: 'student' });
    
    let sent = 0;
    for (const student of students) {
      // Calculate overall attendance for the student
      const totalClasses = await Attendance.countDocuments({ student: student._id });
      const presentCount = await Attendance.countDocuments({ student: student._id, status: "Present" });
      const overallAttendance = totalClasses === 0 ? 0 : Math.round((presentCount / totalClasses) * 100);

      if (overallAttendance < 75) {
        try {
          await sendAttendanceAlert({ 
            ...student.toObject(), 
            overallAttendance 
          });
          sent++;
          // Small delay to avoid SMTP rate limits
          await new Promise(r => setTimeout(r, 500));
        } catch (err) {
          console.error(`Failed for ${student.username}:`, err.message);
        }
      }
    }
    console.log(`Weekly alert complete. Sent: ${sent} emails.`);
  } catch (err) {
    console.error('Cron job error:', err.message);
  }
});

console.log('Attendance alert cron job scheduled.');
