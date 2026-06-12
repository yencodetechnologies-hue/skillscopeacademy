// import { useEffect, useState, useCallback } from 'react'
// import { getActivityLogs } from '../../services/adminService'

// const PAGE_SIZE = 15

// const Pagination = ({ total, page, setPage }) => {
//   const pages = Math.ceil(total / PAGE_SIZE)
//   if (pages <= 1) return null
//   return (
//     <div className="pagination">
//       <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
//       {Array.from({ length: pages }, (_, i) => (
//         <button key={i + 1} className={`pg-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
//       ))}
//       <button className="pg-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next ›</button>
//     </div>
//   )
// }

// const ACTION_COLORS = {
//   create:   '#E8F5E9',
//   update:   '#E3F2FD',
//   delete:   '#FFEBEE',
//   login:    '#FFF8E1',
//   logout:   '#F3E5F5',
// }
// const ACTION_TEXT = {
//   create: '#1B5E20',
//   update: '#0D47A1',
//   delete: '#B71C1C',
//   login:  '#E65100',
//   logout: '#6A1B9A',
// }

// const Activitylogs = () => {
//   const [logs, setLogs]       = useState([])
//   const [loading, setLoading] = useState(true)
//   const [page, setPage]       = useState(1)
//   const [search, setSearch]   = useState('')

//   const load = useCallback(async () => {
//     setLoading(true)
//     try {
//       const { data } = await getActivityLogs()
//       setLogs(data.data || data.logs || [])
//     } catch (e) { console.error(e); setLogs([]) }
//     finally { setLoading(false) }
//   }, [])

//   useEffect(() => { load() }, [load])

//   const filtered = logs.filter(l =>
//     !search ||
//     (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
//     (l.user?.name || l.userName || '').toLowerCase().includes(search.toLowerCase()) ||
//     (l.description || '').toLowerCase().includes(search.toLowerCase())
//   )
//   const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

//   const getActionType = (action = '') => {
//     const a = action.toLowerCase()
//     if (a.includes('creat') || a.includes('add'))    return 'create'
//     if (a.includes('updat') || a.includes('edit'))   return 'update'
//     if (a.includes('delet') || a.includes('remov'))  return 'delete'
//     if (a.includes('login'))                         return 'login'
//     if (a.includes('logout'))                        return 'logout'
//     return 'update'
//   }

//   return (
//     <div>
//       <div className="page-header">
//         <div>
//           <h2 className="page-title">Activity Logs</h2>
//           <p className="page-sub">Track all admin actions on the platform</p>
//         </div>
//         <div className="section-header-right">
//           {!loading && <span className="section-count">{logs.length} entries</span>}
//           <button className="icon-btn" onClick={load}>↻</button>
//         </div>
//       </div>

//       <div className="section-card">
//         <div style={{ padding: '14px 22px', borderBottom: '1px solid #eee' }}>
//           <input className="search-input" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search logs…" />
//         </div>
//         <div className="table-wrapper">
//           <table className="admin-table">
//             <thead>
//               <tr><th>#</th><th>User</th><th>Action</th><th>Description</th><th>IP Address</th><th>Date & Time</th></tr>
//             </thead>
//             {loading
//               ? <tbody>{Array.from({ length: 6 }, (_, i) => <tr key={i}>{[1,2,3,4,5,6].map(j => <td key={j}><div className="skeleton-cell" /></td>)}</tr>)}</tbody>
//               : <tbody>
//                   {paged.length === 0
//                     ? <tr><td colSpan="6" className="empty-row">No activity logs found</td></tr>
//                     : paged.map((log, idx) => {
//                       const t = getActionType(log.action)
//                       return (
//                         <tr key={log._id || idx}>
//                           <td className="td-muted">{(page - 1) * PAGE_SIZE + idx + 1}</td>
//                           <td>
//                             <div className="user-cell">
//                               <div className="user-avatar">{(log.user?.name || log.userName || 'S')[0].toUpperCase()}</div>
//                               <span>{log.user?.name || log.userName || 'System'}</span>
//                             </div>
//                           </td>
//                           <td>
//                             <span className="log-action-badge" style={{ background: ACTION_COLORS[t], color: ACTION_TEXT[t] }}>
//                               {log.action}
//                             </span>
//                           </td>
//                           <td className="td-muted" style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                             {log.description || '—'}
//                           </td>
//                           <td className="td-muted">{log.ip || '—'}</td>
//                           <td className="td-muted">
//                             {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
//                           </td>
//                         </tr>
//                       )
//                     })
//                   }
//                 </tbody>
//             }
//           </table>
//         </div>
//         <Pagination total={filtered.length} page={page} setPage={setPage} />
//       </div>
//     </div>
//   )
// }

// export default Activitylogs

import { useEffect, useState, useCallback } from 'react'
import { getActivityLogs } from '../../services/adminService'

const PAGE_SIZE = 15

