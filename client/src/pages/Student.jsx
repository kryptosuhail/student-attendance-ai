import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Divider,
} from "@mui/material";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import html2pdf from "html2pdf.js";

/* ====================== MOCK DATA ====================== */

const student = {
  name: "Mythili R",
  regNo: "21CS045",
  department: "CSE",
  year: "3rd Year",
};

const attendanceTable = [
  { date: "01-01-2026", status: "Present" },
  { date: "02-01-2026", status: "Absent" },
  { date: "03-01-2026", status: "Present" },
  { date: "04-01-2026", status: "Present" },
  { date: "05-01-2026", status: "Absent" },
  { date: "06-01-2026", status: "Present" },
];

const pieData = [
  { name: "Present", value: 4 },
  { name: "Absent", value: 2 },
];

const barData = attendanceTable.map((d) => ({
  date: d.date.slice(0, 5),
  value: d.status === "Present" ? 1 : 0,
}));

const schedule = [
  { subject: "AI", time: "09:00 - 10:00" },
  { subject: "DBMS", time: "11:00 - 12:00" },
  { subject: "ML", time: "02:00 - 03:00" },
];

const COLORS = ["#22c55e", "#ef4444"];

/* ====================== STYLES ====================== */

const cardStyle = {
  backgroundColor: "#111827",
  color: "#e5e7eb",
  borderRadius: 3,
  boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
};

/* ====================== COMPONENT ====================== */

export default function Student() {
  const exportPDF = () => {
    const element = document.getElementById("student-dashboard");
    html2pdf().from(element).save("Student_Attendance_Report.pdf");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #020617)",
        p: 3,
      }}
    >
      <Box id="student-dashboard">
        {/* HEADER */}
        <Typography
          variant="h4"
          fontWeight="bold"
          mb={3}
          color="#e5e7eb"
        >
          🎓 Student Dashboard
        </Typography>

        {/* STUDENT INFO */}
        <Card sx={{ ...cardStyle, mb: 3 }}>
          <CardContent>
            <Typography variant="h6">{student.name}</Typography>
            <Typography>Register No: {student.regNo}</Typography>
            <Typography>Department: {student.department}</Typography>
            <Typography>Year: {student.year}</Typography>
          </CardContent>
        </Card>

        {/* SUMMARY CARDS */}
        <Grid container spacing={2} mb={3}>
          {[
            { label: "Working Days", value: 6 },
            { label: "Present", value: 4 },
            { label: "Absent", value: 2 },
            { label: "Attendance %", value: "67%" },
          ].map((item, i) => (
            <Grid item xs={12} md={3} key={i}>
              <Card sx={cardStyle}>
                <CardContent>
                  <Typography color="#9ca3af">
                    {item.label}
                  </Typography>
                  <Typography variant="h5">
                    {item.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CHARTS + RIGHT PANEL */}
        <Grid container spacing={3}>
          {/* PIE */}
          <Grid item xs={12} md={4}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography fontWeight="bold">
                  Attendance Overview
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value">
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* BAR */}
          <Grid item xs={12} md={4}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography fontWeight="bold">
                  Daily Attendance
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT PANEL */}
          <Grid item xs={12} md={4}>
            <Card sx={{ ...cardStyle, mb: 2 }}>
              <CardContent>
                <Typography fontWeight="bold">
                  📅 Upcoming Classes
                </Typography>
                <Divider sx={{ my: 1, borderColor: "#374151" }} />
                {schedule.map((s, i) => (
                  <Typography key={i}>
                    {s.subject} — {s.time}
                  </Typography>
                ))}
              </CardContent>
            </Card>

            <Card sx={cardStyle}>
              <CardContent>
                <Typography fontWeight="bold">
                  🔔 Alerts
                </Typography>
                <Chip
                  label="HIGH RISK"
                  color="error"
                  sx={{ mt: 1 }}
                />
                <Typography mt={1}>
                  Improve attendance to avoid eligibility issues.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ATTENDANCE TABLE */}
        <Card sx={{ ...cardStyle, mt: 3 }}>
          <CardContent>
            <Typography fontWeight="bold">
              📋 Attendance Record
            </Typography>
            <Divider sx={{ my: 1, borderColor: "#374151" }} />
            {attendanceTable.map((row, i) => (
              <Grid
                container
                key={i}
                justifyContent="space-between"
                alignItems="center"
                sx={{ py: 0.5 }}
              >
                <Typography>{row.date}</Typography>
                <Chip
                  label={row.status}
                  color={
                    row.status === "Present"
                      ? "success"
                      : "error"
                  }
                />
              </Grid>
            ))}
          </CardContent>
        </Card>
      </Box>

      {/* EXPORT */}
      <Box textAlign="center" mt={3}>
        <Button variant="contained" onClick={exportPDF}>
          Export PDF
        </Button>
      </Box>
    </Box>
  );
}
