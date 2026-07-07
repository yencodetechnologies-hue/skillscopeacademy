import "../styles/About.css"
import TopNav from "../components/landingPage/TopNav"
import TrustBar from "../components/landingPage/TrustBar"
import PublicNavbar from "../components/PublicNavbar"
import Footer from "../components/landingPage/Footer"
import { Link } from "react-router-dom"
import buildingImg from "../assets/Office-in-Sydney.jpg"   // replace with your image
import facilitiesImg from "../assets/Class-in-Sydney.jpg" // replace with your image

const COURSES_LIST = [
    { name: "Forklift Licences", approval: "SafeWork NSW Approval No: RTO 800469" },
    { name: "High risk work (WP) licence", approval: "SafeWork NSW Approval No: RTO 800469" },
    { name: "Elevating Work Platform (EWP) Licences", approval: "SafeWork NSW Approval No: RTO 800469", extra: "– EWPA Yellow Card" },
    { name: "Asbestos Removal Class B & supervisor", approval: "SafeWork NSW Approval No: RTO 800469" },
    { name: "WHS White Card", approval: "SafeWork NSW Approval No: RTO 800469" },
    { name: "Traffic control courses", approval: "SafeWork NSW Approval No: RTO 800469" },
    { name: "Working at Height safety & More" },
]

