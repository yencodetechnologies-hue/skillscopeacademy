import React from "react";
import { Link } from "react-router-dom";
import "../styles/RegisterForm.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { API_URL } from "../data/service";

function RegisterForm() {

    const formik = useFormik({

        initialValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            role: "student",
        },

        validationSchema: Yup.object({
            name: Yup.string().required("Name required"),
            email: Yup.string().email("Invalid email").required("Email required"),
            phone: Yup.string().required("Phone required"),
            password: Yup.string().min(6, "Minimum 6 characters").required("Password required"),
        }),

        onSubmit: async (values, { resetForm }) => {

            try {

                const res = await axios.post(
                    `${API_URL}/api/auth/register`,
                    values
                )

                alert(res.data.message)

                resetForm()

            } catch (err) {

                alert(err.response?.data?.message || "Registration failed")

            }

        }

    })

    return (

        <div className="login-box">

            <h3 className="welcome">Welcome Back</h3>

            <p className="subtitle subtitle-register">
                Sign in to your account or create a new one
            </p>

            <div className="tabs">
                <Link className="tab" to="/login">Sign In</Link>
                <Link className="tab active" to="/register">Register</Link>
            </div>

            <form onSubmit={formik.handleSubmit} className="input-wrapper-text">

                <label>Full Name</label>
                <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />

                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />

                <label>Phone Number</label>
                <input
                    type="text"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />

                <label>Password</label>
                <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                <label>Role</label>

                <select
                    className="role-select"
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                    <option value="Company">Company</option>

                </select>

                <div className="options options-agree">
                    <label>
                        <input type="checkbox" />
                        <span>I agree to the Terms of Service and Privacy Policy</span>
                    </label>
                </div>

                <button className="signin-btn" type="submit">
                    Create Account
                </button>

            </form>

        </div>

    );
}

export default RegisterForm;