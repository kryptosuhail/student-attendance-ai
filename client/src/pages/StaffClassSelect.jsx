import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  IconButton, 
  CircularProgress,
  Breadcrumbs,
  Link
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Class as ClassIcon } from "@mui/icons-material";
import api from "../utils/api";

export default function StaffClassSelect() {
  const { dept } = useParams();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get(`/staff/department/${dept}/classes`);
        setClasses(res.data.classes);
      } catch (err) {
        console.error("Failed to fetch classes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [dept]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: "#38bdf8" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f172a", color: "#fff", p: 4 }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/staff")} sx={{ 
          color: "#fff", bgcolor: "rgba(255,255,255,0.05)",
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(139,92,246,0.1))',
            boxShadow: '0 4px 16px rgba(56,189,248,0.2)',
            transform: 'scale(1.1)'
          }
        }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
            <Breadcrumbs sx={{ color: "#94a3b8", mb: 0.5 }}>
                <Link underline="hover" color="inherit" onClick={() => navigate("/staff")} sx={{ cursor: 'pointer' }}>
                    Dashboard
                </Link>
                <Typography color="text.primary" sx={{ color: "#fff" }}>{dept}</Typography>
            </Breadcrumbs>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Select Class</Typography>
        </Box>
      </Box>

      {classes.length === 0 ? (
        <Typography sx={{ color: "#94a3b8", textAlign: "center", mt: 10 }}>
          No classes found for this department.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {classes.map((cls) => (
            <Grid item xs={12} sm={6} md={6} lg={4} key={`${cls.year}-${cls.section}`}>
              <Card 
                onClick={() => navigate(`/staff/class/${dept}/${cls.year}/${cls.section}`)}
                sx={{ 
                  bgcolor: "rgba(255,255,255,0.03)", 
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 3,
                  minHeight: 190,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  transition: "all 0.35s ease",
                  "&:hover": { 
                    transform: "translateY(-5px)",
                    background: 'linear-gradient(135deg, #0c1a30 0%, #132040 50%, rgba(255,255,255,0.03) 100%)',
                    borderColor: 'rgba(56,189,248,0.5)',
                    boxShadow: '0 12px 40px rgba(56,189,248,0.15)',
                  }
                }}
              >
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 3.5, p: 4, width: "100%" }}>
                  <Box sx={{ 
                    width: 76, 
                    height: 76, 
                    borderRadius: 2, 
                    bgcolor: "#38bdf820", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    color: "#38bdf8"
                  }}>
                    <ClassIcon sx={{ fontSize: 38 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Year {cls.year}</Typography>
                    <Typography sx={{ color: "#94a3b8", fontWeight: 500, fontSize: 18 }}>Section {cls.section}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
