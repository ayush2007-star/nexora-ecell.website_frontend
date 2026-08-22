import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "./ManagementLogin.css";

export default function ManagementLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
  event.preventDefault();
  setError("");

  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password) {
    setError("Email and password are required.");
    return;
  }

  setLoading(true);

  try {
    const response = await api.post(
      "/api/v1/auth/login",
      {
        email: cleanEmail,
        password,
      }
    );

    const data = response?.data ?? response;

    if (!data?.success) {
      setError(
        data?.message || "Unable to login."
      );
      return;
    }

    const token = data?.token;
    const user = data?.user;

    if (!token || !user) {
      setError(
        "Invalid login response from server."
      );
      return;
    }

    const role = String(
      user?.role || ""
    )
      .trim()
      .toLowerCase();

    if (role !== "management") {
      setError(
        "This account does not have management access."
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

    navigate("/management", {
      replace: true,
    });

  } catch (err) {
    setError(
      err?.response?.data?.message ||
      err?.message ||
      "Unable to connect to the server."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="management-login-page">

      <div className="management-login-shell">

        <section className="management-login-info">

          <div className="management-login-logo">
            NEXORA
          </div>

          <div className="management-login-label">
            EVENT OPERATIONS
          </div>

          <h1>
            Management
            <br />
            Portal
          </h1>

          <p>
            Manage event operations, submit work
            updates, coordinate activities and keep
            the organizing team informed.
          </p>

          <div className="management-login-points">

            <div>
              <span>01</span>
              Event Operations
            </div>

            <div>
              <span>02</span>
              Work Updates
            </div>

            <div>
              <span>03</span>
              Team Coordination
            </div>

          </div>

        </section>

        <section className="management-login-card">

          <div className="management-login-card-header">

            <span>
              MANAGEMENT ACCESS
            </span>

            <h2>
              Sign in
            </h2>

            <p>
              Use the management account created
              by the administrator.
            </p>

          </div>

          {error && (
            <div className="management-login-error">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="management-login-form"
          >

            <label>
              Email Address

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="manager@example.com"
                autoComplete="email"
                disabled={loading}
                required
              />
            </label>

            <label>
              Password

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in to Management Portal"}
            </button>

          </form>

          <div className="management-login-footer">
            Management accounts are created and
            controlled by the administrator.
          </div>

        </section>

      </div>

    </main>
  );
}