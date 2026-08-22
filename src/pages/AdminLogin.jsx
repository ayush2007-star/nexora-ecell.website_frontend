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

  const fillCredentials = (roleEmail, rolePassword) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
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
        throw new Error(
          "Invalid login response from server."
        );
      }

      const role = String(
        user.role || ""
      )
        .trim()
        .toLowerCase();

      // Admin login page accepts ADMIN only.
      if (role !== "admin") {
        throw new Error(
          "This login is restricted to Administrator accounts."
        );
      }

      // Keep the existing project storage keys.
      localStorage.setItem(
        "access_token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      navigate("/admin", {
        replace: true,
      });

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to authenticate. Please check your credentials."
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

            <span className="admin-login-badge">PORTAL AUTHENTICATION</span>
          </div>

          <div className="admin-login-heading">
            <h1>Administrator Portal</h1>
            <p>
              Sign in as an Administrator to manage the
              Nexora E-Cell event platform.
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
              <label htmlFor="admin-email">Email Address</label>
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
                  <span>Sign In to Portal</span>
                  <span className="admin-login-arrow">→</span>
                </>
              )}
            </button>
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