// import { BrowserRouter, Routes, Route } from 'react-router-dom'

// import Home       from '../pages/Home'
// import Courses    from '../pages/Courses'
// import Login      from '../pages/Login'
// import Register   from '../pages/Register'
// import About      from '../pages/About'
// import Contact    from '../pages/Contact'
// import VocRenewal  from '../pages/VocRenewal'   // ← NEW


// import ProtectedAdminRoute from '../components/ProtectedadminRoute'
// import AdminLayout         from '../layouts/AdminLayout'
// import Cart                from '../components/home/Cart'

// // Admin pages
// import AdminCourses       from '../pages/admin/AdminCourses'
// import AdminUsers         from '../pages/admin/AdminUsers'
// import AdminPayments      from '../pages/admin/Adminpayments'
// import AdminSchedule      from '../pages/admin/AdminSchedule'
// import AdminGallery       from '../pages/admin/AdminGallery'
// import AdminBanner        from '../pages/admin/AdminBanner'
// import Activitylogs       from '../pages/admin/Activitylogs'
// import Cms                from '../pages/admin/Cms'
// import Skilladmindashboard from '../pages/admin/Skilladmindashboard'
// import CourseSingle from '../pages/Coursesinlgle'

// const AdminWrap = ({ children }) => (
//   <ProtectedAdminRoute>
//     <AdminLayout>{children}</AdminLayout>
//   </ProtectedAdminRoute>
// )

// const AppRoutes = () => (
//   <BrowserRouter>
//     <Routes>
//       {/* Public routes */}
//       <Route path="/"         element={<Home />} />
//       <Route path="/courses"  element={<Courses />} />
//       <Route path="/login"    element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/cart"     element={<Cart />} />
//       <Route path="/about"    element={<About />} />
//       <Route path="/contact"  element={<Contact />} />
//       <Route path="/voc"               element={<VocRenewal />} />
//       <Route path="/courses/:id"        element={<CourseSingle />} />

//       {/* Admin routes */}
//       <Route path="/admin"              element={<AdminWrap><Skilladmindashboard /></AdminWrap>} />
//       <Route path="/admin/courses"      element={<AdminWrap><AdminCourses /></AdminWrap>} />
//       <Route path="/admin/users"        element={<AdminWrap><AdminUsers /></AdminWrap>} />
//       <Route path="/admin/payments"     element={<AdminWrap><AdminPayments /></AdminWrap>} />
//       <Route path="/admin/schedule"     element={<AdminWrap><AdminSchedule /></AdminWrap>} />
//       <Route path="/admin/gallery"      element={<AdminWrap><AdminGallery /></AdminWrap>} />
//       <Route path="/admin/banner"       element={<AdminWrap><AdminBanner /></AdminWrap>} />
//       <Route path="/admin/activitylogs" element={<AdminWrap><Activitylogs /></AdminWrap>} />
//       <Route path="/cms"                element={<AdminWrap><Cms /></AdminWrap>} />
//     </Routes>
//   </BrowserRouter>
// )

// export default AppRoutes


import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home       from '../pages/Home'
import Courses    from '../pages/Courses'
import Login      from '../pages/Login'
import Register   from '../pages/Register'
import About      from '../pages/About'
import Contact    from '../pages/Contact'
import VocRenewal  from '../pages/VocRenewal'   // ← NEW


import ProtectedAdminRoute from '../components/ProtectedadminRoute'
import GuestRoute          from '../components/GuestRoute'
import AdminLayout         from '../layouts/AdminLayout'
import Cart                from '../components/home/Cart'

// Admin pages
import AdminCourses       from '../pages/admin/AdminCourses'
import AdminUsers         from '../pages/admin/AdminUsers'
import AdminPayments      from '../pages/admin/Adminpayments'
import AdminSchedule      from '../pages/admin/AdminSchedule'
import AdminGallery       from '../pages/admin/AdminGallery'
import AdminBanner        from '../pages/admin/AdminBanner'
import Activitylogs       from '../pages/admin/Activitylogs'
import Cms                from '../pages/admin/Cms'
import AdminSlider        from '../pages/admin/AdminSlider'
import Skilladmindashboard from '../pages/admin/Skilladmindashboard'
import CourseSingle from '../pages/Coursesinlgle'

const AdminWrap = ({ children }) => (
  <ProtectedAdminRoute>
    <AdminLayout>{children}</AdminLayout>
  </ProtectedAdminRoute>
)

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Public routes */}
      <Route path="/"         element={<Home />} />
      <Route path="/courses"  element={<Courses />} />
      <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/cart"     element={<Cart />} />
      <Route path="/about"    element={<About />} />
      <Route path="/contact"  element={<Contact />} />
      <Route path="/voc"               element={<VocRenewal />} />
      <Route path="/courses/:id"        element={<CourseSingle />} />

      {/* Admin routes */}
      <Route path="/admin"              element={<AdminWrap><Skilladmindashboard /></AdminWrap>} />
      <Route path="/admin/courses"      element={<AdminWrap><AdminCourses /></AdminWrap>} />
      <Route path="/admin/users"        element={<AdminWrap><AdminUsers /></AdminWrap>} />
      <Route path="/admin/payments"     element={<AdminWrap><AdminPayments /></AdminWrap>} />
      <Route path="/admin/schedule"     element={<AdminWrap><AdminSchedule /></AdminWrap>} />
      <Route path="/admin/gallery"      element={<AdminWrap><AdminGallery /></AdminWrap>} />
      <Route path="/admin/banner"       element={<AdminWrap><AdminBanner /></AdminWrap>} />
      <Route path="/admin/slider"       element={<AdminWrap><AdminSlider /></AdminWrap>} />
      <Route path="/admin/activitylogs" element={<AdminWrap><Activitylogs /></AdminWrap>} />
      <Route path="/cms"                element={<AdminWrap><Cms /></AdminWrap>} />
    </Routes>
  </BrowserRouter>
)

export default AppRoutes