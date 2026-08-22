import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { api } from "../api/client";

import "./ManagementUpdates.css";


const STATUS_OPTIONS = [
  "All",
  "Pending",
  "In Progress",
  "Completed",
  "Blocked",
];

const PRIORITY_OPTIONS = [
  "All",
  "Low",
  "Normal",
  "High",
  "Urgent",
];


export default function ManagementUpdates() {

  const navigate = useNavigate();

  const [updates, setUpdates] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [priorityFilter, setPriorityFilter] =
    useState("All");


  useEffect(() => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    const user = JSON.parse(
      localStorage.getItem(
        "user"
      ) || "null"
    );

    const role = String(
      user?.role || ""
    )
      .trim()
      .toLowerCase();

    if (
      !token ||
      role !== "admin"
    ) {
      navigate(
        "/admin/login",
        {
          replace: true,
        }
      );

      return;
    }

    loadUpdates();

  }, []);


  const loadUpdates = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/api/v1/management/admin/updates"
        );

      const data =
        response?.data ??
        response;

      const list =
        data?.data ??
        (
          Array.isArray(data)
            ? data
            : []
        );

      setUpdates(
        Array.isArray(list)
          ? list
          : []
      );

    } catch (err) {

      setError(
        err?.message ||
        "Unable to load management updates."
      );

    } finally {

      setLoading(false);

    }
  };


  const filteredUpdates =
    updates.filter((item) => {

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        item.priority === priorityFilter;

      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return (
          matchesStatus &&
          matchesPriority
        );
      }

      const searchable = [
        item.title,
        item.description,
        item.fullName,
        item.email,
        item.department,
        item.designation,
        item.updateId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        matchesPriority &&
        searchable.includes(query)
      );
    });


  const completedCount =
    updates.filter(
      (item) =>
        item.status === "Completed"
    ).length;


  const progressCount =
    updates.filter(
      (item) =>
        item.status === "In Progress"
    ).length;


  const blockedCount =
    updates.filter(
      (item) =>
        item.status === "Blocked"
    ).length;


  const formatDate = (value) => {

    if (!value) {
      return "—";
    }

    try {

      return new Date(
        value
      ).toLocaleString(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );

    } catch {

      return String(value);

    }
  };


  const statusClass = (value) => {

    return String(
      value || "pending"
    )
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      );
  };


  const priorityClass = (value) => {

    return String(
      value || "normal"
    ).toLowerCase();

  };


  return (
    <main className="management-updates-page">

      <header className="management-updates-header">

        <div>

          <Link
            to="/admin"
            className="management-updates-back"
          >
            ← ADMIN DASHBOARD
          </Link>

          <span className="management-updates-kicker">
            MANAGEMENT OPERATIONS
          </span>

          <h1>
            Work Updates
          </h1>

          <p>
            Monitor work updates submitted
            by management staff.
          </p>

        </div>


        <div className="management-updates-actions">

          <Link
            to="/admin/management"
            className="management-updates-account-link"
          >
            Management Accounts
          </Link>

          <button
            type="button"
            onClick={loadUpdates}
            className="management-updates-refresh"
          >
            Refresh
          </button>

        </div>

      </header>


      <section className="management-updates-content">

        {error && (
          <div className="management-updates-error">
            {error}
          </div>
        )}


        <section className="management-updates-stats">

          <div className="management-updates-stat">

            <span>
              TOTAL UPDATES
            </span>

            <strong>
              {updates.length}
            </strong>

          </div>


          <div className="management-updates-stat">

            <span>
              IN PROGRESS
            </span>

            <strong>
              {progressCount}
            </strong>

          </div>


          <div className="management-updates-stat">

            <span>
              COMPLETED
            </span>

            <strong>
              {completedCount}
            </strong>

          </div>


          <div className="management-updates-stat">

            <span>
              BLOCKED
            </span>

            <strong>
              {blockedCount}
            </strong>

          </div>

        </section>


        <section className="management-updates-filters">

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search staff, title, department..."
          />


          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >

            {STATUS_OPTIONS.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  Status: {item}
                </option>
              )
            )}

          </select>


          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(
                event.target.value
              )
            }
          >

            {PRIORITY_OPTIONS.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  Priority: {item}
                </option>
              )
            )}

          </select>

        </section>


        <section className="management-updates-card">

          <div className="management-updates-card-title">

            <div>

              <span>
                LIVE OPERATIONS
              </span>

              <h2>
                Staff Work Updates
              </h2>

            </div>

            <strong>
              {filteredUpdates.length}
              {" "}
              shown
            </strong>

          </div>


          {loading ? (

            <div className="management-updates-empty">
              Loading updates...
            </div>

          ) : filteredUpdates.length === 0 ? (

            <div className="management-updates-empty">

              <strong>
                No work updates found.
              </strong>

              <p>
                Management staff have not
                submitted matching updates yet.
              </p>

            </div>

          ) : (

            <div className="management-updates-table-wrap">

              <table className="management-updates-table">

                <thead>

                  <tr>

                    <th>
                      MANAGEMENT
                    </th>

                    <th>
                      WORK UPDATE
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      PRIORITY
                    </th>

                    <th>
                      SUBMITTED
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredUpdates.map(
                    (item, index) => (

                      <tr
                        key={
                          item.updateId ||
                          item._id ||
                          index
                        }
                      >

                        <td>

                          <strong>
                            {
                              item.fullName ||
                              "Management Staff"
                            }
                          </strong>

                          <small>
                            {
                              item.email ||
                              item.userId ||
                              "—"
                            }
                          </small>

                          <small>
                            {
                              item.department ||
                              "Event Management"
                            }
                          </small>

                        </td>


                        <td>

                          <strong>
                            {
                              item.title ||
                              "Untitled Update"
                            }
                          </strong>

                          <p>
                            {
                              item.description ||
                              "No description provided."
                            }
                          </p>

                          {item.updateId && (
                            <small>
                              ID:{" "}
                              {item.updateId}
                            </small>
                          )}

                        </td>


                        <td>

                          <span
                            className={
                              `management-updates-status status-${statusClass(
                                item.status
                              )}`
                            }
                          >
                            {
                              item.status ||
                              "Pending"
                            }
                          </span>

                        </td>


                        <td>

                          <span
                            className={
                              `management-updates-priority priority-${priorityClass(
                                item.priority
                              )}`
                            }
                          >
                            {
                              item.priority ||
                              "Normal"
                            }
                          </span>

                        </td>


                        <td>

                          <strong>
                            {formatDate(
                              item.createdAt
                            )}
                          </strong>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </section>

    </main>
  );
}