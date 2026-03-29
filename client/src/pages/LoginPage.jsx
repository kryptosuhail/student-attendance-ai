import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { ArrowBack } from "@mui/icons-material";
import { IconButton } from "@mui/material";
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

      login(user.role, token, user); // Store role, token, & full user object in context/localStorage
      
      if (user.role === "student") navigate("/student", { replace: true });
      if (user.role === "staff") navigate("/staff", { replace: true });
      if (user.role === "management") navigate("/management", { replace: true });
      
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
      <Card sx={{ 
        width: 420, position: 'relative', overflow: 'visible',
        transition: 'all 0.4s ease',
        '&:hover': {
          background: 'linear-gradient(160deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 50%, rgba(6,182,212,0.08) 100%)',
          borderColor: 'rgba(6,182,212,0.3)',
          boxShadow: '0 16px 64px rgba(6,182,212,0.15), 0 0 100px rgba(109,40,217,0.08)',
          transform: 'translateY(-4px)'
        }
      }}>
        {/* Back to Landing Button */}
        <IconButton 
          onClick={() => navigate("/")} 
          sx={{ 
            position: 'absolute', 
            top: -50, 
            left: 0, 
            color: '#fff',
            bgcolor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            '&:hover': { 
              background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(139,92,246,0.15))',
              boxShadow: '0 4px 20px rgba(56,189,248,0.3)',
              transform: 'scale(1.12)'
            }
          }}
        >
          <ArrowBack />
        </IconButton>

        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" align="center" sx={{ fontWeight: 800, mb: 3, color: '#fff' }}>
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
            sx={{
              background: 'linear-gradient(135deg, #06B6D4, #6D28D9)',
              fontWeight: 700, fontSize: 15,
              py: 1.5,
              boxShadow: '0 4px 20px rgba(6,182,212,0.25)',
              transition: 'all 0.35s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
                boxShadow: '0 8px 36px rgba(6,182,212,0.4), 0 0 60px rgba(109,40,217,0.15)',
                transform: 'translateY(-2px)'
              },
              '&.Mui-disabled': {
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            LOGIN
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
