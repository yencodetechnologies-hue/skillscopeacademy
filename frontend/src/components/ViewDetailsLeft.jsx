import "../styles/ViewDetailsLeft.css"
function ViewDetailsLeft({ course }) {

    return (

        <div className="view-details-left">
           


            {/* COMBO OFFER */}

            {course?.comboEnabled && (
                <div className="course-combo-div">

                    <p className="combo-label">
                        SPECIAL COMBO OFFER
                    </p>

                    <h2>
                        Save More with Our Combo Package!
                    </h2>

                    <p className="-course">
                        {course?.comboDescription}
                    </p>

                    <div className="combo-bottom">

                        <div>
                            <p>Combo Price</p>
                            <h3>${course?.comboPrice}</h3>
                        </div>

                        <div>
                            <p>Duration</p>
                            <h3>{course?.comboDuration}</h3>
                        </div>

                        <button className="combo-btn-course">
                            Book Combo Now
                        </button>

                    </div>

                </div>
            )}


            {/* DESCRIPTION */}

            <div className="course-section">

                <h3>Course Description</h3>

                {course?.description?.map((line, index) => (
                    <p key={index}>{line}</p>
                ))}

            </div>


            {/* REQUIREMENTS */}

            <div className="course-section">

                <h3>Entry Requirements</h3>

                {course?.requirements?.map((line, index) => (
                    <p key={index}>⚡ {line}</p>
                ))}

            </div>


            {/* FEES */}

            <div className="course-section">

                <h3>Fees and Charges</h3>

                {course?.feesCharges?.map((line, index) => (
                    <p key={index}>✔ {line}</p>
                ))}

            </div>

            <div className="course-section">

                <h3>What you will Learn</h3>

                {course?.trainingOverview?.map((line, index) => (
                    <p key={index}>✔ {line}</p>
                ))}

            </div>

        </div>

    )

}

export default ViewDetailsLeft