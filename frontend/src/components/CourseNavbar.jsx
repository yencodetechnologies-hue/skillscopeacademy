// import "../styles/PublicNavbar.css";
// import logo from "../assets/staLogo.png";
// import { Link, useNavigate } from "react-router-dom";
// import { useState, useEffect, useRef } from "react";
// import { API_URL } from "../data/service";
// import { filterActiveCourses } from "../utils/courseStatus";
// import { openPdf } from "../utils/openPdf";

// const mobileMenuItems = [
//   { label: "Home", path: "/" },
//   { label: "Courses", path: "/all-courses" },
//   { label: "Resources", path: "/" },
//   { label: "About", path: "/about" },
//   { label: "Contact", path: "/contact" },
//   { label: "Forms", path: "/forms" },
//   { label: "Fees & Refund", path: "/fees-refund" },
//   { label: "Unique Student Identifier (USI)", path: "/usi" },
//   { label: "Code of Practice", path: "/code-of-practice" },
//   { label: "Gallery", path: "/gallery" },
//   { label: "Sign In", path: "/login" },
// ];

// function PublicNavbar({ courses: propCourses }) {
//   const navigate = useNavigate();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [showResources, setShowResources] = useState(false);
//   const [courses, setCourses] = useState(propCourses || []);

//   const [showCOP, setShowCOP] = useState(false);
// const [copDocs, setCopDocs] = useState([]);
// const [copLoaded, setCopLoaded] = useState(false);
// const resourcesRef = useRef(null);

// useEffect(() => {
//   function handleClickOutside(e) {
//     if (resourcesRef.current && !resourcesRef.current.contains(e.target)) {
//       setShowResources(false);
//       setShowCOP(false);
//     }
//   }
//   document.addEventListener("mousedown", handleClickOutside);
//   return () => document.removeEventListener("mousedown", handleClickOutside);
// }, []);

// useEffect(() => {
//   if (!showResources || copLoaded) return;
//   let mounted = true;
//   const loadCop = async () => {
//     try {
//       const res = await fetch(`${API_URL}/api/code-of-practice/public`);
//       const data = await res.json();
//       if (mounted) setCopDocs(Array.isArray(data?.data) ? data.data : []);
//     } catch (err) {
//       console.error("Code of Practice fetch error:", err);
//     } finally {
//       if (mounted) setCopLoaded(true);
//     }
//   };
//   loadCop();
//   return () => { mounted = false; };
// }, [showResources, copLoaded]);

// const handleOpenCop = (doc) => {
//   openPdf(doc.fileUrl);
//   setShowCOP(false);
//   setShowResources(false);
// };
//   useEffect(() => {
//     if (!propCourses || propCourses.length === 0) {
//       const fetchCourses = async () => {
//         try {
//           const res = await fetch(`${API_URL}/api/courses?status=Active`);
//           const data = await res.json();
//           setCourses(filterActiveCourses(data));
//         } catch (err) {
//           console.error("Navbar fetch error:", err);
//         }
//       };
//       fetchCourses();
//     } else {
//       setCourses(filterActiveCourses(propCourses));
//     }
//   }, [propCourses]);

//   const groupedCourses = courses.reduce((acc, course) => {
//     if (!acc[course.category]) acc[course.category] = [];
//     acc[course.category].push(course);
//     return acc;
//   }, {});

//   const closeMenu = () => setMobileMenuOpen(false);

//   return (
//     <>
//       {/* OVERLAY - outside click pannuna close */}
//       {mobileMenuOpen && (
//         <div className="mobile-overlay" onClick={closeMenu} />
//       )}

//       <header className="public-navbar">
//         <div className="navbar-container">

//           {/* LOGO */}
//           <div className="navbar-logo">
//             <img src={logo} alt="SafeTicks Logo"  onClick={() => navigate("/")} />
//           </div>

//           {/* DESKTOP NAV LINKS */}
//           <ul className="nav-links">
//             <li onClick={() => navigate("/")}>Home</li>

//             <li
//               onMouseEnter={() => {
//                 setShowDropdown(true);
//                 if (!activeCategory && Object.keys(groupedCourses).length > 0) {
//                   setActiveCategory(Object.keys(groupedCourses)[0]);
//                 }
//               }}
//               onMouseLeave={() => setShowDropdown(false)}
//               style={{ position: "relative" }}
//             >
//               Courses <i className="fa-solid fa-angle-down"></i>
//               {showDropdown && (
//                 <>
//                   {/* Transparent hover-bridge over the 10px gap between
//                       the navbar and the dropdown. Without this, the cursor
//                       crosses empty space and onMouseLeave fires before the
//                       user can reach a category. */}
//                   <div className="courses-dropdown-bridge" />
//                   <div className="courses-dropdown">
//                   <div className="courses-dropdown-left">
//                     {Object.keys(groupedCourses).map((cat) => (
//                       <div
//                         key={cat}
//                         onMouseEnter={() => setActiveCategory(cat)}
//                         className={`category-item ${activeCategory === cat ? "active" : ""}`}
//                       >
//                         {cat}
//                       </div>
//                     ))}
//                   </div>
//                   <div className="courses-dropdown-right">
//                     {activeCategory && groupedCourses[activeCategory].map((course) => (
//                       <div
//                         key={course._id}
//                         onClick={() => navigate(`/course/${course.slug}`)}
//                         className="course-item"
//                       >
//                         {course.courseCode && (
//                           <span className="course-item-code">{course.courseCode}</span>
//                         )}
//                         <span className="course-item-title">{course.title}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 </>
//               )}
//             </li>

