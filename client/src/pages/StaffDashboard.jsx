import { Box, Card, CardContent, Typography, Chip, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

/* ---------------- COMPONENT ---------------- */

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState("");
  const [departments, setDepartments] = useState([]);
  const [weeklyData, setWeeklyData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffStats = async () => {
      try {
        const response = await api.get("/staff/attendance/weekly");
        const { departments: depts, weeklyData: chartData } = response.data;
        
        setDepartments(depts || []);
        setWeeklyData(chartData || {});
        
        if (depts && depts.length > 0) {
          setSelectedDept(depts[0].name);
        }
      } catch (err) {
        console.error("Failed to fetch staff analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: "#38bdf8" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 4,
        bgcolor: "#0f172a",
        color: "#e5e7eb"
      }}
    >
      {/* TITLE */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h4" sx={{ mx: "auto" }}>
          Staff Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Chip 
             component="a" 
             href="https://docs.google.com/forms/d/e/1FAIpQLSc5nx1MVZzcT_-sVLZ3jacbm4Z4YJI5SkpmqbpHuCU3_ZJOig/viewform"
             target="_blank"
             rel="noreferrer"
             label="Mark via Google Form" 
             sx={{ 
                bgcolor: "#059669", 
                color: "#fff", 
                fontWeight: "bold", 
                cursor: "pointer", 
                px: 1, 
                py: 2, 
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": { bgcolor: "#10b981", transform: "scale(1.05)" } 
             }} 
          />
        </Box>
      </Box>

      {/* DEPARTMENT CARDS */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          justifyContent: "center",
          mb: 6,
          flexWrap: "wrap"
        }}
      >
        {departments.map((dept) => {
          const isSelected = selectedDept === dept.name;

          return (
            <Card
              key={dept.name}
              onClick={() => setSelectedDept(dept.name)}
              onDoubleClick={() =>
                navigate(`/staff/department/${dept.name}`)
              }
              sx={{
                width: 220,
                cursor: "pointer",
                textAlign: "center",
                background: isSelected
                  ? "linear-gradient(135deg, #0F766E, #059669)"
                  : "#111827",
                color: "#e5e7eb",
                border: isSelected
                  ? "2px solid rgba(6,182,212,0.6)"
                  : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 3,
                transition: "all 0.35s ease",
                "&:hover": {
                  background: isSelected
                    ? "linear-gradient(135deg, #059669, #10b981)"
                    : "linear-gradient(135deg, #0c1a30 0%, #132040 50%, #111827 100%)",
                  borderColor: isSelected ? 'rgba(16,185,129,0.7)' : 'rgba(56,189,248,0.45)',
                  boxShadow: isSelected
                    ? '0 10px 36px rgba(5,150,105,0.3)'
                    : '0 10px 36px rgba(56,189,248,0.15)',
                  transform: "translateY(-4px) scale(1.02)"
                }
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{dept.name}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Click to see Classes
                </Typography>

                {isSelected && (
                  <Chip
                    label="Selected"
                    size="small"
                    sx={{
                      mt: 1,
                      backgroundColor: "#bbdefb",
                      color: "#000"
                    }}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* ANALYTICS */}
      <Typography variant="h5" align="center" sx={{ mb: 2 }}>
        Weekly Attendance – {selectedDept} Department
      </Typography>

      <Card
        sx={{
          maxWidth: 1000,
          mx: "auto",
          p: 2,
          bgcolor: '#111827',
          border: '1px solid rgba(6,182,212,0.08)',
          borderRadius: 3,
          transition: 'all 0.35s ease',
          '&:hover': {
            background: 'linear-gradient(160deg, #0a1a24 0%, #0c2030 50%, #111827 100%)',
            borderColor: 'rgba(6,182,212,0.3)',
            boxShadow: '0 10px 36px rgba(6,182,212,0.12)'
          }
        }}
      >
        {weeklyData[selectedDept] ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={weeklyData[selectedDept]}>
              <XAxis dataKey="day" stroke="#aaa" />
              <YAxis stroke="#aaa" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111",
                  border: "1px solid #444",
                  color: "#fff"
                }}
              />
              <Line
                type="monotone"
                dataKey="percent"
                stroke="#06B6D4"
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Typography align="center" sx={{ p: 4 }}>No data available for this department</Typography>
        )}
      </Card>
    </Box>
  );
}
