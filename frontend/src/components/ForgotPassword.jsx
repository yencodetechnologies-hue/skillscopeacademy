import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // remove if not using react-router
import "../styles/ForgotPassword.css";
import { API_URL } from "../data/service";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const navigate = useNavigate(); // remove if not using react-router

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus({ type: "error", message: "Please enter your email." });
      return;
    }

    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      // Calls: POST /api/auth/forgot-password
      // Matches backend route: router.post("/forgot-password", forgotPassword)
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email: email.trim(),
      });

      const data = res.data; // { success, message }

      if (data.success) {
        setStatus({
          type: "success",
          message: data.message || "Check your email for the new password.",
        });
        setEmail("");
      } else {
        setStatus({
          type: "error",
          message: data.message || "Something went wrong.",
        });
      }
    } catch (err) {
      // Handles the 400 / 404 / 500 responses sent by your forgotPassword controller
      const backendMessage = err.response?.data?.message;
      if (backendMessage) {
        setStatus({ type: "error", message: backendMessage });
      } else if (err.request) {
        setStatus({
          type: "error",
          message: "No response from server. Please check your connection.",
        });
      } else {
        setStatus({ type: "error", message: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login"); // or use <Link>/window.location as preferred
  };

  return (
    <div className="fp-body">
      <div className="fp-scene">
        <div className="fp-bg-blob one" />
        <div className="fp-bg-blob two" />

        <div className="fp-left-panel">
          <div className="fp-side-label">DAILY UI DESIGN CHALLENGE</div>
          <div className="fp-left-content">
            <div className="fp-day">DAY #9</div>
            <div className="fp-line">
              FORGOT
              <br />
              PASSWORD
              <br />
              POPUP UI
            </div>
            <div className="fp-figma-badge">
              <svg viewBox="0 0 38 57" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M19 28.5a9.5 9.5 0 119.5-9.5 9.5 9.5 0 01-9.5 9.5z"
                  fill="#1abcfe"
                />
                <path
                  d="M0 47.5A9.5 9.5 0 019.5 38H19v9.5a9.5 9.5 0 11-19 0z"
                  fill="#0acf83"
                />
                <path d="M19 0v19h9.5a9.5 9.5 0 100-19H19z" fill="#ff7262" />
                <path
                  d="M0 9.5A9.5 9.5 0 009.5 19H19V0H9.5A9.5 9.5 0 000 9.5z"
                  fill="#f24e1e"
                />
                <path
                  d="M0 28.5A9.5 9.5 0 009.5 38H19V19H9.5A9.5 9.5 0 000 28.5z"
                  fill="#a259ff"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="fp-card">
          <div className="fp-icon-circle">
            <svg viewBox="0 0 24 24">
              <path d="M12 1a5 5 0 00-5 5v3H5a1 1 0 00-1 1v11a1 1 0 001 1h14a1 1 0 001-1V10a1 1 0 00-1-1h-2V6a5 5 0 00-5-5zm0 2a3 3 0 013 3v3H9V6a3 3 0 013-3zm0 10a2 2 0 110 4 2 2 0 010-4z" />
            </svg>
          </div>

          <h1>Forgot your password?</h1>
          <p className="fp-subtitle">Enter your email to reset it!</p>

          {status.message && (
            <div className={`fp-status-msg ${status.type}`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="fp-field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                
              />
            </div>

            <button type="submit" className="fp-confirm-btn" disabled={loading}>
              {loading ? "Sending..." : "Confirm"}
            </button>
          </form>

          <button type="button" className="fp-back-link" onClick={handleBackToLogin}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Return back to login page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
