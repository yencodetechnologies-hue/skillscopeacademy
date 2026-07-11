import { useEffect, useState } from "react"
import "../../styles/AboutSection.css"
import { API_URL } from "../../data/service"
import { cdnImage } from "../../utils/cdnImage"
import { filterActiveCourses } from "../../utils/courseStatus"
import fallbackWorkersImg from "../../assets/why-choose-workers.png"

const features = [
    {
        icon: "👷",
        title: "Industry-Expert Trainers",
        desc: "Our trainers are current or former industry professionals. Real experience means real-world knowledge you can use from day one.",
    },
    {
        icon: "📍",
        title: "Flexible Delivery",
        desc: "Group bookings, onsite delivery, multi-day packages, and RPL assessments. We come to you, or you come to us.",
    },
    {
        icon: "⚡",
        title: "Same-Day Certificates",
        desc: "Same-day digital certificates for most courses. Workers back on site without delay, documentation in hand.",
    },
]

function AboutSection() {
    const [visualImage, setVisualImage] = useState(null)

    useEffect(() => {
        let cancelled = false

        fetch(`${API_URL}/api/courses?status=Active`)
            .then((res) => res.json())
            .then((data) => {
                if (cancelled) return
                const list = filterActiveCourses(Array.isArray(data) ? data : [])
                const withImage = list.find((c) => c?.image)
                if (withImage?.image) {
                    setVisualImage(cdnImage(withImage.image, { w: 700 }))
                }
            })
            .catch(() => {
                // keep fallback image on failure
            })

        return () => {
            cancelled = true
        }
    }, [])

    return (
        <section className="whychoose">
            <div className="whychoose-container">
                <div className="wc-layout">

                    {/* ── LEFT: text + 3-col cards ── */}
                    <div className="wc-left">
                        <p className="wc-subtitle">Why Choose Us</p>
                        <h2 className="wc-title">Trusted by 10,000+ Workers Across Australia</h2>
                        <p className="wc-desc">
                            Practical training that meets the standards employers and regulators expect.
                        </p>

                        <div className="wc-features">
                            {features.map((f, i) => (
                                <div key={i} className="wc-feature-card">
                                    <div className="wc-feature-icon">{f.icon}</div>
                                    <h4 className="wc-feature-title">{f.title}</h4>
                                    <p className="wc-feature-desc">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT: image ── */}
                    <div className="wc-right">
                        <div className="wc-img-wrap">
                            <img
                                src={visualImage || fallbackWorkersImg}
                                alt="SkillScope Academy safety training workers on site"
                                className="wc-img"
                            />
                            <div className="wc-badge">
                                <span className="wc-badge-num">10,000+</span>
                                <span className="wc-badge-label">Workers Trained</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default AboutSection