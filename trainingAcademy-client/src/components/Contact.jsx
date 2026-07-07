import "../styles/Contact.css"
import TopNav from "../components/landingPage/TopNav"
import TrustBar from "../components/landingPage/TrustBar"
import PublicNavbar from "../components/PublicNavbar"
import Footer from "../components/landingPage/Footer"
import { useState } from "react"
import { Link } from "react-router-dom"
import contactImg from "../assets/Contact-Us.jpg"  // replace with your image
import { ORG_PHONE_1300, ORG_PHONE_MOBILE } from "../utils/organizationPhones"

const TRAINING_LIST = [
    "Work Safely at Heights Training",
    "Confined Space Certification Training",
    "Forklift Truck Safety Training",
    "Boom Type EWP Over 11m Certification Training",
    "Excavator Operator Training",
    "Skid Steer Short Course Training",
    "Construction Work Safety Training (White Card)",
    "EWP Operator Training",
    "Telehandler Gold Card Training",
    "Earthmoving Courses",
]

function ContactPage() {

    const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" })
    const [submitted, setSubmitted] = useState(false)

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

    const handleSubmit = () => {
        if (!form.name || !form.email || !form.phone || !form.message) {
            alert("Please fill in all required fields.")
            return
        }
        setSubmitted(true)
    }

    return (
        <div className="cp-page">
            <TopNav />
            <PublicNavbar />

            {/* ── HERO ── */}
            <section className="cp-hero">
                
                <h1 className="cp-hero-title">
                    Contact <span className="cp-cyan">Us</span>
                </h1>
                <p className="cp-hero-sub">
                    We're here to answer your questions and help you get started
                </p>
            </section>

            {/* ── HELP SECTION ── */}
            <section className="cp-help">
                <div className="cp-help-inner">

                    <div className="cp-help-img-wrap">
                        <img src={contactImg} alt="Safety trainer" className="cp-help-img" />
                    </div>

                    <div className="cp-help-content">
                        <h2 className="cp-help-title">
                            We are here to <span className="cp-cyan">help you</span>
                        </h2>
                        <p className="cp-help-text">
                            If you have any enquiry about our trainings and courses, want to know
                            about group booking, do not hesitate to contact us. Call us today or send
                            us an email.
                        </p>

                        <div className="cp-contact-card">
                            <div className="cp-contact-card-icon cp-icon-blue">📞</div>
                            <div>
                                <p className="cp-contact-card-label">Contact Us</p>
                                <span className="cp-contact-card-value">
                                    <a href={ORG_PHONE_1300.tel} style={{ textDecoration: "none", color: "inherit" }}>{ORG_PHONE_1300.display}</a>
                                    <br />
                                    <a href={ORG_PHONE_MOBILE.tel} style={{ textDecoration: "none", color: "inherit", fontSize: "0.9em" }}>{ORG_PHONE_MOBILE.display}</a>
                                </span>
                            </div>
                        </div>

                        <a href="mailto:info@safetytrainingacademy.edu.au" className="cp-contact-card" style={{ textDecoration: "none", color: "inherit" }}>
                            <div className="cp-contact-card-icon cp-icon-blue">✉️</div>
                            <div>
                                <p className="cp-contact-card-label">Our Email</p>
                                <span className="cp-contact-card-link">
                                    info@safetytrainingacademy.edu.au
                                </span>
                            </div>
                        </a>
                    </div>

                </div>
            </section>

            {/* ── TRAINING + FORM SECTION ── */}
            <section className="cp-form-section">
                <div className="cp-form-inner">

                    {/* Left — Training list */}
                    <div className="cp-training-box">
                        <div className="cp-training-header">
                            <h3 className="cp-training-title">Our Training</h3>
                        </div>
                        <div className="cp-training-list">
                            {TRAINING_LIST.map((t, i) => (
                                <div key={i} className="cp-training-item">
                                    <a href="#" className="cp-training-link">{t}</a>
                                </div>
                            ))}
                        </div>

                        <div className="cp-address-block">
                            <p className="cp-address-name">Safety Training Academy | Sydney</p>
                            <p className="cp-address-line">3/14-16 Marjorie Street, Sefton NSW 2162</p>
                            <a
                                href="https://maps.google.com/?q=3/14-16+Marjorie+Street+Sefton+NSW+2162"
                                target="_blank"
                                rel="noreferrer"
                                className="cp-direction-btn"
                            >
                                📍 CLICK FOR DIRECTION &nbsp; Find Us on Map
                            </a>
                        </div>
                    </div>

                    {/* Right — Enquiry form */}
                    <div className="cp-form-box">
                        {submitted ? (
                            <div className="cp-success">
                                <span className="cp-success-icon">✅</span>
                                <h3>Thank you!</h3>
                                <p>We'll get back to you as soon as possible.</p>
                            </div>
                        ) : (
                            <>
                                <p className="cp-form-intro">
                                    Fill in the form below with your enquiry and submit.
                                    We do our best to reply at our earliest.
                                </p>
                                <p className="cp-form-note">
                                    Fields marked with an <span className="cp-req">*</span> are required
                                </p>

                                <div className="cp-field">
                                    <label className="cp-label">Name <span className="cp-req">*</span></label>
                                    <input className="cp-input" placeholder="Your full name" value={form.name} onChange={e => set("name", e.target.value)} />
                                </div>

                                <div className="cp-field">
                                    <label className="cp-label">Email <span className="cp-req">*</span></label>
                                    <input className="cp-input" type="email" placeholder="your.email@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                                </div>

                                <div className="cp-field">
                                    <label className="cp-label">Phone <span className="cp-req">*</span></label>
                                    <input className="cp-input" placeholder="Your phone number" value={form.phone} onChange={e => set("phone", e.target.value)} />
                                </div>

                                <div className="cp-field">
                                    <label className="cp-label">Message <span className="cp-req">*</span></label>
                                    <textarea className="cp-textarea" rows={5} placeholder="Your message or enquiry..." value={form.message} onChange={e => set("message", e.target.value)} />
                                </div>

                                <button className="cp-submit-btn" onClick={handleSubmit}>
                                    Submit &nbsp; ➤
                                </button>
                            </>
                        )}
                    </div>

                </div>
            </section>

            {/* ── MAP SECTION ── */}
            <section className="cp-map-section">
                <div className="cp-map-badge">
                    <span>📍</span> Find Us
                </div>
                <h2 className="cp-map-title">
                    Visit Our <span className="cp-cyan">Training Center</span>
                </h2>
                <p className="cp-map-sub">3/14-16 Marjorie Street, Sefton NSW 2162, Australia</p>

                <div className="cp-map-wrap">
                    <iframe
                        title="STA Location"
                        className="cp-map-iframe"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3311.7!2d151.0333!3d-33.9167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12bb4e8b5b5b5b%3A0x0!2s3%2F14-16+Marjorie+St%2C+Sefton+NSW+2162!5e0!3m2!1sen!2sau!4v1"
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>

                {/* Info cards */}
                <div className="cp-info-cards">
                    <div className="cp-info-card">
                        <div className="cp-info-icon cp-icon-cyan">📍</div>
                        <h4 className="cp-info-title">Address</h4>
                        <p className="cp-info-text">3/14-16 Marjorie Street</p>
                        <p className="cp-info-text">Sefton NSW 2162</p>
                    </div>
                    <div className="cp-info-card">
                        <div className="cp-info-icon cp-icon-blue">📞</div>
                        <h4 className="cp-info-title">Phone</h4>
                        <p className="cp-info-text">
                            <a href={ORG_PHONE_1300.tel} style={{ color: "inherit", textDecoration: "none" }}>{ORG_PHONE_1300.display}</a>
                        </p>
                        <p className="cp-info-text">
                            <a href={ORG_PHONE_MOBILE.tel} style={{ color: "inherit", textDecoration: "none" }}>{ORG_PHONE_MOBILE.display}</a>
                        </p>
                    </div>
                    <div className="cp-info-card">
                        <div className="cp-info-icon cp-icon-purple">🕐</div>
                        <h4 className="cp-info-title">Hours</h4>
                        <p className="cp-info-text">Mon - Fri: 8am - 5pm</p>
                        <p className="cp-info-text">Sat: 9am - 2pm</p>
                    </div>
                </div>
            </section>

            {/* ── CTA SECTION ── */}
            <section className="cp-cta">
                <h2 className="cp-cta-title">Ready to Get Started?</h2>
                <p className="cp-cta-sub">
                    Contact us today to discuss your training needs or enroll in one of our courses
                </p>
                <div className="cp-cta-btns">
                    {/* SPA-friendly Link instead of <a> so we don't trigger
                        a full page reload. /courses is the admin-only route;
                        the public listing lives at /all-courses. */}
                    <Link to="/book-now" className="cp-cta-btn cp-cta-white">Enrol Now</Link>
                    <Link to="/all-courses" className="cp-cta-btn cp-cta-outline">View Courses</Link>
                </div>
            </section>

            <Footer />
        </div>
    )
}

export default ContactPage