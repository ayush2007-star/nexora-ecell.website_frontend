import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ASSETS } from "../constants/assets";

export default function Home() {
  const [openFaq, setOpenFaq] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: "", email: "", subject: "", message: "" });
      setContactSubmitted(false);
    }, 4000);
  };

  const faqs = [
    {
      question: "What is NEXORA E-CELL?",
      answer:
        "NEXORA E-CELL is a premier student-driven entrepreneurship cell dedicated to empowering student innovators, providing mentorship, organizing startup competitions, and facilitating funding and incubation access.",
    },
    {
      question: "Who can register a team for NEXORA initiatives?",
      answer:
        "Any student or student team across colleges/universities with an innovative idea, research project, prototype, or working startup can register. Teams can have 1 Team Leader and up to 2 additional members.",
    },
    {
      question: "How do I check the status of my team's registration?",
      answer:
        "You can easily track your registration in real-time by visiting the Track Status page and entering your unique Team ID (or registered email).",
    },
    {
      question: "Are certificates provided and how can they be verified?",
      answer:
        "Yes! Approved and participating teams receive official digital credentials with a unique Certificate ID (e.g. NXR-XXXXXX) that can be verified publicly by recruiters, judges, and institutions on our Verify Certificate page.",
    },
    {
      question: "What support does NEXORA offer after registration?",
      answer:
        "Selected teams gain access to 1-on-1 industry mentorship, pitch deck workshops, technical guidance, networking with alumni founders, and direct entry into our flagship pitch competitions.",
    },
  ];

  const events = [
    {
      badge: "FLAGSHIP HACKATHON",
      title: "Nexora Ideathon 2026",
      date: "September 15-17, 2026",
      desc: "48-hour intensive problem solving and product building challenge. Build prototypes and pitch to angel investors.",
      tag: "Registrations Open",
      statusBadge: "LIVE",
    },
    {
      badge: "WORKSHOP SERIES",
      title: "Founders Bootcamp & Pitch Lab",
      date: "October 05, 2026",
      desc: "Learn from venture capitalists and unicorn founders how to craft high-conversion pitch decks and financial models.",
      tag: "Limited Seats",
      statusBadge: "UPCOMING",
    },
    {
      badge: "ANNUAL SUMMIT",
      title: "Nexora E-Summit & Pitch Battle",
      date: "November 20-22, 2026",
      desc: "Annual flagship summit bringing together 50+ speakers, 100+ student startups, and ₹5,00,000+ in seed prize pool.",
      tag: "Grand Finale",
      statusBadge: "UPCOMING",
    },
  ];

  const highlights = [
    {
      icon: "⚡",
      title: "Expert Mentorship",
      desc: "Direct access to startup founders, industry veterans, and faculty advisors to refine your business model.",
      glowColor: "indigo",
    },
    {
      icon: "🎯",
      title: "Incubation Access",
      desc: "Step-by-step guidance from early proof-of-concept to MVP launch and company incorporation.",
      glowColor: "cyan",
    },
    {
      icon: "🌐",
      title: "Founder Network",
      desc: "Join a high-energy community of like-minded innovators, designers, engineers, and creators.",
      glowColor: "purple",
    },
    {
      icon: "🏆",
      title: "Verified Credentials",
      desc: "Receive tamper-proof digital certificates recognized by startup accelerators and institutions.",
      glowColor: "amber",
    },
  ];

  return (
    <div className="website luxury-theme">
      <Navbar />

      {/* AMBIENT BACKGROUND GLOW LIGHTS */}
      <div className="ambient-canvas" aria-hidden="true">
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />
      </div>

      <main>
        {/* =========================
            HERO SECTION
        ========================== */}
        <section className="hero-section" id="home">
          <div className="container hero-grid">
            <div className="hero-content">
              <div className="hero-kicker-badge">
                <span className="kicker-pulse-dot" />
                <span>NEXORA ENTREPRENEURSHIP CELL</span>
                <span className="kicker-highlight">2026 COHORT</span>
              </div>

              <h1 className="hero-heading">
                Ideas that
                <span className="gradient-text-animated"> inspire.</span>
                <br />
                Ventures that
                <span className="gradient-text-gold"> matter.</span>
              </h1>

              <p className="hero-description">
                Empowering the next generation of ambitious student founders to
                ideate, build prototypes, secure seed funding, and scale real-world
                enterprises.
              </p>

              <div className="hero-actions">
                <Link
                  to="/register"
                  className="button button-primary button-shine button-glow"
                >
                  <span>Start Your Journey</span>
                  <span className="arrow-icon">→</span>
                </Link>

                <Link
                  to="/track"
                  className="button button-ghost button-glass"
                >
                  <span>Track Application</span>
                </Link>

                <Link
                  to="/verify"
                  className="button button-ghost button-glass"
                >
                  <span>Verify Credential</span>
                </Link>
              </div>

              <div className="hero-stats-luxury">
                <div className="stat-box">
                  <div className="stat-number-wrapper">
                    <strong className="stat-number">500</strong>
                    <span className="stat-plus">+</span>
                  </div>
                  <span className="stat-label">Student Innovators</span>
                </div>

                <div className="stat-divider" />

                <div className="stat-box">
                  <div className="stat-number-wrapper">
                    <strong className="stat-number">50</strong>
                    <span className="stat-plus">+</span>
                  </div>
                  <span className="stat-label">Ventures Mentored</span>
                </div>

                <div className="stat-divider" />

                <div className="stat-box">
                  <div className="stat-number-wrapper">
                    <strong className="stat-number">₹10L</strong>
                    <span className="stat-plus">+</span>
                  </div>
                  <span className="stat-label">Grant & Prize Pool</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              {/* COSMIC ORBIT GLOW RINGS */}
              <div className="orbit-ring orbit-ring-outer" />
              <div className="orbit-ring orbit-ring-inner" />

              <div className="hero-card-luxury">
                <div className="hero-card-glow-aurora" />

                <img
                  src={ASSETS.logoPrimary}
                  alt="NEXORA E-CELL"
                  className="hero-logo-img"
                />

                <div className="hero-card-brand-overlay">
                  <div className="brand-badge-mini">
                    <strong>NEXORA</strong>
                    <span>FOUNDER HUB</span>
                  </div>
                </div>

                <div className="hero-card-label">
                  <span>⚡ BUILD</span>
                  <span>◈ CREATE</span>
                  <span>★ LEAD</span>
                </div>
              </div>

              {/* FLOATING SATELLITE CARDS */}
              <div className="floating-card floating-card-top float-anim-1">
                <span className="floating-icon">💡</span>
                <div>
                  <strong>Think Bigger</strong>
                  <small>Turn ideas into startups</small>
                </div>
              </div>

              <div className="floating-card floating-card-bottom float-anim-2">
                <span className="floating-icon">🚀</span>
                <div>
                  <strong>Make Real Impact</strong>
                  <small>Scale with mentors & VC grants</small>
                </div>
              </div>

              <div className="floating-badge-chip float-anim-3">
                <span className="chip-dot" />
                <span>Registrations Active</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            INFINITE MARQUEE STRIP
        ========================== */}
        <section className="marquee-ribbon">
          <div className="marquee-label">
            <span>PART OF THE NEXORA ECOSYSTEM</span>
          </div>

          <div className="marquee-track">
            <div className="marquee-content">
              <img src={ASSETS.logoPrimary} alt="Ecosystem 1" />
              <img src={ASSETS.logoSecondary} alt="Ecosystem 2" />
              <img src={ASSETS.logoThird} alt="Ecosystem 3" />
              <img src={ASSETS.logoFourth} alt="Ecosystem 4" />
              <img src={ASSETS.logoPrimary} alt="Ecosystem 1" />
              <img src={ASSETS.logoSecondary} alt="Ecosystem 2" />
              <img src={ASSETS.logoThird} alt="Ecosystem 3" />
              <img src={ASSETS.logoFourth} alt="Ecosystem 4" />
            </div>
            <div className="marquee-content" aria-hidden="true">
              <img src={ASSETS.logoPrimary} alt="Ecosystem 1" />
              <img src={ASSETS.logoSecondary} alt="Ecosystem 2" />
              <img src={ASSETS.logoThird} alt="Ecosystem 3" />
              <img src={ASSETS.logoFourth} alt="Ecosystem 4" />
              <img src={ASSETS.logoPrimary} alt="Ecosystem 1" />
              <img src={ASSETS.logoSecondary} alt="Ecosystem 2" />
              <img src={ASSETS.logoThird} alt="Ecosystem 3" />
              <img src={ASSETS.logoFourth} alt="Ecosystem 4" />
            </div>
          </div>
        </section>

        {/* =========================
            ABOUT SECTION
        ========================== */}
        <section
          className="section about-section"
          id="about"
        >
          <div className="container">
            <div className="section-heading">
              <div className="section-kicker">
                WHO WE ARE
              </div>

              <h2>
                Where student ideas
                <span className="gradient-text-animated"> become possibilities.</span>
              </h2>

              <p>
                NEXORA E-CELL creates an environment where students can explore
                disruptive technologies, collaborate with passionate peers, and
                take calculated steps toward enterprise building.
              </p>
            </div>

            <div className="about-grid">
              <div className="about-image-card luxury-glass-card">
                <div className="about-glow" />
                <img
                  src={ASSETS.logoThird}
                  alt="NEXORA E-CELL"
                  className="about-img"
                />

                <div className="about-image-overlay">
                  <strong>Innovation starts with you.</strong>
                  <small>Join 500+ ambitious creators</small>
                </div>
              </div>

              <div className="about-content">
                <div className="about-number">
                  01 / OUR FOUNDATION
                </div>

                <h3>
                  Learn. Build. Collaborate.
                </h3>

                <p>
                  From discovering entrepreneurial thinking to presenting your
                  first venture pitch, NEXORA is built around hands-on experiences
                  that move students from ideation to real market validation.
                </p>

                <div className="about-points">
                  <div className="about-point">
                    <span className="point-icon">✓</span>
                    <div>
                      <strong>Student-First Focus</strong>
                      <p>Programs and grants tailored specifically for university innovators.</p>
                    </div>
                  </div>

                  <div className="about-point">
                    <span className="point-icon">✓</span>
                    <div>
                      <strong>Real-World Experience</strong>
                      <p>Pitch labs, hackathons, and real venture capital interaction.</p>
                    </div>
                  </div>

                  <div className="about-point">
                    <span className="point-icon">✓</span>
                    <div>
                      <strong>Build Together</strong>
                      <p>Co-founder matchmaking and peer collaboration across departments.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            WHY NEXORA HIGHLIGHTS
        ========================== */}
        <section className="section highlights-section">
          <div className="container">
            <div className="section-heading centered">
              <div className="section-kicker">
                WHY JOIN NEXORA
              </div>

              <h2>
                Everything you need to
                <span className="gradient-text-animated"> accelerate your venture.</span>
              </h2>

              <p>
                We bridge the gap between classroom knowledge and real-world
                entrepreneurship with end-to-end founder support.
              </p>
            </div>

            <div className="highlights-grid">
              {highlights.map((item, idx) => (
                <div
                  className={`highlight-card luxury-card highlight-glow-${item.glowColor}`}
                  key={idx}
                >
                  <div className="highlight-icon-box">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================
            PROGRAMS SECTION
        ========================== */}
        <section
          className="section programs-section"
          id="programs"
        >
          <div className="container">
            <div className="section-heading centered">
              <div className="section-kicker">
                OUR PATHWAY
              </div>

              <h2>
                From first idea to
                <span className="gradient-text-gold"> first milestone.</span>
              </h2>

              <p>
                Explore structured programs built to help ambitious students
                learn, experiment, build prototypes, and scale.
              </p>
            </div>

            <div className="program-grid">
              <article className="program-card luxury-card">
                <div className="program-number">
                  PHASE 01
                </div>

                <div className="program-icon-box">
                  ◎
                </div>

                <h3>Ideation & Research</h3>

                <p>
                  Discover market problems worth solving, validate user demand,
                  and formulate high-impact solutions through structured brainstorms.
                </p>

                <Link to="/register" className="program-action-link">
                  <span>Register for Cohort</span>
                  <span className="link-arrow">→</span>
                </Link>
              </article>

              <article className="program-card featured luxury-card">
                <div className="program-badge-featured">MOST POPULAR</div>
                <div className="program-number">
                  PHASE 02
                </div>

                <div className="program-icon-box featured-icon">
                  ◇
                </div>

                <h3>Incubation & Prototyping</h3>

                <p>
                  Transform concepts into functional MVPs with dedicated faculty
                  mentors, cloud credits, hardware labs, and weekly sprint reviews.
                </p>

                <Link to="/register" className="program-action-link">
                  <span>Apply with Project</span>
                  <span className="link-arrow">→</span>
                </Link>
              </article>

              <article className="program-card luxury-card">
                <div className="program-number">
                  PHASE 03
                </div>

                <div className="program-icon-box">
                  ↗
                </div>

                <h3>Scaling & Funding</h3>

                <p>
                  Pitch before angel investors, venture capitalists, and industry
                  leaders to unlock seed capital and verified credential certificates.
                </p>

                <Link to="/register" className="program-action-link">
                  <span>Pitch Your Venture</span>
                  <span className="link-arrow">→</span>
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* =========================
            EVENTS SECTION
        ========================== */}
        <section
          className="section events-section"
          id="events"
        >
          <div className="container">
            <div className="section-heading centered">
              <div className="section-kicker">
                UPCOMING COMPETITIONS
              </div>

              <h2>
                Compete, learn, and
                <span className="gradient-text-animated"> build the future.</span>
              </h2>

              <p>
                Mark your calendars for our flagship hackathons, masterclasses,
                and venture pitch competitions.
              </p>
            </div>

            <div className="events-grid">
              {events.map((event, idx) => (
                <div className="event-card luxury-card" key={idx}>
                  <div className="event-card-header">
                    <span className="event-badge">{event.badge}</span>
                    <span className="event-tag">{event.tag}</span>
                  </div>

                  <h3>{event.title}</h3>

                  <div className="event-date">
                    <span className="date-icon">📅</span>
                    <span>{event.date}</span>
                  </div>

                  <p>{event.desc}</p>

                  <Link to="/register" className="event-link">
                    <span>Register Team Now</span>
                    <span className="link-arrow">→</span>
                  </Link>
                </div>
              ))}
            </div>

            {/* EVENT BANNER WITH NEON GLOW */}
            <div className="event-banner luxury-banner">
              <div className="banner-glow-effect" />
              <div>
                <div className="section-kicker kicker-light">
                  BE THE NEXT SUCCESS STORY
                </div>

                <h2>
                  Your next big breakthrough
                  <span> could begin today.</span>
                </h2>

                <p>
                  Join NEXORA E-CELL to participate in state-level hackathons,
                  masterclasses, and investor matchmaking.
                </p>
              </div>

              <Link
                to="/register"
                className="button button-light button-glow-white"
              >
                <span>Join NEXORA Cohort</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* =========================
            ACTION HUB: TRACK & VERIFY
        ========================== */}
        <section className="section action-hub-section">
          <div className="container">
            <div className="action-hub-grid">
              <div className="action-hub-card luxury-card">
                <div className="hub-glow-bg" />
                <div className="action-hub-icon">🔍</div>
                <div className="action-hub-badge">REAL-TIME APPLICATION STATUS</div>
                <h3>Track Your Registration</h3>
                <p>
                  Already submitted your team details? Check your review status,
                  faculty feedback, and certificate issuance in real-time.
                </p>
                <Link to="/track" className="button button-primary button-glow">
                  <span>Track Application Status</span>
                  <span>→</span>
                </Link>
              </div>

              <div className="action-hub-card verify-card luxury-card">
                <div className="hub-glow-bg verify-glow" />
                <div className="action-hub-icon">🛡️</div>
                <div className="action-hub-badge">CREDENTIAL VERIFICATION</div>
                <h3>Verify Official Certificate</h3>
                <p>
                  Verify genuine participation and winning certificates issued by
                  NEXORA E-CELL using tamper-proof unique cryptographic IDs.
                </p>
                <Link to="/verify" className="button button-ghost button-glass">
                  <span>Verify Credential ID</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            FAQ SECTION
        ========================== */}
        <section className="section faq-section" id="faq">
          <div className="container">
            <div className="section-heading centered">
              <div className="section-kicker">GOT QUESTIONS?</div>
              <h2>
                Frequently Asked <span>Questions</span>
              </h2>
              <p>Everything you need to know about registering, teams, and awards.</p>
            </div>

            <div className="faq-accordion">
              {faqs.map((faq, index) => (
                <div
                  className={`faq-item luxury-card ${
                    openFaq === index ? "faq-item-open" : ""
                  }`}
                  key={index}
                >
                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => toggleFaq(index)}
                  >
                    <span>{faq.question}</span>
                    <span className="faq-icon-circle">
                      {openFaq === index ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === index && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================
            REGISTER CTA SECTION
        ========================== */}
        <section
          className="section register-section"
          id="register"
        >
          <div className="container">
            <div className="register-card luxury-card">
              <div className="register-logo-wrapper">
                <img
                  src={ASSETS.logoFourth}
                  alt="NEXORA E-CELL"
                  className="register-logo-img"
                />
              </div>

              <div className="register-content">
                <div className="section-kicker">
                  READY TO BEGIN?
                </div>

                <h2>
                  Bring your idea.
                  <span className="gradient-text-animated">
                    {" "}
                    We'll help you take it further.
                  </span>
                </h2>

                <p>
                  Register your team, submit your project domain, and become part of
                  the NEXORA E-CELL founder network today.
                </p>

                <Link
                  to="/register"
                  className="button button-primary button-glow home-register-button"
                >
                  <span>Register Your Team Now</span>
                  <span className="arrow-icon">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            CONTACT SECTION
        ========================== */}
        <section className="section contact-section" id="contact">
          <div className="container">
            <div className="contact-grid">
              <div className="contact-info">
                <div className="section-kicker">GET IN TOUCH</div>
                <h2>
                  Have questions?
                  <span className="gradient-text-animated"> We're here to help.</span>
                </h2>
                <p>
                  Whether you're seeking mentorship, sponsorship opportunities,
                  or assistance with registration, reach out anytime.
                </p>

                <div className="contact-details">
                  <div className="contact-item">
                    <span className="contact-icon">✉️</span>
                    <div>
                      <strong>Official Email</strong>
                      <p>contact@nexora-ecell.in</p>
                    </div>
                  </div>

                  <div className="contact-item">
                    <span className="contact-icon">📍</span>
                    <div>
                      <strong>Center for Innovation</strong>
                      <p>Entrepreneurship & Incubation Cell, Main Campus</p>
                    </div>
                  </div>

                  <div className="contact-item">
                    <span className="contact-icon">⚡</span>
                    <div>
                      <strong>Community Network</strong>
                      <p>@nexora_ecell on Instagram, LinkedIn & Twitter</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="contact-card luxury-card">
                <h3>Send Us a Message</h3>
                {contactSubmitted ? (
                  <div className="contact-success">
                    <span className="success-check-badge">✓</span>
                    <h4>Message Received!</h4>
                    <p>Thank you for reaching out. A team member will respond shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="contact-form">
                    <div className="field">
                      <label>Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="field">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, email: e.target.value })
                        }
                      />
                    </div>

                    <div className="field">
                      <label>Subject *</label>
                      <input
                        type="text"
                        required
                        placeholder="Inquiry about Ideathon / Incubation"
                        value={contactForm.subject}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, subject: e.target.value })
                        }
                      />
                    </div>

                    <div className="field">
                      <label>Message *</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Tell us how we can assist you..."
                        value={contactForm.message}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, message: e.target.value })
                        }
                      />
                    </div>

                    <button
                      type="submit"
                      className="button button-primary button-glow contact-submit"
                    >
                      <span>Send Message</span>
                      <span>→</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FLOATING BACK TO TOP BUTTON */}
      {showBackToTop && (
        <button
          type="button"
          className="back-to-top-btn"
          onClick={scrollToTop}
          aria-label="Back to Top"
        >
          ↑
        </button>
      )}

      <Footer />
    </div>
  );
}