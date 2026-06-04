// Reusable FAQ section — used in Home page and Contact page
import { useState, useEffect } from 'react'
import { getFaqs } from '../../services/siteContentServices'

export default function FaqSection({ title = 'Frequently Asked Questions', subtitle = '' }) {
  const [faqs, setFaqs]     = useState([])
  const [open, setOpen]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFaqs()
      .then(d => { setFaqs(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading || faqs.length === 0) return null

  return (
    <section style={{ background: '#f8fafc', padding: '64px 24px' }}>
      <div style={{ maxWidth: 740, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 8 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 36 }}>{subtitle}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((faq, i) => (
            <div
              key={faq._id || i}
              style={{
                background: '#fff',
                border: `1px solid ${open === i ? '#c4b5fd' : '#e2e8f0'}`,
                borderRadius: 12,
                overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '16px 22px',
                  border: 'none',
                  background: open === i ? '#faf5ff' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
                  {faq.question}
                </span>
                <span style={{
                  fontSize: 20,
                  color: '#6366f1',
                  flexShrink: 0,
                  fontWeight: 300,
                  transform: open === i ? 'rotate(45deg)' : 'none',
                  transition: 'transform 0.2s',
                  lineHeight: 1,
                }}>+</span>
              </button>
              {open === i && (
                <div style={{ padding: '0 22px 18px', fontSize: 14, color: '#475569', lineHeight: 1.8 }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}