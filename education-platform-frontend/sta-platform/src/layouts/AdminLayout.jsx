import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logoutUser } from '../services/authService'
import '../styles/admin-panel.css'

const navItems = [
  { key: 'dashboard',    path: '/admin',              icon: '⊞', label: 'Dashboard'    },
  { key: 'courses',      path: '/admin/courses',      icon: '📖', label: 'Courses'      },
  { key: 'users',        path: '/admin/users',        icon: '👥', label: 'Users'        },
  { key: 'payments',     path: '/admin/payments',     icon: '💳', label: 'Payments'     },
  { key: 'schedule',     path: '/admin/schedule',     icon: '📅', label: 'Schedule'     },
  { key: 'gallery',      path: '/admin/gallery',      icon: '🖼', label: 'Gallery'      },
  { key: 'banner',       path: '/admin/banner',       icon: '🎯', label: 'Banner'       },
  { key: 'activitylogs', path: '/admin/activity-logs',icon: '📋', label: 'Activity Logs'},
]

const AdminLayout = ({ children }) => {
  const location = useLocation()
  const navigate  = useNavigate()

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h2>Admin Portal</h2>
          <p>Safety Training Academy</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => {
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`nav-item${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* ── Main ── */}
      <div className="admin-main">
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
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout