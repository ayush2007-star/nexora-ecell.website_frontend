import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("registrations");
  const [dashboard, setDashboard] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [activities, setActivities] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") ||
  localStorage.getItem("nexora_user") ||
  "null"
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token") ||
  localStorage.getItem("nexora_access_token") ||
  localStorage.getItem("nexra_access_token");

    if (!token || String(user?.role).toLowerCase() !== "admin") {
      navigate("/admin/login", { replace: true });
      return;
    }

    loadDashboard();
  }, []);

  const loadDashboard = async (
    searchValue = search,
    statusValue = statusFilter,
    pageValue = currentPage
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("page", pageValue);
      params.set("limit", 10);

      if (searchValue.trim()) {
        params.set("search", searchValue.trim());
      }

      if (statusValue) {
        params.set("status", statusValue);
      }

      const queryString = params.toString();

      const registrationUrl =
        queryString
          ? `/api/v1/admin/registrations?${queryString}`
          : "/api/v1/admin/registrations";

      const [dashboardResponse, registrationResponse, activityResponse] =
        await Promise.allSettled([
          api.get("/api/v1/admin/dashboard"),
          api.get(registrationUrl),
          api.get("/api/v1/activity/"),
        ]);

      if (dashboardResponse.status === "fulfilled") {
        const dData =
          dashboardResponse.value?.data || dashboardResponse.value;
        setDashboard(dData);
      }

      if (registrationResponse.status === "fulfilled") {
        const rData =
          registrationResponse.value?.data || registrationResponse.value;
        setRegistrations(rData?.registrations || []);
        setPagination(
          rData?.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
          }
        );
      }

      if (activityResponse.status === "fulfilled") {
        const aData =
          activityResponse.value?.data || activityResponse.value;
        setActivities(Array.isArray(aData) ? aData : []);
      }

      setCurrentPage(pageValue);
    } catch (err) {
      setError(
        err?.message || "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) {
      alert("No registrations available to export.");
      return;
    }

    const headers = [
      "Team ID",
      "Team Name",
      "Project Name",
      "Domain",
      "Leader Name",
      "Leader Email",
      "Leader Phone",
      "Status",
      "Created At",
    ];

    const rows = registrations.map((r) => [
      r.teamId || "",
      `"${(r.teamName || "").replace(/"/g, '""')}"`,
      `"${(r.projectName || "").replace(/"/g, '""')}"`,
      `"${(r.domain || "").replace(/"/g, '""')}"`,
      `"${(r.leaderName || "").replace(/"/g, '""')}"`,
      r.leaderEmail || "",
      r.leaderPhone || "",
      r.status || "Pending",
      r.createdAt ? new Date(r.createdAt).toISOString() : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `nexora_registrations_${new Date().toISOString().slice(0, 10)}.csv`
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
  if (loading && !dashboard) {
    return (
      <main className="admin-dashboard-loading">
        <div>
          <div className="admin-loading-spinner" />
          <p>Loading admin dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-dashboard-page">
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
          <Link
            to="/admin/participants"
            className="admin-nav-item"
          >
            👥 Participants
          </Link>
          <Link to="/admin/dashboard" className="admin-nav-item active">
            📊 Dashboard
          </Link>
          <Link to="/admin/attendance" className="admin-nav-item">
            📋 Attendance & Food
          </Link>
          <Link to="/admin/scoring" className="admin-nav-item">
            🏆 Mentor Scoring
          </Link>
          <Link
            to="/admin/mentors"
            className="admin-nav-item"
          >
            👥 Mentor / Judge Management
          </Link>
          <Link
            to="/admin/management"
            className="admin-nav-item"
          >
            🧑‍💼 Management Accounts
          </Link>
          <Link
            to="/admin/management/updates"
            className="admin-nav-item"
          >
            📊 Management Work Updates
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
      <section className="admin-dashboard-content">
        <div className="admin-page-heading">
          <div>
            <span className="admin-section-badge">ADMIN DASHBOARD</span>
            <h1>
              Welcome back,
              <span> {user?.fullName || "Administrator"}.</span>
            </h1>
            <p>
              Monitor registrations, review projects, and manage Nexora teams.
            </p>
          </div>

          <div className="admin-top-btns">
            <button
              className="admin-export-button"
              onClick={exportToCSV}
            >
              📥 Export CSV
            </button>
            <button
              className="admin-refresh-button"
              onClick={() => loadDashboard()}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && <div className="admin-dashboard-error">{error}</div>}

        {/* STATS */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span>Total Registrations</span>
            <strong>
              {dashboard?.totalRegistrations ??
                dashboard?.total ??
                registrations.length}
            </strong>
          </div>

          <div className="admin-stat-card pending">
            <span>Pending Review</span>
            <strong>
              {dashboard?.pendingRegistrations ?? dashboard?.pending ?? 0}
            </strong>
          </div>

          <div className="admin-stat-card approved">
            <span>Approved Teams</span>
            <strong>
              {dashboard?.approvedRegistrations ?? dashboard?.approved ?? 0}
            </strong>
          </div>

          <div className="admin-stat-card rejected">
            <span>Rejected</span>
            <strong>
              {dashboard?.rejectedRegistrations ?? dashboard?.rejected ?? 0}
            </strong>
          </div>

          <div className="admin-stat-card">
            <span>Colleges Represented</span>
            <strong>{dashboard?.totalColleges ?? "—"}</strong>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${activeTab === "registrations" ? "active" : ""
              }`}
            onClick={() => setActiveTab("registrations")}
          >
            📋 Registrations ({pagination.total || registrations.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "activity" ? "active" : ""
              }`}
            onClick={() => setActiveTab("activity")}
          >
            ⚡ Activity Logs ({activities.length})
          </button>
        </div>

        {activeTab === "registrations" ? (
          /* REGISTRATIONS SECTION */
          <section className="admin-registration-section">
            <div className="admin-section-header">
              <div>
                <h2>Submitted Teams</h2>
                <p>Search, filter, and review team registrations.</p>
              </div>

              <span className="admin-count-badge">
                {pagination.total || registrations.length} total records
              </span>
            </div>

            <div className="admin-registration-filters">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setCurrentPage(1);
                    loadDashboard(search, statusFilter, 1);
                  }
                }}
                placeholder="Search by project name, team ID or leader..."
                className="admin-search-input"
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                  loadDashboard(search, e.target.value, 1);
                }}
                className="admin-status-filter"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <button
                className="admin-filter-button"
                onClick={() => {
                  setCurrentPage(1);
                  loadDashboard(search, statusFilter, 1);
                }}
              >
                Filter
              </button>
              <button
                className="admin-clear-button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setCurrentPage(1);
                  loadDashboard("", "", 1);
                }}
              >
                Clear
              </button>
            </div>

            {registrations.length === 0 ? (
              <div className="admin-empty-state">
                <h3>No registrations found</h3>
                <p>Try adjusting your search criteria or filter options.</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-registration-table">
                  <thead>
                    <tr>
                      <th>Team ID / Name</th>
                      <th>Leader Details</th>
                      <th>Project / Domain</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {registrations.map((registration, index) => {
                      const teamId =
                        registration.teamId ||
                        registration._id ||
                        registration.id;

                      const status =
                        registration.status ||
                        registration.team?.status ||
                        "Pending";

                      const leaderName =
                        registration.leaderName ||
                        registration.leader?.fullName ||
                        "—";

                      const leaderEmail =
                        registration.leaderEmail ||
                        registration.leader?.email ||
                        "";

                      const projectName =
                        registration.projectName ||
                        registration.project?.projectName ||
                        registration.teamName ||
                        "—";

                      const domain =
                        registration.domain ||
                        registration.project?.domain ||
                        "";

                      return (
                        <tr key={teamId || index}>
                          <td>
                            <strong>
                              {registration.teamName ||
                                registration.team?.teamName ||
                                `Team ${index + 1}`}
                            </strong>
                            <span className="table-subtext">{teamId}</span>
                          </td>

                          <td>
                            <strong>{leaderName}</strong>
                            {leaderEmail && (
                              <span className="table-subtext">
                                {leaderEmail}
                              </span>
                            )}
                          </td>

                          <td>
                            <strong>{projectName}</strong>
                            {domain && (
                              <span className="table-subtext">{domain}</span>
                            )}
                          </td>

                          <td>
                            <span
                              className={`admin-status admin-status-${String(
                                status
                              )
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                            >
                              {status}
                            </span>
                          </td>

                          <td>
                            <span className="table-subtext">
                              {registration.createdAt
                                ? new Date(
                                  registration.createdAt
                                ).toLocaleDateString()
                                : "—"}
                            </span>
                          </td>

                          <td>
                            {teamId ? (
                              <button
                                className="admin-view-button"
                                onClick={() =>
                                  navigate(
                                    `/admin/registration/${teamId}`
                                  )
                                }
                              >
                                Review Details →
                              </button>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="admin-pagination">
                <button
                  className="admin-pagination-button"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    loadDashboard(search, statusFilter, currentPage - 1)
                  }
                >
                  ← Previous
                </button>

                <span className="admin-pagination-info">
                  Page <strong>{currentPage}</strong> of{" "}
                  <strong>{pagination.totalPages}</strong>
                </span>

                <button
                  className="admin-pagination-button"
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() =>
                    loadDashboard(search, statusFilter, currentPage + 1)
                  }
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        ) : (
          /* ACTIVITY LOGS SECTION */
          <section className="admin-registration-section">
            <div className="admin-section-header">
              <div>
                <h2>System Activity Audit Trail</h2>
                <p>Log of user registrations, approvals, and portal actions.</p>
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="admin-empty-state">
                <h3>No activity logs recorded yet</h3>
              </div>
            ) : (
              <div className="activity-list">
                {activities.map((act, index) => (
                  <div className="activity-item" key={act._id || index}>
                    <div className="activity-icon">
                      {act.action === "APPROVED"
                        ? "✓"
                        : act.action === "REJECTED"
                          ? "✕"
                          : "⚡"}
                    </div>
                    <div className="activity-content">
                      <div className="activity-header">
                        <strong>{act.action || "ACTIVITY"}</strong>
                        <span className="activity-role">
                          {act.role?.toUpperCase()}
                        </span>
                        <span className="activity-date">
                          {act.createdAt
                            ? new Date(act.createdAt).toLocaleString()
                            : "—"}
                        </span>
                      </div>
                      <p>{act.description || "System action performed"}</p>
                      {act.teamId && (
                        <small>
                          Team ID: <code>{act.teamId}</code>
                        </small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}