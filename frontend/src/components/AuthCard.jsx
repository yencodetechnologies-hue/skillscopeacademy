import React from "react";
import "../styles/AuthCard.css";

function AuthCard() {
  const features = [
    {
      title: "Industry-recognized certifications",
      desc: "Boost your credibility with trusted credentials",
    },
    {
      title: "Expert instructors with real-world experience",
      desc: "Learn from professionals who've been there",
    },
    {
      title: "Flexible learning schedules",
      desc: "Learn at your pace, anytime, anywhere",
    },
  ];

  return (
    <div className="auth-card">
      {/* Curved Background Lines SVG */}
      <svg className="bg-waves" viewBox="0 0 420 700" fill="none" preserveAspectRatio="none">
        {/* Top Right Curved Waves */}
        <path d="M 220 0 C 260 80, 310 140, 420 180" stroke="#f59e0b" strokeWidth="1.5" opacity="0.3" />
        <path d="M 180 0 C 230 100, 290 170, 420 220" stroke="#f59e0b" strokeWidth="1.5" opacity="0.25" />
        <path d="M 140 0 C 200 120, 270 200, 420 260" stroke="#f59e0b" strokeWidth="1.5" opacity="0.2" />

        {/* Bottom Swoop Wave */}
        <path d="M 0 520 Q 200 440 420 620" stroke="#f97316" strokeWidth="2" opacity="0.3" />
        <path d="M 0 550 Q 220 470 420 650" stroke="#f59e0b" strokeWidth="1.5" opacity="0.2" />
      </svg>

      {/* Dot Grid Elements */}
      <div className="dot-pattern top-dots"></div>
      <div className="dot-pattern bottom-dots"></div>

      {/* Brand Header */}
      <div className="brand">
        <div className="brand-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#0f172a">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
          </svg>
        </div>
        <span className="brand-name">SafeTicks</span>
      </div>

      {/* Main Heading */}
      <h1 className="card-heading">
        Start Your <br />
        Professional <br />
        Journey <span className="highlight-text">Today</span>
      </h1>

      {/* Subtitle */}
      <p className="card-description">
        Join thousands of professionals who have advanced their careers
        through our industry-recognized certification programs.
      </p>

      {/* Features */}
      <ul className="feature-list">
        {features.map((item, index) => (
          <li key={index} className="feature-item">
            <div className="check-box">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="feature-content">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Stacked Books Graphic */}
      <div className="books-wrapper">
        <svg viewBox="0 0 220 180" width="190" height="155">
          {/* Bottom Orange Book */}
          <g>
            {/* Book Base / Spine */}
            <path d="M 10 135 L 175 135 L 185 120 L 20 120 Z" fill="#ea580c" />
            <path d="M 10 135 L 10 152 L 20 162 L 185 162 L 185 135 Z" fill="#c2410c" />
            {/* White Pages Block */}
            <path d="M 22 125 L 180 125 L 178 133 L 20 133 Z" fill="#ffffff" />
            <path d="M 20 133 L 178 133 L 176 137 L 18 137 Z" fill="#fed7aa" />
          </g>

          {/* Middle Dark Navy Book */}
          <g transform="translate(12, -32)">
            <path d="M 10 135 L 165 135 L 175 120 L 20 120 Z" fill="#1e293b" />
            <path d="M 10 135 L 10 152 L 20 162 L 175 162 L 175 135 Z" fill="#0f172a" />
            <path d="M 22 125 L 170 125 L 168 133 L 20 133 Z" fill="#ffffff" />
            <path d="M 20 133 L 168 133 L 166 137 L 18 137 Z" fill="#cbd5e1" />
          </g>

          {/* Graduation Cap */}
          <g transform="translate(18, -60)">
            {/* Base Ring */}
            <path d="M 45 110 C 45 122, 105 122, 105 110 L 105 122 C 105 132, 45 132, 45 122 Z" fill="#0f172a" />
            {/* Diamond Top Cap */}
            <polygon points="75,80 148,100 75,120 2,100" fill="#1e293b" />
            <polygon points="75,80 148,100 75,104 2,100" fill="#334155" />
            {/* Tassel */}
            <circle cx="75" cy="100" r="3" fill="#f59e0b" />
            <path d="M 75 100 Q 105 102 110 132" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="107,132 113,132 111,146 109,146" fill="#f59e0b" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default AuthCard;