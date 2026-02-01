import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

/* -------- MIDDLEWARE -------- */
app.use(cors());
app.use(express.json());

/* -------- TEST ROOT -------- */
app.get("/", (req, res) => {
  res.send("API running...");
});

/* -------- TEMP TEST ROUTE -------- */
app.post("/test-register", (req, res) => {
  console.log("BODY RECEIVED:", req.body);

  res.status(200).json({
    message: "Test route working",
    body: req.body
  });
});

/* -------- AUTH ROUTES -------- */
app.use("/api/auth", authRoutes);

/* -------- START SERVER -------- */
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
