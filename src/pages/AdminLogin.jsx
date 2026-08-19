import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        email: email.trim(),
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
        err?.message || "Unable to login. Please try again."
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
            ADMIN PORTAL
          </span>

          <h1>
            Welcome <span>back.</span>
          </h1>

          <p>
            Sign in to manage registrations and
            monitor the Nexora Innovation Portal.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="admin-field">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="admin-field">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="current-password"
              disabled={loading}
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
              {loading
                ? "Signing in..."
                : "Sign in to Admin"}
            </span>

            {!loading && (
              <span className="admin-login-arrow">
                →
              </span>
            )}
          </button>
        </form>

        {/* Back */}
        <button
          type="button"
          className="admin-back-button"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>
      </section>
    </main>
  );
}