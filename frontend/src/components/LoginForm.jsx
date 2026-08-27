import React, { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/LoginForm.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { API_URL } from "../data/service";

function LoginForm() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPw, setShowPw] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email required"),
      password: Yup.string().required("Password required"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await axios.post(`${API_URL}/api/auth/login`, values);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        login(res.data.user);

        const role = (res.data.user.role || "").toLowerCase();
        const from = location.state?.from;

        if (from) {
          navigate(from, { replace: true });
        } else {
          const dashboardRoutes = {
            admin: "/admin",
            student: "/student",
            teacher: "/teacher",
            company: "/company",
          };
          navigate(dashboardRoutes[role] || "/");
        }
      } catch (err) {
        alert(err.response?.data?.message || "Login failed");
      }
    },
  });

    return (
    <div className="login-container">
      <div className="login-box">
        {/* Header */}
        <div className="login-header">
          <h2 className="welcome-title">
            Welcome <span className="highlight-text">Back</span>
          </h2>
          <p className="subtitle">Sign in to continue your learning journey</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="login-form">
          {/* Email Field */}
          <div className="field-group">
            <label className="field-label">EMAIL</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="field-error">{formik.errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="field-group">
            <label className="field-label">PASSWORD</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type={showPw ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="field-error">{formik.errors.password}</p>
            )}
          </div>

          {/* Options Row */}
          <div className="options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="forgot-link">Forgot password?</a>
          </div>

          {/* Submit Button */}
          <button className="signin-btn" type="submit">
            Sign In
          </button>
        </form>

        {/* Trust Stats Strip */}
        <div className="trust-strip">
          <div className="trust-item">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="M9 12l2 2 4-4"></path>
            </svg>
            <span>Secure data</span>
          </div>
          <div className="trust-item">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8l9 6 9-6"></path>
              <rect x="3" y="4" width="18" height="16" rx="2"></rect>
            </svg>
            <span>24/7 support</span>
          </div>
          <div className="trust-item">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="6"></circle>
              <path d="M9 14l-2 8 5-3 5 3-2-8"></path>
            </svg>
            <span>Certified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
