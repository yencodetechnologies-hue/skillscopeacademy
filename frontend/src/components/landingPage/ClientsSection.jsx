import { useEffect, useState } from "react"
import axios from "axios"
import "../../styles/ClientsSection.css"
import { API_URL } from "../../data/service"
import { cdnImage } from "../../utils/cdnImage"

// Static fallback — used if the /api/partners fetch fails or the admin
// hasn't added any partners yet. Keeps the section from going blank
// during deploys / API outages and matches the original brand mix.
import Accenture from "../../assets/Accenture-Logo.png"
import Deloitte from "../../assets/Deloitte-logo.png"
import EY from "../../assets/Nike-logo.png"
import GoogleCloud from "../../assets/GoogleCloud-logo.png"
import Klaviyo from "../../assets/Klaviyo-logo.png"
import Oracle from "../../assets/Oracle-logo.png"
import Atlassian from "../../assets/Atlasian-logo.png"
import AWS from "../../assets/Aws-logo.png"

const FALLBACK_LOGOS = [
    { img: Accenture,   alt: "Accenture",    link: "" },
    { img: Deloitte,    alt: "Deloitte",     link: "" },
    { img: EY,          alt: "EY",           link: "" },
    { img: GoogleCloud, alt: "Google Cloud", link: "" },
    { img: Klaviyo,     alt: "Klaviyo",      link: "" },
    { img: Oracle,      alt: "Oracle",       link: "" },
    { img: Atlassian,   alt: "Atlassian",    link: "" },
    { img: AWS,         alt: "AWS",          link: "" },
]

function ClientsSection() {
    // null = still loading; [] = loaded but empty (use fallback);
    // Array = loaded with data.
    const [partners, setPartners] = useState(null)

    useEffect(() => {
        let alive = true
        axios
            .get(`${API_URL}/api/partners?active=true`)
            .then((res) => {
                if (!alive) return
                setPartners(Array.isArray(res.data?.data) ? res.data.data : [])
            })
            .catch(() => { if (alive) setPartners([]) })
        return () => { alive = false }
    }, [])

    // Decide which list drives the marquee. Use the dynamic list whenever
    // it has at least one logo; otherwise (loading or empty) fall back to
    // the bundled brand assets so the strip is never blank.
    const usingDynamic = Array.isArray(partners) && partners.length > 0
    const logoNodes = usingDynamic
        ? partners.map((p) => ({
            // Resize via Cloudinary so we ship ~12 KB instead of full-res.
            // 320 ≈ 2x of the 160 px display width for retina screens.
            src: cdnImage(p.imageUrl, { w: 320 }),
            alt: p.name || "partner",
            link: p.link || "",
        }))
        : FALLBACK_LOGOS.map((b) => ({
            src: b.img,
            alt: b.alt,
            link: b.link,
        }))

    return (
        <section className="clients-section">
            <div className="clients-container">
                <h5 className="clients-title">OUR TRUSTED CLIENTS</h5>
            </div>

            <div className="mlp-brands-track-wrap">
                <div className="mlp-brands-track">
                    {/* Duplicated row keeps the marquee seamless when it
                        wraps from 100% → -50%. Keep this in sync with the
                        translate distance in the @keyframes. */}
                    {[...Array(2)].map((_, dupIdx) => (
                        <div key={dupIdx} className="mlp-brands-row">
                            {logoNodes.map((logo, i) => {
                                const inner = (
                                    <img
                                        src={logo.src}
                                        alt={logo.alt}
                                        className="client-logo-img"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                )
                                return (
                                    <div key={i} className="mlp-brand-logo" title={logo.alt}>
                                        {logo.link ? (
                                            <a
                                                href={logo.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}
                                            >
                                                {inner}
                                            </a>
                                        ) : inner}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default ClientsSection
