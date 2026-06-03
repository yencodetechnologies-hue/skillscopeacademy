

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home       from '../pages/Home'
import Courses    from '../pages/Courses'
import Login      from '../pages/Login'
import Register   from '../pages/Register'

import ProtectedAdminRoute from '../components/ProtectedadminRoute'
import AdminLayout         from '../layouts/AdminLayout'

// Admin pages
import AdminDashboard  from '../pages/admin/Admindashboard'
import AdminCourses    from '../pages/admin/AdminCourses'
import AdminUsers      from '../pages/admin/AdminUsers'
import AdminPayments   from '../pages/admin/Adminpayments'
import AdminSchedule   from '../pages/admin/AdminSchedule'
import AdminGallery    from '../pages/admin/AdminGallery'
import AdminBanner     from '../pages/admin/AdminBanner'
import AdminActivityLogs from '../pages/admin/AdminActivityLogs'
import Cart from '../components/home/Cart'

const AdminWrap = ({ children }) => (
  <ProtectedAdminRoute>
    <AdminLayout>{children}</AdminLayout>
  </ProtectedAdminRoute>
)

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"         element={<Home />} />
      <Route path="/courses"  element={<Courses />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/cart" element={<Cart/>} />


      {/* Admin routes — each page is its own component */}
      <Route path="/admin"              element={<AdminWrap><AdminDashboard /></AdminWrap>} />
      <Route path="/admin/courses"      element={<AdminWrap><AdminCourses /></AdminWrap>} />
      <Route path="/admin/users"        element={<AdminWrap><AdminUsers /></AdminWrap>} />
      <Route path="/admin/payments"     element={<AdminWrap><AdminPayments /></AdminWrap>} />
      <Route path="/admin/schedule"     element={<AdminWrap><AdminSchedule /></AdminWrap>} />
      <Route path="/admin/gallery"      element={<AdminWrap><AdminGallery /></AdminWrap>} />
      <Route path="/admin/banner"       element={<AdminWrap><AdminBanner /></AdminWrap>} />
      <Route path="/admin/activity-logs"element={<AdminWrap><AdminActivityLogs /></AdminWrap>} />
    </Routes>
  </BrowserRouter>
)

export default AppRoutes