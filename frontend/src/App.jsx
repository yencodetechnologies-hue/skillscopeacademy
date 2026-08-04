// import { BrowserRouter, Routes, Route } from "react-router-dom"
// import { useContext } from "react"
// import { AuthContext } from "./context/AuthContext"

// import Login from "./pages/Login"
// import Register from "./pages/Register"
// import Courses from "./components/course/Courses"
// import PortalLayout from "./pages/PortalLayout"
// import StudentDashboard from "./pages/StudentDashboard"
// import TeacherDashboard from "./pages/TeacherDashboard"
// import AdminDashboard from "./pages/AdminDashboard"
// import CompanyDashboard from "./components/company/CompanyDashboard"
// import Students from "./components/Students"
// import Schedule from "./components/Schedule"
// import Teachers from "./components/Teachers"
// import LlndResults from "./components/llnd/LlndResults"
// import EnrollmentForms from "./components/EnrollmentForms"
// import EnrollmentLinks from "./components/EnrollmentLinks"
// import Exams from "./components/Exams"
// import Payments from "./components/Payments"
// import Certificates from "./components/Certificates"
// import GoogleReviews from "./components/landingPage/GoogleReviews"
// import Gallery from "./components/landingPage/Gallery"
// import LandingPage from "./pages/LandingPage"
// import CourseDetails from "./pages/CourseDetails"
// import BookNow from "./pages/BookNow"
// import CourseResult from "./components/llnd/CourseResult"
// import LLNDAssessmentComplete from "./components/llnd/LLNDAssessmentComplete"
// import EnrollmentComplete from "./components/enrollmrntRegister/EnrollmentComplete"
// import VocMain from "./components/voc/VocMain"
// import Contact from "./components/Contact"
// import About from "./components/About"
// import CourseCard from "./components/course/CourseCard"
// import Companies from "./components/Companies"
// import CompanyCourses from "./components/company/CompanyCourses"
// import StudentsEnrolled from "./components/company/StudentsEnrolled"
// import CompanyPayments from "./components/company/CompanyPayments"
// import AllCourses from "./components/landingPage/AllCourses"
// import ComboCourses from "./components/landingPage/ComboCourses"
// import StudentMyCourses from "./components/student/StudentMyCourses"
// import StudentCertificate from "./components/student/StudentCertificate"
// import StudentEnrollmentForm from "./components/student/StudentEnrollmentForm"
// import StudentResults from "./components/student/StudentResults"
// import StudentSchedule from "./components/student/StudentSchedule"
// import ProtectedRoute from "./components/ProtectedRoute"
// import EnrollmentSuccess from "./components/student/StudentEnrollmentSuccess"
// import StudentProfile from "./components/Profile"
// import ScrollToTop from "./components/ScrollToTop"
// import LegacyCourseRedirect from "./components/LegacyCourseRedirect"
// import CompanyPayment from "./components/CompanyPayment"
// import AgentPayments from "./components/AgentPayments"
// import AdminResultsUpload from "./components/AdminResultsUpload"
// import AdminSiteBanner from "./components/AdminSiteBanner"
// import AdminActivityLogs from "./components/AdminActivityLogs"
// import Reports from "./components/Reports"
// import VocSubmissions from "./components/VocSubmissions"
// import Sliders from "./components/Sliders"
// import Partners from "./components/Partners"
// import PublicForms from "./components/PublicForms"

// function App() {

//     const { user } = useContext(AuthContext)

//     return (

//         <BrowserRouter>
//             <ScrollToTop />

//             <Routes>

