import React from "react";
import { Link } from "react-router-dom";
import { ASSETS } from "../constants/assets";

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo-row">
            <img
              src={ASSETS.logoSecondary}
              alt="NEXORA E-CELL"
            />

            <div>
              <h3>NEXORA E-CELL</h3>
              <p>Innovation • Entrepreneurship • Impact</p>
            </div>
          </div>

          <p className="footer-description">
            A premier student-driven entrepreneurial ecosystem designed to
            nurture innovation, foster problem-solvers, and empower the next
            generation of startup founders.
          </p>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>

          <Link to="/">Home</Link>
          <a href="/#about">About Nexora</a>
          <a href="/#programs">Our Programs</a>
          <a href="/#events">Upcoming Events</a>
        </div>

        <div className="footer-column">
          <h4>Participants</h4>

          <Link to="/register">Register Your Team</Link>
          <Link to="/track">Track Application</Link>
          <Link to="/verify">Verify Certificate</Link>
          <Link to="/admin/login">Admin Portal</Link>
        </div>

        <div className="footer-column">
          <h4>Get In Touch</h4>

          <a href="mailto:contact@nexora-ecell.in">contact@nexora-ecell.in</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter / X ↗</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} NEXORA E-CELL. All rights reserved.
        </span>

        <span>
          Fueling ideas, empowering entrepreneurs.
        </span>
      </div>
    </footer>
  );
}