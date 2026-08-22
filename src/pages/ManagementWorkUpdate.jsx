import React, { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { api } from "../api/client";
import "./ManagementWorkUpdate.css";

const STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
  "Blocked",
];

const PRIORITIES = [
  "Low",
  "Normal",
  "High",
  "Urgent",
];

export default function ManagementWorkUpdate() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [status, setStatus] =
    useState("In Progress");

  const [priority, setPriority] =
    useState("Normal");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (title.trim().length < 2) {
      setError(
        "Please enter a valid update title."
      );
      return;
    }

    if (
      description.trim().length < 2
    ) {
      setError(
        "Please describe the work update."
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await api.post(
          "/api/v1/management/updates",
          {
            title: title.trim(),
            description:
              description.trim(),
            status,
            priority,
          }
        );

      const data =
        response?.data ??
        response;

      if (
        data?.success === false
      ) {
        throw new Error(
          data?.message ||
            "Unable to submit update."
        );
      }

      setSuccess(
        "Work update submitted successfully."
      );

      setTitle("");
      setDescription("");
      setStatus("In Progress");
      setPriority("Normal");

      setTimeout(() => {
        navigate(
          "/management",
          { replace: true }
        );
      }, 700);

    } catch (err) {
      setError(
        err?.message ||
          "Unable to submit work update."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="management-update-page">

      <header className="management-update-header">

        <div>
          <Link
            to="/management"
            className="management-update-back"
          >
            ← MANAGEMENT PORTAL
          </Link>

          <h1>
            Submit Work Update
          </h1>

          <p>
            Keep the organizing team informed
            about your current work.
          </p>
        </div>

      </header>

      <section className="management-update-content">

        <div className="management-update-card">

          <div className="management-update-card-heading">

            <span>
              EVENT OPERATIONS
            </span>

            <h2>
              Work Update
            </h2>

            <p>
              Add a clear title and describe
              what has been completed, what is
              in progress, or what is blocked.
            </p>

          </div>

          {error && (
            <div className="management-update-error">
              {error}
            </div>
          )}

          {success && (
            <div className="management-update-success">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="management-update-form"
          >

            <label>
              Update Title

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                maxLength={150}
                placeholder="Example: Venue setup completed"
                disabled={saving}
                required
              />

              <small>
                {title.length}/150
              </small>
            </label>

            <label>
              Description

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                maxLength={3000}
                rows={8}
                placeholder="Describe the work, progress, issue, or next action..."
                disabled={saving}
                required
              />

              <small>
                {description.length}/3000
              </small>
            </label>

            <div className="management-update-fields">

              <label>
                Status

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value
                    )
                  }
                  disabled={saving}
                >
                  {STATUSES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Priority

                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value
                    )
                  }
                  disabled={saving}
                >
                  {PRIORITIES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </label>

            </div>

            <div className="management-update-actions">

              <Link
                to="/management"
                className="management-update-cancel"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Submitting..."
                  : "Submit Work Update"}
              </button>

            </div>

          </form>

        </div>

      </section>

    </main>
  );
}