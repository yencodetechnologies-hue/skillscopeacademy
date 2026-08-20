import React from "react"
import { useNavigate } from "react-router-dom"
import { ORG_PHONE_1300, ORG_PHONE_MOBILE } from "../../../utils/organizationPhones"
import "../styles/FooterMobile.css"

// Social media links
const socialLinks = [
  { label: "Facebook", icon: "fa-brands fa-facebook-f", url: "https://facebook.com" },
  { label: "LinkedIn", icon: "fa-brands fa-linkedin-in", url: "https://linkedin.com" },
  { label: "Instagram", icon: "fa-brands fa-instagram", url: "https://instagram.com" },
]

// Quick links split into 2 columns
const quickLinksCol1 = [
  { label: "Home", path: "/" },
  { label: "Courses", path: "/all-courses" },
  { label: "Book Now", path: "/book-now" },
]

const quickLinksCol2 = [
  { label: "About Us", path: "/about" },
  { label: "Contact Us", path: "/contact" },
  { label: "Privacy Policy", path: "/privacy-policy" },
]

// Top trust feature badges
const trustBadges = [
  {
    icon: "fa-solid fa-graduation-cap",
    title: "10,000+",
    subtitle: "Workers Trained",
  },
  {
    icon: "fa-solid fa-shield-halved",
    title: "SafeWork NSW",
    subtitle: "Approved",
  },
  {
    icon: "fa-solid fa-location-dot",
    title: "Sefton NSW",
    subtitle: "Based",
  },
]

function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="st-footer">
      {/* ── 1. TOP TRUST BADGES ── */}
      <div className="st-footer-badges">
        {trustBadges.map((badge, idx) => (
          <div key={idx} className="st-badge-item">
            <div className="st-badge-icon">
              <i className={badge.icon} />
            </div>
            <div className="st-badge-text">
              <span className="st-badge-title">{badge.title}</span>
              <span className="st-badge-sub">{badge.subtitle}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 2. MAIN FOOTER CARD ── */}
    <div className="st-footer-card">
      
    <div className="st-section-label">SafeTicks</div>
  <div className="st-footer-section1">
    {/* <div className="st-section-label">Location</div> */}

    <div className="st-office-row">
      <i className="fa-solid fa-location-dot st-info-icon" />

      <div className="st-office-list">

        {/* Sydney */}
        <div className="st-office">
          <strong>Sydney</strong>
          {/* <span>SafeTicks</span> */}
          <div className="st-office-address">
            15/3 Lancaster Street,
            <br />
            Ingleburn,
            <br />NSW 2565
            {/* <br />
            Australia. */}
          </div>
        </div>

        {/* Adelaide */}
        <div className="st-office">
          <strong>Adelaide</strong>
          {/* <span>SafeTicks</span> */}
          <div className="st-office-address">
            8 Cord Street,
            <br />
            Dudley Park,
            <br/>SA 5008
            {/* <br />
            Australia. */}
          </div>
        </div>

      </div>
    </div>
  </div>


        {/* CONTACT */}
        <div className="st-footer-section">
          <div className="st-section-label">CONTACT</div>
          <div className="st-contact-list">
            <a href="mailto:info@safeticks.com" className="st-contact-item">
              <i className="fa-solid fa-envelope st-info-icon" />
              <span>info@safeticks.com</span>
            </a>
            <a href={ORG_PHONE_MOBILE.tel} className="st-contact-item">
              <i className="fa-solid fa-phone st-info-icon" />
              <span>{ORG_PHONE_MOBILE.display}</span>
            </a>
            <a href={ORG_PHONE_1300.tel} className="st-contact-item">
              <i className="fa-solid fa-phone st-info-icon" />
              <span>{ORG_PHONE_1300.display}</span>
            </a>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="st-footer-section">
          <div className="st-section-label">QUICK LINKS</div>
          <div className="st-quick-links-grid">
            <div className="st-links-col">
              {quickLinksCol1.map((link, idx) => (
                <div
                  key={idx}
                  className="st-quick-link"
                  onClick={() => navigate(link.path)}
                >
                  <span className="st-link-arrow">›</span>
                  <span>{link.label}</span>
                </div>
              ))}
            </div>
            <div className="st-links-col">
              {quickLinksCol2.map((link, idx) => (
                <div
                  key={idx}
                  className="st-quick-link"
                  onClick={() => navigate(link.path)}
                >
                  <span className="st-link-arrow">›</span>
                  <span>{link.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr className="st-card-divider" />

        {/* FOLLOW US */}
        <div className="st-footer-section st-follow-section">
          <div className="st-section-label st-center-label">FOLLOW US</div>
          <div className="st-socials-row">
            {socialLinks.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="st-social-btn"
                aria-label={s.label}
              >
                <i className={s.icon} />
              </a>
            ))}
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="st-copyright">
          © 2024 SafeTicks. All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer