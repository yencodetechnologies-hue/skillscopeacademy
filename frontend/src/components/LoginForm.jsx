import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
        const res = await axios.post(
          `${API_URL}/api/auth/login`,
          values
        );
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        login(res.data.user);

        const role = res.data.user.role;
        const from = location.state?.from;

        if (from) {
          navigate(from, { replace: true });
        } else {
          const dashboardRoutes = {
            Admin: "/admin",
            Student: "/student",
            Teacher: "/teacher",
            Company: "/company"
          };
          navigate(dashboardRoutes[role] || "/");
        }
      } catch (err) {
        alert(err.response?.data?.message || "Login failed");
      }
    },
  });

  return (
    <div className="login-box">
      <h3 className="welcome">Welcome Back</h3>
      <p className="subtitle subtitle-register">Sign in to your account or create a new one</p>

      {/* Tabs */}
      <div className="tabs">
        <Link className="tab active" to="/login">Sign In</Link>
        {/* <Link className="tab" to="/register">Register</Link> */}
      </div>

      <form onSubmit={formik.handleSubmit}>
        {/* Email */}
        <label className="field-label">Email</label>
        <div className="input-wrapper input-wrapper-text">
          <span className="input-icon"></span>
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

        {/* Password */}
        <label className="field-label">Password</label>
        <div className="input-wrapper input-wrapper-text">
          <span className="input-icon"></span>
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
            {showPw ?<i className="fa-regular fa-eye"></i>  : <i className="fa-regular fa-eye-slash"></i>}
          </button>
        </div>
        {formik.touched.password && formik.errors.password && (
          <p className="field-error">{formik.errors.password}</p>
        )}

        {/* Options */}
        <div className="options">
          <label>
            <input type="checkbox" />
            Remember me
          </label>
          <a href="#">Forgot password?</a>
        </div>

        <button className="signin-btn" type="submit">
          Sign In
        </button>
      </form>
    </div>
  );
}

export default LoginForm;