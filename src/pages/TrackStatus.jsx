import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./TrackStatus.css";

export default function TrackStatus() {
  const { teamId: paramTeamId } = useParams();

  const [identifier, setIdentifier] = useState(paramTeamId || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (paramTeamId) {
      setIdentifier(paramTeamId);
      performTrack(paramTeamId);
    }
  }, [paramTeamId]);

  const performTrack = async (searchQuery) => {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) {
      setError("Please enter your Team ID or registered email.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setSearched(true);

    try {
      const response = await api.get(
        `/api/v1/registration/track/${encodeURIComponent(cleanQuery)}`
      );
      const data = response?.data || response;

      if (!data || !data.teamId) {
        throw new Error("No registration found with this Team ID or Email.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err?.message || "No registration found with this Team ID or Email."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performTrack(identifier);
  };

  const getStatusClass = (status) => {
    const s = String(status || "pending").toLowerCase();
    if (s === "approved") return "status-approved";
    if (s === "rejected") return "status-rejected";
    return "status-pending";
  };

  return (
    <div className="website">
      <Navbar />

      <main className="track-page">
        <div className="track-hero">
          <div className="container">
            <div className="track-header">
              <span className="track-badge">REAL-TIME REGISTRATION TRACKER</span>
              <h1>
                Track Your <span>Application</span>
              </h1>
              <p>
                Enter your unique Team ID (e.g. <code>TEAM-...</code>) or the
                email address used by your team leader during registration.
              </p>

              <form onSubmit={handleSubmit} className="track-search-box">
                <input
                  type="text"
                  placeholder="Enter Team ID or Leader Email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
                <button type="submit" className="button button-primary" disabled={loading}>
                  {loading ? "Searching..." : "Track Status →"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <section className="container track-result-section">
          {loading && (
            <div className="track-card text-center">
              <div className="track-spinner" />
              <p>Fetching application record...</p>
            </div>
          )}

          {error && searched && !loading && (
            <div className="track-card track-error-card">
              <span className="error-icon">🔍</span>
              <h3>No Record Found</h3>
              <p>{error}</p>
              <div className="track-help-box">
                <p>Did you register recently?</p>
                <ul>
                  <li>Check the exact Team ID provided upon registration.</li>
                  <li>Ensure the email address matches the Team Leader's email.</li>
                  <li>
                    Need help? Contact us at <code>contact@nexora-ecell.in</code>.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="track-card track-details-card">
              <div className="track-details-header">
                <div>
                  <span className="team-id-badge">TEAM ID: {result.teamId}</span>
                  <h2>{result.projectName || result.teamName}</h2>
                  <p className="team-lead-text">
                    Led by <strong>{result.leaderName}</strong>
                  </p>
                </div>

                <div className={`status-pill ${getStatusClass(result.status)}`}>
                  <span className="status-dot" />
                  {result.status}
                </div>
              </div>

              {/* TIMELINE */}
              <div className="track-timeline">
                <div className="timeline-step step-done">
                  <div className="step-marker">✓</div>
                  <div className="step-info">
                    <strong>1. Registration Submitted</strong>
                    <small>Team and project details registered</small>
                  </div>
                </div>

                <div
                  className={`timeline-step ${
                    result.status !== "Pending" ? "step-done" : "step-active"
                  }`}
                >
                  <div className="step-marker">
                    {result.status !== "Pending" ? "✓" : "2"}
                  </div>
                  <div className="step-info">
                    <strong>2. Under Evaluation</strong>
                    <small>E-Cell faculty & judge committee review</small>
                  </div>
                </div>

                <div
                  className={`timeline-step ${
                    result.status === "Approved"
                      ? "step-done"
                      : result.status === "Rejected"
                      ? "step-rejected"
                      : "step-pending"
                  }`}
                >
                  <div className="step-marker">
                    {result.status === "Approved"
                      ? "✓"
                      : result.status === "Rejected"
                      ? "✕"
                      : "3"}
                  </div>
                  <div className="step-info">
                    <strong>3. Final Decision</strong>
                    <small>
                      {result.status === "Approved"
                        ? "Application Approved"
                        : result.status === "Rejected"
                        ? "Application Rejected"
                        : "Awaiting decision"}
                    </small>
                  </div>
                </div>

                <div
                  className={`timeline-step ${
                    result.hasCertificate ? "step-done" : "step-pending"
                  }`}
                >
                  <div className="step-marker">
                    {result.hasCertificate ? "✓" : "4"}
                  </div>
                  <div className="step-info">
                    <strong>4. Certificate Issuance</strong>
                    <small>
                      {result.hasCertificate
                        ? "Certificate Generated"
                        : "Post-approval issuance"}
                    </small>
                  </div>
                </div>
              </div>

              {/* PROJECT INFO GRID */}
              <div className="track-meta-grid">
                <div className="track-meta-item">
                  <label>Domain</label>
                  <strong>{result.domain || "Technology"}</strong>
                </div>

                <div className="track-meta-item">
                  <label>Stage</label>
                  <strong>{result.stage || "Ideation"}</strong>
                </div>

                <div className="track-meta-item">
                  <label>Submitted On</label>
                  <strong>
                    {result.createdAt
                      ? new Date(result.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </strong>
                </div>
              </div>

              {/* REMARKS IF ANY */}
              {result.remarks && (
                <div className="track-remarks-box">
                  <label>Feedback / Admin Remarks:</label>
                  <p>{result.remarks}</p>
                </div>
              )}

              {/* CERTIFICATE LINK IF GENERATED */}
              {result.certificateId && (
                <div className="track-cert-box">
                  <span className="cert-star">★</span>
                  <div>
                    <strong>Official Certificate Generated!</strong>
                    <p>
                      Certificate ID: <code>{result.certificateId}</code>
                    </p>
                  </div>
                  <Link
                    to={`/verify/${result.certificateId}`}
                    className="button button-primary track-cert-button"
                  >
                    View Certificate →
                  </Link>
                </div>
              )}

              {/* FOOTER ACTIONS */}
              <div className="track-actions">
                <Link to="/register" className="button button-ghost">
                  + Register Another Team
                </Link>
                <Link to="/" className="button button-ghost">
                  ← Back to Home
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