//             <li
//               ref={resourcesRef}
//               onMouseEnter={() => setShowResources(true)}
//               onMouseLeave={() => { if (!showCOP) setShowResources(false); }}
//               style={{ position: "relative" }}
//             >
//               Resources <i className="fa-solid fa-angle-down"></i>
//               {showResources && (
//                 <div className="resources-dropdown">
//                   <div onClick={() => navigate("/forms")}>Forms</div>
//                   <div onClick={() => navigate("/fees-refund")}>Fees & Refund</div>
//                   <div onClick={() => navigate("/usi")}>Unique Student Identifier (USI)</div>
//                 <div
//   className="resources-dropdown-item has-submenu"
//   onMouseEnter={() => setShowCOP(true)}
//   onClick={(e) => { e.stopPropagation(); setShowCOP((prev) => !prev); }}
// >
//   Code of Practice ▸
//   {showCOP && (
//     <div className="cop-submenu">
//       {!copLoaded ? (
//         <div className="cop-submenu-empty">Loading…</div>
//       ) : copDocs.length === 0 ? (
//         <div className="cop-submenu-empty">No documents yet</div>
//       ) : (
//         copDocs.map((doc) => (
//           <div key={doc._id} onClick={() => handleOpenCop(doc)}>
//             {doc.title}
//           </div>
//         ))
//       )}
//     </div>
//   )}
// </div>
//                   <div onClick={() => navigate("/gallery")}>Gallery</div>
//                 </div>
//               )}
//             </li>

//             <li onClick={() => navigate("/about")}>About</li>
//             <li onClick={() => navigate("/contact")}>Contact</li>
//           </ul>

//           {/* DESKTOP BUTTONS */}
//           <div className="nav-buttons">
//             <div className="combo-nav-wrapper">
//               <button onClick={() => navigate("/combo-courses")} className="combo-btn-nav">
//                 Combo Courses
//               </button>
//             </div>
//             <button onClick={() => navigate("/book-now")}>Book now</button>
//             <button><Link className="login-link" to="/login">Login</Link></button>
//           </div>

//           {/* MOBILE BURGER */}
//           <div className="mobile-menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
//             {mobileMenuOpen ? "✕" : "☰"}
//           </div>

//         </div>

//         {/* MOBILE DROPDOWN PANEL */}
//         {mobileMenuOpen && (
//           <div className="mobile-fullmenu">
//             {/* Scrollable list */}
//             <div className="mobile-fullmenu-list">
//               {mobileMenuItems.map((item, index) => (
//                 <div
//                   key={index}
//                   className="mobile-fullmenu-item"
//                   onClick={() => {
//                     if (item.path.startsWith("http")) {
//                       window.open(item.path, "_blank");
//                     } else {
//                       navigate(item.path);
//                     }
//                     closeMenu();
//                   }}
//                 >
//                   {item.label}
//                 </div>
//               ))}
//             </div>

//             {/* Buttons - always visible at bottom */}
//             <div className="mobile-fullmenu-buttons">
//               <button onClick={() => { navigate("/combo-courses"); closeMenu(); }}>Combo Courses</button>
//               <button onClick={() => { navigate("/book-now"); closeMenu(); }}>Book now</button>
//               <button><Link className="login-link" to="/login">Login</Link></button>
//             </div>
//           </div>
//         )}

//       </header>
//     </>
//   );
// }

// export default PublicNavbar;

// import "../styles/PublicNavbar.css";
// import logo from "../assets/staLogo.png";
// import { Link, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { API_URL } from "../data/service";
// import { filterActiveCourses } from "../utils/courseStatus";

// const mobileMenuItems = [
//   { label: "Home", path: "/" },
//   { label: "Courses", path: "/all-courses" },
//   { label: "Resources", path: "/" },
//   { label: "About", path: "/about" },
//   { label: "Contact", path: "/contact" },
//   { label: "Forms", path: "/forms" },
//   { label: "Fees & Refund", path: "/fees-refund" },
//   { label: "Unique Student Identifier (USI)", path: "https://www.usi.gov.au/students/get-a-usi" },
//   { label: "Code of Practice", path: "/code-of-practice" },
//   { label: "Gallery", path: "/gallery" },
//   { label: "Sign In", path: "/login" },
// ];

// function PublicNavbar({ courses: propCourses }) {
//   const navigate = useNavigate();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [showResources, setShowResources] = useState(false);
//   const [courses, setCourses] = useState(propCourses || []);

