import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "./AdminManagement.css";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  department: "Event Management",
  designation: "Management Staff",
  isActive: true,
};

export default function AdminManagement() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const currentUser = JSON.parse(
    localStorage.getItem("nexora_user") || "null"
  );

  useEffect(() => {
    const token =  localStorage.getItem("access_token") ||
  localStorage.getItem("nexora_access_token") ||
  localStorage.getItem("nexra_access_token");

    const role = String(
      currentUser?.role || ""
    ).toLowerCase();

    if (
      !token ||
      role !== "admin"
    ) {
      navigate("/admin/login", {
        replace: true,
      });

      return;
    }

    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/v1/management/admin/accounts"
      );

      const data =
        response?.data ?? response;

      setAccounts(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load management accounts."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);

    setForm({
      ...EMPTY_FORM,
    });
  };

  const showToast = (
    message
  ) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 3000);
  };

  const startEdit = (
    account
  ) => {
    setEditingId(
      account.userId
    );

    setForm({
      fullName:
        account.fullName || "",

      email:
        account.email || "",

      password: "",

      phone:
        account.phone || "",

      department:
        account.department ||
        "Event Management",

      designation:
        account.designation ||
        "Management Staff",

      isActive:
        account.isActive !== false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const submitForm = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (
        !form.fullName.trim()
      ) {
        throw new Error(
          "Full name is required."
        );
      }

      if (
        !form.email.trim()
      ) {
        throw new Error(
          "Email is required."
        );
      }

      if (
        !editingId &&
        form.password.length < 6
      ) {
        throw new Error(
          "Password must be at least 6 characters."
        );
      }

      if (editingId) {
        const payload = {
          fullName:
            form.fullName.trim(),

          email:
            form.email
              .trim()
              .toLowerCase(),

          phone:
            form.phone.trim(),

          department:
            form.department.trim(),

          designation:
            form.designation.trim(),

          isActive:
            Boolean(form.isActive),
        };

        if (
          form.password.trim()
        ) {
          payload.password =
            form.password;
        }

        await api.put(
          `/api/v1/management/admin/accounts/${editingId}`,
          payload
        );

        showToast(
          "Management account updated successfully."
        );
      } else {
        await api.post(
          "/api/v1/management/admin/accounts",
          {
            fullName:
              form.fullName.trim(),

            email:
              form.email
                .trim()
                .toLowerCase(),

            password:
              form.password,

            phone:
              form.phone.trim(),

            department:
              form.department.trim(),

            designation:
              form.designation.trim(),

            isActive:
              Boolean(form.isActive),
          }
        );

        showToast(
          "Management account created successfully."
        );
      }

      resetForm();

      await loadAccounts();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save management account."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async (
    account
  ) => {
    const confirmed =
      window.confirm(
        `Delete ${account.fullName}'s management account?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/api/v1/management/admin/accounts/${account.userId}`
      );

      showToast(
        "Management account deleted."
      );

      if (
        editingId ===
        account.userId
      ) {
        resetForm();
      }

      await loadAccounts();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to delete management account."
      );
    }
  };

  const toggleActive = async (
    account
  ) => {
    try {
      setError("");

      await api.put(
        `/api/v1/management/admin/accounts/${account.userId}`,
        {
          isActive:
            account.isActive === false,
        }
      );

      showToast(
        account.isActive === false
          ? "Account activated."
          : "Account deactivated."
      );

      await loadAccounts();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to change account status."
      );
    }
  };

  return (
    <main className="admin-management-page">

      <header className="admin-management-header">

        <div>
          <Link
            to="/admin"
            className="admin-management-brand"
          >
            ← NEXORA ADMIN
          </Link>

          <h1>
            Management Accounts
          </h1>

          <p>
            Create and control accounts for
            event management staff.
          </p>
        </div>

        <div className="admin-management-header-actions">

          <Link
            to="/admin/mentors"
            className="admin-management-link"
          >
            Mentor / Judge Management
          </Link>

          <Link
            to="/admin"
            className="admin-management-link"
          >
            Dashboard
          </Link>

        </div>

      </header>

      <section className="admin-management-content">

        {toast && (
          <div className="management-admin-toast">
            {toast}
          </div>
        )}

        {error && (
          <div className="management-admin-error">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* ACCOUNT FORM */}
        {/* ================================================= */}

        <section className="management-admin-card">

          <div className="management-admin-heading">

            <div>
              <span>
                {editingId
                  ? "EDIT ACCOUNT"
                  : "NEW ACCOUNT"}
              </span>

              <h2>
                {editingId
                  ? "Edit Management Staff"
                  : "Create Management Account"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                className="management-secondary-btn"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}

          </div>

          <form
            onSubmit={submitForm}
          >

            <div className="management-admin-form-grid">

              <label>
                Full Name

                <input
                  value={
                    form.fullName
                  }
                  onChange={(event) =>
                    updateField(
                      "fullName",
                      event.target.value
                    )
                  }
                  placeholder="Management staff name"
                  required
                />
              </label>

              <label>
                Email

                <input
                  type="email"
                  value={
                    form.email
                  }
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="manager@example.com"
                  required
                />
              </label>

              <label>
                Password

                <input
                  type="password"
                  value={
                    form.password
                  }
                  onChange={(event) =>
                    updateField(
                      "password",
                      event.target.value
                    )
                  }
                  placeholder={
                    editingId
                      ? "Leave blank to keep password"
                      : "Minimum 6 characters"
                  }
                  required={
                    !editingId
                  }
                />
              </label>

              <label>
                Phone

                <input
                  value={
                    form.phone
                  }
                  onChange={(event) =>
                    updateField(
                      "phone",
                      event.target.value
                    )
                  }
                  placeholder="Phone number"
                />
              </label>

              <label>
                Department

                <input
                  value={
                    form.department
                  }
                  onChange={(event) =>
                    updateField(
                      "department",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Designation

                <input
                  value={
                    form.designation
                  }
                  onChange={(event) =>
                    updateField(
                      "designation",
                      event.target.value
                    )
                  }
                />
              </label>

            </div>

            {editingId && (
              <label className="management-active-checkbox">

                <input
                  type="checkbox"
                  checked={
                    form.isActive
                  }
                  onChange={(event) =>
                    updateField(
                      "isActive",
                      event.target.checked
                    )
                  }
                />

                Account Active

              </label>
            )}

            <button
              type="submit"
              className="management-primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Save Account Changes"
                : "Create Management Account"}
            </button>

          </form>

        </section>

        {/* ================================================= */}
        {/* ACCOUNTS LIST */}
        {/* ================================================= */}

        <section className="management-admin-card">

          <div className="management-admin-heading">

            <div>
              <span>
                MANAGEMENT STAFF
              </span>

              <h2>
                Accounts (
                {accounts.length}
                )
              </h2>
            </div>

            <button
              className="management-secondary-btn"
              onClick={
                loadAccounts
              }
              disabled={loading}
            >
              Refresh
            </button>

          </div>

          {loading ? (
            <div className="management-admin-empty">
              Loading management accounts...
            </div>
          ) : accounts.length === 0 ? (
            <div className="management-admin-empty">
              No management accounts created yet.
            </div>
          ) : (

            <div className="management-table-wrap">

              <table className="management-table">

                <thead>
                  <tr>
                    <th>Staff</th>
                    <th>Login</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {accounts.map(
                    (account) => (

                      <tr
                        key={
                          account.userId
                        }
                      >

                        <td>
                          <strong>
                            {
                              account.fullName
                            }
                          </strong>

                          <small>
                            {
                              account.userId
                            }
                          </small>
                        </td>

                        <td>
                          <strong>
                            {
                              account.email
                            }
                          </strong>

                          <small>
                            {
                              account.phone ||
                              "No phone"
                            }
                          </small>
                        </td>

                        <td>
                          {
                            account.department ||
                            "Event Management"
                          }
                        </td>

                        <td>
                          {
                            account.designation ||
                            "Management Staff"
                          }
                        </td>

                        <td>

                          <button
                            type="button"
                            className={
                              account.isActive !==
                              false
                                ? "management-status-active"
                                : "management-status-inactive"
                            }
                            onClick={() =>
                              toggleActive(
                                account
                              )
                            }
                            title="Click to change status"
                          >
                            {account.isActive !==
                            false
                              ? "ACTIVE"
                              : "INACTIVE"}
                          </button>

                        </td>

                        <td>

                          <div className="management-row-actions">

                            <button
                              type="button"
                              className="management-edit-btn"
                              onClick={() =>
                                startEdit(
                                  account
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="management-delete-btn"
                              onClick={() =>
                                deleteAccount(
                                  account
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

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