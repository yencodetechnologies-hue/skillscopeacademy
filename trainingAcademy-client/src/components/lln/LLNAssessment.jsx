import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../../styles/LLNAssessment.css"
import Numeracy from "./Numeracy"
import Literacy from "./Literacy"
import Language from "./Language"
import Digital from "./Digital"
import CourseResult from "./CourseResult"
import LLNAssessmentComplete from "./LLNAssessmentComplete"

const topics = ["Numeracy", "Literacy", "Language", "Digital"]

function LLNAssessment(props) {
    const { onComplete, userDetails } = props
    const [attempt, setAttempt] = useState(1)
    const [topicIndex, setTopicIndex] = useState(0)
    const navigate = useNavigate()
    const progress = ((topicIndex + 1) / topics.length) * 100
    const [isCompleted, setIsCompleted] = useState(false)
    const [resultData, setResultData] = useState(null)
    const [allAnswers, setAllAnswers] = useState({
        numeracy: {},
        literacy: {},
        language: {},
        digital: {}
    })
    const nextSection = (section, data) => {

        const updatedAnswers = {
            ...allAnswers,
            [section]: data
        }

        setAllAnswers(updatedAnswers)

        if (topicIndex < topics.length - 1) {
            setTopicIndex(topicIndex + 1)
        } else {
            calculateResult(updatedAnswers)
        }
    }
    const calculateResult = (answers) => {

        let total = 0
        let correct = 0
        let sectionResults = []

        // ---------------- NUMERACY ----------------
        const numeracyCorrect = {
            "0-0": "$96",
            "0-1": "$4",
            "1-0": "5 barriers",
            "1-1": "75 kg",
            "2-0": "201 kg",
            "2-1": "99 kg"
        }

        let numTotal = 0
        let numCorrect = 0

        Object.keys(answers.numeracy || {}).forEach(key => {
            numTotal++
            total++

            if (answers.numeracy[key] === numeracyCorrect[key]) {
                numCorrect++
                correct++
            }
        })

        const numPercent = ((numCorrect / numTotal) * 100) || 0

        sectionResults.push({
            name: "Numeracy",
            score: numPercent.toFixed(0),
            correct: numCorrect,  // ✅ add
            total: numTotal,
            status: numPercent >= 66 ? "Passed" : "Failed"
        })

        // ---------------- LANGUAGE ----------------
        let langTotal = Object.keys(answers.language || {}).length

        const languageCorrect = {
            "0-0": "May 2020",
            "0-1": "2",
            "0-2": "Skilled Migration Visa",
            "0-3": "Computer Programmer",
            "0-4": "Evening",
            "0-5": "Local TAFE"
        }

        let langCorrect = 0

        Object.keys(languageCorrect).forEach(key => {
            if (answers.language[key] === languageCorrect[key]) {
                langCorrect++
            }
        })

        total += langTotal
        correct += langCorrect

        const langPercent = langTotal ? (langCorrect / langTotal) * 100 : 0

        sectionResults.push({
            name: "Language",
            score: langPercent.toFixed(0),
            correct: langCorrect,  // ✅ add
            total: langTotal,
            status: langPercent >= 66 ? "Passed" : "Failed"
        })

        // ---------------- LITERACY ----------------
        let litTotal = Object.keys(answers.literacy || {}).length
        const literacyCorrect = {
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
            "3-0": "Hard hats, steel-capped boots, high-visibility vests",
            "4-0": "The site supervisor",
            "5-0": "Follow all safety signs and instructions",
        }

        let litCorrect = 0

        Object.keys(literacyCorrect).forEach(key => {
            if (answers.literacy[key] === literacyCorrect[key]) {
                litCorrect++
                correct++
            }
        })

        total += litTotal

        const litPercent = litTotal ? (litCorrect / litTotal) * 100 : 0

        sectionResults.push({
            name: "Literacy",
            score: litPercent.toFixed(0),
            correct: litCorrect,  // ✅ add
            total: litTotal,
            status: litPercent >= 66 ? "Passed" : "Failed"
        })

        // ---------------- DIGITAL ----------------
        let digiTotal = 9
        let digiCorrect = 0

        // FILE → 3
        const correctFiles = {
            "0-0": "pdf",
            "0-1": "pdf",
            "0-2": "image"
        }

        Object.keys(correctFiles).forEach(key => {
            if ((answers.digital || {})[key] === correctFiles[key]) {
                digiCorrect++
            }
        })

        // LABEL → 5
        const correctLabels = {
            "1-0": "Desktop Computer",
            "1-1": "2 in 1 / Laptop / Macbook",
            "1-2": "iPhone / iPad",
            "1-3": "Barcode Scanner",
            "1-4": "Photocopier"
        }

        Object.keys(correctLabels).forEach(key => {
            if ((answers.digital || {})[key] === correctLabels[key]) {
                digiCorrect++
            }
        })

        // URL → 1
        if (answers.digital["2"] === "https://safetytrainingacademy.edu.au") {
            digiCorrect++
        }

        total += digiTotal
        correct += digiCorrect

        const digiPercent = (digiCorrect / digiTotal) * 100

        sectionResults.push({
            name: "Digital Literacy",
            score: digiPercent.toFixed(0),
            correct: digiCorrect,
            total: digiTotal,
            status: digiPercent >= 67 ? "Passed" : "Failed"
        })

        // ---------------- ATTEMPT >= 4 FORCE PASS ----------------
        if (attempt >= 4) {
            const updatedSections = sectionResults.map(sec => {
                if (sec.status === "Failed") {
                    return {
                        ...sec,
                        score: 67,
                        status: "Passed"
                    }
                }
                return sec
            })

            const newCorrect = updatedSections.reduce((acc, s) => acc + Number(s.score), 0)
            const newTotal = updatedSections.length * 100
            const newPercentage = ((newCorrect / newTotal) * 100).toFixed(0)

            const forcedResult = {
                total,
                correct,
                percentage: newPercentage,
                status: "Passed",
                sections: updatedSections,
                name: userDetails?.name || "Student",
                email: userDetails?.email || "",
                phone: userDetails?.phone || "",
                date: new Date().toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }),
                answers: answers
            }

            setResultData(forcedResult)
            setIsCompleted(true)
            return
        }

        // ---------------- FINAL ----------------
        const percentage = ((correct / total) * 100).toFixed(2)
        const allPassed = sectionResults.every(sec => Number(sec.score) >= 66)
        const result = {
            total,
            correct,
            percentage,
            status: allPassed ? "Passed" : "Failed",
            sections: sectionResults,
            name: userDetails?.name || "Student",
            email: userDetails?.email || "",
            phone: userDetails?.phone || "",
            date: new Date().toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }),
            answers: answers
        }

        setResultData(result)
        setIsCompleted(true)
    }

    return (

        <div className="LLN-card" style={{ margin: "0% 10%" }}>

            <h3 className="LLN-h3"> LLN Assessment</h3>

            <p>
                Section {topicIndex + 1} of 4 : {topics[topicIndex]}
            </p>

            <div className="LLN-progress">
                <div
                    className="LLN-fill"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {!isCompleted ? (
                <>
                    {topicIndex === 0 && <Numeracy next={(data) => nextSection("numeracy", data)} />}
                    {topicIndex === 1 && <Literacy next={(data) => nextSection("literacy", data)} />}
                    {topicIndex === 2 && <Language next={(data) => nextSection("language", data)} />}
                    {topicIndex === 3 && <Digital next={(data) => nextSection("digital", data)} />}
                </>
            ) : (
                resultData?.status === "Passed" ? (
                    <CourseResult
                        data={resultData}
                        flowId={props.flowId}
                        onRetry={() => {
                            setTopicIndex(0)
                            setIsCompleted(false)
                        }}
                        onContinue={onComplete}
                    />
                ) : (
                    <LLNAssessmentComplete
                        attempt={attempt}
                        data={resultData}
                        flowId={props.flowId}
                        onContinue={onComplete}
                        onRetry={() => {
                            setTopicIndex(0)
                            setIsCompleted(false)
                            setAttempt(prev => prev + 1)

                        }}
                    />
                )
            )}

        </div>

    )
}

export default LLNAssessment