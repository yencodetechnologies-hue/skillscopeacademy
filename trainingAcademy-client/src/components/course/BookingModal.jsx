import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./BookingModal.css"

export function getBookingType(course) {
    const pt = course?.pricingType || (course?.experienceBasedBooking ? "experience" : "standard")
    if (pt === "experience") return "experience"
    if (pt === "slbl" || course?.slblPrice) return "slbl"

    const bypassKeywords = ["excavator", "haul truck", "skid steer"]
    const isBypass = bypassKeywords.some(kw => course?.title?.toLowerCase().includes(kw))
    if (isBypass) return "experience"
    
    return "standard"
}

export function getBookingOptions(course) {
    const type = getBookingType(course)

    if (type === "experience") {
        return [
            {
                id: "with-experience",
                label: "With Experience",
                price: course.withExperiencePrice || course.comboPrice || course.sellingPrice,
                originalPrice: course.withExperienceOriginal || course.originalPrice,
                dur: course.duration || "1 day",
                description: "Already have experience in this field",
                isVoc: false,
            },
            {
                id: "without-experience",
                label: "Without Experience",
                price: course.withoutExperiencePrice || course.comboPrice || course.sellingPrice,
                originalPrice: course.withoutExperienceOriginal || course.originalPrice,
                dur: course.duration || "1 day",
                description: "No prior experience needed",
                isVoc: false,
            },
            {
                id: "voc",
                label: "VOC ",
                price: course.vocPrice || course.sellingPrice,
                originalPrice: course.withoutExperienceOriginal || course.originalPrice,
                dur: "Half day",
                description: "Recognition of prior learning",
                isVoc: true,
            },
        ]
    }

    if (type === "slbl") {
        return [
            {
                id: "slbl",
                label: "SL + BL",
                price: course.slblPrice,
                originalPrice: course.slblStrikePrice,
                dur: course.duration || "1 day",
                description: "Slewing & non-slewing combined",
                isVoc: false,
            },
            {
                id: "sl",
                label: "SL or BL",
                price: course.slSinglePrice || course.sellingPrice,
                originalPrice: course.slSingleStrikePrice || course.originalPrice,
                dur: course.duration || "1 day",
                description: "Single licence — SL or BL",
                isVoc: false,
            },
            {
                id: "voc",
                label: "VOC",
                price: course.vocPrice || course.sellingPrice,
                originalPrice: course.slSingleStrikePrice || course.originalPrice,
                dur: "Half day",
                description: "Recognition of prior learning",
                isVoc: true,
            },
        ]
    }

    return [
        {
            id: "standard",
            label: "Standard",
            price: course.sellingPrice,
            originalPrice: course.originalPrice,
            dur: course.duration || "1 day",
            description: "Full course enrollment",
            isVoc: false,
        },
        {
            id: "voc",
            label: "VOC ",
            price: course.vocPrice || course.sellingPrice,
            originalPrice: course.originalPrice,
            dur: "Half day",
            description: "Recognition of prior learning",
            isVoc: true,
        },
    ]
}


export default function BookingModal({ course, onClose, initialSelection = null, extraQueryParams = "" }) {
    const navigate = useNavigate()
    const options  = getBookingOptions(course)
    const [selected, setSelected] = useState(initialSelection)
    const [shake,    setShake]    = useState(false)
    const [showErr,  setShowErr]  = useState(false)



    if (!course) return null;
    const selectedOption = options.find(o => o.id === selected)

    const handleConfirm = () => {
        if (!selected) {
            setShowErr(true)
            setShake(true)
            setTimeout(() => setShake(false), 400)
            return
        }
        
        const base = course.slug
            ? `/book-now/course/${course.slug}`
            : `/book-now?courseId=${course._id}`

        const join = (qs) => {
            const hasQ = base.includes("?")
            const sep = hasQ ? "&" : "?"
            const params = [qs, extraQueryParams.replace(/^&/, "")].filter(Boolean).join("&")
            return params ? `${base}${sep}${params}` : base
        }

        const routes = {
            "with-experience":    join("type=with-experience"),
            "without-experience": join("type=without-experience"),
            "slbl":               join("type=slbl"),
            "sl":                 join("type=sl"),
            "bl":                 join("type=bl"),
            "voc":                `/voc?courseId=${course._id}${extraQueryParams.startsWith('&') || extraQueryParams.startsWith('?') ? extraQueryParams : (extraQueryParams ? '&' + extraQueryParams : '')}`,
            "standard":           join(""), 
        }
        onClose()
        navigate(routes[selected] || join(""))
    }

    return (
        <div className="cc-modal-overlay" onClick={onClose}>
            <div className={`cc-modal ${shake ? "cc-modal--shake" : ""}`} onClick={e => e.stopPropagation()}>

                <div className="cc-modal-header">
                    <div>
                        <div className="cc-modal-title">{course.title}</div>
                        <div className="cc-modal-sub">Select your booking option</div>
                    </div>
                    <button className="cc-modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="cc-modal-options">
                    {options.map(opt => {
                        const saving = opt.originalPrice && opt.originalPrice > opt.price
                            ? opt.originalPrice - opt.price : null
                        return (
                            <div
                                key={opt.id}
                                className={`cc-modal-option ${selected === opt.id ? "cc-modal-option--active" : ""} ${showErr && !selected ? "cc-modal-option--error" : ""}`}
                                onClick={() => {
                                    setSelected(opt.id)
                                    setShowErr(false)
                                    setShake(false)
                                }}
                            >
                                <div className="cc-mo-left">
                                    <div className="cc-mo-radio">
                                        {selected === opt.id && <div className="cc-mo-radio-dot" />}
                                    </div>
                                    <div>
                                        <div className="cc-mo-label">{opt.label}</div>
                                        <div className="cc-mo-desc">{opt.description}</div>
                                    </div>
                                </div>
                                <div className="cc-mo-right">
                                    <div className="cc-mo-price">${opt.price}</div>
                                    {opt.originalPrice && opt.originalPrice > opt.price && (
                                        <div className="cc-mo-was">${opt.originalPrice}</div>
                                    )}
                                    {saving && (
                                        <div className="cc-mo-save">Save ${saving}</div>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {showErr && !selected && (
                        <div className="cc-modal-err">
                            <i className="fa-solid fa-triangle-exclamation" />
                            Please select an option to continue
                        </div>
                    )}
                </div>

                <div className="cc-modal-footer">
                    <div className="cc-modal-total">
                        <span>Total</span>
                        <strong>{selectedOption ? `$${selectedOption.price}` : "—"}</strong>
                    </div>
                    <button className="cc-modal-confirm" onClick={handleConfirm}>
                        Book Now {selectedOption ? `— ${selectedOption.label}` : ""}
                        <i className="fa-regular fa-circle-right" />
                    </button>
                    <button className="cc-modal-cancel" onClick={onClose}>Cancel</button>
                </div>

            </div>
        </div>
    )
}