//                 <Route path="/" element={<LandingPage />} />
//                 <Route path="/login" element={<Login />} />
//                 {/* <Route path="/register" element={<Register />} /> */}
//                 {/*
//                   SEO-friendly course URLs. The param is the course's
//                   manual slug (unique) — e.g. /course/forklift-licence.
//                   LegacyCourseRedirect catches the old /course/{slug}-{id}
//                   format and rewrites the URL so cached/indexed links keep
//                   working without breaking the new pages.
//                 */}
//                 <Route path="/course/:slug" element={<LegacyCourseRedirect><CourseDetails /></LegacyCourseRedirect>} />
//                 <Route path="/enroll/:id" element={<BookNow />} />
//                 <Route path="/book-now/course/:slug" element={<LegacyCourseRedirect bookNow><BookNow /></LegacyCourseRedirect>} />
//                 <Route path="/book-now/company/:id" element={<BookNow />} />
//                 <Route path="/book-now" element={<BookNow />} />
//                 <Route path="/course-result" element={<CourseResult />} />
//                 <Route path="/llnd-assesment-complete" element={<LLNDAssessmentComplete />} />
//                 <Route path="/booking-success" element={<EnrollmentComplete />} />
//                 <Route path="/voc" element={<VocMain />} />
//                 <Route path="/contact" element={<Contact />} />
//                 <Route path="/about" element={<About />} />
//                 <Route path="/course" element={<CourseCard />} />
//                 <Route path="/all-courses" element={<AllCourses />} />
//                 <Route path="/combo-courses" element={<ComboCourses />} />
//                 <Route path="/forms" element={<PublicForms />} />
//                 <Route path="/enrollment-success" element={<EnrollmentSuccess />} />



//                 {/* STUDENT */}
//                 <Route
//                     path="/student"
//                     element={
//                         <ProtectedRoute allowedRoles={["Student"]}> {/* ✅ */}
//                             <PortalLayout user={user} />
//                         </ProtectedRoute>
//                     }
//                 >
//                     <Route index element={<StudentDashboard />} />
//                     <Route path="/student/my-courses" element={<StudentMyCourses />} />
//                     <Route path="/student/schedule" element={<StudentSchedule />} />
//                     <Route path="/student/enrollment-form" element={<StudentEnrollmentForm />} />
//                     <Route path="/student/results" element={<StudentResults />} />
//                     <Route path="/student/certificates" element={<StudentCertificate />} />
//                     <Route path="/student/profile" element={<StudentProfile />} />


//                 </Route>

//                 {/* TEACHER */}
//                 <Route
//                     path="/teacher"
//                     element={
//                         <ProtectedRoute allowedRoles={["Teacher"]}> {/* ✅ */}
//                             <PortalLayout user={user} />
//                         </ProtectedRoute>
//                     }
//                 >
//                     <Route index element={<TeacherDashboard />} />
//                 </Route>

//                 {/* COMPANY */}
//                 <Route
//                     path="/company"
//                     element={
//                         <ProtectedRoute allowedRoles={["Company"]}> {/* ✅ */}
//                             <PortalLayout user={user} />
//                         </ProtectedRoute>
//                     }
//                 >
//                     <Route index element={<CompanyDashboard />} />
//                     <Route path="companyCourses" element={<CompanyCourses />} />
//                     <Route path="companyStudents" element={<StudentsEnrolled />} />
//                     <Route path="companyPayments" element={<CompanyPayments />} />
//                 </Route>

//                 {/* ADMIN */}
//                 <Route
//                     path="/admin"
//                     element={
//                         <ProtectedRoute allowedRoles={["Admin"]}> {/* ✅ */}
//                             <PortalLayout user={user} />
//                         </ProtectedRoute>
//                     }
//                 >
//                     <Route index element={<AdminDashboard />} />
//                     <Route path="students" element={<Students />} />
//                     <Route path="schedule" element={<Schedule />} />
//                     <Route path="teachers" element={<Teachers />} />
//                     <Route path="llnd-results" element={<LlndResults />} />
//                     <Route path="enrollment-forms" element={<EnrollmentForms />} />
//                     <Route path="enrollment-links" element={<EnrollmentLinks />} />
//                     <Route path="exams" element={<Exams />} />
//                     <Route path="payments" element={<Payments />} />
//                     <Route path="company-payments" element={<CompanyPayment />} />
//                     <Route path="agent-payments" element={<AgentPayments />} />
//                     <Route path="certificates" element={<Certificates />} />
//                     <Route path="google-reviews" element={<GoogleReviews />} />
//                     <Route path="gallery" element={<Gallery />} />
//                     <Route path="courses" element={<Courses />} />
//                     <Route path="companies" element={<Companies />} />
                    
