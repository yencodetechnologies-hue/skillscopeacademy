// import { coursesData } from './mockData'

// export const fetchCourses = async () => {
//   // Simulate API delay
//   await new Promise(res => setTimeout(res, 300))
//   return { courses: coursesData }
// }


import API from './api'

export const getCourses = () =>
  API.get('/courses')

export const createCourse = (
  formData
) =>
  API.post(
    '/courses',
    formData,
    {
      headers: {
        'Content-Type':
          'multipart/form-data',
      },
    }
  )