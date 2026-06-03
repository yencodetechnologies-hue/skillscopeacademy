import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/admin-panel.css'

import { getCategories, createCategory } from '../services/categoryServices'
import { getCourses, createCourse } from '../services/courseService'
import { getAllUsers, logoutUser } from '../services/authService'
import { getAllPayments } from '../services/paymentService'

// ─── Constants ──────────────────────────────────────────────
const PAGE_SIZE = 8

// ─── Pagination Component ────────────────────────────────────
const Pagination = ({ total, page, setPage }) => {
  const pages = Math.ceil(total / PAGE_SIZE)
  if (pages <= 1) return null
  return (
    <div className="pagination">
      <button
        className="pg-btn"
        disabled={page === 1}
        onClick={() => setPage(p => p - 1)}
      >
        ‹ Prev
      </button>

      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i + 1}
          className={`pg-btn ${page === i + 1 ? 'active' : ''}`}
          onClick={() => setPage(i + 1)}
        >
          {i + 1}
        </button>
      ))}

      <button
        className="pg-btn"
        disabled={page === pages}
        onClick={() => setPage(p => p + 1)}
      >
        Next ›
      </button>
    </div>
  )
}

// ─── Loading Skeleton ────────────────────────────────────────
const TableSkeleton = ({ cols, rows = 5 }) => (
  <tbody>
    {Array.from({ length: rows }, (_, i) => (
      <tr key={i}>
        {Array.from({ length: cols }, (_, j) => (
          <td key={j}><div className="skeleton-cell" /></td>
        ))}
      </tr>
    ))}
  </tbody>
)

