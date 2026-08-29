import { colors } from '../../constants/theme';
import "../../styles/LLNDComplete.css"
import { FaCheckCircle } from "react-icons/fa"
import { useState, useEffect } from "react"
import { API_URL } from "../../data/service"
import { authHeaders } from "../../utils/authHeaders"

function LLNDAssessmentComplete({ data, onRetry, attempt, onContinue, flowId: flowIdProp }) {
    const [isSaving, setIsSaving] = useState(false)
    const [countdown, setCountdown] = useState(3)
    const [autoStarted, setAutoStarted] = useState(false)

    const safeData = data || {
        total: 0,
        correct: 0,
        percentage: 0,
        sections: []
    }

    const isOverallPass = safeData.percentage >= 67;
    const isAllSectionsPass = safeData.sections.every(
        (s) => s.status === "Passed"
    );
    const isPassed = isOverallPass && isAllSectionsPass;

    const handleSaveAndContinue = async () => {
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
            const res = await fetch(`${API_URL}/api/flow/llnd`, {
                method: "POST",
                headers: authHeaders({ "Content-Type": "application/json" }),
                body: JSON.stringify(payload)
            })
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || "Failed to save assessment")
            }
            onContinue()
        } catch (err) {
            console.error(err)
            alert(err.message || "Failed to save assessment")
        } finally {
            setIsSaving(false)
        }
    }

    useEffect(() => {
        if (isPassed && !isSaving && !autoStarted) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        setAutoStarted(true)
                        handleSaveAndContinue()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [isPassed, isSaving, autoStarted])

  return (
    <div className="llnd-complete-card">

      <div className="llnd-header">
        📋 Step 3: LLND Assessment - Complete
      </div>

      <div className={`llnd-body ${isPassed ? "pass-bg" : "fail-bg"}`}>

        <FaCheckCircle className="complete-icon" />

        <h3>
          {isPassed ? "Assessment Passed!" : "Assessment Completed"}
        </h3>

        <p className="sub-text">
          {isPassed
            ? "Congratulations! You have successfully passed the LLND assessment."
            : "You have completed the assessment. Please reattempt to continue."
          }
        </p>

        <p className="attempt">Attempt {attempt} of 4</p>

        <p className="score">
          Total: {data.correct}/{data.total} ({data.percentage}%)
        </p>

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

        {!isPassed && (
          <button className="retry-btn" onClick={onRetry}>
            Retry Again
          </button>
        )}

      </div>

      {isPassed && (
        <div className="continue-wrapper">
          <div className="auto-redirect-info" style={{ textAlign: "center", marginBottom: "15px", color: colors.brandPrimary, fontWeight: "600" }}>
              {countdown > 0 && !autoStarted && `Auto-continuing to Enrollment Form in ${countdown}s...`}
          </div>
          <button
            className="continue-btn"
            disabled={isSaving}
            onClick={() => {
                setAutoStarted(true)
                handleSaveAndContinue()
            }}
          >
            {isSaving ? "Saving..." : "Continue to Enrollment Form →"}
          </button>
        </div>
      )}

    </div>
  )
}

export default LLNDAssessmentComplete