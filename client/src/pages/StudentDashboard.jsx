import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress
} from "@mui/material";
import api from "../utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function StudentDashboard() {
  const [student, setStudent] = useState({
    name: "Loading...",
    regNo: "N/A",
    department: "N/A",
    year: "N/A",
    overallAttendance: 0
  });
  
  const [weeklyChart, setWeeklyChart] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [weeklyTable, setWeeklyTable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, summaryRes, scheduleRes, analyticsRes] = await Promise.all([
          api.get("/student/profile"),
          api.get("/student/attendance/summary"),
          api.get("/student/schedule/today"),
          api.get("/student/attendance/weekly-analytics")
        ]);

        const profile = profileRes.data.user;
        const summary = summaryRes.data;
        const schedule = scheduleRes.data.schedule || [];
        const analytics = analyticsRes.data.weekly || [];

        setStudent({
          name: profile.username || "Student",
          regNo: profile.username, // Assuming username is regNo
          department: profile.department,
          year: profile.year,
          overallAttendance: summary.percentage || 0
        });

        // Map analytics to chart format
        const chartData = analytics.map(a => ({
          day: a.day,
          attendance: Math.round((a.present / a.total) * 100) || 0
        }));
        
        // Ensure Mon-Fri exist in chart
        const defaultDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
        const fullChartData = defaultDays.map(d => {
           const found = chartData.find(c => c.day === d);
           return found || { day: d, attendance: 0 };
        });
        
        setWeeklyChart(fullChartData);
        setTodaySchedule(schedule);
        
        // We can just use the raw summary or analytics to build the weeklyTable.
        // For simplicity, we just transform analytics:
        const tableData = fullChartData.map(d => ({
          day: d.day,
          status: d.attendance > 0 ? "Present" : "Absent" // Basic heuristic since backend returns counts
        }));
        setWeeklyTable(tableData);

      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: "#38bdf8" }} />
      </Box>
    );
  }

  const aiRisk =
    student.overallAttendance < 65
      ? "High Risk"
      : student.overallAttendance < 75
      ? "Medium Risk"
      : "Low Risk";

  const eligibility =
    student.overallAttendance >= 75
      ? "Eligible for Exams"
      : "Not Eligible for Exams";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0f172a",
        color: "#e5e7eb",
        p: 3
      }}
    >
      {/* HEADER */}
      <Card sx={{ mb: 3, bgcolor: "#111827" }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} color="#e5e7eb">
            {student.name}
          </Typography>
          <Typography sx={{ color: "#9ca3af" }}>
            Register No: {student.regNo}
          </Typography>
          <Typography sx={{ color: "#9ca3af" }}>
            {student.department} • {student.year}
          </Typography>
        </CardContent>
      </Card>

      {/* TOP SUMMARY */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: "#111827" }}>
            <CardContent>
              <Typography sx={{ color: "#9ca3af" }}>
                Overall Attendance
              </Typography>
              <Typography variant="h3" fontWeight={700} color="#38bdf8">
                {student.overallAttendance}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: "#111827" }}>
            <CardContent>
              <Typography sx={{ color: "#9ca3af" }}>
                AI Risk Analysis
              </Typography>
              <Chip
                label={aiRisk}
                color={
                  aiRisk === "High Risk"
                    ? "error"
                    : aiRisk === "Medium Risk"
                    ? "warning"
                    : "success"
                }
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: "#111827" }}>
            <CardContent>
              <Typography sx={{ color: "#9ca3af" }}>
                Exam Eligibility
              </Typography>
              <Chip
                label={eligibility}
                color={eligibility.includes("Not") ? "error" : "success"}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* WEEKLY CHART */}
      <Box mt={4}>
        <Card sx={{ bgcolor: "#111827" }}>
          <CardContent>
            <Typography variant="h6" mb={2} color="#e5e7eb">
              Weekly Attendance Trend (Mon – Fri)
            </Typography>

            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={weeklyChart}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[0, 100]} />

                {/* 🔥 FIXED TOOLTIP */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1f2937",
                    color: "#e5e7eb"
                  }}
                  labelStyle={{ color: "#38bdf8" }}
                />

                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#38bdf8"
                  strokeWidth={4}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* TODAY + AI */}
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "#111827", height: "100%" }}>
            <CardContent>
              <Typography mb={1} color="#e5e7eb">
                Today’s Schedule
              </Typography>
              {todaySchedule.map((p) => (
                <Typography
                  key={p.period}
                  sx={{ color: "#9ca3af", mt: 1 }}
                >
                  Period {p.period}: {p.subject} — {p.staff}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "#111827", height: "100%" }}>
            <CardContent>
              <Typography mb={1} color="#e5e7eb">
                AI Attendance Suggestions
              </Typography>
              <Typography sx={{ color: "#9ca3af", mt: 1 }}>
                🤖 Attendance dropped on Tue & Thu — review engagement.
              </Typography>
              <Typography sx={{ color: "#9ca3af", mt: 1 }}>
                📌 Maintain consistency to stay exam‑eligible.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* WEEKLY TABLE */}
      <Box mt={4}>
        <Card sx={{ bgcolor: "#111827" }}>
          <CardContent>
            <Typography mb={2} color="#e5e7eb">
              Weekly Attendance Details
            </Typography>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#9ca3af" }}>Day</TableCell>
                  <TableCell sx={{ color: "#9ca3af" }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weeklyTable.map((row) => (
                  <TableRow key={row.day}>
                    <TableCell sx={{ color: "#e5e7eb" }}>
                      {row.day}
                    </TableCell>
                    <TableCell sx={{ color: "#e5e7eb" }}>
                      {row.status}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
