// import Navbar from "../components/landingPage/Navbar"
// import Sidebar from "../components/Sidebar"
// import AdminDashborad from "./AdminDashboard"
// import { Outlet } from "react-router-dom"
// import "../styles/PortalLayout.css"

// function PortalLayout({ user }) {

//     return (

//         <div>

//             <Navbar user={user} />

//             <div style={{ display: "flex" }}>

//                 <Sidebar user={user} />

//                 <div style={{ flex: 1,  overflowY: "auto", height: "calc(100vh - 70px)",background:"#f0faff" }} className="main-layout-admin">
//                     <Outlet />
//                 </div>

//             </div>

//         </div>

//     )

// }

// export default PortalLayout

import Navbar from "../components/landingPage/Navbar"
import Sidebar from "../components/Sidebar"
import AdminDashborad from "./AdminDashboard"
import { Outlet } from "react-router-dom"
import "../styles/PortalLayout.css"

function PortalLayout({ user }) {

    return (

        <div>

            <Navbar user={user} />

            <div style={{ display: "flex" }}>

                <Sidebar user={user} />

                <div style={{ flex: 1, overflowY: "auto", height: "calc(100vh - 70px)", background: "#f5f7fa" }} className="main-layout-admin">
                    <Outlet />
                </div>

            </div>

        </div>

    )

}

export default PortalLayout