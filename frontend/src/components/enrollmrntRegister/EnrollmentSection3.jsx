import { useState } from "react"
import "../../styles/EnrollmentSection3.css"
import { API_URL } from "../../data/service"
import { useEffect } from "react"
import ValidationToast from "./ValidationToast"

const EDUCATION_LEVELS = [
    { value: "12", label: "12 — Year 12 or equivalent" },
    { value: "11", label: "11 — Year 11 or equivalent" },
    { value: "10", label: "10 — Year 10 or equivalent" },
    { value: "09", label: "09 — Year 9 or equivalent" },
    { value: "08", label: "08 — Year 8 or below" },
    { value: "never", label: "Never attended school" },
]

const QUALIFICATION_LEVELS = [
    "Bachelor Degree or Higher",
    "Advanced Diploma / Associate Degree",
    "Diploma",
    "Certificate IV",
    "Certificate III",
    "Certificate II",
    "Certificate I",
    "Other / Overseas",
]

const EMPLOYMENT_STATUSES = [
    { value: "full-time", label: "Full-time employee" },
    { value: "unemployed-seeking", label: "Unemployed — seeking work" },
    { value: "part-time", label: "Part-time employee" },
    { value: "not-employed", label: "Not employed — not seeking" },
    { value: "self-employed", label: "Self-employed" },
    { value: "casual", label: "Casual employee" },
]

const TRAINING_REASONS = [
    { value: "get-job", label: "To get a job" },
    { value: "entry-course", label: "Entry to another course" },
    { value: "promotion", label: "Promotion" },
    { value: "personal-dev", label: "Personal development" },
    { value: "extra-skills", label: "Extra skills" },
    { value: "other", label: "Other" },
]

