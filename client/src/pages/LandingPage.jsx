import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage:
          "url(https://images.unsplash.com/photo-1588072432836-e10032774350)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Dark overlay */}
      <Box
        sx={{
          backgroundColor: "rgba(0,0,0,0.65)",
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: { xs: 4, md: 6 },
          borderRadius: 3,
          textAlign: "center",
          maxWidth: 700,
          transition: 'all 0.4s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.85) 50%, rgba(6,182,212,0.15) 100%)',
            borderColor: 'rgba(56,189,248,0.3)',
            boxShadow: '0 16px 64px rgba(6,182,212,0.2), 0 0 120px rgba(109,40,217,0.1)',
            transform: 'translateY(-4px) scale(1.01)'
          }
        }}
      >
        <Typography
          variant="h3"
          fontWeight="bold"
          color="white"
          gutterBottom
        >
          Student Attendance Tracker
        </Typography>

        <Typography
          variant="h6"
          sx={{ color: "rgba(255,255,255,0.85)", mb: 4 }}
        >
          AI‑powered attendance management system for students, staff, and
          management
        </Typography>

        <Button
          variant="contained"
          size="large"
          sx={{
            px: 6,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 700,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #06B6D4, #6D28D9)',
            boxShadow: '0 4px 20px rgba(6,182,212,0.3)',
            transition: 'all 0.35s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
              boxShadow: '0 8px 36px rgba(6,182,212,0.45), 0 0 60px rgba(109,40,217,0.2)',
              transform: 'translateY(-3px) scale(1.05)'
            }
          }}
          onClick={() => navigate("/login")}
        >
          LOGIN
        </Button>
      </Box>
    </Box>
  );
}