//                     <Route path="results-upload" element={<AdminResultsUpload />} />
//                     <Route path="site-banner" element={<AdminSiteBanner />} />
//                     <Route path="activity-logs" element={<AdminActivityLogs />} />
//                     <Route path="reports" element={<Reports />} />
//                     <Route path="voc-submissions" element={<VocSubmissions />} />
//                     <Route path="sliders" element={<Sliders />} />
//                     <Route path="partners" element={<Partners />} />
//                 </Route>

//             </Routes>

//         </BrowserRouter>

//     )

// }

// export default App


import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "./context/AuthContext"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Courses from "./components/course/Courses"
import PortalLayout from "./pages/PortalLayout"
import StudentDashboard from "./pages/StudentDashboard"
import TeacherDashboard from "./pages/TeacherDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import CompanyDashboard from "./components/company/CompanyDashboard"
import Students from "./components/Students"
import EmailTemplates from "./components/EmailTemplates"
import Schedule from "./components/Schedule"
import Teachers from "./components/Teachers"
import LlndResults from "./components/llnd/LlndResults"
import EnrollmentForms from "./components/EnrollmentForms"
import EnrollmentLinks from "./components/EnrollmentLinks"
import Exams from "./components/Exams"
import Payments from "./components/Payments"
import Certificates from "./components/Certificates"
import GoogleReviews from "./components/landingPage/GoogleReviews"
import Gallery from "./components/landingPage/Gallery"
import LandingPage from "./pages/LandingPage"
import CourseDetails from "./pages/CourseDetails"
import BookNow from "./pages/BookNow"
import CourseResult from "./components/llnd/CourseResult"
import LLNDAssessmentComplete from "./components/llnd/LLNDAssessmentComplete"
import EnrollmentComplete from "./components/enrollmrntRegister/EnrollmentComplete"
import VocMain from "./components/voc/VocMain"
import Contact from "./components/Contact"
import About from "./components/About"
import CourseCard from "./components/course/CourseCard"
import Companies from "./components/Companies"
import CompanyCourses from "./components/company/CompanyCourses"
import StudentsEnrolled from "./components/company/StudentsEnrolled"
import CompanyPayments from "./components/company/CompanyPayments"
import AllCourses from "./components/landingPage/AllCourses"
import ComboCourses from "./components/landingPage/ComboCourses"
import StudentMyCourses from "./components/student/StudentMyCourses"
import StudentCertificate from "./components/student/StudentCertificate"
import StudentEnrollmentForm from "./components/student/StudentEnrollmentForm"
import StudentResults from "./components/student/StudentResults"
import StudentSchedule from "./components/student/StudentSchedule"
import ProtectedRoute from "./components/ProtectedRoute"
import EnrollmentSuccess from "./components/student/StudentEnrollmentSuccess"
import StudentProfile from "./components/Profile"
import ScrollToTop from "./components/ScrollToTop"
import LegacyCourseRedirect from "./components/LegacyCourseRedirect"
import CompanyPayment from "./components/CompanyPayment"
import AgentPayments from "./components/AgentPayments"
import AdminResultsUpload from "./components/AdminResultsUpload"
import AdminSiteBanner from "./components/AdminSiteBanner"
import AdminActivityLogs from "./components/AdminActivityLogs"
import Reports from "./components/Reports"
import VocSubmissions from "./components/VocSubmissions"
import Sliders from "./components/Sliders"
import Partners from "./components/Partners"
import PublicForms from "./components/PublicForms"
import UniqueStudentIdentifier from "./pages/UniqueStudentIdentifier"
import AdminFormDocuments from "./components/AdminFormDocument"
import CodeOfPractice from "./components/CodeOfPractice"
import AdminCodeOfPractice from "./components/AdminCodeOfPractice"

