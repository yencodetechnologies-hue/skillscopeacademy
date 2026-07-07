import { useState } from "react"
import "../../styles/Language.css"
import familyImage from "../../assets/family.jpg"
import llndAudio from "../../assets/Question Audio.mp3"

const languageQuestions = [
  {
    type: "audio-image-dropdown",

    audio: "/audio/carlos.mp3",
    image: familyImage,

    note: "Note: You can listen to recording more than once.",

    subQuestions: [
      {
        label: "(a) When did Carlos and Marina emigrate to Australia?",
        options: ["January 2020", "May 2020", "September 2020", "December 2020"]
      },
      {
        label: "(b) How many children do they have?",
        options: ["1", "2", "3", "4"]
      },
      {
        label: "(c) What type of visa did they enter Australia on?",
        options: ["Tourist Visa", "Work Visa", "Skilled Migration Visa", "Student Visa"]
      },
      {
        label: "(d) What job does Marina do?",
        options: [ "Teacher","Nurse", "Computer Programmer", "Engineer"]
      },
      {
        label: "(e) Are they doing their English class in the evening or during the day?",
        options: ["Morning","Afternoon", "Evening","Night"]
      },
      {
        label: "(f) Where are they doing their English course?",
        options: ["Online", "University","Local TAFE",  "Community Center"]
      }
    ]
  }
]

function Language({ next }) {

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})

  const question = languageQuestions[index]

  const handleAnswer = (subIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [`${index}-${subIndex}`]: value
    }))
  }

  const handleNext = () => {

    // ✅ validation for dropdowns
    if (question.subQuestions) {
      for (let i = 0; i < question.subQuestions.length; i++) {
        if (!answers[`${index}-${i}`]) return
      }
    }

    // ✅ navigation
    if (index < languageQuestions.length - 1) {
      setIndex(index + 1)
    } else {

 

      const correctAnswers = {
        "0-0": "May 2020",
        "0-1": "2",
        "0-2": "Skilled Migration Visa",
        "0-3": "Computer Programmer",
        "0-4": "Evening",
        "0-5": "Local TAFE"
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

  return (
    <div className="language-container">

      {question.type === "audio-image-dropdown" && (
        <div className="language-box">

          {/* TITLE */}
          <h4 className="language-title">LANGUAGE</h4>

          <p className="language-heading">
            Listen to the story about Carlos
          </p>

          {/* AUDIO + IMAGE */}
          <div className="language-passage">

            <p className="audio-note">{question.note}</p>

            <audio controls className="audio-player">
              <source src={llndAudio} type="audio/mpeg" />
            </audio>

            <img src={question.image} alt="family" className="passage-img" />

          </div>

          {/* DROPDOWNS */}
          {question.subQuestions && (
            <>
              <p className="language-subtitle">
                2. Choose the correct answer in each drop-down list:
              </p>

              {question.subQuestions.map((item, i) => (
                <div key={i} className="language-dropdown-group">

                  <label>{item.label}</label>

                  <select
                    className="language-select"
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
            </>
          )}

          {/* FOOTER */}
          <div className="language-footer">

            <button
              className="prev-btn"
              onClick={handlePrev}
              disabled={index === 0}
            >
              Previous
            </button>

            <span>
              Question {index + 1} of {languageQuestions.length}
            </span>

            <button
              className="next-btn"
              onClick={handleNext}
            >
              {index === languageQuestions.length - 1
                ? "Submit Section"
                : "Next"}
            </button>

          </div>

        </div>
      )}

    </div>
  )
}

export default Language