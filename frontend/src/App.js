import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Webinar from "./pages/Webinar";
import Mentorship from "./pages/Mentorship";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Jobs from "./pages/Jobs";
import CareerGPS from "./pages/CareerGPS";
import CareerGPSRoadmap from "./pages/CareerGPSRoadmap";
import AuthCallback from "./pages/AuthCallback";

function AppRouter() {
  const location = useLocation();
  // Handle OAuth redirect BEFORE any protected-route checks (synchronous, during render)
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/webinar" element={<Webinar />} />
        <Route path="/mentorship" element={<Mentorship />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/career-gps/roadmap" element={<CareerGPSRoadmap />} />
        <Route path="/career-gps" element={<CareerGPS />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
          <Toaster position="top-center" />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
