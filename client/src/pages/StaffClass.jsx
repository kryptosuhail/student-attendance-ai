import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
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
  CircularProgress,
  Grid
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ---------------- COMPONENT ---------------- */

export default function StaffClass() {
  const { dept, year, section } = useParams();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [classDetails, setClassDetails] = useState(null);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  // NEW: Gemini AI states
  const [classAiResult, setClassAiResult] = useState(null);
  const [classAiLoading, setClassAiLoading] = useState(false);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const res = await api.get(`/staff/class/${dept}/${year}/${section}`);
        setAttendance(res.data.students || []);
        setClassDetails(res.data);
        fetchClassAI(res.data.students || []); // NEW: Gemini AI
      } catch (err) {
        console.error("Failed to fetch class details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassDetails();
  }, [dept, year, section]);

  // NEW: Gemini AI fetch for class
  const fetchClassAI = async (studentsData) => {
    setClassAiLoading(true);
    try {
      const res = await api.post('/ai/analyze-class', {
        department: dept,
        section: section,
        students: studentsData.map(s => ({
          name: s.name || s.roll,
          attendance: s.percent || 0
        }))
      });
      setClassAiResult(res.data);
    } catch (err) {
      console.error('Class AI failed:', err);
    } finally {
      setClassAiLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = attendance.map(s => ({
        studentId: s.studentId,
        status: s.present ? "Present" : "Absent"
      }));
      await api.post("/attendance/mark", { 
        students: payload,
        classId: classDetails.classId,
        subject: classDetails.subject,
        period: classDetails.period
      });
      setLocked(true);
      alert("Attendance marked successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error marking attendance");
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Class Attendance Report", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date Generated: ${new Date().toLocaleString()}`, 14, 28);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Department: ${dept}`, 14, 40);
    doc.text(`Year: ${year}`, 70, 40);
    doc.text(`Section: ${section}`, 110, 40);

    const tableRows = attendance.map((s, idx) => [
      idx + 1,
      s.roll,
      s.name,
      s.percent + "%",
      s.present ? "Present" : "Absent"
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['#', 'Roll No', 'Student Name', 'Total Attendance %', 'Current Status']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [15, 118, 110] }
    });

    doc.save(`${dept}_Y${year}_Sec${section}_Report.pdf`);
  };

  const riskData = useMemo(
    () =>
      attendance.map((s) => {
        const weeklyData = s.weekly || [];
        const percent =
          (weeklyData.filter((d) => d === 1).length / 5) * 100;
        let risk = "Safe";
        if (percent < 75) risk = "At Risk";
        else if (percent < 85) risk = "Warning";
        return { ...s, percent, risk };
      }),
    [attendance]
  );

  if (loading) {
     return <Box p={5} textAlign="center" color="#fff"><Typography>Loading Students...</Typography></Box>;
  }

  const presentCount = attendance.filter((s) => s.present).length;
  const absentCount = attendance.length - presentCount;

  const pieData = attendance.length === 0
    ? [{ name: "No Data", value: 1 }]
    : [
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



  return (
    <ThemeProvider theme={theme}>
      <Box p={3} bgcolor="background.default" minHeight="100vh">
        {/* ---------------- HEADER ---------------- */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button 
            onClick={() => navigate('/staff')} 
            startIcon={<ArrowBack />}
            sx={{ 
              color: '#9ca3af', transition: 'all 0.3s ease',
              '&:hover': { 
                color: '#fff',
                background: 'linear-gradient(135deg, rgba(56,189,248,0.1), rgba(139,92,246,0.08))',
                transform: 'translateX(-2px)'
              } 
            }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Class Details
          </Typography>
          <Button 
            variant="outlined" 
            onClick={handleExportPDF}
            sx={{ 
              ml: 'auto', color: '#10b981', borderColor: '#10b981',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.08))',
                borderColor: '#34d399',
                boxShadow: '0 6px 20px rgba(16,185,129,0.25)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Export PDF
          </Button>
        </Box>

        {/* ---------------- TOP SUMMARY ---------------- */}
        <Grid container spacing={2}>
          {[
            ["Department", dept],
            ["Year", year],
            ["Section", section],
            ["Students", attendance.length],
            ["Subject", classDetails?.subject || "N/A"],
            ["Period", classDetails?.period === "N/A" ? "No Active Period" : classDetails?.period],
            ["Staff", classDetails?.staffName || "You"],
            ["Current Status", locked ? "Marked" : "Not Marked"],
          ].map(([label, value]) => (
            <Grid item xs={12} sm={6} md={3} key={label}>
              <Card key={label} sx={{ 
              height: '100%',
              transition: 'all 0.35s ease',
              cursor: 'default',
              '&:hover': {
                background: 'linear-gradient(135deg, #0c1a30 0%, #132040 50%, rgba(255,255,255,0.05) 100%)',
                borderColor: 'rgba(6,182,212,0.35)',
                boxShadow: '0 8px 28px rgba(6,182,212,0.12)',
                transform: 'translateY(-3px)'
              }
            }}>
              <CardContent>
                <Typography variant="caption">{label}</Typography>
                {label === "Current Status" ? (
                  <Box mt={1}>
                    <Chip
                      label={value}
                      color={locked ? "success" : "warning"}
                    />
                  </Box>
                ) : (
                  <Typography variant="h6">{value}</Typography>
                )}
              </CardContent>
            </Card>
            </Grid>
          ))}
        </Grid>

        {/* ---------------- MAIN DASHBOARD GRID ---------------- */}
        <Box
          mt={3}
          display="grid"
          gridTemplateColumns={{ xs: "1fr", lg: "2fr 1fr" }}
          gap={2}
        >
          {/* ---------------- ATTENDANCE TABLE ---------------- */}
          <Card sx={{
            transition: 'all 0.35s ease',
            '&:hover': {
              background: 'linear-gradient(160deg, #0b1828 0%, #0f2235 50%, rgba(255,255,255,0.04) 100%)',
              borderColor: 'rgba(6,182,212,0.3)',
              boxShadow: '0 10px 36px rgba(6,182,212,0.1)'
            }
          }}>
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
                      <TableRow key={s.roll} sx={{
                        transition: 'background 0.25s ease',
                        '&:hover': {
                          background: 'linear-gradient(90deg, rgba(6,182,212,0.08), rgba(139,92,246,0.05))',
                        }
                      }}>
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
                sx={{
                  mt: 2,
                  background: 'linear-gradient(135deg, #0F766E, #059669)',
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: '12px',
                  px: 4,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669, #0F766E)',
                  }
                }}
                disabled={locked || attendance.length === 0}
                onClick={handleSave}
              >
                Save Attendance
              </Button>
            </CardContent>
          </Card>

          {/* ---------------- ANALYTICS ---------------- */}
          <Box display="flex" flexDirection="column" gap={2}>
            <Card sx={{
              transition: 'all 0.35s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #081a0e 0%, #0e2814 50%, rgba(255,255,255,0.04) 100%)',
                borderColor: 'rgba(34,197,94,0.3)',
                boxShadow: '0 8px 28px rgba(34,197,94,0.1)'
              }
            }}>
              <CardContent>
                <Typography variant="h6">Overall Attendance</Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" outerRadius={70}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === "Present" ? "#4caf50" : entry.name === "Absent" ? "#f44336" : "#9e9e9e"} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card sx={{
              transition: 'all 0.35s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #0c1528 0%, #131e38 50%, rgba(255,255,255,0.04) 100%)',
                borderColor: 'rgba(144,202,249,0.3)',
                boxShadow: '0 8px 28px rgba(144,202,249,0.1)'
              }
            }}>
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
        <Card sx={{ 
          mt: 3,
          transition: 'all 0.35s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, #1a0808 0%, #220c0c 50%, rgba(255,255,255,0.04) 100%)',
            borderColor: 'rgba(248,113,113,0.3)',
            boxShadow: '0 8px 28px rgba(220,38,38,0.1)',
            transform: 'translateY(-2px)'
          }
        }}>
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
        <Card sx={{ 
          mt: 3,
          transition: 'all 0.35s ease',
          '&:hover': {
            background: 'linear-gradient(160deg, #0a1a24 0%, #0c2030 50%, rgba(255,255,255,0.04) 100%)',
            borderColor: 'rgba(6,182,212,0.3)',
            boxShadow: '0 10px 36px rgba(6,182,212,0.1)',
            transform: 'translateY(-2px)'
          }
        }}>
          <CardContent>
            <Typography variant="h6">AI Risk Analysis</Typography>
            {classAiLoading ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CircularProgress size={24} sx={{ color: '#06B6D4' }}/>
                <Typography sx={{ mt: 1, fontSize: 13, color: 'grey.500' }}>
                  Analyzing class with Gemini AI...
                </Typography>
              </Box>
            ) : (
              <>
                {classAiResult?.class_insight && (
                  <Box sx={{ mb: 3, p: 2, background: 'rgba(6,182,212,0.08)', borderRadius: 2, border: '1px solid rgba(6,182,212,0.2)' }}>
                    <Typography sx={{ fontSize: 13, color: '#06B6D4' }}>
                      🤖 {classAiResult.class_insight}
                    </Typography>
                  </Box>
                )}
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
                      {riskData.map((student) => {
                        const pct = student.percent || 0;
                        const aiS = classAiResult?.students?.find(
                          s => s.name === student.name
                        );
                        const riskName = aiS?.risk_level || student.risk;
                        const eligible = aiS?.exam_eligible ?? (pct >= 75);

                        return (
                          <TableRow key={student.roll} sx={{
                            transition: 'background 0.25s ease',
                            '&:hover': {
                              background: 'linear-gradient(90deg, rgba(6,182,212,0.08), rgba(139,92,246,0.05))',
                            }
                          }}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{pct}%</TableCell>
                            <TableCell>
                              <Chip
                                label={riskName}
                                size="small"
                                sx={{
                                  background:
                                    riskName === 'High' || riskName === 'At Risk' ? '#dc2626' :
                                    riskName === 'Medium' || riskName === 'Warning' ? '#d97706' : '#16a34a',
                                  color: '#fff', fontWeight: 600
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: eligible ? '#4ade80' : '#f87171', fontWeight: 500 }}>
                              {eligible ? 'Eligible' : 'Not Eligible'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}
