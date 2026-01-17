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
          padding: { xs: 4, md: 6 },
          borderRadius: 3,
          textAlign: "center",
          maxWidth: 700,
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
            borderRadius: 2,
          }}
          onClick={() => navigate("/login")}
        >
          LOGIN
        </Button>
      </Box>
    </Box>
  );
}
