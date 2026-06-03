import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:7000/api"
})

/*
========================================
REQUEST INTERCEPTOR
========================================
*/

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },

  (error) => {
    return Promise.reject(error)
  }
)

export default API