import "../../styles/LLNComplete.css"
import { FaCheckCircle } from "react-icons/fa"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../../data/service"

function LLNAssessmentComplete({ data, onRetry, attempt, onContinue, flowId: flowIdProp }) {
    const navigate = useNavigate()
    const [isSaving, setIsSaving] = useState(false)

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

  const handleContinue = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const flowId = flowIdProp || localStorage.getItem("flowId");

      if (!flowId || flowId === "null" || flowId === "undefined") {
        alert("Session expired or missing. Please refresh the dashboard and try again.");
        setIsSaving(false);
        return;
      }

      const payload = {
        flowId,
        ...data,
        answers: data.answers || [],
      };

      const res = await fetch(`${API_URL}/api/flow/LLN`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save assessment");
      }

      if (onContinue) {
        onContinue();
      } else {
        navigate("/student");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save assessment");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Auto-redirect if passed
  useEffect(() => {
    if (isPassed && !isSaving) {
      const timer = setTimeout(() => {
        handleContinue();
      }, 2000); // 2 second delay so they can see the "Passed" message
      return () => clearTimeout(timer);
    }
  }, [isPassed]);

  return (
    <div className="LLN-complete-card">

      <div className="LLN-header">
        📋 Step 3: LLN Assessment - Complete
      </div>

      <div className={`LLN-body ${isPassed ? "pass-bg" : "fail-bg"}`}>

        <FaCheckCircle className="complete-icon" />

        <h3>
          {isPassed ? "Assessment Passed!" : "Assessment Completed"}
        </h3>

        <p className="sub-text">
          {isPassed
            ? "Congratulations! You have successfully passed the LLN assessment."
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
          <button
            className="continue-btn"
            disabled={isSaving}
            onClick={handleContinue}
          >
            {isSaving ? "Saving..." : "Continue to Enrollment Form →"}
          </button>
        </div>
      )}

    </div>
  )
}

export default LLNAssessmentComplete