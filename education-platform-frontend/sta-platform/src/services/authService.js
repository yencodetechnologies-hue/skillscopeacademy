// import API from '../services/api'

// /*
// ========================================
// REGISTER USER
// ========================================
// */

// export const registerUser = async (userData) => {
//   const response = await API.post(
//     '/auth/register',
//     userData
//   )

//   /*
//     Save Token
//   */

//   if (response.data.token) {
//     localStorage.setItem(
//       'token',
//       response.data.token
//     )
//   }

//   /*
//     Save User
//   */

//   if (response.data.user) {
//     localStorage.setItem(
//       'user',
//       JSON.stringify(response.data.user)
//     )
//   }

//   return response.data
// }

// /*
// ========================================
// LOGIN USER
// ========================================
// */

// export const loginUser = async (userData) => {
//   const response = await API.post(
//     '/auth/login',
//     userData
//   )

//   /*
//     Save Token
//   */

//   if (response.data.token) {
//     localStorage.setItem(
//       'token',
//       response.data.token
//     )
//   }

//   /*
//     Save User
//   */

//   if (response.data.user) {
//     localStorage.setItem(
//       'user',
//       JSON.stringify(response.data.user)
//     )
//   }

//   return response.data
// }

// /*
// ========================================
// LOGOUT USER
// ========================================
// */

// export const logoutUser = () => {
//   localStorage.removeItem('token')
//   localStorage.removeItem('user')
// }

// /*
// ========================================
// GET CURRENT USER
// ========================================
// */

// export const getCurrentUser = () => {
//   const user = localStorage.getItem('user')

//   return user ? JSON.parse(user) : null
// }

import API from './api'

/*
========================================
REGISTER USER
========================================
*/

export const registerUser = async (userData) => {
  const response = await API.post('/auth/register', userData)

  if (response.data.token) {
    localStorage.setItem('token', response.data.token)
  }

  if (response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user))
  }

  return response.data
}

/*
========================================
LOGIN USER
========================================
*/

export const loginUser = async (userData) => {
  const response = await API.post('/auth/login', userData)

  if (response.data.token) {
    localStorage.setItem('token', response.data.token)
  }

  if (response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user))
  }

  return response.data
}

/*
========================================
LOGOUT USER
========================================
*/

export const logoutUser = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

/*
========================================
GET CURRENT USER (from localStorage)
========================================
*/

export const getCurrentUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

/*
========================================
FETCH ALL USERS (Admin — from backend)
========================================
*/

export const getAllUsers = () =>
  API.get('/auth/finduser')