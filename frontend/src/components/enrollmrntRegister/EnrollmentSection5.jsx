import { colors } from '../../constants/theme';
import { useRef, useEffect, useState } from "react"
import "../../styles/EnrollmentSection5.css"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../../data/service"
import ValidationToast from "./ValidationToast"

function EnrollmentSection5({ data, setData, prev, validateAndSubmit }) {

    const [errors, setErrors] = useState([])
    const set = (key, value) => {
        setData(p => ({ ...p, [key]: value }))
        if (errors.includes(key)) {
            setErrors(prev => prev.filter(e => e !== key))
        }
    }
    const canvasRef = useRef(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [hasSignature, setHasSignature] = useState(false)
    const [submittingState, setSubmittingState] = useState("idle") // "idle" | "loading" | "success"
    const [showErrorToast, setShowErrorToast] = useState(false) // Validation toast
    const [missingFieldsNames, setMissingFieldsNames] = useState([])
    const [idFileError, setIdFileError] = useState("")
    const [photoFileError, setPhotoFileError] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height
    }, [])

    useEffect(() => {
        if (!data.signatureUrl) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            setHasSignature(true)
        }
        img.src = data.signatureUrl
    }, [data.signatureUrl])

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0]
        const fullName = [data.title, data.givenName, data.middleName, data.surname].filter(Boolean).join(" ")
        setData(prev => ({
            ...prev,
            studentName: prev.studentName || fullName,
            declarationDate: prev.declarationDate || today
        }))
    }, [])

    const getPos = (e, canvas) => {
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        if (e.touches) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            }
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        }
    }

    const startDraw = (e) => {
        e.preventDefault()
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        const pos = getPos(e, canvas)
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        setIsDrawing(true)
    }

    const draw = (e) => {
        e.preventDefault()
        if (!isDrawing) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        const pos = getPos(e, canvas)
        ctx.lineWidth = 2
        ctx.lineCap = "round"
        ctx.strokeStyle = "#111"
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
        setHasSignature(true)
    }

    const endDraw = () => setIsDrawing(false)

    const clearSignature = () => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setHasSignature(false)
        set("signature", null)
        set("signatureUrl", null)
    }

    const saveSignature = () => {
        const canvas = canvasRef.current
        set("signature", canvas.toDataURL())
    }

    useEffect(() => {
        if (!isDrawing && hasSignature) {
            saveSignature()
        }
    }, [isDrawing])

    const handleFileClick = (inputId) => {
        document.getElementById(inputId).click()
    }

    // ✅ 5MB validation handler
    const MAX_SIZE_BYTES = 5 * 1024 * 1024

    const handleIdUpload = (file) => {
        if (!file) return
        if (file.size > MAX_SIZE_BYTES) {
            setIdFileError("File size exceeds 5MB. Please upload a smaller file.")
            document.getElementById("s5-id-input").value = ""
            return
        }
        setIdFileError("")
        set("idDocument", file)
    }

    const handlePhotoUpload = (file) => {
        if (!file) return
        if (file.size > MAX_SIZE_BYTES) {
            setPhotoFileError("File size exceeds 5MB. Please upload a smaller file.")
            document.getElementById("s5-photo-input").value = ""
            return
        }
        setPhotoFileError("")
        set("photoDocument", file)
    }

    const handleValidation = () => {
        const newErrors = []
        const missingNames = []

        const fieldLabels = {
            acceptPrivacy: "Privacy Policy Acceptance",
            acceptTerms: "Terms & Conditions Acceptance",
            studentName: "Student Name",
            declarationDate: "Declaration Date",
            signature: "Online Signature",
            idDocument: "Identification Document",
            photoDocument: "Photo"
        }

        if (!data.acceptPrivacy) {
            newErrors.push("acceptPrivacy")
            missingNames.push(fieldLabels.acceptPrivacy)
        }
        if (!data.acceptTerms) {
            newErrors.push("acceptTerms")
            missingNames.push(fieldLabels.acceptTerms)
        }
        if (!data.studentName?.trim()) {
            newErrors.push("studentName")
            missingNames.push(fieldLabels.studentName)
        }
        if (!data.declarationDate) {
            newErrors.push("declarationDate")
            missingNames.push(fieldLabels.declarationDate)
        }
        if (!hasSignature) {
            newErrors.push("signature")
            missingNames.push(fieldLabels.signature)
        }
        if (!data.idDocument && !data.idDocumentUrl) {
            newErrors.push("idDocument")
            missingNames.push(fieldLabels.idDocument)
        }
        if (!data.photoDocument && !data.photoDocumentUrl) {
            newErrors.push("photoDocument")
            missingNames.push(fieldLabels.photoDocument)
        }

        if (newErrors.length > 0) {
            setErrors(newErrors)
            setMissingFieldsNames(missingNames)
            setShowErrorToast(true)
            return "error"
        }
        return null
    }

    const closeErrorToastAndScroll = () => {
        setShowErrorToast(false)
        if (errors.length > 0) {
            const firstError = errors[0]
            const el = document.getElementById(`s5-${firstError}`)
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" })
                el.focus()
            }
        }
    }

    const handleSubmit = async () => {
        const error = handleValidation()
        if (error) return

        setSubmittingState("loading")
        const startTime = Date.now()

        const apiError = await validateAndSubmit()
        if (apiError) {
            setSubmittingState("idle")
            setMissingFieldsNames([apiError])
            setShowErrorToast(true)
            return
        }

        const elapsedTime = Date.now() - startTime
        const remainingTime = Math.max(0, 3000 - elapsedTime)
        
        if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime))
        }

        setSubmittingState("success")
        window.dispatchEvent(new Event("refreshStudentStatus"))
    }

    const handleDelete = async (fileUrl, fileType, clearKeys) => {
        clearKeys.forEach(key => set(key, null))
        if (fileUrl) {
            try {
                await fetch(`${API_URL}/api/enrollment-form/section5-file`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ studentId: data.userId, fileUrl, fileType })
                })
            } catch (err) {
                console.error("Delete error:", err)
            }
        }
    }

    const deleteButtonStyle = {
        position: "absolute", top: -8, right: -8,
        background: "red", color: colors.white, border: "none",
        borderRadius: "50%", width: 20, height: 20,
        cursor: "pointer", fontSize: 12, zIndex: 1
    }
    if (submittingState !== "idle") {
        return (
            <div className="s5-page">
                <div className="s5-submit-container">
                    {submittingState === "loading" ? (
                        <>
                            <div className="s5-submit-spinner"></div>
                            <h3 className="s5-submit-title">Submitting Your Enrollment...</h3>
                            <p className="s5-submit-sub">Please wait, we are processing and saving your application.</p>
                        </>
                    ) : (
                        <>
                            <div className="s5-submit-success-circle">
                                <svg className="s5-submit-success-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.748-5.25z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h2 className="s5-submit-title success">
                                Enrollment Submitted Successfully!
                            </h2>
                            <p className="s5-submit-sub">
                                Thank you. Your enrollment details have been submitted successfully.
                            </p>
                            <button
                                className="s5-submit-dashboard-btn"
                                onClick={() => navigate("/student")}
                            >
                                ← Back to Dashboard
                            </button>
                        </>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="s5-page">

            <div className="s5-section-header">
                <h2 className="s5-section-header-text">
                    SECTION 5 — PRIVACY NOTICE, TERMS & ONLINE SIGNATURE
                </h2>
            </div>

            <div className="s5-warning-banner">
                <span className="s5-warning-icon">⚠️</span>
                <span>Please read the Privacy Notice and Terms & Conditions. You must accept them before submitting.</span>
            </div>

            <div className="s5-card">
                <h4 className="s5-card-title">Privacy Notice</h4>
                <div className="s5-policy-box">
                    <div className="s5-policy-item">
                        <h5>Why we collect your personal information</h5>
                        <p>As a registered training organisation (RTO), we collect your personal information so we can process and manage your enrolment in vocational education and training (VET) course(s).</p>
                    </div>
                    <div className="s5-policy-item">
                        <h5>How we use your personal information</h5>
                        <p>We use your personal information to enable us to deliver VET courses to you and, otherwise, as needed, to comply with our obligations as an RTO.</p>
                    </div>
                    <div className="s5-policy-item">
                        <h5>How we disclose your personal information</h5>
                        <p>We are required by law (under the National Vocational Education and Training Regulator Act 2011 (Cth)) to disclose the personal information we collect to the National VET Data Collection kept by the National Centre for Vocational Education Research (NCVER). NCVER is responsible for collecting, managing, analysing and communicating research and statistics about the Australian VET sector. We are also authorised by law (under the NVETR Act) to disclose your personal information to relevant State/Territory training authorities.</p>
                    </div>
                    <div className="s5-policy-item">
                        <h5>How the NCVER and other bodies handle your personal information</h5>
                        <p>NCVER will collect, hold, use and disclose your personal information in accordance with the law, including the Privacy Act 1988 (Cth) and the NVETR Act. Your information may be used for purposes including administration of VET, facilitating statistics and research, and understanding how the VET market operates.</p>
                    </div>
                    <div className="s5-policy-item">
                        <h5>Surveys</h5>
                        <p>You may receive a student survey conducted by or on behalf of government departments or NCVER. You may opt out at the time of being contacted.</p>
                    </div>
                    <div className="s5-policy-item s5-contact-block">
                        <h5>Contact information</h5>
                        <p>Safety Training Academy — Maria Hajjar</p>
                        <p>0439 007 746</p>
                        <p>maria@safetytrainingacademy.edu.au</p>
                    </div>
                </div>
            </div>

            <div className="s5-card">
                <h4 className="s5-card-title">Terms & Conditions (Key Policies)</h4>
                <div className="s5-policy-box">
                    <div className="s5-policy-item">
                        <h5>Complaints & Appeals</h5>
                        <p>Complaints are recorded and managed through STA's complaints process. If not resolved, you may lodge an appeal. Appeals may progress to independent mediation (e.g., National Training Complaints Hotline / Ombudsman pathways where applicable).</p>
                    </div>
                    <div className="s5-policy-item">
                        <h5>Reassessment</h5>
                        <p>If you believe an assessment outcome is unfair, first discuss with your assessor. If unresolved, follow the formal appeals process. STA may require evidence, and independent reassessment may be arranged where necessary.</p>
                    </div>
                    <div className="s5-policy-item">
                        <h5>Consumer Guarantee</h5>
                        <p>STA will provide training and assessment with due care and skill, fit for purpose, and within a reasonable timeframe.</p>
                    </div>
                    <div className="s5-policy-item">
                        <h5>Change to agreed services</h5>
                        <p>Changes may occur due to course/practical requirements, third party arrangements, or ownership changes. Where possible, STA will notify affected learners.</p>
                    </div>
                    <div className="s5-policy-item">
                        <h5>Credit Transfer </h5>
                        <p>Credit Transfer may be granted for equivalent units with verified evidence. requires evidence of competence.</p>
                    </div>
                    <div className="s5-policy-item">
                        <h5>Language, Literacy and Numeracy (LLN)</h5>
                        <p>Learners may be assessed for LLN needs. Support may be provided or referrals made where appropriate.</p>
                    </div>
                    <div className="s5-policy-item">
                        <h5>Important information</h5>
                        <p>By signing this form, you confirm the information provided is correct and you agree to STA policies and procedures.</p>
                    </div>
                </div>
            </div>

            <div className="s5-card">
                <label className={`s5-checkbox-label ${errors.includes("acceptPrivacy") ? "s5-label-error" : ""}`} id="s5-acceptPrivacy">
                    <input
                        type="checkbox"
                        checked={data.acceptPrivacy || false}
                        onChange={e => set("acceptPrivacy", e.target.checked)}
                    />
                    I have read and understood the Privacy Notice.
                    <span className="s5-required"> *</span>
                </label>
                <label className={`s5-checkbox-label ${errors.includes("acceptTerms") ? "s5-label-error" : ""}`} style={{ marginTop: 12 }} id="s5-acceptTerms">
                    <input
                        type="checkbox"
                        checked={data.acceptTerms || false}
                        onChange={e => set("acceptTerms", e.target.checked)}
                    />
                    I accept the Terms & Conditions and agree to comply.
                    <span className="s5-required"> *</span>
                </label>
            </div>

            <div className="s5-card">
                <h4 className="s5-card-title">Declaration</h4>
                <ul className="s5-declaration-list">
                    <li>I confirm the information provided is true and correct.</li>
                    <li>I understand I must provide a USI to receive certification (where applicable).</li>
                    <li>I understand STA policies apply (training, assessment, complaints/appeals and privacy).</li>
                </ul>
                <div className="s5-row-2" style={{ marginTop: 16 }}>
                    <div className="s5-field">
                        <label className={`s5-label ${errors.includes("studentName") ? "s5-label-error" : ""}`}>
                            Student Name <span className="s5-required">*</span>
                        </label>
                        <input
                            id="s5-studentName"
                            className={`s5-input ${errors.includes("studentName") ? "s5-input-error" : ""}`}
                            value={data.studentName || ""}
                            onChange={e => set("studentName", e.target.value)}
                        />
                    </div>
                    <div className="s5-field">
                        <label className={`s5-label ${errors.includes("declarationDate") ? "s5-label-error" : ""}`}>
                            Date <span className="s5-required">*</span>
                        </label>
                        <input
                            id="s5-declarationDate"
                            type="date"
                            className={`s5-input ${errors.includes("declarationDate") ? "s5-input-error" : ""}`}
                            value={data.declarationDate || ""}
                            onChange={e => set("declarationDate", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="s5-photo-header">
                <h4 className="s5-photo-header-title">PHOTO AND ID CARD</h4>
                <p className="s5-photo-header-text">
                    Please upload a clear copy of your identification document(s). Files must be readable.
                </p>
                <p className="s5-photo-header-text">
                    Accepted: PDF, JPG, PNG. Example: Passport / Driver Licence.
                </p>
            </div>

            <div className="s5-upload-row">

                {/* ✅ ID Document upload card */}
                <div className="s5-upload-card" id="s5-idDocument">
                    <div className="s5-upload-card-header">
                        <span className="s5-upload-icon">📄</span>
                        <span className={`s5-upload-label ${errors.includes("idDocument") ? "s5-label-error" : ""}`}>
                            Identification document <span className="s5-required">*</span>
                        </span>
                    </div>
                    <p className="s5-upload-hint">e.g. Passport / Driver Licence</p>
                    <div
                        className={`s5-dropzone ${(data.idDocument || data.idDocumentUrl) ? "s5-dropzone-active" : ""} ${idFileError || errors.includes("idDocument") ? "s5-dropzone-error" : ""}`}
                        onClick={() => handleFileClick("s5-id-input")}
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
                    {/* ✅ ID error message */}
                    {idFileError && (
                        <div className="s5-file-error">
                            <span className="s5-file-error-icon">⚠</span>
                            {idFileError}
                        </div>
                    )}
                    <input
                        id="s5-id-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={{ display: "none" }}
                        onChange={e => handleIdUpload(e.target.files[0])}
                    />
                </div>

                {/* ✅ Photo upload card */}
                <div className="s5-upload-card" id="s5-photoDocument">
                    <div className="s5-upload-card-header">
                        <span className="s5-upload-icon">🖼️</span>
                        <span className={`s5-upload-label ${errors.includes("photoDocument") ? "s5-label-error" : ""}`}>
                            Upload a Photo <span className="s5-required">*</span>
                        </span>
                    </div>
                    <p className="s5-upload-hint">Example: Upload a Photo.</p>
                    <div
                        className={`s5-dropzone ${(data.photoDocument || data.photoDocumentUrl) ? "s5-dropzone-active" : ""} ${photoFileError || errors.includes("photoDocument") ? "s5-dropzone-error" : ""}`}
                        onClick={() => handleFileClick("s5-photo-input")}
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
                    {/* ✅ Photo error message */}
                    {photoFileError && (
                        <div className="s5-file-error">
                            <span className="s5-file-error-icon">⚠</span>
                            {photoFileError}
                        </div>
                    )}
                    <input
                        id="s5-photo-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={{ display: "none" }}
                        onChange={e => handlePhotoUpload(e.target.files[0])}
                    />
                </div>

            </div>

            <p className="s5-upload-footer-note">
                Ensure documents are clear and readable. Accepted: PDF, JPG, PNG. Max 5MB per file.
            </p>

            <div className="s5-card" id="s5-signature">
                <label className={`s5-label ${errors.includes("signature") ? "s5-label-error" : ""}`}>
                    Online Signature <span className="s5-required">*</span>
                </label>
                <div className={`s5-signature-wrapper ${errors.includes("signature") ? "s5-dropzone-error" : ""}`}>
                    <canvas
                        ref={canvasRef}
                        className="s5-signature-canvas"
                        width={620}
                        height={200}
                        onMouseDown={startDraw}
                        onMouseMove={draw}
                        onMouseUp={endDraw}
                        onMouseLeave={endDraw}
                        onTouchStart={startDraw}
                        onTouchMove={draw}
                        onTouchEnd={endDraw}
                    />
                    <div className="s5-signature-footer">
                        <button className="s5-clear-btn" onClick={clearSignature}>
                            Clear
                        </button>
                        <span className="s5-signature-hint">
                            Draw with your mouse or trackpad inside the box.
                        </span>
                    </div>
                </div>
            </div>

            {/* ✅ PREVIEW with DELETE buttons */}
            {(data.idDocument || data.photoDocument || data.signature ||
              data.idDocumentUrl || data.photoDocumentUrl || data.signatureUrl) && (
                <div className="s5-preview-section">
                    <h4 className="s5-card-title">Preview</h4>
                    <div className="s5-preview-row">

                        {/* ID Document */}
                        {(data.idDocument || data.idDocumentUrl) && (
                            <div className="s5-preview-item" style={{ position: "relative" }}>
                                <button
                                    onClick={() => handleDelete(data.idDocumentUrl, "idDocument", ["idDocument", "idDocumentUrl"])}
                                    style={deleteButtonStyle}
                                >✕</button>
                                <p className="s5-preview-label">ID Document</p>
                                {data.idDocument ? (
                                    data.idDocument.type === "application/pdf" ? (
                                        <p className="s5-preview-pdf">📄 {data.idDocument.name}</p>
                                    ) : (
                                        <img src={URL.createObjectURL(data.idDocument)} alt="ID" className="s5-preview-img" />
                                    )
                                ) : data.idDocumentUrl?.endsWith(".pdf") ? (
                                    <a href={data.idDocumentUrl} target="_blank" rel="noreferrer" className="s5-preview-pdf">📄 View ID Document</a>
                                ) : (
                                    <img src={data.idDocumentUrl} alt="ID" className="s5-preview-img" />
                                )}
                            </div>
                        )}

                        {/* Photo */}
                        {(data.photoDocument || data.photoDocumentUrl) && (
                            <div className="s5-preview-item" style={{ position: "relative" }}>
                                <button
                                    onClick={() => handleDelete(data.photoDocumentUrl, "photoDocument", ["photoDocument", "photoDocumentUrl"])}
                                    style={deleteButtonStyle}
                                >✕</button>
                                <p className="s5-preview-label">Photo</p>
                                {data.photoDocument ? (
                                    data.photoDocument.type === "application/pdf" ? (
                                        <p className="s5-preview-pdf">📄 {data.photoDocument.name}</p>
                                    ) : (
                                        <img src={URL.createObjectURL(data.photoDocument)} alt="Photo" className="s5-preview-img" />
                                    )
                                ) : data.photoDocumentUrl?.endsWith(".pdf") ? (
                                    <a href={data.photoDocumentUrl} target="_blank" rel="noreferrer" className="s5-preview-pdf">📄 View Photo</a>
                                ) : (
                                    <img src={data.photoDocumentUrl} alt="Photo" className="s5-preview-img" />
                                )}
                            </div>
                        )}

                        {/* Signature */}
                        {(data.signature || data.signatureUrl) && (
                            <div className="s5-preview-item" style={{ position: "relative" }}>
                                <button
                                    onClick={() => handleDelete(data.signatureUrl, "signature", ["signature", "signatureUrl"])}
                                    style={deleteButtonStyle}
                                >✕</button>
                                <p className="s5-preview-label">Online Signature</p>
                                <img
                                    src={data.signature || data.signatureUrl}
                                    alt="signature"
                                    className="s5-preview-signature"
                                />
                            </div>
                        )}

                    </div>
                </div>
            )}



            <div className="s5-footer">
                <button className="s5-prev-btn" onClick={prev}>
                    Previous
                </button>
                <button className="s5-submit-btn" onClick={handleSubmit}>
                    Submit Enrollment
                </button>
            </div>

            <ValidationToast 
                show={showErrorToast} 
                onOk={closeErrorToastAndScroll} 
                missingFields={missingFieldsNames} 
            />

        </div>
    )
}

export default EnrollmentSection5