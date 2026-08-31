import { useEffect, useState } from "react"
import "../../styles/EnrollmentRegister.css"
import ValidationToast from "./ValidationToast"

const STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]
const MAX_SIZE_BYTES = 5 * 1024 * 1024

function EnrollmentSection1({ userDetails, data, setData, next, saving }) {
    console.log(data,"data");
    
    const [errors, setErrors] = useState([])
    const [showToast, setShowToast] = useState(false)
    const [missingFieldsNames, setMissingFieldsNames] = useState([])

    // ✅ ID/Photo upload state
    const [idFileError, setIdFileError] = useState("")
    const [photoFileError, setPhotoFileError] = useState("")

    const set = (key, value) => {
        setData(p => ({ ...p, [key]: value }))
        if (errors.includes(key)) {
            setErrors(prev => prev.filter(e => e !== key))
        }
    }

    useEffect(() => {
        if (!userDetails || !userDetails.name) return
        const parts = userDetails.name.trim().split(" ")
      const fullPhone =
    userDetails.phone ||
    userDetails.mobileNumber ||
    userDetails.mobile ||
    "";

let countryCode = "+61";
let mobilePhone = fullPhone;

if (fullPhone.startsWith("+61")) {
    countryCode = "+61";
    mobilePhone = fullPhone.replace("+61", "");
} else if (fullPhone.startsWith("+91")) {
    countryCode = "+91";
    mobilePhone = fullPhone.replace("+91", "");
} else if (fullPhone.startsWith("+1")) {
    countryCode = "+1";
    mobilePhone = fullPhone.replace("+1", "");
}

setData(prev => ({
    ...prev,
    givenName: parts[0] || "",
    surname: parts.slice(1).join(" ") || "",
    email: userDetails.email || "",
    countryCode,
    mobilePhone
}));
    }, [userDetails])

    // ✅ upload handlers
    const handleFileClick = (inputId) => {
        document.getElementById(inputId).click()
    }

    const handleIdUpload = (file) => {
        if (!file) return
        if (file.size > MAX_SIZE_BYTES) {
            setIdFileError("File size exceeds 5MB. Please upload a smaller file.")
            document.getElementById("er-id-input").value = ""
            return
        }
        setIdFileError("")
        set("idDocument", file)
        if (errors.includes("idDocument")) {
            setErrors(prev => prev.filter(e => e !== "idDocument"))
        }
    }

    const handlePhotoUpload = (file) => {
        if (!file) return
        if (file.size > MAX_SIZE_BYTES) {
            setPhotoFileError("File size exceeds 5MB. Please upload a smaller file.")
            document.getElementById("er-photo-input").value = ""
            return
        }
        setPhotoFileError("")
        set("photoDocument", file)
        if (errors.includes("photoDocument")) {
            setErrors(prev => prev.filter(e => e !== "photoDocument"))
        }
    }

    const handleDelete = (key, urlKey) => {
        set(key, null)
        set(urlKey, null)
    }

    const deleteButtonStyle = {
        position: "absolute", top: -8, right: -8,
        background: "red", color: "#fff", border: "none",
        borderRadius: "50%", width: 20, height: 20,
        cursor: "pointer", fontSize: 12, zIndex: 1
    }

    const handleNext = () => {
        // ✅ prevent double-submit while a save is already in flight
        if (saving) return

        const required = [
            "title", "surname", "givenName", "dob", "gender",
            "mobilePhone", "email", "residentialAddress",
            "suburb", "state", "postcode"
        ]
        const fileRequired = { idDocument: "idDocumentUrl", photoDocument: "photoDocumentUrl" }
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
            postcode: "Postcode",
            idDocument: "Identification Document",
            photoDocument: "Photo"
        }

        for (const field of required) {
            if (!data[field]) {
                newErrors.push(field)
                missingNames.push(fieldLabels[field])
            }
        }

        for (const [field, urlField] of Object.entries(fileRequired)) {
            if (!data[field] && !data[urlField]) {
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

                {/* PHOTO AND ID CARD — above the Title field */}
                <div className="er-photo-header">
                    <h4 className="er-photo-header-title">PHOTO AND ID CARD</h4>
                    <p className="er-photo-header-text">
                        Please upload a clear copy of your identification document(s). Files must be readable.
                    </p>
                    <p className="er-photo-header-text">
                        Accepted: PDF, JPG, PNG. Example: Passport / Driver Licence.
                    </p>
                </div>

                <div className="s5-upload-row">

                    {/* ID Document upload card */}
                    <div className="s5-upload-card" id="er-idDocument">
                        <div className="s5-upload-card-header">
                            <span className="s5-upload-icon">📄</span>
                            <span className={`s5-upload-label ${errors.includes("idDocument") ? "s5-label-error" : ""}`}>
                                Identification document <span className="s5-required">*</span>
                            </span>
                        </div>
                        <p className="s5-upload-hint">e.g. Passport / Driver Licence</p>
                        <div
                            className={`s5-dropzone ${(data.idDocument || data.idDocumentUrl) ? "s5-dropzone-active" : ""} ${idFileError || errors.includes("idDocument") ? "s5-dropzone-error" : ""}`}
                            onClick={() => handleFileClick("er-id-input")}
                        >
                            {data.idDocument ? (
                                <p className="s5-file-name">✅ {data.idDocument.name}</p>
                            ) : data.idDocumentUrl ? (
                                <p className="s5-file-name">✅ Already uploaded</p>
                            ) : (
                                <>
                                    <span className="s5-upload-arrow">↑</span>
                                    <p className="s5-dropzone-text">Click to upload</p>
                                    <p className="s5-dropzone-hint">PDF, JPG, PNG (max 5MB)</p>
                                </>
                            )}
                        </div>
                        {idFileError && (
                            <div className="s5-file-error">
                                <span className="s5-file-error-icon">⚠</span>
                                {idFileError}
                            </div>
                        )}
                        <input
                            id="er-id-input"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            style={{ display: "none" }}
                            onChange={e => handleIdUpload(e.target.files[0])}
                        />
                    </div>

                    {/* Photo upload card */}
                    <div className="s5-upload-card" id="er-photoDocument">
                        <div className="s5-upload-card-header">
                            <span className="s5-upload-icon">🖼️</span>
                            <span className={`s5-upload-label ${errors.includes("photoDocument") ? "s5-label-error" : ""}`}>
                                Upload a Photo <span className="s5-required">*</span>
                            </span>
                        </div>
                        <p className="s5-upload-hint">Example: Upload a Photo.</p>
                        <div
                            className={`s5-dropzone ${(data.photoDocument || data.photoDocumentUrl) ? "s5-dropzone-active" : ""} ${photoFileError || errors.includes("photoDocument") ? "s5-dropzone-error" : ""}`}
                            onClick={() => handleFileClick("er-photo-input")}
                        >
                            {data.photoDocument ? (
                                <p className="s5-file-name">✅ {data.photoDocument.name}</p>
                            ) : data.photoDocumentUrl ? (
                                <p className="s5-file-name">✅ Already uploaded</p>
                            ) : (
                                <>
                                    <span className="s5-upload-arrow">↑</span>
                                    <p className="s5-dropzone-text">Click to upload</p>
                                    <p className="s5-dropzone-hint">PDF, JPG, PNG (max 5MB)</p>
                                </>
                            )}
                        </div>
                        {photoFileError && (
                            <div className="s5-file-error">
                                <span className="s5-file-error-icon">⚠</span>
                                {photoFileError}
                            </div>
                        )}
                        <input
                            id="er-photo-input"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            style={{ display: "none" }}
                            onChange={e => handlePhotoUpload(e.target.files[0])}
                        />
                    </div>

                </div>

                <p className="er-upload-footer-note">
                    Ensure documents are clear and readable. Accepted: PDF, JPG, PNG. Max 5MB per file.
                </p>

                {/* Preview */}
                {(data.idDocument || data.photoDocument || data.idDocumentUrl || data.photoDocumentUrl) && (
                    <div className="er-preview-section">
                        <h4 className="er-card-title">Preview</h4>
                        <div className="er-preview-row">

                            {(data.idDocument || data.idDocumentUrl) && (
                                <div className="er-preview-item" style={{ position: "relative" }}>
                                    <button
                                        onClick={() => handleDelete("idDocument", "idDocumentUrl")}
                                        style={deleteButtonStyle}
                                        aria-label="Remove ID document"
                                    >✕</button>
                                    <p className="er-preview-label">ID Document</p>
                                    {data.idDocument ? (
                                        data.idDocument.type === "application/pdf" ? (
                                            <p className="er-preview-pdf">📄 {data.idDocument.name}</p>
                                        ) : (
                                            <img src={URL.createObjectURL(data.idDocument)} alt="ID" className="er-preview-img" />
                                        )
                                    ) : data.idDocumentUrl?.endsWith(".pdf") ? (
                                        <a href={data.idDocumentUrl} target="_blank" rel="noreferrer" className="er-preview-pdf">📄 View ID Document</a>
                                    ) : (
                                        <img src={data.idDocumentUrl} alt="ID" className="er-preview-img" />
                                    )}
                                </div>
                            )}

                            {(data.photoDocument || data.photoDocumentUrl) && (
                                <div className="er-preview-item" style={{ position: "relative" }}>
                                    <button
                                        onClick={() => handleDelete("photoDocument", "photoDocumentUrl")}
                                        style={deleteButtonStyle}
                                        aria-label="Remove photo"
                                    >✕</button>
                                    <p className="er-preview-label">Photo</p>
                                    {data.photoDocument ? (
                                        data.photoDocument.type === "application/pdf" ? (
                                            <p className="er-preview-pdf">📄 {data.photoDocument.name}</p>
                                        ) : (
                                            <img src={URL.createObjectURL(data.photoDocument)} alt="Photo" className="er-preview-img" />
                                        )
                                    ) : data.photoDocumentUrl?.endsWith(".pdf") ? (
                                        <a href={data.photoDocumentUrl} target="_blank" rel="noreferrer" className="er-preview-pdf">📄 View Photo</a>
                                    ) : (
                                        <img src={data.photoDocumentUrl} alt="Photo" className="er-preview-img" />
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                )}

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

    <div className="er-phone-group">

        <select
            className="er-country-code"
            value={data.countryCode || "+61"}
            onChange={(e) => set("countryCode", e.target.value)}
        >
            <option value="+61">+61</option>
            <option value="+91">+91</option>
            <option value="+1">+1</option>
            <option value="+44">+44</option>
            <option value="+64">+64</option>
            <option value="+65">+65</option>
        </select>

        <input
            id="er-mobilePhone"
            className={`er-input ${errors.includes("mobilePhone") ? "er-input-error" : ""}`}
            placeholder="412345678"
            value={data.mobilePhone || ""}
            onChange={(e) =>
                set("mobilePhone", e.target.value.replace(/\D/g, ""))
            }
        />

    </div>

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
                        In the event of an emergency do you give SafeTicks permission to organise emergency
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
                <button className="er-submit-btn" onClick={handleNext} disabled={saving}>
                    {saving ? "Saving..." : "Next"}
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