/* ── Pagination bar ─────────────────────────────────────────── */
const Pagination = ({ total, page, pages, setPage }) => {
  if (pages <= 1) return null
  const nums = Array.from({ length: pages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 2)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
      acc.push(p)
      return acc
    }, [])

  return (
    <div className="pagination">
      <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
      {nums.map((n, i) =>
        n === '…'
          ? <span key={`e${i}`} className="pg-ellipsis">…</span>
          : <button key={n} className={`pg-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
      )}
      <button className="pg-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next ›</button>
    </div>
  )
}

/* ── Action badge colours ───────────────────────────────────── */
const ACTION_COLORS = {
  create:   { bg: '#E8F5E9', color: '#1B5E20' },
  update:   { bg: '#E3F2FD', color: '#0D47A1' },
  delete:   { bg: '#FFEBEE', color: '#B71C1C' },
  payment:  { bg: '#FFF3E0', color: '#E65100' },
  login:    { bg: '#FFF8E1', color: '#F57F17' },
  logout:   { bg: '#F3E5F5', color: '#6A1B9A' },
  register: { bg: '#E8EAF6', color: '#283593' },
  toggle:   { bg: '#E0F2F1', color: '#004D40' },
  reorder:  { bg: '#F9FBE7', color: '#558B2F' },
}

const getBadgeStyle = (action = '') => {
  const a = action.toLowerCase()
  if (a.includes('creat') || a.includes('add') || a.includes('bulk'))  return ACTION_COLORS.create
  if (a.includes('updat') || a.includes('edit'))                        return ACTION_COLORS.update
  if (a.includes('delet') || a.includes('remov'))                       return ACTION_COLORS.delete
  if (a.includes('payment'))                                            return ACTION_COLORS.payment
  if (a.includes('login'))                                              return ACTION_COLORS.login
  if (a.includes('logout'))                                             return ACTION_COLORS.logout
  if (a.includes('register'))                                           return ACTION_COLORS.register
  if (a.includes('toggl') || a.includes('activ') || a.includes('deactiv')) return ACTION_COLORS.toggle
  if (a.includes('reorder'))                                            return ACTION_COLORS.reorder
  return ACTION_COLORS.update
}

/* ── Entity filter options ──────────────────────────────────── */
const ENTITIES = ['', 'Course', 'Category', 'Schedule', 'Payment', 'User', 'Gallery', 'Banner']

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */
const Activitylogs = () => {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal]     = useState(0)
  const [pages, setPages]     = useState(1)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [entity, setEntity]   = useState('')

  const load = useCallback(async (pg = page, ent = entity, q = search) => {
    setLoading(true)
    try {
      const params = { page: pg, limit: PAGE_SIZE }
      if (ent)   params.entity = ent
      if (q)     params.action = q   // reuse action filter for search

      const { data } = await getActivityLogs(params)
      setLogs(data.logs  || data.data || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } catch (e) {
      console.error(e)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [page, entity, search])

  // Reload when page/entity changes
  useEffect(() => { load(page, entity, search) }, [page, entity]) // eslint-disable-line

  // Search with debounce
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1, entity, search) }, 400)
    return () => clearTimeout(t)
  }, [search]) // eslint-disable-line

  const handleEntityChange = (e) => { setEntity(e.target.value); setPage(1) }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Activity Logs</h2>
          <p className="page-sub">Full history of every action on the platform</p>
        </div>
        <div className="section-header-right">
          {!loading && <span className="section-count">{total.toLocaleString()} entries</span>}
          <button className="icon-btn" onClick={() => load(page, entity, search)}>↻</button>
        </div>
      </div>

      <div className="section-card">

        {/* ── Filters bar ──────────────────────────────────── */}
        <div style={{ padding: '14px 22px', borderBottom: '1px solid #eee', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="search-input"
            style={{ flex: '1 1 200px', minWidth: 160, maxWidth: 320 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by action…"
          />
          <select
            value={entity}
            onChange={handleEntityChange}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, color: '#333', cursor: 'pointer' }}
          >
            <option value="">All entities</option>
            {ENTITIES.filter(Boolean).map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>

          {(search || entity) && (
            <button
              className="pg-btn"
              onClick={() => { setSearch(''); setEntity(''); setPage(1) }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── Table ────────────────────────────────────────── */}
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Description</th>
                <th>IP</th>
                <th>Date &amp; Time</th>
              </tr>
            </thead>

            {loading ? (
              <tbody>
                {Array.from({ length: 8 }, (_, i) => (
                  <tr key={i}>
                    {[1,2,3,4,5,6,7].map(j => (
                      <td key={j}><div className="skeleton-cell" /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan="7" className="empty-row">No activity logs found</td></tr>
                ) : (
                  logs.map((log, idx) => {
                    const badge = getBadgeStyle(log.action)
                    const userName = log.performedBy?.name || log.performedBy?.email || log.userName || 'System'
                    const initial  = userName[0]?.toUpperCase() || 'S'

                    return (
                      <tr key={log._id || idx}>
                        <td className="td-muted">{(page - 1) * PAGE_SIZE + idx + 1}</td>

                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">{initial}</div>
                            <span>{userName}</span>
                          </div>
                        </td>

                        <td>
                          <span
                            className="log-action-badge"
                            style={{ background: badge.bg, color: badge.color }}
                          >
                            {log.action}
                          </span>
                        </td>

                        <td className="td-muted">
                          {log.entity
                            ? <span style={{ fontWeight: 600 }}>{log.entity}</span>
                            : '—'}
                        </td>

                        <td
                          className="td-muted"
                          style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          title={log.description}
                        >
                          {log.description || '—'}
                        </td>

                        <td className="td-muted">{log.ip || '—'}</td>

                        <td className="td-muted" style={{ whiteSpace: 'nowrap' }}>
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            )}
          </table>
        </div>

        {/* ── Pagination ───────────────────────────────────── */}
        <Pagination total={total} page={page} pages={pages} setPage={setPage} />
      </div>
    </div>
  )
}

export default Activitylogs