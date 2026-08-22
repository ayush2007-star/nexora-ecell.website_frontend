import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "./AdminMentors.css";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  password: "",
  mentorIndex: 1,
  specialization: "Startup Mentor / Jury",
  phone: "",
  isActive: true,
};

export default function AdminMentors() {
  const navigate = useNavigate();

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const user = JSON.parse(
    localStorage.getItem("nexora_user") || "null"
  );

  useEffect(() => {
    const token =  localStorage.getItem("access_token") ||
  localStorage.getItem("nexora_access_token") ||
  localStorage.getItem("nexra_access_token");

    if (
      !token ||
      String(user?.role || "").toLowerCase() !== "admin"
    ) {
      navigate("/admin/login", { replace: true });
      return;
    }

    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/v1/admin/mentors");
      const data = response?.data || response;

      setMentors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Unable to load mentors.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 3000);
  };

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const editMentor = (mentor) => {
    setEditingId(mentor.userId);

    setForm({
      fullName: mentor.fullName || "",
      email: mentor.email || "",
      password: "",
      mentorIndex: mentor.mentorIndex || 1,
      specialization:
        mentor.department || "Startup Mentor / Jury",
      phone: mentor.phone || "",
      isActive: mentor.isActive !== false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const saveMentor = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.fullName.trim()) {
        throw new Error("Mentor name is required.");
      }

      if (!form.email.trim()) {
        throw new Error("Email is required.");
      }

      if (!editingId && form.password.length < 6) {
        throw new Error(
          "Password must be at least 6 characters."
        );
      }

      if (editingId) {
        const payload = {
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          mentorIndex: Number(form.mentorIndex),
          specialization: form.specialization.trim(),
          phone: form.phone.trim(),
          isActive: Boolean(form.isActive),
        };

        if (form.password.trim()) {
          payload.password = form.password;
        }

        await api.put(
          `/api/v1/admin/mentors/${editingId}`,
          payload
        );

        showToast("Mentor/Judge updated successfully.");
      } else {
        await api.post("/api/v1/admin/mentors", {
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          mentorIndex: Number(form.mentorIndex),
          specialization: form.specialization.trim(),
          phone: form.phone.trim(),
        });

        showToast(
          "Mentor/Judge account created successfully."
        );
      }

      resetForm();
      await loadMentors();
    } catch (err) {
      setError(err?.message || "Unable to save mentor.");
    } finally {
      setSaving(false);
    }
  };

  const deleteMentor = async (mentor) => {
    const confirmed = window.confirm(
      `Delete ${mentor.fullName}'s Mentor/Judge account?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/api/v1/admin/mentors/${mentor.userId}`
      );

      showToast("Mentor/Judge account deleted.");
      await loadMentors();

      if (editingId === mentor.userId) {
        resetForm();
      }
    } catch (err) {
      setError(err?.message || "Unable to delete mentor.");
    }
  };

  return (
    <main className="admin-mentors-page">
      <header className="admin-mentors-header">
        <div>
          <Link to="/admin" className="admin-mentors-brand">
            ← NEXORA ADMIN
          </Link>

          <h1>Mentor & Judge Management</h1>

          <p>
            Create and manage the accounts used by your judging
            and mentorship panel.
          </p>
        </div>

        <Link
          to="/admin"
          className="admin-mentors-back"
        >
          Admin Dashboard
        </Link>
      </header>

      <section className="admin-mentors-content">

        {toast && (
          <div className="mentor-toast">
            {toast}
          </div>
        )}

        {error && (
          <div className="mentor-error">
            {error}
          </div>
        )}

        <div className="mentor-form-card">
          <div className="mentor-form-heading">
            <div>
              <span className="mentor-kicker">
                {editingId ? "EDIT ACCOUNT" : "NEW ACCOUNT"}
              </span>

              <h2>
                {editingId
                  ? "Update Mentor / Judge"
                  : "Add Mentor / Judge"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                className="mentor-secondary-btn"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={saveMentor}>
            <div className="mentor-form-grid">

              <label>
                Full Name
                <input
                  value={form.fullName}
                  onChange={(e) =>
                    updateField("fullName", e.target.value)
                  }
                  placeholder="Judge / Mentor name"
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    updateField("email", e.target.value)
                  }
                  placeholder="mentor@example.com"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    updateField("password", e.target.value)
                  }
                  placeholder={
                    editingId
                      ? "Leave blank to keep current password"
                      : "Minimum 6 characters"
                  }
                  required={!editingId}
                />
              </label>

              <label>
                Judge / Mentor Number
                <input
                  type="number"
                  min="1"
                  value={form.mentorIndex}
                  onChange={(e) =>
                    updateField(
                      "mentorIndex",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Specialization
                <input
                  value={form.specialization}
                  onChange={(e) =>
                    updateField(
                      "specialization",
                      e.target.value
                    )
                  }
                  placeholder="Startup Mentor / Jury"
                />
              </label>

              <label>
                Phone
                <input
                  value={form.phone}
                  onChange={(e) =>
                    updateField("phone", e.target.value)
                  }
                  placeholder="Phone number"
                />
              </label>

              {editingId && (
                <label className="mentor-checkbox">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      updateField(
                        "isActive",
                        e.target.checked
                      )
                    }
                  />
                  Account Active
                </label>
              )}
            </div>

            <button
              type="submit"
              className="mentor-primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Save Changes"
                : "Create Mentor / Judge Account"}
            </button>
          </form>
        </div>

        <div className="mentor-list-card">
          <div className="mentor-list-heading">
            <div>
              <span className="mentor-kicker">
                PANEL ACCOUNTS
              </span>

              <h2>
                Mentors / Judges ({mentors.length})
              </h2>
            </div>

            <button
              className="mentor-secondary-btn"
              onClick={loadMentors}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="mentor-empty">
              Loading Mentor/Judge accounts...
            </div>
          ) : mentors.length === 0 ? (
            <div className="mentor-empty">
              No Mentor/Judge accounts found.
            </div>
          ) : (
            <div className="mentor-table-wrap">
              <table className="mentor-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Mentor / Judge</th>
                    <th>Login</th>
                    <th>Specialization</th>
                    <th>Evaluated</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {mentors.map((mentor) => (
                    <tr key={mentor.userId}>
                      <td>
                        <strong>
                          {mentor.mentorIndex || "-"}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          {mentor.fullName}
                        </strong>

                        <small>
                          {mentor.userId}
                        </small>
                      </td>

                      <td>
                        <strong>
                          {mentor.email}
                        </strong>

                        <small>
                          {mentor.phone || "No phone"}
                        </small>
                      </td>

                      <td>
                        {mentor.department ||
                          "Startup Mentor / Jury"}
                      </td>

                      <td>
                        <span className="evaluated-count">
                          {mentor.evaluatedStartupsCount || 0}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            mentor.isActive !== false
                              ? "status-active"
                              : "status-inactive"
                          }
                        >
                          {mentor.isActive !== false
                            ? "ACTIVE"
                            : "INACTIVE"}
                        </span>
                      </td>

                      <td>
                        <div className="mentor-actions">
                          <button
                            onClick={() =>
                              editMentor(mentor)
                            }
                            className="edit-btn"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteMentor(mentor)
                            }
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </section>
    </main>
  );
}