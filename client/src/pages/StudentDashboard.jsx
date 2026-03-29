import React, { useState, useEffect } from "react";
import CountUp from 'react-countup';
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
  CircularProgress,
  Slider,
  TextField,
  Button,
  Divider,
  Avatar
} from "@mui/material";
import { Person, Female } from '@mui/icons-material';
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper: detect likely female name from common Indian female names
const FEMALE_NAMES = [
  'mythili','priya','divya','ananya','sneha','kavya','lakshmi','meena','deepa','swathi',
  'pooja','nithya','harini','shalini','ranjani','anjali','aarti','aishwarya','bhavani',
  'chitra','devi','gayathri','indira','janani','keerthana','lavanya','mala','nalini',
  'padma','revathi','saranya','tanya','uma','vani','yamini','zara','fatima','ayesha',
  'amina','riya','isha','neha','sakshi','tanvi','shreya','aditi','kriti','simran',
  'radhika','pallavi','rashmi','sunita','geeta','rekha','sapna','komal','renuka','vasuki'
];

function detectGender(name) {
  if (!name) return 'male';
  const first = name.trim().split(' ')[0].toLowerCase();
  return FEMALE_NAMES.includes(first) ? 'female' : 'male';
}

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

  // NEW: Gemini AI states
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // NEW: What-If Predictor states
  const [absencesToModel, setAbsencesToModel] = useState(1);
  const [prediction, setPrediction] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, summaryRes, scheduleRes, analyticsRes] = await Promise.all([
          api.get("/student/profile"),
          api.get("/student/attendance/summary"),
          api.get("/student/schedule/today"),
          api.get("/student/attendance/weekly")
        ]);

        const profile = profileRes.data.user;
        const summary = summaryRes.data;
        const schedule = scheduleRes.data.schedule || [];
        const analytics = analyticsRes.data.weekly || [];

        setStudent({
          name: profile.realName || profile.username,
          regNo: profile.registerNo || profile.username, 
          department: profile.classId?.department || "General",
          year: profile.classId?.year || 1,
          overallAttendance: summary.percentage || 0,
          totalSessions: summary.totalClasses || 100
        });

        // NEW: Gemini AI
        fetchStudentAI({
          name: profile.username,
          overallAttendance: summary.percentage
        }, analytics);

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

  // NEW: Gemini AI fetch for student
  const fetchStudentAI = async (studentData, weekly) => {
    setAiLoading(true);
    try {
      // Use the verified aiRoutes endpoint instead of studentAIController
      const res = await api.post('/ai/analyze', {
        studentName: studentData.name || studentData.username,
        overallAttendance: studentData.overallAttendance || 0,
        weeklyData: weekly || []
      });
      setAiResult(res.data);
    } catch (err) {
      console.error('Student AI failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const predictAttendance = async () => {
    setPredictLoading(true);
    try {
      // 1. Calculate locally first (Fallback)
      const currentSessions = (student.overallAttendance / 100) * (student.totalSessions || 100);
      const modeledTotal = (student.totalSessions || 100) + absencesToModel;
      const localResult = (currentSessions / modeledTotal) * 100;

      // 2. Fetch AI Insight
      const res = await api.post('/ai/predict', {
        currentAttendance: student.overallAttendance,
        absencesPlan: absencesToModel,
        studentName: student.name
      });
      
      setPrediction({
        ...res.data,
        predicted_percentage: res.data.predicted_percentage || localResult.toFixed(1)
      });
    } catch (err) {
      console.error('Prediction failed:', err);
      // Use local calculation as fallback
      const currentSessions = (student.overallAttendance / 100) * (student.totalSessions || 100);
      const modeledTotal = (student.totalSessions || 100) + absencesToModel;
      const localResult = parseFloat(((currentSessions / modeledTotal) * 100).toFixed(1));
      const isEligible = localResult >= 75;
      setPrediction({
        predicted_percentage: localResult,
        is_eligible: isEligible,
        ai_advice: isEligible
          ? `With ${absencesToModel} more absences your attendance drops to ${localResult}% — still eligible, but stay careful.`
          : `Missing ${absencesToModel} more classes drops you to ${localResult}% — below the 75% eligibility threshold!`
      });
    } finally {
      setPredictLoading(false);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Student Attendance Report", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Name: ${student.name}`, 14, 40);
      doc.text(`Register No: ${student.regNo}`, 14, 47);
      doc.text(`Department: ${student.department}`, 14, 54);
      doc.text(`Year: ${student.year}`, 14, 61);

      doc.setFontSize(14);
      doc.text("Weekly Attendance Summary (Mon-Fri)", 14, 75);

      const tableRows = (weeklyTable || []).map(row => [
        row.day,
        row.status
      ]);

      autoTable(doc, {
        startY: 80,
        head: [['Day', 'Status']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [56, 189, 248] }
      });

      // Fix for accessing finalY correctly
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 120;
      
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Overall Attendance Rate: ${student.overallAttendance}%`, 14, finalY + 15);
      
      const isEligible = student.overallAttendance >= 75;
      doc.setTextColor(isEligible ? 34 : 239, isEligible ? 197 : 68, isEligible ? 94 : 68);
      doc.text(`Exam Eligibility: ${isEligible ? "ELIGIBLE" : "NOT ELIGIBLE"}`, 14, finalY + 22);

      doc.save(`${student.regNo}_Attendance_Report.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const [weeklyTimetable, setWeeklyTimetable] = useState([]);
  const [timetableLoading, setTimetableLoading] = useState(false);

  useEffect(() => {
    const fetchTimetable = async () => {
      setTimetableLoading(true);
      try {
        const res = await api.get("/student/schedule/weekly");
        setWeeklyTimetable(res.data.timetable || []);
      } catch (err) {
        console.error("Failed to fetch weekly timetable", err);
      } finally {
        setTimetableLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periods = [1, 2, 3, 4];

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
      <Card sx={{
        mb: 3, bgcolor: '#111827', borderRadius: 3, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        transition: 'all 0.35s ease',
        '&:hover': {
          background: detectGender(student.name) === 'female'
            ? 'linear-gradient(135deg, #1e1030 0%, #2d1040 40%, #111827 100%)'
            : 'linear-gradient(135deg, #0c1a30 0%, #0f2040 40%, #111827 100%)',
          borderColor: detectGender(student.name) === 'female' ? 'rgba(236,72,153,0.35)' : 'rgba(56,189,248,0.35)',
          boxShadow: detectGender(student.name) === 'female'
            ? '0 8px 32px rgba(236,72,153,0.15)'
            : '0 8px 32px rgba(56,189,248,0.15)',
          transform: 'translateY(-2px)'
        }
      }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3, px: 4, gap: 3 }}>
          {/* AVATAR — Left */}
          <Avatar
            sx={{
              width: 72, height: 72,
              bgcolor: detectGender(student.name) === 'female' ? '#ec4899' : '#3b82f6',
              border: '3px solid',
              borderColor: detectGender(student.name) === 'female' ? 'rgba(236,72,153,0.5)' : 'rgba(59,130,246,0.5)',
              boxShadow: detectGender(student.name) === 'female'
                ? '0 0 24px rgba(236,72,153,0.4)'
                : '0 0 24px rgba(59,130,246,0.4)',
              flexShrink: 0,
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'scale(1.08)' }
            }}
          >
            {detectGender(student.name) === 'female'
              ? <Female sx={{ fontSize: 38 }} />
              : <Person sx={{ fontSize: 38 }} />
            }
          </Avatar>

          {/* STUDENT DETAILS — Center */}
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={800} color="#e5e7eb" sx={{ letterSpacing: -0.3 }}>
              {student.name}
            </Typography>
            <Typography sx={{ color: '#9ca3af', fontSize: 14, mt: 0.5 }}>
              Register No: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{student.regNo}</span>
            </Typography>
            <Chip
              label={`${student.department} • Year ${student.year}`}
              size="small"
              sx={{
                mt: 1,
                bgcolor: 'rgba(6,182,212,0.1)',
                color: '#06B6D4',
                border: '1px solid rgba(6,182,212,0.25)',
                fontWeight: 600, fontSize: 12,
                transition: 'all 0.25s',
                '&:hover': { bgcolor: 'rgba(6,182,212,0.22)', borderColor: '#06B6D4' }
              }}
            />
          </Box>

          {/* EXPORT BUTTON — Right */}
          <Button
            variant="contained"
            onClick={handleExportPDF}
            sx={{
              background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                boxShadow: '0 6px 20px rgba(14,165,233,0.45)',
                transform: 'translateY(-1px)'
              },
              fontWeight: 700, px: 3, py: 1.2, borderRadius: 2,
              textTransform: 'none', fontSize: 13,
              boxShadow: '0 4px 14px rgba(56,189,248,0.3)',
              flexShrink: 0, transition: 'all 0.25s ease'
            }}
          >
            📄 Export PDF
          </Button>
        </CardContent>
      </Card>

      {/* TOP SUMMARY */}
      <Grid container spacing={3} sx={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        backdropFilter: 'blur(12px)',
        p: 3, mt: 1
      }}>
        {/* Attendance % */}
        <Grid item xs={12} md={4}>
          <Card sx={{
            bgcolor: '#111827', borderRadius: 3, border: '1px solid rgba(56,189,248,0.1)',
            transition: 'all 0.3s ease', cursor: 'default',
            '&:hover': {
              background: 'linear-gradient(135deg, #0c1f33 0%, #0f2744 100%)',
              borderColor: 'rgba(56,189,248,0.5)',
              boxShadow: '0 8px 28px rgba(56,189,248,0.18)',
              transform: 'translateY(-3px)'
            }
          }}>
            <CardContent>
              <Typography sx={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Overall Attendance
              </Typography>
              <Typography variant="h3" fontWeight={800} color="#38bdf8" mt={0.5}>
                <CountUp end={student.overallAttendance || 0} duration={1.5} suffix="%" />
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Risk */}
        <Grid item xs={12} md={4}>
          <Card sx={{
            bgcolor: '#111827', borderRadius: 3, border: '1px solid rgba(217,119,6,0.1)',
            transition: 'all 0.3s ease', cursor: 'default',
            '&:hover': {
              background: 'linear-gradient(135deg, #1a1206 0%, #231a08 100%)',
              borderColor: 'rgba(251,191,36,0.4)',
              boxShadow: '0 8px 28px rgba(251,191,36,0.12)',
              transform: 'translateY(-3px)'
            }
          }}>
            <CardContent>
              <Typography sx={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                AI Risk Analysis
              </Typography>
              <Chip
                label={aiLoading ? '...' : (aiResult?.risk_level ? aiResult.risk_level + ' Risk' : (student.overallAttendance < 65 ? 'High Risk' : student.overallAttendance < 75 ? 'Medium Risk' : 'Low Risk'))}
                sx={{
                  mt: 2,
                  background:
                    aiResult?.risk_level === 'High' ? 'linear-gradient(135deg,#dc2626,#b91c1c)' :
                    aiResult?.risk_level === 'Medium' ? 'linear-gradient(135deg,#d97706,#b45309)' :
                    aiResult?.risk_level === 'Low' ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'rgba(255,255,255,0.08)',
                  color: '#fff', fontWeight: 700
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Eligibility */}
        <Grid item xs={12} md={4}>
          <Card sx={{
            bgcolor: '#111827', borderRadius: 3,
            border: eligibility.includes('Not') ? '1px solid rgba(220,38,38,0.15)' : '1px solid rgba(34,197,94,0.15)',
            transition: 'all 0.3s ease', cursor: 'default',
            '&:hover': {
              background: eligibility.includes('Not')
                ? 'linear-gradient(135deg, #1a0808 0%, #220c0c 100%)'
                : 'linear-gradient(135deg, #081a0e 0%, #0c2212 100%)',
              borderColor: eligibility.includes('Not') ? 'rgba(248,113,113,0.5)' : 'rgba(74,222,128,0.5)',
              boxShadow: eligibility.includes('Not') ? '0 8px 28px rgba(220,38,38,0.15)' : '0 8px 28px rgba(34,197,94,0.15)',
              transform: 'translateY(-3px)'
            }
          }}>
            <CardContent>
              <Typography sx={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Exam Eligibility
              </Typography>
              <Chip
                label={eligibility}
                sx={{
                  mt: 2,
                  background: eligibility.includes('Not')
                    ? 'linear-gradient(135deg,#dc2626,#b91c1c)'
                    : 'linear-gradient(135deg,#16a34a,#15803d)',
                  color: '#fff', fontWeight: 700
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* WEEKLY CHART */}
      <Box mt={4}>
        <Card sx={{
          bgcolor: '#111827', borderRadius: 3, border: '1px solid rgba(6,182,212,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'linear-gradient(160deg, #0a1a24 0%, #0c2030 50%, #111827 100%)',
            borderColor: 'rgba(6,182,212,0.3)',
            boxShadow: '0 10px 36px rgba(6,182,212,0.12)'
          }
        }}>
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
                  stroke="#06B6D4"
                  strokeWidth={4}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* TODAY + AI (SIDE BY SIDE) */}
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={4}>
          <Card sx={{
            bgcolor: "#111827", height: "100%", borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.06)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #0b1828 0%, #0f2235 50%, #111827 100%)',
              borderColor: 'rgba(56,189,248,0.3)',
              boxShadow: '0 8px 28px rgba(56,189,248,0.12)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" mb={1} color="#e5e7eb">
                Today’s Schedule
              </Typography>
              {todaySchedule.length > 0 ? (
                todaySchedule.map((p) => (
                  <Typography
                    key={p.period}
                    sx={{ color: "#9ca3af", mt: 1, fontSize: 14 }}
                  >
                     Period {p.period}: <span style={{ color: '#fff' }}>{p.subject}</span> — {p.staffName || p.staff}
                  </Typography>
                ))
              ) : (
                <Typography sx={{ color: "#9ca3af", mt: 1 }}>
                  No classes scheduled for today.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            bgcolor: '#111827', height: '100%', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #091828 0%, #0d2035 100%)',
              borderColor: 'rgba(56,189,248,0.35)',
              boxShadow: '0 8px 28px rgba(56,189,248,0.12)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" mb={1} color="#e5e7eb">
                AI Suggestions
              </Typography>
              {aiLoading ? (
                <Typography sx={{ fontSize: 13, color: '#38bdf8', mt: 1 }}>
                  🤖 Analyzing...
                </Typography>
              ) : (
                <Typography sx={{ fontSize: 13, color: '#38bdf8', mt: 1, lineHeight: 1.6 }}>
                  🤖 {aiResult?.suggestion || 'Maintain consistency to stay exam‑eligible.'}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            bgcolor: '#111827', height: '100%', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #0e1628 0%, #131e38 100%)',
              borderColor: 'rgba(139,92,246,0.35)',
              boxShadow: '0 8px 28px rgba(139,92,246,0.12)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" mb={1} color="#e5e7eb">
                🔮 Absence Simulator
              </Typography>
              <Slider
                value={absencesToModel}
                onChange={(e, val) => setAbsencesToModel(val)}
                valueLabelDisplay="auto"
                min={1}
                max={15}
                sx={{ color: '#06B6D4', mb: 1 }}
              />
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={predictAttendance}
                disabled={predictLoading}
                sx={{
                  borderColor: '#06B6D4', color: '#06B6D4', fontWeight: 700,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.15))',
                    borderColor: '#8b5cf6', color: '#a78bfa',
                    boxShadow: '0 0 16px rgba(139,92,246,0.25)'
                  }
                }}
              >
                {predictLoading ? 'Calculating...' : 'Predict Result'}
              </Button>

              {prediction && (
                <Box sx={{ 
                  mt: 2, 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: prediction.is_eligible ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
                  border: `1px solid ${prediction.is_eligible ? '#16a34a' : '#dc2626'}`
                }}>
                  <Typography sx={{ color: prediction.is_eligible ? '#4ade80' : '#f87171', fontWeight: 700, fontSize: 13 }}>
                    Result: {prediction.predicted_percentage}%
                  </Typography>
                  <Typography sx={{ color: '#9ca3af', fontSize: 11, mt: 0.5 }}>
                    {prediction.ai_advice}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* VISUAL WEEKLY TIMETABLE */}
      <Box mt={4}>
        <Card sx={{
          bgcolor: '#111827', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'linear-gradient(160deg, #0b1828 0%, #0f2235 50%, #111827 100%)',
            borderColor: 'rgba(6,182,212,0.25)',
            boxShadow: '0 10px 36px rgba(6,182,212,0.1)'
          }
        }}>
          <CardContent>
            <Typography variant="h6" mb={3} color="#e5e7eb">
              📅 Visual Weekly Timetable
            </Typography>
            
            <Box sx={{ flexGrow: 1 }}>
               {/* Day Headers */}
               <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', mb: 1 }}>
                  <Box></Box>
                  {days.map(day => (
                    <Typography key={day} align="center" sx={{ fontWeight: 800, color: '#06B6D4', fontSize: 13 }}>
                      {day}
                    </Typography>
                  ))}
               </Box>

               {/* Period Rows */}
               {periods.map(p => (
                 <Box key={p} sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, mb: 1 }}>
                    {/* Period Label */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Typography sx={{ color: '#9ca3af', fontWeight: 700, fontSize: 12 }}>P{p}</Typography>
                    </Box>
                    {/* Days for this Period */}
                    {days.map(day => {
                        const cell = weeklyTimetable.find(t => t.day === day && t.period === p);
                        return (
                          <Box key={`${day}-${p}`} sx={{
                                bgcolor: cell ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.02)',
                                border: cell ? '1px solid rgba(6,182,212,0.3)' : '1px solid rgba(255,255,255,0.05)',
                                borderRadius: 1.5, p: 1, minHeight: 65,
                                display: 'flex', flexDirection: 'column',
                                justifyContent: 'center', textAlign: 'center',
                                transition: 'all 0.25s ease', cursor: cell ? 'default' : 'default',
                                '&:hover': cell ? {
                                  background: 'linear-gradient(135deg, rgba(6,182,212,0.22), rgba(56,189,248,0.12))',
                                  borderColor: 'rgba(6,182,212,0.6)',
                                  boxShadow: '0 4px 14px rgba(6,182,212,0.18)',
                                  transform: 'scale(1.03)'
                                } : {
                                  background: 'rgba(255,255,255,0.04)',
                                  borderColor: 'rgba(255,255,255,0.1)'
                                }
                             }}>
                                {cell ? (
                                  <>
                                    <Typography sx={{ color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1.1 }}>{cell.subject}</Typography>
                                    <Typography sx={{ color: '#9ca3af', fontSize: 9, mt: 0.5 }}>{cell.staffId?.username}</Typography>
                                  </>
                                ) : (
                                  <Typography sx={{ color: 'rgba(255,255,255,0.05)', fontSize: 9 }}>-</Typography>
                                )}
                          </Box>
                        );
                    })}
                 </Box>
               ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* WEEKLY TABLE */}
      <Box mt={4} sx={{ display: "flex", justifyContent: "center" }}>
        <Card sx={{
          bgcolor: '#111827', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)',
          width: '100%',
          maxWidth: 760,
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'linear-gradient(160deg, #0b1828 0%, #111827 100%)',
            borderColor: 'rgba(56,189,248,0.2)',
            boxShadow: '0 8px 28px rgba(56,189,248,0.08)'
          }
        }}>
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
                  <TableRow
                    key={row.day}
                    sx={{
                      transition: 'background 0.2s ease',
                      '&:hover': {
                        background: 'linear-gradient(90deg, rgba(56,189,248,0.08), rgba(99,102,241,0.06))',
                        cursor: 'default'
                      }
                    }}
                  >
                    <TableCell sx={{ color: '#e5e7eb', borderColor: 'rgba(255,255,255,0.05)' }}>
                      {row.day}
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          background: row.status === 'Present'
                            ? 'linear-gradient(135deg,#16a34a,#15803d)'
                            : 'linear-gradient(135deg,#dc2626,#b91c1c)',
                          color: '#fff', fontWeight: 700, fontSize: 11
                        }}
                      />
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
