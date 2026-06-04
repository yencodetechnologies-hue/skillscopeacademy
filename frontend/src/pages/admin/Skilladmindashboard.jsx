import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCourses } from '../../services/adminService'
import { getAllUsers } from '../../services/adminService'
import { getAllPayments } from '../../services/adminService'

const Skilladmindashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ courses: 0, users: 0, payments: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, uRes, pRes] = await Promise.allSettled([
          getCourses(), getAllUsers(), getAllPayments()
        ])
        const courses  = cRes.status  === 'fulfilled' ? (cRes.value.data.courses   || []) : []
        const users    = uRes.status  === 'fulfilled' ? (uRes.value.data.data       || []) : []
        const payments = pRes.status  === 'fulfilled' ? (pRes.value.data.data       || []) : []
        const revenue  = payments.reduce((s, p) => s + Number(p.amount || 0), 0)
        setStats({ courses: courses.length, users: users.length, payments: payments.length, revenue })
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const cards = [
    { label: 'Total Courses',  value: stats.courses,              icon: '📖', color: '#EFF6FF', iconColor: '#1D4ED8', nav: '/admin/courses'  },
    { label: 'Total Users',    value: stats.users,                icon: '👥', color: '#F0FDF4', iconColor: '#15803D', nav: '/admin/users'    },
    { label: 'Total Payments', value: stats.payments,             icon: '💳', color: '#FFF7ED', iconColor: '#C2410C', nav: '/admin/payments' },
    { label: 'Total Revenue',  value: `₹${stats.revenue.toLocaleString()}`, icon: '💰', color: '#FDF4FF', iconColor: '#7E22CE', nav: '/admin/payments' },
    { label: 'VOC Pending',    value: 6,                          icon: '⚠',  color: '#FFFBEB', iconColor: '#B45309', nav: '/admin/schedule' },
    { label: 'VOC Verified',   value: 3,                          icon: '✓',  color: '#F0FDF4', iconColor: '#15803D', nav: '/admin/schedule' },
  ]

  const quickActions = [
    { label: '+ Create New Course',   nav: '/admin/courses',       icon: '📖' },
    { label: '+ Add Schedule',         nav: '/admin/schedule',      icon: '📅' },
    { label: '+ Upload Gallery Image', nav: '/admin/gallery',       icon: '🖼' },
    { label: '+ Manage Banners',       nav: '/admin/banner',        icon: '🎯' },
    { label: '→ View Activity Logs',   nav: '/admin/activitylogs', icon: '📋' },
    { label: '🏠 Go to Landing Page',  nav: '/',                    icon: ''   },
    { label: '🏠 cms',  nav: '/cms',                    icon: ''   },

  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-sub">Welcome back — here's what's happening</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid stats-grid--6">
        {cards.map((c, i) => (
          <div
            key={i}
            className="stat-card stat-card--clickable"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(c.nav)}
          >
            <div className="stat-body">
              <div className="stat-label">{c.label}</div>
              <div className="stat-value">
                {loading ? <span className="skeleton-val" /> : c.value}
              </div>
            </div>
            <div className="stat-icon" style={{ background: c.color, color: c.iconColor }}>
              {c.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-panel" style={{ marginTop: 24 }}>
        <h3>Quick Actions</h3>
        <div className="qa-list">
          {quickActions.map((a, i) => (
            <button key={i} className="qa-btn" onClick={() => navigate(a.nav)}>
              <span className="qa-left">{a.label}</span>
              <span>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Skilladmindashboard