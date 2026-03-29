import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

export const sendAttendanceAlert = async (student) => {
  // Logic from prompt - simplified calculation
  const needed = Math.ceil(
    (0.75 * 30 - // assuming 30 total classes as in prompt example
    ((student.overallAttendance / 100) * 30)) / 0.25
  );

  const mailOptions = {
    from: `"Attendance System" <${process.env.SMTP_USER}>`,
    to: student.email || `${student.username}@gmail.com`, // Fallback for testing if email field doesn't exist in model yet
    subject: 'Attendance Warning — Action Required',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;
        margin:auto;background:#0f172a;color:#e2e8f0;
        padding:32px;border-radius:12px;">
        <h2 style="color:#06B6D4;margin-bottom:8px;">
          Attendance Warning
        </h2>
        <p style="color:#94a3b8;margin-bottom:24px;">
          Student Attendance Management System
        </p>
        <p>Dear <strong>${student.username}</strong>,
        </p>
        <p>Your current attendance is 
          <strong style="color:#f87171;">
            ${student.overallAttendance}%
          </strong>, 
          which is below the required 75% threshold.
        </p>
        <div style="background:#1e293b;padding:16px;
          border-radius:8px;margin:20px 0;
          border-left:4px solid #f87171;">
          <p style="margin:0;">You need to attend 
            <strong style="color:#fbbf24;">
              ${needed > 0 ? needed : 0} more classes
            </strong> 
            consecutively to become eligible for exams.
          </p>
        </div>
        <p style="color:#4ade80;">
          💪 Start attending regularly from tomorrow. 
          Every class counts toward your eligibility.
        </p>
        <hr style="border-color:#334155;margin:24px 0;"/>
        <p style="font-size:12px;color:#64748b;">
          This is an automated alert from your institution's
          attendance management system.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`Alert sent to: ${student.username}`);
};
