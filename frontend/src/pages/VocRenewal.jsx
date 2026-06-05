import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { getCourses } from '../services/courseService'
import { getAllSchedules } from '../services/adminService'
import API from '../services/api'
import '../styles/voc.css'

// ─── India States & Cities ────────────────────────────────────
const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
]

const INDIA_CITIES = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kadapa', 'Kakinada', 'Anantapur'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tezpur'],
  'Assam': ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Nagaon', 'Tinsukia'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Anand', 'Bharuch', 'Morbi'],
  'Haryana': ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat'],
  'Himachal Pradesh': ['Shimla', 'Mandi', 'Solan', 'Dharamshala', 'Kangra', 'Kullu', 'Manali'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belagavi', 'Davanagere', 'Ballari', 'Tumkur', 'Shivamogga'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kannur'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded'],
  'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur', 'Puri', 'Balasore'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur'],
  'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Erode', 'Thoothukudi'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Secunderabad'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Allahabad', 'Meerut', 'Ghaziabad', 'Noida', 'Gorakhpur', 'Mathura'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Rishikesh', 'Haldwani', 'Rudrapur'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda'],
  'Andaman and Nicobar Islands': ['Port Blair'],
  'Chandigarh': ['Chandigarh'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Silvassa', 'Daman', 'Diu'],
  'Delhi': ['New Delhi', 'Delhi'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla'],
  'Ladakh': ['Leh', 'Kargil'],
  'Lakshadweep': ['Kavaratti'],
  'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
}

// ─── Step indicator ───────────────────────────────────────────
const steps = ['YOUR DETAILS', 'COURSES', 'PAYMENT', 'DONE']

const StepIndicator = ({ current }) => (
  <div className="voc-steps">
    {steps.map((label, i) => {
      const num = i + 1
      const done = num < current
      const active = num === current
      return (
        <div key={label} className="voc-step">
          <div className={`voc-step-circle ${done ? 'done' : active ? 'active' : ''}`}>
            {done ? '✓' : num}
          </div>
          <span className={`voc-step-label ${active ? 'active' : ''}`}>{label}</span>
        </div>
      )
    })}
  </div>
)

// ─── STEP 1 — Personal Details ────────────────────────────────
const Step1 = ({ data, onChange, onNext }) => {
  const [errors, setErrors] = useState({})
  const cities = INDIA_CITIES[data.state] || []

  const validate = () => {
    const e = {}
    const nameRegex = /^[a-zA-Z\s'-]{3,}$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[6-9]\d{9}$/
    const pincodeRegex = /^\d{6}$/

    if (!data.firstName.trim()) {
      e.firstName = 'First name is required'
    } else if (data.firstName.trim().length < 3) {
      e.firstName = 'Minimum 3 characters required'
    } else if (!/^[a-zA-Z\s'-]+$/.test(data.firstName)) {
      e.firstName = 'Only letters allowed'
    }

    if (!data.lastName.trim()) {
      e.lastName = 'Last name is required'
    } else if (data.lastName.trim().length < 3) {
      e.lastName = 'Minimum 3 characters required'
    } else if (!/^[a-zA-Z\s'-]+$/.test(data.lastName)) {
      e.lastName = 'Only letters allowed'
    }

    if (!data.email.trim()) {
      e.email = 'Email is required'
    } else if (!emailRegex.test(data.email)) {
      e.email = 'Enter a valid email address'
    }

    if (!data.phone.trim()) {
      e.phone = 'Phone number is required'
    } else if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
      e.phone = 'Enter valid 10-digit Indian mobile number'
    }

    if (!data.studentId.trim()) {
      e.studentId = 'Student ID / License # is required'
    } else if (data.studentId.trim().length < 3) {
      e.studentId = 'Minimum 3 characters required'
    }

    if (!data.address.trim()) {
      e.address = 'Address is required'
    } else if (data.address.trim().length < 5) {
      e.address = 'Please enter a complete address'
    }

    if (!data.state) e.state = 'Please select a state'

    if (!data.city) e.city = 'Please select a city'

    if (!data.postcode.trim()) {
      e.postcode = 'Pincode is required'
    } else if (!pincodeRegex.test(data.postcode)) {
      e.postcode = 'Enter valid 6-digit pincode'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => { if (validate()) onNext() }

  // When state changes, reset city
  const handleStateChange = (val) => {
    onChange('state', val)
    onChange('city', '')
  }

  const inputField = (name, placeholder, icon, type = 'text') => (
    <div className="voc-field">
      <div className={`voc-input-wrap ${errors[name] ? 'error' : ''}`}>
        <span className="voc-input-icon">{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={data[name]}
          onChange={e => {
            // Prevent leading/trailing spaces being typed
            const val = e.target.value
            onChange(name, val)
          }}
          onBlur={e => onChange(name, e.target.value.trim())}
          autoComplete="off"
        />
      </div>
      {errors[name] && <span className="voc-error">⚠ {errors[name]}</span>}
    </div>
  )

  return (
    <div className="voc-card">
      <div className="voc-card-header">
        <h2>VOC Renewal Form</h2>
        <p>Personal &amp; Contact Information</p>
      </div>
      <div className="voc-form">
        <div className="voc-row">
          <div className="voc-col">
            <label>FIRST NAME <span className="voc-req">*</span></label>
            {inputField('firstName', 'e.g. Ramesh', '👤')}
          </div>
          <div className="voc-col">
            <label>LAST NAME <span className="voc-req">*</span></label>
            {inputField('lastName', 'e.g. Kumar', '👤')}
          </div>
        </div>

        <div className="voc-row single">
          <label>EMAIL ADDRESS <span className="voc-req">*</span></label>
          <div className={`voc-input-wrap ${errors.email ? 'error' : ''}`}>
            <span className="voc-input-icon">✉️</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={data.email}
              onChange={e => onChange('email', e.target.value)}
              onBlur={e => onChange('email', e.target.value.trim())}
              autoComplete="off"
            />
          </div>
          {errors.email && <span className="voc-error">⚠ {errors.email}</span>}
        </div>

        <div className="voc-row">
          <div className="voc-col">
            <label>PHONE NUMBER <span className="voc-req">*</span></label>
            {inputField('phone', '9876543210', '📞', 'tel')}
          </div>
          <div className="voc-col">
            <label>STUDENT ID / LICENSE # <span className="voc-req">*</span></label>
            {inputField('studentId', 'e.g. SKL-123456', '🛡️')}
          </div>
        </div>

        <div className="voc-row single">
          <label>STREET ADDRESS <span className="voc-req">*</span></label>
          <div className={`voc-input-wrap ${errors.address ? 'error' : ''}`}>
            <span className="voc-input-icon">📍</span>
            <input
              type="text"
              placeholder="Door No, Street, Area"
              value={data.address}
              onChange={e => onChange('address', e.target.value)}
            />
          </div>
          {errors.address && <span className="voc-error">⚠ {errors.address}</span>}
        </div>

        <div className="voc-row three-col">
          <div className="voc-col">
            <label>STATE <span className="voc-req">*</span></label>
            <div className={`voc-input-wrap select-wrap ${errors.state ? 'error' : ''}`}>
              <select value={data.state} onChange={e => handleStateChange(e.target.value)}>
                <option value="">Select State</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {errors.state && <span className="voc-error">⚠ {errors.state}</span>}
          </div>
          <div className="voc-col">
            <label>CITY / DISTRICT <span className="voc-req">*</span></label>
            <div className={`voc-input-wrap select-wrap ${errors.city ? 'error' : ''}`}>
              <select
                value={data.city}
                onChange={e => onChange('city', e.target.value)}
                disabled={!data.state}
              >
                <option value="">{data.state ? 'Select City' : 'Select State first'}</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {errors.city && <span className="voc-error">⚠ {errors.city}</span>}
          </div>
          <div className="voc-col">
            <label>PINCODE <span className="voc-req">*</span></label>
            <div className={`voc-input-wrap ${errors.postcode ? 'error' : ''}`}>
              <input
                type="text"
                placeholder="600001"
                maxLength={6}
                value={data.postcode}
                onChange={e => onChange('postcode', e.target.value.replace(/\D/g, ''))}
              />
            </div>
            {errors.postcode && <span className="voc-error">⚠ {errors.postcode}</span>}
          </div>
        </div>

        <button className="voc-btn-primary full" onClick={handleSubmit}>
          SELECT COURSES ›
        </button>
      </div>
    </div>
  )
}

// ─── STEP 2 — Course Selection ────────────────────────────────
const Step2 = ({ selected, onAdd, onRemove, onDateChange, onNext, onBack, courses, schedules }) => {
  const [chosen, setChosen] = useState('')
  const [error, setError] = useState('')

  // BUG FIX: handleAdd does NOT navigate — it just adds the course to the list
  const handleAdd = () => {
    if (!chosen) { setError('Please select a course first'); return }
    if (selected.find(s => s.courseId === chosen)) { setError('This course is already added'); return }
    const course = courses.find(c => c._id === chosen)
    if (!course) return
    onAdd({ courseId: chosen, title: course.title, price: course.vocPrice || 150, date: '' })
    setChosen('')
    setError('')
  }

  const canContinue = selected.length > 0 && selected.every(s => s.date)

  return (
    <div className="voc-card">
      <div className="voc-card-header">
        <h2>Course Selection</h2>
        <p>Select the courses you wish to renew — <strong className="voc-price-highlight">₹150 per course</strong></p>
      </div>
      <div className="voc-form">
        <label>CHOOSE A COURSE <span className="voc-req">*</span></label>
        <div className="voc-row course-add-row">
          <div className="voc-input-wrap select-wrap flex-1">
            <select
              value={chosen}
              onChange={e => { setChosen(e.target.value); setError('') }}
            >
              <option value="">— Select a course to add —</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>
          <button className="voc-btn-add" type="button" onClick={handleAdd}>
            + Add Course
          </button>
        </div>
        {error && <span className="voc-error">⚠ {error}</span>}

        {selected.length === 0 ? (
          <div className="voc-empty-courses">
            <div className="voc-empty-icon">📅</div>
            <p>No courses selected yet</p>
            <span>Add courses from the dropdown above</span>
          </div>
        ) : (
          <div className="voc-course-list">
            {selected.map((s, i) => {
              const schCourseStr = (sch) => {
                const id = typeof sch.courseId === 'object' ? sch.courseId?._id : sch.courseId
                return String(id || '')
              }
              const courseSchedules = Array.isArray(schedules)
                ? schedules.filter(sch => schCourseStr(sch) === String(s.courseId))
                : []
              return (
                <div key={i} className="voc-course-item">
                  <div className="voc-course-item-top">
                    <span className="voc-check">✓</span>
                    <div className="voc-course-info">
                      <strong>{s.title}</strong>
                      <span className="voc-course-price">₹{s.price}.00</span>
                    </div>
                    <button className="voc-remove-btn" type="button" onClick={() => onRemove(i)}>🗑</button>
                  </div>
                  <div className="voc-date-row">
                    <label>SELECT COURSE DATE <span className="voc-req">*</span></label>
                    <div className={`voc-input-wrap select-wrap ${!s.date ? 'warn' : ''}`}>
                      <select value={s.date} onChange={e => onDateChange(i, e.target.value)}>
                        <option value="">Choose an available date...</option>
                        {courseSchedules.length === 0 && (
                          <option disabled>No scheduled dates available</option>
                        )}
                        {courseSchedules.map(sch => (
                          <option key={sch._id} value={sch._id}>
                            {new Date(sch.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                            {sch.startTime ? ` — ${sch.startTime}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    {!s.date && <span className="voc-warn">⚠ Please select a date to continue</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="voc-footer-bar">
          <div className="voc-total">
            <span>TOTAL ({selected.length} COURSE{selected.length !== 1 ? 'S' : ''})</span>
            <strong>₹{selected.reduce((sum, s) => sum + s.price, 0)}.00</strong>
          </div>
          <div className="voc-footer-actions">
            <button className="voc-btn-back" type="button" onClick={onBack}>‹ BACK</button>
            <button
              className="voc-btn-primary"
              type="button"
              onClick={onNext}
              disabled={!canContinue}
              title={!canContinue ? 'Add at least one course and select dates' : ''}
            >
              CONTINUE TO PAYMENT ›
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── STEP 3 — Payment ─────────────────────────────────────────
const Step3 = ({ selected, onBack, onSubmit, submitting }) => {
  const [method, setMethod] = useState('card')
  const [card, setCard] = useState({ name: '', number: '', month: '', expYear: '', cvv: '' })
  const [bankFile, setBankFile] = useState(null)
  const [errors, setErrors] = useState({})
  const total = selected.reduce((sum, s) => sum + s.price, 0)

  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
  const years = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i).slice(-2))

  const validate = () => {
    const e = {}
    if (method === 'card') {
      if (!card.name.trim()) {
        e.name = 'Name on card is required'
      } else if (card.name.trim().length < 3) {
        e.name = 'Minimum 3 characters'
      } else if (/\d/.test(card.name)) {
        e.name = 'Name should not contain numbers'
      }
      const rawNum = card.number.replace(/\s/g, '')
      if (!rawNum) {
        e.number = 'Card number is required'
      } else if (rawNum.length < 16) {
        e.number = 'Enter valid 16-digit card number'
      }
      if (!card.month) e.month = 'Required'
      if (!card.expYear) e.expYear = 'Required'
      if (!card.cvv.trim()) {
        e.cvv = 'CVV is required'
      } else if (card.cvv.length < 3) {
        e.cvv = 'CVV must be 3–4 digits'
      }
    } else {
      if (!bankFile) e.bankFile = 'Please upload proof of payment'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (validate()) onSubmit({ method, card, bankFile })
  }

  return (
    <div className="voc-card">
      <div className="voc-card-header">
        <h2>Secure Payment</h2>
        <p>Choose your preferred payment method</p>
      </div>
      <div className="voc-form">
        <div
          className={`voc-payment-option ${method === 'card' ? 'selected' : ''}`}
          onClick={() => setMethod('card')}
        >
          <span className="voc-pay-icon">💳</span>
          <div>
            <strong>Credit / Debit Card</strong>
            <p>Pay securely with card</p>
          </div>
          <div className={`voc-radio ${method === 'card' ? 'checked' : ''}`} />
        </div>

        <div
          className={`voc-payment-option ${method === 'bank' ? 'selected' : ''}`}
          onClick={() => setMethod('bank')}
        >
          <span className="voc-pay-icon">🏦</span>
          <div>
            <strong>Bank Transfer / UPI</strong>
            <p>Upload proof of payment</p>
          </div>
          <div className={`voc-radio ${method === 'bank' ? 'checked' : ''}`} />
        </div>

        {method === 'card' && (
          <div className="voc-card-details">
            <div className="voc-card-details-header">🔒 CARD DETAILS — Encrypted &amp; Secure</div>

            <label>NAME ON CARD <span className="voc-req">*</span></label>
            <div className={`voc-input-wrap ${errors.name ? 'error' : ''}`}>
              <input
                type="text"
                placeholder="FULL NAME AS ON CARD"
                value={card.name}
                onChange={e => setCard({ ...card, name: e.target.value })}
              />
            </div>
            {errors.name && <span className="voc-error">⚠ {errors.name}</span>}

            <label>CARD NUMBER <span className="voc-req">*</span></label>
            <div className={`voc-input-wrap ${errors.number ? 'error' : ''}`}>
              <input
                type="text"
                placeholder="4111 1111 1111 1111"
                maxLength={19}
                value={card.number}
                onChange={e => {
                  const v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()
                  setCard({ ...card, number: v })
                }}
              />
            </div>
            {errors.number && <span className="voc-error">⚠ {errors.number}</span>}

            <div className="voc-row three-col">
              <div className="voc-col">
                <label>MONTH <span className="voc-req">*</span></label>
                <div className={`voc-input-wrap select-wrap ${errors.month ? 'error' : ''}`}>
                  <select value={card.month} onChange={e => setCard({ ...card, month: e.target.value })}>
                    <option value="">MM</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                {errors.month && <span className="voc-error">⚠ {errors.month}</span>}
              </div>
              <div className="voc-col">
                <label>YEAR <span className="voc-req">*</span></label>
                <div className={`voc-input-wrap select-wrap ${errors.expYear ? 'error' : ''}`}>
                  <select value={card.expYear} onChange={e => setCard({ ...card, expYear: e.target.value })}>
                    <option value="">YY</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                {errors.expYear && <span className="voc-error">⚠ {errors.expYear}</span>}
              </div>
              <div className="voc-col">
                <label>CVV <span className="voc-req">*</span></label>
                <div className={`voc-input-wrap ${errors.cvv ? 'error' : ''}`}>
                  <input
                    type="password"
                    placeholder="•••"
                    maxLength={4}
                    value={card.cvv}
                    onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })}
                  />
                  <span className="voc-input-icon-right">🔒</span>
                </div>
                {errors.cvv && <span className="voc-error">⚠ {errors.cvv}</span>}
              </div>
            </div>

            <div className="voc-card-brands">
              <span>We accept:</span>
              <span className="voc-brand visa">VISA</span>
              <span className="voc-brand mc">MC</span>
              <span className="voc-brand rupay">RuPay</span>
            </div>
          </div>
        )}

        {method === 'bank' && (
          <div className="voc-card-details">
            <div className="voc-card-details-header">🏦 BANK TRANSFER / UPI DETAILS</div>
            <div className="voc-bank-info">
              <p><strong>Bank:</strong> State Bank of India</p>
              <p><strong>Account Name:</strong> Skill Scope Academy</p>
              <p><strong>Account No.:</strong> 123456789012</p>
              <p><strong>IFSC Code:</strong> SBIN0001234</p>
              <p><strong>UPI ID:</strong> skillscope@sbi</p>
              <p><strong>Reference:</strong> Your full name</p>
            </div>
            <label>UPLOAD PROOF OF PAYMENT <span className="voc-req">*</span></label>
            <div className={`voc-upload-area ${errors.bankFile ? 'error' : ''}`}>
              <input type="file" accept="image/*,.pdf" onChange={e => setBankFile(e.target.files[0])} />
              {bankFile ? <span>✓ {bankFile.name}</span> : <span>Click to upload receipt (JPG, PNG, PDF)</span>}
            </div>
            {errors.bankFile && <span className="voc-error">⚠ {errors.bankFile}</span>}
          </div>
        )}

        <div className="voc-footer-bar">
          <div className="voc-total">
            <div>
              <span>TOTAL PAYABLE</span>
              <span className={`voc-method-badge ${method === 'card' ? 'card' : 'bank'}`}>
                {method === 'card' ? 'CREDIT/DEBIT CARD' : 'BANK TRANSFER'}
              </span>
            </div>
            <strong className="voc-big-price">₹{total}.00</strong>
            <small>{selected.length} COURSE{selected.length !== 1 ? 'S' : ''} SELECTED</small>
          </div>
          <div className="voc-footer-actions">
            <button className="voc-btn-back" type="button" onClick={onBack}>‹ BACK</button>
            <button className="voc-btn-primary" type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'PROCESSING...' : 'COMPLETE REGISTRATION'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── STEP 4 — Done ────────────────────────────────────────────
const Step4 = ({ details, selected }) => {
  const navigate = useNavigate()
  return (
    <div className="voc-card voc-done">
      <div className="voc-done-icon">✅</div>
      <h2>Registration Complete!</h2>
      <p>Thank you <strong>{details.firstName} {details.lastName}</strong>. Your VOC renewal has been submitted successfully.</p>
      <p>A confirmation email will be sent to <strong>{details.email}</strong>.</p>
      <div className="voc-done-courses">
        {selected.map((s, i) => (
          <div key={i} className="voc-done-course">
            <span>✓ {s.title}</span>
            <span>₹{s.price}.00</span>
          </div>
        ))}
        <div className="voc-done-total">
          <span>Total Paid</span>
          <strong>₹{selected.reduce((sum, s) => sum + s.price, 0)}.00</strong>
        </div>
      </div>
      <button className="voc-btn-primary" onClick={() => navigate('/')}>BACK TO HOME</button>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function VocRenewal() {
  const [step, setStep] = useState(1)
  const [courses, setCourses] = useState([])
  const [schedules, setSchedules] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')

  const [details, setDetails] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    studentId: '', address: '', city: '', state: '', postcode: ''
  })
  const [selectedCourses, setSelectedCourses] = useState([])

  useEffect(() => {
    getCourses()
      .then(r => {
        const raw = r.data?.courses || r.data?.data || r.data || []
        setCourses(Array.isArray(raw) ? raw : [])
      })
      .catch(() => setLoadError('Failed to load courses. Please refresh.'))

    getAllSchedules()
      .then(r => {
        const raw = r.data?.schedules || r.data?.data || r.data || []
        setSchedules(Array.isArray(raw) ? raw : [])
      })
      .catch(() => setSchedules([]))
  }, [])

  const handleDetailsChange = (name, value) =>
    setDetails(prev => ({ ...prev, [name]: value }))

  const handleAddCourse = (course) =>
    setSelectedCourses(prev => [...prev, course])

  const handleRemoveCourse = (idx) =>
    setSelectedCourses(prev => prev.filter((_, i) => i !== idx))

  const handleDateChange = (idx, date) =>
    setSelectedCourses(prev => prev.map((s, i) => i === idx ? { ...s, date } : s))

  const handleSubmit = async (paymentData) => {
    setSubmitting(true)
    try {
      await API.post('/voc/register', {
        ...details,
        courses: selectedCourses,
        paymentMethod: paymentData.method,
        total: selectedCourses.reduce((sum, s) => sum + s.price, 0),
      })
      setStep(4)
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="voc-page">
        <StepIndicator current={step} />
        {loadError && (
          <div style={{ textAlign: 'center', color: 'red', padding: '1rem' }}>{loadError}</div>
        )}
        <div className="voc-content">
          {step === 1 && (
            <Step1
              data={details}
              onChange={handleDetailsChange}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step2
              selected={selectedCourses}
              courses={courses}
              schedules={schedules}
              onAdd={handleAddCourse}
              onRemove={handleRemoveCourse}
              onDateChange={handleDateChange}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <Step3
              selected={selectedCourses}
              onBack={() => setStep(2)}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}
          {step === 4 && (
            <Step4
              details={details}
              selected={selectedCourses}
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}