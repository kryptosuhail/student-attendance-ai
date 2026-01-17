import express from "express";
import users from "../data/users.json" assert { type: "json" };

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password, role } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password && u.role === role
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    id: user.id,
    role: user.role,
    username: user.username
  });
});

export default router;
