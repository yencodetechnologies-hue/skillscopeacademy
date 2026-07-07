import { colors } from '../../constants/theme';
import "../../styles/EnrollmentComplete.css"
import { useNavigate, useLocation } from "react-router-dom"
import { useContext, useEffect, useRef, useState } from "react"
import { AuthContext } from "../../context/AuthContext"
import { API_URL } from "../../data/service"
import { trackPurchaseConversion } from "../../utils/googleAds"
import { ORG_PHONE_1300 } from "../../utils/organizationPhones"

function EnrollmentComplete() {

    const { state } = useLocation()
    const enrollmentData = state || {}
    const navigate = useNavigate()
    const { setUser } = useContext(AuthContext)
    const [countdown, setCountdown] = useState(10)
    const [copiedToken, setCopiedToken] = useState("")
    const [shouldRedirect, setShouldRedirect] = useState(false)
    const conversionFired = useRef(false)

    const isCompany = enrollmentData.enrollmentType === "company"
    const generatedLinks = enrollmentData.generatedLinks || []
    const BASE_URL = window.location.origin

    const handleGoToDashboard = async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/auto-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: enrollmentData.email }),
            })

            const data = await res.json()

            if (res.ok) {
                localStorage.setItem("token", data.token)
                if (data.user && typeof data.user === "object") {
                    localStorage.setItem("user", JSON.stringify(data.user))
                    setUser(data.user)
                }
                window.location.href = isCompany ? "/company" : "/student"
            } else {
                alert("Login failed")
            }
        } catch (err) {
            console.error(err)
            window.location.href = "/login"
        }
    }

    // Google Ads purchase + enhanced conversions (individual bookings only)
    useEffect(() => {
        if (!enrollmentData || enrollmentData.enrollmentType === "company") return
        if (conversionFired.current) return
        conversionFired.current = true

        const timer = setTimeout(() => {
            trackPurchaseConversion({
                email: enrollmentData.email,
                phone: enrollmentData.phone,
                name: enrollmentData.name,
                value: enrollmentData.coursePrice,
                currency: "AUD",
                transactionId:
                    enrollmentData.bookingId ||
                    localStorage.getItem("flowId") ||
                    undefined,
                courseName: enrollmentData.selectedCourse?.title,
                courseId: enrollmentData.selectedCourse?._id,
                paymentMethod: enrollmentData.paymentMethod,
                enrollmentType: enrollmentData.enrollmentType || "individual",
            })
        }, 500)

        return () => clearTimeout(timer)
    }, [enrollmentData])

    // Countdown tick — pure state update, no side effects inside updater
    useEffect(() => {
        if (isCompany) return
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    setShouldRedirect(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [isCompany])

    // Trigger navigation once countdown reaches 0
    useEffect(() => {
        if (shouldRedirect) handleGoToDashboard()
    }, [shouldRedirect])

    // Copy link to clipboard
    const handleCopy = (token) => {
        const url = `${BASE_URL}/book-now?token=${token}`
        navigator.clipboard.writeText(url).then(() => {
            setCopiedToken(token)
            setTimeout(() => setCopiedToken(""), 2000)
        })
    }

    return (
        <div className="ec-page">
            <div className="ec-card">

                <div className="ec-header">
                    <div className="ec-check-circle">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ec-check-icon"
                        >
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </div>
                    <h1 className="ec-title">
                        Thank you for your booking with Safety Training Academy
                    </h1>
                    <p className="ec-subtitle">
                        Your Booking has been completed successfully.
                    </p>
                </div>

                <div className="ec-body">
                    <p className="ec-message">
                        A confirmation email has been sent to{" "}
                        <strong>{enrollmentData.email || "your email"}</strong>. Please check your inbox and follow the instructions.
                    </p>
                    <p className="ec-message">
                        If you need any assistance, please contact us.
                    </p>

                    {/* Course Links Section — company only */}
                    {isCompany && generatedLinks.length > 0 && (
                        <div style={{
                            background: "#f5f3ff",
                            border: "1px solid #ede9fe",
                            borderRadius: 12,
                            padding: "20px 20px",
                            marginTop: 24,
                            marginBottom: 8,
                        }}>
                            <p style={{
                                fontWeight: 700,
                                fontSize: 15,
                                color: colors.brandPrimary,
                                marginBottom: 4,
                            }}>
                                📎 Enrollment Links
                            </p>
                            <p style={{
                                fontSize: 12,
                                color: colors.textMuted,
                                marginBottom: 16,
                                marginTop: 0,
                            }}>
                                Share these links with your employees. Each link allows enrollments equal to the quantity purchased. Links will expire once all slots are filled.
                            </p>

                            {generatedLinks.map((link) => {
                                const url = `${BASE_URL}/book-now?token=${link.token}`
                                const isCopied = copiedToken === link.token
                                return (
                                    <div key={link._id} style={{
                                        background: "white",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 10,
                                        padding: "12px 14px",
                                        marginBottom: 10,
                                    }}>
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: 8,
                                        }}>
                                            <span style={{
                                                fontWeight: 600,
                                                fontSize: 13,
                                                color: "#1f2937",
                                            }}>
                                                📚 {link.courseName}
                                            </span>
                                            <span style={{
                                                background: "#ede9fe",
                                                color: colors.brandPrimary,
                                                borderRadius: 20,
                                                padding: "2px 10px",
                                                fontSize: 11,
                                                fontWeight: 600,
                                            }}>
                                                {link.maxUses} slot{link.maxUses > 1 ? "s" : ""}
                                            </span>
                                        </div>

                                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                            <input
                                                type="text"
                                                value={url}
                                                readOnly
                                                style={{
                                                    flex: 1,
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: 6,
                                                    padding: "6px 10px",
                                                    fontSize: 11,
                                                    color: "#374151",
                                                    background: "#f9fafb",
                                                    outline: "none",
                                                }}
                                            />
                                            <button
                                                onClick={() => handleCopy(link.token)}
                                                style={{
                                                    background: isCopied ? colors.success : colors.brandPrimary,
                                                    color: isCopied ? colors.white : colors.brandOnPrimary,
                                                    border: "none",
                                                    borderRadius: 6,
                                                    padding: "6px 14px",
                                                    cursor: "pointer",
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    whiteSpace: "nowrap",
                                                    transition: "background 0.2s",
                                                }}
                                            >
                                                {isCopied ? "✅ Copied!" : "Copy"}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    <div className="ec-divider" />

                    <div className="ec-contact">
                        <p className="ec-regards">Kind regards,</p>
                        <p className="ec-org-name">Safety Training Academy</p>
                        <p className="ec-org-role">Training Team</p>
                        <a href={ORG_PHONE_1300.tel} style={{ color: "inherit", textDecoration: "none" }} className="ec-org-phone">
                            {ORG_PHONE_1300.display}
                        </a>
                        <a href="mailto:info@safetytrainingacademy.edu.au" className="ec-org-email">
                            info@safetytrainingacademy.edu.au
                        </a>
                    </div>

                    {!isCompany && (
                        <>
                            <div style={{
                                textAlign: "center",
                                marginTop: "20px",
                                marginBottom: "8px",
                                fontSize: "13px",
                                color: "#666"
                            }}>
                                Redirecting to dashboard in{" "}
                                <span style={{
                                    fontWeight: "700",
                                    color: colors.brandPrimary,
                                    fontSize: "15px"
                                }}>
                                    {countdown}s
                                </span>
                            </div>

                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                                <svg width="48" height="48" viewBox="0 0 48 48">
                                    <circle
                                        cx="24" cy="24" r="20"
                                        fill="none"
                                        stroke="#e0e0e0"
                                        strokeWidth="4"
                                    />
                                    <circle
                                        cx="24" cy="24" r="20"
                                        fill="none"
                                        stroke={colors.brandPrimary}
                                        strokeWidth="4"
                                        strokeDasharray={`${2 * Math.PI * 20}`}
                                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - countdown / 10)}`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 24 24)"
                                        style={{ transition: "stroke-dashoffset 1s linear" }}
                                    />
                                    <text
                                        x="24" y="28"
                                        textAnchor="middle"
                                        fontSize="14"
                                        fontWeight="700"
                                        fill={colors.brandPrimary}
                                    >
                                        {countdown}
                                    </text>
                                </svg>
                            </div>
                        </>
                    )}

                    <button className="ec-dashboard-btn" onClick={handleGoToDashboard}>
                        Continue to Dashboard
                    </button>

                </div>

            </div>
        </div>
    )
}

export default EnrollmentComplete
