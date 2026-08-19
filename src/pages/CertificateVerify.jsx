import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./CertificateVerify.css";

export default function CertificateVerify() {
  const { certificateId: paramCertId } = useParams();

  const [inputCertId, setInputCertId] = useState(paramCertId || "");
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (paramCertId) {
      setInputCertId(paramCertId);
      performVerify(paramCertId);
    }
  }, [paramCertId]);

  const performVerify = async (idToVerify) => {
    const cleanId = idToVerify.trim();
    if (!cleanId) {
      setError("Please enter a valid Certificate ID (e.g. NXR-XXXXXX).");
      return;
    }

    setLoading(true);
    setError("");
    setCertificate(null);
    setSearched(true);

    try {
      const response = await api.get(`/api/v1/certificate/verify/${cleanId}`);
      const data = response?.data || response;

      if (!data || !data.certificateId) {
        throw new Error("Certificate not found. Please double-check the ID.");
      }

      setCertificate(data);
    } catch (err) {
      setError(
        err?.message || "Certificate not found or invalid credential ID."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performVerify(inputCertId);
  };

  const copyLink = () => {
    const url = window.location.origin + `/verify/${certificate.certificateId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="website">
      <Navbar />

      <main className="cert-verify-page">
        <div className="cert-verify-hero">
          <div className="container">
            <div className="cert-header">
              <span className="cert-badge">CREDENTIAL VERIFICATION PORTAL</span>
              <h1>
                Verify Official <span>Certificate</span>
              </h1>
              <p>
                Enter the unique NEXORA Certificate ID to instantly verify
                authenticity, recipient details, and participation credentials.
              </p>

              <form onSubmit={handleSearch} className="cert-search-box">
                <input
                  type="text"
                  placeholder="Enter Certificate ID (e.g., NXR-A1B2C3D4E5F6)"
                  value={inputCertId}
                  onChange={(e) => setInputCertId(e.target.value)}
                />
                <button type="submit" className="button button-primary" disabled={loading}>
                  {loading ? "Verifying..." : "Verify Credential →"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <section className="container cert-result-section">
          {loading && (
            <div className="cert-loading-card">
              <div className="cert-spinner" />
              <p>Verifying cryptographic record with Nexora registry...</p>
            </div>
          )}

          {error && searched && !loading && (
            <div className="cert-error-card">
              <span className="error-icon">⚠️</span>
              <h3>No Valid Certificate Found</h3>
              <p>{error}</p>
              <div className="error-help">
                <p>Tips for verification:</p>
                <ul>
                  <li>Ensure there are no typos in the Certificate ID.</li>
                  <li>Certificate IDs begin with <code>NXR-</code>.</li>
                  <li>
                    If you just got approved, please allow a few minutes for
                    issuance.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {certificate && !loading && (
            <div className="cert-display-card">
              <div className="cert-status-banner">
                <span className="verified-seal">✓</span>
                <div>
                  <strong>AUTHENTIC & VERIFIED CREDENTIAL</strong>
                  <p>Recorded securely in the NEXORA E-CELL database</p>
                </div>
              </div>

              {/* Certificate Sheet View */}
              <div className="cert-sheet">
                <div className="cert-sheet-border">
                  <div className="cert-sheet-header">
                    <div className="cert-logo-title">
                      <h2>NEXORA E-CELL</h2>
                      <span>INNOVATION • ENTREPRENEURSHIP • IMPACT</span>
                    </div>
                    <div className="cert-id-tag">
                      ID: <strong>{certificate.certificateId}</strong>
                    </div>
                  </div>

                  <div className="cert-sheet-body">
                    <p className="cert-intro">This is to officially certify that</p>
                    <h3 className="cert-recipient">
                      {certificate.leaderName || "Team Representative"}
                    </h3>
                    <p className="cert-team-text">
                      representing team <strong>"{certificate.teamName}"</strong>
                    </p>
                    <p className="cert-description">
                      has successfully registered and qualified as an innovative
                      startup team under the <strong>NEXORA E-CELL Entrepreneurship Initiative</strong>.
                    </p>
                  </div>

                  <div className="cert-sheet-footer">
                    <div className="cert-seal-box">
                      <div className="gold-seal">★ NEXORA ★ OFFICIAL</div>
                      <span>OFFICIAL SEAL</span>
                    </div>

                    <div className="cert-meta-box">
                      <div>
                        <label>Issue Date</label>
                        <strong>
                          {certificate.generatedAt
                            ? new Date(certificate.generatedAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "—"}
                        </strong>
                      </div>
                      <div>
                        <label>Team ID</label>
                        <strong>{certificate.teamId || "—"}</strong>
                      </div>
                      <div>
                        <label>Credential Status</label>
                        <strong className="status-active">
                          {certificate.status || "Active"}
                        </strong>
                      </div>
                    </div>

                    <div className="cert-sig-box">
                      <div className="cert-sig-line" />
                      <strong>Faculty In-Charge & Convenor</strong>
                      <span>NEXORA E-CELL</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cert-actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handlePrint}
                >
                  🖨️ Print / Save PDF
                </button>

                <button
                  type="button"
                  className="button button-ghost"
                  onClick={copyLink}
                >
                  {copied ? "✓ Link Copied!" : "🔗 Share Verification Link"}
                </button>

                <Link to="/track" className="button button-ghost">
                  Track Another Application
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
