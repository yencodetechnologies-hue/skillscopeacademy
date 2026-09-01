import "../styles/Sidebar.css";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const menu = {
  Student: [
    {
      name: "Dashboard",
      path: "/student",
    },

    {
      name: "My Courses",
      path: "/student/my-courses",
    },

    {
      name: "Buy New Course",
      path: "/student/my-courses?tab=browse",
      state: {
        tab: "browse",
      },
    },

    {
      name: "Enrollment Form",
      path: "/student/enrollment-form",
    },

    {
      name: "Schedule",
      path: "/student/schedule",
    },

    {
      name: "Results",
      path: "/student/results",
    },

    // {
    //   name: "Certificates",
    //   path: "/student/certificates",
    // },
  ],

  Teacher: [
    {
      name: "Dashboard",
      path: "/teacher",
    },
    {
      name: "My Classes",
      path: "/teacher/classes",
    },
    {
      name: "Students",
      path: "/teacher/students",
    },
    {
      name: "Certifications",
      path: "/teacher/certifications",
    },
    {
      name: "Schedule",
      path: "/teacher/schedule",
    },
  ],

  Admin: [
    {
      name: "Dashboard",
      path: "/admin",
      icon: "fa-solid fa-table-columns",
    },

    {
      name: "Courses",
      path: "/admin/courses",
      icon: "fa-solid fa-book",
    },

    {
      name: "Students",
      path: "/admin/students",
      icon: "fa-solid fa-users",
    },

    {
      name: "Marquee Content",
      path: "/admin/marquee-content",
      icon: "fa-solid fa-bullhorn",
    },
     { name: "Quick Facts Bar", path: "/admin/short-sections", icon: "fa-solid fa-list-check" },

     {
      name: "Coupons",
      path: "/admin/coupon",
      icon: "fa-solid fa-gift",
    },

    {
      name: "Companies",
      path: "/admin/companies",
      icon: "fa-solid fa-building",
    },

    {
      name: "Schedule",
      path: "/admin/schedule",
      icon: "fa-solid fa-calendar",
    },

    {
      name: "Teachers",
      path: "/admin/teachers",
      icon: "fa-solid fa-chalkboard-user",
    },

    {
      name: "LLND Results",
      path: "/admin/llnd-results",
      icon: "fa-solid fa-clipboard-check",
    },

    {
      name: "Enrollment Forms",
      path: "/admin/enrollment-forms",
      icon: "fa-solid fa-file-pen",
    },

    {
      name: "Enrollment Links",
      path: "/admin/enrollment-links",
      icon: "fa-solid fa-link",
    },

    // {
    //   name: "Exams",
    //   path: "/admin/exams",
    //   icon: "fa-solid fa-file-lines",
    // },

    {
      name: "Payments",
      path: "/admin/payments",
      icon: "fa-solid fa-dollar-sign",
    },

    {
      name: "Company Payments",
      path: "/admin/company-payments",
      icon: "fa-solid fa-dollar-sign",
    },

    {
      name: "Agent Payments",
      path: "/admin/agent-payments",
      icon: "fa-solid fa-user-tie",
    },

    {
      name: "Certificates",
      path: "/admin/certificates",
      icon: "fa-solid fa-award",
    },

    {
      name: "Gallery",
      path: "/admin/gallery",
      icon: "fa-solid fa-image",
    },

    {
      name: "Sliders",
      path: "/admin/sliders",
      icon: "fa-solid fa-images",
    },

    // {
    //   name: "Partners",
    //   path: "/admin/partners",
    //   icon: "fa-solid fa-handshake",
    // },

    {
      name: "VOC Submission",
      path: "/admin/voc-submissions",
      icon: "fa-solid fa-image",
    },

    {
      name: "Results Upload",
      path: "/admin/results-upload",
      icon: "fa-solid fa-upload",
    },

    {
      name: "Site Banner",
      path: "/admin/site-banner",
      icon: "fa-solid fa-bullhorn",
    },

    {
      name: "Activity Logs",
      path: "/admin/activity-logs",
      icon: "fa-solid fa-clock-rotate-left",
    },

    {
      name: "Code of Practice",
      path: "/admin/code-of-practice",
      icon: "fa-solid fa-gavel",
    },

    {
      name: "Templates",
      icon: "fa-solid fa-envelope",

      children: [
        {
          name: "Email Templates",
          path: "/admin/email-templates",
          icon: "fa-solid fa-file-lines",
        },

        {
          name: "Offers Mail",
          path: "/admin/promotion-mail",
          icon: "fa-solid fa-bullhorn",
        },

        {
          name: "Custom Mail",
          path: "/admin/custommail-student",
          icon: "fa-solid fa-paper-plane",
        },

        // {
        //   name: "Mail History",
        //   path: "/admin/mail-history",
        //   icon: "fa-solid fa-clock-rotate-left",
        // },
      ],
    },
  ],

  Company: [
    {
      name: "Dashboard",
      path: "/company",
      icon: "fa-solid fa-table-columns",
    },

    {
      name: " My Companies",
      path: "/company/MycompanyCourses",
      icon: "fa-solid fa-book",
    },


    {
      name: "Courses",
      path: "/company/companyCourses",
      icon: "fa-solid fa-book",
    },

    {
      name: "Payments",
      path: "/company/companyPayments",
      icon: "fa-solid fa-dollar-sign",
    },

    {
      name: "Students",
      path: "/company/companyStudents",
      icon: "fa-solid fa-users",
    },
  ],
};

