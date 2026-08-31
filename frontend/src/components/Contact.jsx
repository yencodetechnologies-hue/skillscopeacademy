    import "../styles/Contact.css";
    import axios from "axios";
    import TopNav from "../components/landingPage/TopNav";
    import PublicNavbar from "../components/PublicNavbar";
    import Footer from "../components/landingPage/Footer";
    import { useState } from "react";
    import contactImg from "../assets/Contact-Us.jpg";
    import { ORG_PHONE_1300, ORG_PHONE_MOBILE } from "../utils/organizationPhones";
    import MobileNavbar from "./MobileNavbar";

    const API_URL = import.meta.env.VITE_API_URL;

    const ENQUIRY_TYPES = [
    "Course information & bookings",
    "Group training enquiries",
    "Payment & certificates",
    "General support",
    ];

    const FAQS = [
    {
        icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        ),
        question: "How can I book a course?",
        answer: "You can book online through our Courses page or contact us directly for assistance.",
    },
    {
        icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        ),
        question: "What are your operating hours?",
        answer: "We're open Monday to Friday, 8:30AM – 5:00PM.",
    },
    {
        icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        ),
        question: "Do you offer group training?",
        answer: "Yes! We provide tailored training for businesses and groups. Get in touch for a quote.",
    },
    {
        icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
        </svg>
        ),
        question: "How do I get my certificate?",
        answer: "Certificates are issued upon successful completion of the course.",
    },
    ];

    function ContactPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
        enquiryType: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handleSubmit = async () => {
        if (!form.name || !form.email || !form.phone || !form.message) {
        alert("Please fill in all required fields.");
        return;
        }

        try {
        setSubmitting(true);
        const response = await axios.post(`${API_URL}/api/contact`, {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            message: form.message.trim(),
            ...(form.enquiryType ? { enquiryType: form.enquiryType } : {}),
        });

        if (response.data.success) {
            setSubmitted(true);
            setForm({
            name: "",
            email: "",
            phone: "",
            message: "",
            enquiryType: "",
            });
        }
        } catch (error) {
        console.error("Contact form error:", error.response?.data || error);
        alert(
            error.response?.data?.message ||
            "Unable to submit your enquiry. Please try again."
        );
        } finally {
        setSubmitting(false);
        }
    };

    return (
        <div className="cp-page">
        <div className="site-header">
            <div className="desktop-navbar">
                 <TopNav />
                    <PublicNavbar />
                </div>
                {/* Mobile View */}
                <div className="mobile-navbar">
                    <MobileNavbar />
                </div>
        </div>

        {/* ── HERO SECTION ── */}
        <section className="cp-hero">
            <div className="cp-hero-inner">
        <div className="cp-hero-content">
  <span className="cp-hero-badge">WE'RE HERE TO HELP</span>

  <h1 className="cp-hero-title">
    Contact <span className="cp-orange">Us</span>
  </h1>

  <p className="cp-hero-sub">
    Have questions about our training and courses?
    <br />
    Our team is ready to assist you.
  </p>

  <div className="cp-hero-features">
    {/* 1. Quick Support Icon */}
    <div className="cp-hero-feature">
      <div className="cp-hero-feature-icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
          <path d="M14 22h-3a2 2 0 0 1-2-2"></path>
        </svg>
      </div>
      <div>
        <strong>Quick Support</strong>
        <p>Get fast, friendly help</p>
      </div>
    </div>

    {/* 2. Expert Guidance Icon */}
    <div className="cp-hero-feature">
      <div className="cp-hero-feature-icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      </div>
      <div>
        <strong>Expert Guidance</strong>
        <p>We'll guide you right</p>
      </div>
    </div>

    {/* 3. Operating Hours Icon */}
    <div className="cp-hero-feature">
      <div className="cp-hero-feature-icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>
      <div>
        <strong>Mon – Fri</strong>
        <p>8:30AM – 5:00PM</p>
      </div>
    </div>
  </div>
</div>

            <div className="cp-hero-media">
                <div className="cp-hero-img-wrap">
                <img
                    src={contactImg}
                    alt="Support Specialist"
                    className="cp-hero-img"
                />
                </div>

                <div className="cp-hero-float-card">
                <div className="cp-hero-float-icon">★</div>
                <div>
                    <strong>Trusted by Thousands</strong>
                    <p>Quality training. Real results.</p>
                </div>
                </div>
            </div>
            </div>

            {/* Exact Smooth Orange Curved Line Divider */}
        {/* Exact Smooth Orange Curved Line Divider without Navy underneath */}
            <div className="cp-hero-curve" aria-hidden="true">
            <svg
                viewBox="0 0 1440 90"
                preserveAspectRatio="none"
                className="cp-hero-curve-svg"
            >
                {/* White area underneath the orange line to match page background */}
                <path
                d="M 0,45 C 320,88 620,78 950,42 C 1180,18 1340,18 1440,26 L 1440,90 L 0,90 Z"
                fill="#ffffff"
                />
                {/* Orange line along the boundary */}
                <path
                d="M 0,45 C 320,88 620,78 950,42 C 1180,18 1340,18 1440,26"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeLinecap="round"
                />
            </svg>
            </div>
        </section>

        {/* ── QUICK CONTACT STRIP ── */}
        <section className="cp-strip">
            <div className="cp-strip-inner">
            <div className="cp-strip-item">
                <div className="cp-strip-icon cp-icon-orange">
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C10.61 22 2 13.39 2 3a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.27 1.11l-2.37 2.4z" />
                </svg>
                </div>
                <div>
                <p className="cp-strip-label">Call Us</p>
                <div className="cp-strip-value">
                    <a href={ORG_PHONE_1300?.tel || "tel:1300415252"}>
                    {ORG_PHONE_1300?.display || "1300 415 252"}
                    </a>
                    <br />
                    <a href={ORG_PHONE_MOBILE?.tel || "tel:0481399977"}>
                    {ORG_PHONE_MOBILE?.display || "0481 399 977"}
                    </a>
                </div>
                </div>
            </div>

            <a href="mailto:info@safeticks.com" className="cp-strip-item">
                <div className="cp-strip-icon cp-icon-blue">
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                </div>
                <div>
                <p className="cp-strip-label">Email Us</p>
                <div className="cp-strip-value">info@safeticks.com</div>
                </div>
            </a>

            <div className="cp-strip-item">
                <div className="cp-strip-icon cp-icon-orange">
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                </svg>
                </div>
                <div>
                <p className="cp-strip-label">Visit Us – Sydney</p>
                <div className="cp-strip-value">
                    15/3 Lancaster Street, Ingleburn NSW 2565
                </div>
                </div>
            </div>

            <div className="cp-strip-item">
                <div className="cp-strip-icon cp-icon-blue">
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                </svg>
                </div>
                <div>
                <p className="cp-strip-label">Visit Us – Adelaide</p>
                <div className="cp-strip-value">
                    8 Cord Street, Dudley Park, Adelaide SA 5008, Australia.
                </div>
                </div>
            </div>
            </div>
        </section>

        {/* ── FORM & SIDE INFO SECTION ── */}
        <section className="cp-form-section">
            <div className="cp-form-inner">
            {/* Left Form Box */}
            <div className="cp-form-box">
                {submitted ? (
                <div className="cp-success">
                    <span className="cp-success-icon">✅</span>
                    <h3>Thank you!</h3>
                    <p>We'll get back to you as soon as possible.</p>
                </div>
                ) : (
                <>
                    <h3 className="cp-form-title">Send Us a Message</h3>
                    <p className="cp-form-intro">
                    Fill in the form below and we'll get back to you as soon as possible.
                    </p>

                    <div className="cp-field">
                    <label className="cp-label">
                        Full Name <span className="cp-req">*</span>
                    </label>
                    <input
                        className="cp-input"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                    />
                    </div>

                    <div className="cp-field">
                    <label className="cp-label">
                        Email Address <span className="cp-req">*</span>
                    </label>
                    <input
                        className="cp-input"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                    />
                    </div>

                    <div className="cp-field">
                    <label className="cp-label">Phone Number</label>
                    <input
                        className="cp-input"
                        placeholder="Your phone number"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                    />
                    </div>

                    <div className="cp-field">
                    <label className="cp-label">Enquiry Type</label>
                    <select
                        className="cp-input cp-select"
                        value={form.enquiryType}
                        onChange={(e) => set("enquiryType", e.target.value)}
                    >
                        <option value="">Select enquiry type</option>
                        {ENQUIRY_TYPES.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                        ))}
                    </select>
                    </div>

                    <div className="cp-field">
                    <label className="cp-label">
                        Message <span className="cp-req">*</span>
                    </label>
                    <textarea
                        className="cp-textarea"
                        rows={4}
                        placeholder="Type your message here..."
                        value={form.message}
                        onChange={(e) => set("message", e.target.value)}
                    />
                    </div>

                    <button
                    type="button"
                    className="cp-submit-btn"
                    onClick={handleSubmit}
                    disabled={submitting}
                    >
                    {submitting ? "Sending..." : "Send Message ➔"}
                    </button>

                    <p className="cp-form-privacy">
                    🔒 Your information is safe with us. We respect your privacy.
                    </p>
                </>
                )}
            </div>

            {/* Right Side Cards */}
            <div className="cp-form-side">
                <div className="cp-hear-card">
  <h3 className="cp-hear-title">We'd Love to Hear From You!</h3>
  <p className="cp-hear-text">
    Whether you have a question about a course, need help with bookings, or
    just want to learn more about how we can help you stay safe and certified.
  </p>

  <ul className="cp-hear-list">
    <li>
      <span className="cp-check-badge">✓</span>
      Course information & bookings
    </li>
    <li>
      <span className="cp-check-badge">✓</span>
      Group training enquiries
    </li>
    <li>
      <span className="cp-check-badge">✓</span>
      Payment & certificates
    </li>
    <li>
      <span className="cp-check-badge">✓</span>
      General support
    </li>
  </ul>

  {/* Exact Floating Mail + Paper Plane + Chat Bubble Illustration */}
  <div className="cp-illustration-wrap" aria-hidden="true">
    <svg
      width="150"
      height="140"
      viewBox="0 0 150 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Dashed Flight Trajectory */}
      <path
        d="M 12 110 C -5 85 10 50 35 45 C 55 40 70 65 95 30 C 105 15 118 18 122 18"
        stroke="#3b82f6"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        strokeLinecap="round"
      />

      {/* Blue Paper Plane */}
      <g transform="translate(112, 10) rotate(-10)">
        <path
          d="M 24 2 L 2 12 L 10 16 L 24 2 Z"
          fill="#3b82f6"
          opacity="0.2"
        />
        <path
          d="M 24 2 L 2 12 L 10 16 L 12 24 L 16 18 L 24 2 Z"
          stroke="#38bdf8"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 10 16 L 24 2"
          stroke="#38bdf8"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>

      {/* White Envelope */}
      <g transform="translate(18, 62)">
        {/* Envelope Base Body */}
        <rect
          x="0"
          y="0"
          width="100"
          height="66"
          rx="10"
          fill="#ffffff"
          stroke="#ffffff"
          strokeWidth="2"
        />
        {/* Flap & Inner Fold Lines */}
        <path
          d="M 2 2 L 50 40 L 98 2"
          stroke="#0b1a30"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 2 64 L 38 32"
          stroke="#0b1a30"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 98 64 L 62 32"
          stroke="#0b1a30"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* Orange Chat Bubble with 3 Dots */}
      <g transform="translate(90, 44)">
        {/* Bubble Shape */}
        <path
          d="M 22 0 C 34.15 0 44 8.06 44 18 C 44 27.94 34.15 36 22 36 C 18.5 36 15.2 35.3 12.3 34 C 7.5 37.5 2 38 1 38 C 2.5 34.5 3.2 31.5 3 29 C 1.2 26 0 22.2 0 18 C 0 8.06 9.85 0 22 0 Z"
          fill="#f59e0b"
        />
        {/* 3 White Dots */}
        <circle cx="14" cy="18" r="2.6" fill="#ffffff" />
        <circle cx="22" cy="18" r="2.6" fill="#ffffff" />
        <circle cx="30" cy="18" r="2.6" fill="#ffffff" />
      </g>
    </svg>
  </div>
