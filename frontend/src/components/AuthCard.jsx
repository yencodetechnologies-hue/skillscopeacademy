import React from "react";
import "../styles/AuthCard.css";

function AuthCard() {
  return (
    <div className="auth-card">

      <div className="brand">
        <div className="brand-icon"><i className="fa-solid fa-graduation-cap"></i></div>
        <span className="brand-name">Safety Training Academy</span>
      </div>

      <h1>
        Start Your Professional
        <br />
        Journey Today
      </h1>

      <p>
        Join thousands of professionals who have advanced their careers
        through our industry-recognized certification programs.
      </p>

      <ul>
        <li>
          <div className="check-box">✓</div>
          <span>Industry-recognized certifications</span>
        </li>
        <li>
          <div className="check-box">✓</div>
          <span>Expert instructors with real-world experience</span>
        </li>
        <li>
          <div className="check-box">✓</div>
          <span>Flexible learning schedules</span>
        </li>
      </ul>

    </div>
  );
}

export default AuthCard;