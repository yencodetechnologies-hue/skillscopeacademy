import { useState } from "react"
import "../../styles/Literacy.css"
import poster from "../../assets/infection_control.png"

const literacyQuestions = [
    {
        type: "email",

        passage: `From:
Silvia <silvia@commercialtyres.com.au>

To:
Mike <mike@bridgestone.com.au>

Subject:
Tyres needed - Order no 2457

Hi Mike,
Thank you for your quote Number 2457. I would like to place an order for the following items:

• x 20 Bridgestone Supercat PSR at $109 each including gst.
• x 20 Bridgestone Dueler A/T D697 at $225 each including gst.
• x 20 Bridgestone Turanza Serenity Plus at $185 each including gst.

Can you please ship them to our Port Melbourne warehouse...

Thank you,
Silvia Chinoto`,

        subQuestions: [
            {
                label: "a. Who is the email from?",
                options: ["Silvia", "Mike", "Bridgestone", "Port Melbourne"]
            },
            {
                label: "b. Who is the email to?",
                options: ["Silvia", "Mike", "Bridgestone", "Silvia Chinoto"]
            },
            {
                label: "c. What is the subject?",
                options: [
                    "Tyres needed - Order no 2457",
                    "Quote Number 2457",
                    "Bridgestone Order",
                    "Port Melbourne Warehouse"
                ]
            },
            {
                label: "d. What company does Mike work for?",
                options: [
                    "Silvia Commercial",
                    "Port Melbourne",
                    "Bridgestone",
                    "Turanza Serenity"
                ]
            }
        ]
    },

    {
        type: "image",
        image: poster,

        subQuestions: [
            {
                label: "(a) Whose responsibility is it to keep patients safe from infection?",
                options: [
                    "Everyone",
                    "Doctors only",
                    "Nurses only",
                    "Patients only"
                ]
            },
            {
                label: "(b) How many ways does the poster tell you to keep patients safe?",
                options: ["5", "7", "9", "11"]
            },
            {
                label: "(c) How many times should you use a needle and syringe?",
                options: ["1", "2", "3 ", "As many as needed"]
            },
            {
                label: "(d) When should you clean your hands?",
                options: [
                    "Before providing care ",
                    "After providing care ",
                    "Before and after providing care",
                    "Only when dirty"
                ]
            }
        ]
    },
    {
        type: "scenario",

        scenario: `Jenny is a full time worker in the Moulding section. Her ID number is JEN-123.

Jenny only used one hand getting onto the forklift and slipped. She bruised her right hip falling onto the ground.

The accident happened at 10 am on the 6th of February. An ice pack was put on Jenny's hip.

The accident was reported at 10:30 am on the same day.`,

        form: {
            name: "Jenny",
            sex: "Female",
            section: "Moulding",
            id: "JEN-123",
            employment: "Full Time",
            incident: "Date: 6 of Feb, Time: 10:00 am"
        },

        subQuestions: [
            {
                label: "a) Jenny only used one ____ getting onto the",
                options: ["hand", "foot", "arm", "leg"]
            },
            {
                label: "b) getting onto the ____",
                options: ["forklift", "truck", "ladder", "platform"]
            },
            {
                label: "c) She bruised her right hip falling onto the ____",
                options: ["ground", "floor", "concrete", "surface"]
            },
            {
                label: "d) An ____ was put on Jenny's hip",
                options: ["ice pack", "bandage", "ointment", "compress"]
            },
            {
                label: "e) Medical Treatment:",
                options: ["None", "First Aid", "Doctor Only", "Hospital"]
            }
        ]
    },
    {
        type: "mcq",
        passage: `"All workers must wear hard hats, steel-capped boots and high-visibility vests while on a construction site. Personal protective equipment (PPE) must be checked daily. Report any damaged PPE or equipment immediately to the site supervisor. Workers must follow all safety signs and instructions at all times."`,


        options: [
            "Steel-capped boots, safety glasses, high-visibility vests",
            "Hard hats, steel-capped boots, high-visibility vests",
            "Safety glasses, gloves, ear plugs",
            "Safety glasses, hard hats, gloves"
        ]
    },
    {
        type: "mcq-group",

        passage: `"All workers must wear hard hats, steel-capped boots and high-visibility vests while on a construction site. Personal protective equipment (PPE) must be checked daily. Report any damaged PPE or equipment immediately to the site supervisor. Workers must follow all safety signs and instructions at all times."`,

        questions: [
            
            {
                question: "Who should workers report damaged PPE or equipment to?",
                options: [
                    "The safety sign",
                    "A co-worker",
                    "The equipment supplier",
                    "The site supervisor"
                ]
            }
        ]
    },
    {
        type: "image-mcq",

        passage: `"All workers must wear hard hats, steel-capped boots and high-visibility vests while on a construction site. Personal protective equipment (PPE) must be checked daily. Report any damaged PPE or equipment immediately to the site supervisor. Workers must follow all safety signs and instructions at all times."`,

        image: poster, // or new image

        question: "Which instruction must workers follow according to the notice?",

        options: [
            "Follow all safety signs and instructions",
            "Report to work before 6:00 am",
            "Take breaks every two hours",
            "Only wear PPE when using tools"
        ]
    }
]

