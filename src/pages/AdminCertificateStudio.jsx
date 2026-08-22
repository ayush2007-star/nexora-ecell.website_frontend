import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { ASSETS } from "../constants/assets";
import "./AdminCertificateStudio.css";

export default function AdminCertificateStudio() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedEventId = searchParams.get("eventId") || "ALL";
  const preselectedEventTitle = searchParams.get("eventTitle") || "";

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(preselectedEventId);
  const [loading, setLoading] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [distributionResult, setDistributionResult] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Certificate Design Settings State
  const [theme, setTheme] = useState("gold"); // "gold" | "purple" | "cyan" | "emerald"
  const [certTitle, setCertTitle] = useState("Certificate of Excellence");
  const [eventTitle, setEventTitle] = useState(
    preselectedEventTitle || "Nexora Ideathon 2026"
  );
  const [issuerName, setIssuerName] = useState("Prof. A. K. Sharma");
  const [issuerTitle, setIssuerTitle] = useState("Convener & Head of Incubation");
  const [customMessage, setCustomMessage] = useState(
    "In recognition of outstanding innovative thinking, active problem-solving, and dedication to entrepreneurial excellence in the NEXORA E-CELL ecosystem."
  );

  // Custom Image Assets
  const [logoUrl, setLogoUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [sealUrl, setSealUrl] = useState("");

  const user = JSON.parse(localStorage.getItem("nexora_user") || "null");

  useEffect(() => {
    const token = localStorage.getItem("access_token") ||
  localStorage.getItem("nexora_access_token") ||
  localStorage.getItem("nexra_access_token");
    if (!token || String(user?.role).toLowerCase() !== "admin") {
      navigate("/admin/login", { replace: true });
      return;
    }
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await api.get("/api/v1/events/");
      const data = res?.data || res;
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEventChange = (e) => {
    const evId = e.target.value;
    setSelectedEventId(evId);
    if (evId !== "ALL") {
      const found = events.find((ev) => ev.eventId === evId);
      if (found) {
        setEventTitle(found.title);
      }
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e, setter, label) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/api/v1/upload/image", formData);
      const data = res?.data || res;
      if (data?.url) {
        setter(data.url);
        alert(`✓ ${label} uploaded and applied successfully!`);
      }
    } catch (err) {
      alert(err?.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBulkGenerate = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to generate and distribute certificates for ${
        selectedEventId === "ALL" ? "ALL approved teams across all events" : "all approved teams of this event"
      }?`
    );
    if (!confirmed) return;

    try {
      setDistributing(true);
      setDistributionResult(null);

      const payload = {
        theme,
        title: certTitle,
        eventTitle,
        issuerName,
        issuerTitle,
        customMessage,
        logoUrl: logoUrl || undefined,
        signatureUrl: signatureUrl || undefined,
        sealUrl: sealUrl || undefined,
      };

      const res = await api.post(`/api/v1/certificate/bulk-generate/${selectedEventId}`, payload);
      const data = res?.data || res;

      setDistributionResult(data);
      alert(`Success! Generated & distributed ${data?.count || 0} certificates.`);
    } catch (err) {
      alert(err?.message || "Failed to generate certificates.");
    } finally {
      setDistributing(false);
    }
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
    <main className="admin-studio-page">
      {/* HEADER */}
      <header className="admin-studio-header">
        <div className="admin-brand-section">
          <div className="admin-studio-brand">
            <span className="admin-brand-dot" />
            NEXORA
          </div>
          <span className="admin-portal-tag">CERTIFICATE STUDIO</span>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="admin-nav-tabs">
          <Link to="/admin/dashboard" className="admin-nav-item">
            📊 Dashboard
          </Link>
          <Link to="/admin/events" className="admin-nav-item">
            🎪 Events Management
          </Link>
          <Link to="/admin/certificates" className="admin-nav-item active">
            🎨 Certificate Studio
          </Link>
        </nav>

        <div className="admin-header-actions">
          <Link to="/verify" className="admin-home-link" target="_blank">
            Verify Portal ↗
          </Link>
          <button className="admin-logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* STUDIO LAYOUT */}
      <div className="studio-layout">
        {/* LEFT: DESIGN CONTROLS */}
        <aside className="studio-controls-panel">
          <div className="studio-panel-heading">
            <h2>Design & Distribution</h2>
            <p>Customize certificate templates, upload seals & signatures, and batch distribute.</p>
          </div>

          <div className="control-group">
            <label>Target Event Cohort</label>
            <select value={selectedEventId} onChange={handleEventChange} className="studio-select">
              <option value="ALL">All Approved Teams (Universal)</option>
              {events.map((ev) => (
                <option key={ev.eventId} value={ev.eventId}>
                  {ev.title} ({ev.eventId})
                </option>
              ))}
            </select>
          </div>

          {/* THEME SELECTOR */}
          <div className="control-group">
            <label>Visual Theme Template</label>
            <div className="theme-chips-grid">
              <button
                type="button"
                className={`theme-chip chip-gold ${theme === "gold" ? "selected" : ""}`}
                onClick={() => setTheme("gold")}
              >
                👑 Imperial Gold
              </button>
              <button
                type="button"
                className={`theme-chip chip-purple ${theme === "purple" ? "selected" : ""}`}
                onClick={() => setTheme("purple")}
              >
                ⚡ Electric Indigo
              </button>
              <button
                type="button"
                className={`theme-chip chip-cyan ${theme === "cyan" ? "selected" : ""}`}
                onClick={() => setTheme("cyan")}
              >
                💎 Cyber Cyan
              </button>
              <button
                type="button"
                className={`theme-chip chip-emerald ${theme === "emerald" ? "selected" : ""}`}
                onClick={() => setTheme("emerald")}
              >
                🌿 Royal Emerald
              </button>
            </div>
          </div>

          {/* CERTIFICATE TEXT SETTINGS */}
          <div className="control-group">
            <label>Certificate Title</label>
            <input
              type="text"
              value={certTitle}
              onChange={(e) => setCertTitle(e.target.value)}
              placeholder="e.g. Certificate of Excellence / Winner"
            />
          </div>

          <div className="control-group">
            <label>Event Name / Subtitle</label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g. Nexora Ideathon 2026"
            />
          </div>

          {/* CUSTOM IMAGE UPLOADS */}
          <div className="studio-images-box">
            <h3>Custom Certificate Assets</h3>
            
            <div className="img-upload-field">
              <label>✒️ Convener Signature Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setSignatureUrl, "Signature")}
                disabled={uploadingImage}
              />
              {signatureUrl && (
                <div className="img-preview-chip">
                  <span>✓ Signature Applied</span>
                  <button type="button" onClick={() => setSignatureUrl("")}>✕</button>
                </div>
              )}
            </div>

            <div className="img-upload-field">
              <label>🎖️ Official Seal Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setSealUrl, "Seal")}
                disabled={uploadingImage}
              />
              {sealUrl && (
                <div className="img-preview-chip">
                  <span>✓ Seal Applied</span>
                  <button type="button" onClick={() => setSealUrl("")}>✕</button>
                </div>
              )}
            </div>

            <div className="img-upload-field">
              <label>🏛️ Institution / Club Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setLogoUrl, "Logo")}
                disabled={uploadingImage}
              />
              {logoUrl && (
                <div className="img-preview-chip">
                  <span>✓ Logo Applied</span>
                  <button type="button" onClick={() => setLogoUrl("")}>✕</button>
                </div>
              )}
            </div>
          </div>

          <div className="control-group">
            <label>Commendation Statement</label>
            <textarea
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Certificate body text..."
            />
          </div>

          <div className="form-row-2">
            <div className="control-group">
              <label>Signatory Name</label>
              <input
                type="text"
                value={issuerName}
                onChange={(e) => setIssuerName(e.target.value)}
                placeholder="Prof. A. K. Sharma"
              />
            </div>
            <div className="control-group">
              <label>Signatory Title</label>
              <input
                type="text"
                value={issuerTitle}
                onChange={(e) => setIssuerTitle(e.target.value)}
                placeholder="Convener & Head of Incubation"
              />
            </div>
          </div>

          {/* ACTION BUTTON */}
          <div className="studio-action-box">
            <button
              type="button"
              className="button button-primary button-glow full-btn"
              onClick={handleBulkGenerate}
              disabled={distributing || uploadingImage}
            >
              {distributing ? "Distributing Certificates..." : "🚀 Batch Issue & Distribute Certificates"}
            </button>
            <small>
              Generates cryptographic tamper-proof Certificate IDs and activates public verification URLs with custom assets for all approved teams.
            </small>
          </div>
        </aside>

        {/* RIGHT: LIVE INTERACTIVE PREVIEW */}
        <section className="studio-preview-area">
          <div className="preview-toolbar">
            <div>
              <span className="live-preview-badge">● LIVE INTERACTIVE PREVIEW</span>
              <p>Real-time render of how the official certificate will appear to participants.</p>
            </div>
            <button
              type="button"
              className="button button-ghost preview-print-btn"
              onClick={() => window.print()}
            >
              🖨️ Test Print / PDF
            </button>
          </div>

          {/* REALISTIC CERTIFICATE CONTAINER */}
          <div className={`certificate-sheet theme-${theme}`}>
            <div className="cert-outer-border">
              <div className="cert-inner-border">
                {/* CORNER ORNAMENTS */}
                <div className="corner-ornament top-left">✦</div>
                <div className="corner-ornament top-right">✦</div>
                <div className="corner-ornament bottom-left">✦</div>
                <div className="corner-ornament bottom-right">✦</div>

                {/* CERTIFICATE HEADER */}
                <div className="cert-header">
                  <div className="cert-brand-row">
                    <img
                      src={logoUrl || ASSETS.logoPrimary}
                      alt="NEXORA"
                      className="cert-logo-icon"
                    />
                    <div>
                      <div className="cert-brand-name">NEXORA E-CELL</div>
                      <div className="cert-brand-sub">CENTRE FOR INNOVATION & ENTREPRENEURSHIP</div>
                    </div>
                  </div>
                  <div className="cert-id-stamp">
                    <span className="qr-mini-icon">🛡️</span>
                    ID: <strong>NXR-VERIFIED-2026</strong>
                  </div>
                </div>

                {/* CERTIFICATE TITLE */}
                <div className="cert-title-section">
                  <div className="cert-kicker">THIS CERTIFICATE IS PROUDLY PRESENTED TO</div>
                  <h1 className="cert-recipient-name">Prajwal Sharma & Team Innovators</h1>
                  <p className="cert-team-tag">
                    Team: <strong>EcoTech Pioneers</strong> | Project: <strong>Smart Energy Grid</strong>
                  </p>
                </div>

                {/* CERTIFICATE MAIN BODY */}
                <div className="cert-body">
                  <h2 className="cert-award-title">{certTitle}</h2>
                  <div className="cert-event-badge">{eventTitle}</div>
                  <p className="cert-statement">{customMessage}</p>
                </div>

                {/* CERTIFICATE FOOTER & SIGNATURES */}
                <div className="cert-footer">
                  <div className="cert-footer-col">
                    <div className="cert-date-val">
                      {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </div>
                    <div className="cert-line" />
                    <span className="cert-label">Date of Issuance</span>
                  </div>

                  <div className="cert-seal">
                    {sealUrl ? (
                      <img src={sealUrl} alt="Official Seal" className="custom-rendered-seal" />
                    ) : (
                      <div className="seal-circle">
                        <span>★</span>
                        <strong>OFFICIAL</strong>
                        <small>VERIFIED</small>
                      </div>
                    )}
                  </div>

                  <div className="cert-footer-col">
                    {signatureUrl ? (
                      <img src={signatureUrl} alt="Signature" className="custom-rendered-signature" />
                    ) : null}
                    <div className="cert-sign-name">{issuerName}</div>
                    <div className="cert-line" />
                    <span className="cert-label">{issuerTitle}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DISTRIBUTION SUCCESS REPORT */}
          {distributionResult && (
            <div className="distribution-report-card">
              <div className="report-header">
                <span className="report-badge">✓ BATCH COMPLETED</span>
                <h3>{distributionResult.count} Certificates Successfully Generated!</h3>
              </div>
              <p>
                All approved teams can now view, download, and verify their credentials on the public portal.
              </p>
              <div className="report-actions">
                <Link to="/verify" className="button button-primary" target="_blank">
                  Open Verification Portal ↗
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
