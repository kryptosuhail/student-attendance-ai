import { useState, useEffect } from "react";
import CountUp from "react-countup";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Button,
  Divider,
  Chip,
  Alert
} from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

const getStatus = (percent) => {
  if (percent < 75) return { label: "Critical", color: "error" };
  if (percent < 85) return { label: "Warning", color: "warning" };
  return { label: "Good", color: "success" };
};

export default function ManagementDashboard() {
  const { role } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [riskyDepartments, setRiskyDepartments] = useState([]);
  const [overall, setOverall] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagementData = async () => {
      try {
        const [deptRes, compRes, weekRes, alertRes, overallRes] = await Promise.all([
          api.get("/management/attendance/department"),
          api.get("/management/attendance/comparison"),
          api.get("/management/attendance/weekly"),
          api.get("/management/alerts"),
          api.get("/management/attendance/overall")
        ]);

        const depts = deptRes.data.departments.map((d) => ({
          name: d.department || "Unknown",
          percent: d.attendancePercentage || 0
        }));
        setDepartments(depts);

        const comp = compRes.data.departments.map((d) => ({
          name: d.department,
          Department: d.attendance,
          CollegeAvg: d.collegeAverage
        }));
        setComparisonData(comp);

        const week = weekRes.data.weekly.map((w) => ({
          day: w.day,
          value: w.attendance
        }));
        setWeeklyTrend(week);

        const risky = alertRes.data.departments.map((d) => ({
          name: d.department,
          percent: d.attendancePercentage
        }));
        setRiskyDepartments(risky);

        setOverall(overallRes.data.attendancePercentage || 0);
      } catch (err) {
        console.error("Failed to fetch management analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchManagementData();
  }, []);

  const downloadDefaulterList = async () => {
    try {
      const res = await api.get("/management/defaulters/detailed");
      const students = res.data.defaulters;

      if (!students || students.length === 0) {
        alert("Great news! No students are currently below the 75% threshold.");
        return;
      }

      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.text("STUDENT ATTENDANCE DEFAULTER LIST", 105, 15, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: "center" });

      const tableColumn = ["Student Name", "Register No", "Department", "Section", "Attendance %"];
      const tableRows = students.map((s) => [
        s.name,
        s.username,
        s.department,
        s.section,
        `${s.percentage}%`
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: "grid",
        headStyles: { fillColor: [220, 38, 38], halign: "center" },
        columnStyles: {
          4: { halign: "center", fontStyle: "bold" }
        }
      });

      doc.save(`Defaulter_List_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
      alert("Failed to generate PDF. Check console.");
    }
  };

  if (loading) {
    return (
      <Box p={5} textAlign="center" color="#fff" minHeight="100vh" bgcolor="#0f172a">
        <CircularProgress sx={{ color: "#38bdf8" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0f172a",
        color: "#e5e7eb",
        p: 3
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#e5e7eb" }}>
          Management Dashboard
        </Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<DownloadIcon />}
          onClick={downloadDefaulterList}
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            background: "linear-gradient(135deg, #dc2626, #b91c1c)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              boxShadow: "0 8px 28px rgba(220,38,38,0.4)",
              transform: "translateY(-2px)"
            }
          }}
        >
          Download Defaulter List (PDF)
        </Button>
      </Box>

      <Grid container spacing={2}>
        {[
          { label: "Departments", value: departments.length, gradient: "linear-gradient(135deg, #0c1a30 0%, #0f2040 100%)", border: "rgba(56,189,248,0.2)", hoverBorder: "rgba(56,189,248,0.5)", shadow: "rgba(56,189,248,0.15)" },
          { label: "Overall Attendance", value: `${overall}%`, gradient: "linear-gradient(135deg, #081a0e 0%, #0c2212 100%)", border: "rgba(34,197,94,0.2)", hoverBorder: "rgba(74,222,128,0.5)", shadow: "rgba(34,197,94,0.15)" },
          { label: "Departments at Risk", value: riskyDepartments.length, gradient: "linear-gradient(135deg, #1a0808 0%, #220c0c 100%)", border: "rgba(220,38,38,0.2)", hoverBorder: "rgba(248,113,113,0.5)", shadow: "rgba(220,38,38,0.15)" },
          { label: "Weekly Trend", value: weeklyTrend.length > 1 && weeklyTrend[weeklyTrend.length - 1].value >= weeklyTrend[0].value ? "Improving" : "Declining", gradient: "linear-gradient(135deg, #1a1206 0%, #231a08 100%)", border: "rgba(251,191,36,0.2)", hoverBorder: "rgba(251,191,36,0.5)", shadow: "rgba(251,191,36,0.15)" }
        ].map((item) => (
          <Grid item xs={12} md={3} key={item.label}>
            <Card
              sx={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${item.border}`,
                borderRadius: "16px",
                p: 2,
                transition: "all 0.35s ease",
                cursor: "default",
                "&:hover": {
                  background: item.gradient,
                  borderColor: item.hoverBorder,
                  boxShadow: `0 10px 36px ${item.shadow}`,
                  transform: "translateY(-4px)"
                }
              }}
            >
              <CardContent>
                <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                  {item.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#e5e7eb" }}>
                  {item.label === "Overall Attendance" ? (
                    <CountUp end={overall || 0} duration={1.5} suffix="%" />
                  ) : (
                    item.value
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4, borderColor: "#1f2937" }} />

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
                  <Card
                    sx={{
                      bgcolor: "#111827",
                      borderRadius: 3,
                      border:
                        status.label === "Critical"
                          ? "1px solid rgba(220,38,38,0.15)"
                          : status.label === "Warning"
                            ? "1px solid rgba(251,191,36,0.15)"
                            : "1px solid rgba(34,197,94,0.15)",
                      transition: "all 0.35s ease",
                      cursor: "default",
                      "&:hover": {
                        background:
                          status.label === "Critical"
                            ? "linear-gradient(135deg, #1a0808 0%, #280e0e 50%, #111827 100%)"
                            : status.label === "Warning"
                              ? "linear-gradient(135deg, #1a1206 0%, #282008 50%, #111827 100%)"
                              : "linear-gradient(135deg, #081a0e 0%, #0e2814 50%, #111827 100%)",
                        borderColor:
                          status.label === "Critical"
                            ? "rgba(248,113,113,0.5)"
                            : status.label === "Warning"
                              ? "rgba(251,191,36,0.5)"
                              : "rgba(74,222,128,0.5)",
                        boxShadow:
                          status.label === "Critical"
                            ? "0 8px 28px rgba(220,38,38,0.2)"
                            : status.label === "Warning"
                              ? "0 8px 28px rgba(251,191,36,0.15)"
                              : "0 8px 28px rgba(34,197,94,0.15)",
                        transform: "translateY(-3px)"
                      }
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ color: "#e5e7eb" }}>
                        {dept.name}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#e5e7eb" }}>
                        {dept.percent}%
                      </Typography>
                      <Chip label={status.label} color={status.color} sx={{ mt: 1 }} />
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Typography variant="h5" sx={{ mb: 2, color: "#e5e7eb" }}>
                Department vs College Average
              </Typography>

              <Card
                sx={{
                  bgcolor: "#111827",
                  minHeight: 450,
                  borderRadius: 3,
                  border: "1px solid rgba(6,182,212,0.08)",
                  transition: "all 0.35s ease",
                  "&:hover": {
                    background: "linear-gradient(160deg, #0a1a24 0%, #0c2030 50%, #111827 100%)",
                    borderColor: "rgba(6,182,212,0.3)",
                    boxShadow: "0 10px 36px rgba(6,182,212,0.12)"
                  }
                }}
              >
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={comparisonData} margin={{ bottom: 60, top: 20 }}>
                      <CartesianGrid stroke="#1f2937" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        style={{ fontSize: 12, fontWeight: 500 }}
                      />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8, color: "#e5e7eb" }}
                      />
                      <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 20, color: "#e5e7eb" }} />
                      <Bar dataKey="Department" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="CollegeAvg" fill="#6D28D9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Typography variant="h5" sx={{ mb: 2, color: "#e5e7eb" }}>
                Alerts & Notifications
              </Typography>

              <Card
                sx={{
                  bgcolor: "#111827",
                  minHeight: 450,
                  borderRadius: 3,
                  border: "1px solid rgba(220,38,38,0.08)",
                  transition: "all 0.35s ease",
                  "&:hover": {
                    background: "linear-gradient(160deg, #160c0c 0%, #1b1010 50%, #111827 100%)",
                    borderColor: "rgba(248,113,113,0.25)",
                    boxShadow: "0 10px 36px rgba(220,38,38,0.1)"
                  }
                }}
              >
                <CardContent>
                  {riskyDepartments.length === 0 ? (
                    <Alert severity="success" sx={{ color: "#9ca3af" }}>
                      All departments are maintaining healthy attendance.
                    </Alert>
                  ) : (
                    riskyDepartments.map((d) => (
                      <Alert
                        severity="error"
                        sx={{
                          mb: 1,
                          color: "#9ca3af",
                          transition: "all 0.3s ease",
                          border: "1px solid rgba(220,38,38,0.15)",
                          "&:hover": {
                            background: "linear-gradient(90deg, rgba(220,38,38,0.12), rgba(239,68,68,0.06))",
                            borderColor: "rgba(248,113,113,0.4)",
                            boxShadow: "0 4px 20px rgba(220,38,38,0.12)",
                            transform: "translateX(4px)"
                          }
                        }}
                        key={d.name}
                      >
                        {d.name} attendance dropped to {d.percent}% - Action Required
                      </Alert>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4, borderColor: "#1f2937" }} />

      <Typography variant="h5" sx={{ mb: 2, color: "#e5e7eb" }}>
        Weekly Attendance Trend
      </Typography>

      <Card
        sx={{
          bgcolor: "#111827",
          borderRadius: 3,
          border: "1px solid rgba(56,189,248,0.08)",
          transition: "all 0.35s ease",
          "&:hover": {
            background: "linear-gradient(160deg, #0b1828 0%, #0f2235 50%, #111827 100%)",
            borderColor: "rgba(56,189,248,0.25)",
            boxShadow: "0 10px 36px rgba(56,189,248,0.1)"
          }
        }}
      >
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid stroke="#1f2937" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#111827", color: "#e5e7eb" }} />
              <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
