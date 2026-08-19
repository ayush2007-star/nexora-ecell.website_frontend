import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError("Please enter email and password.");
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
        throw new Error("Admin access required.");
      }

      localStorage.setItem("nexora_access_token", token);
      localStorage.setItem("nexora_user", JSON.stringify(user));

      navigate("/admin");
    } catch (err) {
      setError(
        err?.message || "Unable to login. Please check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-background" />

      <section className="admin-login-card">
        {/* Brand */}
        <div className="admin-login-brand">
          <span className="admin-brand-dot" />
          <span>NEXORA</span>
        </div>

        {/* Heading */}
        <div className="admin-login-heading">
          <span className="admin-login-badge">
            ADMIN SECURE ACCESS
          </span>

          <h1>
            Welcome <span>Admin.</span>
          </h1>

          <p>
            Sign in to manage registrations, teams, events, and generate verified certificates.
          </p>
        </div>

        {/* Quick Admin Helper */}
        <div className="admin-quick-helper">
          <div className="quick-helper-text">
            <span>👑 Super Admin Account:</span>
            <code>bakt.2007@gmail.com</code>
          </div>
          <button
            type="button"
            className="quick-fill-button"
            onClick={fillAdminCredentials}
          >
            ⚡ Auto-Fill Credentials
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="admin-field">
            <label htmlFor="email">Admin Email</label>
            <input
              id="email"
              type="email"
              placeholder="bakt.2007@gmail.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={loading}
              required
            />
          </div>

          {/* Password */}
          <div className="admin-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={loading}
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            <span>
              {loading ? "Authenticating..." : "Sign In to Admin Portal"}
            </span>
            {!loading && <span className="admin-login-arrow">→</span>}
          </button>
        </form>

        {/* Back to Home */}
        <Link to="/" className="admin-back-button">
          ← Return to Public Website
        </Link>
      </section>
    </main>
  );
}