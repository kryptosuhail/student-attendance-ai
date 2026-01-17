import { Box, Card, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const classes = [
  { dept: "CSE", section: "A" },
  { dept: "CSE", section: "B" },
  { dept: "ECE", section: "A" },
];

export default function Staff() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", p: 4, bgcolor: "#0f172a", color: "white" }}>
      <Typography variant="h4" mb={3}>Staff Dashboard</Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 3,
        }}
      >
        {classes.map((c, i) => (
          <Card
            key={i}
            sx={{
              bgcolor: "#020617",
              color: "white",
              cursor: "pointer",
              "&:hover": { bgcolor: "#1e293b" },
            }}
            onClick={() => navigate(`/staff/class/${c.dept}/${c.section}`)}
          >
            <CardContent>
              <Typography variant="h6">{c.dept}</Typography>
              <Typography>Section {c.section}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
