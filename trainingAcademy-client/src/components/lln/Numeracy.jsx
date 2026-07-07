import { useState } from "react"
import "../../styles/Numeracy.css"
import hardHat from "../../assets/hard-hat.jpg"
import barrier from "../../assets/safety-barriers.png"
import scaffold from "../../assets/scaffold.png"

const numeracyQuestions = [
    {
        title: "NUMERACY",
        question: "A hard hat costs $32. How much will three hard hats cost?",
        image: hardHat,

        subQuestions: [
            {
                label: "(a) Total cost",
                options: ["$64", "$96", "$128","$160"]
            },
            {
                label: "(b) If you pay with $100 how much change will you get?",
                options: ["$2", "$4", "$6","$8"]
            }
        ]
    },

    {
        title: "NUMERACY",
        question: "A safety barrier is 2.4 metres long.",
        image: barrier,

        subQuestions: [
            {
                label: "(a) How many barriers are needed to cover 12 metres?",
                options: ["3 barriers","4 barriers", "5 barriers", "6 barriers"]
            },
            {
                label: "(b) If each barrier weighs 15 kg, what is the total weight of 5 barriers?",
                options: ["60 kg", "65 kg", "70 kg", "75 kg"]
            }
        ]
    },

    {
        title: "NUMERACY",
        question: "A scaffold has a maximum load of 300 kg. Worker A weighs 84 kg and carries 10 kg of tools. Worker B weighs 92 kg and carries 15 kg of tools.",
        image: scaffold,

        subQuestions: [
            {
                label: "(a) What is the combined total load of Worker A and B?",
                options: ["176 kg","186 kg", "196 kg", "201 kg"]
            },
            {
                label: "(b) How much load is left before the scaffold reaches its limit?",
                options: ["84 kg","94 kg", "99 kg", "104 kg"]
            }
        ]
    }
]

function Numeracy({ next }) {

    const [index, setIndex] = useState(0)
    const [answers, setAnswers] = useState({})
    const question = numeracyQuestions[index]

    const handleNext = () => {

        if (
            !answers[`${index}-0`] ||
            !answers[`${index}-1`]
            
        ) {
        
        return
    }

        if (index < numeracyQuestions.length - 1) {
            setIndex(index + 1)

        } else {

    const correctAnswers = {
        "0-0": "$96",
        "0-1": "$4",
        "1-0": "5 barriers",
        "1-1": "75 kg",
        "2-0": "201 kg",
        "2-1": "99 kg"
    }

    let score = 0

    Object.keys(correctAnswers).forEach(key => {
        if (answers[key] === correctAnswers[key]) {
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
    const handleAnswer = (subIndex, value) => {

        setAnswers(prev => ({
            ...prev,
            [`${index}-${subIndex}`]: value
        }))

    }

    return (

        <div className="numeracy-container">

            <h4 className="numeracy-title">NUMERACY</h4>

            <p className="numeracy-question">
                {question.question}
            </p>

            <div className="numeracy-image">
                <img src={question.image} alt="numeracy" />
            </div>

            <p className="numeracy-subtitle">
                2. Choose the correct answer in each drop-down list:
            </p>

            {question.subQuestions.map((item, i) => (

                <div
                    key={i}
                    className="numeracy-dropdown-group"
                >

                    <label>{item.label}</label>

                    <select
                        className="numeracy-select"
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

            <div className="numeracy-footer">

                <button
                    className="numeracy-prev-btn"
                    onClick={handlePrev}
                    disabled={index === 0}
                >
                    Previous
                </button>

                <div>
                    <span className="num-ques-m">LLN</span> <span className="num-ques-l">Question</span> {index + 1} of 3
                </div>

                <button
                    className="numeracy-next-btn"
                    onClick={handleNext}
                >

                    {index === 2 ? "Submit" : "Next"}

                </button>

            </div>

        </div>

    )

}

export default Numeracy