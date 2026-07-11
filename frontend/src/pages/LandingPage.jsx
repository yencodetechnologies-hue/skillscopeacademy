// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useLocation } from "react-router-dom";
// import { API_URL } from "../data/service";
// import { filterActiveCourses } from "../utils/courseStatus";

// // Desktop components
// import Hero from "../components/landingPage/Hero";
// import PublicNavbar from "../components/PublicNavbar";
// import TopNav from "../components/landingPage/TopNav";
// import TrustBar from "../components/landingPage/TrustBar";
// import PromoBar from "../components/landingPage/PromoBar";
// import CoursesSection from "../components/course/CoursesSection";
// import AboutSection from "../components/landingPage/AboutSection";
// // import ContactEnrollment from "../components/landingPage/ContactEnrollment";
// import Footer from "../components/landingPage/Footer";
// import Carousel from "../components/CarouselMain";
// import ViewAllCoursesMobile from "../components/mobile/components/ViewAllCoursesMobile";
// import CTABanner from "../components/CTABanner";
// import MobileLandingPage from "../components/mobile/components/MobileLandingPage";
// import "../styles/LandingPage.css";
// import SessionsBar from "../components/landingPage/SessionsBar";
// import SiteBannerPopup from "../components/landingPage/SiteBannerPopup";

// // ── Custom hook: returns true when viewport is ≤ 768 px ──────────────────────
// function useIsMobile(breakpoint = 768) {
//   const [isMobile, setIsMobile] = useState(
//     () => window.innerWidth <= breakpoint
//   );

//   useEffect(() => {
//     const handler = () => setIsMobile(window.innerWidth <= breakpoint);
//     window.addEventListener("resize", handler);
//     return () => window.removeEventListener("resize", handler);
//   }, [breakpoint]);

//   return isMobile;
// }
// // ─────────────────────────────────────────────────────────────────────────────

// function LandingPage() {
//   const [courses, setCourses] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const isMobile = useIsMobile();

//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/courses?status=Active`);
//         const active = filterActiveCourses(res.data);
//         setCourses(active);
//         const uniqueCategories = [
//           ...new Set(active.map((c) => c.category)),
//         ];
//         setCategories(uniqueCategories);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchCourses();
//   }, []);

//   return (
//     <>
//       <SiteBannerPopup />
//       {isMobile ? (
//         <MobileLandingPage courses={courses} />
//       ) : (
//       <div>
//       <TopNav />
//       <PublicNavbar courses={courses} />
//       <Hero />

//       <div className="adv-bar">
//         <div>
//           <PromoBar />
//         </div>
//         <div className="tru-bar">
//           <TrustBar />
//         </div>
//       </div>
//       <div className="sessions-bar" > 
//         <SessionsBar />
//         </div>
//       <div>
//         <Carousel courses={courses} />
//       </div>

//       <div id="courses">
//         <CoursesSection categories={categories} />
//       </div>

//       <AboutSection />
//       <ClientsSection />
//       <CTABanner />
//       {/* <ContactEnrollment /> */}
//       <Footer />
//       </div>
//       )}
//     </>
//   );
// }

// export default LandingPage;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { API_URL } from "../data/service";
import { filterActiveCourses } from "../utils/courseStatus";

// Desktop components
import Hero from "../components/landingPage/Hero";
import PublicNavbar from "../components/PublicNavbar";
import TopNav from "../components/landingPage/TopNav";
import PromoBar from "../components/landingPage/PromoBar";
import CoursesSection from "../components/course/CoursesSection";
import AboutSection from "../components/landingPage/AboutSection";
import ContactEnrollment from "../components/landingPage/ContactEnrollment";
import Footer from "../components/landingPage/Footer";
import Carousel from "../components/CarouselMain";
import ViewAllCoursesMobile from "../components/mobile/components/ViewAllCoursesMobile";
import CTABanner from "../components/CTABanner";
import MobileLandingPage from "../components/mobile/components/MobileLandingPage";
import "../styles/LandingPage.css";
import SessionsBar from "../components/landingPage/SessionsBar";
import SiteBannerPopup from "../components/landingPage/SiteBannerPopup";

// ── Custom hook: returns true when viewport is ≤ 768 px ──────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= breakpoint
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);

  return isMobile;
}
// ─────────────────────────────────────────────────────────────────────────────

function LandingPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/courses?status=Active`);
        const active = filterActiveCourses(res.data);
        setCourses(active);
        const uniqueCategories = [
          ...new Set(active.map((c) => c.category)),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  return (
    <>
      <SiteBannerPopup />
      {isMobile ? (
        <MobileLandingPage courses={courses} />
      ) : (
      <div>
      <TopNav />
      <PublicNavbar courses={courses} />
      <Hero />

      <div className="adv-bar">
        <div>
          <PromoBar />
        </div>
      </div>
      <div className="sessions-bar" > 
        <SessionsBar />
        </div>
      <div>
        <Carousel courses={courses} />
      </div>

      <div id="courses">
        <CoursesSection categories={categories} />
      </div>

      <AboutSection />
      <CTABanner />
      {/* <ContactEnrollment /> */}
      <Footer />
      </div>
      )}
    </>
  );
}

export default LandingPage;