//   useEffect(() => {
//     if (!propCourses || propCourses.length === 0) {
//       const fetchCourses = async () => {
//         try {
//           const res = await fetch(`${API_URL}/api/courses?status=Active`);
//           const data = await res.json();
//           setCourses(filterActiveCourses(data));
//         } catch (err) {
//           console.error("Navbar fetch error:", err);
//         }
//       };
//       fetchCourses();
//     } else {
//       setCourses(filterActiveCourses(propCourses));
//     }
//   }, [propCourses]);

//   const groupedCourses = courses.reduce((acc, course) => {
//     if (!acc[course.category]) acc[course.category] = [];
//     acc[course.category].push(course);
//     return acc;
//   }, {});

//   const closeMenu = () => setMobileMenuOpen(false);

//   return (
//     <>
//       {/* OVERLAY - outside click pannuna close */}
//       {mobileMenuOpen && (
//         <div className="mobile-overlay" onClick={closeMenu} />
//       )}

//       <header className="public-navbar">
//         <div className="navbar-container">

//           {/* LOGO */}
//           <div className="navbar-logo">
//             <img src={logo} alt="SafeTicks Logo"  onClick={() => navigate("/")} />
//           </div>

//           {/* DESKTOP NAV LINKS */}
//           <ul className="nav-links">
//             <li onClick={() => navigate("/")}>Home</li>

//             <li
//               onMouseEnter={() => {
//                 setShowDropdown(true);
//                 if (!activeCategory && Object.keys(groupedCourses).length > 0) {
//                   setActiveCategory(Object.keys(groupedCourses)[0]);
//                 }
//               }}
//               onMouseLeave={() => setShowDropdown(false)}
//               style={{ position: "relative" }}
//             >
//               Courses <i className="fa-solid fa-angle-down"></i>
//               {showDropdown && (
//                 <>
//                   {/* Transparent hover-bridge over the 10px gap between
//                       the navbar and the dropdown. Without this, the cursor
//                       crosses empty space and onMouseLeave fires before the
//                       user can reach a category. */}
//                   <div className="courses-dropdown-bridge" />
//                   <div className="courses-dropdown">
//                   <div className="courses-dropdown-left">
//                     {Object.keys(groupedCourses).map((cat) => (
//                       <div
//                         key={cat}
//                         onMouseEnter={() => setActiveCategory(cat)}
//                         className={`category-item ${activeCategory === cat ? "active" : ""}`}
//                       >
//                         {cat}
//                       </div>
//                     ))}
//                   </div>
//                   <div className="courses-dropdown-right">
//                     {activeCategory && groupedCourses[activeCategory].map((course) => (
//                       <div
//                         key={course._id}
//                         onClick={() => navigate(`/course/${course.slug}`)}
//                         className="course-item"
//                       >
//                         {course.title}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 </>
//               )}
//             </li>

//             <li
//               onMouseEnter={() => setShowResources(true)}
//               onMouseLeave={() => setShowResources(false)}
//               style={{ position: "relative" }}
//             >
//               Resources <i className="fa-solid fa-angle-down"></i>
//               {showResources && (
//                 <div className="resources-dropdown">
//                   <div onClick={() => navigate("/forms")}>Forms</div>
//                   <div onClick={() => navigate("/fees-refund")}>Fees & Refund</div>
//                   <div onClick={() => window.open("https://www.usi.gov.au/students/get-a-usi", "_blank")}>Unique Student Identifier (USI)</div>
//                   <div onClick={() => navigate("/code-of-practice")}>Code of Practice ▸</div>
//                   <div onClick={() => navigate("/gallery")}>Gallery</div>
//                 </div>
//               )}
//             </li>

//             <li onClick={() => navigate("/about")}>About</li>
//             <li onClick={() => navigate("/contact")}>Contact</li>
//           </ul>

//           {/* DESKTOP BUTTONS */}
//           <div className="nav-buttons">
//             <div className="combo-nav-wrapper">
//               <button onClick={() => navigate("/combo-courses")} className="combo-btn-nav">
//                 Combo Courses
//               </button>
//             </div>
//             <button onClick={() => navigate("/book-now")}>Book now</button>
//             <button><Link className="login-link" to="/login">Login</Link></button>
//           </div>

//           {/* MOBILE BURGER */}
//           <div className="mobile-menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
//             {mobileMenuOpen ? "✕" : "☰"}
//           </div>

//         </div>

//         {/* MOBILE DROPDOWN PANEL */}
//         {mobileMenuOpen && (
//           <div className="mobile-fullmenu">
//             {/* Scrollable list */}
//             <div className="mobile-fullmenu-list">
//               {mobileMenuItems.map((item, index) => (
//                 <div
//                   key={index}
//                   className="mobile-fullmenu-item"
//                   onClick={() => {
//                     if (item.path.startsWith("http")) {
//                       window.open(item.path, "_blank");
//                     } else {
//                       navigate(item.path);
//                     }
//                     closeMenu();
//                   }}
//                 >
//                   {item.label}
//                 </div>
//               ))}
//             </div>

