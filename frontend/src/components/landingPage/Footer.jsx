import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "../../styles/Footer.css"
import logo from "../../assets/staLogo.png"
import FooterMobile from "../mobile/components/FooterMobile"
import { API_URL } from "../../data/service"
import { filterActiveCourses } from "../../utils/courseStatus"
import { ORG_PHONE_1300, ORG_PHONE_MOBILE } from "../../utils/organizationPhones"

// Quick-link routes that actually exist in App.jsx. We dropped the dead
// /upcoming-dates, /voc-rpl, and /faqs paths and remapped to the closest
// real routes so footer clicks never 404.
const quickLinks = [
    { label: "Home",            path: "/" },
    { label: "VOC",             path: "/voc" },
    { label: "Book Now",        path: "/book-now" },
    { label: "About Us",        path: "/about" },
    { label: "Contact Us",      path: "/contact" },
    { label: "FAQs",            path: "/about" },
]

// Accreditation badges are credentials, not links — render as plain text.
const accredLabels = [
    "",
    "SafeWork NSW Approved",
    "Nationally Recognised Training",
]

const socialLinks = [
    { label: "Facebook",  icon: "fa-brands fa-facebook-f", url: "https://facebook.com" },
    { label: "Instagram", icon: "fa-brands fa-instagram",  url: "https://instagram.com" },
    { label: "LinkedIn",  icon: "fa-brands fa-linkedin-in", url: "https://linkedin.com" },
]

function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(
        () => window.innerWidth <= breakpoint
    )
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth <= breakpoint)
        window.addEventListener("resize", handler)
        return () => window.removeEventListener("resize", handler)
    }, [breakpoint])
    return isMobile
}

function Footer({ courses }) {
    const navigate  = useNavigate()
    const isMobile  = useIsMobile()

    // Stabilise the prop. `courses` defaulting to `[]` in the signature
    // would create a NEW array reference every render, which would make
    // the effect below re-fire on every render → setState → render →
    // effect → render… an infinite fetch loop. Using `useMemo` we get a
    // single stable reference per actual prop change.
    const parentCourses = useMemo(
        () => (Array.isArray(courses) ? courses : []),
        [courses]
    )
    const hasParentCourses = parentCourses.length > 0

    // If the parent didn't pass `courses` (most pages don't) we fetch our
    // own copy so the Courses column is always populated.
    const [fetchedCourses, setFetchedCourses] = useState([])
    const [loading, setLoading] = useState(!hasParentCourses)

    useEffect(() => {
        // The parent already supplied data — nothing to fetch.
        if (hasParentCourses) {
            setLoading(false)
            return
        }
        let alive = true
        axios.get(`${API_URL}/api/courses?status=Active`)
            .then(res => {
                if (!alive) return
                const list = filterActiveCourses(res.data)
                setFetchedCourses(list)
            })
            .catch(() => { if (alive) setFetchedCourses([]) })
            .finally(() => { if (alive) setLoading(false) })
        return () => { alive = false }
        // Depend on the boolean (a primitive), not on the array ref.
        // This guarantees one request per mount, regardless of how many
        // times the parent re-renders.
    }, [hasParentCourses])

    // Active courses, capped at 5 — gives every footer page the "any 5"
    // dynamic list the user asked for.
    const sourceCourses = hasParentCourses ? parentCourses : fetchedCourses
    const footerCourses = filterActiveCourses(sourceCourses)
        .filter((c) => c?.title)
        .slice(0, 5)

    const goToCourse = (course) => {
        const slug = course.slug || String(course.title || "").toLowerCase().replace(/\s+/g, "-")
        navigate(`/course/${slug}`)
    }

    if (isMobile) {
        return <FooterMobile courses={sourceCourses} />
    }

    return (
        <footer className="footer">

            {/* TOP GRADIENT BAR */}
            <div className="footer-top-bar" />

            {/* MAIN GRID */}
            <div className="footer-grid">

                {/* BRAND COL */}
                <div className="footer-brand-col">
                    <div className="footer-logo-wrap">
                        
                        <div className="footer-logo-text">
                            Safeticks
                        </div>
                    </div>

                 

                    <div className="footer-contact-list">
                        <div className="footer-contact-item">
                            <i className="fa-solid fa-location-dot" />
                            <span>15/3 Lancaster Street Ingleburn NSW 2565</span>
                        </div>
                        <div className="footer-contact-item">
                            <a href="mailto:info@safeticks.com" style={{ color: "inherit", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                                <i className="fa-solid fa-envelope" />
                                <span>info@safeticks.com</span>
                            </a>
                        </div>
                        <div className="footer-contact-item">
                            <i className="fa-solid fa-phone" />
                            <span style={{ display: "flex", gap: "4px" }}>
                                <a href={ORG_PHONE_MOBILE.tel} style={{ color: "inherit", textDecoration: "none" }}>{ORG_PHONE_MOBILE.display}</a>
                                &nbsp;·&nbsp;
                                <a href={ORG_PHONE_1300.tel} style={{ color: "inherit", textDecoration: "none" }}>{ORG_PHONE_1300.display}</a>
                            </span>
                        </div>
                    </div>

                    <div className="footer-socials">
                        {socialLinks.map((s, i) => (
                            <a key={i} href={s.url} target="_blank" rel="noreferrer"
                                className="footer-social-btn" aria-label={s.label}>
                                <i className={s.icon} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* COURSES COL */}
                <div className="footer-col">
                    <div className="footer-col-title">Courses</div>
                    {loading && footerCourses.length === 0 ? (
                        // Lightweight skeleton placeholders while courses are loading.
                        Array.from({ length: 5 }).map((_, i) => (
                            <span
                                key={`sk-${i}`}
                                className="footer-link"
                                style={{
                                    display: "inline-block",
                                    width: "70%",
                                    height: 12,
                                    background: "rgba(255,255,255,0.12)",
                                    borderRadius: 6,
                                    margin: "6px 0",
                                }}
                                aria-hidden="true"
                            />
                        ))
                    ) : footerCourses.length === 0 ? (
                        <span className="footer-link" style={{ opacity: 0.7 }}>
                            No courses available
                        </span>
                    ) : (
                        footerCourses.map(c => (
                            <span
                                key={c._id}
                                className="footer-link"
                                onClick={() => goToCourse(c)}
                            >
                                {c.title}
                            </span>
                        ))
                    )}
                    <span className="footer-link footer-link--highlight"
                        onClick={() => navigate("/all-courses")}>
                        View all courses →
                    </span>
                </div>

                {/* QUICK LINKS COL */}
                <div className="footer-col">
                    <div className="footer-col-title">Quick Links</div>
                    {quickLinks.map((l, i) => (
                        <span key={i} className="footer-link"
                            onClick={() => navigate(l.path)}>
                            {l.label}
                        </span>
                    ))}
                </div>

                {/* ACCREDITATION + FOLLOW US COL */}
                <div className="footer-col">
                    <div className="footer-col-title">Accreditation</div>
                    {accredLabels.map((label, i) => (
                        <span
                            key={i}
                            className="footer-link footer-link--static"
                            style={{ cursor: "default" }}
                        >
                            {label}
                        </span>
                    ))}

                </div>

            </div>

            <div className="footer-bottom">
                <span className="footer-bottom-text">
                    © 2024 SafeTicks. All rights reserved.
                    ABN 45234 · safeticks.com.au
                </span>
             
            </div>

        </footer>
    )
}
 
export default Footer