import { useEffect, useState } from "react"
import "../../styles/EnrollmentRegister.css"
import ValidationToast from "./ValidationToast"

const STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]

function EnrollmentSection1({ userDetails, data, setData, next }) {
    
    const [errors, setErrors] = useState([])
    const [showToast, setShowToast] = useState(false)
    const [missingFieldsNames, setMissingFieldsNames] = useState([])

    const set = (key, value) => {
        setData(p => ({ ...p, [key]: value }))
        if (errors.includes(key)) {
            setErrors(prev => prev.filter(e => e !== key))
        }
    }

    useEffect(() => {
        if (!userDetails || !userDetails.name) return
        const parts = userDetails.name.trim().split(" ")
        setData(prev => ({
            ...prev,
            givenName: parts[0] || "",
            surname: parts.slice(1).join(" ") || "",
            email: userDetails.email || "",
            mobilePhone: userDetails.phone || userDetails.mobileNumber || userDetails.mobile || ""
        }))
    }, [userDetails])

    const handleNext = () => {
        const required = [
            "title", "surname", "givenName", "dob", "gender",
            "mobilePhone", "email", "residentialAddress",
            "suburb", "state", "postcode"
        ]
        const newErrors = []
        const missingNames = []

        const fieldLabels = {
            title: "Title",
            surname: "Surname",
            givenName: "Given Name",
            dob: "Date of Birth",
            gender: "Gender",
            mobilePhone: "Mobile Phone",
            email: "Email",
            residentialAddress: "Residential Address",
            suburb: "Suburb",
            state: "State",
            postcode: "Postcode"
        }

        for (const field of required) {
            if (!data[field]) {
                newErrors.push(field)
                missingNames.push(fieldLabels[field])
            }
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
            const el = document.getElementById(`er-${firstError}`)
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" })
                el.focus()
            }
        }
    }

    return (
        <div className="er-page">

            <div className="er-section-header">
                <h2 className="er-section-header-text">SECTION 1 — APPLICANT INFORMATION</h2>
            </div>

            <div className="er-card">
                <h3 className="er-card-title">APPLICANT DETAILS</h3>
                <p className="er-card-subtitle">
                    Please complete <strong>full name</strong> and <strong>date of birth</strong> as listed on your ID documents.
                </p>

                <div className="er-field-group" id="er-title">
                    <label className={`er-label ${errors.includes("title") ? "er-label-error" : ""}`}>
                        Title (please tick) <span className="er-required">*</span>
                    </label>
                    <div className="er-radio-row">
                        {["Mr", "Mrs", "Miss", "Ms", "Dr", "Other"].map(t => (
                            <label key={t} className="er-radio-label">
                                <input
                                    type="radio"
                                    name="er-title"
                                    value={t}
                                    checked={data.title === t}
                                    onChange={() => set("title", t)}
                                    className="er-radio"
                                />
                                {t}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="er-row-3">
                    <div className="er-field-group">
                        <label className={`er-label ${errors.includes("surname") ? "er-label-error" : ""}`}>
                            Surname <span className="er-required">*</span>
                        </label>
                        <input
                            id="er-surname"
                            className={`er-input ${errors.includes("surname") ? "er-input-error" : ""}`}
                            value={data.surname || ""}
                            onChange={e => set("surname", e.target.value)}
                        />
                    </div>
                    <div className="er-field-group">
                        <label className={`er-label ${errors.includes("givenName") ? "er-label-error" : ""}`}>
                            Given name <span className="er-required">*</span>
                        </label>
                        <input
                            id="er-givenName"
                            className={`er-input ${errors.includes("givenName") ? "er-input-error" : ""}`}
                            value={data.givenName || ""}
                            onChange={e => set("givenName", e.target.value)}
                        />
                    </div>
                    <div className="er-field-group">
                        <label className="er-label">Middle name</label>
                        <input
                            className="er-input"
                            value={data.middleName || ""}
                            onChange={e => set("middleName", e.target.value)}
                        />
                    </div>
                </div>

                <div className="er-row-3">
                    <div className="er-field-group">
                        <label className="er-label">
                            Preferred name
                            <span className="er-optional-text">(if different to above)</span>
                        </label>
                        <input
                            className="er-input"
                            value={data.preferredName || ""}
                            onChange={e => set("preferredName", e.target.value)}
                        />
                    </div>
                    <div className="er-field-group">
                        <label className={`er-label ${errors.includes("dob") ? "er-label-error" : ""}`}>
                            Date of Birth <span className="er-required">*</span>
                        </label>
                        <input
                            id="er-dob"
                            type="date"
                            className={`er-input ${errors.includes("dob") ? "er-input-error" : ""}`}
                            value={data.dob || ""}
                            onChange={e => set("dob", e.target.value)}
                        />
                    </div>
                    <div className="er-field-group" id="er-gender">
                        <label className={`er-label ${errors.includes("gender") ? "er-label-error" : ""}`}>
                            Gender (please tick) <span className="er-required">*</span>
                        </label>
                        <div className="er-radio-row">
                            {["Male", "Female"].map(g => (
                                <label key={g} className="er-radio-label">
                                    <input
                                        type="radio"
                                        name="er-gender"
                                        value={g}
                                        checked={data.gender === g}
                                        onChange={() => set("gender", g)}
                                        className="er-radio"
                                    />
                                    {g}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="er-row-2">
                    <div className="er-field-group">
                        <label className="er-label">Home Phone</label>
                        <input
                            className="er-input"
                            placeholder="(optional)"
                            value={data.homePhone || ""}
                            onChange={e => set("homePhone", e.target.value)}
                        />
                    </div>
                    <div className="er-field-group">
                        <label className="er-label">Work Phone</label>
                        <input
                            className="er-input"
                            placeholder="(optional)"
                            value={data.workPhone || ""}
                            onChange={e => set("workPhone", e.target.value)}
                        />
                    </div>
                </div>

                <div className="er-row-2">
                    <div className="er-field-group">
                        <label className={`er-label ${errors.includes("mobilePhone") ? "er-label-error" : ""}`}>
                            Mobile Phone <span className="er-required">*</span>
                        </label>
                        <input
                            id="er-mobilePhone"
                            className={`er-input ${errors.includes("mobilePhone") ? "er-input-error" : ""}`}
                            value={data.mobilePhone || ""}
                            onChange={e => set("mobilePhone", e.target.value)}
                        />
                    </div>
                    <div className="er-field-group">
                        <label className={`er-label ${errors.includes("email") ? "er-label-error" : ""}`}>
                            Email <span className="er-required">*</span>
                        </label>
                        <input
                            id="er-email"
                            type="email"
                            className={`er-input ${errors.includes("email") ? "er-input-error" : ""}`}
                            value={data.email || ""}
                            onChange={e => set("email", e.target.value)}
                        />
                    </div>
                </div>

                <div className="er-field-group-full">
                    <label className={`er-label ${errors.includes("residentialAddress") ? "er-label-error" : ""}`}>
                        Residential Address <span className="er-required">*</span>
                    </label>
                    <input
                        id="er-residentialAddress"
                        className={`er-input-full ${errors.includes("residentialAddress") ? "er-input-error" : ""}`}
                        value={data.residentialAddress || ""}
                        onChange={e => set("residentialAddress", e.target.value)}
                    />
                </div>

                <div className="er-row-3">
                    <div className="er-field-group">
                        <label className={`er-label ${errors.includes("suburb") ? "er-label-error" : ""}`}>
                            Suburb <span className="er-required">*</span>
                        </label>
                        <input
                            id="er-suburb"
                            className={`er-input ${errors.includes("suburb") ? "er-input-error" : ""}`}
                            value={data.suburb || ""}
                            onChange={e => set("suburb", e.target.value)}
                        />
                    </div>
                    <div className="er-field-group">
                        <label className={`er-label ${errors.includes("state") ? "er-label-error" : ""}`}>
                            State <span className="er-required">*</span>
                        </label>
                        <select
                            id="er-state"
                            className={`er-select ${errors.includes("state") ? "er-input-error" : ""}`}
                            value={data.state || ""}
                            onChange={e => set("state", e.target.value)}
                        >
                            <option value="">Select...</option>
                            {STATES.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="er-field-group">
                        <label className={`er-label ${errors.includes("postcode") ? "er-label-error" : ""}`}>
                            Postcode <span className="er-required">*</span>
                        </label>
                        <input
                            id="er-postcode"
                            className={`er-input ${errors.includes("postcode") ? "er-input-error" : ""}`}
                            value={data.postcode || ""}
                            onChange={e => set("postcode", e.target.value)}
                        />
                    </div>
                </div>

                <label className="er-checkbox-label">
                    <input
                        type="checkbox"
                        checked={data.postalDifferent || false}
                        onChange={e => set("postalDifferent", e.target.checked)}
                    />
                    Postal Address is different from Residential Address
                </label>

                {data.postalDifferent && (
                    <div className="er-postal-block">
                        <div className="er-field-group-full">
                            <label className="er-label">Postal Address</label>
                            <input
                                className="er-input-full"
                                value={data.postalAddress || ""}
                                onChange={e => set("postalAddress", e.target.value)}
                            />
                        </div>
                        <div className="er-row-3">
                            <div className="er-field-group">
                                <label className="er-label">Suburb</label>
                                <input
                                    className="er-input"
                                    value={data.postalSuburb || ""}
                                    onChange={e => set("postalSuburb", e.target.value)}
                                />
                            </div>
                            <div className="er-field-group">
                                <label className="er-label">State</label>
                                <select
                                    className="er-select"
                                    value={data.postalState || ""}
                                    onChange={e => set("postalState", e.target.value)}
                                >
                                    <option value="">Select...</option>
                                    {STATES.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="er-field-group">
                                <label className="er-label">Postcode</label>
                                <input
                                    className="er-input"
                                    value={data.postalPostcode || ""}
                                    onChange={e => set("postalPostcode", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="er-card">
                <h3 className="er-card-title">EMERGENCY CONTACT</h3>

                <div className="er-row-3">
                    <div className="er-field-group">
                        <label className="er-label">Full Name</label>
                        <input
                            className="er-input"
                            value={data.emergencyName || ""}
                            onChange={e => set("emergencyName", e.target.value)}
                        />
                    </div>
                    <div className="er-field-group">
                        <label className="er-label">Relationship</label>
                        <input
                            className="er-input"
                            value={data.emergencyRelationship || ""}
                            onChange={e => set("emergencyRelationship", e.target.value)}
                        />
                    </div>
                    <div className="er-field-group">
                        <label className="er-label">Contact Number</label>
                        <input
                            className="er-input"
                            value={data.emergencyContact || ""}
                            onChange={e => set("emergencyContact", e.target.value)}
                        />
                    </div>
                </div>

                <div className="er-field-group">
                    <label className="er-label">
                        Emergency permission <span className="er-required">*</span>
                    </label>
                    <p className="er-small-text">
                        In the event of an emergency do you give STA permission to organise emergency
                        transport and treatment and do you agree to pay all costs related to the emergency?
                    </p>
                    <p className="er-small-text">
                        Emergency contact details (name, relationship, number) are optional when permission is No.
                    </p>
                    <div className="er-radio-row">
                        {["yes", "no"].map(val => (
                            <label key={val} className="er-radio-label">
                                <input
                                    type="radio"
                                    name="er-emergency-permission"
                                    value={val}
                                    checked={data.emergencyPermission === val}
                                    onChange={() => set("emergencyPermission", val)}
                                    className="er-radio"
                                />
                                {val.charAt(0).toUpperCase() + val.slice(1)}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="er-submit-row">
                <button className="er-submit-btn" onClick={handleNext}>
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

export default EnrollmentSection1