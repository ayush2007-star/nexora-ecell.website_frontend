import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

import "./ParticipantDashboard.css";

export default function ParticipantDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [pitchDeckUrl, setPitchDeckUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingPitch, setSavingPitch] =
    useState(false);
  const [claimingFood, setClaimingFood] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("nexora_user") ||
      "null"
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
      !["leader", "student", "participant"].includes(
        role
      )
    ) {
      navigate("/participant/login", {
        replace: true,
      });
      return;
    }

    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/v1/participant/profile"
      );

      const payload =
        response?.data || response;

      setProfile(payload);

      setPitchDeckUrl(
        payload?.project?.pitchDeckUrl || ""
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load participant profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const savePitchDeck = async () => {
    if (!pitchDeckUrl.trim()) {
      setError(
        "Please enter your pitch deck URL."
      );
      return;
    }

    try {
      setSavingPitch(true);
      setError("");
      setMessage("");

      const response = await api.put(
        "/api/v1/participant/pitchdeck",
        {
          pitchDeckUrl:
            pitchDeckUrl.trim(),
        }
      );

      const payload =
        response?.data || response;

      setMessage(
        payload?.message ||
          "Pitch deck updated successfully."
      );

      await loadProfile();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update pitch deck."
      );
    } finally {
      setSavingPitch(false);
    }
  };

  const claimFood = async () => {
    try {
      setClaimingFood(true);
      setError("");
      setMessage("");

      const response = await api.post(
        "/api/v1/participant/claim-food",
        {}
      );

      const payload =
        response?.data || response;

      setProfile((previous) => ({
        ...previous,
        mealPass: {
          ...(previous?.mealPass || {}),
          ...(payload || {}),
        },
      }));

      setMessage(
        payload?.message ||
          "Meal pass activated."
      );

      await loadProfile();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to activate meal pass."
      );
    } finally {
      setClaimingFood(false);
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

  if (loading) {
    return (
      <main className="participant-loading">
        <div>
          <div className="participant-spinner" />
          <p>
            Loading participant portal...
          </p>
        </div>
      </main>
    );
  }

  const participant =
    profile?.user || user || {};

  const team = profile?.team || {};
  const project = profile?.project || {};
  const members = profile?.members || [];
  const certificate =
    profile?.certificate || null;
  const mealPass =
    profile?.mealPass || {};

  return (
    <main className="participant-page">

      {/* HEADER */}

      <header className="participant-header">
        <div>
          <div className="participant-brand">
            <span />
            NEXORA
          </div>

          <small>
            PARTICIPANT PORTAL
          </small>
        </div>

        <div className="participant-header-right">
          <div className="participant-user">
            <strong>
              {participant?.fullName ||
                "Participant"}
            </strong>

            <span>
              {participant?.email || ""}
            </span>
          </div>

          <button
            onClick={logout}
            className="participant-logout"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="participant-content">

        {/* WELCOME */}

        <div className="participant-welcome">
          <div>
            <span className="participant-badge">
              PARTICIPANT DASHBOARD
            </span>

            <h1>
              Welcome,{" "}
              {participant?.fullName ||
                "Participant"}
              .
            </h1>

            <p>
              Manage your registration, team,
              project and event information.
            </p>
          </div>

          <div className="participant-status-card">
            <span>Registration Status</span>

            <strong
              className={
                String(
                  team?.status || ""
                ).toLowerCase() ===
                "approved"
                  ? "status-approved"
                  : "status-pending"
              }
            >
              {team?.status ||
                participant?.status ||
                "Pending"}
            </strong>
          </div>
        </div>

        {message && (
          <div className="participant-success">
            {message}
          </div>
        )}

        {error && (
          <div className="participant-error">
            {error}
          </div>
        )}

        {/* TOP STATS */}

        <div className="participant-stats">

          <div className="participant-stat">
            <span>Team ID</span>
            <strong>
              {team?.teamId || "—"}
            </strong>
          </div>

          <div className="participant-stat">
            <span>Team Name</span>
            <strong>
              {team?.teamName || "—"}
            </strong>
          </div>

          <div className="participant-stat">
            <span>Attendance</span>
            <strong>
              {mealPass?.attendanceStatus ||
                team?.attendanceStatus ||
                "Absent"}
            </strong>
          </div>

          <div className="participant-stat">
            <span>Food</span>
            <strong>
              {mealPass?.foodStatus ||
                team?.foodStatus ||
                "Food Pending"}
            </strong>
          </div>

        </div>

        {/* GRID */}

        <div className="participant-grid">

          {/* TEAM */}

          <section className="participant-card">
            <div className="participant-card-heading">
              <div>
                <span>TEAM</span>
                <h2>Team Information</h2>
              </div>
            </div>

            <div className="participant-details">

              <div>
                <span>Team ID</span>
                <strong>
                  {team?.teamId || "—"}
                </strong>
              </div>

              <div>
                <span>Team Name</span>
                <strong>
                  {team?.teamName || "—"}
                </strong>
              </div>

              <div>
                <span>Event</span>
                <strong>
                  {team?.eventName || "—"}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {team?.status || "Pending"}
                </strong>
              </div>

              {team?.remarks && (
                <div className="full-width">
                  <span>Admin Remarks</span>
                  <strong>
                    {team.remarks}
                  </strong>
                </div>
              )}

            </div>
          </section>


          {/* PROJECT */}

          <section className="participant-card">
            <div className="participant-card-heading">
              <div>
                <span>PROJECT</span>
                <h2>Project Information</h2>
              </div>
            </div>

            <div className="participant-details">

              <div>
                <span>Project Name</span>
                <strong>
                  {project?.projectName ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>Domain</span>
                <strong>
                  {project?.domain || "—"}
                </strong>
              </div>

              <div>
                <span>Stage</span>
                <strong>
                  {project?.stage || "—"}
                </strong>
              </div>

              <div>
                <span>Eureka Team ID</span>
                <strong>
                  {project?.eurekaTeamId ||
                    "—"}
                </strong>
              </div>

            </div>
          </section>


          {/* MEMBERS */}

          <section className="participant-card participant-card-wide">

            <div className="participant-card-heading">
              <div>
                <span>TEAM</span>
                <h2>Team Members</h2>
              </div>

              <strong>
                {members.length} Members
              </strong>
            </div>

            {members.length === 0 ? (
              <div className="participant-empty">
                No team members found.
              </div>
            ) : (
              <div className="member-table">

                <div className="member-row member-head">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Phone</span>
                  <span>Role</span>
                </div>

                {members.map(
                  (member, index) => (
                    <div
                      className="member-row"
                      key={
                        member?.memberId ||
                        member?._id ||
                        index
                      }
                    >
                      <span>
                        {member?.memberName ||
                          member?.name ||
                          "—"}
                      </span>

                      <span>
                        {member?.memberEmail ||
                          "—"}
                      </span>

                      <span>
                        {member?.memberPhone ||
                          "—"}
                      </span>

                      <span>
                        {member?.isLeader
                          ? "Team Leader"
                          : member?.role ||
                            "Team Member"}
                      </span>
                    </div>
                  )
                )}

              </div>
            )}
          </section>


          {/* PITCH DECK */}

          <section className="participant-card">

            <div className="participant-card-heading">
              <div>
                <span>SUBMISSION</span>
                <h2>Pitch Deck</h2>
              </div>
            </div>

            <p className="participant-card-description">
              Add your Google Drive, Canva,
              OneDrive or public pitch deck URL.
            </p>

            <input
              className="participant-input"
              type="url"
              value={pitchDeckUrl}
              onChange={(e) =>
                setPitchDeckUrl(
                  e.target.value
                )
              }
              placeholder="https://..."
            />

            <div className="participant-action-row">

              <button
                onClick={savePitchDeck}
                disabled={savingPitch}
                className="participant-primary-button"
              >
                {savingPitch
                  ? "Saving..."
                  : "Save Pitch Deck"}
              </button>

              {project?.pitchDeckUrl && (
                <a
                  href={
                    project.pitchDeckUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="participant-secondary-button"
                >
                  Open Deck ↗
                </a>
              )}

            </div>
          </section>


          {/* FOOD PASS */}

          <section className="participant-card">

            <div className="participant-card-heading">
              <div>
                <span>EVENT</span>
                <h2>Food Pass</h2>
              </div>
            </div>

            <div className="food-pass">

              <div>
                <span>Status</span>
                <strong>
                  {mealPass?.foodStatus ||
                    "Food Pending"}
                </strong>
              </div>

              <div>
                <span>Attendance</span>
                <strong>
                  {mealPass?.attendanceStatus ||
                    "Absent"}
                </strong>
              </div>

              {mealPass?.token && (
                <div className="food-token">
                  <span>Digital Token</span>
                  <strong>
                    {mealPass.token}
                  </strong>
                </div>
              )}

            </div>

            <button
              onClick={claimFood}
              disabled={claimingFood}
              className="participant-primary-button full-button"
            >
              {claimingFood
                ? "Activating..."
                : "Activate Food Pass"}
            </button>
          </section>


          {/* CERTIFICATE */}

          <section className="participant-card participant-card-wide">

            <div className="participant-card-heading">
              <div>
                <span>ACHIEVEMENT</span>
                <h2>Certificate</h2>
              </div>
            </div>

            {certificate ? (
              <div className="certificate-box">

                <div>
                  <span>
                    Certificate ID
                  </span>

                  <strong>
                    {certificate?.certificateId ||
                      "—"}
                  </strong>
                </div>

                <a
                  href={
                    certificate?.certificateUrl ||
                    certificate?.verificationUrl ||
                    "#"
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="participant-primary-button"
                >
                  View Certificate ↗
                </a>

              </div>
            ) : (
              <div className="participant-empty">
                Certificate will appear here
                once it is generated by admin.
              </div>
            )}

          </section>

        </div>
      </section>
    </main>
  );
}