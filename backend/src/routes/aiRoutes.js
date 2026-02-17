import express from "express";
import { getStudentAISuggestion } from "../controllers/aiController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Student AI Suggestions
 */
router.post("/student-suggestion", getStudentAISuggestion);

export default router;
