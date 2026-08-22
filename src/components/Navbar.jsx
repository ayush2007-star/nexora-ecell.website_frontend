import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ASSETS } from "../constants/assets";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-close mobile menu on route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  // Check if any user (admin/mentor) is logged in for quick portal link
  const storedUser = JSON.parse(localStorage.getItem("nexora_user") || "null");
  const isMentor = String(storedUser?.role).toLowerCase() === "mentor";
  const isAdmin = String(storedUser?.role).toLowerCase() === "admin";

  return (
    <header className={`site-header ${scrolled ? "site-header-scrolled" : ""}`}>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        {/* BRAND */}
        <Link
          to="/"
          className="brand"
          onClick={closeMenu}
        >
          <div className="brand-logo">
            <img
              src={ASSETS.logoPrimary}
              alt="NEXORA E-CELL"
            />
          </div>

          <div className="brand-text">
            <strong>NEXORA</strong>
            <span>E-CELL</span>
          </div>

          <div className="live-status-pill">
            <span className="live-pulse-dot" />
            <span className="live-text">PORTAL ACTIVE</span>
          </div>
        </Link>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className={`mobile-menu-button ${menuOpen ? "open" : ""}`}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        {/* NAVIGATION */}
        <div
          className={`nav-links ${
            menuOpen ? "nav-links-open" : ""
          }`}
        >
          <Link
            to="/"
            className={isActive("/") ? "nav-link-active" : ""}
            onClick={closeMenu}
          >
            Home
          </Link>

          <a href="/#about" onClick={closeMenu}>
            About
          </a>

          <a href="/#programs" onClick={closeMenu}>
            Programs
          </a>

          <a href="/#events" onClick={closeMenu}>
            Events
          </a>

          <Link
            to="/track"
            className={isActive("/track") ? "nav-link-active" : ""}
            onClick={closeMenu}
          >
            Track Status
          </Link>

          <Link
            to="/verify"
            className={isActive("/verify") ? "nav-link-active" : ""}
            onClick={closeMenu}
          >
            Verify Credential
          </Link>

          <a href="/#contact" onClick={closeMenu}>
            Contact
          </a>

          {/* REGISTER */}
          <Link
            to="/register"
            className="nav-register"
            onClick={closeMenu}
          >
            <span>Register Now</span>
            <span className="btn-shine" />
          </Link>

          {/* PORTAL LINK: IF LOGGED IN SHOW RELEVANT PORTAL OR DEFAULT ADMIN */}
          {isMentor ? (
            <Link
              to="/mentor"
              className="nav-admin-login"
              onClick={closeMenu}
            >
              Mentor Portal
            </Link>
          ) : isAdmin ? (
            <Link
              to="/admin"
              className="nav-admin-login"
              onClick={closeMenu}
            >
              Admin Portal
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="nav-admin-login"
              onClick={closeMenu}
            >
              Admin Portal
            </Link>
          )}
        </div>
      </nav>

      {/* MOBILE BACKDROP */}
      {menuOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </header>
  );
}