function Literacy({ next }) {

    const [index, setIndex] = useState(0)
    const [answers, setAnswers] = useState({})
    const [mcqIndex, setMcqIndex] = useState(0)
    const question = literacyQuestions[index]
    const [mcqAnswers, setMcqAnswers] = useState({})
    const handleAnswer = (subIndex, value) => {
        setAnswers(prev => ({
            ...prev,
            [`${index}-${subIndex}`]: value
        }))
    }
    const handleNext = () => {

        // ✅ MCQ validation
        if (question.type === "mcq") {
            if (!mcqAnswers[index]) return
        }

        // ✅ MCQ-GROUP validation
        if (question.type === "mcq-group") {
            if (!mcqAnswers[`${index}-${mcqIndex}`]) return
        }

        // ✅ Dropdown validation
        if (question.subQuestions) {
            const totalSubQ = question.subQuestions.length

            for (let i = 0; i < totalSubQ; i++) {
                if (!answers[`${index}-${i}`]) return
            }
        }

        // ✅ MCQ-GROUP navigation (inside same question)
        if (question.type === "mcq-group") {
            if (mcqIndex < question.questions.length - 1) {
                setMcqIndex(mcqIndex + 1)
                return
            } else {
                setMcqIndex(0)
            }
        }

        // ✅ MAIN navigation
        if (index < literacyQuestions.length - 1) {
            setIndex(index + 1)
        } else {



const correctAnswers = {
    "0-0": "Silvia",
    "0-1": "Mike",
    "0-2": "Tyres needed - Order no 2457",
    "0-3": "Bridgestone",
    "1-0": "Everyone",
    "1-1": "9",
    "1-2": "1",
    "1-3": "Before and after providing care",
    "2-0": "hand",
    "2-1": "forklift",
    "2-2": "ground",
    "2-3": "ice pack",
    "2-4": "First Aid",
    3: "Hard hats, steel-capped boots, high-visibility vests",   
    "4-0": "The site supervisor",                                 
    5: "Follow all safety signs and instructions",               
}

            let score = 0

            Object.keys(correctAnswers).forEach(key => {
                const value =
                    answers[key] ??
                    mcqAnswers[key] ??
                    mcqAnswers[Number(key)]   // number key la save aana mcq answers

                if (value === correctAnswers[key]) {
                    score++
                }
            })


            next(answers)
        }
    }

    const handlePrev = () => {
        if (index > 0) {
            setIndex(index - 1)
        }
    }
    const handleMCQ = (value, subIndex = null) => {
        if (subIndex !== null) {
            setMcqAnswers(prev => ({
                ...prev,
                [`${index}-${subIndex}`]: value
            }))
        } else {
            setMcqAnswers(prev => ({
                ...prev,
                [index]: value
            }))
        }
    }

    return (

        <div className="literacy-container">

            <h4 className="literacy-title">LITERACY</h4>

            <p className="literacy-question">
                1. Read the email
            </p>

            {question.type === "email" && (
                <div className="literacy-passage">
                    <pre>{question.passage}</pre>
                </div>
            )}

            {question.type === "image" && (
                <div className="literacy-image-box">
                    <img src={question.image} alt="poster" />
                </div>
            )}
            {question.type === "scenario" && (
                <div className="literacy-scenario-box">

                    <h5 className="scenario-title">SCENARIO</h5>

                    <p className="scenario-text">
                        {question.scenario}
                    </p>

                    <div className="incident-form">
                        <h5>Incident Report Form</h5>

                        <div className="form-row">
                            <label>Name:</label>
                            <input value={question.form.name} readOnly />
                        </div>

                        <div className="form-row">
                            <label>Sex:</label>
                            <input value={question.form.sex} readOnly />
                        </div>

                        <div className="form-row">
                            <label>Section:</label>
                            <input value={question.form.section} readOnly />
                        </div>

                        <div className="form-row">
                            <label>ID Number:</label>
                            <input value={question.form.id} readOnly />
                        </div>

                        <div className="form-row">
                            <label>Employment:</label>
                            <input value={question.form.employment} readOnly />
                        </div>

                        <div className="form-row">
                            <label>Describe the incident:</label>
                            <input value={question.form.incident} readOnly />
                        </div>

                    </div>

                </div>
            )}
            {question.type === "mcq" && (
                <div className="literacy-mcq-box">

                    <p className="literacy-mcq-question">
                        {question.question}
                    </p>
                    <div className="literacy-passage">
                        <p>{question.passage}</p>
                    </div>
                    <div className="literacy-icons">

                        <span>🪖</span>
                        <span>🧤</span>
                        <span>👂</span>
                        <span>👢</span>
                        <span>🦺</span>

                    </div>

                    <div className="mcq-options">
                        {question.options.map((opt, i) => (

                            <label key={i} className="mcq-option">

                                <input
                                    type="radio"
                                    name={`mcq-${index}`}
                                    value={opt}
                                    checked={mcqAnswers[index] === opt}
                                    onChange={() => handleMCQ(opt)}
                                />

                                <span>{opt}</span>

                            </label>

                        ))}
                    </div>

                </div>
            )}
            {question.type === "mcq-group" && (
                <div className="literacy-mcq-boxs">

                    {/* PASSAGE */}
                    <div className="literacy-passage">
                        <p>{question.passage}</p>
                    </div>

                    {/* CURRENT QUESTION */}
                    <p className="literacy-mcq-questions">
                        {question.questions[mcqIndex].question}
                    </p>

                    {/* OPTIONS */}
                    <div className="literacy-mcq-boxs" >
                        {question.questions[mcqIndex].options.map((opt, i) => (
                            <label key={i} >
                                <input
                                    type="radio"
                                    name={`mcq-${index}-${mcqIndex}`}
                                    onChange={() => handleMCQ(opt, mcqIndex)}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>
            )
            }
            {question.type === "image-mcq" && (
                <div className="literacy-mcq-box">
                    <div className="literacy-passage">
                        <p>{question.passage}</p>
                    </div>
                    {/* QUESTION */}
                    <p className="literacy-mcq-question">
                        {question.question}
                    </p>

                    {/* IMAGE BOX */}
                    <div className="literacy-icons">

                        <span>🪖</span>
                        <span>🧤</span>
                        <span>👂</span>
                        <span>🦺</span>

                    </div>

                    {/* OPTIONS (same style 🔥) */}
                    <div className="mcq-options">
                        {question.options.map((opt, i) => (

                            <label key={i} className="mcq-option">

                                <input
                                    type="radio"
                                    name={`mcq-${index}`}
                                    value={opt}
                                    checked={mcqAnswers[index] === opt}
                                    onChange={() => handleMCQ(opt)}
                                />

                                <span>{opt}</span>

                            </label>

                        ))}
                    </div>

                </div>
            )}


            {question.subQuestions && (
                <p className="literacy-subtitle">
                    2. Choose the correct answer:
                </p>
            )}

            {question.subQuestions && question.subQuestions.map((item, i) => (


                <div key={i} className="literacy-dropdown-group">

                    <label>{item.label}</label>
                    <select
                        className="literacy-select"
                        value={answers[`${index}-${i}`] || ""}
                        onChange={(e) => handleAnswer(i, e.target.value)}
                    >

                        <option value="">Select answer</option>

                        {item.options.map((opt, j) => (
                            <option key={j}>{opt}</option>
                        ))}

                    </select>

                </div>

            ))}

            <div className="literacy-footer">

                <button
                    className="literacy-prev-btn"
                    onClick={handlePrev}
                    disabled={index === 0}
                >
                    Previous
                </button>

                <span>
                    Question {index + 1} of {literacyQuestions.length}
                </span>

                <button
                    className="literacy-next-btn"
                    onClick={handleNext}
                >
                    {index === literacyQuestions.length - 1
                        ? "Submit Section"
                        : "Next"}
                </button>

            </div>

        </div>

    )
}

export default Literacy