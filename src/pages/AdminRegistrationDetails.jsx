import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import "./AdminRegistrationDetails.css";

export default function AdminRegistrationDetails() {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [registration, setRegistration] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [certLoading, setCertLoading] = useState(false);
  const [error, setError] = useState("");
  const [remarks, setRemarks] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [copied, setCopied] = useState(false);

  // Member Management Modals
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    memberName: "",
    memberEmail: "",
    memberPhone: "",
    role: "Team Member",
  });
  const [memberLoading, setMemberLoading] = useState(false);

  // Custom Certificate Options
  const [showCertEditor, setShowCertEditor] = useState(false);
  const [certOptions, setCertOptions] = useState({
    theme: "gold",
    title: "Certificate of Excellence",
    issuerName: "Prof. A. K. Sharma",
    issuerTitle: "Convener & Head of Incubation",
    customMessage: "In recognition of outstanding innovative thinking, active problem-solving, and dedication to entrepreneurial excellence.",
    logoUrl: "",
    signatureUrl: "",
    sealUrl: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const user = JSON.parse(
    localStorage.getItem("nexora_user") || "null"
  );

  useEffect(() => {
    const token =  localStorage.getItem("access_token") ||
  localStorage.getItem("nexora_access_token") ||
  localStorage.getItem("nexra_access_token");

    if (!token || String(user?.role).toLowerCase() !== "admin") {
      navigate("/admin/login", { replace: true });
      return;
    }

    loadRegistration();
  }, [teamId]);

  const loadRegistration = async () => {
    try {
      setLoading(true);
      setError("");

      const [regResponse, certResponse] = await Promise.allSettled([
        api.get(`/api/v1/admin/registration/${teamId}`),
        api.get(`/api/v1/certificate/team/${teamId}`),
      ]);

      if (regResponse.status === "fulfilled") {
        const data = regResponse.value?.data || regResponse.value;
        setRegistration(data);
      } else {
        throw new Error("Unable to load registration details.");
      }

      if (certResponse.status === "fulfilled") {
        const certData = certResponse.value?.data || certResponse.value;
        setCertificate(certData);
        if (certData) {
          setCertOptions({
            theme: certData.theme || "gold",
            title: certData.title || "Certificate of Excellence",
            issuerName: certData.issuerName || "Prof. A. K. Sharma",
            issuerTitle: certData.issuerTitle || "Convener & Head of Incubation",
            customMessage: certData.customMessage || "In recognition of outstanding innovative thinking, active problem-solving, and dedication to entrepreneurial excellence.",
            logoUrl: certData.logoUrl || "",
            signatureUrl: certData.signatureUrl || "",
            sealUrl: certData.sealUrl || "",
          });
        }
      } else {
        setCertificate(null);
      }
    } catch (err) {
      setError(
        err?.message || "Unable to load registration details."
      );
    } finally {
      setLoading(false);
    }
  };

  const approveRegistration = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this registration?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await api.put(`/api/v1/admin/approve/${teamId}`);
      await loadRegistration();
      alert("Registration approved successfully.");
    } catch (err) {
      setError(err?.message || "Unable to approve registration.");
    } finally {
      setActionLoading(false);
    }
  };

  const rejectRegistration = async () => {
    const cleanedRemarks = remarks.trim();

    if (!cleanedRemarks) {
      setError("Please enter remarks before rejecting.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to reject this registration?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await api.put(`/api/v1/admin/reject/${teamId}`, {
        remarks: cleanedRemarks,
      });

      setShowRejectBox(false);
      setRemarks("");

      await loadRegistration();
      alert("Registration rejected successfully.");
    } catch (err) {
      setError(err?.message || "Unable to reject registration.");
    } finally {
      setActionLoading(false);
    }
  };

  // Member Management Handlers
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberForm.memberName.trim() || !memberForm.memberEmail.trim()) {
      alert("Please provide member name and email.");
      return;
    }

    try {
      setMemberLoading(true);
      await api.post(`/api/v1/admin/registration/${teamId}/members`, memberForm);
      setShowAddMember(false);
      setMemberForm({ memberName: "", memberEmail: "", memberPhone: "", role: "Team Member" });
      await loadRegistration();
      alert("Team member added successfully!");
    } catch (err) {
      alert(err?.message || "Failed to add member.");
    } finally {
      setMemberLoading(false);
    }
  };

  const handleEditMemberSubmit = async (e) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      setMemberLoading(true);
      const memberId = editingMember.memberId || editingMember._id;
      await api.put(`/api/v1/admin/registration/${teamId}/members/${memberId}`, memberForm);
      setEditingMember(null);
      setMemberForm({ memberName: "", memberEmail: "", memberPhone: "", role: "Team Member" });
      await loadRegistration();
      alert("Team member updated successfully!");
    } catch (err) {
      alert(err?.message || "Failed to update member.");
    } finally {
      setMemberLoading(false);
    }
  };

  const handleDeleteMember = async (member) => {
    const name = member.memberName || member.name || "this member";
    const confirmed = window.confirm(`Are you sure you want to remove "${name}" from this team?`);
    if (!confirmed) return;

    try {
      const memberId = member.memberId || member._id;
      await api.delete(`/api/v1/admin/registration/${teamId}/members/${memberId}`);
      await loadRegistration();
      alert("Member removed.");
    } catch (err) {
      alert(err?.message || "Failed to remove member.");
    }
  };

  const openEditMemberModal = (member) => {
    setEditingMember(member);
    setMemberForm({
      memberName: member.memberName || member.name || "",
      memberEmail: member.memberEmail || member.email || "",
      memberPhone: member.memberPhone || member.phone || "",
      role: member.role || "Team Member",
    });
  };

  // Image Upload Handler for Certificate Images
  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/api/v1/upload/image", formData);
      const data = res?.data || res;
      if (data?.url) {
        setCertOptions((prev) => ({ ...prev, [field]: data.url }));
        alert(`${field} image uploaded successfully!`);
      }
    } catch (err) {
      alert(err?.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const generateCertificate = async () => {
    try {
      setCertLoading(true);
      setError("");

      const response = await api.post(`/api/v1/certificate/generate/${teamId}`, certOptions);
      const data = response?.data || response;
      setCertificate(data);
      setShowCertEditor(false);
      alert("Official Certificate generated/updated successfully!");
    } catch (err) {
      setError(err?.message || "Unable to generate certificate.");
    } finally {
      setCertLoading(false);
    }
  };

  const copyCertLink = () => {
    if (!certificate?.certificateId) return;
    const url = `${window.location.origin}/verify/${certificate.certificateId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getStatusClass = (status) => {
    return String(status || "Pending")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  if (loading) {
    return (
      <main className="admin-details-loading">
        <div>
          <div className="admin-details-spinner" />
          <p>Loading registration...</p>
        </div>
      </main>
    );
  }

  if (!registration) {
    return (
      <main className="admin-details-page">
        <div className="admin-details-error-page">
          <h2>Registration not found</h2>
          <p>{error || "The requested registration could not be found."}</p>
          <button
            className="admin-details-back-button"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const team = registration.team || {};
  const leader = registration.leader || {};
  const project = registration.project || {};
  const members = registration.members || [];
  const status = team.status || "Pending";
  const isApproved = String(status).toLowerCase() === "approved";

  return (
    <main className="admin-details-page">
      {/* HEADER */}
      <header className="admin-details-header">
        <div>
          <div className="admin-details-brand">
            <span className="admin-details-brand-dot" />
            NEXORA
          </div>
          <p>Innovation Portal Administration</p>
        </div>

        <div className="admin-header-btns">
          <Link to="/admin/events" className="admin-nav-item">
            🎪 Events
          </Link>
          <Link to="/admin/certificates" className="admin-nav-item">
            🎨 Studio
          </Link>
          <button
            className="admin-details-back-button"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Dashboard
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <section className="admin-details-content">
        <div className="admin-details-heading">
          <div>
            <span className="admin-details-badge">REGISTRATION DETAILS</span>
            <h1>{team.teamName || "Team Registration"}</h1>
            <p>Review and edit team details, roster members, and credential status.</p>
          </div>

          <span
            className={`admin-details-status admin-details-status-${getStatusClass(
              status
            )}`}
          >
            ● {status}
          </span>
        </div>

        {/* ERROR */}
        {error && <div className="admin-details-error">{error}</div>}

        {/* TEAM */}
        <section className="admin-details-card">
          <div className="admin-details-card-header">
            <div>
              <span>01</span>
              <h2>Team & Event Information</h2>
            </div>
          </div>

          <div className="admin-details-grid">
            <div>
              <label>Team Name</label>
              <strong>{team.teamName || "—"}</strong>
            </div>

            <div>
              <label>Team ID</label>
              <code>{team.teamId || teamId || "—"}</code>
            </div>

            <div>
              <label>Associated Event</label>
              <strong>{team.eventName || team.eventId || "Flagship Cohort"}</strong>
            </div>

            <div>
              <label>Registration Status</label>
              <strong>{status}</strong>
            </div>

            <div>
              <label>Registered Date</label>
              <strong>
                {team.createdAt
                  ? new Date(team.createdAt).toLocaleString()
                  : "—"}
              </strong>
            </div>
          </div>
        </section>

        {/* LEADER */}
        <section className="admin-details-card">
          <div className="admin-details-card-header">
            <div>
              <span>02</span>
              <h2>Team Leader</h2>
            </div>
          </div>

          <div className="admin-details-grid">
            <div>
              <label>Full Name</label>
              <strong>{leader.fullName || "—"}</strong>
            </div>

            <div>
              <label>Email</label>
              <strong>{leader.email || "—"}</strong>
            </div>

            <div>
              <label>Phone</label>
              <strong>{leader.phone || "—"}</strong>
            </div>

            <div>
              <label>College / University</label>
              <strong>{leader.college || "—"}</strong>
            </div>

            <div>
              <label>Department / Major</label>
              <strong>{leader.department || "—"}</strong>
            </div>

            <div>
              <label>Year of Study</label>
              <strong>{leader.year || "—"}</strong>
            </div>

            <div>
              <label>Roll / Student Number</label>
              <strong>{leader.rollNumber || "—"}</strong>
            </div>
          </div>
        </section>

        {/* PROJECT */}
        <section className="admin-details-card">
          <div className="admin-details-card-header">
            <div>
              <span>03</span>
              <h2>Project Proposal & Verification</h2>
            </div>
          </div>

          <div className="admin-details-grid">
            <div>
              <label>Project Name</label>
              <strong>{project.projectName || "—"}</strong>
            </div>

            <div>
              <label>Innovation Domain</label>
              <strong>{project.domain || project.category || "—"}</strong>
            </div>

            <div>
              <label>Current Stage</label>
              <strong>{project.stage || "—"}</strong>
            </div>

            <div>
              <label>Partner / Eureka Team ID</label>
              <strong>{project.eurekaTeamId || "—"}</strong>
            </div>

            {project.referralCodeUsed && (
              <div>
                <label>Referral Code</label>
                <strong>{project.referralCodeUsed}</strong>
              </div>
            )}

            {project.pitchDeckUrl && (
              <div className="admin-details-full">
                <label>Pitch Deck Link</label>
                <a
                  href={project.pitchDeckUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-deck-link"
                >
                  🔗 View Pitch Deck ({project.pitchDeckUrl}) ↗
                </a>
              </div>
            )}

            <div className="admin-details-full">
              <label>Executive Description</label>
              <p>{project.description || "No project description provided."}</p>
            </div>
          </div>
        </section>

        {/* TEAM MEMBERS SECTION WITH ADD / EDIT / DELETE */}
        <section className="admin-details-card">
          <div className="admin-details-card-header">
            <div>
              <span>04</span>
              <h2>Team Roster & Members</h2>
            </div>

            <div className="members-header-actions">
              <span className="admin-members-count">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </span>
              <button
                type="button"
                className="button button-small button-primary"
                onClick={() => {
                  setMemberForm({ memberName: "", memberEmail: "", memberPhone: "", role: "Team Member" });
                  setShowAddMember(true);
                }}
              >
                + Add Member
              </button>
            </div>
          </div>

          {members.length === 0 ? (
            <div className="admin-no-members">
              No additional team members registered. You can add team members using the "+ Add Member" button above.
            </div>
          ) : (
            <div className="admin-members-list">
              {members.map((member, index) => (
                <div
                  className="admin-member-item"
                  key={
                    member.memberId ||
                    member.userId ||
                    member._id ||
                    index
                  }
                >
                  <div className="admin-member-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="admin-member-info">
                    <strong>
                      {member.memberName || member.fullName || member.name || "Member"}
                    </strong>
                    <span>{member.memberEmail || member.email || "No email"}</span>
                  </div>

                  <div className="admin-member-phone">
                    📞 {member.memberPhone || member.phone || "—"}
                  </div>

                  <div className="admin-member-actions">
                    <button
                      type="button"
                      className="member-btn-edit"
                      onClick={() => openEditMemberModal(member)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="member-btn-delete"
                      onClick={() => handleDeleteMember(member)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ADD MEMBER MODAL */}
        {showAddMember && (
          <div className="admin-modal-overlay" onClick={() => setShowAddMember(false)}>
            <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Team Member</h2>
                <button className="modal-close-btn" onClick={() => setShowAddMember(false)}>✕</button>
              </div>
              <form onSubmit={handleAddMember} className="admin-modal-form">
                <div className="modal-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Member Name"
                    value={memberForm.memberName}
                    onChange={(e) => setMemberForm({ ...memberForm, memberName: e.target.value })}
                  />
                </div>
                <div className="modal-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="member@example.com"
                    value={memberForm.memberEmail}
                    onChange={(e) => setMemberForm({ ...memberForm, memberEmail: e.target.value })}
                  />
                </div>
                <div className="modal-field">
                  <label>Phone Number (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={memberForm.memberPhone}
                    onChange={(e) => setMemberForm({ ...memberForm, memberPhone: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="button button-ghost" onClick={() => setShowAddMember(false)}>Cancel</button>
                  <button type="submit" className="button button-primary" disabled={memberLoading}>
                    {memberLoading ? "Adding..." : "+ Add to Team"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT MEMBER MODAL */}
        {editingMember && (
          <div className="admin-modal-overlay" onClick={() => setEditingMember(null)}>
            <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Team Member</h2>
                <button className="modal-close-btn" onClick={() => setEditingMember(null)}>✕</button>
              </div>
              <form onSubmit={handleEditMemberSubmit} className="admin-modal-form">
                <div className="modal-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={memberForm.memberName}
                    onChange={(e) => setMemberForm({ ...memberForm, memberName: e.target.value })}
                  />
                </div>
                <div className="modal-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={memberForm.memberEmail}
                    onChange={(e) => setMemberForm({ ...memberForm, memberEmail: e.target.value })}
                  />
                </div>
                <div className="modal-field">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={memberForm.memberPhone}
                    onChange={(e) => setMemberForm({ ...memberForm, memberPhone: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="button button-ghost" onClick={() => setEditingMember(null)}>Cancel</button>
                  <button type="submit" className="button button-primary" disabled={memberLoading}>
                    {memberLoading ? "Saving..." : "Save Member Details"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CERTIFICATE ISSUANCE WITH CUSTOM IMAGES & CUSTOMIZATION */}
        <section className="admin-details-card">
          <div className="admin-details-card-header">
            <div>
              <span>05</span>
              <h2>Official Digital Certificate</h2>
            </div>
            {isApproved && (
              <button
                type="button"
                className="button button-small button-ghost"
                onClick={() => setShowCertEditor((v) => !v)}
              >
                {showCertEditor ? "✕ Hide Customizer" : "⚙️ Customize & Images"}
              </button>
            )}
          </div>

          {showCertEditor && (
            <div className="cert-customizer-box">
              <h3>Customize Certificate & Images</h3>
              <div className="form-row-2">
                <div className="modal-field">
                  <label>Theme Style</label>
                  <select
                    value={certOptions.theme}
                    onChange={(e) => setCertOptions({ ...certOptions, theme: e.target.value })}
                  >
                    <option value="gold">👑 Imperial Gold</option>
                    <option value="purple">⚡ Electric Indigo</option>
                    <option value="cyan">💎 Cyber Cyan</option>
                    <option value="emerald">🌿 Royal Emerald</option>
                  </select>
                </div>

                <div className="modal-field">
                  <label>Certificate Title</label>
                  <input
                    type="text"
                    value={certOptions.title}
                    onChange={(e) => setCertOptions({ ...certOptions, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="modal-field">
                  <label>Signatory Name</label>
                  <input
                    type="text"
                    value={certOptions.issuerName}
                    onChange={(e) => setCertOptions({ ...certOptions, issuerName: e.target.value })}
                  />
                </div>

                <div className="modal-field">
                  <label>Signatory Title</label>
                  <input
                    type="text"
                    value={certOptions.issuerTitle}
                    onChange={(e) => setCertOptions({ ...certOptions, issuerTitle: e.target.value })}
                  />
                </div>
              </div>

              {/* IMAGE UPLOADS FOR CERTIFICATE */}
              <div className="form-row-3 cert-image-uploads">
                <div className="modal-field">
                  <label>✒️ Signature Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "signatureUrl")}
                    disabled={uploadingImage}
                  />
                  {certOptions.signatureUrl && <small className="img-uploaded-tag">✓ Signature attached</small>}
                </div>

                <div className="modal-field">
                  <label>🎖️ Official Seal Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "sealUrl")}
                    disabled={uploadingImage}
                  />
                  {certOptions.sealUrl && <small className="img-uploaded-tag">✓ Seal attached</small>}
                </div>

                <div className="modal-field">
                  <label>🏛️ Custom Logo Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "logoUrl")}
                    disabled={uploadingImage}
                  />
                  {certOptions.logoUrl && <small className="img-uploaded-tag">✓ Logo attached</small>}
                </div>
              </div>

              <div className="modal-field">
                <label>Commendation Statement</label>
                <textarea
                  rows={2}
                  value={certOptions.customMessage}
                  onChange={(e) => setCertOptions({ ...certOptions, customMessage: e.target.value })}
                />
              </div>

              <button
                type="button"
                className="button button-primary"
                onClick={generateCertificate}
                disabled={certLoading || uploadingImage}
                style={{ marginTop: "12px" }}
              >
                {certLoading ? "Generating..." : "⚡ Generate / Update Certificate with Settings"}
              </button>
            </div>
          )}

          {certificate ? (
            <div className="admin-cert-info-box">
              <div className="admin-cert-badge">✓ ISSUED & ACTIVE</div>
              <div className="admin-details-grid">
                <div>
                  <label>Certificate ID</label>
                  <code>{certificate.certificateId}</code>
                </div>
                <div>
                  <label>Recipient Name</label>
                  <strong>{certificate.leaderName || leader.fullName}</strong>
                </div>
                <div>
                  <label>Generated Date</label>
                  <strong>
                    {certificate.generatedAt
                      ? new Date(certificate.generatedAt).toLocaleString()
                      : "—"}
                  </strong>
                </div>
              </div>

              <div className="admin-cert-btn-row">
                <Link
                  to={`/verify/${certificate.certificateId}`}
                  target="_blank"
                  className="button button-primary button-glow"
                >
                  View Live Credential Page ↗
                </Link>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={copyCertLink}
                >
                  {copied ? "✓ Link Copied!" : "📋 Copy Verification Link"}
                </button>
              </div>
            </div>
          ) : isApproved ? (
            <div className="admin-cert-generate-box">
              <p>
                This team has been approved. You can generate their official digital
                certificate now.
              </p>
              <button
                type="button"
                className="button button-primary button-glow"
                onClick={generateCertificate}
                disabled={certLoading}
              >
                {certLoading ? "Generating..." : "⚡ Generate Official Certificate"}
              </button>
            </div>
          ) : (
            <div className="admin-no-members">
              Team must be approved before generating an official certificate.
            </div>
          )}
        </section>

        {/* REMARKS */}
        {team.remarks && (
          <section className="admin-details-card">
            <div className="admin-details-card-header">
              <div>
                <span>06</span>
                <h2>Admin Remarks</h2>
              </div>
            </div>
            <div className="admin-existing-remarks">{team.remarks}</div>
          </section>
        )}

        {/* ACTIONS */}
        <section className="admin-details-actions">
          <div>
            <h2>Registration Decision</h2>
            <p>
              Review all submitted information before approving or rejecting this
              registration.
            </p>
          </div>

          <div className="admin-action-buttons">
            {!isApproved && (
              <button
                className="admin-approve-button"
                onClick={approveRegistration}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "✓ Approve Registration"}
              </button>
            )}

            {String(status).toLowerCase() !== "rejected" && (
              <button
                className="admin-reject-button"
                onClick={() => setShowRejectBox((value) => !value)}
                disabled={actionLoading}
              >
                ✕ Reject Registration
              </button>
            )}
          </div>

          {showRejectBox && (
            <div className="admin-reject-box">
              <label htmlFor="remarks">Rejection Remarks</label>
              <textarea
                id="remarks"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Enter the reason for rejecting this registration..."
                rows={5}
              />

              <div className="admin-reject-actions">
                <button
                  className="admin-cancel-button"
                  onClick={() => {
                    setShowRejectBox(false);
                    setRemarks("");
                    setError("");
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  className="admin-confirm-reject-button"
                  onClick={rejectRegistration}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}