//             {/* Buttons - always visible at bottom */}
//             <div className="mobile-fullmenu-buttons">
//               <button onClick={() => { navigate("/combo-courses"); closeMenu(); }}>Combo Courses</button>
//               <button onClick={() => { navigate("/book-now"); closeMenu(); }}>Book now</button>
//               <button><Link className="login-link" to="/login">Login</Link></button>
//             </div>
//           </div>
//         )}

//       </header>
//     </>
//   );
// }

// export default PublicNavbar;

// import "../styles/PublicNavbar.css";
// import logo from "../assets/staLogo.png";
// import { Link, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { API_URL } from "../data/service";
// import { filterActiveCourses } from "../utils/courseStatus";
// import { openPdf } from "../utils/openPdf";

// const mobileMenuItems = [
//   { label: "Home", path: "/" },
//   { label: "Courses", path: "/all-courses" },
//   { label: "Resources", path: "/" },
//   { label: "About", path: "/about" },
//   { label: "Contact", path: "/contact" },
//   { label: "Forms", path: "/forms" },
//   { label: "Fees & Refund", path: "/fees-refund" },
//   { label: "Unique Student Identifier (USI)", path: "/usi" },
//   { label: "Code of Practice", path: "/code-of-practice" },
//   { label: "Gallery", path: "/gallery" },
//   { label: "Sign In", path: "/login" },
// ];

// function PublicNavbar({ courses: propCourses }) {
//   const navigate = useNavigate();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [showResources, setShowResources] = useState(false);
//   const [courses, setCourses] = useState(propCourses || []);

//   const [showCOP, setShowCOP] = useState(false);
// const [copDocs, setCopDocs] = useState([]);
// const [copLoaded, setCopLoaded] = useState(false);

// useEffect(() => {
//   if (!showResources || copLoaded) return;
//   let mounted = true;
//   const loadCop = async () => {
//     try {
//       const res = await fetch(`${API_URL}/api/code-of-practice/public`);
//       const data = await res.json();
//       if (mounted) setCopDocs(Array.isArray(data?.data) ? data.data : []);
//     } catch (err) {
//       console.error("Code of Practice fetch error:", err);
//     } finally {
//       if (mounted) setCopLoaded(true);
//     }
//   };
//   loadCop();
//   return () => { mounted = false; };
// }, [showResources, copLoaded]);

// const handleOpenCop = (doc) => {
//   openPdf(doc.fileUrl);
//   setShowCOP(false);
//   setShowResources(false);
// };
//   useEffect(() => {
//     if (!propCourses || propCourses.length === 0) {
//       const fetchCourses = async () => {
//         try {
//           const res = await fetch(`${API_URL}/api/courses?status=Active`);
//           const data = await res.json();
//           setCourses(filterActiveCourses(data));
//         } catch (err) {
//           console.error("Navbar fetch error:", err);
//         }
//       };
//       fetchCourses();
//     } else {
//       setCourses(filterActiveCourses(propCourses));
//     }
//   }, [propCourses]);

//   const groupedCourses = courses.reduce((acc, course) => {
//     if (!acc[course.category]) acc[course.category] = [];
//     acc[course.category].push(course);
//     return acc;
//   }, {});

//   const closeMenu = () => setMobileMenuOpen(false);

//   return (
//     <>
//       {/* OVERLAY - outside click pannuna close */}
//       {mobileMenuOpen && (
//         <div className="mobile-overlay" onClick={closeMenu} />
//       )}

//       <header className="public-navbar">
//         <div className="navbar-container">

//           {/* LOGO */}
//           <div className="navbar-logo">
//             <img src={logo} alt="SafeTicks Logo"  onClick={() => navigate("/")} />
//           </div>

//           {/* DESKTOP NAV LINKS */}
//           <ul className="nav-links">
//             <li onClick={() => navigate("/")}>Home</li>

//             <li
//               onMouseEnter={() => {
//                 setShowDropdown(true);
//                 if (!activeCategory && Object.keys(groupedCourses).length > 0) {
//                   setActiveCategory(Object.keys(groupedCourses)[0]);
//                 }
//               }}
//               onMouseLeave={() => setShowDropdown(false)}
//               style={{ position: "relative" }}
//             >
//               Courses <i className="fa-solid fa-angle-down"></i>
//               {showDropdown && (
//                 <>
//                   {/* Transparent hover-bridge over the 10px gap between
//                       the navbar and the dropdown. Without this, the cursor
//                       crosses empty space and onMouseLeave fires before the
//                       user can reach a category. */}
//                   <div className="courses-dropdown-bridge" />
//                   <div className="courses-dropdown">
//                   <div className="courses-dropdown-left">
//                     {Object.keys(groupedCourses).map((cat) => (
//                       <div
//                         key={cat}
//                         onMouseEnter={() => setActiveCategory(cat)}
//                         className={`category-item ${activeCategory === cat ? "active" : ""}`}
//                       >
//                         {cat}
//                       </div>
//                     ))}
//                   </div>
//                   <div className="courses-dropdown-right">
//                     {activeCategory && groupedCourses[activeCategory].map((course) => (
//                       <div
//                         key={course._id}
//                         onClick={() => navigate(`/course/${course.slug}`)}
//                         className="course-item"
//                       >
//                         {course.courseCode && (
//                           <span className="course-item-code">{course.courseCode}</span>
//                         )}
//                         <span className="course-item-title">{course.title}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 </>
//               )}
//             </li>

