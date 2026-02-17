import express from "express";
import cors from "cors";

const app = express();

/* ✅ FIXED CORS */
app.use(cors({
  origin: "https://turbo-disco-r4wrwgqvjx9xcpjp5-5177.app.github.dev",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
