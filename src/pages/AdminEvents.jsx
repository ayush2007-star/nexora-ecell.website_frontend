import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import "./AdminEvents.css";

export default function AdminEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Event Registrations View Modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "Hackathon",
    badge: "FLAGSHIP EVENT",
    date: "",
    venue: "Main Innovation Auditorium & Online",
    description: "",
    prizePool: "₹1,00,000+",
    maxTeamSize: 3,
    registrationDeadline: "",
    status: "Live",
  });

  const user = JSON.parse(localStorage.getItem("nexora_user") || "null");

  useEffect(() => {
    const token = localStorage.getItem("nexora_access_token");
    if (!token || String(user?.role).toLowerCase() !== "admin") {
      navigate("/admin/login", { replace: true });
      return;
    }
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/api/v1/events/");
      const data = res?.data || res;
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setForm({
      title: "",
      category: "Hackathon",
      badge: "FLAGSHIP EVENT",
      date: "",
      venue: "Main Innovation Auditorium & Online",
      description: "",
      prizePool: "₹1,00,000+",
      maxTeamSize: 3,
      registrationDeadline: "",
      status: "Live",
    });
    setModalOpen(true);
  };

  const openEditModal = (evt) => {
    setEditingEvent(evt);
    setForm({
      title: evt.title || "",
      category: evt.category || "Hackathon",
      badge: evt.badge || "FLAGSHIP EVENT",
      date: evt.date || "",
      venue: evt.venue || "Main Innovation Auditorium & Online",
      description: evt.description || "",
      prizePool: evt.prizePool || "₹1,00,000+",
      maxTeamSize: evt.maxTeamSize || 3,
      registrationDeadline: evt.registrationDeadline || "",
      status: evt.status || "Live",
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      if (editingEvent) {
        await api.put(`/api/v1/events/${editingEvent.eventId}`, form);
        alert("Event updated successfully!");
      } else {
        await api.post("/api/v1/events/", form);
        alert("Event created successfully!");
      }
      setModalOpen(false);
      loadEvents();
    } catch (err) {
      setError(err?.message || "Error saving event.");
    }
  };

  const handleDeleteEvent = async (eventId, title) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${title}"?`);
    if (!confirmed) return;

    try {
      await api.delete(`/api/v1/events/${eventId}`);
      alert("Event deleted.");
      loadEvents();
    } catch (err) {
      alert(err?.message || "Failed to delete event.");
    }
  };

  const viewEventRegistrations = async (evt) => {
    setSelectedEvent(evt);
    setEventRegistrations([]);
    setLoadingRegs(true);
    try {
      const res = await api.get(`/api/v1/events/${evt.eventId}/registrations`);
      const data = res?.data || res;
      setEventRegistrations(Array.isArray(data) ? data : []);
    } catch (err) {
      alert(err?.message || "Unable to load registrations for this event.");
    } finally {
      setLoadingRegs(false);
    }
  };

  const exportEventCSV = () => {
    if (!eventRegistrations || eventRegistrations.length === 0) {
      alert("No registrations available to export for this event.");
      return;
    }

    const headers = [
      "Team ID",
      "Team Name",
      "Event Name",
      "Project Name",
      "Domain",
      "Leader Name",
      "Leader Email",
      "Leader Phone",
      "College",
      "Status",
      "Created At",
    ];

    const rows = eventRegistrations.map((r) => [
      r.teamId || "",
      `"${(r.teamName || "").replace(/"/g, '""')}"`,
      `"${(r.eventName || selectedEvent?.title || "").replace(/"/g, '""')}"`,
      `"${(r.projectName || "").replace(/"/g, '""')}"`,
      `"${(r.domain || "").replace(/"/g, '""')}"`,
      `"${(r.leaderName || "").replace(/"/g, '""')}"`,
      r.leaderEmail || "",
      r.leaderPhone || "",
      `"${(r.college || "").replace(/"/g, '""')}"`,
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
      `${selectedEvent?.eventId || "event"}_registrations_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const logout = () => {
    localStorage.removeItem("nexora_access_token");
    localStorage.removeItem("nexora_user");
    navigate("/admin/login", { replace: true });
  };

  return (
    <main className="admin-events-page">
      {/* HEADER */}
      <header className="admin-events-header">
        <div className="admin-brand-section">
          <div className="admin-events-brand">
            <span className="admin-brand-dot" />
            NEXORA
          </div>
          <span className="admin-portal-tag">ADMIN PORTAL</span>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="admin-nav-tabs">
          <Link to="/admin/dashboard" className="admin-nav-item">
            📊 Dashboard
          </Link>
          <Link to="/admin/events" className="admin-nav-item active">
            🎪 Events Management
          </Link>
          <Link to="/admin/certificates" className="admin-nav-item">
            🎨 Certificate Studio
          </Link>
        </nav>

        <div className="admin-header-actions">
          <Link to="/" className="admin-home-link" target="_blank">
            Public Site ↗
          </Link>
          <button className="admin-logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <section className="admin-events-content">
        <div className="admin-page-heading">
          <div>
            <span className="admin-section-badge">EVENT CONTROL HUB</span>
            <h1>Events & Competitions</h1>
            <p>
              Create, configure, and isolate registration rosters for all hackathons and bootcamps.
            </p>
          </div>

          <div className="admin-top-btns">
            <button className="button button-primary button-glow" onClick={openCreateModal}>
              <span>+ Create New Event</span>
            </button>
            <button className="admin-refresh-button" onClick={loadEvents}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {error && <div className="admin-dashboard-error">{error}</div>}

        {loading ? (
          <div className="admin-events-loading">
            <div className="admin-loading-spinner" />
            <p>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="admin-empty-state">
            <h3>No events created yet</h3>
            <p>Click "Create New Event" to set up your first hackathon or summit.</p>
            <button className="button button-primary" onClick={openCreateModal} style={{ marginTop: "16px" }}>
              + Create First Event
            </button>
          </div>
        ) : (
          <div className="events-admin-grid">
            {events.map((evt) => (
              <div className="event-admin-card" key={evt.eventId || evt._id}>
                <div className="event-admin-card-header">
                  <span className="event-cat-badge">{evt.category || "Event"}</span>
                  <span className={`event-status-pill status-${String(evt.status || "live").toLowerCase()}`}>
                    ● {evt.status || "Live"}
                  </span>
                </div>

                <h3>{evt.title}</h3>
                <div className="event-id-tag">ID: <code>{evt.eventId}</code></div>

                <div className="event-admin-meta">
                  <div>
                    <label>Date & Time</label>
                    <strong>📅 {evt.date || "TBA"}</strong>
                  </div>
                  <div>
                    <label>Prize Pool</label>
                    <strong>🏆 {evt.prizePool || "—"}</strong>
                  </div>
                  <div>
                    <label>Venue</label>
                    <span>📍 {evt.venue || "Campus / Online"}</span>
                  </div>
                  <div>
                    <label>Deadline</label>
                    <span>⏳ {evt.registrationDeadline || "Open"}</span>
                  </div>
                </div>

                <p className="event-admin-desc">{evt.description}</p>

                {/* EVENT ROSTER COUNTER */}
                <div className="event-roster-stat">
                  <div>
                    <span className="roster-number">{evt.totalRegistrations ?? 0}</span>
                    <span className="roster-label">Registered Teams</span>
                  </div>
                  <button
                    className="view-roster-btn"
                    onClick={() => viewEventRegistrations(evt)}
                  >
                    View Roster & CSV →
                  </button>
                </div>

                {/* CARD ACTIONS */}
                <div className="event-admin-actions">
                  <button
                    className="event-action-btn edit"
                    onClick={() => openEditModal(evt)}
                  >
                    ✏️ Edit
                  </button>
                  <Link
                    to={`/admin/certificates?eventId=${evt.eventId}&eventTitle=${encodeURIComponent(evt.title)}`}
                    className="event-action-btn cert"
                  >
                    🎨 Design Certificates
                  </Link>
                  <button
                    className="event-action-btn delete"
                    onClick={() => handleDeleteEvent(evt.eventId, evt.title)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CREATE / EDIT EVENT MODAL */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEvent ? "Edit Event" : "Create New Event / Hackathon"}</h2>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-modal-form">
              <div className="form-row-2">
                <div className="modal-field">
                  <label>Event Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nexora Ideathon 2026"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="modal-field">
                  <label>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="Flagship Hackathon">Flagship Hackathon</option>
                    <option value="Workshop & Accelerator">Workshop & Accelerator</option>
                    <option value="Annual Grand Summit">Annual Grand Summit</option>
                    <option value="Pitch Battle">Pitch Battle</option>
                    <option value="Open Innovation">Open Innovation</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="modal-field">
                  <label>Event Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. FLAGSHIP EVENT / LIMITED SEATS"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  />
                </div>

                <div className="modal-field">
                  <label>Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Live">Live (Open for Registration)</option>
                    <option value="Upcoming">Upcoming (Teaser)</option>
                    <option value="Completed">Completed (Archived)</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="modal-field">
                  <label>Event Date(s) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. September 15-17, 2026"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>

                <div className="modal-field">
                  <label>Prize Pool / Grant</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹2,50,000 or Seed Grant"
                    value={form.prizePool}
                    onChange={(e) => setForm({ ...form, prizePool: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="modal-field">
                  <label>Venue / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Innovation Hall / Hybrid"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  />
                </div>

                <div className="modal-field">
                  <label>Registration Deadline</label>
                  <input
                    type="text"
                    placeholder="e.g. September 10, 2026"
                    value={form.registrationDeadline}
                    onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-field">
                <label>Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the challenge, target audience, mentor support, and objectives..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  {editingEvent ? "Save Changes" : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVENT REGISTRATIONS DRAWER MODAL */}
      {selectedEvent && (
        <div className="admin-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="admin-modal-box wide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedEvent.title} — Registered Teams</h2>
                <p>Isolated registration records for this specific event.</p>
              </div>
              <div className="modal-top-actions">
                <button className="admin-export-button" onClick={exportEventCSV}>
                  📥 Export Event CSV
                </button>
                <button className="modal-close-btn" onClick={() => setSelectedEvent(null)}>
                  ✕
                </button>
              </div>
            </div>

            {loadingRegs ? (
              <div className="admin-events-loading">
                <div className="admin-loading-spinner" />
                <p>Loading registrations...</p>
              </div>
            ) : eventRegistrations.length === 0 ? (
              <div className="admin-empty-state">
                <h3>No teams registered for this event yet</h3>
                <p>Teams registering on the website selecting this event will automatically show here.</p>
              </div>
            ) : (
              <div className="admin-table-wrapper" style={{ marginTop: "16px" }}>
                <table className="admin-registration-table">
                  <thead>
                    <tr>
                      <th>Team ID / Name</th>
                      <th>Leader Details</th>
                      <th>College</th>
                      <th>Project / Domain</th>
                      <th>Status</th>
                      <th>Certificate</th>
                      <th>Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventRegistrations.map((reg, index) => (
                      <tr key={reg.teamId || index}>
                        <td>
                          <strong>{reg.teamName || "Team"}</strong>
                          <span className="table-subtext">{reg.teamId}</span>
                        </td>
                        <td>
                          <strong>{reg.leaderName}</strong>
                          <span className="table-subtext">{reg.leaderEmail}</span>
                        </td>
                        <td>{reg.college || "—"}</td>
                        <td>
                          <strong>{reg.projectName}</strong>
                          <span className="table-subtext">{reg.domain}</span>
                        </td>
                        <td>
                          <span className={`admin-status admin-status-${String(reg.status || "Pending").toLowerCase()}`}>
                            {reg.status || "Pending"}
                          </span>
                        </td>
                        <td>
                          {reg.certificateId ? (
                            <Link to={`/verify/${reg.certificateId}`} target="_blank" className="cert-chip">
                              ✓ {reg.certificateId}
                            </Link>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>Not Generated</span>
                          )}
                        </td>
                        <td>
                          <Link
                            to={`/admin/registration/${reg.teamId}`}
                            className="admin-view-button"
                          >
                            Review →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
