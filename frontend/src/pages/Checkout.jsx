import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Topbar from '../components/common/Topbar'
import Navbar  from '../components/common/Navbar'
import Footer  from '../components/common/Footer'
import API     from '../services/api'
import './checkout.css'

/* ── tiny helpers ───────────────────────────────────────────── */
const fmt = (n) => `$${Number(n).toLocaleString()}`

const CARD_ICONS = {
  visa:       '💳 Visa',
  mastercard: '💳 Mastercard',
  amex:       '💳 Amex',
}

/* ── Step indicator ─────────────────────────────────────────── */
const Steps = ({ step }) => (
  <div className="ck-steps">
    {['Details', 'Payment', 'Confirm'].map((label, i) => (
      <div key={label} className={`ck-step ${step === i + 1 ? 'ck-step--active' : ''} ${step > i + 1 ? 'ck-step--done' : ''}`}>
        <span className="ck-step-num">{step > i + 1 ? '✓' : i + 1}</span>
        <span className="ck-step-label">{label}</span>
        {i < 2 && <span className="ck-step-bar" />}
      </div>
    ))}
  </div>
)

/* ── Order summary sidebar ──────────────────────────────────── */
const OrderSummary = ({ course, option, qty, price }) => {
  const total = price * qty
  const gst   = +(total * 0.1).toFixed(2)      // 10% GST demo
  const grand = +(total + gst).toFixed(2)

  return (
    <div className="ck-summary">
      <h3 className="ck-summary-title">Order Summary</h3>

      <div className="ck-summary-course">
        <div className="ck-summary-thumb">
          {course?.thumbnail
            ? <img src={course.thumbnail} alt={course.title} />
            : <div className="ck-summary-thumb-ph">📖</div>}
        </div>
        <div className="ck-summary-info">
          <p className="ck-summary-ctitle">{course?.title}</p>
          <p className="ck-summary-option">Option: <strong>{option}</strong></p>
          <p className="ck-summary-qty">Qty: {qty}</p>
        </div>
      </div>

      <div className="ck-summary-rows">
        <div className="ck-row"><span>Subtotal</span><span>{fmt(total)}</span></div>
        <div className="ck-row"><span>GST (10%)</span><span>{fmt(gst)}</span></div>
        <div className="ck-row ck-row--total"><span>Total</span><span>{fmt(grand)}</span></div>
      </div>

      <div className="ck-demo-note">
        🔒 Demo mode — no real charges. Payment data is stored for admin review.
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */
const Checkout = () => {
  const { state } = useLocation()
  const navigate  = useNavigate()

  // state injected by CourseCard
  const course  = state?.course  || {}
  const option  = state?.option  || 'Standard'
  const qty     = state?.qty     || 1
  const price   = state?.price   || Number(course.price) || 0
  const total   = +(price * qty * 1.1).toFixed(2)  // incl. 10% GST

  // ── form state ──────────────────────────────────────────────
  const [step, setStep]     = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState(false)

  // Step 1 — personal details
  const [details, setDetails] = useState({
    fullName: '', email: '', phone: '', company: '',
  })

  // Step 2 — demo payment details
  const [payment, setPayment] = useState({
    cardNumber: '', expiry: '', cvv: '', cardName: '',
    cardType: 'visa',
  })

  const updD = (k) => (e) => setDetails(p => ({ ...p, [k]: e.target.value }))
  const updP = (k) => (e) => setPayment(p => ({ ...p, [k]: e.target.value }))

  // ── validation ───────────────────────────────────────────────
  const validateStep1 = () => {
    if (!details.fullName.trim()) return 'Full name is required.'
    if (!details.email.trim() || !details.email.includes('@')) return 'Valid email is required.'
    if (!details.phone.trim()) return 'Phone number is required.'
    return ''
  }

  const validateStep2 = () => {
    const raw = payment.cardNumber.replace(/\s/g, '')
    if (raw.length < 13) return 'Card number must be at least 13 digits.'
    if (!payment.expiry.match(/^\d{2}\/\d{2}$/)) return 'Expiry must be MM/YY.'
    if (payment.cvv.length < 3) return 'CVV must be 3-4 digits.'
    if (!payment.cardName.trim()) return 'Cardholder name is required.'
    return ''
  }

  // ── step navigation ──────────────────────────────────────────
  const handleNext = () => {
    setError('')
    if (step === 1) {
      const err = validateStep1()
      if (err) { setError(err); return }
      setStep(2)
    } else if (step === 2) {
      const err = validateStep2()
      if (err) { setError(err); return }
      setStep(3)
    }
  }

  // ── submit payment ───────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = {
        // course info
        courseId:    course._id,
        courseName:  course.title,
        option,
        qty,
        unitPrice:   price,
        amount:      total,
        currency:    'AUD',

        // buyer info
        userName:    details.fullName,
        userEmail:   details.email,
        userPhone:   details.phone,
        company:     details.company,

        // demo card info (last 4 digits only — never store full card)
        cardType:    payment.cardType,
        cardLast4:   payment.cardNumber.replace(/\s/g, '').slice(-4),
        cardName:    payment.cardName,

        // demo status
        status:      'paid',
        paymentMode: 'demo_card',
        transactionId: 'DEMO-' + Date.now(),
      }

      await API.post('/payments', payload)
      setSuccess(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── format card number ───────────────────────────────────────
  const formatCard = (v) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d
  }

  // ── success screen ───────────────────────────────────────────
  if (success) {
    return (
      <>
        <Topbar /><Navbar />
        <div className="ck-page">
          <div className="ck-success">
            <div className="ck-success-icon">✅</div>
            <h2>Payment Successful!</h2>
            <p>Thank you, <strong>{details.fullName}</strong>! Your booking for</p>
            <p className="ck-success-course">"{course.title}"</p>
            <p>({option} — {fmt(total)} incl. GST) has been confirmed.</p>
            <p className="ck-success-email">A confirmation will be sent to <strong>{details.email}</strong>.</p>
            <div className="ck-success-actions">
              <button className="ck-btn ck-btn-red" onClick={() => navigate('/')}>Back to Home</button>
              <button className="ck-btn ck-btn-outline" onClick={() => navigate('/courses')}>Browse More</button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Topbar /><Navbar />

      <div className="ck-page">
        <div className="ck-wrap">

          <h1 className="ck-heading">Checkout</h1>
          <Steps step={step} />

          <div className="ck-grid">

            {/* ── Left: form ─────────────────────────────────── */}
            <div className="ck-form-col">

              {error && <div className="ck-error">{error}</div>}

              {/* STEP 1 — Personal details */}
              {step === 1 && (
                <div className="ck-card">
                  <h2 className="ck-card-title">Your Details</h2>

                  <div className="ck-field-row">
                    <label className="ck-label">Full Name *</label>
                    <input className="ck-input" value={details.fullName} onChange={updD('fullName')} placeholder="John Smith" />
                  </div>
                  <div className="ck-field-row">
                    <label className="ck-label">Email *</label>
                    <input className="ck-input" type="email" value={details.email} onChange={updD('email')} placeholder="john@example.com" />
                  </div>
                  <div className="ck-field-row">
                    <label className="ck-label">Phone *</label>
                    <input className="ck-input" value={details.phone} onChange={updD('phone')} placeholder="+61 400 000 000" />
                  </div>
                  <div className="ck-field-row">
                    <label className="ck-label">Company (optional)</label>
                    <input className="ck-input" value={details.company} onChange={updD('company')} placeholder="Acme Pty Ltd" />
                  </div>

                  <button className="ck-btn ck-btn-red" onClick={handleNext}>
                    Continue to Payment →
                  </button>
                </div>
              )}

              {/* STEP 2 — Demo card payment */}
              {step === 2 && (
                <div className="ck-card">
                  <h2 className="ck-card-title">Payment Details</h2>
                  <div className="ck-demo-banner">
                    🧪 Demo Mode — use any test card numbers (e.g. 4242 4242 4242 4242)
                  </div>

                  {/* Card type selector */}
                  <div className="ck-field-row">
                    <label className="ck-label">Card Type</label>
                    <div className="ck-card-types">
                      {Object.entries(CARD_ICONS).map(([k, label]) => (
                        <button
                          key={k}
                          type="button"
                          className={`ck-card-type ${payment.cardType === k ? 'active' : ''}`}
                          onClick={() => setPayment(p => ({ ...p, cardType: k }))}
                        >{label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="ck-field-row">
                    <label className="ck-label">Card Number *</label>
                    <input
                      className="ck-input ck-mono"
                      value={payment.cardNumber}
                      onChange={(e) => setPayment(p => ({ ...p, cardNumber: formatCard(e.target.value) }))}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                    />
                  </div>

                  <div className="ck-field-split">
                    <div className="ck-field-row">
                      <label className="ck-label">Expiry *</label>
                      <input
                        className="ck-input ck-mono"
                        value={payment.expiry}
                        onChange={(e) => setPayment(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div className="ck-field-row">
                      <label className="ck-label">CVV *</label>
                      <input
                        className="ck-input ck-mono"
                        value={payment.cvv}
                        onChange={(e) => setPayment(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                        placeholder="123"
                        maxLength={4}
                        type="password"
                      />
                    </div>
                  </div>

                  <div className="ck-field-row">
                    <label className="ck-label">Cardholder Name *</label>
                    <input
                      className="ck-input"
                      value={payment.cardName}
                      onChange={updP('cardName')}
                      placeholder="Name as on card"
                    />
                  </div>

                  <div className="ck-btn-row">
                    <button className="ck-btn ck-btn-outline" onClick={() => setStep(1)}>← Back</button>
                    <button className="ck-btn ck-btn-red" onClick={handleNext}>Review Order →</button>
                  </div>
                </div>
              )}

              {/* STEP 3 — Review & confirm */}
              {step === 3 && (
                <div className="ck-card">
                  <h2 className="ck-card-title">Review & Confirm</h2>

                  <div className="ck-review-section">
                    <h4>Your Details</h4>
                    <p><strong>Name:</strong> {details.fullName}</p>
                    <p><strong>Email:</strong> {details.email}</p>
                    <p><strong>Phone:</strong> {details.phone}</p>
                    {details.company && <p><strong>Company:</strong> {details.company}</p>}
                  </div>

                  <div className="ck-review-section">
                    <h4>Payment</h4>
                    <p><strong>Card:</strong> {CARD_ICONS[payment.cardType]} ending in {payment.cardNumber.replace(/\s/g, '').slice(-4)}</p>
                    <p><strong>Cardholder:</strong> {payment.cardName}</p>
                  </div>

                  <div className="ck-review-section ck-review-total">
                    <p>Total to be charged: <strong>{fmt(total)}</strong></p>
                  </div>

                  <div className="ck-btn-row">
                    <button className="ck-btn ck-btn-outline" onClick={() => setStep(2)}>← Back</button>
                    <button
                      className="ck-btn ck-btn-red"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? 'Processing…' : `Confirm & Pay ${fmt(total)}`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: order summary ────────────────────────── */}
            <div className="ck-summary-col">
              <OrderSummary course={course} option={option} qty={qty} price={price} />
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default Checkout