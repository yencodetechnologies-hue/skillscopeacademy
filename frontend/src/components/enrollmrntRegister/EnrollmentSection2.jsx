import "../../styles/EnrollmentSection2.css"
import "../../styles/EnrollmentRegister.css"
import { useState } from "react"
import { API_URL } from "../../data/service"
import ValidationToast from "./ValidationToast"

function EnrollmentSection2({ data, setData, prev, next, userId }) {

    const [fileError, setFileError] = useState("")
    const [errors, setErrors] = useState([])
    const [showToast, setShowToast] = useState(false)
    const [missingFieldsNames, setMissingFieldsNames] = useState([])

    const set = (key, value) => {
        setData(p => ({ ...p, [key]: value }))
        if (errors.includes(key)) {
            setErrors(prev => prev.filter(e => e !== key))
        }
    }

    const handleFileUpload = async (file) => {
        if (!file) return;

        // ✅ 5MB size check
        const MAX_SIZE_MB = 5;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

        if (file.size > MAX_SIZE_BYTES) {
            setFileError(`File size exceeds ${MAX_SIZE_MB}MB. Please upload a smaller file.`);
            document.getElementById("sta-id-input").value = "";
            return;
        }

        setFileError("");
        set("staIdFile", file);
        if (errors.includes("staIdFile")) {
            setErrors(prev => prev.filter(e => e !== "staIdFile"))
        }

        const fd = new FormData();
        fd.append("staIdFile", file);
        fd.append("studentId", data.userId);

        try {
            const res = await fetch(`${API_URL}/api/enrollment-form/section2-file`, {
                method: "POST",
                body: fd
            });
            const result = await res.json();
            if (res.ok) {
                set("staIdFileUrl", result.staIdFileUrl);
            } else {
                setMissingFieldsNames(["File upload failed: " + result.message]);
                setShowToast(true);
            }
        } catch (err) {
            setMissingFieldsNames(["Upload error: " + err.message]);
            setShowToast(true);
        }
    }

    const handleNext = () => {
        const newErrors = []
        const missingNames = []

        const fieldLabels = {
            usi: "Enter your USI *",
            usiPermission: "USI Permission Consent *",
            staApplication: "USI application choice *",
            staAuthoriseName: "USI Authorisation Name *",
            staConsent: "USI Consent *",
            staTownOfBirth: "Town of Birth *",
            staOverseasTown: "Overseas Town *",
            staIdType: "Identity Document Type *",
            staIdFile: "ID Document Upload *"
        }

        // 1. USI Number Check
        const usiValue = (data.usi || "").toString().trim();
        if (usiValue === "" && data.staApplication !== "yes") {
            newErrors.push("usi")
            missingNames.push("Enter your USI *")
        } else if (usiValue !== "" && usiValue.length !== 10) {
            newErrors.push("usi")
            missingNames.push("Enter your USI * (must be 10 characters)")
        }

        if (!data.usiPermission) {
            newErrors.push("usiPermission")
            missingNames.push(fieldLabels.usiPermission)
        }

        if (!data.staApplication) {
            newErrors.push("staApplication")
            missingNames.push(fieldLabels.staApplication)
        }

        if (data.staApplication === "yes") {
            if (!data.staAuthoriseName) {
                newErrors.push("staAuthoriseName")
                missingNames.push(fieldLabels.staAuthoriseName)
            }
            if (!data.staConsent) {
                newErrors.push("staConsent")
                missingNames.push(fieldLabels.staConsent)
            }
            if (!data.staTownOfBirth) {
                newErrors.push("staTownOfBirth")
                missingNames.push(fieldLabels.staTownOfBirth)
            }
            if (!data.staOverseasTown) {
                newErrors.push("staOverseasTown")
                missingNames.push(fieldLabels.staOverseasTown)
            }
            if (!data.staIdType) {
                newErrors.push("staIdType")
                missingNames.push(fieldLabels.staIdType)
            }
            if (!data.staIdFile && !data.staIdFileUrl) {
                newErrors.push("staIdFile")
                missingNames.push(fieldLabels.staIdFile)
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
            const el = document.getElementById(`usi-${firstError}`)
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" })
                el.focus()
            }
        }
    }

    return (
        <div className="usi-page">

            <div className="usi-section-header">
                <h2 className="usi-section-header-text">
                    SECTION 2 — UNIQUE STUDENT IDENTIFIER (USI)
                </h2>
            </div>

            <div className="usi-info-card">
                <p className="usi-info-text">
                    From 1 January 2015, an RTO can be prevented from issuing nationally recognised VET
                    certification if you do not provide a USI. If you have not obtained a USI you can apply
                    for it directly. If you already have a USI, provide it below.
                </p>
                <p className="usi-info-text">
                    If you forgot your USI, you can retrieve it from the official USI site.
                </p>
            </div>

            <div className="usi-card">

                <h3 className="usi-card-title">Unique Student Identifier (USI)</h3>

                <div className="usi-input-row">

                    <div className="usi-input-col" id="usi-usi">
                        <label className={`usi-label ${errors.includes("usi") ? "usi-label-error" : ""}`}>
                            Enter your USI <span className="usi-required">*</span>
                        </label>
                        <input
                            className={`usi-input ${errors.includes("usi") ? "usi-input-error" : ""}`}
                            placeholder="10-character USI"
                            maxLength={10}
                            value={data.usi || ""}
                            onChange={e => set("usi", e.target.value.toUpperCase())}
                        />
                        {errors.includes("usi") && (
                            <p className="usi-error-msg">USI Number is required (10 characters)</p>
                        )}
                        <p className="usi-hint">
                            If you don't have one, select "Apply through STA" below.
                        </p>
                    </div>

                    <div className="usi-permission-col" id="usi-usiPermission">
                        <input
                            type="checkbox"
                            className="usi-permission-checkbox"
                            checked={data.usiPermission || false}
                            onChange={e => set("usiPermission", e.target.checked)}
                            id="usi-permission"
                        />
                        <label 
                            htmlFor="usi-permission" 
                            className={`usi-permission-text ${errors.includes("usiPermission") ? "usi-label-error" : ""}`}
                        >
                            I give permission for Safety Training Academy to access my Unique Student
                            Identifier (USI) for the purpose of recording my results. <span className="usi-required">*</span>
                        </label>
                    </div>

                </div>

                <div className="usi-sta-group" id="usi-staApplication">
                    <p className={`usi-sta-label ${errors.includes("staApplication") ? "usi-label-error" : ""}`}>
                        USI application through STA (if you do not already have one)
                        <span className="usi-required">*</span>
                    </p>
                    <div className="usi-radio-row">
                        <label className="usi-radio-label">
                            <input
                                type="radio"
                                name="usi-sta"
                                value="no"
                                checked={data.staApplication === "no"}
                                onChange={() => set("staApplication", "no")}
                                className="usi-radio"
                            />
                            No (I will provide my USI)
                        </label>
                        <label className="usi-radio-label">
                            <input
                                type="radio"
                                name="usi-sta"
                                value="yes"
                                checked={data.staApplication === "yes"}
                                onChange={() => set("staApplication", "yes")}
                                className="usi-radio"
                            />
                            Yes (Apply through STA)
                        </label>
                    </div>
                </div>

            </div>

            {data.staApplication === "yes" && (
                <div className="usi-extra-box">

                    <h3 className="usi-extra-title">
                        USI application through STA (if you do not already have one)
                    </h3>

                    <p className="usi-extra-text">
                        If you would like STA to apply for a USI on your behalf, you must authorise us to do so and provide additional information.
                    </p>

                    <div className="usi-field">
                        <label className={`${errors.includes("staAuthoriseName") ? "usi-label-error" : ""}`}>[Name] — authorises Safety Training Academy to apply your USI *</label>
                        <input
                            id="usi-staAuthoriseName"
                            className={`usi-input ${errors.includes("staAuthoriseName") ? "usi-input-error" : ""}`}
                            value={data.staAuthoriseName || ""}
                            onChange={e => set("staAuthoriseName", e.target.value)}
                        />
                    </div>

                    <label className={`usi-checkbox-row ${errors.includes("staConsent") ? "usi-label-error" : ""}`} id="usi-staConsent">
                        <input
                            type="checkbox"
                            checked={data.staConsent || false}
                            onChange={e => set("staConsent", e.target.checked)}
                        />
                        I have read and I consent to the collection, use and disclosure of my personal information to create my USI.
                    </label>

                    <div className="usi-row">
                        <div>
                            <label className={`${errors.includes("staTownOfBirth") ? "usi-label-error" : ""}`}>Town/City of Birth *</label>
                            <input
                                id="usi-staTownOfBirth"
                                className={`usi-input ${errors.includes("staTownOfBirth") ? "usi-input-error" : ""}`}
                                value={data.staTownOfBirth || ""}
                                onChange={e => set("staTownOfBirth", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={`${errors.includes("staOverseasTown") ? "usi-label-error" : ""}`}>Overseas town or city where you were born *</label>
                            <input
                                id="usi-staOverseasTown"
                                className={`usi-input ${errors.includes("staOverseasTown") ? "usi-input-error" : ""}`}
                                value={data.staOverseasTown || ""}
                                onChange={e => set("staOverseasTown", e.target.value)}
                            />
                        </div>
                    </div>

                    <p className="usi-subtitle">
                        We will also need to verify your identity to create your USI.
                    </p>

                    {/* Identity verify row */}
                    <div className="usi-row" style={{ alignItems: "flex-start" }}>

                        {/* Dropdown */}
                        <div id="usi-staIdType">
                            <label className={`${errors.includes("staIdType") ? "usi-label-error" : ""}`}>Identity Document Type *</label>
                            <select
                                className={`usi-input ${errors.includes("staIdType") ? "usi-input-error" : ""}`}
                                value={data.staIdType || ""}
                                onChange={e => set("staIdType", e.target.value)}
                            >
                                <option value="">Select...</option>
                                <option>Passport</option>
                                <option>Driving Licence</option>
                            </select>
                        </div>

                        {/* Upload + Preview */}
                        <div className="usi-upload-wrapper" id="usi-staIdFile">
                            <label className={`${errors.includes("staIdFile") ? "usi-label-error" : ""}`}>Upload ID document <span className="usi-required">*</span></label>

                            {/* Dropzone */}
                            <div
                                className={`usi-dropzone ${(data.staIdFile || data.staIdFileUrl) ? "usi-dropzone-active" : ""} ${fileError || errors.includes("staIdFile") ? "usi-dropzone-error" : ""}`}
                                onClick={() => document.getElementById("sta-id-input").click()}
                            >
                                {data.staIdFile ? (
                                    <p className="usi-file-name">✅ {data.staIdFile.name}</p>
                                ) : data.staIdFileUrl ? (
                                    <p className="usi-file-name">✅ Already uploaded</p>
                                ) : (
                                    <>
                                        <span className="usi-dropzone-arrow">↑</span>
                                        <p className="usi-dropzone-text">Click to upload</p>
                                        <p className="usi-dropzone-hint">PDF, JPG, PNG (max 5MB)</p>
                                    </>
                                )}
                            </div>

                            {/* ✅ File size error message */}
                            {fileError && (
                                <div className="usi-file-error">
                                    <span className="usi-file-error-icon">⚠</span>
                                    {fileError}
                                </div>
                            )}

                            <input
                                id="sta-id-input"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                style={{ display: "none" }}
                                onChange={e => handleFileUpload(e.target.files[0])}
                            />

                            {/* Preview + X */}
                            {(data.staIdFile || data.staIdFileUrl) && (
                                <div className="usi-file-preview">

                                    <button
                                        className="usi-remove-btn"
                                        onClick={async () => {
                                            const fileUrl = data.staIdFileUrl

                                            set("staIdFile", null)
                                            set("staIdFileUrl", null)
                                            setFileError("")
                                            document.getElementById("sta-id-input").value = ""

                                            if (fileUrl) {
                                                try {
                                                    await fetch(`${API_URL}/api/enrollment-form/section2-file`, {
                                                        method: "DELETE",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                            studentId: data.userId,
                                                            fileUrl
                                                        })
                                                    })
                                                } catch (err) {
                                                    console.error("Delete error:", err)
                                                }
                                            }
                                        }}
                                    >✕</button>

                                    {data.staIdFile ? (
                                        data.staIdFile.type === "application/pdf" ? (
                                            <p className="usi-preview-pdf">📄 {data.staIdFile.name}</p>
                                        ) : (
                                            <img
                                                src={URL.createObjectURL(data.staIdFile)}
                                                alt="ID Preview"
                                                className="usi-preview-img"
                                            />
                                        )
                                    ) : data.staIdFileUrl?.endsWith(".pdf") ? (
                                        <a
                                            href={data.staIdFileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="usi-preview-pdf"
                                        >
                                            📄 View Document
                                        </a>
                                    ) : (
                                        <img
                                            src={data.staIdFileUrl}
                                            alt="ID Preview"
                                            className="usi-preview-img"
                                        />
                                    )}

                                </div>
                            )}

                        </div>

                    </div>

                </div>
            )}

            <div className="usi-footer">
                <button className="usi-prev-btn" onClick={prev}>
                    Previous
                </button>
                <button className="usi-next-btn" onClick={handleNext}>
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

export default EnrollmentSection2