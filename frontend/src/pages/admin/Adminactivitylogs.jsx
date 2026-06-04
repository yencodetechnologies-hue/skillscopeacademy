import { useEffect, useState, useCallback } from 'react'
import { getActivityLogs } from '../../services/adminService'

const PAGE_SIZE = 15

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

const ACTION_COLORS = {
  create:   '#E8F5E9',
  update:   '#E3F2FD',
  delete:   '#FFEBEE',
  login:    '#FFF8E1',
  logout:   '#F3E5F5',
}
const ACTION_TEXT = {
  create: '#1B5E20',
  update: '#0D47A1',
  delete: '#B71C1C',
  login:  '#E65100',
  logout: '#6A1B9A',
}

const AdminActivitylogs = () => {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getActivityLogs()
      setLogs(data.data || data.logs || [])
    } catch (e) { console.error(e); setLogs([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = logs.filter(l =>
    !search ||
    (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.user?.name || l.userName || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.description || '').toLowerCase().includes(search.toLowerCase())
  )
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const getActionType = (action = '') => {
    const a = action.toLowerCase()
    if (a.includes('creat') || a.includes('add'))    return 'create'
    if (a.includes('updat') || a.includes('edit'))   return 'update'
    if (a.includes('delet') || a.includes('remov'))  return 'delete'
    if (a.includes('login'))                         return 'login'
    if (a.includes('logout'))                        return 'logout'
    return 'update'
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Activity Logs</h2>
          <p className="page-sub">Track all admin actions on the platform</p>
        </div>
        <div className="section-header-right">
          {!loading && <span className="section-count">{logs.length} entries</span>}
          <button className="icon-btn" onClick={load}>↻</button>
        </div>
      </div>

      <div className="section-card">
        <div style={{ padding: '14px 22px', borderBottom: '1px solid #eee' }}>
          <input className="search-input" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search logs…" />
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>User</th><th>Action</th><th>Description</th><th>IP Address</th><th>Date & Time</th></tr>
            </thead>
            {loading
              ? <tbody>{Array.from({ length: 6 }, (_, i) => <tr key={i}>{[1,2,3,4,5,6].map(j => <td key={j}><div className="skeleton-cell" /></td>)}</tr>)}</tbody>
              : <tbody>
                  {paged.length === 0
                    ? <tr><td colSpan="6" className="empty-row">No activity logs found</td></tr>
                    : paged.map((log, idx) => {
                      const t = getActionType(log.action)
                      return (
                        <tr key={log._id || idx}>
                          <td className="td-muted">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar">{(log.user?.name || log.userName || 'S')[0].toUpperCase()}</div>
                              <span>{log.user?.name || log.userName || 'System'}</span>
                            </div>
                          </td>
                          <td>
                            <span className="log-action-badge" style={{ background: ACTION_COLORS[t], color: ACTION_TEXT[t] }}>
                              {log.action}
                            </span>
                          </td>
                          <td className="td-muted" style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.description || '—'}
                          </td>
                          <td className="td-muted">{log.ip || '—'}</td>
                          <td className="td-muted">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                          </td>
                        </tr>
                      )
                    })
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

export default AdminActivitylogs