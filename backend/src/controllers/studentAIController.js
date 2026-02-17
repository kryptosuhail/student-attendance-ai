import { getStudentSuggestion } from "../services/geminiService.js";

export const getStudentAISuggestion = async (req, res) => {
  try {
    const { attendancePercentage } = req.body;

    const prompt = `
Student attendance is ${attendancePercentage}%.
Give short, practical advice for improvement.
`;

    const suggestion = await getStudentSuggestion(prompt);

    res.json({ suggestion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "AI suggestion failed" });
  }
};
