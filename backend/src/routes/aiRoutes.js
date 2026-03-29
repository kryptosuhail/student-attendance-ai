import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import protect from '../middleware/authMiddleware.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Apply protection to ALL routes in this file
router.use(protect);

// Helper to clean Gemini response
const cleanJSON = (text) =>
  text.trim().replace(/```json/g, '').replace(/```/g, '').trim();

// ROUTE 1: For StudentDashboard (Available to students)
router.post('/analyze', authorize('student'), async (req, res) => {
  try {
    const { studentName, overallAttendance, weeklyData } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an attendance advisor for a college system.
Student: ${studentName}, Overall attendance: ${overallAttendance}%.
Weekly pattern (Mon-Fri): ${JSON.stringify(weeklyData)}.
Return ONLY a raw JSON object with no markdown, no explanation:
{
  "risk_level": "Low" or "Medium" or "High",
  "suggestion": "one sentence advice for the student",
  "exam_eligible": true or false
}`;
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    try {
      const cleaned = cleanJSON(text);
      res.json(JSON.parse(cleaned));
    } catch (parseErr) {
      console.error("Gemini Parse Error:", parseErr, "Raw Text:", text);
      res.json({
        risk_level: overallAttendance < 75 ? "High" : "Low",
        suggestion: "Consistent attendance is key to exam success.",
        exam_eligible: overallAttendance >= 75
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTE 2: For StaffClass (Available to staff)
router.post('/analyze-class', authorize('staff'), async (req, res) => {
  try {
    const { department, section, students } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an attendance advisor for a college.
Department: ${department}, Section: ${section}.
Students and attendance: ${JSON.stringify(students)}.
Return ONLY a raw JSON object with no markdown, no explanation:
{
  "class_insight": "one sentence about overall class health",
  "students": [
    {
      "name": "student name",
      "risk_level": "Low" or "Medium" or "High",
      "exam_eligible": true or false
    }
  ]
}`;
    const result = await model.generateContent(prompt);
    const text = cleanJSON(result.response.text());
    res.json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTE 3: For ManagementDashboard (Available to management)
router.post('/analyze-management', authorize('management'), async (req, res) => {
  try {
    const { departments, collegeAverage } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an institutional attendance analyst.
College average attendance: ${collegeAverage}%.
Department data: ${JSON.stringify(departments)}.
Return ONLY a raw JSON object with no markdown, no explanation:
{
  "summary": "one sentence overall institutional assessment",
  "critical_departments": ["dept names below 75% only"],
  "suggestions": [
    "suggestion 1",
    "suggestion 2",
    "suggestion 3"
  ]
}`;
    const result = await model.generateContent(prompt);
    const text = cleanJSON(result.response.text());
    res.json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTE 4: Predictive "What-If" Analysis (Available to students)
router.post('/predict', authorize('student'), async (req, res) => {
  try {
    const { currentAttendance, absencesPlan, studentName } = req.body;
    
    // Local fallback calculation
    const totalSessions = 100; // assumed base
    const currentPresent = (currentAttendance / 100) * totalSessions;
    const newTotal = totalSessions + absencesPlan;
    const localPredicted = parseFloat(((currentPresent / newTotal) * 100).toFixed(1));
    const localEligible = localPredicted >= 75;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a student attendance predictor.
    Student Name: ${studentName}.
    Current Overall Attendance: ${currentAttendance}%.
    What if student misses ${absencesPlan} more lectures?
    Calculate their new attendance percentage and check if they stay above 75%.
    
    Return ONLY a raw JSON object:
    {
      "predicted_percentage": number,
      "is_eligible": true or false,
      "ai_advice": "one short clever sentence about the result"
    }`;

      const result = await model.generateContent(prompt);
      const text = cleanJSON(result.response.text());
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (aiErr) {
      console.error("Gemini predict error, using local fallback:", aiErr.message);
      res.json({
        predicted_percentage: localPredicted,
        is_eligible: localEligible,
        ai_advice: localEligible
          ? `With ${absencesPlan} more absences your attendance drops to ${localPredicted}% — still eligible, but stay careful.`
          : `Missing ${absencesPlan} more classes drops you to ${localPredicted}% — below the 75% eligibility threshold!`
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
