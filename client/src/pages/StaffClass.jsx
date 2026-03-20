import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  Button,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme"; // ✅ your existing dark theme
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ---------------- COMPONENT ---------------- */

export default function StaffClass() {
  const { dept, section } = useParams();
  const [attendance, setAttendance] = useState([]);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const res = await api.get(`/staff/class/${dept}/${section}`);
        setAttendance(res.data.students || []);
      } catch (err) {
        console.error("Failed to fetch class details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassDetails();
  }, [dept, section]);

  const handleSave = async () => {
    try {
      const payload = attendance.map(s => ({
        studentId: s.studentId,
        status: s.present ? "Present" : "Absent"
      }));
      await api.post("/attendance/mark", { students: payload });
      setLocked(true);
      alert("Attendance marked successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error marking attendance");
    }
  };

  if (loading) {
     return <Box p={5} textAlign="center" color="#fff"><Typography>Loading Students...</Typography></Box>;
  }

  const presentCount = attendance.filter((s) => s.present).length;
  const absentCount = attendance.length - presentCount;

  const pieData = [
    { name: "Present", value: presentCount },
    { name: "Absent", value: absentCount },
  ];

  const lineData = weekDays.map((day, i) => ({
    day,
    attendance: attendance.length === 0 ? 0 :
      (attendance.filter((s) => s.weekly && s.weekly[i] === 1).length /
        attendance.length) *
      100,
  }));

  const absentees = attendance.filter((s) => !s.present);

  const riskData = useMemo(
    () =>
      attendance.map((s) => {
        const percent =
          (s.weekly.filter((d) => d === 1).length / 5) * 100;
        let risk = "Safe";
        if (percent < 75) risk = "At Risk";
        else if (percent < 85) risk = "Warning";
        return { ...s, percent, risk };
      }),
    [attendance]
  );

  return (
    <ThemeProvider theme={theme}>
      <Box p={3} bgcolor="background.default" minHeight="100vh">
        {/* ---------------- HEADER ---------------- */}
        <Typography variant="h4" mb={2}>
          Staff Attendance Dashboard
        </Typography>

        {/* ---------------- TOP SUMMARY ---------------- */}
        <Box display="flex" gap={2} flexWrap="wrap">
          {[
            ["Department", dept],
            ["Section", section],
            ["Students", attendance.length],
            ["Period", "Current"],
            ["Staff", "You"],
          ].map(([label, value]) => (
            <Card key={label} sx={{ minWidth: 180 }}>
              <CardContent>
                <Typography variant="caption">{label}</Typography>
                <Typography variant="h6">{value}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* ---------------- PERIOD STATUS ---------------- */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6">Current Period Status</Typography>
            <Typography mt={1}>
              Attendance:
              <Chip
                label={locked ? "Marked" : "Not Marked"}
                color={locked ? "success" : "warning"}
                sx={{ ml: 1 }}
              />
            </Typography>
          </CardContent>
        </Card>

        {/* ---------------- MAIN DASHBOARD GRID ---------------- */}
        <Box
          mt={3}
          display="grid"
          gridTemplateColumns="2fr 1fr"
          gap={2}
        >
          {/* ---------------- ATTENDANCE TABLE ---------------- */}
          <Card>
            <CardContent>
              <Typography variant="h6">Mark Attendance</Typography>

              <TableContainer sx={{ maxHeight: 400, mt: 2 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Roll No</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell align="center">Present</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendance.map((s, i) => (
                      <TableRow key={s.roll}>
                        <TableCell>{s.roll}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={s.present}
                            disabled={locked}
                            onChange={(e) => {
                              const copy = [...attendance];
                              copy[i].present = e.target.checked;
                              setAttendance(copy);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Button
                variant="contained"
                sx={{ mt: 2 }}
                disabled={locked || attendance.length === 0}
                onClick={handleSave}
              >
                Save Attendance
              </Button>
            </CardContent>
          </Card>

          {/* ---------------- ANALYTICS ---------------- */}
          <Box display="flex" flexDirection="column" gap={2}>
            <Card>
              <CardContent>
                <Typography variant="h6">Overall Attendance</Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" outerRadius={70}>
                      <Cell fill="#4caf50" />
                      <Cell fill="#f44336" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6">Weekly Trend</Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={lineData}>
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="#90caf9"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* ---------------- ABSENTEES ---------------- */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6">
              Absentees ({absentees.length})
            </Typography>
            {absentees.map((s) => (
              <Chip
                key={s.roll}
                label={`${s.roll} - ${s.name}`}
                color="error"
                sx={{ mr: 1, mt: 1 }}
              />
            ))}
          </CardContent>
        </Card>

        {/* ---------------- AI RISK ---------------- */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6">AI Risk Analysis</Typography>
            <TableContainer sx={{ maxHeight: 300, mt: 2 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>%</TableCell>
                    <TableCell>Risk</TableCell>
                    <TableCell>Eligibility</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {riskData.map((s) => (
                    <TableRow key={s.roll}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.percent}%</TableCell>
                      <TableCell>
                        <Chip
                          label={s.risk}
                          color={
                            s.risk === "Safe"
                              ? "success"
                              : s.risk === "Warning"
                              ? "warning"
                              : "error"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {s.percent >= 75 ? "Eligible" : "Not Eligible"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}
