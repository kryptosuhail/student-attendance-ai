import { Box, Card, CardContent, Typography, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

/* ------------------ DATA ------------------ */

const departments = [
  { name: "CSE", section: "A" },
  { name: "ECE", section: "A" },
  { name: "EEE", section: "A" },
  { name: "MECH", section: "A" }
];

const weeklyData = {
  CSE: [
    { day: "Mon", percent: 82 },
    { day: "Tue", percent: 85 },
    { day: "Wed", percent: 80 },
    { day: "Thu", percent: 88 },
    { day: "Fri", percent: 90 }
  ],
  ECE: [
    { day: "Mon", percent: 78 },
    { day: "Tue", percent: 80 },
    { day: "Wed", percent: 76 },
    { day: "Thu", percent: 82 },
    { day: "Fri", percent: 84 }
  ],
  EEE: [
    { day: "Mon", percent: 70 },
    { day: "Tue", percent: 72 },
    { day: "Wed", percent: 68 },
    { day: "Thu", percent: 74 },
    { day: "Fri", percent: 76 }
  ],
  MECH: [
    { day: "Mon", percent: 85 },
    { day: "Tue", percent: 88 },
    { day: "Wed", percent: 84 },
    { day: "Thu", percent: 90 },
    { day: "Fri", percent: 92 }
  ]
};

/* ------------------ COMPONENT ------------------ */

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState("MECH");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 4,
        background: "radial-gradient(circle at top, #263238, #0f2027)",
        color: "#fff"
      }}
    >
      {/* TITLE */}
      <Typography variant="h4" align="center" sx={{ mb: 4 }}>
        Staff Dashboard
      </Typography>

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
                navigate(`/staff/class/${dept.name}/${dept.section}`)
              }
              sx={{
                width: 200,
                cursor: "pointer",
                textAlign: "center",
                background: isSelected
                  ? "linear-gradient(135deg, #2196f3, #1e88e5)"
                  : "linear-gradient(135deg, #111, #000)",
                color: "#fff",
                border: isSelected
                  ? "2px solid #90caf9"
                  : "1px solid #333",
                transition: "0.3s",
                "&:hover": {
                  transform: "scale(1.05)"
                }
              }}
            >
              <CardContent>
                <Typography variant="h6">{dept.name}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  II / III Year ({dept.section})
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
          background: "linear-gradient(135deg, #0a0a0a, #121212)",
          border: "1px solid #333"
        }}
      >
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
              stroke="#64b5f6"
              strokeWidth={3}
              dot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </Box>
  );
}
