

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