import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from "@mui/material";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use context to store role and token

  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    setErrorMsg("");
    try {
      const response = await api.post("/auth/login", { username, password });
      
      const { token, user } = response.data;
      
      // Ensure the selected role matches the user's actual role in the DB
      if (role && user.role !== role) {
        setErrorMsg(`You are registered as a ${user.role}, please select the correct role or leave it unselected.`);
        return;
      }

      login(user.role, token); // Store role & token in context/localStorage
      
      if (user.role === "student") navigate("/student");
      if (user.role === "staff") navigate("/staff");
      if (user.role === "management") navigate("/management");
      
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Login failed. Please check credentials.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
      }}
    >
      <Card sx={{ width: 420 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Login
          </Typography>

          {/* ROLE SELECTION (FIXED) */}
          {errorMsg && (
            <Typography color="error" variant="body2" align="center" sx={{ mb: 2 }}>
              {errorMsg}
            </Typography>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="role-label">Select Role</InputLabel>
            <Select
              labelId="role-label"
              value={role}
              label="Select Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="management">Management</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={!username || !password}
            onClick={handleLogin}
          >
            LOGIN
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