//             <li
//               onMouseEnter={() => setShowResources(true)}
//               onMouseLeave={() => setShowResources(false)}
//               style={{ position: "relative" }}
//             >
//               Resources <i className="fa-solid fa-angle-down"></i>
//               {showResources && (
//                 <div className="resources-dropdown">
//                   <div onClick={() => navigate("/forms")}>Forms</div>
//                   <div onClick={() => navigate("/fees-refund")}>Fees & Refund</div>
//                   <div onClick={() => navigate("/usi")}>Unique Student Identifier (USI)</div>
//                 <div
//   className="resources-dropdown-item has-submenu"
//   onMouseEnter={() => setShowCOP(true)}
//   onMouseLeave={() => setShowCOP(false)}
// >
//   Code of Practice ▸
//   {showCOP && (
//     <div className="cop-submenu">
//       {!copLoaded ? (
//         <div className="cop-submenu-empty">Loading…</div>
//       ) : copDocs.length === 0 ? (
//         <div className="cop-submenu-empty">No documents yet</div>
//       ) : (
//         copDocs.map((doc) => (
//           <div key={doc._id} onClick={() => handleOpenCop(doc)}>
//             {doc.title}
//           </div>
//         ))
//       )}
//     </div>
//   )}
// </div>
//                   <div onClick={() => navigate("/gallery")}>Gallery</div>
//                 </div>
//               )}
//             </li>

//             <li onClick={() => navigate("/about")}>About</li>
//             <li onClick={() => navigate("/contact")}>Contact</li>
//           </ul>

//           {/* DESKTOP BUTTONS */}
//           <div className="nav-buttons">
//             <div className="combo-nav-wrapper">
//               <button onClick={() => navigate("/combo-courses")} className="combo-btn-nav">
//                 Combo Courses
//               </button>
//             </div>
//             <button onClick={() => navigate("/book-now")}>Book now</button>
//             <button><Link className="login-link" to="/login">Login</Link></button>
//           </div>

//           {/* MOBILE BURGER */}
//           <div className="mobile-menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
//             {mobileMenuOpen ? "✕" : "☰"}
//           </div>

//         </div>

//         {/* MOBILE DROPDOWN PANEL */}
//         {mobileMenuOpen && (
//           <div className="mobile-fullmenu">
//             {/* Scrollable list */}
//             <div className="mobile-fullmenu-list">
//               {mobileMenuItems.map((item, index) => (
//                 <div
//                   key={index}
//                   className="mobile-fullmenu-item"
//                   onClick={() => {
//                     if (item.path.startsWith("http")) {
//                       window.open(item.path, "_blank");
//                     } else {
//                       navigate(item.path);
//                     }
//                     closeMenu();
//                   }}
//                 >
//                   {item.label}
//                 </div>
//               ))}
//             </div>

//             {/* Buttons - always visible at bottom */}
//             <div className="mobile-fullmenu-buttons">
//               <button onClick={() => { navigate("/combo-courses"); closeMenu(); }}>Combo Courses</button>
//               <button onClick={() => { navigate("/book-now"); closeMenu(); }}>Book now</button>
//               <button><Link className="login-link" to="/login">Login</Link></button>
//             </div>
//           </div>
//         )}

//       </header>
//     </>
//   );
// }

// export default PublicNavbar;

// import "../styles/PublicNavbar.css";
// import logo from "../assets/staLogo.png";
// import { Link, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { API_URL } from "../data/service";
// import { filterActiveCourses } from "../utils/courseStatus";

// const mobileMenuItems = [
//   { label: "Home", path: "/" },
//   { label: "Courses", path: "/all-courses" },
//   { label: "Resources", path: "/" },
//   { label: "About", path: "/about" },
//   { label: "Contact", path: "/contact" },
//   { label: "Forms", path: "/forms" },
//   { label: "Fees & Refund", path: "/fees-refund" },
//   { label: "Unique Student Identifier (USI)", path: "https://www.usi.gov.au/students/get-a-usi" },
//   { label: "Code of Practice", path: "/code-of-practice" },
//   { label: "Gallery", path: "/gallery" },
//   { label: "Sign In", path: "/login" },
// ];

// function PublicNavbar({ courses: propCourses }) {
//   const navigate = useNavigate();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [showResources, setShowResources] = useState(false);
//   const [courses, setCourses] = useState(propCourses || []);

