import { useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import "./VocMain.css"
import VocStepper from "./VocStepper.jsx"
import VocStep1 from "./VocStep1.jsx"
import VocStep2 from "./VocStep2.jsx"
import VocStep3 from "./VocStep3.jsx"
import TopNav from "../landingPage/TopNav"
import TrustBar from "../landingPage/TrustBar"
import PublicNavbar from "../PublicNavbar"
import Footer from "../landingPage/Footer"

function Voc() {

    // ?courseId=... arrives when the user lands here from a Course card or
    // the "Already Trained? Book VOC" button on the Course Details page.
    const [searchParams] = useSearchParams()
    const preselectedCourseId = searchParams.get("courseId") || ""

    const navigate = useNavigate()

    const [step, setStep] = useState(1)

    const [details, setDetails] = useState({
        firstName: "", lastName: "", email: "",
        phone: "", studentId: "",
        streetAddress: "", city: "", state: "", postcode: ""
    })

    const [courses, setCourses] = useState([])

    return (
        <section className="voc-page">
            <TopNav />
            <PublicNavbar />

            <div className="voc-container">

                <VocStepper step={step} />

                {step === 1 && (
                    <VocStep1
                        data={details}
                        setData={setDetails}
                        onNext={() => setStep(2)}
                    />
                )}

                {step === 2 && (
                    <VocStep2
                        courses={courses}
                        setCourses={setCourses}
                        onNext={() => setStep(3)}
                        onBack={() => setStep(1)}
                        preselectedCourseId={preselectedCourseId}
                    />
                )}

                {step === 3 && (
                    <VocStep3
                        details={details}
                        courses={courses}
                        onBack={() => setStep(2)}
                        onComplete={() => setStep(4)}
                    />
                )}

                {step === 4 && (
                    <div className="voc-done">
                        <div className="voc-done-icon">✅</div>
                        <h2>Registration Complete!</h2>
                        <p>
                            A confirmation email has been sent to <strong>{details.email}</strong>.
                        </p>
                        <button
                            type="button"
                            className="voc-done-home-btn"
                            onClick={() => navigate("/")}
                        >
                            ← Back to Home
                        </button>
                    </div>
                )}

            </div>

            <Footer />
        </section>
    )
}

export default Voc