import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function SetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Enter your registered email.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/api/v1/auth/set-password",
        {
          email: email.trim().toLowerCase(),
          password,
        }
      );

      const payload =
        response?.data || response;

      setMessage(
        payload?.message ||
          "Password created successfully."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/participant/login");
      }, 1200);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to create password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          NEXORA E-CELL
        </Link>

        <div className="auth-heading">
          <h1>Create Password</h1>

          <p>
            Your registration must be approved by
            admin before you can create a password.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {message && (
          <div className="auth-success">
            {message}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label>
            Registered Email
            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            New Password
            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              required
            />
          </label>

          <label>
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Repeat password"
              autoComplete="new-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="auth-submit"
          >
            {loading
              ? "Creating..."
              : "Create Password"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/participant/login">
            ← Back to login
          </Link>
        </div>
      </section>
    </main>
  );
}