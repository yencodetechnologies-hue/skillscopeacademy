import { colors } from '../constants/theme';
import { useState, useEffect, useRef } from "react"
import "../styles/Payment.css"
import * as Yup from "yup"
import Loading from "../components/Loading"
import { API_URL } from "../data/service"

// ── Yup Schemas ───────────────────────────────────────────────────
const personalSchema = Yup.object({
    name: Yup.string().trim().required("Full name is required"),
    phone: Yup.string().trim().required("Phone number is required"),
    email: Yup.string().trim().required("Email is required").email("Enter a valid email"),
    agreed: Yup.boolean().oneOf([true], "Please agree to the terms and conditions"),
})

// In company-register mode the personal-details form represents the company,
// so we additionally require the primary Contact Person at the company.
const personalCompanySchema = personalSchema.shape({
    contactPerson: Yup.string().trim().required("Contact person is required"),
})

const bankSchema = Yup.object({
    transactionId: Yup.string().trim().required("Transaction ID is required"),
    paymentSlip: Yup.mixed().required("Payment slip is required"),
})

const SQUARE_SCRIPT = {
    sandbox: "https://sandbox.web.squarecdn.com/v1/square.js",
    production: "https://web.squarecdn.com/v1/square.js",
}

function loadSquareSdk(environment = "sandbox") {
    if (window.Square) return Promise.resolve(window.Square)
    const src = SQUARE_SCRIPT[environment] || SQUARE_SCRIPT.sandbox
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
        return new Promise((resolve, reject) => {
            if (window.Square) return resolve(window.Square)
            existing.addEventListener("load", () => resolve(window.Square))
            existing.addEventListener("error", () => reject(new Error("Failed to load Square")))
        })
    }
    return new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = src
        script.async = true
        script.onload = () => resolve(window.Square)
        script.onerror = () => reject(new Error("Failed to load Square payments"))
        document.head.appendChild(script)
    })
}

async function runSchema(schema, values) {
    try {
        await schema.validate(values, { abortEarly: false })
        return {}
    } catch (err) {
        const errs = {}
        err.inner.forEach(e => { errs[e.path] = e.message })
        return errs
    }
}

// ✅ 5MB limit
const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