// ─── Main Admin Component ────────────────────────────────────
const Admin = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('courses')

  // ── Course / Category state ──
  const [activeTab, setActiveTab] = useState('course')
  const [courseType, setCourseType] = useState('single')
  const [comboDescription, setComboDescription] = useState('')
  const [comboDuration, setComboDuration] = useState('')
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  const [categories, setCategories] = useState([])
  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(false)

  const [categoryName, setCategoryName] = useState('')
  const [categoryImage, setCategoryImage] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [instructor, setInstructor] = useState('')
  const [price, setPrice] = useState('')
  const [thumbnail, setThumbnail] = useState(null)
  const [comboEnabled, setComboEnabled] = useState(false)
  const [comboPrice, setComboPrice] = useState('')

  // ── Users state ──
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState(null)
  const [usersPage, setUsersPage] = useState(1)

  // ── Payments state ──
  const [payments, setPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paymentsError, setPaymentsError] = useState(null)
  const [paymentsPage, setPaymentsPage] = useState(1)

  // ─────────────────────────────────────────────────────────
  // Data loaders
  // ─────────────────────────────────────────────────────────

  const loadCategories = useCallback(async () => {
    try {
      const { data } = await getCategories()
      setCategories(data.categories || [])
    } catch (err) {
      console.error('loadCategories:', err)
    }
  }, [])

  const loadCourses = useCallback(async () => {
    setCoursesLoading(true)
    try {
      const { data } = await getCourses()
      setCourses(data.courses || [])
    } catch (err) {
      console.error('loadCourses:', err)
    } finally {
      setCoursesLoading(false)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    setUsersError(null)
    try {
      const { data } = await getAllUsers()
      // Backend returns { status, message, data: [...] }
      setUsers(data.data || data.users || [])
    } catch (err) {
      console.error('loadUsers:', err)
      setUsersError('Failed to load users. Please try again.')
    } finally {
      setUsersLoading(false)
    }
  }, [])

  const loadPayments = useCallback(async () => {
    setPaymentsLoading(true)
    setPaymentsError(null)
    try {
      const { data } = await getAllPayments()
      // Backend returns { status, data: [...] }
      setPayments(data.data || data.payments || [])
    } catch (err) {
      console.error('loadPayments:', err)
      setPaymentsError('Failed to load payments. Please try again.')
    } finally {
      setPaymentsLoading(false)
    }
  }, [])

  // Load courses & categories on mount
  useEffect(() => {
    loadCategories()
    loadCourses()
  }, [loadCategories, loadCourses])

  // Load section data on tab switch
  useEffect(() => {
    if (activeSection === 'users') loadUsers()
    if (activeSection === 'payments') loadPayments()
  }, [activeSection, loadUsers, loadPayments])

  // ─────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────

  const handleAddCategory = async () => {
    try {
      const formData = new FormData()
      formData.append('name', categoryName)
      if (categoryImage) formData.append('image', categoryImage)
      await createCategory(formData)
      setCategoryName('')
      setCategoryImage(null)
      setShowCategoryModal(false)
      loadCategories()
    } catch (err) {
      console.error('handleAddCategory:', err)
    }
  }

  const handleAddCourse = async () => {
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      if (courseType === 'single' && category) formData.append('category', category)
      formData.append('instructor', instructor)
      formData.append('price', price)
      formData.append('comboEnabled', comboEnabled)
      formData.append('comboPrice', comboPrice)
      formData.append('courseType', courseType)
      formData.append('comboDescription', comboDescription)
      formData.append('comboDuration', comboDuration)
      if (thumbnail) formData.append('thumbnail', thumbnail)
      await createCourse(formData)
      // Reset form
      setTitle(''); setDescription(''); setCategory(''); setInstructor('')
      setPrice(''); setThumbnail(null); setComboEnabled(false)
      setComboPrice(''); setComboDescription(''); setComboDuration('')
      setShowCourseModal(false)
      loadCourses()
    } catch (err) {
      console.error('handleAddCourse:', err)
    }
  }

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  // ─────────────────────────────────────────────────────────
  // Pagination slices
  // ─────────────────────────────────────────────────────────

  const pagedUsers    = users.slice((usersPage - 1) * PAGE_SIZE, usersPage * PAGE_SIZE)
  const pagedPayments = payments.slice((paymentsPage - 1) * PAGE_SIZE, paymentsPage * PAGE_SIZE)

  // ─────────────────────────────────────────────────────────
  // Nav config
  // ─────────────────────────────────────────────────────────

  const navItems = [
    { key: 'courses',  icon: '📖', label: 'Courses'  },
    { key: 'users',    icon: '👥', label: 'Users'    },
    { key: 'payments', icon: '💳', label: 'Payments' },
  ]

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────

  return (
    <div className="admin-layout">

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h2>Admin Portal</h2>
          <p>Safety Training Academy</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <div
              key={item.key}
              className={`nav-item ${activeSection === item.key ? 'active' : ''}`}
              onClick={() => setActiveSection(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* ══════════════ MAIN ══════════════ */}
      <div className="admin-main">

        {/* ── Topbar ── */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1>Admin Dashboard</h1>
            <Link to="/" className="topbar-home-btn">Go To Home Page</Link>
          </div>
          <div className="topbar-right">
            <span className="topbar-icon">🔔</span>
            <button className="logout-btn-top" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <div className="admin-content">

          {/* ══════════════ COURSES SECTION ══════════════ */}
          {activeSection === 'courses' && (
            <>
              {/* Stat Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-body">
                    <div className="stat-label">VOC Pending</div>
                    <div className="stat-value">6</div>
                    <div className="stat-sub">Pending verification</div>
                  </div>
                  <div className="stat-icon stat-icon--pending">⚠</div>
                </div>
                <div className="stat-card">
                  <div className="stat-body">
                    <div className="stat-label">VOC Verified</div>
                    <div className="stat-value">3</div>
                    <div className="stat-sub">Ready for next steps</div>
                  </div>
                  <div className="stat-icon stat-icon--verified">✓</div>
                </div>
                <div className="stat-card">
                  <div className="stat-body">
                    <div className="stat-label">Total VOC</div>
                    <div className="stat-value">9</div>
                    <div className="stat-sub">All time renewals</div>
                  </div>
                  <div className="stat-icon stat-icon--total">Σ</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-panel">
                <h3>Quick Actions</h3>
                <div className="qa-list">
                  <button className="qa-btn" onClick={() => navigate('/')}>
                    <span className="qa-left">🏠 Go to Landing Page</span><span>›</span>
                  </button>
                  <button className="qa-btn" onClick={() => setShowCategoryModal(true)}>
                    <span className="qa-left">📂 Add Category</span><span>›</span>
                  </button>
                  <button className="qa-btn" onClick={() => setShowCourseModal(true)}>
                    <span className="qa-left">＋ Add New Course</span><span>›</span>
                  </button>
                </div>
              </div>

              {/* Categories Table */}
              <section className="section-card">
                <div className="section-header">
                  <h2>Categories</h2>
                  <button className="add-btn" onClick={() => setShowCategoryModal(true)}>
                    + Add Category
                  </button>
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Image</th><th>Name</th></tr>
                    </thead>
                    <tbody>
                      {categories.length === 0
                        ? <tr><td colSpan="2" className="empty-row">No categories yet</td></tr>
                        : categories.map(cat => (
                          <tr key={cat._id}>
                            <td>
                              {cat.image
                                ? <img src={cat.image} alt={cat.name} width="44" height="44" className="table-thumb" />
                                : <div className="table-img-placeholder">📷</div>
                              }
                            </td>
                            <td>{cat.name}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Courses Table */}
              <section className="section-card">
                <div className="section-header">
                  <h2>Courses</h2>
                  <button className="add-btn" onClick={() => setShowCourseModal(true)}>
                    + Add Course
                  </button>
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Instructor</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    {coursesLoading
                      ? <TableSkeleton cols={5} />
                      : (
                        <tbody>
                          {courses.length === 0
                            ? <tr><td colSpan="5" className="empty-row">No courses yet</td></tr>
                            : courses.map(course => (
                              <tr key={course._id}>
                                <td>
                                  {course.thumbnail
                                    ? <img src={course.thumbnail} alt={course.title} width="44" height="44" className="table-thumb" />
                                    : <div className="table-img-placeholder">📖</div>
                                  }
                                </td>
                                <td>
                                  {course.title}
                                  {course.courseType === 'combo' && (
                                    <span className="badge-combo">Combo</span>
                                  )}
                                </td>
                                <td>{course.category?.name || course.name || '—'}</td>
                                <td>{course.instructor || '—'}</td>
                                <td>₹{course.price}</td>
                              </tr>
                            ))
                          }
                        </tbody>
                      )
                    }
                  </table>
                </div>
              </section>
            </>
          )}

          {/* ══════════════ USERS SECTION ══════════════ */}
          {activeSection === 'users' && (
            <section className="section-card">
              <div className="section-header">
                <h2>Users</h2>
                <div className="section-header-right">
                  {!usersLoading && (
                    <span className="section-count">{users.length} total</span>
                  )}
                  <button className="icon-btn" onClick={loadUsers} title="Refresh">↻</button>
                </div>
              </div>

              {usersError && (
                <div className="error-banner">
                  {usersError}
                  <button onClick={loadUsers}>Retry</button>
                </div>
              )}

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  {usersLoading
                    ? <TableSkeleton cols={5} />
                    : (
                      <tbody>
                        {pagedUsers.length === 0 && !usersError
                          ? <tr><td colSpan="5" className="empty-row">No users found</td></tr>
                          : pagedUsers.map((user, idx) => (
                            <tr key={user._id}>
                              <td className="td-muted">
                                {(usersPage - 1) * PAGE_SIZE + idx + 1}
                              </td>
                              <td>
                                <div className="user-cell">
                                  <div className="user-avatar">
                                    {(user.name || user.username || 'U')[0].toUpperCase()}
                                  </div>
                                  <strong>{user.name || user.username || '—'}</strong>
                                </div>
                              </td>
                              <td className="td-muted">{user.email || '—'}</td>
                              <td>
                                <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-student'}`}>
                                  {user.role || 'user'}
                                </span>
                              </td>
                              <td className="td-muted">
                                {user.createdAt
                                  ? new Date(user.createdAt).toLocaleDateString()
                                  : '—'
                                }
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    )
                  }
                </table>
              </div>

              <Pagination
                total={users.length}
                page={usersPage}
                setPage={setUsersPage}
              />
            </section>
          )}

          {/* ══════════════ PAYMENTS SECTION ══════════════ */}
          {activeSection === 'payments' && (
            <section className="section-card">
              <div className="section-header">
                <h2>Payments</h2>
                <div className="section-header-right">
                  {!paymentsLoading && (
                    <span className="section-count">{payments.length} total</span>
                  )}
                  <button className="icon-btn" onClick={loadPayments} title="Refresh">↻</button>
                </div>
              </div>

              {paymentsError && (
                <div className="error-banner">
                  {paymentsError}
                  <button onClick={loadPayments}>Retry</button>
                </div>
              )}

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Course</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  {paymentsLoading
                    ? <TableSkeleton cols={6} />
                    : (
                      <tbody>
                        {pagedPayments.length === 0 && !paymentsError
                          ? <tr><td colSpan="6" className="empty-row">No payments found</td></tr>
                          : pagedPayments.map((pay, idx) => (
                            <tr key={pay._id}>
                              <td className="td-muted">
                                {(paymentsPage - 1) * PAGE_SIZE + idx + 1}
                              </td>
                              <td>
                                <strong>
                                  {pay.user?.name || pay.userName || pay.user || '—'}
                                </strong>
                              </td>
                              <td className="td-muted">
                                {pay.course?.title || pay.courseName || pay.course || '—'}
                              </td>
                              <td>
                                <strong>
                                  ₹{pay.amount || pay.totalAmount || '0'}
                                </strong>
                              </td>
                              <td>
                                <span className={`status-badge status-${(pay.status || 'pending').toLowerCase()}`}>
                                  {pay.status || 'Pending'}
                                </span>
                              </td>
                              <td className="td-muted">
                                {pay.createdAt || pay.date
                                  ? new Date(pay.createdAt || pay.date).toLocaleDateString()
                                  : '—'
                                }
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    )
                  }
                </table>
              </div>

              <Pagination
                total={payments.length}
                page={paymentsPage}
                setPage={setPaymentsPage}
              />
            </section>
          )}

        </div>
      </div>

      {/* ══════════════ CATEGORY MODAL ══════════════ */}
      {showCategoryModal && (
        <div
          className="modal-backdrop"
          onClick={e => e.target === e.currentTarget && setShowCategoryModal(false)}
        >
          <div className="modal">
            <h2>Add Category</h2>
            <input
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
              placeholder="Category Name"
            />
            <input
              type="file"
              onChange={e => setCategoryImage(e.target.files[0])}
            />
            <div className="modal-btn-row">
              <button className="save-btn" onClick={handleAddCategory}>Save Category</button>
              <button className="close-btn-plain" onClick={() => setShowCategoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ COURSE MODAL ══════════════ */}
      {showCourseModal && (
        <div
          className="modal-backdrop"
          onClick={e => e.target === e.currentTarget && setShowCourseModal(false)}
        >
          <div className="course-modal">

            <div className="modal-top">
              <h2>Create New Course</h2>
              <button className="modal-close-btn" onClick={() => setShowCourseModal(false)}>✕</button>
            </div>

            <div className="course-tabs">
              <button
                className={activeTab === 'course' ? 'tab-btn active' : 'tab-btn'}
                onClick={() => {
                  setActiveTab('course')
                  setCourseType('single')
                  setComboEnabled(false)
                }}
              >
                Course Details
              </button>
              <button
                className={activeTab === 'combo' ? 'tab-btn active' : 'tab-btn'}
                onClick={() => {
                  setActiveTab('combo')
                  setCourseType('combo')
                  setComboEnabled(true)
                }}
              >
                Combo Package
              </button>
            </div>

            <div className="course-content">
              {activeTab === 'course' && (
                <div className="course-section">
                  <label>Course Title</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Course Title"
                  />
                  <label>Description</label>
                  <textarea
                    rows="3"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Course Description"
                  />
                  <label>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  <label>Instructor</label>
                  <input
                    value={instructor}
                    onChange={e => setInstructor(e.target.value)}
                    placeholder="Instructor Name"
                  />
                  <label>Course Price</label>
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="Price"
                  />
                  <label>Course Thumbnail</label>
                  <input
                    type="file"
                    onChange={e => setThumbnail(e.target.files[0])}
                  />
                  {thumbnail && (
                    <img
                      className="thumb-preview"
                      src={URL.createObjectURL(thumbnail)}
                      alt="preview"
                    />
                  )}
                </div>
              )}

              {activeTab === 'combo' && (
                <div className="course-section">
                  <label className="combo-check">
                    <input
                      type="checkbox"
                      checked={comboEnabled}
                      onChange={e => setComboEnabled(e.target.checked)}
                    />
                    Enable Combo Package Offer
                  </label>

                  {comboEnabled && (
                    <>
                      <label>Combo Description</label>
                      <input
                        value={comboDescription}
                        onChange={e => setComboDescription(e.target.value)}
                        placeholder="Describe combo package"
                      />
                      <label>Combo Price (₹)</label>
                      <input
                        type="number"
                        value={comboPrice}
                        onChange={e => setComboPrice(e.target.value)}
                        placeholder="78"
                      />
                      <label>Combo Duration</label>
                      <input
                        type="number"
                        value={comboDuration}
                        onChange={e => setComboDuration(e.target.value)}
                        placeholder="1"
                      />
                      <div className="combo-preview">
                        <h3>Combo Preview</h3>
                        <p><strong>Package:</strong> {comboDescription}</p>
                        <p><strong>Price:</strong> ₹{comboPrice}</p>
                        <p><strong>Duration:</strong> {comboDuration}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowCourseModal(false)}>Cancel</button>
              <button className="submit-btn" onClick={handleAddCourse}>Create Course</button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default Admin