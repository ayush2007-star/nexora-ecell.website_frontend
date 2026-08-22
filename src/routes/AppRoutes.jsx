import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminRegistrationDetails from "../pages/AdminRegistrationDetails";
import Home from "../pages/Home";
import Register from "../pages/Register";
import CertificateVerify from "../pages/CertificateVerify";
import TrackStatus from "../pages/TrackStatus";
import AdminMentors from "../pages/AdminMentors";
import ManagementPortal from "../pages/ManagementPortal";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard";
import AdminEvents from "../pages/AdminEvents";
import AdminCertificateStudio from "../pages/AdminCertificateStudio";
import AdminAttendance from "../pages/AdminAttendance";
import AdminScoringResults from "../pages/AdminScoringResults";
import AdminManagement from "../pages/AdminManagement";
import MentorScoring from "../pages/MentorScoring";
import ManagementLogin from "../pages/ManagementLogin";
import ParticipantLogin from "../pages/ParticipantLogin";
import SetPassword from "../pages/SetPassword";
import ManagementDashboard from "../pages/ManagementDashboard";
import ManagementWorkUpdate from "../pages/ManagementWorkUpdate";
import AdminManagementUpdates from "../pages/ManagementUpdates";
import ParticipantDashboard from "../pages/ParticipantDashboard";
function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "30px",
        background: "#f8fafc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "72px",
            margin: 0,
            color: "#0f172a",
          }}
        >
          404
        </h1>

        <p
          style={{
            color: "#64748b",
            margin: "12px 0 24px",
          }}
        >
          Page not found.
        </p>

        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 20px",
            borderRadius: "10px",
            background: "#4f46e5",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
}


export default function AppRoutes() {
  return (
    <Routes>

      {/* =========================
          PUBLIC
      ========================== */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/verify"
        element={<CertificateVerify />}
      />

      <Route
        path="/verify/:certificateId"
        element={<CertificateVerify />}
      />

      <Route
        path="/track"
        element={<TrackStatus />}
      />

      <Route
        path="/track/:teamId"
        element={<TrackStatus />}
      />


      {/* =========================
          PARTICIPANT
      ========================== */}

      <Route
        path="/participant/login"
        element={<ParticipantLogin />}
      />

      <Route
        path="/login"
        element={<ParticipantLogin />}
      />

      <Route
        path="/set-password"
        element={<SetPassword />}
      />

      <Route
        path="/participant"
        element={<ParticipantDashboard />}
      />
      {/* =========================
          MENTOR / JUDGE
      ========================== */}

      <Route
        path="/mentor"
        element={<MentorScoring />}
      />

      <Route
        path="/mentor/scoring"
        element={<MentorScoring />}
      />


      {/* =========================
          ADMIN
      ========================== */}

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      <Route
        path="/admin"
        element={<AdminDashboard />}
      />

      <Route
        path="/admin/dashboard"
        element={<AdminDashboard />}
      />

      <Route
        path="/admin/attendance"
        element={<AdminAttendance />}
      />

      <Route
        path="/admin/scoring"
        element={<AdminScoringResults />}
      />

      <Route
        path="/admin/scoring-results"
        element={<AdminScoringResults />}
      />

      <Route
        path="/admin/events"
        element={<AdminEvents />}
      />

      <Route
        path="/admin/certificates"
        element={<AdminCertificateStudio />}
      />

      <Route
        path="/admin/registration/:teamId"
        element={<AdminRegistrationDetails />}
      />

      <Route
        path="/admin/mentors"
        element={<AdminMentors />}
      />

      <Route
        path="/management/portal"
        element={<ManagementPortal />}
      />
      {/* =========================
          404
      ========================== */}

      <Route
        path="*"
        element={<NotFound />}
      />
      <Route
        path="/admin/management"
        element={<AdminManagement />}
      />
      <Route
        path="/management/login"
        element={<ManagementLogin />}
      />
      <Route
        path="/management"
        element={<ManagementDashboard />}
      />

      <Route
        path="/management/updates/new"
        element={<ManagementWorkUpdate />}
      />
      <Route
        path="/admin/management/updates"
        element={<AdminManagementUpdates />}
      />
    </Routes>
  );
}