function App() {

    const { user } = useContext(AuthContext)

    return (

        <BrowserRouter>
            <ScrollToTop />

            <Routes>

                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/*
                  SEO-friendly course URLs. The param is the course's
                  manual slug (unique) — e.g. /course/forklift-licence.
                  LegacyCourseRedirect catches the old /course/{slug}-{id}
                  format and rewrites the URL so cached/indexed links keep
                  working without breaking the new pages.
                */}
                <Route path="/course/:slug" element={<LegacyCourseRedirect><CourseDetails /></LegacyCourseRedirect>} />
                <Route path="/enroll/:id" element={<BookNow />} />
                <Route path="/book-now/course/:slug" element={<LegacyCourseRedirect bookNow><BookNow /></LegacyCourseRedirect>} />
                <Route path="/book-now/company/:id" element={<BookNow />} />
                <Route path="/book-now" element={<BookNow />} />
                <Route path="/course-result" element={<CourseResult />} />
                <Route path="/llnd-assesment-complete" element={<LLNDAssessmentComplete />} />
                <Route path="/booking-success" element={<EnrollmentComplete />} />
                <Route path="/voc" element={<VocMain />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/course" element={<CourseCard />} />
                <Route path="/all-courses" element={<AllCourses />} />
                <Route path="/combo-courses" element={<ComboCourses />} />
                <Route path="/forms" element={<PublicForms />} />
                <Route path="/code-of-practice" element={<CodeOfPractice />} />
                <Route path="/usi" element={<UniqueStudentIdentifier />} />
                <Route path="/enrollment-success" element={<EnrollmentSuccess />} />



                {/* STUDENT */}
                <Route
                    path="/student"
                    element={
                        <ProtectedRoute allowedRoles={["Student"]}> {/* ✅ */}
                            <PortalLayout user={user} />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<StudentDashboard />} />
                    <Route path="/student/my-courses" element={<StudentMyCourses />} />
                    <Route path="/student/schedule" element={<StudentSchedule />} />
                    <Route path="/student/enrollment-form" element={<StudentEnrollmentForm />} />
                    <Route path="/student/results" element={<StudentResults />} />
                    <Route path="/student/certificates" element={<StudentCertificate />} />
                    <Route path="/student/profile" element={<StudentProfile />} />


                </Route>

                {/* TEACHER */}
                <Route
                    path="/teacher"
                    element={
                        <ProtectedRoute allowedRoles={["Teacher"]}> {/* ✅ */}
                            <PortalLayout user={user} />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<TeacherDashboard />} />
                </Route>

                {/* COMPANY */}
                <Route
                    path="/company"
                    element={
                        <ProtectedRoute allowedRoles={["Company"]}> {/* ✅ */}
                            <PortalLayout user={user} />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<CompanyDashboard />} />
                    <Route path="companyCourses" element={<CompanyCourses />} />
                    <Route path="companyStudents" element={<StudentsEnrolled />} />
                    <Route path="companyPayments" element={<CompanyPayments />} />
                </Route>

                {/* ADMIN */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}> {/* ✅ */}
                            <PortalLayout user={user} />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<AdminDashboard />} />
                    <Route path="students" element={<Students />} />
                    <Route path="email-templates" element={<EmailTemplates />} />
                    <Route path="schedule" element={<Schedule />} />
                    <Route path="teachers" element={<Teachers />} />
                    <Route path="llnd-results" element={<LlndResults />} />
                    <Route path="enrollment-forms" element={<EnrollmentForms />} />
                    <Route path="enrollment-links" element={<EnrollmentLinks />} />
                    <Route path="exams" element={<Exams />} />
                    <Route path="payments" element={<Payments />} />
                    <Route path="company-payments" element={<CompanyPayment />} />
                    <Route path="agent-payments" element={<AgentPayments />} />
                    <Route path="certificates" element={<Certificates />} />
                    <Route path="google-reviews" element={<GoogleReviews />} />
                    <Route path="gallery" element={<Gallery />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="companies" element={<Companies />} />
                    
                    <Route path="results-upload" element={<AdminResultsUpload />} />
                    <Route path="form" element={<AdminFormDocuments />} />

                    <Route path="site-banner" element={<AdminSiteBanner />} />
                    <Route path="activity-logs" element={<AdminActivityLogs />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="voc-submissions" element={<VocSubmissions />} />
                    <Route path="sliders" element={<Sliders />} />
                    <Route path="partners" element={<Partners />} />
                    <Route path="code-of-practice" element={<AdminCodeOfPractice />} />
                </Route>

            </Routes>

        </BrowserRouter>

    )

}

export default App