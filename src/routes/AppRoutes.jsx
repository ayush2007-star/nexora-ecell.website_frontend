import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminRegistrationDetails from "../pages/AdminRegistrationDetails";
import Home from "../pages/Home";
import Register from "../pages/Register";
import CertificateVerify from "../pages/CertificateVerify";
import TrackStatus from "../pages/TrackStatus";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard";
import AdminEvents from "../pages/AdminEvents";
import AdminCertificateStudio from "../pages/AdminCertificateStudio";

export default function AppRoutes() {
  return (
    <Routes>
      {/* =========================
          PUBLIC ROUTES
      ========================== */}

      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<CertificateVerify />} />
      <Route path="/verify/:certificateId" element={<CertificateVerify />} />
      <Route path="/track" element={<TrackStatus />} />
      <Route path="/track/:teamId" element={<TrackStatus />} />

      {/* =========================
          ADMIN ROUTES
      ========================== */}

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/events" element={<AdminEvents />} />
      <Route path="/admin/certificates" element={<AdminCertificateStudio />} />
      <Route path="/admin/registration/:teamId" element={<AdminRegistrationDetails />} />

      {/* =========================
          404
      ========================== */}

      <Route
        path="*"
        element={
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
        }
      />
    </Routes>
  );
}