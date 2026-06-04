// ─────────────────────────────────────────────
// AdminUsers.jsx
// ─────────────────────────────────────────────
import { useEffect, useState, useCallback } from 'react'
import { getAllUsers } from '../../services/adminService'

const PAGE_SIZE = 10

const Pagination = ({ total, page, setPage }) => {
  const pages = Math.ceil(total / PAGE_SIZE)
  if (pages <= 1) return null
  return (
    <div className="pagination">
      <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
      {Array.from({ length: pages }, (_, i) => (
        <button key={i + 1} className={`pg-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
      ))}
      <button className="pg-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next ›</button>
    </div>
  )
}

export const AdminUsers = () => {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const { data } = await getAllUsers()
      setUsers(data.data || data.users || [])
    } catch { setError('Failed to load users.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = users.filter(u =>
    !search ||
    (u.name || u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  )
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Users</h2>
          <p className="page-sub">All registered users on the platform</p>
        </div>
        <div className="section-header-right">
          {!loading && <span className="section-count">{users.length} total</span>}
          <button className="icon-btn" onClick={load} title="Refresh">↻</button>
        </div>
      </div>

      <div className="section-card">
        <div style={{ padding: '14px 22px', borderBottom: '1px solid #eee' }}>
          <input className="search-input" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by name or email…" />
        </div>
        {error && <div className="error-banner">{error}<button onClick={load}>Retry</button></div>}
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
            </thead>
            {loading
              ? <tbody>{Array.from({ length: 5 }, (_, i) => <tr key={i}>{[1,2,3,4,5].map(j => <td key={j}><div className="skeleton-cell" /></td>)}</tr>)}</tbody>
              : <tbody>
                  {paged.length === 0
                    ? <tr><td colSpan="5" className="empty-row">No users found</td></tr>
                    : paged.map((u, idx) => (
                      <tr key={u._id}>
                        <td className="td-muted">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                        <td><div className="user-cell"><div className="user-avatar">{(u.name || u.username || 'U')[0].toUpperCase()}</div><strong>{u.name || u.username || '—'}</strong></div></td>
                        <td className="td-muted">{u.email || '—'}</td>
                        <td><span className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-student'}`}>{u.role || 'user'}</span></td>
                        <td className="td-muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))
                  }
                </tbody>
            }
          </table>
        </div>
        <Pagination total={filtered.length} page={page} setPage={setPage} />
      </div>
    </div>
  )
}

export default AdminUsers