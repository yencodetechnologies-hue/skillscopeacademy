import "../../styles/TopNav.css"
import { ORG_PHONE_1300, ORG_PHONE_MOBILE } from "../../utils/organizationPhones"

function TopNav() {

    return (

        <div className="top-nav">

            <div className="top-nav-container">

                <div className="top-item">
                    <i className="fa-solid fa-phone"></i> 
                    <span style={{ display: "flex", gap: "8px" }}>
                        <a href={ORG_PHONE_1300.tel} style={{ color: "inherit", textDecoration: "none" }}>{ORG_PHONE_1300.display}</a>
                        <span style={{ opacity: 0.5 }}>|</span>
                        <a href={ORG_PHONE_MOBILE.tel} style={{ color: "inherit", textDecoration: "none" }}>{ORG_PHONE_MOBILE.display}</a>
                    </span>
                </div>

                <div className="top-item">
                    <i className="fa-regular fa-envelope"></i>
                    <a href="mailto:info@safetytrainingacademy.edu.au" style={{ color: "inherit", textDecoration: "none" }}>info@safetytrainingacademy.edu.au</a>
                </div>

                <div className="top-item">
                    <i className="fa-solid fa-location-dot"></i> 3/14-16 Marjorie Street, Sefton NSW 2162
                </div>

            </div>

        </div>

    )

}

export default TopNav