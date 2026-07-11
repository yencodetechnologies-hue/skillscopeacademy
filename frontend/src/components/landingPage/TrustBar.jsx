import "../../styles/TrustBar.css"

const TRUST_ITEMS = [
    {
        icon: "fa-solid fa-star",
        title: "10,000+",
        desc: "Students Trained",
    },
    {
        icon: "fa-solid fa-circle-check",
        title: "100%",
        desc: "Compliance Focused",
    },
 
    {
        icon: "fa-solid fa-user-group",
        title: "Face to Face Training",
        desc: "Practical hands-on learning",
    },
    {
        icon: "fa-solid fa-award",
        title: "Qualified Trainers",
        desc: "Industry experienced experts",
    },
    {
        icon: "fa-regular fa-file-lines",
        title: "Nationally Recognized",
        desc: "Certificates accepted Australia-wide",
    },
]

function TrustBar() {
    return (
        <div className="trust-bar">
            <div className="trust-container">
                {TRUST_ITEMS.map((item, i) => (
                    <div className="trust-item" key={i}>
                        <div className="trust-icon-wrap">
                            <i className={`${item.icon} trust-icon`}></i>
                        </div>
                        <div className="trust-text">
                            <p className="trust-title">{item.title}</p>
                          
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TrustBar