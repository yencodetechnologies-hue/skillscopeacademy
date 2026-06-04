import API from './api'

// ── About ──────────────────────────────────────────────────────────────────
export const getAbout   = ()       => API.get('/site/about').then(r => r.data.data)
// export const updateAbout = (body)  => API.put('/site/about', body).then(r => r.data.data)

export const updateAbout = (body) => {
  const payload = { ...body }

  delete payload._id
  delete payload.__v
  delete payload.createdAt
  delete payload.updatedAt

  return API.put('/site/about', payload)
    .then(r => r.data.data)
}

// ── Contact ────────────────────────────────────────────────────────────────
export const getContact   = ()      => API.get('/site/contact').then(r => r.data.data)
export const updateContact = (body) => API.put('/site/contact', body).then(r => r.data.data)

// ── FAQ ────────────────────────────────────────────────────────────────────
export const getFaqs    = ()        => API.get('/site/faqs').then(r => r.data.data)
export const getAllFaqs = ()        => API.get('/site/faqs/all').then(r => r.data.data)
export const createFaq  = (body)   => API.post('/site/faqs', body).then(r => r.data.data)
export const updateFaq  = (id, b)  => API.put(`/site/faqs/${id}`, b).then(r => r.data.data)
export const deleteFaq  = (id)     => API.delete(`/site/faqs/${id}`)

// ── Footer ─────────────────────────────────────────────────────────────────
export const getFooter   = ()      => API.get('/site/footer').then(r => r.data.data)
export const updateFooter = (body) => API.put('/site/footer', body).then(r => r.data.data)