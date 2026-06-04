import API from './api'

// ─── Categories ────────────────────────────────────────────────
export const getCategories  = ()            => API.get('/categories/getcategories')
export const createCategory = (formData)    => API.post('/categories/createcategories', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateCategory = (id, fd)      => API.put(`/categories/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteCategory = (id)         => API.delete(`/categories/${id}`)

// ─── Courses ───────────────────────────────────────────────────
// Backend returns: { success: true, courses: [...] }
export const getCourses          = ()       => API.get('/courses')
export const createCourse        = (fd)     => API.post('/courses', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateCourse        = (id, fd) => API.put(`/courses/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteCourse        = (id)     => API.delete(`/courses/${id}`)
export const toggleCourseStatus  = (id)     => API.patch(`/courses/${id}/toggle-status`)

// ─── Schedules ─────────────────────────────────────────────────
// Backend returns: { success: true, schedules: [...] }
export const getAllSchedules        = ()         => API.get('/schedules')
export const getSchedulesByCourse  = (courseId) => API.get(`/schedules/course/${courseId}`)
export const createSchedule        = (data)     => API.post('/schedules', data)
export const createBulkSchedules   = (data)  => API.post('/schedules/bulk', data) 
export const updateSchedule        = (id, data) => API.put(`/schedules/${id}`, data)
export const deleteSchedule        = (id)       => API.delete(`/schedules/${id}`)
export const toggleScheduleStatus  = (id)       => API.patch(`/schedules/${id}/toggle-status`)

export const deleteOldSchedules    = ()          => API.delete('/schedules/old')
// ─── Users ─────────────────────────────────────────────────────
// Backend returns: { status: true, data: [...] }
export const getAllUsers = () => API.get('/auth/finduser')

// ─── Payments ──────────────────────────────────────────────────
// Backend returns: { success: true, data: [...] }
export const getAllPayments = () => API.get('/payments')



// // ── Gallery ────────────────────────────────────
export const getGallery    = ()         => API.get('/gallery')
export const uploadGallery = (formData) => API.post('/gallery', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteGallery = (id)       => API.delete(`/gallery/${id}`)

// // ── Banner ─────────────────────────────────────
export const getBanners    = ()         => API.get('/banners')
export const createBanner  = (formData) => API.post('/banners', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateBanner  = (id, data) => API.put(`/banners/${id}`, data)
export const deleteBanner  = (id)       => API.delete(`/banners/${id}`)
export const toggleBanner  = (id)       => API.patch(`/banners/${id}/toggle`)

// // ── Activity Logs ──────────────────────────────
export const getActivityLogs = (params) => API.get('/activity-logs', { params })