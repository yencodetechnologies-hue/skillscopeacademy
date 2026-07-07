import "../../styles/EnrollmentSection4.css"
import { useState } from "react"
import { API_URL } from "../../data/service"
import ValidationToast from "./ValidationToast"

const INDIGENOUS_OPTIONS = [
    "Aboriginal but not Torres Strait Islander origin",
    "Torres Strait Islander but not Aboriginal origin",
    "Both Aboriginal and Torres Strait Islander origin",
    "Neither Aboriginal nor Torres Strait Islander origin",
    "Prefer not to say",
]

const DISABILITY_TYPES = [
    "Hearing / deafness",
    "Mental illness",
    "Physical",
    "Acquired brain impairment",
    "Intellectual",
    "Vision",
    "Learning",
    "Medical condition",
]

function EnrollmentSection4({ data, setData, prev, next }) {

    const [errors, setErrors] = useState([])
    const [showToast, setShowToast] = useState(false)
    const [missingFieldsNames, setMissingFieldsNames] = useState([])

    const set = (key, value) => {
        setData(p => ({ ...p, [key]: value }))
        if (errors.includes(key)) {
            setErrors(prev => prev.filter(e => e !== key))
        }
    }

    const toggleDisability = (type) => {
        const current = data.disabilityTypes || []
        if (current.includes(type)) {
            set("disabilityTypes", current.filter(t => t !== type))
        } else {
            set("disabilityTypes", [...current, type])
        }
    }

    const speaksOtherLang = data.speaksOtherLanguage === "yes"
    const hasDisability = data.hasDisability === "yes"

    const handleNext = () => {
        const newErrors = []
        const missingNames = []

        const fieldLabels = {
            countryOfBirth: "Country of Birth",
            speaksOtherLanguage: "Language spoken at home",
            otherLanguage: "Other language",
            indigenousStatus: "Indigenous status",
            hasDisability: "Disability status"
        }

        if (!data.countryOfBirth?.trim()) {
            newErrors.push("countryOfBirth")
            missingNames.push(fieldLabels.countryOfBirth)
        }
        if (!data.speaksOtherLanguage) {
            newErrors.push("speaksOtherLanguage")
            missingNames.push(fieldLabels.speaksOtherLanguage)
        }
        if (speaksOtherLang && !data.otherLanguage?.trim()) {
            newErrors.push("otherLanguage")
            missingNames.push(fieldLabels.otherLanguage)
        }
        if (!data.indigenousStatus) {
            newErrors.push("indigenousStatus")
            missingNames.push(fieldLabels.indigenousStatus)
        }
        if (!data.hasDisability) {
            newErrors.push("hasDisability")
            missingNames.push(fieldLabels.hasDisability)
        }

        if (newErrors.length > 0) {
            setErrors(newErrors)
            setMissingFieldsNames(missingNames)
            setShowToast(true)
            return
        }
        next()
    }

    const closeToastAndScroll = () => {
        setShowToast(false)
        if (errors.length > 0) {
            const firstError = errors[0]
            const el = document.getElementById(`s4-${firstError}`)
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" })
                el.focus()
            }
        }
    }

    return (
        <div className="s4-page">

            {/* SECTION HEADER */}
            <div className="s4-section-header">
                <h2 className="s4-section-header-text">
                    SECTION 4 — ADDITIONAL INFORMATION
                </h2>
            </div>

            {/* MAIN CARD */}
            <div className="s4-card">

                {/* ROW 1 — Country of Birth + Language */}
                <div className="s4-row-2">

                    <div className="s4-field">
                        <label className={`s4-label ${errors.includes("countryOfBirth") ? "s4-label-error" : ""}`}>
                            Country of Birth <span className="s4-required">*</span>
                        </label>
                        <input
                            id="s4-countryOfBirth"
                            className={`s4-input ${errors.includes("countryOfBirth") ? "s4-input-error" : ""}`}
                            value={data.countryOfBirth || ""}
                            onChange={e => set("countryOfBirth", e.target.value)}
                        />
                    </div>

                    <div className="s4-field" id="s4-speaksOtherLanguage">
                        <label className={`s4-label ${errors.includes("speaksOtherLanguage") ? "s4-label-error" : ""}`}>
                            Do you speak a language other than English at home?
                            <span className="s4-required"> *</span>
                        </label>
                        <div className="s4-radio-row">
                            <label className="s4-radio-label">
                                <input
                                    type="radio"
                                    name="s4-language"
                                    value="no"
                                    checked={data.speaksOtherLanguage === "no"}
                                    onChange={() => set("speaksOtherLanguage", "no")}
                                    className="s4-radio"
                                />
                                No
                            </label>
                            <label className="s4-radio-label">
                                <input
                                    type="radio"
                                    name="s4-language"
                                    value="yes"
                                    checked={data.speaksOtherLanguage === "yes"}
                                    onChange={() => set("speaksOtherLanguage", "yes")}
                                    className="s4-radio"
                                />
                                Yes
                            </label>
                        </div>
                    </div>

                </div>

                {/* Language (if Yes) */}
                {speaksOtherLang && (
                    <div className="s4-field s4-field-full">
                        <label className={`s4-label ${errors.includes("otherLanguage") ? "s4-label-error" : ""}`}>
                            Language (if Yes) <span className="s4-required">*</span>
                        </label>
                        <input
                            id="s4-otherLanguage"
                            className={`s4-input-full ${errors.includes("otherLanguage") ? "s4-input-error" : ""}`}
                            value={data.otherLanguage || ""}
                            onChange={e => set("otherLanguage", e.target.value)}
                        />
                    </div>
                )}

                {/* ROW 2 — Indigenous Status + Disability */}
                <div className="s4-row-2" style={{ marginTop: 8 }}>

                    <div className="s4-field">
                        <label className={`s4-label ${errors.includes("indigenousStatus") ? "s4-label-error" : ""}`}>
                            Indigenous Status <span className="s4-required">*</span>
                        </label>
                        <select
                            id="s4-indigenousStatus"
                            className={`s4-select ${errors.includes("indigenousStatus") ? "s4-input-error" : ""}`}
                            value={data.indigenousStatus || ""}
                            onChange={async (e) => {
                                const value = e.target.value
                                set("indigenousStatus", value)

                                // ✅ உடனே save
                                try {
                                    await fetch(`${API_URL}/api/enrollment-form/section`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            studentId: data.userId,
                                            section: 4,
                                            language: {
                                                countryOfBirth: data.countryOfBirth,
                                                otherLanguage: data.otherLanguage,
                                                speaksOtherLanguage: data.speaksOtherLanguage,
                                                indigenousStatus: value,  // ✅ new value
                                            },
                                            specialNeeds: {
                                                hasDisability: data.hasDisability === "yes",
                                                types: data.disabilityTypes,
                                                other: data.disabilityNotes
                                            }
                                        })
                                    })
                                } catch (err) {
                                    console.error("Save error:", err)
                                }
                            }}
                        >
                            <option value="">Select...</option>
                            {INDIGENOUS_OPTIONS.map(opt => (
                                <option key={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div className="s4-field" id="s4-hasDisability">
                        <label className={`s4-label ${errors.includes("hasDisability") ? "s4-label-error" : ""}`}>
                            Do you consider yourself to have a disability, impairment
                            or long-term condition?
                            <span className="s4-required"> *</span>
                        </label>
                        <div className="s4-radio-row">
                            <label className="s4-radio-label">
                                <input
                                    type="radio"
                                    name="s4-disability"
                                    value="no"
                                    checked={data.hasDisability === "no"}
                                    onChange={() => set("hasDisability", "no")}
                                    className="s4-radio"
                                />
                                No
                            </label>
                            <label className="s4-radio-label">
                                <input
                                    type="radio"
                                    name="s4-disability"
                                    value="yes"
                                    checked={data.hasDisability === "yes"}
                                    onChange={() => set("hasDisability", "yes")}
                                    className="s4-radio"
                                />
                                Yes
                            </label>
                        </div>
                    </div>

                </div>

            </div>

            {/* DISABILITY SUPPLEMENT — expand if Yes */}
            {hasDisability && (
                <div className="s4-disability-box">

                    <h4 className="s4-disability-title">Disability Supplement (if Yes)</h4>
                    <p className="s4-disability-hint">Select all that apply.</p>

                    <div className="s4-checkbox-grid">
                        {DISABILITY_TYPES.map(type => (
                            <label key={type} className="s4-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={(data.disabilityTypes || []).includes(type)}
                                    onChange={() => toggleDisability(type)}
                                />
                                {type}
                            </label>
                        ))}
                    </div>

                    <div className="s4-field s4-field-full" style={{ marginTop: 16 }}>
                        <label className="s4-label">Other / Notes</label>
                        <textarea
                            className="s4-textarea"
                            rows={3}
                            placeholder="If you need support adjustments, describe them here."
                            value={data.disabilityNotes || ""}
                            onChange={e => set("disabilityNotes", e.target.value)}
                        />
                    </div>

                </div>
            )}

            <div className="s4-footer">
                <button className="s4-prev-btn" onClick={prev}>
                    Previous
                </button>
                <button className="s4-next-btn" onClick={handleNext}>
                    Next
                </button>
            </div>

            <ValidationToast 
                show={showToast} 
                onOk={closeToastAndScroll} 
                missingFields={missingFieldsNames} 
            />

        </div>
    )
}

export default EnrollmentSection4