import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/StudentDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import StaffClassSelect from "./pages/StaffClassSelect";
import StaffClass from "./pages/StaffClass";
import ManagementDashboard from "./pages/ManagementDashboard";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/staff/department/:dept" element={<StaffClassSelect />} />
        <Route path="/staff/class/:dept/:year/:section" element={<StaffClass />} />

        <Route path="/management" element={<ManagementDashboard />} />
      </Routes>
    </>
  );
}
