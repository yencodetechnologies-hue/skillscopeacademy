import "../../styles/TrustBar.css"

function TrustBar() {
    return (
        <div className="trust-bar">
            <div className="trust-container">

                <div className="trust-item">
                    <div className="trust-icon-wrap">
                        <i className="fa-solid fa-building trust-icon"></i>
                    </div>
                    <div className="trust-text">
                        <p className="trust-title">RTO<br />#45234</p>
                        <div className="trust-underline"></div>
                        <p className="trust-desc">Registered Training Organisation</p>
                    </div>
                </div>

                <div className="trust-divider"></div>

                <div className="trust-item">
                    <div className="trust-icon-wrap">
                        <i className="fa-solid fa-user-group trust-icon"></i>
                    </div>
                    <div className="trust-text">
                        <p className="trust-title">Face to Face<br />Training</p>
                        <p className="trust-desc">Practical hands-on learning</p>
                    </div>
                </div>

                <div className="trust-divider"></div>

                <div className="trust-item">
                    <div className="trust-icon-wrap">
                        <i className="fa-solid fa-award trust-icon"></i>
                    </div>
                    <div className="trust-text">
                        <p className="trust-title">Qualified<br />Trainers</p>
                        <p className="trust-desc">Industry experienced experts</p>
                    </div>
                </div>

                <div className="trust-divider"></div>

                <div className="trust-item">
                    <div className="trust-icon-wrap">
                        <i className="fa-regular fa-file-lines trust-icon"></i>
                    </div>
                    <div className="trust-text">
                        <p className="trust-title">Nationally<br />Recognized</p>
                        <p className="trust-desc"><strong>Certificates accepted Australia-wide</strong></p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default TrustBar