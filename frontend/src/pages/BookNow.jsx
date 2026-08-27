import { colors } from '../constants/theme';
// ============================================================================
// BookNow.jsx — COMPLETE FILE WITH STRICT UPDATES
// ============================================================================

import {
    FiHome,
    FiBookOpen,
    FiCreditCard,
    FiUser,
    FiChevronRight,
    FiChevronLeft,
    FiShield,
    FiClock,
    FiAward,
    FiHeadphones,
    FiCheckCircle,
} from "react-icons/fi";

import { useState, useEffect, useRef, useMemo } from "react";
import CourseSelection from "../components/course/CourseSelection";
import "../styles/BookNow.css";
import Payment from "../components/Payment";
import LLNDAssessment from "../components/llnd/LLNDAssessment";
import EnrollmentRegister from "../components/enrollmrntRegister/EnrollmentRegister";
import CourseSelectionSuccess from "../components/course/CourseSelectionSuccess";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom"
import Loading from "../components/Loading"
import { API_URL } from "../data/service";
import { authHeaders } from "../utils/authHeaders";
import { ACTIVE_COURSES_URL, isActiveCourse } from "../utils/courseStatus";
import { getCoursePricingType } from "../utils/coursePrice";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/** Card payments already create links in createPayment; pending payments need generate. */
async function fetchOrGenerateCourseLinks(paymentId, companyId, coursesPayload, paymentStatus) {
    if (paymentStatus === "success") {
        const linksRes = await fetch(`${API_URL}/api/course-links/payment/${paymentId}`)
        const linksData = await linksRes.json()
        return linksData.data || []
    }
    const linksRes = await fetch(`${API_URL}/api/course-links/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            companyPaymentId: paymentId,
            companyId,
            courses: coursesPayload,
        }),
    })
    const linksData = await linksRes.json()
    return linksData.data || []
}

function toDateKey(d) {
    if (!d) return ""
    return new Date(d).toISOString().split("T")[0]
}

function buildSessionFromBookingLink(td) {
    return {
        _id: td.sessionId || "booking-link-session",
        date: td.sessionDate,
        startTime: td.startTime || "",
        endTime: td.endTime || "",
    }
}

/** Match company-purchased session from schedule slots or fall back to link snapshot. */
function findSessionFromBookingLink(slots, td) {
    if (td.sessionId) {
        for (const slot of slots || []) {
            for (const session of slot.sessions || []) {
                if (String(session._id) === String(td.sessionId)) {
                    return { ...session, date: slot.date }
                }
            }
        }
    }
    const targetDate = toDateKey(td.sessionDate)
    for (const slot of slots || []) {
        if (toDateKey(slot.date) !== targetDate) continue
        for (const session of slot.sessions || []) {
            if (session.startTime === td.startTime && session.endTime === td.endTime) {
                return { ...session, date: slot.date }
            }
        }
    }
    if (td.sessionDate) return buildSessionFromBookingLink(td)
    return null
}

async function loadBookingLinkSelection(td, setSelectedCourse, setSelectedSession) {
    if (!td?.courseId) return
    const courseRes = await fetch(`${API_URL}/api/courses/${td.courseId}`)
    if (!courseRes.ok) return
    const course = await courseRes.json()
    if (!isActiveCourse(course)) return
    setSelectedCourse(course)

    const slotRes = await fetch(`${API_URL}/api/schedules/course/${td.courseId}`)
    const slots = slotRes.ok ? await slotRes.json() : []
    const session = findSessionFromBookingLink(slots, td)
    if (session) setSelectedSession(session)
}

function BookNow() {
    const location = useLocation()
    const navigate = useNavigate();
    const enrollRef = useRef(null);
    // Routes feeding into BookNow:
    //   /enroll/:id                  → enrollment-link token id
    //   /book-now/course/:slug       → public course booking by SEO slug
    //   /book-now/company/:id        → company-scoped booking (id)
    //   /book-now                    → blank, manual selection
    const { id: paramId, slug: paramSlug } = useParams();
    const [searchParams] = useSearchParams();
    const bookingType = searchParams.get("type");
    const enrollType = searchParams.get("enroll")
    const fromPortal = searchParams.get("fromPortal") === "true";

    const isEnrollmentLink = location.pathname.startsWith('/enroll/');
    const isCoursePath     = location.pathname.startsWith('/book-now/course/');
    // enrollId is the company id only — never the course slug.
    const enrollId         = isEnrollmentLink || isCoursePath ? null : paramId;
    const enrollmentLinkId = isEnrollmentLink ? paramId : null;
    const courseSlug       = isCoursePath ? paramSlug : null;

    const [isLoading, setIsLoading] = useState(!!paramId || !!paramSlug);

    // ✅ Token states (company link flow)
    const [tokenData, setTokenData] = useState(null)
    const [tokenError, setTokenError] = useState("")
    const [tokenLoading, setTokenLoading] = useState(false)

    // ✅ Enrollment link states
    const [enrollmentLinkData, setEnrollmentLinkData] = useState(null)
    const [enrollmentLinkError, setEnrollmentLinkError] = useState("")
    const [enrollmentLinkLoading, setEnrollmentLinkLoading] = useState(false)

    const [isEmailTaken, setIsEmailTaken] = useState(false)
    const [selectedCourses, setSelectedCourses] = useState([])
    const [isCompanyEnroll, setIsCompanyEnroll] = useState(false);
    const [isPublicCompanyLink, setIsPublicCompanyLink] = useState(false);
    const [isDashboardCompany, setIsDashboardCompany] = useState(false);
    const [enrollmentType, setEnrollmentType] = useState(enrollType === "company" ? "company" : "individual");
    //const [searchParams] = useSearchParams();

const [step, setStep] = useState(() => {
    return searchParams.get("step") === "2" ? 2 : 1;
});
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [enrollSection, setEnrollSection] = useState(1);
    const [isPaymentValid, setIsPaymentValid] = useState(false);
    const [triggerValidation, setTriggerValidation] = useState(false);

    useEffect(() => {
        setTriggerValidation(false);
    }, [step]);
    const [paymentData, setPaymentData] = useState({});
    const [userDetails, setUserDetails] = useState({ name: "", email: "", phone: "" });
    const [companyUser, setCompanyUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
    const [isProcessing, setIsProcessing] = useState(false)

    const { user: authUser } = useContext(AuthContext);
    const loggedInUser = useMemo(() => {
        if (authUser) return authUser
        try {
            const stored = localStorage.getItem("user")
            return stored ? JSON.parse(stored) : null
        } catch {
            return null
        }
    }, [authUser])
    const isStudentPortalAutofill = fromPortal && 
        (String(loggedInUser?.role || "").toLowerCase() === "student");

    const cardPaymentRef = useRef({ trigger: null, paymentMethod: "bank", paymentStatus: null })
    const [activePaymentMethod, setActivePaymentMethod] = useState("Bank Transfer")
    const prevStepRef = useRef(null)

    const isCompany = enrollmentType === "company"
    const isMultiCompanyBooking = isCompany && !isCompanyEnroll
    const hideEnrollmentType = isCompanyEnroll || isDashboardCompany || isPublicCompanyLink
    const email = location.state?.email || "your email"

    // ✅ Individual course price
    //   1. course.__variant (user picked this in the variant-aware dropdown)
    //   2. URL ?type=… (legacy deep-link)
    //   3. Default (without-experience / single-license / sellingPrice)
    const getIndividualCoursePrice = (course) => {
        if (!course) return 0
        const pt = getCoursePricingType(course)
        const v  = course.__variant || null

        if (pt === "slbl") {
            if (v === "slbl" || (v == null && bookingType === "slbl")) return bookingType === "sl" ? (course.slSinglePrice || 0) : (course.slblPrice || 0)
            if (v === "sl" || (v == null && bookingType === "sl")) return course.slSinglePrice || 0
            return course.slSinglePrice || course.slblPrice || 0
        }

        if (pt === "experience") {
            if (v === "with-experience"    || (v == null && bookingType === "with-experience"))    return course.withExperiencePrice || 0
            if (v === "without-experience" || (v == null && bookingType === "without-experience")) return course.withoutExperiencePrice || 0
            return course.withoutExperiencePrice || course.withExperiencePrice || 0
        }

        return course.sellingPrice || 0
    }

    // ✅ coursePrice — company mode: sum of all, individual: single course
    const coursePrice = isCompany
        ? selectedCourses.reduce((sum, sc) => sum + (getIndividualCoursePrice(sc.course) * sc.quantity), 0)
        : getIndividualCoursePrice(selectedCourse)

    // ✅ Token validate — URL-ல ?token= இருந்தா
    useEffect(() => {
        const token = searchParams.get("token")
        if (!token) return

        setTokenLoading(true)
        fetch(`${API_URL}/api/course-links/validate/${token}`)
            .then(res => res.json())
            .then(async (data) => {
                if (data.valid) {
                    setTokenData(data.data)
                    setIsCompanyEnroll(true)
                    setEnrollmentType("individual")

                    try {
                        await loadBookingLinkSelection(
                            data.data,
                            setSelectedCourse,
                            setSelectedSession,
                        )
                    } catch (err) {
                        console.error("Failed to pre-select booking link course:", err)
                    }
                } else if (data.expired) {
                    setTokenError("expired")
                } else {
                    setTokenError("invalid")
                }
            })
            .catch(() => setTokenError("invalid"))
            .finally(() => setTokenLoading(false))
    }, [searchParams])

    // ✅ Enrollment link validate
    useEffect(() => {
        if (!isEnrollmentLink || !enrollmentLinkId) return

        setEnrollmentLinkLoading(true)
        fetch(`${API_URL}/api/enrollment-links/${enrollmentLinkId}`)
            .then(res => res.json())
            .then(async (data) => {
                if (data.success) {
                    const link = data.data
                    setEnrollmentLinkData(link)
                    setIsCompanyEnroll(true)
                    
                    // Set enrollment type based on agent flag
                    if (link.agent) {
                        setEnrollmentType("agent")
                    }

                    // Pre-select course if specified
                    if (link.course && link.course !== "Any course") {
                        try {
                            const coursesRes = await fetch(ACTIVE_COURSES_URL(API_URL))
                            const coursesData = await coursesRes.json()
                            const courses = Array.isArray(coursesData) ? coursesData : coursesData.data || []
                            const course = courses.find(c => c.title === link.course)
                            if (course) {
                                // We no longer call setSelectedCourse(course) here
                                // to ensure the student must select it manually.
                                console.log("Enrollment link course specified:", course.title);
                            }
                        } catch (err) {
                            console.error("Failed to load enrollment link course details:", err)
                        }
                    }
                } else {
                    setEnrollmentLinkError("Invalid enrollment link")
                }
            })
            .catch((err) => {
                console.error("Enrollment link validation failed:", err)
                setEnrollmentLinkError("Invalid enrollment link")
            })
            .finally(() => {
                setEnrollmentLinkLoading(false)
                setIsLoading(false)
            })
    }, [isEnrollmentLink, enrollmentLinkId])

    // Legacy redirect: /book-now?courseId=ABC[&type=...&sessionId=...]
    // → /book-now/course/{slug}[?type=...&sessionId=...]
    //
    // Old emails, Google's cache, and a handful of internal call sites
    // still use the query-string form. We look up the slug once and
    // rewrite the URL in place (replace: true) so the clean SEO URL
    // shows in the address bar and bookmarks. Other query params are
    // preserved verbatim so deep-linked sessions still work.
    useEffect(() => {
        if (isCoursePath || isEnrollmentLink) return
        const legacyCourseId = searchParams.get("courseId")
        if (!legacyCourseId) return

        let cancelled = false
        fetch(`${API_URL}/api/courses/${legacyCourseId}`)
            .then(res => res.ok ? res.json() : null)
            .then(course => {
                if (cancelled || !course?.slug || !isActiveCourse(course)) return
                const next = new URLSearchParams(searchParams)
                next.delete("courseId")
                const qs = next.toString()
                navigate(
                    qs
                        ? `/book-now/course/${course.slug}?${qs}`
                        : `/book-now/course/${course.slug}`,
                    { replace: true }
                )
            })
            .catch(() => { /* fall through — manual selection still works */ })

        return () => { cancelled = true }
    }, [isCoursePath, isEnrollmentLink, searchParams])

    // /book-now/course/:slug — pre-select the course by its SEO slug.
    // Falls back to legacy /book-now/course/{slug}-{ObjectId} format if
    // the redirect shim hasn't rewritten the URL yet on first render.
    useEffect(() => {
        if (!isCoursePath || !courseSlug) return
        const legacyMatch = courseSlug.match(/^[a-z0-9-]+-([a-f0-9]{24})$/i)
        const fetchSlug = legacyMatch
            ? courseSlug.replace(`-${legacyMatch[1]}`, "")
            : courseSlug
        const fallbackId = legacyMatch ? legacyMatch[1] : null

        setIsLoading(true)
        fetch(`${API_URL}/api/courses/slug/${encodeURIComponent(fetchSlug)}`)
            .then(async (res) => {
                if (res.ok) return res.json()
                if (fallbackId) {
                    const r = await fetch(`${API_URL}/api/courses/${fallbackId}`)
                    if (r.ok) return r.json()
                }
                throw new Error("not-found")
            })
            .then((course) => {
                if (course?._id && isActiveCourse(course)) setSelectedCourse(course)
            })
            .catch(() => {
                // Bad slug — send the user back to the all-courses page
                // rather than getting stuck on a broken booking screen.
                navigate("/all-courses", { replace: true })
            })
            .finally(() => setIsLoading(false))
    }, [isCoursePath, courseSlug])

    useEffect(() => {
        if (selectedCourse?._id) localStorage.setItem("courseId", selectedCourse._id);
    }, [selectedCourse]);

    useEffect(() => {
        if (selectedSession?._id) localStorage.setItem("sessionId", selectedSession._id);
    }, [selectedSession]);

    useEffect(() => {
        if (!enrollId) return;
        // The URL itself tells us this is a company-scoped booking
        // (path = /book-now/company/:id), so we configure the flow up-front
        // based on the auth state and don't gate the page render on a
        // server round-trip. The API call below is a non-blocking sanity
        // check that never redirects on transient failures (incognito,
        // offline, slow network, etc.).
        const isCompanyPath = location.pathname.startsWith("/book-now/company/");

        if (isCompanyPath) {
            // General Enrolment Link — always treat as individual employee enrollment
            // regardless of whether the visitor is logged in, is the company, or is admin.
            // This link is for employees to self-enrol, not for company bulk booking.
            setIsLoading(true);
            fetch(`${API_URL}/api/companies/${enrollId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setTokenData({
                            companyId: enrollId,
                            payLater: data.data.payLater
                        });
                        setIsCompanyEnroll(false);
                        setIsPublicCompanyLink(true);
                        setEnrollmentType("individual");
                        setIsDashboardCompany(false);
                    } else {
                        navigate("/");
                    }
                })
                .catch(() => navigate("/"))
                .finally(() => setIsLoading(false));
            return;
        }

        // Non /book-now/company/:id paths fall through to the legacy role
        // lookup (e.g. /book-now/course/:id which can be Student/Course/...).
        setIsLoading(true);
        fetch(`${API_URL}/api/book-now/check-role?id=${enrollId}`)
            .then(res => res.json())
            .then(data => {
                if (data.role === "company" || data.role === "Company") {
                    setIsCompanyEnroll(false);
                    setEnrollmentType("company");
                    setIsDashboardCompany(true);

                    const user = JSON.parse(localStorage.getItem("user") || "{}");
                    if (user) {
                        setCompanyUser(user);
                        setPaymentData(prev => ({
                            ...prev,
                            name: user.name || "",
                            email: user.email || "",
                            phone: user.mobileNumber || "",
                            agreed: true,
                        }));
                        setUserDetails({
                            name: user.name || "",
                            email: user.email || "",
                            phone: user.mobileNumber || "",
                        });
                    }
                } else {
                    // Unknown id on a non-company path — back to home.
                    navigate("/");
                }
            })
            .catch(() => {
                // Don't trap the user on a blank page if the role API is
                // unreachable; just go home.
                navigate("/");
            })
            .finally(() => setIsLoading(false));
    }, [enrollId]);

    useEffect(() => {
        if (isStudentPortalAutofill && loggedInUser?.email) {
            const data = {
                name: loggedInUser.name || "",
                email: loggedInUser.email || "",
                phone: loggedInUser.phone || loggedInUser.mobileNumber || loggedInUser.mobile || "",
            };
            setUserDetails(prev => ({ ...prev, ...data }));
            setPaymentData(prev => ({
                ...prev,
                ...data,
                agreed: true,
            }));

            // 🔥 Robustness: If phone is missing from localStorage/Context, try fetching from profile API
            if (!data.phone) {
                const sid = loggedInUser.id || loggedInUser._id;
                if (sid) {
                    fetch(`${API_URL}/api/student/profile/${sid}`)
                        .then(res => res.json())
                        .then(profile => {
                            if (profile.phone) {
                                setUserDetails(prev => ({ ...prev, phone: profile.phone }));
                                setPaymentData(prev => ({ ...prev, phone: profile.phone }));
                            }
                        })
                        .catch(err => console.error("Portal autofill profile fetch failed:", err));
                }
            }
        }
    }, [isStudentPortalAutofill, loggedInUser]);

    useEffect(() => {
        if (!isStudentPortalAutofill) return;
        const sid = loggedInUser?.id || loggedInUser?._id;
        if (sid) localStorage.setItem("enrollId", String(sid));
    }, [isStudentPortalAutofill, loggedInUser]);

    // Reset draft booking only when navigating back to step 1 — not on every re-render.
    useEffect(() => {
        const enteredStep1 = step === 1 && prevStepRef.current !== 1
        prevStepRef.current = step

        if (!enteredStep1) return

        setSelectedSession(null)
        localStorage.removeItem("flowId")
        localStorage.removeItem("courseId")
        localStorage.removeItem("sessionId")
        if (isStudentPortalAutofill) {
            const sid = loggedInUser?.id || loggedInUser?._id
            if (sid) localStorage.setItem("enrollId", String(sid))
        } else {
            localStorage.removeItem("enrollId")
        }
    }, [step, isStudentPortalAutofill, loggedInUser])

    const handleExistingStudentId = (studentId) => {
        if (studentId) {
            localStorage.setItem("enrollId", String(studentId));
        } else if (!isStudentPortalAutofill) {
            localStorage.removeItem("enrollId");
        }
    };

    const totalSteps = (enrollmentType === "individual" || enrollmentType === "agent") ? 4 : 2;
    const effectiveStep = isCompanyEnroll ? step - 1 : step;
    const progress = (effectiveStep / totalSteps) * 100;

    const createFlow = async (slipUrl = "", txId = "") => {
        try {
            const studentId = localStorage.getItem("enrollId");
            if (!studentId) return;
            const formData = new FormData();
            formData.append("studentId", studentId);
            formData.append("courseId", selectedCourse._id);
            formData.append("courseCategory", selectedCourse.category);
            formData.append("courseName", selectedCourse.title);
            formData.append("price", coursePrice);
            formData.append("enrollmentType",
                isEnrollmentLink ? enrollmentType :
                (isCompanyEnroll || isPublicCompanyLink) ? "company" :
                enrollmentType
            );
            formData.append("sessionDate", selectedSession?.date);
            formData.append("startTime", selectedSession?.startTime);
            formData.append("endTime", selectedSession?.endTime);
            formData.append("sessionId", selectedSession?._id || "");
            formData.append("paymentMethod", paymentData.paymentMethod || "");
            const resolvedTxId = txId || paymentData.ewayTransactionId || paymentData.transactionId || "";
            formData.append("transactionId", resolvedTxId);
            if (paymentData.paymentMethod === "Card Payment" && resolvedTxId) {
                formData.append("ewayTransactionId", resolvedTxId);
            }
            formData.append("slipUrl", slipUrl);
            if (isEnrollmentLink) {
                formData.append("source", "Enrollment Link");
                formData.append("sourceToken", enrollmentLinkId);
                formData.append("paymentMethod", "Pay Later");
            } else if (tokenData?.companyId) {
                formData.append("companyId", tokenData.companyId);
                const linkToken = searchParams.get("token");
                if (linkToken) {
                    formData.append("source", "Booking Link");
                    formData.append("sourceToken", linkToken);
                } else {
                    formData.append("source", "Company Link");
                }
            } else if (enrollId) {
                formData.append("companyId", enrollId);
                formData.append("source", "Company Link");
            }
            if (paymentData.name) formData.append("name", paymentData.name);
            if (paymentData.email) formData.append("email", paymentData.email);
            const res = await fetch(`${API_URL}/api/flow/create`, {
                method: "POST",
                headers: authHeaders(),
                body: formData,
            });
            const data = await res.json();
            console.log("[BookNow] Flow created:", data);
            if (data && data._id) {
                localStorage.setItem("flowId", data._id);
            } else {
                console.error("[BookNow] Flow ID missing in response:", data);
            }
        } catch (err) {
            console.error("[BookNow] createFlow error:", err);
        }
    };

    const upsertStudentForBooking = async ({ txId = "" } = {}) => {
        const formData = new FormData();
        formData.append("name", paymentData.name);
        formData.append("email", paymentData.email);
        formData.append("phone", paymentData.phone);
        formData.append("preferredCity", paymentData.preferredCity || ""); 
        formData.append("paymentMethod", paymentData.paymentMethod);
        formData.append("transactionId", txId || paymentData.transactionId || "");
        if (paymentData.paymentMethod === "Card Payment") {
            formData.append("ewayTransactionId", txId || paymentData.ewayTransactionId || "");
        }
        if (paymentData.paymentSlip) {
            formData.append("paymentSlip", paymentData.paymentSlip);
        }
        formData.append("courseId", selectedCourse?._id);
        if (selectedSession?._id) {
            formData.append("sessionId", selectedSession._id);
        }
        formData.append("sessionDate", selectedSession?.date);
        formData.append("startTime", selectedSession?.startTime);
        formData.append("endTime", selectedSession?.endTime);
        formData.append(
            "enrollmentType",
            (isCompanyEnroll || isPublicCompanyLink) ? "company" : enrollmentType
        );
        formData.append("skipFlow", "true");
        if (tokenData?.companyId) formData.append("companyId", tokenData.companyId);
        else if (enrollId) formData.append("companyId", enrollId);

        const res = await fetch(`${API_URL}/api/enroll/enrollment`, {
            method: "POST",
            headers: authHeaders(),
            body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || "Enrollment failed. Please contact support.");
        }
        const studentId = data._id;
        localStorage.setItem("enrollId", studentId);
        return {
            studentId,
            slipUrl: data.courses?.[0]?.slipUrl || "",
        };
    };

    const sendBookingEmail = async (txId = "") => {
        try {
            await fetch(`${API_URL}/api/booking-email/send-confirmation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: paymentData.name,
                    email: paymentData.email,
                    courseName: selectedCourse?.title,
                    courseCode: selectedCourse?.courseCode,
                    courseDate: selectedSession?.date,
                    startTime: selectedSession?.startTime,
                    endTime: selectedSession?.endTime,
                    coursePrice,
                    paymentMethod: paymentData.paymentMethod,
                    phone: paymentData.phone,
                    gatewayTransactionId: txId || paymentData.ewayTransactionId || paymentData.transactionId || "",
                    bankTransferId: paymentData.transactionId || "",
                    bookingId: localStorage.getItem("flowId")
                }),
            });
        } catch (err) {
            console.error("Email send failed:", err.message);
        }
    };

    const getNextLabel = () => {
        // if (step === 2  && isCompany && !enrollId) {
        //     return "Login to continue"
        // }
        if (step === 2 && !isCompanyEnroll && !isEnrollmentLink) {
            if (paymentData.paymentMethod === "Pay Later") return "Confirm & Continue"
            return `🔒 Pay $${coursePrice} & Continue`
        }
        if (step === 2 && isEnrollmentLink) return "Create Account & Continue"
        if (step === 4 && enrollSection === 5) return "Submit"
        return "Next"
    }

    const handleNext = async () => {
        if (isProcessing) return;

        if (step === 2 && isEmailTaken && isCompany && !enrollId) {
            navigate("/login")
            return
        }

        if (step === 2) {
            // ✅ ============================================================
            // ✅ ENROLLMENT LINK FLOW
            // ✅ ============================================================
            if (isEnrollmentLink) {
                setTriggerValidation(true)
                if (!isPaymentValid) return

                setIsProcessing(true)
                try {
                    // Create student account
                    const formData = new FormData();
                    formData.append("name", paymentData.name);
                    formData.append("email", paymentData.email);
                    formData.append("phone", paymentData.phone);
                    formData.append("preferredCity", paymentData.preferredCity || "");
                    formData.append("enrollmentType", enrollmentType);
                    formData.append("courseId", selectedCourse?._id);
                    formData.append("sessionDate", selectedSession?.date);
                    formData.append("startTime", selectedSession?.startTime);
                    formData.append("endTime", selectedSession?.endTime);
                    formData.append("skipFlow", "true");

                    const res = await fetch(`${API_URL}/api/enroll/enrollment`, {
                        method: "POST",
                        headers: authHeaders(),
                        body: formData,
                    });
                    const data = await res.json();
                    const studentId = data._id;
                    localStorage.setItem("enrollId", studentId);

                    // 1. Mark this enrollment link as used and record student FIRST
                    if (enrollmentLinkId) {
                        const enrollLinkRes = await fetch(`${API_URL}/api/enrollment-links/${enrollmentLinkId}/enroll`, {
                            method: "POST",
                            headers: authHeaders({ "Content-Type": "application/json" }),
                            body: JSON.stringify({
                                name: paymentData.name,
                                email: paymentData.email,
                            }),
                        });
                        const enrollLinkData = await enrollLinkRes.json();
                        if (!enrollLinkRes.ok) {
                            throw new Error(enrollLinkData.message || "Enrollment link could not be used.");
                        }
                    }

                    // 2. Create enrollment flow (Now backend can find the student and update bookingId)
                    await createFlow();

                    // ✅ Send enrollment confirmation email (agent link registration)
                    try {
                        await fetch(`${API_URL}/api/booking-email/enrollment-link`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                toEmail: paymentData.email,
                                studentName: paymentData.name,
                                courseName: selectedCourse?.title || "Course",
                                courseCode: selectedCourse?.courseCode || "",
                                courseDate: selectedSession?.date || "To be confirmed",
                                startTime: selectedSession?.startTime || "",
                                endTime: selectedSession?.endTime || "",
                                phone: paymentData.phone,
                                bookingId: localStorage.getItem("flowId"),
                                totalAmount: coursePrice,
                                paymentMethod: "Pay Later",
                                isAgent: enrollmentLinkData?.agent || enrollmentType === "agent" || false
                            })
                        });
                    } catch (emailErr) {
                        console.error("Email send failed:", emailErr.message);
                    }

                    // Auto-login the user
                    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: paymentData.email,
                            password: "123456"  // Default password
                        })
                    });
                    const loginData = await loginRes.json();
                    if (loginRes.ok) {
                        localStorage.setItem("user", JSON.stringify(loginData.user));
                        localStorage.setItem("token", loginData.token);
                    }

                    navigate("/student");
                } catch (err) {
                    alert(err.message);
                } finally {
                    setIsProcessing(false);
                }
                return;
            }

            // ✅ ============================================================
            // ✅ COMPANY REGISTRATION FLOW (NEW COMPANY)
            // ✅ ============================================================
            if (enrollmentType === "company" && !enrollId) {
                setTriggerValidation(true)
                if (!isPaymentValid) return

                setIsProcessing(true)
                try {
                    // ✅ 1. Build courses payload (no side effects)
                    const coursesPayload = selectedCourses.map(sc => ({
                        courseId:      sc.course._id,
                        courseName:    sc.course.title,
                        courseCode:    sc.course.courseCode,
                        quantity:      sc.quantity,
                        pricePerPerson: getIndividualCoursePrice(sc.course),
                        sessionId:     sc.session?._id || "",
                        sessionDate:   sc.session?.date || null,
                        startTime:     sc.session?.startTime || "",
                        endTime:       sc.session?.endTime || "",
                    }))

                    // ✅ 2. Charge card via eWAY FIRST — before creating any account.
                    //    If the card is wrong the company is never registered, so the
                    //    user can fix their card details and retry without hitting
                    //    "account already registered".
                   // ============================================================
// CHARGE CARD USING SQUARE
// ============================================================
let ewayTransactionRef =
    paymentData.ewayTransactionId ||
    paymentData.transactionId ||
    "";

if (paymentData.paymentMethod === "Card Payment") {

    // If payment was already completed, don't charge again
    if (
        paymentData.paymentConfirmed &&
        paymentData.ewayTransactionId
    ) {
        ewayTransactionRef =
            paymentData.ewayTransactionId;
    } else {

        if (
            !cardPaymentRef.current ||
            typeof cardPaymentRef.current.trigger !== "function"
        ) {
            throw new Error(
                "Payment form is not ready. Please enter your card details and try again."
            );
        }

        // IMPORTANT:
        // Payment.jsx handles Square card.tokenize()
        // and calls /api/payment/create with sourceId.
        const paymentResult =
            await cardPaymentRef.current.trigger();

        if (!paymentResult?.success) {
            throw new Error(
                paymentResult?.message ||
                "Card payment failed. Please check your card details and try again."
            );
        }

        ewayTransactionRef =
            paymentResult.gatewayTransactionId ||
            paymentResult.transactionId ||
            "";

        if (!ewayTransactionRef) {
            throw new Error(
                "Payment succeeded but transaction ID was not returned."
            );
        }

        console.log(
            "[BookNow] Square payment successful:",
            ewayTransactionRef
        );
    }
}

                    // ✅ 3. Register Company — only reached after successful payment
                    const res = await fetch(`${API_URL}/api/companies/register`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            companyName: paymentData.name,
                            email:       paymentData.email,
                            password:    "123456",
                            mobileNumber: paymentData.phone,
                            contactPerson: paymentData.contactPerson || "",
                        })
                    })
                    const data = await res.json()
                   // if (!res.ok) throw new Error(data.message || "Registration failed")

                    const companyId = data.data._id

                    // ✅ 4. Build FormData
                    const formData = new FormData()
                    formData.append("companyId", companyId)
                    formData.append("amount", coursePrice)
                    formData.append("paymentMethod", paymentData.paymentMethod || "Bank Transfer")
                    formData.append("transactionReference", ewayTransactionRef)
                    formData.append("courseCount", selectedCourses.length)
                    formData.append("notes", "")

                    coursesPayload.forEach((course, i) => {
                        formData.append(`courses[${i}][courseId]`,      course.courseId)
                        formData.append(`courses[${i}][courseName]`,    course.courseName)
                        formData.append(`courses[${i}][courseCode]`,    course.courseCode)
                        formData.append(`courses[${i}][quantity]`,      course.quantity)
                        formData.append(`courses[${i}][pricePerPerson]`,course.pricePerPerson)
                        formData.append(`courses[${i}][sessionId]`,     course.sessionId || "")
                        formData.append(`courses[${i}][sessionDate]`,   course.sessionDate || "")
                        formData.append(`courses[${i}][startTime]`,     course.startTime || "")
                        formData.append(`courses[${i}][endTime]`,       course.endTime || "")
                    })

                    if (paymentData.paymentSlip) {
                        formData.append("receipt", paymentData.paymentSlip)
                    }

                    // ✅ 5. Create CompanyPayment
                    const paymentRes = await fetch(`${API_URL}/api/company-payments`, {
                        method: "POST",
                        body: formData
                    })
                    const paymentResData = await paymentRes.json()
                    if (!paymentRes.ok) throw new Error(paymentResData.message || "Payment creation failed")

                    const generatedLinks = await fetchOrGenerateCourseLinks(
                        paymentResData.data._id,
                        companyId,
                        coursesPayload,
                        paymentResData.data.status,
                    )

                    // ✅ 6. Create EnrollmentFlows for each course
                    await Promise.all(selectedCourses.map(sc =>
                        fetch(`${API_URL}/api/flow/create`, {
                            method: "POST",
                            headers: authHeaders({ "Content-Type": "application/json" }),
                            body: JSON.stringify({
                                companyId,
                                name: paymentData.name,
                                email: paymentData.email,
                                courseId:      sc.course._id,
                                courseCategory: sc.course.category,
                                courseName:    sc.course.title,
                                price:         getIndividualCoursePrice(sc.course) * sc.quantity,
                                enrollmentType: "Company",
                                sessionDate:   sc.session?.date,
                                startTime:     sc.session?.startTime,
                                endTime:       sc.session?.endTime,
                                sessionId:     sc.session?._id || "",
                                quantity:      sc.quantity,
                                paymentMethod: paymentData.paymentMethod || "Bank Transfer",
                            })
                        })
                    ))
                    sessionStorage.removeItem("company_course_selection");

                    // ✅ 7. Navigate with generated links
                    navigate("/booking-success", {
                        state: {
                            selectedCourses,
                            coursePrice,
                            paymentMethod: paymentData.paymentMethod || "Bank Transfer",
                            email: paymentData.email,
                            name: paymentData.name,
                            enrollmentType: "company",
                            generatedLinks,  // ✅ Pass links
                        }
                    })
                } catch (err) {
                    alert(err.message)
                } finally {
                    setIsProcessing(false)
                }
                return
            }

            // ✅ ============================================================
            // ✅ COMPANY PAYMENT FLOW (EXISTING COMPANY)
            // ✅ ============================================================
            if (enrollmentType === "company" && enrollId) {
                setTriggerValidation(true)
                if (!isPaymentValid) return

                setIsProcessing(true)
                try {
                    const companyId = enrollId
                    const coursesPayload = selectedCourses.map(sc => ({
                        courseId:      sc.course._id,
                        courseName:    sc.course.title,
                        courseCode:    sc.course.courseCode,
                        quantity:      sc.quantity,
                        pricePerPerson: getIndividualCoursePrice(sc.course),
                        sessionId:     sc.session?._id || "",
                        sessionDate:   sc.session?.date || null,
                        startTime:     sc.session?.startTime || "",
                        endTime:       sc.session?.endTime || "",
                    }))

                    // Charge card via eWAY if card payment (before recording anything)
                    // ============================================================
// CHARGE CARD USING SQUARE
// ============================================================
let ewayTransactionRef =
    paymentData.ewayTransactionId ||
    paymentData.transactionId ||
    "";

if (paymentData.paymentMethod === "Card Payment") {

    // If payment was already completed, don't charge again
    if (
        paymentData.paymentConfirmed &&
        paymentData.ewayTransactionId
    ) {
        ewayTransactionRef =
            paymentData.ewayTransactionId;
    } else {

        if (
            !cardPaymentRef.current ||
            typeof cardPaymentRef.current.trigger !== "function"
        ) {
            throw new Error(
                "Payment form is not ready. Please enter your card details and try again."
            );
        }

        // IMPORTANT:
        // Payment.jsx handles Square card.tokenize()
        // and calls /api/payment/create with sourceId.
        const paymentResult =
            await cardPaymentRef.current.trigger();

        if (!paymentResult?.success) {
            throw new Error(
                paymentResult?.message ||
                "Card payment failed. Please check your card details and try again."
            );
        }

        ewayTransactionRef =
            paymentResult.gatewayTransactionId ||
            paymentResult.transactionId ||
            "";

        if (!ewayTransactionRef) {
            throw new Error(
                "Payment succeeded but transaction ID was not returned."
            );
        }

        console.log(
            "[BookNow] Square payment successful:",
            ewayTransactionRef
        );
    }
}

                    const formData = new FormData()
                    formData.append("companyId", companyId)
                    formData.append("amount", coursePrice)
                    formData.append("paymentMethod", paymentData.paymentMethod || "Bank Transfer")
                    formData.append("transactionReference", ewayTransactionRef)
                    formData.append("courseCount", selectedCourses.length)
                    formData.append("notes", "")

                    coursesPayload.forEach((course, i) => {
                        formData.append(`courses[${i}][courseId]`,      course.courseId)
                        formData.append(`courses[${i}][courseName]`,    course.courseName)
                        formData.append(`courses[${i}][courseCode]`,    course.courseCode)
                        formData.append(`courses[${i}][quantity]`,      course.quantity)
                        formData.append(`courses[${i}][pricePerPerson]`,course.pricePerPerson)
                        formData.append(`courses[${i}][sessionId]`,     course.sessionId || "")
                        formData.append(`courses[${i}][sessionDate]`,   course.sessionDate || "")
                        formData.append(`courses[${i}][startTime]`,     course.startTime || "")
                        formData.append(`courses[${i}][endTime]`,       course.endTime || "")
                    })

                    if (paymentData.paymentSlip) {
                        formData.append("receipt", paymentData.paymentSlip)
                    }

                    const paymentRes = await fetch(`${API_URL}/api/company-payments`, {
                        method: "POST",
                        body: formData
                    })
                    const paymentResData = await paymentRes.json()
                    if (!paymentRes.ok) throw new Error(paymentResData.message || "Payment creation failed")

                    const generatedLinks = await fetchOrGenerateCourseLinks(
                        paymentResData.data._id,
                        companyId,
                        coursesPayload,
                        paymentResData.data.status,
                    )

                    await Promise.all(selectedCourses.map(sc =>
                        fetch(`${API_URL}/api/flow/create`, {
                            method: "POST",
                            headers: authHeaders({ "Content-Type": "application/json" }),
                            body: JSON.stringify({
                                companyId,
                                name: paymentData.name,
                                email: paymentData.email,
                                courseId:      sc.course._id,
                                courseCategory: sc.course.category,
                                courseName:    sc.course.title,
                                price:         getIndividualCoursePrice(sc.course) * sc.quantity,
                                enrollmentType: "Company",
                                sessionDate:   sc.session?.date,
                                startTime:     sc.session?.startTime,
                                endTime:       sc.session?.endTime,
                                sessionId:     sc.session?._id || "",
                                quantity:      sc.quantity,
                                paymentMethod: paymentData.paymentMethod || "Bank Transfer",
                            })
                        })
                    ))

                    navigate("/booking-success", {
                        state: {
                            selectedCourses,
                            coursePrice,
                            paymentMethod: paymentData.paymentMethod || "Bank Transfer",
                            email: paymentData.email,
                            name: paymentData.name,
                            enrollmentType: "company",
                            generatedLinks,
                        }
                    })
                } catch (err) {
                    alert(err.message)
                } finally {
                    setIsProcessing(false)
                }
                return
            }

            // ✅ ============================================================
            // ✅ CARD PAYMENT FLOW (individual + company booking links)
            // ✅ ============================================================
            const isCardPayment =
                paymentData.paymentMethod === "Card Payment" ||
                cardPaymentRef.current.paymentMethod === "Card Payment"

            if (isCardPayment) {
                setIsProcessing(true)
                try {
                    let paymentResult = { success: true, transactionId: paymentData.ewayTransactionId || "" }

                    if (paymentData.paymentConfirmed && paymentData.ewayTransactionId) {
                        // Card already charged — do not run payment again on Continue.
                        paymentResult = {
                            success: true,
                            transactionId: paymentData.ewayTransactionId,
                        }
                    } else if (typeof cardPaymentRef.current.trigger === "function") {
                        paymentResult = await cardPaymentRef.current.trigger()
                    } else {
                        throw new Error("Payment form is not ready. Please wait a moment and try again.")
                    }

                    if (!paymentResult?.success) {
                        alert(paymentResult?.message || "Card payment failed. Please check your details and try again.")
                        return
                    }

                    const txId = paymentResult.transactionId || paymentData.ewayTransactionId || ""

                    let slipUrl = "";
                    const flowId = localStorage.getItem("flowId");
                    if (!flowId) {
                        const upsert = await upsertStudentForBooking({ txId });
                        slipUrl = upsert.slipUrl;
                        await createFlow(slipUrl, txId);
                    }

                    // ✅ Token use — company link வழியா வந்தா
                    const token = searchParams.get("token")
                    if (token) {
                        await fetch(`${API_URL}/api/course-links/use/${token}`, {
                            method: "PATCH"
                        })
                    }
                    await sendBookingEmail(txId);

                    setStep(3);
                } catch (err) {
                    alert(err.message || "Something went wrong after payment. Please contact support.");
                } finally {
                    setIsProcessing(false)
                }
                return;
            }

            // ✅ ============================================================
            // ✅ BANK TRANSFER / PAY LATER (INDIVIDUAL / COMPANY BOOKING LINK)
            // ✅ ============================================================
            setTriggerValidation(true);
            if (!isPaymentValid) return;

            setIsProcessing(true)
            try {
                let slipUrl = "";
                const flowId = localStorage.getItem("flowId");
                if (!flowId) {
                    const upsert = await upsertStudentForBooking();
                    slipUrl = upsert.slipUrl;
                    await createFlow(slipUrl);
                }

                // ✅ Token use — company link வழியா வந்தா
                const token = searchParams.get("token")
                if (token) {
                    await fetch(`${API_URL}/api/course-links/use/${token}`, {
                        method: "PATCH"
                    })
                }
                await sendBookingEmail();

                setStep(3);
            } catch (err) {
                alert(err.message || "Enrollment could not be completed. Please try again.");
            } finally {
                setIsProcessing(false)
            }
            return;
        }

        // ✅ ============================================================
        // ✅ STEP 4 ENROLLMENT FORM SUBMISSION
        // ✅ ============================================================
        if (step === 4) {
            if (enrollSection === 5) {
                if (!enrollRef.current) return;
                const error = await enrollRef.current.submitForm();
                if (error) { alert(error); return; }
                navigate("/booking-success", {
                    state: {
                        email: paymentData.email || userDetails.email,
                        name: paymentData.name || userDetails.name,
                        phone: paymentData.phone || userDetails.phone,
                        selectedCourse,
                        coursePrice,
                        paymentMethod: paymentData.paymentMethod,
                        enrollmentType: isCompanyEnroll ? "company" : "individual",
                        bookingId: localStorage.getItem("flowId") || "",
                    }
                });
                return;
            }
            setEnrollSection(prev => prev + 1);
            return;
        }

        // ✅ ============================================================
        // ✅ STEP NAVIGATION
        // ✅ ============================================================
        if (isCompanyEnroll && step === 2) {
            setStep(3);
        } else if (step < totalSteps) {
            setStep(prev => prev + 1);
        }
    }

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [step])

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [enrollSection])

    // ✅ Token loading screen
    if (tokenLoading) return (
        <section className="enroll-page">
            <div className="enroll-card" style={{ textAlign: "center", padding: 40 }}>
                <p>Validating your enrollment link...</p>
            </div>
        </section>
    )

    // ✅ Token expired screen
    if (tokenError === "expired") return (
        <section className="enroll-page">
            <div className="enroll-card" style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
                <h2 style={{ color: colors.error, marginBottom: 8 }}>Link Expired</h2>
                <p style={{ color: colors.textFaint, marginBottom: 4 }}>
                    All enrollment slots for this course have been filled.
                </p>
                <p style={{ color: colors.textFaint }}>
                    Please contact your company administrator for assistance.
                </p>
            </div>
        </section>
    )

    // ✅ Token invalid screen
    if (tokenError === "invalid") return (
        <section className="enroll-page">
            <div className="enroll-card" style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>❌</div>
                <h2 style={{ color: colors.error, marginBottom: 8 }}>Invalid Link</h2>
                <p style={{ color: colors.textFaint }}>This enrollment link is not valid.</p>
            </div>
        </section>
    )

    if (enrollmentLinkLoading) return (
        <section className="enroll-page">
            <div className="enroll-card" style={{ textAlign: "center", padding: 40 }}>
                <p>Validating your enrollment link...</p>
            </div>
        </section>
    )

    if (enrollmentLinkError) return (
        <section className="enroll-page">
            <div className="enroll-card" style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>❌</div>
                <h2 style={{ color: colors.error, marginBottom: 8 }}>Enrollment Link Error</h2>
                <p style={{ color: colors.textFaint }}>{enrollmentLinkError}</p>
            </div>
        </section>
    )

    if (isLoading) return <div>Loading...</div>;

   return (
    <section className="enroll-page">

        {/* ============================================================
            PAGE HEADER
        ============================================================ */}
        {step !== 3 && (
            <div className="book-page-header">

                <div className="book-header-content">
                    <h4 className="book-main-title">
                        Book Your <span>Course</span>
                        <span className="title-sparkle">✦</span>
                    </h4>

                    <p className="book-main-subtitle">
                        Complete all steps to book your course and start your learning journey
                    </p>
                </div>
            </div>
        )}

        {/* ============================================================
            MAIN CONTENT
        ============================================================ */}
        <div className="book-content-wrapper">

            {/* BACK HOME BUTTON */}
            {step !== 3 && (
                <button
                    type="button"
                    className="book-home-button"
                    onClick={() => navigate("/")}
                >
                    <FiHome size={17} />
                    <span>Back to Home</span>
                </button>
            )}

            {/* ========================================================
                BOOKING CARD
            ======================================================== */}
            <div className={`enroll-card ${step === 3 ? "success-card" : ""}`}>

                {/* ====================================================
                    STEPPER
                ==================================================== */}
                {step !== 3 && (
                    <div className="booking-stepper">

                        {/* STEP 1 */}
                        <div className="booking-step-item">

                            <div
                                className={`booking-step-circle ${
                                    step >= 1 ? "active" : ""
                                }`}
                            >
                                <FiBookOpen size={20} />
                            </div>

                            <div className="booking-step-info">
                                <div className="booking-step-title">
                                    <span className="step-number">1</span>
                                    <span>Course Selection</span>
                                </div>

                                <div className="booking-step-description">
                                    Choose your course
                                </div>
                            </div>
                        </div>

                        {/* PROGRESS LINE */}
                        <div className="booking-progress-container">
                            <div className="booking-progress-background">
                                <div
                                    className="booking-progress-fill"
                                    style={{
                                        width: `${Math.min(progress, 100)}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* STEP 2 */}
                        <div className="booking-step-item">

                            <div
                                className={`booking-step-circle ${
                                    step >= 2 ? "active" : ""
                                }`}
                            >
                                <FiCreditCard size={20} />
                            </div>

                            <div className="booking-step-info">
                                <div className="booking-step-title">
                                    <span className="step-number">2</span>
                                    <span>Payment & Confirmation</span>
                                </div>

                                <div className="booking-step-description">
                                    Secure your seat
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ====================================================
                    CONTENT
                ==================================================== */}

                <div className="booking-content">

                    {/* STEP 1 */}
                    {step === 1 && (
                        <CourseSelection
                            enrollmentType={enrollmentType}
                            setEnrollmentType={setEnrollmentType}
                            selectedSession={selectedSession}
                            setSelectedSession={setSelectedSession}
                            selectedCourse={selectedCourse}
                            setSelectedCourse={setSelectedCourse}
                            hideEnrollmentType={hideEnrollmentType}
                            selectedCourses={selectedCourses}
                            setSelectedCourses={setSelectedCourses}
                            isCompanyEnroll={isCompanyEnroll}
                            bookingLinkData={
                                searchParams.get("token")
                                    ? tokenData
                                    : null
                            }
                        />
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <Payment
                            selectedCourse={selectedCourse}
                            selectedCourses={selectedCourses}
                            isCompany={isCompany}
                            coursePrice={coursePrice}
                            setUserDetails={setUserDetails}
                            enrollmentType={enrollmentType}
                            setEnrollmentType={setEnrollmentType}
                            selectedSession={selectedSession}
                            setSelectedSession={setSelectedSession}
                            setIsValid={setIsPaymentValid}
                            triggerValidation={triggerValidation}
                            isCompanyEnroll={isCompanyEnroll}
                            setPaymentData={setPaymentData}
                            onEmailStatusChange={setIsEmailTaken}
                            onExistingStudentId={handleExistingStudentId}
                            onCardPayment={(ref) => {
                                cardPaymentRef.current = ref;
                                setActivePaymentMethod(ref.paymentMethod);
                            }}
                            isExistingCompany={isDashboardCompany}
                            initialPaymentData={
                                isStudentPortalAutofill
                                    ? loggedInUser
                                    : isDashboardCompany
                                    ? companyUser
                                    : {}
                            }
                            isEnrollmentLink={isEnrollmentLink}
                            shouldAutofill={isStudentPortalAutofill}
                            tokenData={tokenData}
                            enrollmentLinkData={enrollmentLinkData}
                        />
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <CourseSelectionSuccess
                            enrollmentData={{
                                selectedCourse,
                                courseDate: selectedSession?.date,
                                courseTime: `${selectedSession?.startTime || ""} - ${
                                    selectedSession?.endTime || ""
                                }`,
                                coursePrice,
                                paymentMethod: paymentData.paymentMethod,
                                email: paymentData.email,
                                name: paymentData.name,
                            }}
                        />
                    )}

                    {/* STEP 4 */}
                    {step === 4 && (
                        <EnrollmentRegister
                            ref={enrollRef}
                            userDetails={userDetails}
                            section={enrollSection}
                            setSection={setEnrollSection}
                        />
                    )}

                    {/* =================================================
                        ACTION BUTTONS
                    ================================================= */}
                    {step !== 3 && step !== 4 && (
                        <div
                            className={`booking-actions ${
                                step > 1 ? "with-previous" : ""
                            }`}
                        >

                            {step > 1 && (
                                <button
                                    type="button"
                                    className="booking-previous-btn"
                                    disabled={
                                        step === 4 &&
                                        enrollSection === 1
                                    }
                                    onClick={() => {
                                        if (step === 4) {
                                            if (enrollSection > 1) {
                                                setEnrollSection(
                                                    (prev) => prev - 1
                                                );
                                            }
                                            return;
                                        }

                                        setStep((prev) => prev - 1);
                                    }}
                                >
                                    <FiChevronLeft size={18} />
                                    Previous
                                </button>
                            )}

                            <button
                                type="button"
                                className="booking-next-btn"
                                disabled={
                                    isProcessing ||
                                    (
                                        step === 1 &&
                                        !isMultiCompanyBooking &&
                                        (
                                            !selectedCourse?._id ||
                                            !selectedSession?._id
                                        )
                                    ) ||
                                    (
                                        step === 1 &&
                                        isMultiCompanyBooking &&
                                        (
                                            selectedCourses.length === 0 ||
                                            selectedCourses.some(
                                                (sc) => !sc.session?._id
                                            )
                                        )
                                    ) ||
                                    (
                                        step === 2 &&
                                        isEmailTaken &&
                                        isCompany &&
                                        !enrollId
                                    )
                                }
                                onClick={handleNext}
                            >
                                <span>{getNextLabel()}</span>
                                <FiChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    {/* STEP 4 SUBMIT */}
                    {step === 4 && (
                        <div className="booking-actions">
                            {enrollSection > 1 && (
                                <button
                                    type="button"
                                    className="booking-previous-btn"
                                    onClick={() =>
                                        setEnrollSection(
                                            (prev) => prev - 1
                                        )
                                    }
                                >
                                    <FiChevronLeft size={18} />
                                    Previous
                                </button>
                            )}

                            <button
                                type="button"
                                className="booking-next-btn"
                                onClick={handleNext}
                            >
                                <span>
                                    {enrollSection === 5
                                        ? "Submit"
                                        : "Next"}
                                </span>
                                <FiChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================================
                TRUST FEATURES
            ======================================================== */}
            {step !== 3 && (
                <div className="booking-trust-section">

                    <div className="trust-item">
                        <div className="trust-icon trust-green">
                            <FiShield size={23} />
                        </div>

                        <div className="trust-text">
                            <strong>Secure & Safe</strong>
                            <span>Your data is protected</span>
                        </div>
                    </div>

                    <div className="trust-divider" />

                    <div className="trust-item">
                        <div className="trust-icon trust-blue">
                            <FiClock size={23} />
                        </div>

                        <div className="trust-text">
                            <strong>Instant Access</strong>
                            <span>Start learning right away</span>
                        </div>
                    </div>

                    <div className="trust-divider" />

                    <div className="trust-item">
                        <div className="trust-icon trust-purple">
                            <FiAward size={23} />
                        </div>

                        <div className="trust-text">
                            <strong>Certified</strong>
                            <span>Get recognized</span>
                        </div>
                    </div>

                    <div className="trust-divider" />

                    <div className="trust-item">
                        <div className="trust-icon trust-orange">
                            <FiHeadphones size={23} />
                        </div>

                        <div className="trust-text">
                            <strong>24/7 Support</strong>
                            <span>We're here to help</span>
                        </div>
                    </div>

                </div>
            )}
        </div>

        {/* PROCESSING */}
        {isProcessing && (
            <Loading
                message="Processing your payment"
                sub="Please wait, do not close this page"
            />
        )}
    </section>
);
}

export default BookNow;