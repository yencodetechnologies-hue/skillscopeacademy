import API from './api'

/*
========================================
GET ALL PAYMENTS (Admin)
— expects backend: GET /payments
  response: { status: true, data: [...] }
========================================
*/

export const getAllPayments = () =>
  API.get('/payments')

/*
========================================
CREATE PAYMENT
========================================
*/

export const createPayment = (paymentData) =>
  API.post('/payments', paymentData)