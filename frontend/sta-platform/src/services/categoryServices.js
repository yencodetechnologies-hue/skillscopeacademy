import API from './api'

export const getCategories = () =>
  API.get('/categories/getcategories')

export const createCategory = (
  formData
) =>
  API.post(
    '/categories/createcategories',
    formData,
    {
      headers: {
        'Content-Type':
          'multipart/form-data',
      },
    }
  )

export const deleteCategory = (
  id
) =>
  API.delete(`/categories/${id}`)