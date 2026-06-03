import { useEffect, useState, useCallback } from 'react'
import { getAllPayments } from '../../services/adminService'

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

const AdminPayments = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const { data } = await getAllPayments()
      setPayments(data.data || data.payments || [])
    } catch { setError('Failed to load payments.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = payments.filter(p =>
    !search ||
    (p.user?.name || p.userName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.course?.title || p.courseName || '').toLowerCase().includes(search.toLowerCase())
  )
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalRevenue = payments.reduce((s, p) => s + Number(p.amount || 0), 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Payments</h2>
          <p className="page-sub">All payment transactions</p>
        </div>
        <div className="section-header-right">
          {!loading && <span className="section-count">₹{totalRevenue.toLocaleString()} total revenue</span>}
          <button className="icon-btn" onClick={load}>↻</button>
        </div>
      </div>

      <div className="section-card">
        <div style={{ padding: '14px 22px', borderBottom: '1px solid #eee' }}>
          <input className="search-input" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by user or course…" />
        </div>
        {error && <div className="error-banner">{error}<button onClick={load}>Retry</button></div>}
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>User</th><th>Course</th><th>Amount</th><th>Status</th><th>Date</th></tr>
            </thead>
            {loading
              ? <tbody>{Array.from({ length: 5 }, (_, i) => <tr key={i}>{[1,2,3,4,5,6].map(j => <td key={j}><div className="skeleton-cell" /></td>)}</tr>)}</tbody>
              : <tbody>
                  {paged.length === 0
                    ? <tr><td colSpan="6" className="empty-row">No payments found</td></tr>
                    : paged.map((pay, idx) => (
                      <tr key={pay._id}>
                        <td className="td-muted">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                        <td><strong>{pay.user?.name || pay.userName || pay.user || '—'}</strong></td>
                        <td className="td-muted">{pay.course?.title || pay.courseName || pay.course || '—'}</td>
                        <td><strong>₹{pay.amount || pay.totalAmount || '0'}</strong></td>
                        <td><span className={`status-badge status-${(pay.status || 'pending').toLowerCase()}`}>{pay.status || 'Pending'}</span></td>
                        <td className="td-muted">{pay.createdAt || pay.date ? new Date(pay.createdAt || pay.date).toLocaleDateString() : '—'}</td>
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

export default AdminPayments