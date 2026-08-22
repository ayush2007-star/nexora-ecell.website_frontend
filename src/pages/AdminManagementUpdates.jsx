import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { api } from "../api/client";

import "./AdminManagementUpdates.css";


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


export default function AdminManagementUpdates() {

  const navigate = useNavigate();

  const [updates, setUpdates] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [search, setSearch] =
    useState("");


  useEffect(() => {

    const token =
       localStorage.getItem("access_token") ||
  localStorage.getItem("nexora_access_token") ||
  localStorage.getItem("nexra_access_token");

    const user = JSON.parse(
      localStorage.getItem(
        "nexora_user"
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
        (Array.isArray(data)
          ? data
          : []);

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


  const getStatusClass = (
    status
  ) => {

    return String(
      status || "pending"
    )
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      );
  };


  const getPriorityClass = (
    priority
  )=> {

    return String(
      priority || "normal"
    ).toLowerCase();

  };


  const formatDate = (
    value
  ) => {

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


  return (
    <main className="admin-management-updates-page">

      <header className="admin-management-updates-header">

        <div>

          <Link
            to="/admin"
            className="admin-management-updates-back"
          >
            ← NEXORA ADMIN
          </Link>

          <div className="admin-management-updates-kicker">
            MANAGEMENT OPERATIONS
          </div>

          <h1>
            Work Updates Monitor
          </h1>

          <p>
            Monitor progress submitted by
            management staff.
          </p>

        </div>


        <div className="admin-management-updates-header-actions">

          <Link
            to="/admin/management"
            className="admin-management-updates-link"
          >
            Management Accounts
          </Link>

          <button
            type="button"
            onClick={loadUpdates}
            className="admin-management-updates-refresh"
          >
            Refresh
          </button>

        </div>

      </header>


      <section className="admin-management-updates-content">


        {error && (
          <div className="admin-management-updates-error">
            {error}
          </div>
        )}


        {/* STATS */}

        <section className="admin-management-updates-stats">

          <div className="admin-management-updates-stat">
            <span>
              TOTAL
            </span>

            <strong>
              {updates.length}
            </strong>
          </div>


          <div className="admin-management-updates-stat">
            <span>
              IN PROGRESS
            </span>

            <strong>
              {progressCount}
            </strong>
          </div>


          <div className="admin-management-updates-stat">
            <span>
              COMPLETED
            </span>

            <strong>
              {completedCount}
            </strong>
          </div>


          <div className="admin-management-updates-stat">
            <span>
              BLOCKED
            </span>

            <strong>
              {blockedCount}
            </strong>
          </div>

        </section>


        {/* FILTERS */}

        <section className="admin-management-updates-filters">

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search staff, update, department..."
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
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  Status: {status}
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
              (priority) => (
                <option
                  key={priority}
                  value={priority}
                >
                  Priority: {priority}
                </option>
              )
            )}

          </select>

        </section>


        {/* TABLE */}

        <section className="admin-management-updates-card">

          <div className="admin-management-updates-card-heading">

            <div>

              <span>
                LIVE OPERATIONS
              </span>

              <h2>
                Staff Updates
              </h2>

            </div>

            <strong>
              {filteredUpdates.length}
              {" "}
              shown
            </strong>

          </div>


          {loading ? (

            <div className="admin-management-updates-empty">
              Loading management updates...
            </div>

          ) : filteredUpdates.length === 0 ? (

            <div className="admin-management-updates-empty">

              <strong>
                No updates found.
              </strong>

              <p>
                Try changing the filters or
                search terms.
              </p>

            </div>

          ) : (

            <div className="admin-management-updates-table-wrap">

              <table className="admin-management-updates-table">

                <thead>

                  <tr>
                    <th>Staff</th>
                    <th>Update</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Submitted</th>
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
                              "Untitled update"
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
                              {
                                item.updateId
                              }
                            </small>
                          )}

                        </td>


                        <td>

                          <span
                            className={`admin-management-update-status status-${getStatusClass(
                              item.status
                            )}`}
                          >
                            {
                              item.status ||
                              "Pending"
                            }
                          </span>

                        </td>


                        <td>

                          <span
                            className={`admin-management-update-priority priority-${getPriorityClass(
                              item.priority
                            )}`}
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