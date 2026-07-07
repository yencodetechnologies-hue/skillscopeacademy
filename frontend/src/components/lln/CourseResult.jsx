import { useNavigate } from "react-router-dom"
import "../../styles/CourseResult.css"
import { useState } from "react"
import { API_URL } from "../../data/service"
import * as Yup from "yup"

// Yup validation schema for declaration checkboxes
const declarationSchema = Yup.object().shape({
    agree1: Yup.boolean()
        .oneOf([true], "You must confirm that you completed this quiz honestly.")
        .required("This field is required."),
    agree2: Yup.boolean()
        .oneOf([true], "You must acknowledge that your score will be recorded.")
        .required("This field is required."),
})

function CourseResult({ onRetry, onContinue, data, flowId: flowIdProp }) {

    const navigate = useNavigate()
    const [agree1, setAgree1] = useState(false)
    const [agree2, setAgree2] = useState(false)
    const [errors, setErrors] = useState({})
    const [isSaving, setIsSaving] = useState(false)

    const validate = async () => {
        try {
            await declarationSchema.validate({ agree1, agree2 }, { abortEarly: false })
            setErrors({})
            return true
        } catch (err) {
            const fieldErrors = {}
            err.inner.forEach((e) => {
                fieldErrors[e.path] = e.message
            })
            setErrors(fieldErrors)
            return false
        }
    }

    return (
        <div className="result-overlay">
            <div className="result-card">
                <h2 className="result-title">Assessment Complete</h2>

                <div className="result-box">
                    <h4>Your Results:</h4>
                    <p>Total Questions: <span>{data.total}</span></p>
                    <p>Correct Answers: {data.correct}</p>
                    <p>Overall Percentage: <span>{data.percentage}%</span></p>

                    <div className="section-list">
                        {data.sections.map((s, i) => (
                            <div key={i} className="section-row">
                                <span>Section {i + 1}: {s.name}</span>
                                <span className={`badge ${s.status === "Passed" ? "pass" : "fail"}`}>
                                    {s.score}% - {s.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DECLARATION */}
                <div className="declaration">
                    <h4>Declaration</h4>
                    <p>Before proceeding, please confirm the following:</p>

                    <label>
                        <input
                            type="checkbox"
                            checked={agree1}
                            onChange={(e) => {
                                setAgree1(e.target.checked)
                                // Clear error on change
                                setErrors((prev) => ({ ...prev, agree1: "" }))
                            }}
                        />
                        I completed this quiz honestly and did not cheat in any way.
                    </label>
                    {errors.agree1 && <p className="error-message">{errors.agree1}</p>}

                    <label>
                        <input
                            type="checkbox"
                            checked={agree2}
                            onChange={(e) => {
                                setAgree2(e.target.checked)
                                // Clear error on change
                                setErrors((prev) => ({ ...prev, agree2: "" }))
                            }}
                        />
                        I understand that my score will be recorded under my name.
                    </label>
                    {errors.agree2 && <p className="error-message">{errors.agree2}</p>}

                    <p className="confirm-text">
                        Please confirm your name below and click <b>Continue</b> to proceed.
                    </p>

                    <div className="name-row">
                        <span><b>Name:</b> {data.name}</span>
                        <span><b>Date:</b> {data.date}</span>
                    </div>
                </div>

                <button
                    className="continue-btn"
                    disabled={isSaving}
                    onClick={async () => {
                        const isValid = await validate()
                        if (!isValid) return

                        setIsSaving(true)
                        try {
                            const flowId = flowIdProp || localStorage.getItem("flowId")

                            if (!flowId || flowId === "null" || flowId === "undefined") {
                                alert("Session expired or missing. Please refresh the dashboard and try again.")
                                setIsSaving(false)
                                return
                            }

                            const payload = {
                                flowId,
                                ...data,
                                answers: data.answers || []
                            }

                            const res = await fetch(`${API_URL}/api/flow/LLN`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload)
                            })

                            if (!res.ok) {
                                const errData = await res.json().catch(() => ({}))
                                throw new Error(errData.error || "Failed to save assessment")
                            }

                            if (onContinue) {
                                onContinue();
                            } else {
                                navigate("/student");
                            }
                        } catch (err) {
                            console.error(err)
                            alert(err.message || "Failed to save assessment")
                        } finally {
                            setIsSaving(false)
                        }
                    }}
                >
                    {isSaving ? "Saving..." : "Continue to Enrollment Form"}
                </button>
            </div>
        </div>
    )
}

export default CourseResult