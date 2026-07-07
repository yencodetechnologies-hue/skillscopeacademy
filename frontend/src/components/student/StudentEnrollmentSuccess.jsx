import { useNavigate } from "react-router-dom"
import "../student/StudentEnrollmentSuccess.css"

export default function EnrollmentSuccess() {
    const navigate = useNavigate()

    return (
        <div className="success-wrapper">

            <div className="success-icon">✓</div>

            <h2 className="success-title">
                Enrollment Submitted Successfully!
            </h2>

            <p className="success-message">
                Your enrollment form has been submitted. Our team will review
                your application and get back to you shortly.
            </p>

            <button
                className="success-btn"
                onClick={() => navigate("/student")}
            >
                ← Back to Dashboard
            </button>

        </div>
    )
}