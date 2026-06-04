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


// ── Footer ─────────────────────────────────────────────────────────────────
export const getFooter   = ()      => API.get('/site/footer').then(r => r.data.data)
export const updateFooter = (body) => API.put('/site/footer', body).then(r => r.data.data)