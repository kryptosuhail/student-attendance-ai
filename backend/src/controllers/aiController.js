import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getStudentAISuggestion = async (req, res) => {
  try {
    const { attendancePercentage } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are an academic advisor.
A student has an attendance of ${attendancePercentage}%.
Give 3 short actionable suggestions to improve academic performance.
Keep it simple and student-friendly.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ suggestion: text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ message: "AI suggestion failed" });
  }
};
