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

  const user = JSON.parse(
    localStorage.getItem("nexora_user") || "null"
  );

  useEffect(() => {
    const token = localStorage.getItem("nexora_access_token");

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

  const generateCertificate = async () => {
    try {
      setCertLoading(true);
      setError("");

      const response = await api.post(`/api/v1/certificate/generate/${teamId}`);
      const data = response?.data || response;
      setCertificate(data);
      alert("Official Certificate generated successfully!");
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
          <p>
            {error || "The requested registration could not be found."}
          </p>
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

        <button
          className="admin-details-back-button"
          onClick={() => navigate("/admin/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      {/* CONTENT */}
      <section className="admin-details-content">
        <div className="admin-details-heading">
          <div>
            <span className="admin-details-badge">REGISTRATION DETAILS</span>
            <h1>{team.teamName || "Team Registration"}</h1>
            <p>Review the complete registration submitted by this team.</p>
          </div>

          <span
            className={`admin-details-status admin-details-status-${getStatusClass(
              status
            )}`}
          >
            {status}
          </span>
        </div>

        {/* ERROR */}
        {error && <div className="admin-details-error">{error}</div>}

        {/* TEAM */}
        <section className="admin-details-card">
          <div className="admin-details-card-header">
            <div>
              <span>01</span>
              <h2>Team Information</h2>
            </div>
          </div>

          <div className="admin-details-grid">
            <div>
              <label>Team Name</label>
              <strong>{team.teamName || "—"}</strong>
            </div>

            <div>
              <label>Team ID</label>
              <strong>{team.teamId || teamId || "—"}</strong>
            </div>

            <div>
              <label>Status</label>
              <strong>{status}</strong>
            </div>

            <div>
              <label>Created At</label>
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
              <label>College</label>
              <strong>{leader.college || "—"}</strong>
            </div>

            <div>
              <label>Department</label>
              <strong>{leader.department || "—"}</strong>
            </div>

            <div>
              <label>Year</label>
              <strong>{leader.year || "—"}</strong>
            </div>

            <div>
              <label>Roll Number</label>
              <strong>{leader.rollNumber || "—"}</strong>
            </div>
          </div>
        </section>

        {/* PROJECT */}
        <section className="admin-details-card">
          <div className="admin-details-card-header">
            <div>
              <span>03</span>
              <h2>Project Information</h2>
            </div>
          </div>

          <div className="admin-details-grid">
            <div>
              <label>Project Name</label>
              <strong>{project.projectName || "—"}</strong>
            </div>

            <div>
              <label>Domain</label>
              <strong>{project.domain || project.category || "—"}</strong>
            </div>

            <div>
              <label>Current Stage</label>
              <strong>{project.stage || "—"}</strong>
            </div>

            <div>
              <label>Eureka Team ID</label>
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
              <label>Description</label>
              <p>{project.description || "No project description provided."}</p>
            </div>
          </div>
        </section>

        {/* MEMBERS */}
        <section className="admin-details-card">
          <div className="admin-details-card-header">
            <div>
              <span>04</span>
              <h2>Team Members</h2>
            </div>

            <span className="admin-members-count">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </span>
          </div>

          {members.length === 0 ? (
            <div className="admin-no-members">
              No additional team members registered.
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
                    {member.memberPhone || member.phone || "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CERTIFICATE ISSUANCE */}
        <section className="admin-details-card">
          <div className="admin-details-card-header">
            <div>
              <span>05</span>
              <h2>Official Certificate</h2>
            </div>
          </div>

          {certificate ? (
            <div className="admin-cert-info-box">
              <div className="admin-cert-badge">✓ ISSUED & ACTIVE</div>
              <div className="admin-details-grid">
                <div>
                  <label>Certificate ID</label>
                  <strong>{certificate.certificateId}</strong>
                </div>
                <div>
                  <label>Recipient</label>
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
                  className="button button-primary"
                >
                  View Credential Page ↗
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
                className="button button-primary"
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