</div>

<div className="cp-mini-map-card">
              <iframe
                title="Office Location"
                className="cp-mini-map-iframe"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3308.8315181580144!2d150.86241031521295!3d-33.996841280621424!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12ebb69e38d7c9%3A0x8bbba37a4c414603!2s15%2F3%20Lancaster%20St%2C%20Ingleburn%20NSW%202565!5e0!3m2!1sen!2sau!4v1680000000000!5m2!1sen!2sau"
                loading="lazy"
              />
            </div>
            </div>
            </div>
        </section>

        {/* ── FAQ SECTION ── */}
        <section className="cp-faq-section">
            <h2 className="cp-faq-title">
            Frequently Asked <span className="cp-orange">Questions</span>
            <span className="cp-faq-accent-line"></span>
            </h2>

            <div className="cp-faq-grid">
            {FAQS.map((faq) => (
                <div className="cp-faq-card" key={faq.question}>
                <div className="cp-faq-icon">{faq.icon}</div>
                <div className="cp-faq-body">
                    <p className="cp-faq-question">{faq.question}</p>
                    <p className="cp-faq-answer">{faq.answer}</p>
                </div>
                <span className="cp-faq-chevron">⌄</span>
                </div>
            ))}
            </div>
        </section>

        {/* ── STILL HAVE QUESTIONS STRIP ── */}
        <section className="cp-cta-strip">
  <div className="cp-cta-strip-inner">
    <div className="cp-cta-strip-left">
      <div className="cp-cta-headset-circle">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
          <path d="M14 22h-3a2 2 0 0 1-2-2"></path>
        </svg>
      </div>
      <div>
        <strong className="cp-cta-title">Still have questions?</strong>
        <p className="cp-cta-subtitle">Our friendly team is just a call away.</p>
      </div>
    </div>

    <div className="cp-cta-strip-btns">
      {/* Orange Solid Button with White Icon Circle */}
      <a
        href={ORG_PHONE_1300?.tel || "tel:1300415252"}
        className="cp-cta-btn-orange"
      >
        <span className="cp-cta-btn-icon-circle">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="#f59e0b"
          >
            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C10.61 22 2 13.39 2 3a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.27 1.11l-2.37 2.4z" />
          </svg>
        </span>
        Call {ORG_PHONE_1300?.display || "1300 415 252"}
      </a>

      {/* Outlined Dark Button */}
      <a
        href="mailto:info@safeticks.com"
        className="cp-cta-btn-email"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        Email Us
      </a>
    </div>
  </div>
</section>

        <Footer />
        </div>
    );
    }

    export default ContactPage;