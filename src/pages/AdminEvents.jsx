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

  // Direct Registration State (Event Adder can add team & members)
  const [directRegisterOpen, setDirectRegisterOpen] = useState(false);
  const [directSubmitting, setDirectSubmitting] = useState(false);
  const [directForm, setDirectForm] = useState({
    teamName: "",
    leaderName: "",
    leaderEmail: "",
    leaderPhone: "",
    college: "Nexora Campus",
    department: "Computer Science",
    year: "3rd Year",
    rollNumber: "",
    projectName: "",
    domain: "Artificial Intelligence & ML",
    stage: "Prototype / MVP",
    description: "Directly added by event coordinator.",
    members: [
      { memberName: "", memberEmail: "", memberPhone: "", role: "Team Member" }
    ],
  });

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
      category: "Flagship Hackathon",
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
      category: evt.category || "Flagship Hackathon",
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

  // Direct Registration (Add Team & Members)
  const openDirectRegisterModal = (evt) => {
    setSelectedEvent(evt);
    setDirectForm({
      teamName: "",
      leaderName: "",
      leaderEmail: "",
      leaderPhone: "",
      college: "Nexora Campus",
      department: "Computer Science",
      year: "3rd Year",
      rollNumber: "",
      projectName: "",
      domain: "Artificial Intelligence & ML",
      stage: "Prototype / MVP",
      description: "Directly added by event coordinator.",
      members: [
        { memberName: "", memberEmail: "", memberPhone: "", role: "Team Member" }
      ],
    });
    setDirectRegisterOpen(true);
  };

  const addDirectMember = () => {
    if (directForm.members.length >= 4) {
      alert("Maximum 4 additional members allowed.");
      return;
    }
    setDirectForm((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        { memberName: "", memberEmail: "", memberPhone: "", role: "Team Member" }
      ],
    }));
  };

  const removeDirectMember = (index) => {
    setDirectForm((prev) => ({
      ...prev,
      members: prev.members.filter((_, idx) => idx !== index),
    }));
  };

  const updateDirectMember = (index, field, value) => {
    setDirectForm((prev) => {
      const newMems = [...prev.members];
      newMems[index] = { ...newMems[index], [field]: value };
      return { ...prev, members: newMems };
    });
  };

  const handleDirectRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      setDirectSubmitting(true);
      await api.post(`/api/v1/admin/events/${selectedEvent.eventId}/direct-register`, {
        ...directForm,
        eventName: selectedEvent.title,
      });

      alert("Team and members directly registered and approved successfully!");
      setDirectRegisterOpen(false);
      viewEventRegistrations(selectedEvent);
      loadEvents();
    } catch (err) {
      alert(err?.message || "Failed to register team.");
    } finally {
      setDirectSubmitting(false);
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
              Create events, add participants & teams, manage rosters, and issue batch credentials.
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
                    <label>Team Limit</label>
                    <strong>👥 Max {evt.maxTeamSize || 3} Members</strong>
                  </div>
                  <div>
                    <label>Deadline</label>
                    <span>⏳ {evt.registrationDeadline || "Open"}</span>
                  </div>
                </div>

                <p className="event-admin-desc">{evt.description}</p>

                {/* EVENT ROSTER COUNTER & ADD PARTICIPANT */}
                <div className="event-roster-stat">
                  <div>
                    <span className="roster-number">{evt.totalRegistrations ?? 0}</span>
                    <span className="roster-label">Registered Teams</span>
                  </div>
                  <div className="roster-btn-group">
                    <button
                      className="button button-small button-ghost"
                      onClick={() => openDirectRegisterModal(evt)}
                    >
                      + Add Team
                    </button>
                    <button
                      className="view-roster-btn"
                      onClick={() => viewEventRegistrations(evt)}
                    >
                      View Roster →
                    </button>
                  </div>
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

              <div className="form-row-2">
                <div className="modal-field">
                  <label>Team Member Limit (Max Members per Team) *</label>
                  <select
                    value={form.maxTeamSize}
                    onChange={(e) => setForm({ ...form, maxTeamSize: Number(e.target.value) })}
                  >
                    <option value={1}>1 Member (Solo Only - Individual Event)</option>
                    <option value={2}>2 Members (Leader + 1 Member)</option>
                    <option value={3}>3 Members (Leader + 2 Members - Standard)</option>
                    <option value={4}>4 Members (Leader + 3 Members)</option>
                    <option value={5}>5 Members (Leader + 4 Members)</option>
                    <option value={6}>6 Members (Leader + 5 Members)</option>
                  </select>
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

      {/* DIRECT TEAM & MEMBER REGISTRATION MODAL */}
      {directRegisterOpen && selectedEvent && (
        <div className="admin-modal-overlay" onClick={() => setDirectRegisterOpen(false)}>
          <div className="admin-modal-box wide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Direct Add Team & Members</h2>
                <p>Register a team directly into <strong>{selectedEvent.title}</strong>.</p>
              </div>
              <button className="modal-close-btn" onClick={() => setDirectRegisterOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleDirectRegisterSubmit} className="admin-modal-form">
              <div className="form-row-2">
                <div className="modal-field">
                  <label>Team Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alpha Creators"
                    value={directForm.teamName}
                    onChange={(e) => setDirectForm({ ...directForm, teamName: e.target.value })}
                  />
                </div>
                <div className="modal-field">
                  <label>Project / Startup Name</label>
                  <input
                    type="text"
                    placeholder="e.g. SmartAgri Drone"
                    value={directForm.projectName}
                    onChange={(e) => setDirectForm({ ...directForm, projectName: e.target.value })}
                  />
                </div>
              </div>

              <h3 style={{ fontSize: "14px", margin: "10px 0 4px", color: "#4f46e5" }}>Team Leader Information</h3>
              <div className="form-row-3">
                <div className="modal-field">
                  <label>Leader Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={directForm.leaderName}
                    onChange={(e) => setDirectForm({ ...directForm, leaderName: e.target.value })}
                  />
                </div>
                <div className="modal-field">
                  <label>Leader Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={directForm.leaderEmail}
                    onChange={(e) => setDirectForm({ ...directForm, leaderEmail: e.target.value })}
                  />
                </div>
                <div className="modal-field">
                  <label>Leader Phone (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={directForm.leaderPhone}
                    onChange={(e) => setDirectForm({ ...directForm, leaderPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="modal-field">
                  <label>College / Institution</label>
                  <input
                    type="text"
                    placeholder="Nexora Campus"
                    value={directForm.college}
                    onChange={(e) => setDirectForm({ ...directForm, college: e.target.value })}
                  />
                </div>
                <div className="modal-field">
                  <label>Innovation Domain</label>
                  <select
                    value={directForm.domain}
                    onChange={(e) => setDirectForm({ ...directForm, domain: e.target.value })}
                  >
                    <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                    <option value="FinTech & Web3">FinTech & Web3</option>
                    <option value="HealthTech & BioTech">HealthTech & BioTech</option>
                    <option value="CleanTech & Sustainability">CleanTech & Sustainability</option>
                    <option value="EdTech & Skill Development">EdTech & Skill Development</option>
                    <option value="Robotics, Drones & IoT">Robotics, Drones & IoT</option>
                    <option value="Other DeepTech">Other DeepTech</option>
                  </select>
                </div>
              </div>

              {/* TEAM MEMBERS LIST IN DIRECT MODAL */}
              <div style={{ margin: "14px 0 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: "14px", color: "#4f46e5", margin: 0 }}>Team Members ({directForm.members.length})</h3>
                <button
                  type="button"
                  className="button button-small button-ghost"
                  onClick={addDirectMember}
                >
                  + Add Member
                </button>
              </div>

              {directForm.members.map((mem, idx) => (
                <div key={idx} style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <strong style={{ fontSize: "12px" }}>Member #{idx + 1}</strong>
                    <button
                      type="button"
                      style={{ color: "#dc2626", border: 0, background: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}
                      onClick={() => removeDirectMember(idx)}
                    >
                      Remove ✕
                    </button>
                  </div>
                  <div className="form-row-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={mem.memberName}
                      onChange={(e) => updateDirectMember(idx, "memberName", e.target.value)}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={mem.memberEmail}
                      onChange={(e) => updateDirectMember(idx, "memberEmail", e.target.value)}
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={mem.memberPhone}
                      onChange={(e) => updateDirectMember(idx, "memberPhone", e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => setDirectRegisterOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary" disabled={directSubmitting}>
                  {directSubmitting ? "Registering..." : "✓ Complete Direct Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVENT REGISTRATIONS DRAWER MODAL */}
      {selectedEvent && !directRegisterOpen && (
        <div className="admin-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="admin-modal-box wide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedEvent.title} — Registered Teams</h2>
                <p>Isolated registration records for this specific event.</p>
              </div>
              <div className="modal-top-actions">
                <button
                  className="button button-small button-primary"
                  onClick={() => openDirectRegisterModal(selectedEvent)}
                >
                  + Add Team
                </button>
                <button className="admin-export-button" onClick={exportEventCSV}>
                  📥 Export CSV
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
                <p>You can add participants directly using "+ Add Team" above or public registrations will show here.</p>
                <button
                  className="button button-primary"
                  onClick={() => openDirectRegisterModal(selectedEvent)}
                  style={{ marginTop: "12px" }}
                >
                  + Add First Team
                </button>
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
