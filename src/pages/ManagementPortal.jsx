import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "./ManagementPortal.css";

const EMPTY_FORM = {
  title: "",
  description: "",
  status: "In Progress",
  priority: "Normal",
};

export default function ManagementPortal() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [updates, setUpdates] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const user = JSON.parse(
    localStorage.getItem("nexora_user") || "null"
  );

  useEffect(() => {
    const token =  localStorage.getItem("access_token") ||
  localStorage.getItem("nexora_access_token") ||
  localStorage.getItem("nexra_access_token");

    const role = String(
      user?.role || ""
    ).toLowerCase();

    if (
      !token ||
      (role !== "management" && role !== "admin")
    ) {
      navigate("/admin/login", { replace: true });
      return;
    }

    loadPortal();
  }, []);

  const loadPortal = async () => {
    try {
      setLoading(true);
      setError("");

      const [profileResponse, updatesResponse] =
        await Promise.all([
          api.get("/api/v1/management/me"),
          api.get("/api/v1/management/updates"),
        ]);

      setProfile(
        profileResponse?.data || profileResponse
      );

      const updateData =
        updatesResponse?.data || updatesResponse;

      setUpdates(
        Array.isArray(updateData)
          ? updateData
          : []
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load management portal."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const submitUpdate = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.title.trim()) {
        throw new Error(
          "Update title is required."
        );
      }

      if (!form.description.trim()) {
        throw new Error(
          "Update description is required."
        );
      }

      await api.post(
        "/api/v1/management/updates",
        {
          title: form.title.trim(),
          description: form.description.trim(),
          status: form.status,
          priority: form.priority,
        }
      );

      setForm(EMPTY_FORM);

      setToast(
        "Work update submitted successfully."
      );

      setTimeout(() => setToast(""), 3000);

      await loadPortal();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to submit work update."
      );
    } finally {
      setSaving(false);
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

  const getStatusClass = (status) => {
    return status
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  return (
    <main className="management-page">

      <header className="management-header">

        <div>
          <Link
            to="/"
            className="management-brand"
          >
            NEXORA E-CELL
          </Link>

          <span className="management-badge">
            MANAGEMENT PORTAL
          </span>
        </div>

        <div className="management-header-right">

          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="management-admin-link"
            >
              ← Admin
            </Link>
          )}

          <div className="management-user">
            <strong>
              {profile?.fullName ||
                user?.fullName ||
                "Management"}
            </strong>

            <span>
              {profile?.designation ||
                "Management Staff"}
            </span>
          </div>

          <button
            className="management-logout"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <section className="management-content">

        {toast && (
          <div className="management-toast">
            {toast}
          </div>
        )}

        {error && (
          <div className="management-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="management-loading">
            Loading management portal...
          </div>
        ) : (
          <>
            <div className="management-hero">

              <div>
                <span>
                  EVENT OPERATIONS
                </span>

                <h1>
                  Work Update Center
                </h1>

                <p>
                  Submit your event-management
                  progress so the admin team can
                  track what is happening.
                </p>
              </div>

              <div className="management-profile-card">
                <strong>
                  {profile?.fullName}
                </strong>

                <small>
                  {profile?.email}
                </small>

                <small>
                  {profile?.department}
                </small>
              </div>

            </div>

            <div className="management-grid">

              <section className="management-card">

                <div className="management-card-heading">
                  <div>
                    <span>
                      NEW UPDATE
                    </span>

                    <h2>
                      What are you working on?
                    </h2>
                  </div>
                </div>

                <form
                  onSubmit={submitUpdate}
                  className="management-form"
                >

                  <label>
                    Update Title

                    <input
                      value={form.title}
                      onChange={(e) =>
                        updateField(
                          "title",
                          e.target.value
                        )
                      }
                      placeholder="Example: Registration desk setup"
                      required
                    />
                  </label>

                  <label>
                    Description

                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        updateField(
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Describe the work completed or currently being handled..."
                      rows="6"
                      required
                    />
                  </label>

                  <div className="management-form-row">

                    <label>
                      Status

                      <select
                        value={form.status}
                        onChange={(e) =>
                          updateField(
                            "status",
                            e.target.value
                          )
                        }
                      >
                        <option>
                          Pending
                        </option>

                        <option>
                          In Progress
                        </option>

                        <option>
                          Completed
                        </option>

                        <option>
                          Blocked
                        </option>
                      </select>
                    </label>

                    <label>
                      Priority

                      <select
                        value={form.priority}
                        onChange={(e) =>
                          updateField(
                            "priority",
                            e.target.value
                          )
                        }
                      >
                        <option>
                          Low
                        </option>

                        <option>
                          Normal
                        </option>

                        <option>
                          High
                        </option>

                        <option>
                          Urgent
                        </option>
                      </select>
                    </label>

                  </div>

                  <button
                    type="submit"
                    className="management-submit"
                    disabled={saving}
                  >
                    {saving
                      ? "Submitting..."
                      : "Submit Work Update"}
                  </button>

                </form>

              </section>

              <section className="management-card">

                <div className="management-card-heading">
                  <div>
                    <span>
                      YOUR ACTIVITY
                    </span>

                    <h2>
                      Recent Work Updates
                    </h2>
                  </div>
                </div>

                {updates.length === 0 ? (
                  <div className="management-empty">
                    No work updates submitted yet.
                  </div>
                ) : (
                  <div className="management-updates">

                    {updates.map((item) => (
                      <article
                        key={item.updateId}
                        className="management-update"
                      >

                        <div className="management-update-top">

                          <strong>
                            {item.title}
                          </strong>

                          <span
                            className={`update-status ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>

                        </div>

                        <p>
                          {item.description}
                        </p>

                        <div className="management-update-meta">
                          <span>
                            Priority:{" "}
                            <strong>
                              {item.priority}
                            </strong>
                          </span>

                          <span>
                            {item.createdAt
                              ? new Date(
                                  item.createdAt
                                ).toLocaleString()
                              : ""}
                          </span>
                        </div>

                      </article>
                    ))}

                  </div>
                )}

              </section>

            </div>
          </>
        )}

      </section>
    </main>
  );
}