function EnrollmentSection3({ data, setData, prev, next }) {

    const [errors, setErrors] = useState([])
    const [showToast, setShowToast] = useState(false)
    const [missingFieldsNames, setMissingFieldsNames] = useState([])

    // ✅ FIXED: restore qualEvidences from data.qualEvidences or data.qualEvidenceUrls
    const [qualEvidences, setQualEvidences] = useState(() => {
        // First priority: already-built qualEvidences object
        if (data.qualEvidences && Object.keys(data.qualEvidences).length > 0) {
            return data.qualEvidences
        }
        // Second priority: build from qualEvidenceUrls array
        const evidences = {}
        const urls = data.qualEvidenceUrls || []
        urls.forEach(({ level, url }) => {
            if (level && url) {
                evidences[level] = { file: null, url, error: "" }
            }
        })
        return evidences
    })

    // ✅ savedFormData late-ஆ வந்தாலும் qualEvidences update ஆகும்
    useEffect(() => {
        const urls = data.qualEvidenceUrls || []
        if (urls.length === 0) return

        const evidences = {}
        urls.forEach(({ level, url }) => {
            if (level && url) {
                evidences[level] = { file: null, url, error: "" }
            }
        })
        if (Object.keys(evidences).length > 0) {
            setQualEvidences(evidences)
        }
    }, [data.qualEvidenceUrls])

    const set = (key, value) => {
        setData(p => ({ ...p, [key]: value }))
        if (errors.includes(key)) {
            setErrors(prev => prev.filter(e => e !== key))
        }
    }

    const syncEvidences = (evidences) => {
        const urls = Object.entries(evidences)
            .filter(([, v]) => v.url)
            .map(([level, v]) => ({ level, url: v.url }))
        set("qualEvidences", evidences)
        set("qualEvidenceUrls", urls)
    }

    const toggleQualLevel = (level) => {
        const current = data.qualificationLevels || []
        if (current.includes(level)) {
            set("qualificationLevels", current.filter(l => l !== level))
            const updated = { ...qualEvidences }
            delete updated[level]
            setQualEvidences(updated)
            syncEvidences(updated)
        } else {
            set("qualificationLevels", [...current, level])
        }
    }

    const handleEvidenceUpload = async (level, file) => {
        if (!file) return
        const MAX_SIZE_BYTES = 5 * 1024 * 1024
        if (file.size > MAX_SIZE_BYTES) {
            const inputEl = document.getElementById(`qual-file-${level.replace(/\s+/g, "-")}`)
            if (inputEl) inputEl.value = ""
            setQualEvidences(prev => ({
                ...prev,
                [level]: { file: null, url: null, error: "File size exceeds 5MB. Please upload a smaller file." }
            }))
            return
        }

        setQualEvidences(prev => ({ ...prev, [level]: { file, url: null, error: "" } }))

        const fd = new FormData()
        fd.append("studentId", data.userId)
        fd.append("qualificationLevel", level)
        fd.append("qualificationFile", file)

        try {
            const res = await fetch(`${API_URL}/api/enrollment-form/section3-file`, {
                method: "POST",
                body: fd
            })
            const result = await res.json()
            if (res.ok) {
                const updated = { ...qualEvidences, [level]: { file, url: result.qualificationFileUrl, error: "" } }
                setQualEvidences(updated)
                syncEvidences(updated)
            } else {
                setQualEvidences(prev => ({ ...prev, [level]: { file: null, url: null, error: "Upload failed. Please try again." } }))
            }
        } catch {
            setQualEvidences(prev => ({ ...prev, [level]: { file: null, url: null, error: "Upload error. Please try again." } }))
        }
    }

    const handleEvidenceRemove = async (level) => {
        const fileUrl = qualEvidences[level]?.url
        const updated = { ...qualEvidences }
        delete updated[level]
        setQualEvidences(updated)
        syncEvidences(updated)

        const inputEl = document.getElementById(`qual-file-${level.replace(/\s+/g, "-")}`)
        if (inputEl) inputEl.value = ""
        if (fileUrl) {
            try {
                await fetch(`${API_URL}/api/enrollment-form/section3-file`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ studentId: data.userId, fileUrl, qualificationLevel: level })
                })
            } catch (err) { console.error("Delete error:", err) }
        }
    }

    const neverAttended = data.educationLevel === "never"
    const schoolNotAustralia = !data.schoolInAustralia
    const qualYes = data.hasQualifications === "yes"
    const reasonOther = data.trainingReason === "other"

    const handleNext = () => {
        const newErrors = []
        const missingNames = []

        const fieldLabels = {
            educationLevel: "Highest School Level",
            yearCompleted: "Year completed",
            employmentStatus: "Employment status",
            trainingReason: "Training reason",
            trainingReasonOther: "Other Training Reason"
        }

        if (!data.educationLevel) {
            newErrors.push("educationLevel")
            missingNames.push(fieldLabels.educationLevel)
        }
        if (!neverAttended && !data.yearCompleted) {
            newErrors.push("yearCompleted")
            missingNames.push(fieldLabels.yearCompleted)
        }
        if (!data.employmentStatus) {
            newErrors.push("employmentStatus")
            missingNames.push(fieldLabels.employmentStatus)
        }
        if (!data.trainingReason) {
            newErrors.push("trainingReason")
            missingNames.push(fieldLabels.trainingReason)
        }
        if (reasonOther && !data.trainingReasonOther?.trim()) {
            newErrors.push("trainingReasonOther")
            missingNames.push(fieldLabels.trainingReasonOther)
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
            const el = document.getElementById(`s3-${firstError}`)
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" })
                el.focus()
            }
        }
    }

    return (
        <div className="s3-page">

            <div className="s3-section-header">
                <h2 className="s3-section-header-text">
                    SECTION 3 — EDUCATION AND EMPLOYMENT INFORMATION
                </h2>
            </div>

            <div className="s3-card">
                <h4 className="s3-card-title">AVETMISS Data Collection</h4>
                <p className="s3-info-text">
                    Information collected in this section is used for National reporting and planning. Please complete all sections.
                </p>
            </div>

            <div className="s3-card">
                <h4 className="s3-card-title">PRIOR EDUCATION</h4>
                <p className={`s3-subtitle ${errors.includes("educationLevel") ? "s3-label-error" : ""}`} id="s3-educationLevel">
                    What was your highest completed level at school? <span className="s3-required">*</span>
                </p>

                <div className="s3-radio-grid">
                    {EDUCATION_LEVELS.map(level => (
                        <label key={level.value} className="s3-radio-label">
                            <input
                                type="radio"
                                name="s3-education"
                                value={level.value}
                                checked={data.educationLevel === level.value}
                                onChange={() => set("educationLevel", level.value)}
                                className="s3-radio"
                            />
                            {level.label}
                        </label>
                    ))}
                </div>

                <p className="s3-hint">
                    Prior education is optional. Year completed is not required if you never attended school.
                </p>

                {neverAttended && (
                    <p className="s3-hint" style={{ marginTop: 8 }}>
                        Year completed and school details are not required.
                    </p>
                )}

                {!neverAttended && (
                    <>
                        <div className="s3-divider" />

                        <div className="s3-row-2">
                            <div className="s3-field">
                                <label className={`s3-label ${errors.includes("yearCompleted") ? "s3-label-error" : ""}`}>
                                    Year completed <span className="s3-required">*</span>
                                </label>
                                <input
                                    id="s3-yearCompleted"
                                    className={`s3-input ${errors.includes("yearCompleted") ? "s3-input-error" : ""}`}
                                    placeholder="e.g. 2010"
                                    maxLength={4}
                                    value={data.yearCompleted || ""}
                                    onChange={e => set("yearCompleted", e.target.value)}
                                />
                            </div>
                            <div className="s3-field">
                                <label className="s3-label">Name of School (optional)</label>
                                <input
                                    className="s3-input"
                                    value={data.schoolName || ""}
                                    onChange={e => set("schoolName", e.target.value)}
                                />
                            </div>
                        </div>

                        <label className="s3-checkbox-label">
                            <input
                                type="checkbox"
                                checked={data.schoolInAustralia !== false}
                                onChange={e => set("schoolInAustralia", e.target.checked)}
                            />
                            School was in Australia
                        </label>
                        <p className="s3-hint" style={{ marginTop: 4 }}>
                            Uncheck if the school was not in Australia.
                        </p>

                        {!schoolNotAustralia && (
                            <div className="s3-row-2" style={{ marginTop: 12 }}>
                                <div className="s3-field">
                                    <label className="s3-label">State (optional)</label>
                                    <input
                                        className="s3-input"
                                        value={data.schoolState || ""}
                                        onChange={e => set("schoolState", e.target.value)}
                                    />
                                </div>
                                <div className="s3-field">
                                    <label className="s3-label">Postcode (optional)</label>
                                    <input
                                        className="s3-input"
                                        value={data.schoolPostcode || ""}
                                        onChange={e => set("schoolPostcode", e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {schoolNotAustralia && (
                            <div className="s3-field s3-field-full" style={{ marginTop: 12 }}>
                                <label className="s3-label">
                                    Country (if overseas) <span className="s3-required">*</span>
                                </label>
                                <input
                                    className="s3-input-full"
                                    value={data.schoolCountry || ""}
                                    onChange={e => set("schoolCountry", e.target.value)}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="s3-card">
                <h4 className="s3-card-title">QUALIFICATIONS</h4>
                <p className="s3-subtitle">Do you have post-secondary or vocational/trade qualifications?</p>

                <div className="s3-radio-row">
                    <label className="s3-radio-label">
                        <input
                            type="radio"
                            name="s3-qualifications"
                            value="yes"
                            checked={data.hasQualifications === "yes"}
                            onChange={() => set("hasQualifications", "yes")}
                            className="s3-radio"
                        />
                        Yes — I will provide evidence
                    </label>
                    <label className="s3-radio-label">
                        <input
                            type="radio"
                            name="s3-qualifications"
                            value="no"
                            checked={data.hasQualifications === "no"}
                            onChange={() => set("hasQualifications", "no")}
                            className="s3-radio"
                        />
                        No
                    </label>
                </div>

                {qualYes && (
                    <div className="s3-qual-box">
                        <h5 className="s3-qual-title">Qualification Level(s)</h5>

                        <div className="s3-checkbox-grid">
                            {QUALIFICATION_LEVELS.map(level => (
                                <label key={level} className="s3-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={(data.qualificationLevels || []).includes(level)}
                                        onChange={() => toggleQualLevel(level)}
                                    />
                                    {level}
                                </label>
                            ))}
                        </div>

                        <div className="s3-field s3-field-full" style={{ marginTop: 16 }}>
                            <label className="s3-label">Qualification details (optional)</label>
                            <textarea
                                className="s3-textarea"
                                rows={3}
                                value={data.qualificationDetails || ""}
                                onChange={e => set("qualificationDetails", e.target.value)}
                            />
                        </div>

                        <div className="s3-field s3-field-full" style={{ marginTop: 12 }}>
                            <label className="s3-label">Upload qualification evidence</label>

                            {(data.qualificationLevels || []).length === 0 && (
                                <p className="s3-hint">Select qualification level(s) above to upload evidence.</p>
                            )}

                            {(data.qualificationLevels || []).length > 0 && (
                                <>
                                    <p className="s3-hint" style={{ marginBottom: 12 }}>
                                        Upload one evidence file per qualification. Max size: 5MB each.
                                    </p>
                                    <div className="s3-evidence-grid">
                                        {(data.qualificationLevels || []).map(level => {
                                            const evidence = qualEvidences[level]
                                            const hasFile = evidence?.file || evidence?.url
                                            const inputId = `qual-file-${level.replace(/\s+/g, "-")}`
                                            return (
                                                <div
                                                    key={level}
                                                    className={`s3-evidence-card${evidence?.error ? " s3-evidence-card-error" : ""}${hasFile ? " s3-evidence-card-done" : ""}`}
                                                >
                                                    <div className="s3-evidence-label-row">
                                                        <span className="s3-evidence-badge">📋</span>
                                                        <span className="s3-evidence-name">{level}</span>
                                                        {hasFile && <span className="s3-evidence-tick">✅</span>}
                                                    </div>

                                                    {!hasFile ? (
                                                        <>
                                                            <div
                                                                className="s3-evidence-dropzone"
                                                                onClick={() => document.getElementById(inputId).click()}
                                                            >
                                                                <span className="s3-evidence-arrow">↑</span>
                                                                <p className="s3-evidence-dropzone-text">Click to upload</p>
                                                                <p className="s3-evidence-dropzone-hint">PDF, JPG, PNG (max 5MB)</p>
                                                            </div>
                                                            {evidence?.error && (
                                                                <div className="s3-file-error">
                                                                    <span className="s3-file-error-icon">⚠</span>
                                                                    {evidence.error}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="s3-evidence-preview">
                                                            {evidence.file ? (
                                                                evidence.file.type === "application/pdf" ? (
                                                                    <p className="s3-evidence-pdf">📄 {evidence.file.name}</p>
                                                                ) : (
                                                                    <img
                                                                        src={URL.createObjectURL(evidence.file)}
                                                                        alt={level}
                                                                        className="s3-evidence-img"
                                                                    />
                                                                )
                                                            ) : evidence.url?.endsWith(".pdf") ? (
                                                                <a href={evidence.url} target="_blank" rel="noopener noreferrer" className="s3-evidence-pdf">
                                                                    📄 View Document
                                                                </a>
                                                            ) : (
                                                                <img src={evidence.url} alt={level} className="s3-evidence-img" />
                                                            )}
                                                            <button
                                                                className="s3-evidence-remove"
                                                                onClick={() => handleEvidenceRemove(level)}
                                                                title={`Remove evidence for ${level}`}
                                                            >✕</button>
                                                        </div>
                                                    )}

                                                    <input
                                                        id={inputId}
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png,.pdf"
                                                        style={{ display: "none" }}
                                                        onChange={e => handleEvidenceUpload(level, e.target.files[0])}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="s3-card" id="s3-employmentStatus">
                <h4 className={`s3-card-title ${errors.includes("employmentStatus") ? "s3-label-error" : ""}`}>
                    EMPLOYMENT STATUS <span className="s3-required">*</span>
                </h4>

                <div className="s3-radio-grid">
                    {EMPLOYMENT_STATUSES.map(status => (
                        <label key={status.value} className="s3-radio-label">
                            <input
                                type="radio"
                                name="s3-employment"
                                value={status.value}
                                checked={data.employmentStatus === status.value}
                                onChange={() => set("employmentStatus", status.value)}
                                className="s3-radio"
                            />
                            {status.label}
                        </label>
                    ))}
                </div>
            </div>

            <div className="s3-card">
                <h4 className="s3-card-title">EMPLOYMENT DETAILS (if applicable)</h4>

                <div className="s3-row-2">
                    <div className="s3-field">
                        <label className="s3-label">Employer name</label>
                        <input
                            className="s3-input"
                            value={data.employerName || ""}
                            onChange={e => set("employerName", e.target.value)}
                        />
                    </div>
                    <div className="s3-field">
                        <label className="s3-label">Supervisor name</label>
                        <input
                            className="s3-input"
                            value={data.supervisorName || ""}
                            onChange={e => set("supervisorName", e.target.value)}
                        />
                    </div>
                </div>

                <div className="s3-field s3-field-full">
                    <label className="s3-label">Workplace address</label>
                    <input
                        className="s3-input-full"
                        value={data.workplaceAddress || ""}
                        onChange={e => set("workplaceAddress", e.target.value)}
                    />
                </div>

                <div className="s3-row-2">
                    <div className="s3-field">
                        <label className="s3-label">Email</label>
                        <input
                            type="email"
                            className="s3-input"
                            value={data.employerEmail || ""}
                            onChange={e => set("employerEmail", e.target.value)}
                        />
                    </div>
                    <div className="s3-field">
                        <label className="s3-label">Phone</label>
                        <input
                            className="s3-input"
                            value={data.employerPhone || ""}
                            onChange={e => set("employerPhone", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="s3-card" id="s3-trainingReason">
                <h4 className={`s3-card-title ${errors.includes("trainingReason") ? "s3-label-error" : ""}`}>
                    REASON FOR UNDERTAKING TRAINING <span className="s3-required">*</span>
                </h4>

                <div className="s3-radio-grid">
                    {TRAINING_REASONS.map(reason => (
                        <label key={reason.value} className="s3-radio-label">
                            <input
                                type="radio"
                                name="s3-reason"
                                value={reason.value}
                                checked={data.trainingReason === reason.value}
                                onChange={() => set("trainingReason", reason.value)}
                                className="s3-radio"
                            />
                            {reason.label}
                        </label>
                    ))}
                </div>

                {reasonOther && (
                    <div className="s3-field s3-field-full" style={{ marginTop: 12 }}>
                        <label className={`s3-label ${errors.includes("trainingReasonOther") ? "s3-label-error" : ""}`}>
                            Other — details <span className="s3-required">*</span>
                        </label>
                        <input
                            id="s3-trainingReasonOther"
                            className={`s3-input-full ${errors.includes("trainingReasonOther") ? "s3-input-error" : ""}`}
                            value={data.trainingReasonOther || ""}
                            onChange={e => set("trainingReasonOther", e.target.value)}
                        />
                    </div>
                )}
            </div>

            <div className="s3-footer">
                <button className="s3-prev-btn" onClick={prev}>
                    Previous
                </button>
                <button className="s3-next-btn" onClick={handleNext}>
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

export default EnrollmentSection3