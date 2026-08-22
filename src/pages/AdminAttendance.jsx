import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import "./AdminAttendance.css";

export default function AdminAttendance() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalFoodDone: 0,
    totalFoodPending: 0,
  });

  const [search, setSearch] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("");
  const [foodFilter, setFoodFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [expandedTeams, setExpandedTeams] = useState({});

  const user = JSON.parse(localStorage.getItem("nexora_user") || "null");

  useEffect(() => {
    const token = localStorage.getItem("access_token") ||
  localStorage.getItem("nexora_access_token") ||
  localStorage.getItem("nexra_access_token");

    if (!token || String(user?.role).toLowerCase() !== "admin") {
      navigate("/admin/login", { replace: true });
      return;
    }

    loadAttendance();
  }, []);

  const showToastMessage = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast("");
    }, 2800);
  };

  const loadAttendance = async (
    searchValue = search,
    attFilter = attendanceFilter,
    fFilter = foodFilter
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (searchValue.trim()) params.set("search", searchValue.trim());
      if (attFilter) params.set("attendance", attFilter);
      if (fFilter) params.set("food", fFilter);

      const qs = params.toString();
      const endpoint = qs ? `/api/v1/admin/attendance?${qs}` : "/api/v1/admin/attendance";

      const res = await api.get(endpoint);
      const data = res?.data || res;

      setRecords(data?.records || []);
      if (data?.counts) {
        setCounts(data.counts);
      }
    } catch (err) {
      setError(err?.message || "Failed to load attendance list.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = async (teamId, currentStatus, teamName) => {
    const newStatus = currentStatus === "Present" ? "Absent" : "Present";

    // Optimistic UI update
    setRecords((prev) =>
      prev.map((r) => (r.teamId === teamId ? { ...r, attendanceStatus: newStatus } : r))
    );

    setCounts((prev) => {
      const isNowPresent = newStatus === "Present";
      return {
        ...prev,
        totalPresent: prev.totalPresent + (isNowPresent ? 1 : -1),
        totalAbsent: prev.totalAbsent + (isNowPresent ? -1 : 1),
      };
    });

    showToastMessage(`✅ ${teamName || teamId} marked as ${newStatus}`);

    try {
      await api.put(`/api/v1/admin/attendance/${teamId}`, {
        attendanceStatus: newStatus,
      });
    } catch (err) {
      // Revert on error
      loadAttendance();
      showToastMessage(`❌ Error updating attendance: ${err.message}`);
    }
  };

  const handleToggleFood = async (teamId, currentStatus, teamName) => {
    const newStatus = currentStatus === "Food Done" ? "Food Pending" : "Food Done";

    // Optimistic UI update
    setRecords((prev) =>
      prev.map((r) => (r.teamId === teamId ? { ...r, foodStatus: newStatus } : r))
    );

    setCounts((prev) => {
      const isNowDone = newStatus === "Food Done";
      return {
        ...prev,
        totalFoodDone: prev.totalFoodDone + (isNowDone ? 1 : -1),
        totalFoodPending: prev.totalFoodPending + (isNowDone ? -1 : 1),
      };
    });

    showToastMessage(`🍱 ${teamName || teamId} meal status: ${newStatus}`);

    try {
      await api.put(`/api/v1/admin/food/${teamId}`, {
        foodStatus: newStatus,
      });
    } catch (err) {
      loadAttendance();
      showToastMessage(`❌ Error updating food status: ${err.message}`);
    }
  };

  const toggleExpand = (teamId) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  const exportCSV = () => {
    if (records.length === 0) {
      alert("No attendance records to export.");
      return;
    }

    const headers = [
      "Team ID",
      "Eureka ID",
      "Startup / Team Name",
      "Leader Name",
      "Leader Phone",
      "Leader Email",
      "Attendance Status",
      "Food Status",
      "Domain",
    ];

    const rows = records.map((r) => [
      r.teamId || "",
      r.eurekaTeamId || "",
      `"${(r.teamName || "").replace(/"/g, '""')}"`,
      `"${(r.leaderName || "").replace(/"/g, '""')}"`,
      r.leaderPhone || "",
      r.leaderEmail || "",
      r.attendanceStatus || "Absent",
      r.foodStatus || "Food Pending",
      `"${(r.domain || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `nexora_attendance_${new Date().toISOString().slice(0, 10)}.csv`
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

  return (
    <main className="attendance-page">
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
          <Link to="/admin/attendance" className="admin-nav-item active">
            📋 Attendance & Food
          </Link>
          <Link to="/admin/scoring" className="admin-nav-item">
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
      <section className="attendance-content">
        <div className="attendance-page-header">
          <div>
            <span className="attendance-section-badge">EVENT OPERATIONS</span>
            <h1>Attendance & Food Check-In Hub</h1>
            <p>
              Live on-ground participant presence recording and meal distribution status management.
            </p>
          </div>

          <div className="attendance-top-btns">
            <button className="attendance-btn-export" onClick={exportCSV}>
              📥 Export Attendance CSV
            </button>
            <button
              className="attendance-btn-refresh"
              onClick={() => loadAttendance(search, attendanceFilter, foodFilter)}
            >
              🔄 Refresh List
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && <div className="admin-dashboard-error">{error}</div>}

        {/* STAT COUNTERS */}
        <div className="attendance-stats-grid">
          <div className="attendance-stat-card">
            <span>Total Registered</span>
            <strong>{counts.total}</strong>
          </div>

          <div className="attendance-stat-card present">
            <span>Present at Venue</span>
            <strong>{counts.totalPresent}</strong>
          </div>

          <div className="attendance-stat-card absent">
            <span>Absent / Pending</span>
            <strong>{counts.totalAbsent}</strong>
          </div>

          <div className="attendance-stat-card food-done">
            <span>Meals Distributed</span>
            <strong>{counts.totalFoodDone}</strong>
          </div>

          <div className="attendance-stat-card food-pending">
            <span>Food Pending</span>
            <strong>{counts.totalFoodPending}</strong>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="attendance-filter-card">
          <div className="attendance-search-box">
            <span className="search-icon-inside">🔍</span>
            <input
              type="text"
              placeholder="Search by participant name, Eureka ID, Team ID, phone or project..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                loadAttendance(e.target.value, attendanceFilter, foodFilter);
              }}
              className="attendance-search-input"
            />
          </div>

          <select
            value={attendanceFilter}
            onChange={(e) => {
              setAttendanceFilter(e.target.value);
              loadAttendance(search, e.target.value, foodFilter);
            }}
            className="attendance-select-filter"
          >
            <option value="">All Attendance (Present & Absent)</option>
            <option value="Present">Present Only</option>
            <option value="Absent">Absent Only</option>
          </select>

          <select
            value={foodFilter}
            onChange={(e) => {
              setFoodFilter(e.target.value);
              loadAttendance(search, attendanceFilter, e.target.value);
            }}
            className="attendance-select-filter"
          >
            <option value="">All Food Statuses</option>
            <option value="Food Done">Food Done Only</option>
            <option value="Food Pending">Food Pending Only</option>
          </select>

          {(search || attendanceFilter || foodFilter) && (
            <button
              className="attendance-clear-btn"
              onClick={() => {
                setSearch("");
                setAttendanceFilter("");
                setFoodFilter("");
                loadAttendance("", "", "");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="attendance-table-container">
          {loading && records.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              Loading attendance records...
            </div>
          ) : records.length === 0 ? (
            <div style={{ padding: "50px", textAlign: "center" }}>
              <h3 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>No participants found</h3>
              <p style={{ margin: 0, color: "#64748b" }}>Try clearing search criteria or adjusting filter selections.</p>
            </div>
          ) : (
            <>
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Participant / Startup</th>
                    <th>Eureka ID / Team</th>
                    <th>Attendance</th>
                    <th>Attendance Action</th>
                    <th>Food Status</th>
                    <th>Food Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((item) => {
                    const isPresent = item.attendanceStatus === "Present";
                    const isFoodDone = item.foodStatus === "Food Done";
                    const hasMembers = item.members && item.members.length > 1;
                    const isExpanded = expandedTeams[item.teamId];

                    return (
                      <React.Fragment key={item.teamId}>
                        <tr>
                          <td>
                            <div className="participant-info">
                              <span className="participant-name">{item.leaderName}</span>
                              <span className="participant-team">{item.teamName}</span>
                              <span className="participant-contact">
                                📞 {item.leaderPhone || "—"} {item.leaderEmail ? `• ✉️ ${item.leaderEmail}` : ""}
                              </span>
                              {hasMembers && (
                                <button
                                  type="button"
                                  className="btn-expand-members"
                                  onClick={() => toggleExpand(item.teamId)}
                                >
                                  {isExpanded ? "▲ Hide Members" : `▼ View ${item.members.length} Team Members`}
                                </button>
                              )}
                            </div>
                          </td>

                          <td>
                            <span className="eureka-badge">
                              {item.eurekaTeamId || item.teamId}
                            </span>
                            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                              {item.domain || "General"}
                            </div>
                          </td>

                          <td>
                            {isPresent ? (
                              <span className="badge-present">✅ Present</span>
                            ) : (
                              <span className="badge-absent">❌ Absent</span>
                            )}
                          </td>

                          <td>
                            <button
                              type="button"
                              className={isPresent ? "btn-toggle-absent" : "btn-toggle-present"}
                              onClick={() =>
                                handleToggleAttendance(item.teamId, item.attendanceStatus, item.leaderName)
                              }
                            >
                              {isPresent ? "Mark Absent" : "Mark Present"}
                            </button>
                          </td>

                          <td>
                            {isFoodDone ? (
                              <span className="badge-food-done">🍱 Food Done</span>
                            ) : (
                              <span className="badge-food-pending">⏳ Food Pending</span>
                            )}
                          </td>

                          <td>
                            <button
                              type="button"
                              className={isFoodDone ? "btn-toggle-food-pending" : "btn-toggle-food-done"}
                              onClick={() =>
                                handleToggleFood(item.teamId, item.foodStatus, item.leaderName)
                              }
                            >
                              {isFoodDone ? "Mark Food Undone" : "Mark Food Done"}
                            </button>
                          </td>
                        </tr>

                        {/* EXPANDED MEMBERS ROW */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} style={{ background: "#f8fafc", padding: "12px 24px" }}>
                              <div className="members-sub-box">
                                <strong style={{ fontSize: "12px", color: "#475569", textTransform: "uppercase" }}>
                                  Team Members for {item.teamName}
                                </strong>
                                {item.members.map((m, idx) => (
                                  <div key={m.memberId || idx} className="member-sub-row">
                                    <div>
                                      <strong>{m.memberName}</strong>{" "}
                                      <span style={{ color: "#64748b" }}>({m.role || "Member"})</span>{" "}
                                      <span style={{ color: "#94a3b8" }}>— 📞 {m.memberPhone || "—"}</span>
                                    </div>
                                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                      <span className={m.attendanceStatus === "Present" ? "badge-present" : "badge-absent"}>
                                        {m.attendanceStatus === "Present" ? "Present" : "Absent"}
                                      </span>
                                      <span className={m.foodStatus === "Food Done" ? "badge-food-done" : "badge-food-pending"}>
                                        {m.foodStatus === "Food Done" ? "Food Done" : "Food Pending"}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              {/* MOBILE CARDS VIEW */}
              <div className="attendance-cards-mobile">
                {records.map((item) => {
                  const isPresent = item.attendanceStatus === "Present";
                  const isFoodDone = item.foodStatus === "Food Done";

                  return (
                    <div key={item.teamId} className="attendance-card-mobile">
                      <div className="mobile-card-top">
                        <div>
                          <div className="participant-name">{item.leaderName}</div>
                          <div className="participant-team">{item.teamName}</div>
                          <div className="participant-contact">📞 {item.leaderPhone || "—"}</div>
                        </div>
                        <span className="eureka-badge">{item.eurekaTeamId || item.teamId}</span>
                      </div>

                      <div className="mobile-action-grid">
                        <div className="mobile-action-block">
                          <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>
                            ATTENDANCE
                          </div>
                          {isPresent ? (
                            <span className="badge-present">✅ Present</span>
                          ) : (
                            <span className="badge-absent">❌ Absent</span>
                          )}
                          <button
                            type="button"
                            className={isPresent ? "btn-toggle-absent" : "btn-toggle-present"}
                            style={{ width: "100%", marginTop: "4px" }}
                            onClick={() =>
                              handleToggleAttendance(item.teamId, item.attendanceStatus, item.leaderName)
                            }
                          >
                            {isPresent ? "Mark Absent" : "Mark Present"}
                          </button>
                        </div>

                        <div className="mobile-action-block">
                          <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>
                            FOOD / MEAL
                          </div>
                          {isFoodDone ? (
                            <span className="badge-food-done">🍱 Food Done</span>
                          ) : (
                            <span className="badge-food-pending">⏳ Food Pending</span>
                          )}
                          <button
                            type="button"
                            className={isFoodDone ? "btn-toggle-food-pending" : "btn-toggle-food-done"}
                            style={{ width: "100%", marginTop: "4px" }}
                            onClick={() =>
                              handleToggleFood(item.teamId, item.foodStatus, item.leaderName)
                            }
                          >
                            {isFoodDone ? "Mark Undone" : "Mark Done"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* TOAST POPUP */}
      {toast && <div className="toast-message">{toast}</div>}
    </main>
  );
}
