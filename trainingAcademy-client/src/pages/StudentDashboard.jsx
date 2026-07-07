import React from "react";
import { useEffect, useState } from "react";
import "../styles/StudentDashboard.css";
import LLNDAssessment from "../components/llnd/LLNDAssessment";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../data/service";

export default function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);

  const studentId = user.id;
  localStorage.setItem("studentId", user.id);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("startLLN") === "true") {
      setShowAssessment(true);
      // Optional: clean up URL
      navigate("/student", { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/student/dashboard/${studentId}`
        );
        if (!res.ok) throw new Error("Failed to fetch data");
        const resData = await res.json();
        setData(resData);

        // Store status in localStorage for Sidebar lock check
        localStorage.setItem("assessmentPassed", resData.assessmentPassed);
        localStorage.setItem("enrollmentFormSubmitted", resData.enrollmentFormSubmitted);
        localStorage.setItem("enrollmentFormApproved", resData.enrollmentFormApproved);
        localStorage.setItem("enrollmentFormStatus", resData.enrollmentFormStatus || "Pending");
      } catch (err) {
        console.error(err);
        setError("Something went wrong da 😅");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [studentId, navigate]);

  const paymentVerified = data?.paymentVerified ?? false;
  const assessmentPassed = data?.assessmentPassed ?? false;
  const enrollmentFormStatus = data?.enrollmentFormStatus || "Pending";
  const enrollmentFormSubmitted = data?.enrollmentFormSubmitted ?? false;
  const enrollmentFormApproved = data?.enrollmentFormApproved ?? false;
  const assessmentScore = data?.assessmentScore ?? null;

  const paymentMethod = data?.paymentMethod || "";
  const enrollmentType = data?.enrollmentType || "";

  const canTakeAssessment = paymentVerified; // Must pay before taking assessment


  const handleAssessmentComplete = () => {
    // We don't necessarily need to hide the assessment if we're navigating away,
    // but doing so ensures the dashboard state is clean if they come back.
    setShowAssessment(false);

    const fetchDashboardAndRedirect = async () => {
      try {
        const res = await fetch(`${API_URL}/api/student/dashboard/${studentId}`);
        if (!res.ok) throw new Error("Failed to fetch data");
        const resData = await res.json();
        setData(resData);

        // Store status in localStorage for Sidebar lock check
        localStorage.setItem("assessmentPassed", resData.assessmentPassed);
        localStorage.setItem("enrollmentFormSubmitted", resData.enrollmentFormSubmitted);
        localStorage.setItem("enrollmentFormApproved", resData.enrollmentFormApproved);
        localStorage.setItem("enrollmentFormStatus", resData.enrollmentFormStatus || "Pending");
      } catch (err) {
        console.error("Redirect fetch error:", err);
      }
    };
    
    fetchDashboardAndRedirect();
  };

  if (showAssessment) {
    return (
      <LLNDAssessment
        onComplete={handleAssessmentComplete}
        flowId={data.latestFlowId}
        userDetails={{
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
        }}
      />
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-welcome">
          Welcome Back! <span className="wave">👋</span>
        </h1>
        <p className="dashboard-subtitle">
          Here's what's happening with your courses today.
        </p>
      </div>

      <div className="dashboard-alerts">
        {/* LLND Assessment Alert (NOW BACK TO TOP) */}
        {!assessmentPassed ? (
          <div className="alert alert-danger">
            <div className="alert-icon-wrap">📖</div>
            <div className="alert-body">
              <span className="alert-badge">Action required</span>
              <p className="alert-title">LLN Assessment Required</p>
              <p className="alert-desc">
                Complete the LLN assessment to fully activate your enrollment
              </p>
            </div>
            <button
              className="alert-action-btn"
              onClick={() => {
                setShowAssessment(true);
              }}
            >
              📋 Take Assessment
            </button>
          </div>
        ) : (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <div className="alert-body">
              <p className="alert-title">Pre-Enrollment Assessment Passed</p>
              <p className="alert-desc">
                Score: {assessmentScore}%
              </p>
            </div>
          </div>
        )}

        {/* Enrollment Form Alert (NOW BELOW LLND) */}
        {!enrollmentFormSubmitted ? (
          <div className="alert alert-danger">
            <div className="alert-icon-wrap">📄</div>
            <div className="alert-body">
              <span className="alert-badge">Action required</span>
              <p className="alert-title">Enrollment Form Required</p>
              <p className="alert-desc">
                Complete your enrollment form to finalize your course registration
              </p>
            </div>
            <button
              className="alert-action-btn"
              onClick={() => {
                if (!assessmentPassed) {
                  alert("Please complete your LLN assessment before continuing");
                } else {
                  navigate("/student/enrollment-form");
                }
              }}
            >
              📝 Complete Form
            </button>
          </div>
        ) : enrollmentFormStatus === "Rejected" ? (
          <div className="alert alert-danger">
            <span className="alert-icon">❌</span>
            <div className="alert-body">
              <span className="alert-badge" style={{ background: "#fee2e2", color: "#dc2626" }}>Rejected</span>
              <p className="alert-title">Enrollment Form Submitted</p>
              <p className="alert-desc">
                Your form has been received and is currently being reviewed by our team.
              </p>
              <button
                className="alert-link"
                onClick={() => navigate("/student/enrollment-form")}
              >
                View Submitted Form
              </button>
            </div>
          </div>
        ) : enrollmentFormStatus === "Approved" ? (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <div className="alert-body">
              <span className="alert-badge" style={{ background: "#dcfce7", color: "#166534" }}>Approved</span>
              <p className="alert-title">Enrollment Form Submitted</p>
              <p className="alert-desc">
                Your form has been received and is currently being reviewed by our team.
              </p>
              <button
                className="alert-link"
                onClick={() => navigate("/student/enrollment-form")}
              >
                View Submitted Form
              </button>
            </div>
          </div>
        ) : (
          <div className="alert alert-warning">
            <span className="alert-icon">⏳</span>
            <div className="alert-body">
              <span className="alert-badge" style={{ background: "#fef9c3", color: "#ca8a04" }}>Awaiting Review</span>
              <p className="alert-title">Enrollment Form Submitted</p>
              <p className="alert-desc">
                Your form has been received and is currently being reviewed by our team.
              </p>
              <button
                className="alert-link"
                onClick={() => navigate("/student/enrollment-form")}
              >
                View Submitted Form
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="quick-actions-card">
        <h2 className="quick-actions-title">Quick Actions</h2>
        <div className="quick-actions-list">

          {/* ✅ Navigate to My Courses → Browse Courses tab */}
          <button
            className="quick-action-btn"
            disabled={!canTakeAssessment}
            onClick={() => {
              if (!assessmentPassed) {
                alert("Please complete your LLN assessment before continuing");
              } else if (!enrollmentFormSubmitted) {
                alert("Please complete your enrollment form before continuing");
              } else {
                navigate("/student/my-courses", { state: { tab: "browse" } });
              }
            }}
          >
            <span className="qa-icon">📖</span>
            <span>Enroll in New Course</span>
          </button>

          <button
            className="quick-action-btn"
            onClick={() => {
              if (!assessmentPassed) {
                alert("Please complete your LLN assessment before continuing");
              } else if (!enrollmentFormSubmitted) {
                alert("Please complete your enrollment form before continuing");
              } else {
                navigate("/student/certificates");
              }
            }}
          >
            <span className="qa-icon">🏅</span>
            <span>Download Certificates</span>
          </button>

          <button
            className="quick-action-btn"
            onClick={() => {
              if (!assessmentPassed) {
                alert("Please complete your LLN assessment before continuing");
              } else if (!enrollmentFormSubmitted) {
                alert("Please complete your enrollment form before continuing");
              } else {
                navigate("/student/results");
              }
            }}
          >
            <span className="qa-icon">📈</span>
            <span>View Results</span>
          </button>

        </div>
      </div>
    </div>
  );
}