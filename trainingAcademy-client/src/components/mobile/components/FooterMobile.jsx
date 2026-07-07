import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/FooterMobile.css";
import logo from "../../../assets/Logo STA.jpeg"
import { ORG_PHONE_1300, ORG_PHONE_MOBILE } from "../../../utils/organizationPhones"

// Each label maps to an existing route in App.jsx so taps from mobile
// always land on a real page. "Blog" was removed because no route exists.
const navItems = [
  { label: "Home",     path: "/" },
  { label: "Book Now", path: "/book-now" },
  { label: "Courses",  path: "/all-courses" },
  { label: "About Us", path: "/about" },
  { label: "Contact",  path: "/contact" },
];

function FooterMobile() {
  const navigate = useNavigate();
  return (
    <footer className="footer">
      <div className="footer-top-bar"></div>

      {/* <div className="footer-brand">
        <div className="footer-brand-left">
          <div className="footer-logo">SAFETY TRAINING ACADEMY</div>
        </div>
      </div> */}

      <p className="footer-tagline">
        Professional certification programs engineered for career advancement.
      </p>

      <div className="footer-socials">
        <div className="footer-logo-img">
          <img src={logo} alt="Logo" />
        </div>
        <div className="footer-social-icons">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            className="social-btn"
            aria-label="Facebook"
          >
            <i className="fa-brands fa-facebook-f"></i>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="social-btn"
            aria-label="LinkedIn"
          >
            <i className="fa-brands fa-linkedin-in"></i>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="social-btn"
            aria-label="Instagram"
          >
            <i className="fa-brands fa-instagram"></i>
          </a>
        </div>
      </div>
<div className="footer-logo">SAFETY TRAINING ACADEMY</div>
      <div className="footer-divider"></div>

      <div className="footer-middle">
        <div className="footer-col footer-location">
          <div className="sec-label">Head Office</div>
          <div className="row-info">
            <i className="fa-solid fa-location-dot info-icon"></i>
            <p>
              Safety Training Academy Sydney<br />
              3/14-16 Marjorie Street,<br />
              Sefton NSW 2162
            </p>
          </div>
        </div>

        <div className="footer-col footer-contact">
          <div className="sec-label">Contact</div>
          <a href="mailto:info@safetytrainingacademy.edu.au" className="row-info" style={{ color: "inherit", textDecoration: "none" }}>
            <i className="fa-solid fa-envelope info-icon"></i>
            <p>info@safetytrainingacademy.edu.au</p>
          </a>
          <a href={ORG_PHONE_MOBILE.tel} className="row-info" style={{ color: "inherit", textDecoration: "none" }}>
            <i className="fa-solid fa-phone info-icon"></i>
            <p>{ORG_PHONE_MOBILE.display}</p>
          </a>
          <a href={ORG_PHONE_1300.tel} className="row-info" style={{ color: "inherit", textDecoration: "none" }}>
            <i className="fa-solid fa-phone info-icon"></i>
            <p>{ORG_PHONE_1300.display}</p>
          </a>
        </div>
      </div>

      <div className="footer-divider"></div>

      <div className="footer-nav">
        <div className="sec-label">Navigation</div>
        <ul className="footer-links">
          {navItems.map((item) => (
            <li
              key={item.path}
              onClick={() => navigate(item.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(item.path);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="footer-bottom">
        <span>© 2024 Safety Training Academy</span>
        <span className="footer-rights">ALL RIGHTS RESERVED</span>
      </div>
    </footer>
  );
}

export default FooterMobile;