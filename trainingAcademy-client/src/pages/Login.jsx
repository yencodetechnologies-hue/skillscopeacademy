import React, { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Layout.css";
import "../styles/Login.css";
import AuthCard from "../components/AuthCard";
import LoginForm from "../components/LoginForm";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useContext(AuthContext); // ✅ added setUser

  // ✅ Restore user from localStorage (AUTO LOGIN FIX 🔥)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!user && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser); // 🔥 update context
      } catch (err) {
        console.error("Invalid user in localStorage");
      }
    }
  }, [user, setUser]);

  // ✅ Already logged in → redirect to intended page or dashboard
  useEffect(() => {
    if (user) {
      const from = location.state?.from;
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (user.role === "Admin") navigate("/admin");
        else if (user.role === "Student") navigate("/student");
        else if (user.role === "Teacher") navigate("/teacher");
        else if (user.role === "Company") navigate("/company");
      }
    }
  }, [user, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="register-container"
    >
      <div className="register-container">
        <p
          className="back-btn back-btn-login"
          onClick={() => { navigate("/"); }}
        >
          ← Back to Home
        </p>

        <div className="auth-wrapper">
          {/* Hidden on mobile via CSS */}
          <div className="auth-card-wrapper">
            <AuthCard />
          </div>

          <LoginForm />
        </div>
      </div>
    </motion.div>
  );
}

export default Login;