import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function ParticipantLogin() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier || !password) {
      setError(
        "Please enter your registered email / Team ID and password."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/api/v1/auth/login",
        {
          email: cleanIdentifier,
          password,
        }
      );

      const payload =
        response?.data || response;

      if (payload?.success === false) {
        setError(
          payload?.message ||
          "Unable to login."
        );
        return;
      }

      const token = payload?.token;
      const user = payload?.user;

      if (!token || !user) {
        throw new Error(
          "Login response is incomplete."
        );
      }

      const role = String(
        user?.role || ""
      )
        .trim()
        .toLowerCase();

      const participantRoles = [
        "leader",
        "student",
        "participant",
      ];

      if (!participantRoles.includes(role)) {
        setError(
          "This account is not a participant account. Please use the correct portal."
        );
        return;
      }

      localStorage.setItem(
        "access_token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      navigate("/participant", {
        replace: true,
      });

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to login. Please check your credentials."
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
          <h1>Participant Login</h1>
          <p>
            Login using your registered email or
            Team ID.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label>
            Email / Team ID
            <input
              type="text"
              value={identifier}
              onChange={(e) =>
                setIdentifier(e.target.value)
              }
              placeholder="you@example.com or NXR-TM-XXXXXX"
              autoComplete="username"
              disabled={loading}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
              autoComplete="current-password"
              disabled={loading}
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="auth-submit"
          >
            {loading
              ? "Signing in..."
              : "Login"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/set-password">
            First time? Create password
          </Link>

          <Link to="/register">
            New participant? Register
          </Link>

          <Link to="/admin/login">
            Admin / Mentor Login
          </Link>

          <Link to="/management/login">
            Management Login
          </Link>
        </div>
      </section>
    </main>
  );
}