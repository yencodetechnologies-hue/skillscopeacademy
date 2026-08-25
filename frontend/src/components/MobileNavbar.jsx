import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/staLogo.jpg";
import "../styles/MobileNavbar.css";

const defaultMenuItems = [
  { label: "Home", path: "/" },
  { label: "Courses", path: "/all-courses" },
  { label: "Resources", path: "/" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "Forms", path: "/forms" },
  { label: "Fees & Refund", path: "/fees-refund" },
  { label: "Unique Student Identifier (USI)", path: "/usi" },
  { label: "Code of Practice", path: "/code-of-practice" },
  { label: "Gallery", path: "/gallery" },
  { label: "Sign In", path: "/login" },
];

export default function MobileNavbar({
  menuItems = defaultMenuItems,
  phoneNumber = "1300 415 252",
  telLink = "tel:1300415252",
}) {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /* 
    Home icon should NOT display on home page.
    It will display on every other page.
  */
  const isHomePage = location.pathname === "/";

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleNavClick = (path) => {
    if (path.startsWith("http")) {
      window.open(path, "_blank");
    } else {
      navigate(path);
    }

    closeMenu();
  };

  return (
    <>
      {/* OUTSIDE CLICK OVERLAY */}
      {isOpen && (
        <div
          className="mnb-overlay"
          onClick={closeMenu}
        />
      )}

      {/* TOP HEADER BAR */}
      <header className="mnb-header-bar">
        <div className="mnb-container">

          {/* LOGO */}
          <div
            className="mnb-logo-wrapper"
            onClick={() => handleNavClick("/")}
          >
            <img
              src={logo}
              alt="SafeTicks Logo"
              className="mnb-logo-img"
            />
          </div>

          {/* RIGHT ACTION BUTTONS */}
          <div className="mnb-action-group">

            {/* HOME ICON */}
            {!isHomePage && (
              <button
                type="button"
                className="mnb-home-btn"
                onClick={() => handleNavClick("/")}
                aria-label="Home"
                title="Home"
              >
                <i className="fa-solid fa-house"></i>
              </button>
            )}

            {/* PHONE BUTTON */}
            <a
              href={telLink}
              className="mnb-phone-circle"
              aria-label="Call Us"
            >
              <i className="fa-solid fa-phone"></i>
            </a>

            {/* HAMBURGER TOGGLE */}
            <button
              type="button"
              className="mnb-toggle-btn"
              onClick={toggleMenu}
              aria-label="Toggle Navigation"
            >
              {isOpen ? "✕" : "☰"}
            </button>

          </div>
        </div>

        {/* SLIDE / DROPDOWN DRAWER */}
        {isOpen && (
          <nav className="mnb-drawer">

            {/* MENU LIST */}
            <div className="mnb-menu-list">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className="mnb-menu-item"
                  onClick={() => handleNavClick(item.path)}
                >
                  {item.label}
                </div>
              ))}
            </div>

            {/* BOTTOM BUTTONS */}
            <div className="mnb-drawer-footer">

              {/* PHONE */}
              <a
                href={telLink}
                className="mnb-footer-btn mnb-phone-btn"
                onClick={closeMenu}
              >
                <i className="fa-solid fa-phone"></i>
                {phoneNumber}
              </a>

              {/* COMBO COURSES */}
              <button
                type="button"
                className="mnb-footer-btn mnb-combo-btn"
                onClick={() => handleNavClick("/combo-courses")}
              >
                Combo Courses
              </button>

              {/* BOOK NOW */}
              <button
                type="button"
                className="mnb-footer-btn mnb-book-btn"
                onClick={() => handleNavClick("/book-now")}
              >
                Book Now
              </button>

              {/* LOGIN */}
              <Link
                to="/login"
                className="mnb-footer-btn mnb-login-btn"
                onClick={closeMenu}
              >
                Login
              </Link>

            </div>
          </nav>
        )}
      </header>
    </>
  );
}