function Payment({
    selectedCourse,
    selectedCourses,      // ✅ company courses array
    isCompany,            // ✅ company mode flag
    coursePrice,
    setUserDetails,
    setIsValid,
    triggerValidation,
    isCompanyEnroll,
    setPaymentData,
    onCardPayment,
    onEmailStatusChange,
    onExistingStudentId,
    isExistingCompany = false,
    initialPaymentData = {},
    isEnrollmentLink = false,  // ✅ NEW: for enrollment links
    shouldAutofill = false,    // ✅ NEW: for student portal autofill
    tokenData = null,          // ✅ NEW
    enrollmentLinkData = null, // ✅ NEW
}) {

    const [paymentMethod, setPaymentMethod] = useState(() => {
        // We initialize with a safe default, but useEffect below will adjust it
        // once enrollmentLinkData or tokenData arrives.
        return "Bank Transfer"
    })
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [contactPerson, setContactPerson] = useState("")
    const [agreed, setAgreed] = useState(false)
    const [emailChecking, setEmailChecking] = useState(false)
    const [emailExists, setEmailExists] = useState(false)
    const [transactionId, setTransactionId] = useState("")
    const [paymentSlip, setPaymentSlip] = useState(null)
    const [fileSizeError, setFileSizeError] = useState("") // ✅ NEW
    const [cardName, setCardName] = useState("")
    const [errors, setErrors] = useState({})
    const [paymentStatus, setPaymentStatus] = useState(null)
    const [paymentError, setPaymentError] = useState("")
    const [ewayTransactionId, setEwayTransactionId] = useState("")
    const [squareReady, setSquareReady] = useState(false)
    const [squareLoading, setSquareLoading] = useState(false)
    const [squareError, setSquareError] = useState("")
    const [squareCurrency, setSquareCurrency] = useState("AUD")

    // ✅ File input ref
    const fileInputRef = useRef(null)
    const didShowTriggeredErrors = useRef(false)
    const cardContainerRef = useRef(null)
    const squareCardRef = useRef(null)
    const squarePaymentsRef = useRef(null)

    const clearFieldError = (field) => {
        setErrors(prev => {
            if (!prev[field]) return prev
            const next = { ...prev }
            delete next[field]
            return next
        })
    }

    const isCompanyRegister = isCompany && !isCompanyEnroll && !isEnrollmentLink && !isExistingCompany
    const companyEmailTakenMsg = "Company already registered. Please login to continue."
    const existingStudentInfoMsg =
        "This email is already on file — we'll add this course to your existing account."
    const blockPaymentForExistingEmail = emailExists && isCompanyRegister

    // ── Email Check ──────────────────────────────────────────────
    const checkEmailExists = async (emailValue) => {
        if (!emailValue || !emailValue.includes("@")) return
        if (isExistingCompany || shouldAutofill) return
        setEmailChecking(true)
        setEmailExists(false)
        const checkUrl = isCompanyRegister
            ? `${API_URL}/api/companies/check-email`
            : `${API_URL}/api/auth/check-email`
        try {
            const response = await fetch(checkUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailValue })
            })
            const result = await response.json()
            if (result.exists) {
                setEmailExists(true)
                if (isCompanyRegister) {
                    setErrors(prev => ({ ...prev, email: result.message || companyEmailTakenMsg }))
                } else {
                    setErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.email
                        return newErrors
                    })
                    if (result.studentId && onExistingStudentId) {
                        onExistingStudentId(result.studentId)
                    }
                }
            } else {
                setEmailExists(false)
                if (onExistingStudentId) onExistingStudentId(null)
                setErrors(prev => {
                    const newErrors = { ...prev }
                    if (newErrors.email === companyEmailTakenMsg) {
                        delete newErrors.email
                    }
                    return newErrors
                })
            }
        } catch (err) {
            console.error("Email check failed:", err)
        } finally {
            setEmailChecking(false)
        }
    }

    useEffect(() => {
        if (onEmailStatusChange) onEmailStatusChange(blockPaymentForExistingEmail)
    }, [blockPaymentForExistingEmail])

    useEffect(() => {
        if (!name && !email && !phone) return
        setUserDetails(prev => ({ ...prev, name, email, phone }))
    }, [name, email, phone])

    useEffect(() => {
        if ((isExistingCompany || shouldAutofill) && initialPaymentData && initialPaymentData.email) {
            setName(initialPaymentData.name || "")
            setEmail(initialPaymentData.email || "")
            // Students use 'phone', Companies use 'mobileNumber'
            setPhone(initialPaymentData.phone || initialPaymentData.mobileNumber || initialPaymentData.mobile || "")
            setAgreed(true)
        }
        
        // ✅ Set default payment method if Pay Later is enabled
        if (enrollmentLinkData?.payLater || tokenData?.payLater || initialPaymentData?.payLater) {
            setPaymentMethod("Pay Later")
        }
    }, [isExistingCompany, shouldAutofill, initialPaymentData, enrollmentLinkData, tokenData])

    useEffect(() => {
        if (isExistingCompany || shouldAutofill) {
            setEmailExists(false)
            setErrors(prev => {
                const copy = { ...prev }
                delete copy.email
                return copy
            })
        }
    }, [isExistingCompany, shouldAutofill])

    useEffect(() => {
        if (isExistingCompany || shouldAutofill) return
        const timer = setTimeout(() => { if (email) checkEmailExists(email.trim()) }, 900)
        return () => clearTimeout(timer)
    }, [email, isExistingCompany, shouldAutofill, isCompanyRegister])

    useEffect(() => {
        const fullData = {
            name, email, phone, agreed,
            contactPerson,
            paymentMethod,
            transactionId, paymentSlip,
            cardName,
            ewayTransactionId,
            paymentConfirmed: paymentStatus === "success",
        }
        setPaymentData(fullData)
    }, [name, email, phone, agreed, contactPerson, paymentMethod, transactionId, paymentSlip, cardName, ewayTransactionId, paymentStatus])

    const getFullErrors = async (overrideValues = {}) => {
        const vals = {
            name, phone, email, agreed,
            contactPerson,
            transactionId, paymentSlip,
            cardName,
            ...overrideValues,
        }
        const schema = isCompanyRegister ? personalCompanySchema : personalSchema
        const personalErrors = isExistingCompany ? {} : await runSchema(schema, {
            name: vals.name, phone: vals.phone,
            email: vals.email, agreed: vals.agreed,
            contactPerson: vals.contactPerson,
        })
        let methodErrors = {}
        if (!isCompanyEnroll && !isExistingCompany && !isEnrollmentLink && !blockPaymentForExistingEmail) {
            if (paymentMethod === "Bank Transfer") {
                methodErrors = await runSchema(bankSchema, {
                    transactionId: vals.transactionId,
                    paymentSlip: vals.paymentSlip,
                })
            } else if (paymentMethod === "Card Payment") {
                if (!String(vals.cardName || "").trim()) {
                    methodErrors.cardName = "Name on card is required"
                }
                if (!squareReady) {
                    methodErrors.squareCard = "Secure card form is still loading. Please wait."
                }
            } else if (paymentMethod === "Pay Later") {
                methodErrors = {}
            }
        }
        return { ...personalErrors, ...methodErrors }
    }

    useEffect(() => {
        if (!triggerValidation) {
            didShowTriggeredErrors.current = false
        }
    }, [triggerValidation])

    useEffect(() => {
        getFullErrors().then(errs => {
            if (blockPaymentForExistingEmail || fileSizeError) {
                if (setIsValid) setIsValid(false)
                return
            }
            if (setIsValid) setIsValid(Object.keys(errs).length === 0)

            // Show the full error set once per "Next" click — not on every keystroke.
            if (triggerValidation && !didShowTriggeredErrors.current) {
                didShowTriggeredErrors.current = true
                setErrors(errs)

                if (Object.keys(errs).length > 0) {
                    setTimeout(() => {
                        const firstError = document.querySelector(".error-text, .input-error")
                        if (firstError) {
                            firstError.scrollIntoView({ behavior: "smooth", block: "center" })
                        }
                    }, 100)
                }
            }
        })
    }, [name, phone, email, agreed, contactPerson, transactionId, paymentSlip, cardName, paymentMethod, triggerValidation, blockPaymentForExistingEmail, fileSizeError, squareReady])

    // ── Square Web Payments card form ─────────────────────────────
    useEffect(() => {
        let cancelled = false

        const destroyCard = async () => {
            if (squareCardRef.current) {
                try { await squareCardRef.current.destroy() } catch (_) { /* noop */ }
                squareCardRef.current = null
            }
            squarePaymentsRef.current = null
            setSquareReady(false)
        }

        const initSquare = async () => {
            if (paymentMethod !== "Card Payment" || blockPaymentForExistingEmail || isCompanyEnroll || isEnrollmentLink) {
                await destroyCard()
                return
            }

            setSquareLoading(true)
            setSquareError("")
            setSquareReady(false)

            // Wait for the card host to mount after React paint
            for (let i = 0; i < 20 && !cardContainerRef.current && !cancelled; i++) {
                await new Promise((r) => setTimeout(r, 50))
            }
            if (cancelled || !cardContainerRef.current) {
                if (!cancelled) {
                    setSquareError("Card form container unavailable. Please switch payment method and try again.")
                    setSquareLoading(false)
                }
                return
            }

            try {
                const configRes = await fetch(`${API_URL}/api/payment/square-config`)
                const raw = await configRes.text()
                let config
                try {
                    config = JSON.parse(raw)
                } catch {
                    throw new Error(
                        configRes.status === 404
                            ? "Square payment route not found. Restart the backend server (npm start in /backend) and try again."
                            : `Payment config failed (${configRes.status}). Expected JSON from ${API_URL}/api/payment/square-config but got HTML/text. Is the backend running?`
                    )
                }
                if (!configRes.ok || !config.success) {
                    throw new Error(config.message || "Unable to load payment form")
                }

                if (cancelled) return

                setSquareCurrency(config.currency || "AUD")
                const Square = await loadSquareSdk(config.environment || "sandbox")
                if (!Square) throw new Error("Square SDK unavailable")

                await destroyCard()
                if (cancelled || !cardContainerRef.current) return

                // Clear host before attach (Square requires empty container)
                cardContainerRef.current.innerHTML = ""

                const payments = Square.payments(config.applicationId, config.locationId)
                squarePaymentsRef.current = payments

                const card = await payments.card({
                    style: {
                        input: {
                            fontSize: "15px",
                            fontFamily: "inherit",
                            color: "#111827",
                        },
                        "input::placeholder": {
                            color: "#94a3b8",
                        },
                        ".input-container": {
                            borderColor: "#e5e7eb",
                            borderRadius: "10px",
                        },
                        ".input-container.is-focus": {
                            borderColor: "#00796B",
                        },
                        ".input-container.is-error": {
                            borderColor: "#dc2626",
                        },
                    },
                })
                await card.attach(cardContainerRef.current)
                if (cancelled) {
                    await card.destroy()
                    return
                }
                squareCardRef.current = card
                setSquareReady(true)
            } catch (err) {
                console.error("Square init failed:", err)
                if (!cancelled) {
                    setSquareError(err.message || "Could not load secure card form")
                    setSquareReady(false)
                }
            } finally {
                if (!cancelled) setSquareLoading(false)
            }
        }

        initSquare()
        return () => {
            cancelled = true
            destroyCard()
        }
    }, [paymentMethod, blockPaymentForExistingEmail, isCompanyEnroll, isEnrollmentLink])

    const handleBlur = async (field, overrideValues = {}) => {
        const allErrors = await getFullErrors(overrideValues)
        setErrors(prev => {
            const next = { ...prev }
            if (allErrors[field]) next[field] = allErrors[field]
            else delete next[field]
            return next
        })
    }

    const handleEmailBlur = async () => {
        if (isExistingCompany) return
        const trimmed = email.trim()
        if (trimmed !== email) setEmail(trimmed)
        await handleBlur("email", { email: trimmed })
    }

    const handleCardPayment = async () => {
        if (blockPaymentForExistingEmail) {
            setErrors(prev => ({ ...prev, email: companyEmailTakenMsg }))
            return { success: false, message: "Email already registered" }
        }
        const newErrors = await getFullErrors()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return { success: false, message: "Validation failed" }
        }
        if (!squareCardRef.current) {
            setPaymentStatus("error")
            setPaymentError("Secure card form is not ready. Please wait a moment and try again.")
            return { success: false, message: "Square card not ready" }
        }

        setPaymentStatus("loading")
        setPaymentError("")
        try {
            const tokenResult = await squareCardRef.current.tokenize()
            if (tokenResult.status !== "OK" || !tokenResult.token) {
                const detail = tokenResult.errors?.[0]?.message
                    || "Please check your card details and try again."
                setPaymentStatus("error")
                setPaymentError(detail)
                return { success: false, message: detail }
            }

            const amount = Number(coursePrice) || Number(selectedCourse?.sellingPrice) || 0
            const response = await fetch(`${API_URL}/api/payment/pay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sourceId: tokenResult.token,
                    amount,
                    currency: squareCurrency,
                    email,
                    name,
                    phone,
                    userId: phone || email,
                    courseName: selectedCourse?.title || "",
                    description: selectedCourse
                        ? `${selectedCourse.courseCode || ""} - ${selectedCourse.title || ""}`.trim()
                        : "Course enrollment",
                }),
            })
            const result = await response.json()
            if (result.success) {
                setPaymentStatus("success")
                const txId = result.gatewayTransactionId || result.transactionId || ""
                setEwayTransactionId(txId)
                setPaymentData(prev => ({
                    ...prev,
                    ewayTransactionId: txId,
                    paymentConfirmed: true,
                }))
                return { success: true, transactionId: txId }
            } else {
                setPaymentStatus("error")
                setPaymentError(result.message || "Your card was declined. Please contact your bank or try a different payment method.")
                return { success: false, message: result.message }
            }
        } catch (err) {
            setPaymentStatus("error")
            setPaymentError("Network error. Please check your connection and try again.")
            return { success: false, message: "Network error" }
        }
    }

    useEffect(() => {
        if (onCardPayment) {
            onCardPayment({
                trigger: handleCardPayment,
                paymentMethod,
                paymentStatus
            })
        }
    }, [paymentMethod, paymentStatus, name, phone, email, agreed, cardName, squareReady])

    // ── Remove slip ───────────────────────────────────────────────
    const removeSlip = () => {
        setPaymentSlip(null)
        setFileSizeError("") // ✅ clear error on remove
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    // ✅ Handle file change with size validation
    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > MAX_FILE_SIZE_BYTES) {
            setFileSizeError(`File size exceeds ${MAX_FILE_SIZE_MB}MB. Please upload a smaller file.`)
            setPaymentSlip(null)
            if (fileInputRef.current) fileInputRef.current.value = ""
            return
        }

        setFileSizeError("") // ✅ clear any previous error
        setPaymentSlip(file)
        handleBlur("paymentSlip", { paymentSlip: file })
    }

    return (
        <div className="payment-wrapper">

            <div className="payment-header">
                <h3>Step 2: Payment</h3>
                <p>Enter your details and choose your payment method</p>
            </div>

            {/* Personal Details */}
            <div className="payment-card">
                {/* Brand-new company sign-up: header + labels switch to company copy
                    and we ask for a Contact Person. Logged-in / existing companies
                    stay on the standard "Personal Details" form (their company
                    name and contact person are already stored). */}
                <h4>{isCompany && !isCompanyEnroll && !isEnrollmentLink && !isExistingCompany ? "Company Details" : "Personal Details"}</h4>

                <div className="form-group">
                    <label>{isCompany && !isCompanyEnroll && !isEnrollmentLink && !isExistingCompany ? "Company Name *" : "Full Name *"}</label>
                    <input
                        type="text"
                        placeholder={isCompany && !isCompanyEnroll && !isEnrollmentLink && !isExistingCompany ? "Enter your company name" : "Enter your full name"}
                        value={name}
                        onChange={(e) => {
                            if (isExistingCompany) return
                            setName(e.target.value)
                            clearFieldError("name")
                        }}
                        onBlur={() => !isExistingCompany && handleBlur("name")}
                        className={errors.name ? "input-error" : ""}
                        readOnly={isExistingCompany}
                    />
                    {errors.name && <span className="error-text">⚠ {errors.name}</span>}
                </div>

                {isCompany && !isCompanyEnroll && !isEnrollmentLink && !isExistingCompany && (
                    <div className="form-group">
                        <label>Contact Person *</label>
                        <input
                            type="text"
                            placeholder="Primary contact name at the company"
                            value={contactPerson}
                            onChange={(e) => setContactPerson(e.target.value)}
                            onBlur={() => handleBlur("contactPerson")}
                            className={errors.contactPerson ? "input-error" : ""}
                        />
                        {errors.contactPerson && <span className="error-text">⚠ {errors.contactPerson}</span>}
                    </div>
                )}

                <div className="form-group">
                    <label>Mobile Number *</label>
                    <input
                        type="text"
                        placeholder="+61 xxx xxx xxx"
                        value={phone}
                        onChange={(e) => {
                            if (isExistingCompany) return
                            setPhone(e.target.value)
                            clearFieldError("phone")
                        }}
                        onBlur={() => !isExistingCompany && handleBlur("phone")}
                        className={errors.phone ? "input-error" : ""}
                        readOnly={isExistingCompany}
                    />
                    {errors.phone && <span className="error-text">⚠ {errors.phone}</span>}
                </div>

                <div className="form-group">
                    <label>Email *</label>
                    <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => {
                            if (isExistingCompany) return
                            setEmail(e.target.value)
                            clearFieldError("email")
                        }}
                        onBlur={handleEmailBlur}
                        className={errors.email || blockPaymentForExistingEmail ? "input-error" : ""}
                        disabled={emailChecking || isExistingCompany}
                        readOnly={isExistingCompany}
                        autoComplete="email"
                    />
                    {emailChecking && <span className="checking-text">🔄 Checking email...</span>}
                    {blockPaymentForExistingEmail && (
                        <span className="error-text">
                            ⚠ {companyEmailTakenMsg}{" "}
                            <a href="/login" style={{ color: colors.brandPrimary, textDecoration: "underline" }}>Login</a>
                            {" "}to continue.
                        </span>
                    )}
                    {emailExists && !blockPaymentForExistingEmail && (
                        <span className="checking-text" style={{ color: "#059669" }}>
                            ✓ {existingStudentInfoMsg}
                        </span>
                    )}
                    {errors.email && !blockPaymentForExistingEmail && <span className="error-text">⚠ {errors.email}</span>}
                </div>

                <div className="terms">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => {
                            setAgreed(e.target.checked)
                            handleBlur("agreed", { agreed: e.target.checked })
                        }}
                        disabled={isExistingCompany}
                    />
                    <span>I agree to the terms and conditions and understand my information will be used for enrollment purposes</span>
                </div>
                {errors.agreed && <span className="error-text">⚠ {errors.agreed}</span>}
            </div>

            {/* ✅ Order Summary — company vs individual */}
            <div className="summary-card">
                <h4>Order Summary</h4>

                {isCompany && selectedCourses?.length > 0 ? (
                    <>
                        {selectedCourses.map(sc => (
                            <div className="summary-row" key={sc.uid}>
                                <span>{sc.course.title} × {sc.quantity}</span>
                                <span>${sc.course.sellingPrice * sc.quantity}</span>
                            </div>
                        ))}
                        <div className="summary-row total">
                            <span>Total:</span>
                            <span>${coursePrice}</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="summary-row">
                            <span>Course:</span>
                            <span>{selectedCourse ? `${selectedCourse.courseCode} - ${selectedCourse.title}` : "Select a course"}</span>
                        </div>
                        <div className="summary-row">
                            <span>Duration:</span>
                            <span>{selectedCourse?.duration || "0"}</span>
                        </div>
                        {/* Only show total if not an enrollment link OR if it's an agent link WITHOUT Pay Later */}
                        {(!isEnrollmentLink || (isEnrollmentLink && enrollmentLinkData?.agent && !enrollmentLinkData?.payLater)) && (
                            <div className="summary-row total">
                                <span>Total:</span>
                                <span>${coursePrice || selectedCourse?.sellingPrice || "0"}</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Enrollment Link Info (Only show "No Payment Required" if Pay Later is NOT enabled for the link) */}
            {isEnrollmentLink && (
                <div className="summary-card" style={{ backgroundColor: "#f3e8ff", borderLeft: `4px solid ${colors.brandPrimary}` }}>
                    <div style={{ fontSize: 14, color: colors.brandPrimary, fontWeight: 600 }}>
                        {enrollmentLinkData?.payLater ? "✓ Pay Later Enabled" : "✓ No Payment Required"}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b21b6", marginTop: 4 }}>
                        {enrollmentLinkData?.payLater 
                            ? "Your enrollment will be processed now, and an invoice will be issued to your company."
                            : "Complete enrollment and assessment to activate your account."}
                    </div>
                </div>
            )}

            {/* Payment Method - Show if not an enrollment/company link */}
            {(!isCompanyEnroll && !isEnrollmentLink && !blockPaymentForExistingEmail) && (
                <div className="payment-method">
                    <label>Select Payment Method *</label>
                    <div
                        className={`method-card ${paymentMethod === "Bank Transfer" ? "active" : ""}`}
                        onClick={() => setPaymentMethod("Bank Transfer")}
                    >
                        <input type="radio" checked={paymentMethod === "Bank Transfer"} readOnly />
                        <div>
                            <strong>Bank Transfer</strong>
                            <p>Transfer to our bank account and upload receipt</p>
                        </div>
                    </div>

                    <div
                        className={`method-card ${paymentMethod === "Card Payment" ? "active" : ""}`}
                        onClick={() => setPaymentMethod("Card Payment")}
                    >
                        <input type="radio" checked={paymentMethod === "Card Payment"} readOnly />
                        <div>
                            <strong>Credit Card — Pay Now</strong>
                            <p>Secure checkout powered by Square</p>
                        </div>
                        <span className="method-badge">Instant</span>
                    </div>
                    
                    {/* Standalone Pay Later option - only if enabled */}
                    {(tokenData?.payLater || enrollmentLinkData?.payLater || initialPaymentData?.payLater) && (
                        <div
                            className={`method-card ${paymentMethod === "Pay Later" ? "active" : ""}`}
                            onClick={() => setPaymentMethod("Pay Later")}
                        >
                            <input type="radio" checked={paymentMethod === "Pay Later"} readOnly />
                            <div>
                                <strong>Pay Later</strong>
                                <p>Proceed now and pay later via invoice</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Bank Transfer Details (Normal bank transfer requiring slip) */}
            {!blockPaymentForExistingEmail && (!isCompanyEnroll && !isEnrollmentLink || tokenData?.payLater || enrollmentLinkData?.payLater || initialPaymentData?.payLater) && paymentMethod === "Bank Transfer" && (
                <div className="bank-details">
                    <h4>Bank Details</h4>
                    <div className="bank-row"><span>Bank:</span><span>Commonwealth Bank</span></div>
                    <div className="bank-row"><span>Account Name:</span><span>AIET College</span></div>
                    <div className="bank-row"><span>BSB:</span><span>062268</span></div>
                    <div className="bank-row"><span>Account No:</span><span> 10530830</span></div>

                    <div className="form-group">
                        <label>Transaction ID / Reference *</label>
                        <input
                            type="text"
                            placeholder="Enter your bank transaction ID"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            onBlur={() => handleBlur("transactionId")}
                            className={errors.transactionId ? "input-error" : ""}
                        />
                        {errors.transactionId && <span className="error-text">⚠ {errors.transactionId}</span>}
                    </div>

                    <div className="form-group">
                        <label>Payment slip upload * <span style={{ fontSize: 11, color: colors.textIcon, fontWeight: 400 }}>(Max {MAX_FILE_SIZE_MB}MB)</span></label>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            ref={fileInputRef}
                            onChange={handleFileChange}  
                            className={errors.paymentSlip || fileSizeError ? "input-error" : ""}
                        />
                        {/* ✅ File size warning */}
                        {fileSizeError && (
                            <span className="error-text">⚠ {fileSizeError}</span>
                        )}
                        {errors.paymentSlip && !fileSizeError && (
                            <span className="error-text">⚠ {errors.paymentSlip}</span>
                        )}

                        {/* Image preview */}
                        {paymentSlip && paymentSlip.type?.startsWith("image/") && (
                            <div style={{ marginTop: 10, position: "relative", width: "100%" }}>
                                <img
                                    src={URL.createObjectURL(paymentSlip)}
                                    alt="Receipt preview"
                                    style={{
                                        width: "100%",
                                        maxHeight: 220,
                                        objectFit: "contain",
                                        borderRadius: 8,
                                        border: "1px solid #e5e7eb",
                                        background: colors.bg,
                                        display: "block",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={removeSlip}
                                    style={{
                                        position: "absolute", top: 6, right: 6,
                                        background: "rgba(0,0,0,0.55)", color: "white",
                                        border: "none", borderRadius: "50%",
                                        width: 28, height: 28, fontSize: 15,
                                        cursor: "pointer", display: "flex",
                                        alignItems: "center", justifyContent: "center",
                                    }}
                                >✕</button>
                                <p style={{ fontSize: 12, color: colors.success, marginTop: 4 }}>✅ {paymentSlip.name}</p>
                            </div>
                        )}

                        {/* PDF preview */}
                        {paymentSlip && paymentSlip.type === "application/pdf" && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                                <p style={{ fontSize: 12, color: colors.brandPrimary, margin: 0 }}>📄 {paymentSlip.name}</p>
                                <button
                                    type="button"
                                    onClick={removeSlip}
                                    style={{
                                        background: colors.errorBg, color: colors.error,
                                        border: "none", borderRadius: 6,
                                        padding: "2px 8px", fontSize: 11, cursor: "pointer",
                                    }}
                                >✕ Remove</button>
                            </div>
                        )}
                    </div>

                    <p className="bank-note">Please use your name and course code as the payment reference.</p>
                </div>
            )}

            {/* Pay Later Option Note (No fields required) */}
            {(isEnrollmentLink || tokenData?.payLater || enrollmentLinkData?.payLater || initialPaymentData?.payLater) && paymentMethod === "Pay Later" && (
                <div className="bank-details" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <div style={{ padding: 10 }}>
                        <p style={{ margin: 0, fontSize: 14, color: "#166534", fontWeight: 600 }}>
                            ✓ Pay Later Method Selected
                        </p>
                        <p style={{ margin: "8px 0 0", fontSize: 13, color: "#15803d" }}>
                            You can proceed with the enrollment now. Your company will be invoiced for this booking. No immediate payment or receipt is required.
                        </p>
                    </div>
                </div>
            )}

            {/* Card Payment — Square Web Payments */}
            {!blockPaymentForExistingEmail && !isCompanyEnroll && !isEnrollmentLink && paymentMethod === "Card Payment" && (
                <form className="card-payment square-card-panel" onSubmit={(e) => e.preventDefault()}>
                    <div className="secure-box">
                        <div className="secure-left">
                            <span className="secure-icon" aria-hidden="true">🔒</span>
                            <div>
                                <strong>Secure Square Checkout</strong>
                                <p>Card details stay with Square — never stored on our servers</p>
                            </div>
                        </div>
                        <div className="pci">PCI DSS · Sandbox</div>
                    </div>

                    <div className="square-amount-chip">
                        <span>Amount due</span>
                        <strong>
                            {squareCurrency}{" "}
                            {Number(coursePrice || selectedCourse?.sellingPrice || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </strong>
                    </div>

                    <div className="form-group">
                        <label>Name on Card *</label>
                        <input
                            type="text"
                            placeholder="JOHN SMITH"
                            value={cardName}
                            onChange={(e) => {
                                setCardName(e.target.value)
                                clearFieldError("cardName")
                            }}
                            onBlur={() => handleBlur("cardName")}
                            className={errors.cardName ? "input-error" : ""}
                            autoComplete="cc-name"
                        />
                        {errors.cardName && <span className="error-text">⚠ {errors.cardName}</span>}
                    </div>

                    <div className="form-group">
                        <label>Card Details *</label>
                        <div
                            id="square-card-container"
                            ref={cardContainerRef}
                            className={`square-card-host ${errors.squareCard || squareError ? "is-error" : ""} ${squareReady ? "is-ready" : ""}`}
                        />
                        {squareLoading && (
                            <span className="checking-text">Loading secure card form…</span>
                        )}
                        {squareError && <span className="error-text">⚠ {squareError}</span>}
                        {errors.squareCard && !squareError && (
                            <span className="error-text">⚠ {errors.squareCard}</span>
                        )}
                        {squareReady && !squareError && (
                            <span className="square-ready-hint">✓ Ready — enter your card details above</span>
                        )}
                    </div>

                    <div className="card-logos">
                        <span>We accept</span>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="Mastercard" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" />
                    </div>

                    <p className="square-test-hint">
                        Sandbox test card: <code>4111 1111 1111 1111</code> · any future expiry · any CVV
                    </p>

                    {paymentStatus === "success" && (
                        <div className="payment-success">
                            ✅ Payment Successful! Transaction ID: <strong>{ewayTransactionId}</strong>
                        </div>
                    )}

                    {paymentStatus === "error" && (
                        <div className="payment-error-card">
                            <div className="payment-error-card-header">
                                <div className="payment-error-card-title">
                                    <span>⚠️</span>
                                    <strong>Payment failed</strong>
                                </div>
                                <button className="payment-error-close" type="button" onClick={() => setPaymentStatus(null)}>✕</button>
                            </div>
                            <p className="payment-error-message">
                                {paymentError || "Your card was declined. Please contact your bank or try a different payment method."}
                            </p>
                            <button className="try-again-btn" type="button" onClick={() => setPaymentStatus(null)}>Try again</button>
                        </div>
                    )}
                </form>
            )}

            {paymentStatus === "loading" && (
                <Loading message="Processing your payment" sub="Please wait, do not close this page" />
            )}

            <div className="payment-warning">
                Note: After completing the payment step, you will proceed to the LLN Assessment and then the Enrollment Form.
            </div>

        </div>
    )
}

export default Payment