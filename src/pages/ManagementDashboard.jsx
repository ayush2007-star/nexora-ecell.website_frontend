import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "./ManagementDashboard.css";

export default function ManagementDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.getItem("access_token") ||
  localStorage.getItem("nexora_access_token") ||
  localStorage.getItem("nexra_access_token");

const user = JSON.parse(
  localStorage.getItem("user") ||
  localStorage.getItem("nexora_user") ||
  "null");

    const role = String(user?.role || "")
      .trim()
      .toLowerCase();

    if (!token || role !== "management") {
      navigate("/management/login", {
        replace: true,
      });
      return;
    }

    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [profileResponse, updatesResponse] =
        await Promise.all([
          api.get("/api/v1/management/me"),
          api.get("/api/v1/management/updates"),
        ]);

      const profileData =
        profileResponse?.data ?? profileResponse;

      const updatesData =
        updatesResponse?.data ?? updatesResponse;

      setProfile(
        profileData?.data ?? profileData
      );

      const updateList =
        updatesData?.data ??
        (Array.isArray(updatesData)
          ? updatesData
          : []);

      setUpdates(
        Array.isArray(updateList)
          ? updateList
          : []
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load management dashboard."
      );
    } finally {
      setLoading(false);
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

  const completed = updates.filter(
    (item) => item.status === "Completed"
  ).length;

  const inProgress = updates.filter(
    (item) => item.status === "In Progress"
  ).length;

  const pending = updates.filter(
    (item) => item.status === "Pending"
  ).length;

  if (loading) {
    return (
      <main className="management-dashboard-page">
        <div className="management-dashboard-loading">
          Loading Management Portal...
        </div>
      </main>
    );
  }

  return (
    <main className="management-dashboard-page">

      <header className="management-dashboard-header">

        <div>
          <div className="management-dashboard-logo">
            NEXORA
          </div>

          <div className="management-dashboard-label">
            MANAGEMENT PORTAL
          </div>
        </div>

        <div className="management-dashboard-header-actions">

          <Link
            to="/management/updates/new"
            className="management-dashboard-new-btn"
          >
            + Work Update
          </Link>

          <button
            type="button"
            onClick={logout}
            className="management-dashboard-logout"
          >
            Logout
          </button>

        </div>

      </header>

      <section className="management-dashboard-content">

        {error && (
          <div className="management-dashboard-error">
            {error}
          </div>
        )}

        <section className="management-welcome">

          <div>
            <span>WELCOME BACK</span>

            <h1>
              {profile?.fullName ||
                "Management Staff"}
            </h1>

            <p>
              {profile?.designation ||
                "Management Staff"}
              {" · "}
              {profile?.department ||
                "Event Management"}
            </p>
          </div>

          <div className="management-user-id">
            {profile?.userId || "MANAGEMENT"}
          </div>

        </section>

        <section className="management-stats">

          <div className="management-stat-card">
            <span>TOTAL UPDATES</span>
            <strong>{updates.length}</strong>
          </div>

          <div className="management-stat-card">
            <span>IN PROGRESS</span>
            <strong>{inProgress}</strong>
          </div>

          <div className="management-stat-card">
            <span>COMPLETED</span>
            <strong>{completed}</strong>
          </div>

          <div className="management-stat-card">
            <span>PENDING</span>
            <strong>{pending}</strong>
          </div>

        </section>

        <section className="management-dashboard-grid">

          <div className="management-panel">

            <div className="management-panel-heading">

              <div>
                <span>OPERATIONS</span>
                <h2>Work Updates</h2>
              </div>

              <Link to="/management/updates/new">
                Submit Update
              </Link>

            </div>

            {updates.length === 0 ? (

              <div className="management-empty">

                <strong>
                  No work updates yet.
                </strong>

                <p>
                  Submit your first event
                  operations update.
                </p>

              </div>

            ) : (

              <div className="management-update-list">

                {updates
                  .slice(0, 8)
                  .map((item, index) => (

                    <div
                      className="management-update-item"
                      key={
                        item.updateId ||
                        item._id ||
                        index
                      }
                    >

                      <div>

                        <strong>
                          {item.title ||
                            "Untitled Update"}
                        </strong>

                        <p>
                          {item.description ||
                            "No description provided."}
                        </p>

                      </div>

                      <div className="management-update-meta">

                        <span
                          className={`management-status management-status-${String(
                            item.status || ""
                          )
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {item.status ||
                            "Pending"}
                        </span>

                        <small>
                          {item.priority ||
                            "Normal"}
                        </small>

                      </div>

                    </div>

                  ))}

              </div>

            )}

          </div>

          <aside className="management-panel">

            <div className="management-panel-heading">

              <div>
                <span>ACCOUNT</span>
                <h2>My Profile</h2>
              </div>

            </div>

            <div className="management-profile">

              <div>
                <small>NAME</small>
                <strong>
                  {profile?.fullName || "-"}
                </strong>
              </div>

              <div>
                <small>EMAIL</small>
                <strong>
                  {profile?.email || "-"}
                </strong>
              </div>

              <div>
                <small>DEPARTMENT</small>
                <strong>
                  {profile?.department || "-"}
                </strong>
              </div>

              <div>
                <small>DESIGNATION</small>
                <strong>
                  {profile?.designation || "-"}
                </strong>
              </div>

            </div>

          </aside>

        </section>

      </section>

    </main>
  );
}