/* =========================================================
   GET MENU FOR ROLE
========================================================= */

const getMenuForRole = (role) => {
  if (!role) return [];

  const key = Object.keys(menu).find(
    (k) => k.toLowerCase() === String(role).toLowerCase()
  );

  return key ? menu[key] : [];
};

/* =========================================================
   CHECK WHETHER MENU ITEM IS ACTIVE
========================================================= */

const isMenuActive = (item, location) => {
  const searchParams = new URLSearchParams(location.search);

  const currentTab = searchParams.get("tab");

  /* =======================================================
     BUY NEW COURSE

     Active when URL is:

     /student/my-courses?tab=browse
  ======================================================= */

  if (item.name === "Buy New Course") {
    return (
      location.pathname === "/student/my-courses" &&
      currentTab === "browse"
    );
  }

  /* =======================================================
     MY COURSES

     Active when URL is:

     /student/my-courses

     OR

     /student/my-courses?tab=enrolled

     But NOT:

     /student/my-courses?tab=browse
  ======================================================= */

  if (item.name === "My Courses") {
    return (
      location.pathname === "/student/my-courses" &&
      currentTab !== "browse"
    );
  }

  /* =======================================================
     ALL OTHER MENU ITEMS
  ======================================================= */

  return location.pathname === item.path;
};

/* =========================================================
   SIDEBAR COMPONENT
========================================================= */

function Sidebar({ user }) {
  const [isOpen, setIsOpen] = useState(false);

  const [openMenu, setOpenMenu] = useState("Templates");

  const navigate = useNavigate();

  const location = useLocation();

  const { logout } = useContext(AuthContext);

  /* =======================================================
     CURRENT MENU
  ======================================================= */

  const currentMenu = getMenuForRole(user?.role);

  /* =======================================================
     NAVIGATE
  ======================================================= */

  const handleNavigate = (item) => {
    /*
      If the item contains query parameters,
      navigate directly using the complete path.

      Example:

      /student/my-courses?tab=browse
    */

    navigate(item.path, {
      state: item.state,
    });

    /* Close sidebar on mobile */
    setIsOpen(false);
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    logout();

    navigate("/login");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* ===================================================
          MOBILE BURGER
      =================================================== */}

      <button
        className="sidebar-burger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i
          className={
            isOpen
              ? "fa-solid fa-xmark"
              : "fa-solid fa-bars"
          }
        ></i>
      </button>

      {/* ===================================================
          MOBILE OVERLAY
      =================================================== */}

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <div
        className={`sidebar ${
          isOpen ? "open" : ""
        }`}
      >
        {currentMenu.map((item) => {
          /* =============================================
             MENU WITH CHILDREN
          ============================================= */

          if (item.children) {
            return (
              <div key={item.name}>
                <button
                  className="menu-item"
                  onClick={() =>
                    setOpenMenu(
                      openMenu === item.name
                        ? ""
                        : item.name
                    )
                  }
                >
                  <span className="menu-icon">
                    <i className={item.icon}></i>
                  </span>

                  <span className="menu-text">
                    {item.name}
                  </span>

                  <span
                    style={{
                      marginLeft: "auto",
                    }}
                  >
                    <i
                      className={
                        openMenu === item.name
                          ? "fa-solid fa-chevron-up"
                          : "fa-solid fa-chevron-down"
                      }
                    ></i>
                  </span>
                </button>

                {/* ===================================
                    SUBMENU
                =================================== */}

                {openMenu === item.name && (
                  <div className="submenu">
                    {item.children.map((child) => (
                      <button
                        key={child.name}
                        className={`submenu-item ${
                          location.pathname === child.path
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          handleNavigate(child)
                        }
                      >
                        <i
                          className={child.icon}
                        ></i>

                        <span>
                          {child.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          /* =============================================
             NORMAL MENU ITEM
          ============================================= */

          return (
            <button
              key={item.name}
              className={`menu-item ${
                isMenuActive(item, location)
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleNavigate(item)
              }
            >
              <span className="menu-icon">
                <i
                  className={item.icon}
                ></i>
              </span>

              <span className="menu-text">
                {item.name}
              </span>
            </button>
          );
        })}

        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          className="logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </>
  );
}

export default Sidebar;