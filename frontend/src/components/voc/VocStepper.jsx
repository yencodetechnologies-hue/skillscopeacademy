import "./VocStepper.css"

const STEPS = [
    { num: 1, label: "YOUR DETAILS" },
    { num: 2, label: "COURSES" },
    { num: 3, label: "PAYMENT" },
    { num: 4, label: "DONE" },
]

function VocStepper({ step }) {
    return (
        <div className="vs-stepper">
            {STEPS.map((s) => {
                const done = step > s.num
                const active = step === s.num
                return (
                    <div key={s.num} className="vs-step-item">
                        <div className={`vs-circle ${done ? "vs-done" : active ? "vs-active" : ""}`}>
                            {done ? (
                                <svg viewBox="0 0 20 20" fill="none" className="vs-check">
                                    <path d="M4 10l4 4 8-8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : s.num}
                        </div>
                        <span className={`vs-label ${active ? "vs-label-active" : ""}`}>
                            {s.label}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

export default VocStepper