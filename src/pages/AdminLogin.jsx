import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fillAdminCredentials = () => {
    setEmail("bakt.2007@gmail.com");
    setPassword("Ayush@2007");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your admin email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/v1/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const data = response?.data || response;
      const token = data?.token;
      const user = data?.user;

      if (!token || !user) {
        throw new Error("Invalid login response from server.");
      }

      if (String(user.role).toLowerCase() !== "admin") {
        throw new Error("Admin privileges are required to access this portal.");
      }

      localStorage.setItem("nexora_access_token", token);
      localStorage.setItem("nexora_user", JSON.stringify(user));

      navigate("/admin");
    } catch (err) {
      setError(
        err?.message || "Unable to authenticate. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-bg-glow" />

      <div className="admin-login-container">
        <section className="admin-login-card">
          {/* Header & Brand */}
          <div className="admin-login-header">
            <Link to="/" className="admin-brand-link" title="Go to Nexora Home">
              <span className="admin-brand-dot" />
              <strong>NEXORA</strong>
              <span className="admin-brand-sub">E-CELL</span>
            </Link>

            <span className="admin-login-badge">SECURE ADMIN PORTAL</span>
          </div>

          <div className="admin-login-heading">
            <h1>Admin Authentication</h1>
            <p>
              Sign in to manage registrations, evaluate teams, manage events,
              and issue cryptographically verified certificates.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="admin-login-form">
            {error && (
              <div className="admin-login-error" role="alert">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="admin-field">
              <label htmlFor="admin-email">Admin Email Address</label>
              <div className="admin-input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@nexora-ecell.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="admin-field">
              <div className="field-label-row">
                <label htmlFor="admin-password">Password</label>
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="admin-input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Hub</span>
                  <span className="admin-login-arrow">→</span>
                </>
              )}
            </button>

            {/* Quick Demo Fill Helper */}
            <div className="admin-demo-helper">
              <button
                type="button"
                className="quick-fill-button"
                onClick={fillAdminCredentials}
              >
                <span>⚡ Auto-fill Default Admin Credentials</span>
              </button>
            </div>
          </form>

          {/* Footer Back Link */}
          <div className="admin-login-footer">
            <Link to="/" className="admin-back-button">
              ← Return to NEXORA Public Website
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}