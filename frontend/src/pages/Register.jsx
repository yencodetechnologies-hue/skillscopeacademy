import React from "react";
import "../styles/Register.css"
import "../styles/Layout.css";
import AuthCard from "../components/AuthCard";
import RegisterForm from "../components/RegisterForm";
import { motion } from "framer-motion";


function Register() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="register-container"
        >
            <div className="register-container">

                <a href="/" className="back-btn">
                    ← Back to Home
                </a>

                <div className="auth-wrapper">

                    <AuthCard />

                    <RegisterForm />

                </div>

            </div>
        </motion.div>
    );
}

export default Register;