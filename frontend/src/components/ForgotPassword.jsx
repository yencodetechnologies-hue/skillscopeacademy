import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";
import { API_URL } from "../data/service";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus({ type: "error", message: "Please enter your email." });
      return;
    }

    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email: email.trim(),
      });

      const data = res.data;

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
    navigate("/login");
  };

  return (
    <div className="fp-body">
      <div className="fp-scene">
        <div className="fp-bg-blob one" />
        <div className="fp-bg-blob two" />

        {/* ---------- LEFT PANEL ---------- */}
        <div className="fp-left-panel">
          <div className="fp-left-content">
            {/* Relevant Key & Security Illustration */}
            <div className="fp-illustration">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-3 3a6 6 0 1 1-2.12-2.12l8.62-8.62z" />
                <circle cx="7.5" cy="16.5" r="1.5" fill="currentColor" />
              </svg>
            </div>

            <h2 className="fp-brand-heading">Account Recovery</h2>
            <p className="fp-brand-desc">
              Don't worry, it happens to the best of us. Let's get you back into
              your account securely.
            </p>

            <div className="fp-tip-box">
              <span className="fp-tip-icon">💡</span>
              <p>We'll send a secure password reset link directly to your inbox.</p>
            </div>
          </div>
        </div>

        {/* ---------- CARD ---------- */}
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
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