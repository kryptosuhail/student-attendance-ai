import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  Divider
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  CartesianGrid
} from "recharts";

/* ---------------- MOCK DATA ---------------- */

const departments = [
  { name: "CSE", percent: 68 },
  { name: "IT", percent: 82 },
  { name: "ECE", percent: 71 },
  { name: "MECH", percent: 89 }
];

const weeklyTrend = [
  { day: "Mon", value: 76 },
  { day: "Tue", value: 78 },
  { day: "Wed", value: 74 },
  { day: "Thu", value: 80 },
  { day: "Fri", value: 83 }
];

/* ---------------- HELPERS ---------------- */

const getStatus = (percent) => {
  if (percent < 75) return { label: "Critical", color: "error" };
  if (percent < 85) return { label: "Warning", color: "warning" };
  return { label: "Good", color: "success" };
};

/* ---------------- COMPONENT ---------------- */

export default function ManagementDashboard() {
  const avgAttendance = Math.round(
    departments.reduce((sum, d) => sum + d.percent, 0) /
      departments.length
  );

  const riskyDepartments = departments.filter((d) => d.percent < 75);

  const comparisonData = departments.map((d) => ({
    name: d.name,
    Department: d.percent,
    CollegeAvg: avgAttendance
  }));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0f172a",
        color: "#e5e7eb",
        p: 3
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: "#e5e7eb" }}>
        Management Dashboard
      </Typography>

      {/* TOP SUMMARY */}
      <Grid container spacing={2}>
        {[
          ["Departments", departments.length],
          ["Overall Attendance", `${avgAttendance}%`],
          ["Departments at Risk", riskyDepartments.length],
          ["Weekly Trend", avgAttendance > 75 ? "Improving" : "Declining"]
        ].map(([label, value]) => (
          <Grid item xs={12} md={3} key={label}>
            <Card sx={{ bgcolor: "#111827", borderRadius: 2 }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                  {label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#e5e7eb" }}>
                  {value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4, borderColor: "#1f2937" }} />

      {/* DEPARTMENT OVERVIEW + COMPARISON */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" sx={{ mb: 2, color: "#e5e7eb" }}>
            Department Attendance Overview
          </Typography>

          <Grid container spacing={2}>
            {departments.map((dept) => {
              const status = getStatus(dept.percent);
              return (
                <Grid item xs={12} sm={6} key={dept.name}>
                  <Card sx={{ bgcolor: "#111827", borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: "#e5e7eb" }}>
                        {dept.name}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#e5e7eb" }}>
                        {dept.percent}%
                      </Typography>
                      <Chip
                        label={status.label}
                        color={status.color}
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* COMPARISON CHART */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" sx={{ mb: 2, color: "#e5e7eb" }}>
            Department vs College Average
          </Typography>

          <Card sx={{ bgcolor: "#111827", height: "100%" }}>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", color: "#e5e7eb" }} />
                  <Legend wrapperStyle={{ color: "#e5e7eb" }} />
                  <Bar dataKey="Department" fill="#38bdf8" />
                  <Bar dataKey="CollegeAvg" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4, borderColor: "#1f2937" }} />

      {/* ALERTS */}
      <Typography variant="h5" sx={{ mb: 2, color: "#e5e7eb" }}>
        Alerts & Notifications
      </Typography>

      {riskyDepartments.length === 0 ? (
        <Alert severity="success" sx={{ color: "#9ca3af" }}>
          All departments are maintaining healthy attendance.
        </Alert>
      ) : (
        riskyDepartments.map((d) => (
          <Alert severity="error" sx={{ mb: 1, color: "#9ca3af" }} key={d.name}>
            ⚠️ {d.name} attendance dropped to {d.percent}% – Action Required
          </Alert>
        ))
      )}

      <Divider sx={{ my: 4, borderColor: "#1f2937" }} />

      {/* WEEKLY TREND */}
      <Typography variant="h5" sx={{ mb: 2, color: "#e5e7eb" }}>
        Weekly Attendance Trend
      </Typography>

      <Card sx={{ bgcolor: "#111827" }}>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid stroke="#1f2937" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#111827", color: "#e5e7eb" }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#38bdf8"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4, borderColor: "#1f2937" }} />

      {/* AI INSIGHTS */}
      <Typography variant="h5" sx={{ mb: 2, color: "#e5e7eb" }}>
        AI Insights & Suggestions
      </Typography>

      <Card sx={{ bgcolor: "#111827" }}>
        <CardContent>
          <Typography sx={{ color: "#e5e7eb" }}>
            🤖 CSE and ECE show repeated low attendance on early weekdays.
          </Typography>
          <Typography sx={{ mt: 1, color: "#9ca3af" }}>
            📌 Suggest mentor intervention or timetable optimization.
          </Typography>
          <Typography sx={{ mt: 1, color: "#9ca3af" }}>
            📈 IT department shows consistent improvement after mid‑week.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
