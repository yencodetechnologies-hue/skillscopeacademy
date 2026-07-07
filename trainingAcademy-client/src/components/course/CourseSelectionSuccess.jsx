import { useEffect, useState } from "react";
import "./CourseSelectionSuccess.css";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { API_URL } from "../../data/service";
import { ORG_PHONE_1300, ORG_PHONE_MOBILE } from "../../utils/organizationPhones";

export default function EnrollmentSuccess({ enrollmentData, onBackToHome, onNext }) {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // ✅ If enrollmentData doesn't exist, return Loading
  if (!enrollmentData) {
    return <div>Loading...</div>;
  }

  // ✅ Payment method display
  const paymentMethodDisplay = enrollmentData.paymentMethod === "card"
    ? "Credit Card - Pay Now"
    : "Bank Transfer";

  // ✅ Course display
  const courseDisplay = enrollmentData.selectedCourse
    ? `${enrollmentData.selectedCourse.courseCode} – ${enrollmentData.selectedCourse.category}`
    : "Course not selected";

  // ✅ Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Australia/Sydney"
    });
  };

  const summaryItems = [
    { label: "Course", value: courseDisplay },
    { label: "Date", value: formatDate(enrollmentData.courseDate) },
    { label: "Time", value: enrollmentData.courseTime || "Time not available" },
    { label: "Payment Method", value: paymentMethodDisplay },
  ];

  const { setUser } = useContext(AuthContext);

  const handleGoToDashboard = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/auto-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: enrollmentData.email,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);

        // ✅ SAFE SAVE
        if (data.user && typeof data.user === "object") {
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
        } else {
          console.error("Invalid user:", data.user);
        }

        if (onNext) {
          onNext();
        } else {
          navigate("/student");
        }
      } else {
        alert("Login failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="enrollment-wrapper">
      <div className={`enrollment-card ${visible ? "visible" : ""}`}>

        {/* Success Icon */}
        <div className="success-icon">
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 18L15 25L28 11"
              stroke="#3B6D11"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="enrollment-title">Booking Successful!</h2>
        <p className="enrollment-subtitle">
          You have successfully booked your course. A confirmation email
          has been sent to your registered email address.
        </p>

        <div className="success-contact-help" style={{ 
          marginTop: "16px", 
          padding: "12px", 
          background: "#f0f7ff", 
          borderRadius: "8px",
          border: "1px solid #d1e9ff",
          fontSize: "14px",
          color: "#0d47a1"
        }}>
          <p style={{ margin: "0 0 8px 0", fontWeight: "600" }}>Need help? Contact us:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
            <a href={ORG_PHONE_1300.tel} style={{ color: "inherit", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              <span>📞</span> {ORG_PHONE_1300.display}
            </a>
            <a href={ORG_PHONE_MOBILE.tel} style={{ color: "inherit", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              <span>📱</span> {ORG_PHONE_MOBILE.display}
            </a>
            <a href="mailto:info@safetytrainingacademy.edu.au" style={{ color: "inherit", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              <span>✉️</span> info@safetytrainingacademy.edu.au
            </a>
          </div>
        </div>

        {/* Summary Card */}
        <div className="summary-card">
          <p className="summary-label">Booking Summary</p>

          {summaryItems.map((item) => (
            <div key={item.label} className="summary-row">
              <span className="summary-row-key">{item.label}</span>
              <span className="summary-row-value">{item.value}</span>
            </div>
          ))}

          {/* Total Row */}
          <div className="summary-total-row">
            <span className="summary-total-label">Total</span>
            <span className="summary-total-value">
              ${enrollmentData.coursePrice || "0"}
            </span>
          </div>
        </div>

        {/* Payment Notice - Bank Transfer */}
        {enrollmentData.paymentMethod === "Bank Transfer" && (
          <div className="payment-notice">
            <p>
              Your payment is under review. We will confirm your booking once
              the bank transfer is verified.
            </p>
          </div>
        )}

        {/* Payment Notice - Card Payment */}
        {enrollmentData.paymentMethod === "Card Payment" && (
          <div className="payment-notice" style={{ background: "#e8f5e9", borderColor: "#4caf50" }}>
            <p>
              Your payment has been processed successfully.
              A receipt has been sent to {enrollmentData.email}.
            </p>
          </div>
        )}

        {/* Back to Home Button */}
        <button className="back-btn-enrl-wrap" onClick={handleGoToDashboard}>
          {onNext ? "Continue to Enrollment Form" : "Continue to Dashboard"}
        </button>

      </div>
    </div>
  );
}