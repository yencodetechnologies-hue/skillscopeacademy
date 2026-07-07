import "../../styles/Navbar.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import Student from "../../components/Profile"

function Navbar({ user }) {
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const openSidebar = () => {
        setSidebarOpen(true)
        document.body.classList.add("sidebar-open")
    }

    const closeSidebar = () => {
        setSidebarOpen(false)
        document.body.classList.remove("sidebar-open")
    }

    const goProfile = () => {
        navigate("/student/profile")
        closeSidebar()
    }

    return (
        <>
            {/* Overlay - sidebar open-ஆ இருக்கும்போது background dim ஆகும் */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={closeSidebar} />
            )}

            {/* Mobile Sidebar */}
            <div className={`mobile-sidebar ${sidebarOpen ? "open" : ""}`}>
                <div className="sidebar-inner">
                    <span onClick={closeSidebar}>
                        <i className="fa-solid fa-xmark"></i>
                    </span>
                    <span><i className="fa-regular fa-bell"></i></span>
                    <span><i className="fa-solid fa-gear"></i></span>
                    {/* ✅ Mobile: user icon → profile */}
                    <span onClick={goProfile}>
                        <i className="fa-regular fa-user"></i>
                    </span>
                </div>
            </div>

            <section className="navbar">
                <div className="navbar-burger">
                  
                    <h2 className="navbar-title">{user?.role} Portal</h2>

                 
                    <div className="home-pg-btn" onClick={() => navigate("/")}>
                        <p className="home-text">Go To Home Page</p>
                        <i className="fa-solid fa-house home-icon"></i>
                    </div>
                </div>

                <div className="navbar-right">
                    {/* Desktop icons */}
                    <div className="desktop-icons">
                        <span><i className="fa-regular fa-bell"></i></span>
                        {/* ✅ Desktop: user icon → profile */}
                        <span onClick={goProfile} style={{ cursor: "pointer" }}>
                            <i className="fa-regular fa-user"></i>
                        </span>
                    </div>

                    {/* Mobile burger icon */}
                    <span className="burger-icon" onClick={openSidebar}>
                        <i className="fa-solid fa-bars"></i>
                    </span>
                </div>
            </section>
        </>
    )
}

export default Navbar