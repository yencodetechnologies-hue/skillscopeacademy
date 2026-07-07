import { useNavigate } from "react-router-dom"
import { useState } from "react"
import "../styles/CTABanner.css"
import { ORG_PHONE_1300 } from "../utils/organizationPhones"

function CTABanner() {
    const navigate = useNavigate()
    const [showEnquire, setShowEnquire] = useState(false)

    return (
        <div className="cta-banner">
            <div className="cta-text">
                <h2 className="cta-title">Ready to get certified this week?</h2>
                <p className="cta-sub">
                    Same-week sessions available · Sunday classes · Certificate issued same day
                </p>
            </div>
            <div className="cta-actions">
                <button className="cta-btn-dark" onClick={() => navigate("/book-now")}>
                    Book Now
                </button>
                <button className="cta-btn-dark" onClick={() => setShowEnquire(true)}>
                    Submit Enquiry
                </button>
                <a href={ORG_PHONE_1300.tel} className="cta-btn-white">
                    ☎ Call {ORG_PHONE_1300.display}
                </a>
            </div>
            {showEnquire && (
                <div className="mlp-modal-backdrop" onClick={() => setShowEnquire(false)}>
                    <div className="mlp-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="mlp-modal-header">
                            <span className="mlp-modal-title">Course Enquiry</span>
                            <button className="mlp-modal-close" onClick={() => setShowEnquire(false)}>✕</button>
                        </div>
                        <div className="mlp-modal-body">
                            <div className="mlp-form-row">
                                <input className="mlp-input" type="text" placeholder="Name *" />
                                <input className="mlp-input" type="tel" placeholder="Phone *" />
                            </div>
                            <input className="mlp-input mlp-input-full" type="email" placeholder="Email *" />
                            <input className="mlp-input mlp-input-full" type="text" placeholder="Subject" />
                            <textarea className="mlp-textarea" placeholder="Message" rows={4} />
                            <button
                                className="mlp-modal-send"
                                onClick={() => setShowEnquire(false)}
                            >
                                SEND ✈
                            </button>
                            <div className="mlp-modal-divider" />
                            <p className="mlp-modal-enrol-text">Ready to enrol? Use the buttons below:</p>
                            <div className="mlp-modal-enrol-btns">
                                <a href="/book-now" className="mlp-modal-enrol-btn">ENROL NOW</a>
                                <a href="/voc" className="mlp-modal-voc-btn">VOC</a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CTABanner