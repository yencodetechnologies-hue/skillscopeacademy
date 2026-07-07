import { use } from "react"
import "../../styles/ContactEnrollment.css"
import { Navigate, useNavigate } from "react-router-dom"

function ContactEnrollment() {
const navigate = useNavigate()
    return (

        <section className="contact-enroll-section">

            <div className="contact-container">

                {/* LEFT FORM */}

                <div className="contact-form-box">

                    <h2>Send Us A Message!</h2>

                    <form>

                        <div className="form-row">

                            <input type="text" placeholder="Name*" />

                            <input type="text" placeholder="Phone*" />

                        </div>

                        <input type="email" placeholder="Email*" />

                        <input type="text" placeholder="Subject" />

                        <textarea placeholder="Message"></textarea>

                        <button className="send-btn">
                            SEND ✈
                        </button>

                    </form>

                </div>


                {/* RIGHT CONTENT */}

                <div className="enroll-content">

                    <h2>Course Enrolment</h2>

                    <p>
                        To enrol for a Course with Safety Training Academy,
                        please complete our online Enrolment form via the button below:
                    </p>

                    <div className="enroll-buttons">

                        <button className="enrol-btn entrol-btn-landing" onClick={()=>{navigate("/book-now")}} >
                            ENROL NOW
                        </button>


                        <button className="voc-btn" onClick={()=>{navigate("/voc")}}>
                            VOC
                        </button>

                    </div>

                </div>

            </div>

        </section>

    )

}

export default ContactEnrollment