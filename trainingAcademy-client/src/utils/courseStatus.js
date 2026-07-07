/** Public catalog: only courses explicitly marked Active. */
export const isActiveCourse = (course) => course?.status === "Active"

export const filterActiveCourses = (courses) =>
  (Array.isArray(courses) ? courses : []).filter(isActiveCourse)

export const ACTIVE_COURSES_URL = (apiUrl) => `${apiUrl}/api/courses?status=Active`