//   useEffect(() => {
//     if (!propCourses || propCourses.length === 0) {
//       const fetchCourses = async () => {
//         try {
//           const res = await fetch(`${API_URL}/api/courses?status=Active`);
//           const data = await res.json();
//           setCourses(filterActiveCourses(data));
//         } catch (err) {
//           console.error("Navbar fetch error:", err);
//         }
//       };
//       fetchCourses();
//     } else {
//       setCourses(filterActiveCourses(propCourses));
//     }
//   }, [propCourses]);

//   const groupedCourses = courses.reduce((acc, course) => {
//     if (!acc[course.category]) acc[course.category] = [];
//     acc[course.category].push(course);
//     return acc;
//   }, {});

//   const closeMenu = () => setMobileMenuOpen(false);

//   return (
//     <>
//       {/* OVERLAY - outside click pannuna close */}
//       {mobileMenuOpen && (
//         <div className="mobile-overlay" onClick={closeMenu} />
//       )}

//       <header className="public-navbar">
//         <div className="navbar-container">

//           {/* LOGO */}
//           <div className="navbar-logo">
//             <img src={logo} alt="SafeTicks Logo"  onClick={() => navigate("/")} />
//           </div>

//           {/* DESKTOP NAV LINKS */}
//           <ul className="nav-links">
//             <li onClick={() => navigate("/")}>Home</li>

//             <li
//               onMouseEnter={() => {
//                 setShowDropdown(true);
//                 if (!activeCategory && Object.keys(groupedCourses).length > 0) {
//                   setActiveCategory(Object.keys(groupedCourses)[0]);
//                 }
//               }}
//               onMouseLeave={() => setShowDropdown(false)}
//               style={{ position: "relative" }}
//             >
//               Courses <i className="fa-solid fa-angle-down"></i>
//               {showDropdown && (
//                 <>
//                   {/* Transparent hover-bridge over the 10px gap between
//                       the navbar and the dropdown. Without this, the cursor
//                       crosses empty space and onMouseLeave fires before the
//                       user can reach a category. */}
//                   <div className="courses-dropdown-bridge" />
//                   <div className="courses-dropdown">
//                   <div className="courses-dropdown-left">
//                     {Object.keys(groupedCourses).map((cat) => (
//                       <div
//                         key={cat}
//                         onMouseEnter={() => setActiveCategory(cat)}
//                         className={`category-item ${activeCategory === cat ? "active" : ""}`}
//                       >
//                         {cat}
//                       </div>
//                     ))}
//                   </div>
//                   <div className="courses-dropdown-right">
//                     {activeCategory && groupedCourses[activeCategory].map((course) => (
//                       <div
//                         key={course._id}
//                         onClick={() => navigate(`/course/${course.slug}`)}
//                         className="course-item"
//                       >
//                         {course.title}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 </>
//               )}
//             </li>

//             <li
//               onMouseEnter={() => setShowResources(true)}
//               onMouseLeave={() => setShowResources(false)}
//               style={{ position: "relative" }}
//             >
//               Resources <i className="fa-solid fa-angle-down"></i>
//               {showResources && (
//                 <div className="resources-dropdown">
//                   <div onClick={() => navigate("/forms")}>Forms</div>
//                   <div onClick={() => navigate("/fees-refund")}>Fees & Refund</div>
//                   <div onClick={() => window.open("https://www.usi.gov.au/students/get-a-usi", "_blank")}>Unique Student Identifier (USI)</div>
//                   <div onClick={() => navigate("/code-of-practice")}>Code of Practice ▸</div>
//                   <div onClick={() => navigate("/gallery")}>Gallery</div>
//                 </div>
//               )}
//             </li>

//             <li onClick={() => navigate("/about")}>About</li>
//             <li onClick={() => navigate("/contact")}>Contact</li>
//           </ul>

//           {/* DESKTOP BUTTONS */}
//           <div className="nav-buttons">
//             <div className="combo-nav-wrapper">
//               <button onClick={() => navigate("/combo-courses")} className="combo-btn-nav">
//                 Combo Courses
//               </button>
//             </div>
//             <button onClick={() => navigate("/book-now")}>Book now</button>
//             <button><Link className="login-link" to="/login">Login</Link></button>
//           </div>

//           {/* MOBILE BURGER */}
//           <div className="mobile-menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
//             {mobileMenuOpen ? "✕" : "☰"}
//           </div>

//         </div>

//         {/* MOBILE DROPDOWN PANEL */}
//         {mobileMenuOpen && (
//           <div className="mobile-fullmenu">
//             {/* Scrollable list */}
//             <div className="mobile-fullmenu-list">
//               {mobileMenuItems.map((item, index) => (
//                 <div
//                   key={index}
//                   className="mobile-fullmenu-item"
//                   onClick={() => {
//                     if (item.path.startsWith("http")) {
//                       window.open(item.path, "_blank");
//                     } else {
//                       navigate(item.path);
//                     }
//                     closeMenu();
//                   }}
//                 >
//                   {item.label}
//                 </div>
//               ))}
//             </div>

