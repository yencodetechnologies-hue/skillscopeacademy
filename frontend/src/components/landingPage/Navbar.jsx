import "../../styles/Navbar.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useContext} from "react";
import AdminProfile from "../AdminProfile";
import { AuthContext } from "../../context/AuthContext";

function Navbar({ user }) {
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);

    const profileRef = useRef(null);
    const { logout } = useContext(AuthContext);

    /* =========================================================
       SIDEBAR
    ========================================================= */

    const openSidebar = () => {
        setSidebarOpen(true);
        document.body.classList.add("sidebar-open");
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
        document.body.classList.remove("sidebar-open");
    };

    /* =========================================================
       PROFILE
    ========================================================= */

    const goProfile = () => {
        setProfileModalOpen(true);
        setProfileOpen(false);
        closeSidebar();
    };

    /* =========================================================
       LOGOUT
    ========================================================= */

   const handleLogout = () => {
    logout();

    navigate("/login");
  };


    /* =========================================================
       CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    ========================================================= */

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    return (
        <>
            {/* =================================================
                PROFILE MODAL
            ================================================= */}

            {profileModalOpen && (
                <AdminProfile onClose={() => setProfileModalOpen(false)} />
            )}

            {/* =================================================
                OVERLAY
            ================================================= */}

            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                />
            )}

            {/* =================================================
                MOBILE SIDEBAR
            ================================================= */}

            <div
                className={`mobile-sidebar ${
                    sidebarOpen ? "open" : ""
                }`}
            >
                <div className="sidebar-inner">

                    {/* Close */}
                    <span onClick={closeSidebar}>
                        <i className="fa-solid fa-xmark"></i>
                    </span>

                    {/* Notification */}
                    <span>
                        <i className="fa-regular fa-bell"></i>
                    </span>

                    {/* Settings */}
                    <span>
                        <i className="fa-solid fa-gear"></i>
                    </span>

                    {/* User */}
                    <span
                        onClick={() => {
                            setProfileOpen(
                                !profileOpen
                            );
                        }}
                    >
                        <i className="fa-regular fa-user"></i>
                    </span>

                    {/* Mobile Logout */}
                    {profileOpen && (
                        <div className="mobile-profile-dropdown">
                            <button
                                onClick={handleLogout}
                            >
                                <i className="fa-solid fa-right-from-bracket"></i>
                                <span>Logout</span>
                            </button>
                        </div>
                    )}

                </div>
            </div>

            {/* =================================================
                NAVBAR
            ================================================= */}

            <section className="navbar">

                <div className="navbar-burger">

                    <h2 className="navbar-title">
                        {user?.role} Portal
                    </h2>

                    <div
                        className="home-pg-btn"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        <p className="home-text">
                            Go To Home Page
                        </p>

                        <i className="fa-solid fa-house home-icon"></i>
                    </div>

                </div>

                {/* =================================================
                    RIGHT SIDE
                ================================================= */}

                <div className="navbar-right">

                    {/* =================================================
                        DESKTOP ICONS
                    ================================================= */}

                    <div className="desktop-icons">

                        {/* Notification */}
                        <span>
                            <i className="fa-regular fa-bell"></i>
                        </span>

                        {/* User Dropdown */}
                        <div
                            className="profile-dropdown-wrapper"
                            ref={profileRef}
                        >

                            <span
                                className={`profile-icon ${
                                    profileOpen
                                        ? "profile-active"
                                        : ""
                                }`}
                                onClick={() =>
                                    setProfileOpen(
                                        !profileOpen
                                    )
                                }
                            >
                                <i className="fa-regular fa-user"></i>
                            </span>

                            {/* Dropdown */}
                            {profileOpen && (
                                <div className="profile-dropdown">

                                    {/* User Info */}
                                    <div className="profile-dropdown-header">

                                        <div className="profile-avatar">
                                            <i className="fa-regular fa-user"></i>
                                        </div>

                                        <div className="profile-info">
                                            <strong>
                                                {user?.name ||
                                                    "User"}
                                            </strong>

                                            <span>
                                                {user?.role ||
                                                    "Student"}
                                            </span>
                                        </div>

                                    </div>

                                    <div className="profile-dropdown-divider"></div>

                                    {/* Profile */}
                                    <button
                                        className="profile-menu-item"
                                        onClick={
                                            goProfile
                                        }
                                    >
                                        <i className="fa-regular fa-user"></i>

                                        <span>
                                            Profile
                                        </span>
                                    </button>

                                    {/* Logout */}
                                    <button
                                        className="profile-menu-item logout-item"
                                        onClick={
                                            handleLogout
                                        }
                                    >
                                        <i className="fa-solid fa-right-from-bracket"></i>

                                        <span>
                                            Logout
                                        </span>
                                    </button>

                                </div>
                            )}

                        </div>

                    </div>

                    {/* =================================================
                        MOBILE BURGER
                    ================================================= */}

                    <span
                        className="burger-icon"
                        onClick={openSidebar}
                    >
                        <i className="fa-solid fa-bars"></i>
                    </span>

                </div>

            </section>
        </>
    );
}

export default Navbar;
