import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { ASSETS } from "../constants/assets";
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

  const themeClass = `theme-${certificate?.theme || "gold"}`;

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
                  placeholder="Enter Certificate ID (e.g. NXR-XXXXXX)"
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
                  <li>Certificate IDs usually begin with <code>NXR-</code>.</li>
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
              <div className={`cert-sheet ${themeClass}`}>
                <div className="cert-sheet-border">
                  <div className="cert-sheet-inner">
                    {/* CORNER ORNAMENTS */}
                    <div className="corner-ornament top-left">✦</div>
                    <div className="corner-ornament top-right">✦</div>
                    <div className="corner-ornament bottom-left">✦</div>
                    <div className="corner-ornament bottom-right">✦</div>

                    <div className="cert-sheet-header">
                      <div className="cert-logo-title">
                        <img
                          src={certificate.logoUrl || ASSETS.logoPrimary}
                          alt="Nexora Logo"
                          className="cert-logo-badge"
                        />
                        <div>
                          <h2>NEXORA E-CELL</h2>
                          <span>CENTRE FOR INNOVATION & ENTREPRENEURSHIP</span>
                        </div>
                      </div>
                      <div className="cert-id-tag">
                        ID: <strong>{certificate.certificateId}</strong>
                      </div>
                    </div>

                    <div className="cert-sheet-body">
                      <div className="cert-kicker-text">THIS CERTIFICATE IS PROUDLY PRESENTED TO</div>
                      <h3 className="cert-recipient">
                        {certificate.leaderName || "Team Representative"}
                      </h3>
                      <p className="cert-team-text">
                        Team: <strong>"{certificate.teamName}"</strong>
                        {certificate.projectName && certificate.projectName !== certificate.teamName && (
                          <span> | Project: <strong>"{certificate.projectName}"</strong></span>
                        )}
                      </p>

                      {certificate.memberNames && certificate.memberNames.length > 0 && (
                        <p className="cert-members-text">
                          Team Members: <em>{certificate.memberNames.join(", ")}</em>
                        </p>
                      )}

                      <h4 className="cert-custom-title">{certificate.title || "Certificate of Excellence"}</h4>
                      
                      <div className="cert-event-tag">
                        {certificate.eventTitle || "Nexora Innovation Initiative"}
                      </div>

                      <p className="cert-description">
                        {certificate.customMessage ||
                          "In recognition of outstanding innovative thinking, active problem-solving, and dedication to entrepreneurial excellence."}
                      </p>
                    </div>

                    <div className="cert-sheet-footer">
                      <div className="cert-footer-col">
                        <div className="cert-date-text">
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
                        </div>
                        <div className="cert-line-divider" />
                        <span>Date of Issuance</span>
                      </div>

                      <div className="cert-seal-box">
                        {certificate.sealUrl ? (
                          <img
                            src={certificate.sealUrl}
                            alt="Official Seal"
                            className="cert-rendered-seal-img"
                          />
                        ) : (
                          <div className="gold-seal">
                            <span>★</span>
                            <strong>NEXORA</strong>
                            <small>OFFICIAL SEAL</small>
                          </div>
                        )}
                      </div>

                      <div className="cert-sig-box">
                        {certificate.signatureUrl ? (
                          <img
                            src={certificate.signatureUrl}
                            alt="Signature"
                            className="cert-rendered-sig-img"
                          />
                        ) : null}
                        <strong className="sign-name-text">
                          {certificate.issuerName || "Prof. A. K. Sharma"}
                        </strong>
                        <div className="cert-sig-line" />
                        <span className="sign-title-text">
                          {certificate.issuerTitle || "Convener & Head of Incubation"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cert-actions">
                <button
                  type="button"
                  className="button button-primary button-glow"
                  onClick={handlePrint}
                >
                  🖨️ Print / Save as PDF
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