//             {/* Buttons - always visible at bottom */}
//             <div className="mobile-fullmenu-buttons">
//               <button onClick={() => { navigate("/combo-courses"); closeMenu(); }}>Combo Courses</button>
//               <button onClick={() => { navigate("/book-now"); closeMenu(); }}>Book now</button>
//               <button><Link className="login-link" to="/login">Login</Link></button>
//             </div>
//           </div>
//         )}

//       </header>
//     </>
//   );
// }

// export default PublicNavbar;

import "../styles/CourseNavbar.css";
import logo from "../assets/staLogo.png";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { API_URL } from "../data/service";
import { filterActiveCourses } from "../utils/courseStatus";
import { openPdf } from "../utils/openPdf";

const mobileMenuItems = [
  { label: "Home", path: "/" },
  { label: "Courses", path: "/all-courses" },
  { label: "Resources", path: "/" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "Forms", path: "/forms" },
  { label: "Fees & Refund", path: "/fees-refund" },
  { label: "Unique Student Identifier (USI)", path: "/usi" },
  { label: "Code of Practice", path: "/code-of-practice" },
  { label: "Gallery", path: "/gallery" },
  { label: "Sign In", path: "/login" },
];

function CourseNavbar({ courses: propCourses }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showResources, setShowResources] = useState(false);
  const [courses, setCourses] = useState(propCourses || []);

  const [showCOP, setShowCOP] = useState(false);
  const [copDocs, setCopDocs] = useState([]);
  const [copLoaded, setCopLoaded] = useState(false);
  const resourcesRef = useRef(null);

  useEffect(() => {
    // Kept for safety: close menus if user clicks anywhere outside
    function handleClickOutside(e) {
      if (resourcesRef.current && !resourcesRef.current.contains(e.target)) {
        setShowResources(false);
        setShowCOP(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showResources || copLoaded) return;
    let mounted = true;
    const loadCop = async () => {
      try {
        const res = await fetch(`${API_URL}/api/code-of-practice/public`);
        const data = await res.json();
        if (mounted) setCopDocs(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        console.error("Code of Practice fetch error:", err);
      } finally {
        if (mounted) setCopLoaded(true);
      }
    };
    loadCop();
    return () => {
      mounted = false;
    };
  }, [showResources, copLoaded]);

  const handleOpenCop = (doc) => {
    openPdf(doc.fileUrl);
    setShowCOP(false);
    setShowResources(false);
  };
  useEffect(() => {
    if (!propCourses || propCourses.length === 0) {
      const fetchCourses = async () => {
        try {
          const res = await fetch(`${API_URL}/api/courses?status=Active`);
          const data = await res.json();
          setCourses(filterActiveCourses(data));
        } catch (err) {
          console.error("Navbar fetch error:", err);
        }
      };
      fetchCourses();
    } else {
      setCourses(filterActiveCourses(propCourses));
    }
  }, [propCourses]);

  const groupedCourses = courses.reduce((acc, course) => {
    if (!acc[course.category]) acc[course.category] = [];
    acc[course.category].push(course);
    return acc;
  }, {});

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* OVERLAY - outside click pannuna close */}
      {mobileMenuOpen && <div className="mobile-overlay" onClick={closeMenu} />}

      <header className="public-navbar">
        <div className="navbar-container">
          {/* LOGO */}
          <div className="navbar-logo">
            <img
              src={logo}
              alt="SafeTicks Logo"
              onClick={() => navigate("/")}
            />
          </div>

          {/* DESKTOP NAV LINKS */}
          <ul className="nav-links">
            <li
              className={location.pathname === "/" ? "active" : ""}
              onClick={() => navigate("/")}
            >
              Home
            </li>

            <li
              className={
                location.pathname.startsWith("/course") ? "active" : ""
              }
              onMouseEnter={() => {
                setShowDropdown(true);
                if (!activeCategory && Object.keys(groupedCourses).length > 0) {
                  setActiveCategory(Object.keys(groupedCourses)[0]);
                }
              }}
              onMouseLeave={() => setShowDropdown(false)}
              style={{ position: "relative" }}
            >
              Courses <i className="fa-solid fa-angle-down"></i>
              {showDropdown && (
                <>
                  {/* Transparent hover-bridge over the 10px gap between
                      the navbar and the dropdown. Without this, the cursor
                      crosses empty space and onMouseLeave fires before the
                      user can reach a category. */}
                  <div className="courses-dropdown-bridge" />
                  <div className="courses-dropdown">
                    <div className="courses-dropdown-left">
                      {Object.keys(groupedCourses).map((cat) => (
                        <div
                          key={cat}
                          onMouseEnter={() => setActiveCategory(cat)}
                          className={`category-item ${activeCategory === cat ? "active" : ""}`}
                        >
                          {cat}
                        </div>
                      ))}
                    </div>
                    <div className="courses-dropdown-right">
                      {activeCategory &&
                        groupedCourses[activeCategory].map((course) => (
                          <div
                            key={course._id}
                            onClick={() => navigate(`/course/${course.slug}`)}
                            className="course-item"
                          >
                            {course.courseCode && (
                              <span className="course-item-code">
                                {course.courseCode}
                              </span>
                            )}
                            <span className="course-item-title">
                              {course.title}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </li>

            <li
              ref={resourcesRef}
              className={
                ["/forms", "/fees-refund", "/usi", "/gallery"].includes(
                  location.pathname,
                )
                  ? "active"
                  : ""
              }
              onMouseEnter={() => setShowResources(true)}
              onMouseLeave={() => {
                setShowResources(false);
                setShowCOP(false);
              }}
              style={{ position: "relative" }}
            >
              Resources <i className="fa-solid fa-angle-down"></i>
              {showResources && (
                <div className="resources-dropdown">
                  <div
                    onClick={() => {
                      navigate("/forms");
                      setShowResources(false);
                    }}
                  >
                    Forms
                  </div>
                  <div
                    onClick={() => {
                      navigate("/fees-refund");
                      setShowResources(false);
                    }}
                  >
                    Fees & Refund
                  </div>
                  <div
                    onClick={() => {
                      navigate("/usi");
                      setShowResources(false);
                    }}
                  >
                    Unique Student Identifier (USI)
                  </div>
                  <div
                    className="resources-dropdown-item has-submenu"
                    onMouseEnter={() => setShowCOP(true)}
                    onMouseLeave={(e) => {
                      // Only close COP if not moving into the submenu itself
                      const related = e.relatedTarget;
                      if (related && e.currentTarget.contains(related)) return;
                      setShowCOP(false);
                    }}
                  >
                    Code of Practice ▸
                    {showCOP && (
                      <div
                        className="cop-submenu"
                        onMouseLeave={() => setShowCOP(false)}
                      >
                        {!copLoaded ? (
                          <div className="cop-submenu-empty">Loading…</div>
                        ) : copDocs.length === 0 ? (
                          <div className="cop-submenu-empty">
                            No documents yet
                          </div>
                        ) : (
                          copDocs.map((doc) => (
                            <div
                              key={doc._id}
                              onClick={() => handleOpenCop(doc)}
                            >
                              {doc.title}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <div
                    onClick={() => {
                      navigate("/gallery");
                      setShowResources(false);
                    }}
                  >
                    Gallery
                  </div>
                </div>
              )}
            </li>

            <li
              className={location.pathname === "/about" ? "active" : ""}
              onClick={() => navigate("/about")}
            >
              About
            </li>
            <li
              className={location.pathname === "/contact" ? "active" : ""}
              onClick={() => navigate("/contact")}
            >
              Contact
            </li>
          </ul>

          {/* DESKTOP BUTTONS */}
          <div className="nav-buttons">
            {/* PHONE */}
            <a href="tel:1300123456" className="phone-block">
              <span className="phone-icon">
                <i className="fa-solid fa-phone"></i>
              </span>
              <span className="phone-text">
                <small>Call us</small>
                <strong>1300 415 252</strong>
              </span>
            </a>

            <div className="combo-nav-wrapper">
              <button
                onClick={() => navigate("/combo-courses")}
                className="combo-btn-nav"
              >
                Combo Courses <span className="save-badge">Save More</span>
              </button>
            </div>

            <button className="book-btn" onClick={() => navigate("/book-now")}>
              Book Now
            </button>

            <button className="login-btn-nav">
              <Link className="login-link" to="/login">
                <i className="fa-regular fa-user"></i> Login
              </Link>
            </button>
          </div>

          {/* MOBILE BURGER */}
          <div
            className="mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </div>
        </div>

        {/* MOBILE DROPDOWN PANEL */}
        {mobileMenuOpen && (
          <div className="mobile-fullmenu">
            {/* Scrollable list */}
            <div className="mobile-fullmenu-list">
              {mobileMenuItems.map((item, index) => (
                <div
                  key={index}
                  className="mobile-fullmenu-item"
                  onClick={() => {
                    if (item.path.startsWith("http")) {
                      window.open(item.path, "_blank");
                    } else {
                      navigate(item.path);
                    }
                    closeMenu();
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>

            {/* Buttons - always visible at bottom */}
            <div className="mobile-fullmenu-buttons">
              <a
                href="tel:1300123456"
                className="mobile-phone-block"
                onClick={closeMenu}
              >
                <i className="fa-solid fa-phone"></i> 1300 123 456
              </a>
              <button
                onClick={() => {
                  navigate("/combo-courses");
                  closeMenu();
                }}
              >
                Combo Courses
              </button>
              <button
                onClick={() => {
                  navigate("/book-now");
                  closeMenu();
                }}
              >
                Book now
              </button>
              <button>
                <Link className="login-link" to="/login">
                  Login
                </Link>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default CourseNavbar;
