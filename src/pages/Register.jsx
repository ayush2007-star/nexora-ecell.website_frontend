import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import "./Register.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const initialForm = {
  eventId: "EVT-IDEATHON-2026",
  eventName: "Nexora Ideathon 2026",

  leaderInfo: {
    fullName: "",
    email: "",
    phone: "",
    college: "",
    department: "",
    year: "3rd Year",
    rollNumber: "",
  },

  projectInfo: {
    projectName: "",
    domain: "Artificial Intelligence & ML",
    description: "",
    stage: "Prototype / MVP",
  },

  eCellVerification: {
    eurekaTeamId: "",
    referralCodeUsed: "",
    pitchDeckUrl: "",
  },

  teamMembers: [],
};

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryEventId = searchParams.get("event");

  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [successResult, setSuccessResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadPublicEvents();
  }, []);

  const loadPublicEvents = async () => {
    try {
      const res = await api.get("/api/v1/events/public");
      const data = res?.data || res;
      if (Array.isArray(data) && data.length > 0) {
        setEvents(data);
        // If query param is provided, select it
        if (queryEventId) {
          const match = data.find((e) => e.eventId === queryEventId);
          if (match) {
            setForm((prev) => ({
              ...prev,
              eventId: match.eventId,
              eventName: match.title,
            }));
            return;
          }
        }
        // Default to first event
        setForm((prev) => ({
          ...prev,
          eventId: data[0].eventId,
          eventName: data[0].title,
        }));
      }
    } catch (err) {
      console.error("Could not fetch dynamic events, using default presets.", err);
    }
  };

  const handleEventSelect = (e) => {
    const selectedId = e.target.value;
    const selectedObj = events.find((ev) => ev.eventId === selectedId);
    setForm((prev) => ({
      ...prev,
      eventId: selectedId,
      eventName: selectedObj ? selectedObj.title : "Nexora Ideathon 2026",
    }));
  };

  const updateLeader = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      leaderInfo: {
        ...prev.leaderInfo,
        [name]: value,
      },
    }));
    setError("");
    setMessage("");
  };

  const updateProject = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      projectInfo: {
        ...prev.projectInfo,
        [name]: value,
      },
    }));
    setError("");
    setMessage("");
  };

  const updateVerification = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      eCellVerification: {
        ...prev.eCellVerification,
        [name]: value,
      },
    }));
    setError("");
    setMessage("");
  };

  const addMember = () => {
    if (form.teamMembers.length >= 2) {
      setError("Maximum 2 additional team members are allowed.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      teamMembers: [
        ...prev.teamMembers,
        {
          memberName: "",
          memberEmail: "",
          memberPhone: "",
        },
      ],
    }));
  };

  const removeMember = (index) => {
    setForm((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(
        (_, memberIndex) => memberIndex !== index
      ),
    }));
  };

  const updateMember = (index, e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updatedMembers = [...prev.teamMembers];
      updatedMembers[index] = {
        ...updatedMembers[index],
        [name]: value,
      };

      return {
        ...prev,
        teamMembers: updatedMembers,
      };
    });
    setError("");
    setMessage("");
  };

  const copyTeamId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/registration/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.detail || "Registration failed.");
      }

      setSuccessResult(data?.data || data);
      setMessage("Registration submitted successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Something went wrong during registration.");
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS CONFIRMATION RECEIPT
  if (successResult) {
    const teamId = successResult?.teamId || "NXR-TEAM";
    const teamName = successResult?.teamName || form.projectInfo.projectName;

    return (
      <main className="register-page">
        <div className="register-background" />
        <div className="register-shell">
          <div className="register-top">
            <Link to="/" className="back-link">
              ← Return to Home
            </Link>
            <div className="brand-mini">
              <span className="brand-dot" />
              NEXORA E-CELL
            </div>
          </div>

          <div className="register-success-card">
            <div className="success-icon-badge">✓</div>
            <span className="success-tag">APPLICATION RECEIVED</span>
            <h1>Registration Successful!</h1>
            <p>
              Your team <strong>"{teamName}"</strong> has been registered for{" "}
              <strong>{form.eventName}</strong>. Save your unique Team ID to track your status.
            </p>

            <div className="team-id-box">
              <span className="team-id-label">YOUR OFFICIAL TEAM ID</span>
              <div className="team-id-display">
                <code>{teamId}</code>
                <button
                  type="button"
                  className="copy-id-btn"
                  onClick={() => copyTeamId(teamId)}
                >
                  {copied ? "✓ Copied!" : "📋 Copy ID"}
                </button>
              </div>
              <small>Use this ID to check application review progress and claim certificates.</small>
            </div>

            <div className="success-action-row">
              <Link to={`/track/${teamId}`} className="button button-primary button-glow">
                Track Application Status →
              </Link>
              <Link to="/" className="button button-ghost">
                Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const selectedEventObj = events.find((ev) => ev.eventId === form.eventId);

  return (
    <main className="register-page">
      <div className="register-background" />

      <div className="register-shell">
        <div className="register-top">
          <Link to="/" className="back-link">
            ← Return to Home
          </Link>

          <div className="brand-mini">
            <span className="brand-dot" />
            NEXORA E-CELL
          </div>
        </div>

        <header className="register-header">
          <span className="register-badge">2026 FOUNDER REGISTRATION</span>
          <h1>
            Register Your <span>Venture Team.</span>
          </h1>
          <p>
            Complete all details to submit your proposal to NEXORA E-CELL judges,
            accelerator mentors, and incubation panel.
          </p>
        </header>

        {error && <div className="feedback-box feedback-error">{error}</div>}
        {message && <div className="feedback-box feedback-success">{message}</div>}

        <form onSubmit={handleSubmit} className="register-card luxury-card">
          {/* =========================================================
              SECTION 0: TARGET EVENT / COHORT SELECTION
          ========================================================= */}
          <section className="form-section highlight-event-section">
            <div className="section-heading">
              <span className="section-number">01</span>
              <div>
                <h2>Select Event / Competition Cohort</h2>
                <p>Choose which hackathon, bootcamp, or initiative you are entering.</p>
              </div>
            </div>

            <div className="grid-1">
              <div className="field-group">
                <label htmlFor="eventId">Target Initiative *</label>
                <div className="custom-select-wrapper">
                  <select
                    id="eventId"
                    value={form.eventId}
                    onChange={handleEventSelect}
                    className="custom-select"
                  >
                    {events.length > 0 ? (
                      events.map((ev) => (
                        <option key={ev.eventId} value={ev.eventId}>
                          {ev.title} ({ev.category}) — {ev.prizePool || "Grants Available"}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="EVT-IDEATHON-2026">
                          Nexora Ideathon 2026 (Flagship Hackathon) — ₹2,50,000
                        </option>
                        <option value="EVT-BOOTCAMP-2026">
                          Founders Bootcamp & Pitch Lab (Workshop)
                        </option>
                        <option value="EVT-ESUMMIT-2026">
                          Nexora E-Summit & Pitch Battle — ₹5,00,000
                        </option>
                        <option value="GENERAL">
                          General E-Cell Incubation Cohort
                        </option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {selectedEventObj && (
              <div className="event-info-pill">
                <span>📅 <strong>Date:</strong> {selectedEventObj.date}</span>
                <span>🏆 <strong>Prize Pool:</strong> {selectedEventObj.prizePool}</span>
                <span>⏳ <strong>Deadline:</strong> {selectedEventObj.registrationDeadline || "Open"}</span>
              </div>
            )}
          </section>

          {/* =========================================================
              SECTION 1: TEAM LEADER
          ========================================================= */}
          <section className="form-section">
            <div className="section-heading">
              <span className="section-number">02</span>
              <div>
                <h2>Team Leader Information</h2>
                <p>Primary point of contact for review communications.</p>
              </div>
            </div>

            <div className="grid-2">
              <div className="field-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="e.g. Prajwal Sharma"
                  value={form.leaderInfo.fullName}
                  onChange={updateLeader}
                />
              </div>

              <div className="field-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. prajwal@example.com"
                  value={form.leaderInfo.email}
                  onChange={updateLeader}
                />
              </div>

              <div className="field-group">
                <label htmlFor="phone">Phone Number (10 Digits) *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  pattern="[6-9][0-9]{9}"
                  placeholder="e.g. 9876543210"
                  value={form.leaderInfo.phone}
                  onChange={updateLeader}
                />
              </div>

              <div className="field-group">
                <label htmlFor="college">College / University *</label>
                <input
                  id="college"
                  name="college"
                  type="text"
                  required
                  placeholder="e.g. Institute of Engineering & Technology"
                  value={form.leaderInfo.college}
                  onChange={updateLeader}
                />
              </div>

              <div className="field-group">
                <label htmlFor="department">Department / Branch *</label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  required
                  placeholder="e.g. Computer Science & Engineering"
                  value={form.leaderInfo.department}
                  onChange={updateLeader}
                />
              </div>

              <div className="field-group">
                <label htmlFor="year">Year of Study *</label>
                <div className="custom-select-wrapper">
                  <select
                    id="year"
                    name="year"
                    value={form.leaderInfo.year}
                    onChange={updateLeader}
                    className="custom-select"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Post Graduate / Alumni">Post Graduate / Alumni</option>
                  </select>
                </div>
              </div>

              <div className="field-group full-width">
                <label htmlFor="rollNumber">Roll / Student ID Number *</label>
                <input
                  id="rollNumber"
                  name="rollNumber"
                  type="text"
                  required
                  placeholder="e.g. 21BCSE042"
                  value={form.leaderInfo.rollNumber}
                  onChange={updateLeader}
                />
              </div>
            </div>
          </section>

          {/* =========================================================
              SECTION 2: PROJECT & STARTUP DETAILS
          ========================================================= */}
          <section className="form-section">
            <div className="section-heading">
              <span className="section-number">03</span>
              <div>
                <h2>Project & Venture Details</h2>
                <p>Explain the innovation, target audience, and progress.</p>
              </div>
            </div>

            <div className="grid-2">
              <div className="field-group">
                <label htmlFor="projectName">Project / Team Name *</label>
                <input
                  id="projectName"
                  name="projectName"
                  type="text"
                  required
                  placeholder="e.g. EcoGrid Smart Sensor"
                  value={form.projectInfo.projectName}
                  onChange={updateProject}
                />
              </div>

              <div className="field-group">
                <label htmlFor="domain">Innovation Domain *</label>
                <div className="custom-select-wrapper">
                  <select
                    id="domain"
                    name="domain"
                    value={form.projectInfo.domain}
                    onChange={updateProject}
                    className="custom-select"
                  >
                    <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                    <option value="FinTech & Web3">FinTech & Web3</option>
                    <option value="HealthTech & BioTech">HealthTech & BioTech</option>
                    <option value="CleanTech & Sustainability">CleanTech & Sustainability</option>
                    <option value="EdTech & Skill Development">EdTech & Skill Development</option>
                    <option value="AgriTech & Rural Solutions">AgriTech & Rural Solutions</option>
                    <option value="Robotics, Drones & IoT">Robotics, Drones & IoT</option>
                    <option value="Consumer Tech & SaaS">Consumer Tech & SaaS</option>
                    <option value="Other DeepTech">Other DeepTech</option>
                  </select>
                </div>
              </div>

              <div className="field-group full-width">
                <label htmlFor="stage">Current Development Stage *</label>
                <div className="custom-select-wrapper">
                  <select
                    id="stage"
                    name="stage"
                    value={form.projectInfo.stage}
                    onChange={updateProject}
                    className="custom-select"
                  >
                    <option value="Idea / Concept Validation">Idea / Concept Validation</option>
                    <option value="Prototype / MVP Developed">Prototype / MVP Developed</option>
                    <option value="Early Traction (Beta Users)">Early Traction (Beta Users)</option>
                    <option value="Revenue Generating / Scaled">Revenue Generating / Scaled</option>
                  </select>
                </div>
              </div>

              <div className="field-group full-width">
                <label htmlFor="description">Executive Summary / Description (Min 20 characters) *</label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  minLength={20}
                  placeholder="Detail the problem statement, unique solution, technical architecture, and market impact..."
                  value={form.projectInfo.description}
                  onChange={updateProject}
                />
              </div>
            </div>
          </section>

          {/* =========================================================
              SECTION 3: ADDITIONAL TEAM MEMBERS
          ========================================================= */}
          <section className="form-section">
            <div className="section-heading">
              <span className="section-number">04</span>
              <div>
                <h2>Team Members (Up to 2 Optional)</h2>
                <p>Add co-founders or key team contributors.</p>
              </div>
            </div>

            {form.teamMembers.length === 0 ? (
              <div className="empty-member-box">
                <p>No additional team members added. (Solo entries are allowed)</p>
                <button
                  type="button"
                  className="button button-ghost button-small"
                  onClick={addMember}
                >
                  + Add Team Member
                </button>
              </div>
            ) : (
              <div className="member-list">
                {form.teamMembers.map((member, index) => (
                  <div className="member-card" key={index}>
                    <div className="member-card-header">
                      <h3>Member #{index + 1}</h3>
                      <button
                        type="button"
                        className="remove-member-btn"
                        onClick={() => removeMember(index)}
                      >
                        Remove ✕
                      </button>
                    </div>

                    <div className="grid-3">
                      <div className="field-group">
                        <label>Member Name *</label>
                        <input
                          type="text"
                          name="memberName"
                          required
                          placeholder="Member Full Name"
                          value={member.memberName}
                          onChange={(e) => updateMember(index, e)}
                        />
                      </div>

                      <div className="field-group">
                        <label>Member Email *</label>
                        <input
                          type="email"
                          name="memberEmail"
                          required
                          placeholder="member@example.com"
                          value={member.memberEmail}
                          onChange={(e) => updateMember(index, e)}
                        />
                      </div>

                      <div className="field-group">
                        <label>Member Phone (10 Digits) *</label>
                        <input
                          type="tel"
                          name="memberPhone"
                          required
                          pattern="[6-9][0-9]{9}"
                          placeholder="9876543210"
                          value={member.memberPhone}
                          onChange={(e) => updateMember(index, e)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {form.teamMembers.length < 2 && (
                  <button
                    type="button"
                    className="button button-ghost button-small"
                    onClick={addMember}
                  >
                    + Add Another Member ({form.teamMembers.length}/2)
                  </button>
                )}
              </div>
            )}
          </section>

          {/* =========================================================
              SECTION 4: E-CELL VERIFICATION
          ========================================================= */}
          <section className="form-section">
            <div className="section-heading">
              <span className="section-number">05</span>
              <div>
                <h2>E-Cell Verification & Pitch Deck</h2>
                <p>Link your presentation slides and partner referral identifiers.</p>
              </div>
            </div>

            <div className="grid-2">
              <div className="field-group">
                <label htmlFor="eurekaTeamId">Eureka / Partner Team ID *</label>
                <input
                  id="eurekaTeamId"
                  name="eurekaTeamId"
                  type="text"
                  required
                  placeholder="e.g. EUR-8842 or N/A"
                  value={form.eCellVerification.eurekaTeamId}
                  onChange={updateVerification}
                />
              </div>

              <div className="field-group">
                <label htmlFor="referralCodeUsed">Referral Code (Optional)</label>
                <input
                  id="referralCodeUsed"
                  name="referralCodeUsed"
                  type="text"
                  placeholder="e.g. CAMPUS_AMB_01"
                  value={form.eCellVerification.referralCodeUsed}
                  onChange={updateVerification}
                />
              </div>

              <div className="field-group full-width">
                <label htmlFor="pitchDeckUrl">Pitch Deck Link (Google Drive / Canva / Notion) *</label>
                <input
                  id="pitchDeckUrl"
                  name="pitchDeckUrl"
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={form.eCellVerification.pitchDeckUrl}
                  onChange={updateVerification}
                />
                <small className="field-tip">Ensure share link permissions are set to "Anyone with the link can view".</small>
              </div>
            </div>
          </section>

          {/* SUBMIT BUTTON */}
          <div className="form-footer">
            <button
              type="submit"
              disabled={loading}
              className="button button-primary button-glow submit-button"
            >
              {loading ? "Submitting Registration..." : "Complete & Submit Registration →"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}