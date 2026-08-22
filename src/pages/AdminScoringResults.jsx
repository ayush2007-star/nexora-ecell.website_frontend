import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import "./AdminScoringResults.css";

const CRITERIA_LABELS = {
  ideaUsp: "Startup Idea & USP",
  targetMarket: "Target Market & Size",
  growthPotential: "Growth Potential",
  revenueModel: "Revenue Model",
  stageFuturePlans: "Stage & Future Plans",
  teamMembers: "Team Members",
};

export default function AdminScoringResults() {
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState([]);
  const [metrics, setMetrics] = useState({
    totalStartups: 0,
    fullyEvaluatedCount: 0,
    pendingEvaluationsCount: 0,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Detailed Modal State
  const [selectedStartup, setSelectedStartup] = useState(null);

  const user = JSON.parse(localStorage.getItem("nexora_user") || "null");

  useEffect(() => {
    const token =  localStorage.getItem("access_token") ||
  localStorage.getItem("nexora_access_token") ||
  localStorage.getItem("nexra_access_token");
    if (!token || String(user?.role).toLowerCase() !== "admin") {
      navigate("/admin/login", { replace: true });
      return;
    }

    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/api/v1/scoring/admin/results");
      const data = res?.data || res;

      setLeaderboard(data?.leaderboard || []);
      if (data?.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      setError(err?.message || "Failed to load scoring leaderboard.");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (leaderboard.length === 0) {
      alert("No scoring results to export.");
      return;
    }

    const headers = [
      "Rank",
      "Eureka ID",
      "Startup Name",
      "Domain",
      "Leader Name",
      "Mentor 1 (30)",
      "Mentor 2 (30)",
      "Mentor 3 (30)",
      "Mentor 4 (30)",
      "Combined Total",
      "Average Score (30)",
      "Percentage",
      "Mentors Evaluated",
    ];

    const rows = leaderboard.map((r) => [
      r.rank || "",
      r.eurekaTeamId || r.teamId || "",
      `"${(r.teamName || "").replace(/"/g, '""')}"`,
      `"${(r.domain || "").replace(/"/g, '""')}"`,
      `"${(r.leaderName || "").replace(/"/g, '""')}"`,
      r.mentor1?.submitted ? r.mentor1.totalScore : "Pending",
      r.mentor2?.submitted ? r.mentor2.totalScore : "Pending",
      r.mentor3?.submitted ? r.mentor3.totalScore : "Pending",
      r.mentor4?.submitted ? r.mentor4.totalScore : "Pending",
      r.isFullyEvaluated ? `${r.combinedTotal}/120` : `${r.combinedTotal}/${r.maxPossibleScore}`,
      r.averageScore || "0",
      `${r.percentage}%`,
      `${r.submittedCount}/4`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `nexora_scoring_leaderboard_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("nexora_access_token");
  localStorage.removeItem("nexra_access_token");
  localStorage.removeItem("user");
  localStorage.removeItem("nexora_user");

  window.location.href = "/admin/login";
};

  const filteredItems = leaderboard.filter((item) => {
    if (statusFilter === "completed" && !item.isFullyEvaluated) return false;
    if (statusFilter === "pending" && item.isFullyEvaluated) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (item.teamName || "").toLowerCase().includes(q) ||
      (item.eurekaTeamId || "").toLowerCase().includes(q) ||
      (item.domain || "").toLowerCase().includes(q) ||
      (item.leaderName || "").toLowerCase().includes(q)
    );
  });

  return (
    <main className="scoring-results-page">
      {/* HEADER */}
      <header className="admin-dashboard-header">
        <div className="admin-brand-section">
          <div className="admin-dashboard-brand">
            <span className="admin-brand-dot" />
            NEXORA
          </div>
          <span className="admin-portal-tag">ADMIN PORTAL</span>
        </div>

        {/* NAVIGATION TABS */}
        <nav className="admin-nav-tabs">
          <Link to="/admin/dashboard" className="admin-nav-item">
            📊 Dashboard
          </Link>
          <Link to="/admin/attendance" className="admin-nav-item">
            📋 Attendance & Food
          </Link>
          <Link to="/admin/scoring" className="admin-nav-item active">
            🏆 Mentor Scoring
          </Link>
          <Link to="/admin/events" className="admin-nav-item">
            🎪 Events
          </Link>
          <Link to="/admin/certificates" className="admin-nav-item">
            🎨 Certificates
          </Link>
        </nav>

        <div className="admin-header-actions">
          <Link to="/" className="admin-home-link" target="_blank">
            Public Website ↗
          </Link>

          <div className="admin-user-info">
            <strong>{user?.fullName || "Administrator"}</strong>
            <span>Administrator</span>
          </div>

          <button className="admin-logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <section className="scoring-results-content">
        <div className="scoring-header-section">
          <div>
            <span className="attendance-section-badge">JURY EVALUATION LEADERBOARD</span>
            <h1>Judge & Mentor Scoring Results</h1>
            <p>
              Automatic combined ranking of all 4 mentor scores (6 criteria, 30 pts each, Max 120 combined).
            </p>
          </div>

          <div className="attendance-top-btns">
            <button className="attendance-btn-export" onClick={exportCSV}>
              📥 Export Leaderboard CSV
            </button>
            <button className="attendance-btn-refresh" onClick={loadLeaderboard}>
              🔄 Refresh Leaderboard
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && <div className="admin-dashboard-error">{error}</div>}

        {/* STAT CARDS */}
        <div className="scoring-stats-grid">
          <div className="scoring-stat-card">
            <span>Total Startups</span>
            <strong>{metrics.totalStartups}</strong>
          </div>

          <div className="scoring-stat-card" style={{ borderLeft: "4px solid #16a34a" }}>
            <span>Fully Evaluated (4/4 Mentors)</span>
            <strong style={{ color: "#16a34a" }}>{metrics.fullyEvaluatedCount}</strong>
          </div>

          <div className="scoring-stat-card" style={{ borderLeft: "4px solid #d97706" }}>
            <span>Evaluations Pending</span>
            <strong style={{ color: "#d97706" }}>{metrics.pendingEvaluationsCount}</strong>
          </div>

          <div className="scoring-stat-card" style={{ borderLeft: "4px solid #4f46e5" }}>
            <span>Top Performing Score</span>
            <strong style={{ color: "#4f46e5" }}>
              {leaderboard.length > 0 ? `${leaderboard[0].combinedTotal}/120` : "—"}
            </strong>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="attendance-filter-card">
          <div className="attendance-search-box">
            <span className="search-icon-inside">🔍</span>
            <input
              type="text"
              placeholder="Search startup name, Eureka ID, domain or founder..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="attendance-search-input"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="attendance-select-filter"
          >
            <option value="">All Evaluations</option>
            <option value="completed">Completed (4/4 Mentors Only)</option>
            <option value="pending">Pending Mentors</option>
          </select>

          {(search || statusFilter) && (
            <button
              className="attendance-clear-btn"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* LEADERBOARD TABLE */}
        <div className="leaderboard-table-container">
          {loading && leaderboard.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              Loading scoring results...
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ padding: "50px", textAlign: "center" }}>
              <h3 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>No evaluations found</h3>
              <p style={{ margin: 0, color: "#64748b" }}>Try adjusting your search criteria.</p>
            </div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Startup / Team</th>
                  <th>Eureka ID</th>
                  <th>Mentor 1</th>
                  <th>Mentor 2</th>
                  <th>Mentor 3</th>
                  <th>Mentor 4</th>
                  <th>Combined Score</th>
                  <th>Average (30)</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const rankClass =
                    item.rank === 1
                      ? "rank-1"
                      : item.rank === 2
                      ? "rank-2"
                      : item.rank === 3
                      ? "rank-3"
                      : "rank-other";

                  return (
                    <tr key={item.teamId}>
                      <td>
                        <span className={`rank-badge ${rankClass}`}>
                          #{item.rank}
                        </span>
                      </td>

                      <td>
                        <div className="participant-info">
                          <span className="participant-name">{item.teamName}</span>
                          <span className="participant-team">🚀 {item.domain}</span>
                          <span className="participant-contact">Founder: {item.leaderName}</span>
                        </div>
                      </td>

                      <td>
                        <span className="eureka-badge">{item.eurekaTeamId || item.teamId}</span>
                      </td>

                      <td>
                        {item.mentor1?.submitted ? (
                          <span className="mentor-score-pill submitted">
                            {item.mentor1.totalScore}/30
                          </span>
                        ) : (
                          <span className="mentor-score-pill pending">⏳ Pending</span>
                        )}
                      </td>

                      <td>
                        {item.mentor2?.submitted ? (
                          <span className="mentor-score-pill submitted">
                            {item.mentor2.totalScore}/30
                          </span>
                        ) : (
                          <span className="mentor-score-pill pending">⏳ Pending</span>
                        )}
                      </td>

                      <td>
                        {item.mentor3?.submitted ? (
                          <span className="mentor-score-pill submitted">
                            {item.mentor3.totalScore}/30
                          </span>
                        ) : (
                          <span className="mentor-score-pill pending">⏳ Pending</span>
                        )}
                      </td>

                      <td>
                        {item.mentor4?.submitted ? (
                          <span className="mentor-score-pill submitted">
                            {item.mentor4.totalScore}/30
                          </span>
                        ) : (
                          <span className="mentor-score-pill pending">⏳ Pending</span>
                        )}
                      </td>

                      <td>
                        <div className="total-score-badge">
                          {item.isFullyEvaluated ? (
                            <span>{item.combinedTotal}/120</span>
                          ) : (
                            <span style={{ color: "#d97706" }}>
                              {item.combinedTotal}/{item.maxPossibleScore}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          {item.percentage}% ({item.submittedCount}/4)
                        </span>
                      </td>

                      <td>
                        <div className="average-score-badge">{item.averageScore}</div>
                        <span style={{ fontSize: "10.5px", color: "#64748b" }}>out of 30</span>
                      </td>

                      <td>
                        {item.isFullyEvaluated ? (
                          <span className="badge-present">✅ Completed</span>
                        ) : (
                          <span className="badge-absent">⏳ {item.submittedCount}/4 Incomplete</span>
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="btn-view-breakdown"
                          onClick={() => setSelectedStartup(item)}
                        >
                          🔍 Breakdown
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* DETAIL BREAKDOWN MODAL */}
      {selectedStartup && (
        <div className="breakdown-backdrop" onClick={() => setSelectedStartup(null)}>
          <div className="breakdown-modal" onClick={(e) => e.stopPropagation()}>
            <div className="breakdown-modal-header">
              <div>
                <span className="eureka-badge">{selectedStartup.eurekaTeamId || selectedStartup.teamId}</span>
                <h2>{selectedStartup.teamName} — Criteria Scorecard Breakdown</h2>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  {selectedStartup.domain} • Founder: {selectedStartup.leaderName}
                </span>
              </div>

              <button
                type="button"
                className="scorecard-btn-close"
                style={{ background: "#f1f5f9", color: "#0f172a" }}
                onClick={() => setSelectedStartup(null)}
              >
                ✕
              </button>
            </div>

            {/* COMBINED SUMMARY */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                background: "#eef2ff",
                border: "1px solid #c7d2fe",
                borderRadius: "14px",
                marginBottom: "20px",
              }}
            >
              <div>
                <strong style={{ fontSize: "16px", color: "#3730a3" }}>Overall Rank: #{selectedStartup.rank}</strong>
                <div style={{ fontSize: "12.5px", color: "#4f46e5" }}>
                  Submitted: {selectedStartup.submittedCount}/4 Mentors • Average: {selectedStartup.averageScore}/30
                </div>
              </div>

              <strong style={{ fontSize: "24px", color: "#4338ca" }}>
                {selectedStartup.combinedTotal} / {selectedStartup.isFullyEvaluated ? 120 : selectedStartup.maxPossibleScore}
              </strong>
            </div>

            {/* 4 MENTORS BREAKDOWN */}
            <div className="criteria-breakdown-grid">
              {[
                { title: "Mentor 1 (Judge 1)", data: selectedStartup.mentor1 },
                { title: "Mentor 2 (Judge 2)", data: selectedStartup.mentor2 },
                { title: "Mentor 3 (Judge 3)", data: selectedStartup.mentor3 },
                { title: "Mentor 4 (Judge 4)", data: selectedStartup.mentor4 },
              ].map((m, idx) => (
                <div key={idx} className="mentor-breakdown-card">
                  <h4>
                    {m.title}: {m.data?.submitted ? <strong>{m.data.totalScore}/30</strong> : <span style={{ color: "#d97706" }}>Pending</span>}
                  </h4>

                  {m.data?.submitted && m.data.scores ? (
                    <div>
                      {Object.keys(CRITERIA_LABELS).map((k) => (
                        <div key={k} className="crit-item-row">
                          <span>{CRITERIA_LABELS[k]}:</span>
                          <strong>{m.data.scores[k] ?? 0}/5</strong>
                        </div>
                      ))}
                      {m.data.feedback && (
                        <div style={{ marginTop: "10px", fontSize: "11.5px", color: "#64748b", fontStyle: "italic", borderTop: "1px dashed #cbd5e1", paddingTop: "6px" }}>
                          "{m.data.feedback}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: "12px", color: "#94a3b8", padding: "16px 0", textAlign: "center" }}>
                      Evaluation pending from this judge.
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn-cancel"
                style={{ background: "#f1f5f9", color: "#0f172a", border: "1px solid #cbd5e1" }}
                onClick={() => setSelectedStartup(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
