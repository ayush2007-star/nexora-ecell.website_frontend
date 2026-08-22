import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import "./MentorScoring.css";

const CRITERIA = [
  {
    key: "ideaUsp",
    label: "1. Startup Idea and USP",
    desc: "Uniqueness of value proposition, innovation depth, and competitive moat.",
    max: 5,
  },
  {
    key: "targetMarket",
    label: "2. Target Market and Size",
    desc: "TAM/SAM clarity, customer segment definition, and initial beachhead addressability.",
    max: 5,
  },
  {
    key: "growthPotential",
    label: "3. Growth Potential",
    desc: "Scalability, network effects, distribution leverage, and unit economics.",
    max: 5,
  },
  {
    key: "revenueModel",
    label: "4. Revenue Model",
    desc: "Monetization clarity, pricing strategy, customer lifetime value, and profitability path.",
    max: 5,
  },
  {
    key: "stageFuturePlans",
    label: "5. Stage of Startup and Future Plans",
    desc: "Current progress/MVP validation, 12-month roadmap, milestones, and hiring vision.",
    max: 5,
  },
  {
    key: "teamMembers",
    label: "6. Team Members",
    desc: "Execution capability, domain expertise, complementary skills, and founder resilience.",
    max: 5,
  },
];

export default function MentorScoring() {
  const navigate = useNavigate();

  const [startups, setStartups] = useState([]);
  const [metrics, setMetrics] = useState({
    totalStartups: 0,
    evaluatedCount: 0,
    pendingCount: 0,
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Scoring Modal State
  const [activeStartup, setActiveStartup] = useState(null);
  const [scores, setScores] = useState({
    ideaUsp: 0,
    targetMarket: 0,
    growthPotential: 0,
    revenueModel: 0,
    stageFuturePlans: 0,
    teamMembers: 0,
  });
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem("nexora_user") || "null");

  useEffect(() => {
    const token =  localStorage.getItem("access_token") ||
  localStorage.getItem("nexora_access_token") ||
  localStorage.getItem("nexra_access_token");
    const role = String(user?.role).toLowerCase();

    if (!token || (role !== "mentor" && role !== "admin")) {
      navigate("/admin/login", { replace: true });
      return;
    }

    loadStartups();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const loadStartups = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/api/v1/scoring/mentor/startups");
      const data = res?.data || res;

      setStartups(data?.startups || []);
      if (data?.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      setError(err?.message || "Failed to load startups for evaluation.");
    } finally {
      setLoading(false);
    }
  };

  const openScorecard = (startup) => {
    setActiveStartup(startup);
    if (startup.myScore && startup.myScore.scores) {
      setScores({
        ideaUsp: startup.myScore.scores.ideaUsp ?? 0,
        targetMarket: startup.myScore.scores.targetMarket ?? 0,
        growthPotential: startup.myScore.scores.growthPotential ?? 0,
        revenueModel: startup.myScore.scores.revenueModel ?? 0,
        stageFuturePlans: startup.myScore.scores.stageFuturePlans ?? 0,
        teamMembers: startup.myScore.scores.teamMembers ?? 0,
      });
      setFeedback(startup.myScore.feedback || "");
    } else {
      setScores({
        ideaUsp: 0,
        targetMarket: 0,
        growthPotential: 0,
        revenueModel: 0,
        stageFuturePlans: 0,
        teamMembers: 0,
      });
      setFeedback("");
    }
  };

  const closeScorecard = () => {
    setActiveStartup(null);
  };

  const calculateTotal = () => {
    const total =
      Number(scores.ideaUsp || 0) +
      Number(scores.targetMarket || 0) +
      Number(scores.growthPotential || 0) +
      Number(scores.revenueModel || 0) +
      Number(scores.stageFuturePlans || 0) +
      Number(scores.teamMembers || 0);
    return Math.min(30, Math.round(total * 100) / 100);
  };

  const handleScoreChange = (key, value) => {
    let num = parseFloat(value);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 5) num = 5;

    setScores((prev) => ({
      ...prev,
      [key]: num,
    }));
  };

  const handleSaveScore = async (e) => {
    e.preventDefault();
    if (!activeStartup) return;

    try {
      setSubmitting(true);

      const payload = {
        teamId: activeStartup.teamId,
        scores: {
          ideaUsp: Number(scores.ideaUsp),
          targetMarket: Number(scores.targetMarket),
          growthPotential: Number(scores.growthPotential),
          revenueModel: Number(scores.revenueModel),
          stageFuturePlans: Number(scores.stageFuturePlans),
          teamMembers: Number(scores.teamMembers),
        },
        feedback: feedback.trim(),
      };

      const res = await api.post("/api/v1/scoring/mentor/submit", payload);
      const data = res?.data || res;

      const total = calculateTotal();
      showToast(`✅ Evaluation saved: ${activeStartup.teamName} (${total}/30)`);

      // Update local startup state
      setStartups((prev) =>
        prev.map((s) =>
          s.teamId === activeStartup.teamId
            ? {
                ...s,
                isEvaluated: true,
                myScore: {
                  scores: payload.scores,
                  totalScore: total,
                  feedback: feedback.trim(),
                  updatedAt: new Date().toISOString(),
                },
              }
            : s
        )
      );

      setMetrics((prev) => ({
        ...prev,
        evaluatedCount: activeStartup.isEvaluated ? prev.evaluatedCount : prev.evaluatedCount + 1,
        pendingCount: activeStartup.isEvaluated ? prev.pendingCount : Math.max(0, prev.pendingCount - 1),
      }));

      closeScorecard();
    } catch (err) {
      alert(`Error submitting score: ${err?.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("nexora_access_token");
  localStorage.removeItem("nexra_access_token");
  localStorage.removeItem("user");
  localStorage.removeItem("nexora_user");

  window.location.href = "/management/login";
};

  const filteredStartups = startups.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.teamName || "").toLowerCase().includes(q) ||
      (s.eurekaTeamId || "").toLowerCase().includes(q) ||
      (s.teamId || "").toLowerCase().includes(q) ||
      (s.leaderName || "").toLowerCase().includes(q) ||
      (s.domain || "").toLowerCase().includes(q)
    );
  });

  return (
    <main className="mentor-portal-page">
      {/* HEADER */}
      <header className="mentor-portal-header">
        <div className="mentor-brand-section">
          <Link to="/" style={{ textDecoration: "none", color: "#fff", fontWeight: "800", fontSize: "18px" }}>
            NEXORA E-CELL
          </Link>
          <span className="mentor-portal-badge">JURY & MENTOR PORTAL</span>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div className="mentor-user-badge">
            <span>👤</span>
            <span>{user?.fullName || "Judge / Mentor"}</span>
            <span style={{ fontSize: "11px", color: "#818cf8" }}>({user?.email})</span>
          </div>

          {String(user?.role).toLowerCase() === "admin" && (
            <Link
              to="/admin/dashboard"
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#cbd5e1",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              ← Admin Hub
            </Link>
          )}

          <button className="mentor-logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mentor-content">
        {/* HERO CARD */}
        <div className="mentor-hero-card">
          <div>
            <h1>Startup Evaluation Panel</h1>
            <p>
              Score each startup across the 6 official judging criteria (0 to 5 points each). Maximum 30 points per mentor.
            </p>
          </div>

          <div className="mentor-stats-pills">
            <div className="stat-pill">
              <span>Total Startups</span>
              <strong>{metrics.totalStartups}</strong>
            </div>
            <div className="stat-pill evaluated">
              <span>Evaluated</span>
              <strong>{metrics.evaluatedCount}</strong>
            </div>
            <div className="stat-pill pending">
              <span>Pending</span>
              <strong>{metrics.pendingCount}</strong>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div style={{ marginBottom: "24px" }}>
          <input
            type="text"
            placeholder="🔍 Search startups by name, Eureka ID, domain, or founder..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 18px",
              fontSize: "15px",
              background: "rgba(30, 41, 59, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "14px",
              color: "#ffffff",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <div style={{ padding: "16px", background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", borderRadius: "12px", color: "#fca5a5", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {/* GRID */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            Loading startups for evaluation...
          </div>
        ) : filteredStartups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", background: "rgba(30, 41, 59, 0.5)", borderRadius: "18px" }}>
            <h3 style={{ color: "#ffffff", margin: "0 0 8px 0" }}>No startups found</h3>
            <p style={{ color: "#94a3b8", margin: 0 }}>Try clearing your search query.</p>
          </div>
        ) : (
          <div className="startups-grid">
            {filteredStartups.map((s) => {
              const hasScore = s.isEvaluated && s.myScore;
              const totalScore = hasScore ? s.myScore.totalScore : 0;

              return (
                <div key={s.teamId} className={`startup-card ${hasScore ? "scored" : "pending"}`}>
                  <div>
                    <div className="startup-card-header">
                      <span className="startup-eureka-tag">{s.eurekaTeamId || s.teamId}</span>
                      <span style={{ fontSize: "11px", color: "#94a3b8", background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: "6px" }}>
                        {s.stage || "MVP"}
                      </span>
                    </div>

                    <h3 className="startup-title">{s.teamName}</h3>
                    <div className="startup-domain-tag">🚀 {s.domain} • Founder: {s.leaderName}</div>

                    <p className="startup-desc">{s.description}</p>

                    {s.pitchDeckUrl && (
                      <a
                        href={s.pitchDeckUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#818cf8",
                          textDecoration: "none",
                          margin: "6px 0",
                        }}
                      >
                        📄 View Pitch Deck ↗
                      </a>
                    )}
                  </div>

                  <div className="startup-footer">
                    <div>
                      {hasScore ? (
                        <div className="score-badge-done">
                          <span>✅ Score:</span>
                          <strong style={{ fontSize: "16px" }}>{totalScore}/30</strong>
                        </div>
                      ) : (
                        <div className="score-badge-pending">
                          <span>⏳ Score Pending</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn-evaluate"
                      onClick={() => openScorecard(s)}
                    >
                      {hasScore ? "✏️ Edit Score" : "⚡ Score Startup"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SCORECARD MODAL */}
      {activeStartup && (
        <div className="scorecard-backdrop" onClick={closeScorecard}>
          <div className="scorecard-modal" onClick={(e) => e.stopPropagation()}>
            {/* MODAL HEADER */}
            <div className="scorecard-header">
              <div>
                <span className="startup-eureka-tag">{activeStartup.eurekaTeamId || activeStartup.teamId}</span>
                <h2>{activeStartup.teamName}</h2>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                  {activeStartup.domain} • Founder: {activeStartup.leaderName}
                </span>
              </div>

              <button type="button" className="scorecard-btn-close" onClick={closeScorecard}>
                ✕
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSaveScore}>
              <div className="criteria-list">
                {CRITERIA.map((crit) => {
                  const currentVal = scores[crit.key] ?? 0;

                  return (
                    <div key={crit.key} className="criteria-card">
                      <div className="criteria-info" style={{ flex: 1 }}>
                        <strong>{crit.label}</strong>
                        <span>{crit.desc}</span>
                      </div>

                      <div className="score-buttons-row">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            className={`score-num-btn ${currentVal === val ? "selected" : ""}`}
                            onClick={() => handleScoreChange(crit.key, val)}
                          >
                            {val}
                          </button>
                        ))}

                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="5"
                          className="custom-num-input"
                          value={currentVal}
                          onChange={(e) => handleScoreChange(crit.key, e.target.value)}
                          title="Custom decimal score (0-5)"
                        />
                        <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "700" }}>/5</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TOTAL SCORE BOX */}
              <div className="scorecard-total-box">
                <div>
                  <span style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>
                    Mentor Evaluation Total
                  </span>
                  <div style={{ fontSize: "13px", color: "#cbd5e1", marginTop: "2px" }}>
                    Sum of all 6 criteria (Max 30 points)
                  </div>
                </div>

                <strong>{calculateTotal()} / 30</strong>
              </div>

              {/* REMARKS */}
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#cbd5e1", fontWeight: "700", marginBottom: "6px" }}>
                  Judge / Mentor Remarks & Feedback (Optional):
                </label>
                <textarea
                  className="feedback-textarea"
                  placeholder="Key strengths, unit economics feedback, market barrier observations..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="scorecard-footer-btns">
                <button type="button" className="btn-cancel" onClick={closeScorecard}>
                  Cancel
                </button>
                <button type="submit" className="btn-save-score" disabled={submitting}>
                  {submitting ? "Saving..." : `Save Score (${calculateTotal()}/30)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && <div className="toast-message">{toast}</div>}
    </main>
  );
}