const WHY_ITEMS = [
    { color: "#22d3ee", icon: "✦", text: <><strong className="ab-cyan">Safety Training Academy training programs</strong> on short courses are not only limited to theory but practical classes that fully train the participants in their specific field.</> },
    { color: "#2563eb", icon: "🎖", text: <>Our trainers have been in the industry for several years, and they are committed, experienced, and extremely qualified in the specific area in which they choose to train and assess.</> },
    { color: "#22c55e", icon: "🛡", text: <><strong>The safety of every student is so important to us</strong> that why we make it our priority. We are located in a well-organized area. We set ourselves apart by ensuring that our students are fully trained.</> },
    { color: "#02afef", icon: "👥", text: <>Our training program full of qualities irrespective of any course you registered for, and we do not just take your money and prepare you to study everything by yourself and fail.</> },
    { color: "#f97316", icon: "📊", text: <>Our equipment for each course is very standard, contributing to the training to be more understandable by every one of our students.</> },
    { color: "#22d3ee", icon: "📞", text: <>Our customer support system is always available to help you 24/7 every day in a week; we will very thrilled to help you. At STA, we stand out of our competitors with our low cost; you can't find any other fee less expensive than us, with our quality training and training equipment.</> },
    { color: "#2563eb", icon: "📍", text: <>Our training location has easy access to public transport without too much stress. And lastly, you can choose to train in your home place and at a convenient time.</> },
]

const MISSION_ITEMS = [
    "Ensure that all of the services are easily affordable, accessible, and meet our clients' needs.",
    "Train clients with the knowledge that shapes and directs their career pathways/or gain employment.",
    "Create a training center that provides an innovative and exciting learning experience for all clients and trainers.",
    "Provide training programs that fulfill industry and employer skills requirements",
    "Provide high-quality services that meet the quality standard of our clients",
]

const VALUES = [
    { icon: "✦", bg: "#22d3ee", title: "Easy Accessibility", text: "Our training services are readily accessible to everyone who needs them." },
    { icon: "🎯", bg: "linear-gradient(135deg,#2563eb,#02afef)", title: "Striving for Excellence", text: "We continually aim for the highest qualities in everything we do.", featured: true },
    { icon: "🎖", bg: "#22d3ee", title: "Highest Quality", text: "An assurance that a person received quality training from us without negative feedback." },
    { icon: "👥", bg: "linear-gradient(135deg,#02afef,#ec4899)", title: "Inclusive", text: "We reflect clients views in our actions and critical thinking to serve betters" },
    { icon: "🛡", bg: "#22c55e", title: "Trustworthy", text: "We are open, honest, and committed to the highest standards of ethical behaviour" },
]

function AboutPage() {
    return (
        <div className="ab-page">
            <TopNav />
            <PublicNavbar />

            {/* ── HERO ── */}
            <section className="ab-hero">
                <div className="ab-hero-badge">RTO #45234 | ASQA Accredited</div>
                <h1 className="ab-hero-title">About <span className="ab-cyan">Us</span></h1>
                <p className="ab-hero-sub">
                    Empowering careers through excellence in vocational education and training
                </p>
            </section>

            {/* ── ABOUT SECTION ── */}
            <section className="ab-about">
                <div className="ab-about-inner">
                    <div className="ab-about-left">
                        <h2 className="ab-about-heading">
                            <span className="ab-cyan">Safety Training Academy</span>{" "}
                            specialises in the delivery of short courses
                        </h2>

                        <div className="ab-about-card">
                            <p className="ab-about-text">
                                <strong>Safety Training Academy</strong> (STA) is a specialty branch of
                                Australian International Education Training which was formed in 2017, who is a{" "}
                                <a href="#" className="ab-link">Registered Training Organisation (RTO)</a> Provider
                                No <strong>45234</strong>) that specialises in the delivery of{" "}
                                <a href="#" className="ab-link">Vocational Education &amp; Training (VET)</a> accredited
                                courses by the <strong>Australian Skills Quality Authority (ASQA)</strong>.
                            </p>

                            <p className="ab-about-subheading">Our short courses are including but not limited to:</p>

                            <div className="ab-courses-list">
                                {COURSES_LIST.map((c, i) => (
                                    <div key={i} className="ab-course-item">
                                        <span className="ab-course-check">✔</span>
                                        <span>
                                            {c.name}
                                            {c.approval && (
                                                <> &nbsp;<span className="ab-approval">({c.approval})</span></>
                                            )}
                                            {c.extra && <span className="ab-extra"> {c.extra}</span>}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="ab-about-right">
                        <div className="ab-building-wrap">
                            <img src={buildingImg} alt="Safety Training Academy building" className="ab-building-img" />
                            <div className="ab-building-caption">
                                📍 Safety Training Academy | Sydney – 3/14-16 Marjorie Street, Sefton NSW 2162
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── WHY CHOOSE US ── */}
            <section className="ab-why">
                <div className="ab-why-inner">
                    <h2 className="ab-why-title">
                        Why Choose <span className="ab-cyan">Safety Training Academy</span>{" "}
                        for short courses in Sydney
                    </h2>

                    <div className="ab-why-content">
                        <div className="ab-why-left">
                            <div className="ab-why-card">
                                {WHY_ITEMS.map((item, i) => (
                                    <div key={i} className="ab-why-item">
                                        <div className="ab-why-icon" style={{ background: item.color }}>
                                            {item.icon}
                                        </div>
                                        <p className="ab-why-text">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="ab-why-right">
                            <div className="ab-facilities-wrap">
                                <img src={facilitiesImg} alt="Training facilities" className="ab-facilities-img" />
                                <div className="ab-facilities-caption">
                                    <strong>Modern Training Facilities</strong>
                                    <p>State-of-the-art equipment and comfortable learning environment</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── VISION & MISSION ── */}
            <section className="ab-vm">
                <div className="ab-vm-inner">
                    <div className="ab-vm-card ab-vision-card">
                        <div className="ab-vm-header ab-vision-header">
                            <span className="ab-vm-icon">👁</span>
                            <h3 className="ab-vm-title">Our Vision</h3>
                        </div>
                        <div className="ab-vm-body">
                            <p className="ab-vm-text">
                                To be a leading provider of nationally recognised vocational education and
                                training solutions that empowers individuals and communities through
                                quality, accessible, and innovative training solutions.
                            </p>
                        </div>
                    </div>

                    <div className="ab-vm-card ab-mission-card">
                        <div className="ab-vm-header ab-mission-header">
                            <span className="ab-vm-icon">🎯</span>
                            <h3 className="ab-vm-title">Our Mission</h3>
                        </div>
                        <div className="ab-vm-body">
                            <p className="ab-vm-text" style={{ marginBottom: 14 }}>
                                Our mission is to provide the highest quality training and to guide our
                                actions and decisions.
                            </p>
                            {MISSION_ITEMS.map((m, i) => (
                                <div key={i} className="ab-mission-item">
                                    <span className="ab-mission-check">✔</span>
                                    <p className="ab-mission-text">{m}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── OUR VALUES ── */}
            <section className="ab-values">
                <div className="ab-values-badge">OUR VALUES</div>
                <h2 className="ab-values-title">
                    What we <span className="ab-cyan">value</span> are:
                </h2>

                <div className="ab-values-grid">
                    {VALUES.map((v, i) => (
                        <div key={i} className={`ab-value-card ${v.featured ? "ab-value-featured" : ""}`}>
                            <div className="ab-value-icon" style={{ background: v.bg }}>
                                {v.icon}
                            </div>
                            <h4 className="ab-value-title">{v.title}</h4>
                            <p className="ab-value-text">{v.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="ab-cta">
                <h2 className="ab-cta-title">Ready to Start Your Journey?</h2>
                <p className="ab-cta-sub">
                    Join thousands of students who have transformed their careers with our
                    nationally recognized training programs
                </p>
                <div className="ab-cta-btns">
                    <Link to="/book-now" className="ab-cta-btn ab-cta-white">Enrol Now</Link>
                    <Link to="/all-courses" className="ab-cta-btn ab-cta-outline">View Courses</Link>
                </div>
            </section>

            <Footer />
        </div>
    )
}

export default AboutPage