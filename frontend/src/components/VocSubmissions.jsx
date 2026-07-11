// import { useEffect, useMemo, useState } from "react"
// import "../styles/Student.css"
// import { API_URL } from "../data/service"

// const ITEMS_PER_PAGE = 10

// // ─── Helpers ────────────────────────────────────────────────────────────────
// const formatDate = (d) => {
//     if (!d) return "—"
//     const dt = new Date(d)
//     const dd = String(dt.getDate()).padStart(2, "0")
//     const mm = String(dt.getMonth() + 1).padStart(2, "0")
//     const yyyy = dt.getFullYear()
//     return `${dd}/${mm}/${yyyy}`
// }

// const formatDateTime = (d) => {
//     if (!d) return "—"
//     const dt = new Date(d)
//     return `${formatDate(d)} ${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`
// }

// const fmtCurrency = (n) => `$${Number(n || 0).toFixed(2)}`

// const paymentLabel = (m) => (m === "card" ? "Credit / Debit Card" : m === "bank" ? "Bank Transfer" : m || "—")

// // ─── Status Badge ───────────────────────────────────────────────────────────
// function StatusBadge({ status }) {
//     const map = {
//         Pending:  { cls: "badge-not-completed", icon: "⏱" },
//         Verified: { cls: "badge-completed",     icon: "✓" },
//         Rejected: { cls: "badge-not-completed", icon: "✕" },
//     }
//     const s = map[status] || map.Pending
//     return (
//         <span className={`status-badge ${s.cls}`}>
//             <span className="badge-icon">{s.icon}</span> {status}
//         </span>
//     )
// }

// // ─── View Modal ─────────────────────────────────────────────────────────────
// function ViewModal({ submission, onClose }) {
//     if (!submission) return null
//     const s = submission
//     return (
//         <div className="modal-overlay" onClick={onClose}>
//             <div className="modal-box" onClick={(e) => e.stopPropagation()}>
//                 <div className="modal-header">
//                     <div>
//                         <h2 className="modal-title">VOC Submission: {s.firstName} {s.lastName}</h2>
//                         <p className="modal-subtitle">Submission ID: {String(s._id).slice(0, 8)} · Submitted {formatDateTime(s.createdAt)}</p>
//                     </div>
//                     <button className="modal-close-btn" onClick={onClose}>✕</button>
//                 </div>

//                 <div className="modal-profile-card">
//                     <div className="modal-avatar"><span>{s.firstName?.charAt(0).toUpperCase()}</span></div>
//                     <div className="modal-profile-info">
//                         <h3 className="modal-name">{s.firstName} {s.lastName}</h3>
//                         <p className="modal-email-line">✉ {s.email}</p>
//                         <p className="modal-phone-line">📞 {s.phone}</p>
//                         <div className="modal-badges">
//                             <StatusBadge status={s.status} />
//                             <span className="status-badge badge-completed">{paymentLabel(s.paymentMethod)}</span>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="modal-section">
//                     <h4 className="modal-section-title">📋 Personal &amp; Contact</h4>
//                     <div className="modal-detail-row"><span>Student ID</span><span>{s.studentId || "—"}</span></div>
//                     <div className="modal-detail-row"><span>Address</span><span>{s.streetAddress}</span></div>
//                     <div className="modal-detail-row"><span>Suburb</span><span>{s.city}</span></div>
//                     <div className="modal-detail-row"><span>State</span><span>{s.state}</span></div>
//                     <div className="modal-detail-row"><span>Postcode</span><span>{s.postcode}</span></div>
//                 </div>

//                 <div className="modal-section">
//                     <h4 className="modal-section-title">📘 Courses ({s.courses?.length || 0})</h4>
//                     {(s.courses || []).map((c, i) => (
//                         <div className="modal-detail-row" key={i}>
//                             <span>{c.name}</span>
//                             <span>{c.date}</span>
//                         </div>
//                     ))}
//                     <div className="modal-detail-row" style={{ fontWeight: 600 }}>
//                         <span>Total</span><span>{fmtCurrency(s.amount)}</span>
//                     </div>
//                 </div>

//                 <div className="modal-section">
//                     <h4 className="modal-section-title">💲 Payment</h4>
//                     <div className="modal-detail-row"><span>Method</span><span>{paymentLabel(s.paymentMethod)}</span></div>
//                     {(s.gatewayTransactionId || s.ewayTransactionId) && (
//                         <div className="modal-detail-row">
//                             <span>Transaction ID</span>
//                             <span style={{ fontFamily: "monospace", fontSize: 13 }}>{s.gatewayTransactionId || s.ewayTransactionId}</span>
//                         </div>
//                     )}
//                     {s.paymentMethod === "card" && (
//                         <>
//                             <div className="modal-detail-row"><span>Cardholder</span><span>{s.card?.name || "—"}</span></div>
//                             <div className="modal-detail-row"><span>Card</span><span>•••• •••• •••• {s.card?.last4 || "----"}</span></div>
//                             <div className="modal-detail-row"><span>Expiry</span><span>{s.card?.expiryMonth || "--"}/{s.card?.expiryYear || "--"}</span></div>
//                         </>
//                     )}
//                     {s.paymentMethod === "bank" && (
//                         <>
//                             <div className="modal-detail-row"><span>Reference ID</span><span>{s.bank?.refId || "—"}</span></div>
//                             <div className="modal-detail-row">
//                                 <span>Receipt</span>
//                                 {s.bank?.proofUrl
//                                     ? <a href={s.bank.proofUrl} target="_blank" rel="noreferrer">View receipt</a>
//                                     : <span>—</span>}
//                             </div>
//                         </>
//                     )}
//                 </div>
//             </div>
//         </div>
//     )
// }

// // ─── Delete Confirm ─────────────────────────────────────────────────────────
// function DeleteModal({ submission, onClose, onConfirm, deleting }) {
//     if (!submission) return null
//     return (
//         <div className="modal-overlay" onClick={onClose}>
//             <div className="modal-box modal-delete-box" onClick={(e) => e.stopPropagation()}>
//                 <div className="modal-header">
//                     <div>
//                         <h2 className="modal-title">Delete VOC submission?</h2>
//                         <p className="modal-subtitle">
//                             This will permanently remove the submission from <strong>{submission.firstName} {submission.lastName}</strong>.
//                         </p>
//                     </div>
//                     <button className="modal-close-btn" onClick={onClose}>✕</button>
//                 </div>
//                 <div className="modal-actions">
//                     <button className="modal-cancel-btn" onClick={onClose} disabled={deleting}>Cancel</button>
//                     <button className="modal-delete-confirm-btn" onClick={() => onConfirm(submission._id)} disabled={deleting}>
//                         {deleting ? "Deleting..." : "Delete"}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     )
// }

// // ─── Main ───────────────────────────────────────────────────────────────────
// export default function VocSubmissions() {
//     const [items, setItems] = useState([])
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState(null)

//     const [search, setSearch] = useState("")
//     const [statusFilter, setStatusFilter] = useState("All Status")
//     const [currentPage, setCurrentPage] = useState(1)

//     const [viewItem,   setViewItem]   = useState(null)
//     const [deleteItem, setDeleteItem] = useState(null)
//     const [deleting,   setDeleting]   = useState(false)
//     const [acting,     setActing]     = useState(null) // id currently being verified/rejected

//     const fetchAll = async () => {
//         try {
//             setLoading(true)
//             const res = await fetch(`${API_URL}/api/voc`)
//             if (!res.ok) throw new Error("Failed to fetch VOC submissions.")
//             const data = await res.json()
//             setItems(data)
//         } catch (err) {
//             setError(err.message)
//         } finally {
//             setLoading(false)
//         }
//     }

//     useEffect(() => { fetchAll() }, [])

//     const filtered = useMemo(() => {
//         const q = search.trim().toLowerCase()
//         return items.filter((s) => {
//             const matchSearch = !q ||
//                 `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
//                 (s.email     || "").toLowerCase().includes(q) ||
//                 (s.studentId || "").toLowerCase().includes(q)
//             const matchStatus = statusFilter === "All Status" || s.status === statusFilter
//             return matchSearch && matchStatus
//         })
//     }, [items, search, statusFilter])

//     const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
//     const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

//     const counts = useMemo(() => ({
//         total:    items.length,
//         pending:  items.filter(i => i.status === "Pending").length,
//         verified: items.filter(i => i.status === "Verified").length,
//         rejected: items.filter(i => i.status === "Rejected").length,
//     }), [items])

//     const handleStatusChange = async (id, status) => {
//         try {
//             setActing(id)
//             const res = await fetch(`${API_URL}/api/voc/${id}/status`, {
//                 method: "PATCH",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ status }),
//             })
//             if (!res.ok) throw new Error("Failed to update status.")
//             const updated = await res.json()
//             setItems((prev) => prev.map((it) => (it._id === id ? { ...it, ...updated } : it)))
//         } catch (err) {
//             alert(err.message)
//         } finally {
//             setActing(null)
//         }
//     }

//     const handleDelete = async (id) => {
//         try {
//             setDeleting(true)
//             const res = await fetch(`${API_URL}/api/voc/${id}`, { method: "DELETE" })
//             if (!res.ok) throw new Error("Failed to delete submission.")
//             setItems((prev) => prev.filter((it) => it._id !== id))
//             setDeleteItem(null)
//         } catch (err) {
//             alert(err.message)
//         } finally {
//             setDeleting(false)
//         }
//     }

//     return (
//         <div className="sm-page">
//             {/* Header */}
//             <div className="sm-section-header">
//                 <div className="sm-page-header">
//                     <h1 className="sm-page-title">VOC Submissions</h1>
//                     <p className="sm-page-subtitle">Manage all VOC renewal applications</p>
//                 </div>
//             </div>

//             {/* Search & Filter */}
//             <div className="sm-card sm-search-card">
//                 <h3 className="sm-card-title">Search &amp; Filter</h3>
//                 <p className="sm-card-subtitle">Find submissions by name, email or student ID</p>
//                 <div className="sm-search-row">
//                     <div className="sm-search-input-wrap">
//                         <span className="sm-search-icon">🔍</span>
//                         <input
//                             className="sm-search-input"
//                             type="text"
//                             placeholder="Search by name, email, or student ID..."
//                             value={search}
//                             onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
//                         />
//                     </div>
//                     <select
//                         className="sm-status-select"
//                         value={statusFilter}
//                         onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
//                     >
//                         <option>All Status</option>
//                         <option>Pending</option>
//                         <option>Verified</option>
//                         <option>Rejected</option>
//                     </select>
//                     <button className="sm-search-btn" onClick={() => setCurrentPage(1)}>🔍 Search</button>
//                 </div>
//             </div>

//             {/* Table */}
//             <div className="sm-card sm-table-card">
//                 <div className="sm-table-header">
//                     <h3 className="sm-card-title">VOC Submissions ({filtered.length})</h3>
//                     <p className="sm-card-subtitle">
//                         {counts.pending} pending · {counts.verified} verified · {counts.rejected} rejected · {counts.total} total
//                     </p>
//                 </div>

//                 {loading && <p className="sm-loading">Loading VOC submissions...</p>}
//                 {error   && <p className="sm-error">Error: {error}</p>}

//                 {!loading && !error && (
//                     <div className="sm-table-scroll">
//                         <table className="sm-table">
//                             <thead>
//                                 <tr>
//                                     <th>Submitted</th>
//                                     <th>Name</th>
//                                     <th>Email</th>
//                                     <th>Phone</th>
//                                     <th>Student ID</th>
//                                     <th>Courses</th>
//                                     <th>Booking Date</th>
//                                     <th>Amount</th>
//                                     <th>Transaction ID</th>
//                                     <th>Payment</th>
//                                     <th>Status</th>
//                                     <th>Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {paginated.length === 0 ? (
//                                     <tr>
//                                         <td colSpan={12} style={{ textAlign: "center", padding: "2rem", color: colors.textIcon }}>
//                                             No VOC submissions found.
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     paginated.map((s) => (
//                                         <tr key={s._id}>
//                                             <td>
//                                                 <div className="sm-date">{formatDate(s.createdAt)}</div>
//                                             </td>
//                                             <td>
//                                                 <div className="sm-student-cell">
//                                                     <div className="sm-avatar"><span className="sm-avatar-icon">🛡️</span></div>
//                                                     <div>
//                                                         <div className="sm-student-name">{s.firstName} {s.lastName}</div>
//                                                     </div>
//                                                 </div>
//                                             </td>
//                                             <td className="sm-email">{s.email}</td>
//                                             <td>{s.phone}</td>
//                                             <td>{s.studentId || "—"}</td>
//                                             <td className="sm-course">
//                                                 <div style={{ fontWeight: 500 }}>
//                                                     {s.courses?.length || 0} course{(s.courses?.length || 0) !== 1 ? "s" : ""}
//                                                 </div>
//                                                 {s.courses?.[0]?.name && (
//                                                     <div style={{ fontSize: "0.75rem", color: colors.textIcon }}>{s.courses[0].name}</div>
//                                                 )}
//                                             </td>
//                                             <td>
//                                                 <div style={{ fontSize: "0.85rem", color: "#555" }}>
//                                                     {s.courses?.map(c => c.date).filter(Boolean).join(", ") || "—"}
//                                                 </div>
//                                             </td>
//                                             <td>{fmtCurrency(s.amount)}</td>
//                                             <td style={{ fontFamily: "monospace", fontSize: 11 }}>{s.gatewayTransactionId || s.ewayTransactionId || "—"}</td>
//                                             <td>{paymentLabel(s.paymentMethod)}</td>
//                                             <td><StatusBadge status={s.status} /></td>
//                                             <td>
//                                                 <div className="sm-actions">
//                                                     <button
//                                                         className="sm-icon-btn"
//                                                         title="View"
//                                                         onClick={() => setViewItem(s)}
//                                                     >👁</button>
//                                                     {s.status !== "Verified" && (
//                                                         <button
//                                                             className="sm-icon-btn"
//                                                             title="Verify"
//                                                             disabled={acting === s._id}
//                                                             onClick={() => handleStatusChange(s._id, "Verified")}
//                                                         >✓</button>
//                                                     )}
//                                                     {s.status !== "Rejected" && (
//                                                         <button
//                                                             className="sm-icon-btn"
//                                                             title="Reject"
//                                                             disabled={acting === s._id}
//                                                             onClick={() => handleStatusChange(s._id, "Rejected")}
//                                                         >✕</button>
//                                                     )}
//                                                     <button
//                                                         className="sm-icon-btn"
//                                                         title="Delete"
//                                                         onClick={() => setDeleteItem(s)}
//                                                     >🗑</button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}

//                 {/* Pagination */}
//                 {!loading && !error && filtered.length > 0 && (
//                     <div className="sm-pagination">
//                         <span className="sm-pagination-info">
//                             Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} results
//                         </span>
//                         <div className="sm-pagination-controls">
//                             <button
//                                 className="sm-page-btn"
//                                 disabled={currentPage === 1}
//                                 onClick={() => setCurrentPage((p) => p - 1)}
//                             >Previous</button>
//                             <span className="sm-page-indicator">Page {currentPage} of {totalPages}</span>
//                             <button
//                                 className="sm-page-btn"
//                                 disabled={currentPage === totalPages}
//                                 onClick={() => setCurrentPage((p) => p + 1)}
//                             >Next</button>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {viewItem   && <ViewModal   submission={viewItem}   onClose={() => setViewItem(null)} />}
//             {deleteItem && <DeleteModal submission={deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} deleting={deleting} />}
//         </div>
//     )
// }


import { useEffect, useMemo, useState } from "react"
import "../styles/Student.css"
import { API_URL } from "../data/service"
import { colors } from "../constants/theme"

const ITEMS_PER_PAGE = 10

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (d) => {
    if (!d) return "—"
    const dt = new Date(d)
    const dd = String(dt.getDate()).padStart(2, "0")
    const mm = String(dt.getMonth() + 1).padStart(2, "0")
    const yyyy = dt.getFullYear()
    return `${dd}/${mm}/${yyyy}`
}

const formatDateTime = (d) => {
    if (!d) return "—"
    const dt = new Date(d)
    return `${formatDate(d)} ${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`
}

const fmtCurrency = (n) => `$${Number(n || 0).toFixed(2)}`

const paymentLabel = (m) => (m === "card" ? "Credit / Debit Card" : m === "bank" ? "Bank Transfer" : m || "—")

// ─── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        Pending:  { cls: "badge-not-completed", icon: "⏱" },
        Verified: { cls: "badge-completed",     icon: "✓" },
        Rejected: { cls: "badge-not-completed", icon: "✕" },
    }
    const s = map[status] || map.Pending
    return (
        <span className={`status-badge ${s.cls}`}>
            <span className="badge-icon">{s.icon}</span> {status}
        </span>
    )
}

// ─── View Modal ─────────────────────────────────────────────────────────────
function ViewModal({ submission, onClose }) {
    if (!submission) return null
    const s = submission
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">VOC Submission: {s.firstName} {s.lastName}</h2>
                        <p className="modal-subtitle">Submission ID: {String(s._id).slice(0, 8)} · Submitted {formatDateTime(s.createdAt)}</p>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-profile-card">
                    <div className="modal-avatar"><span>{s.firstName?.charAt(0).toUpperCase()}</span></div>
                    <div className="modal-profile-info">
                        <h3 className="modal-name">{s.firstName} {s.lastName}</h3>
                        <p className="modal-email-line">✉ {s.email}</p>
                        <p className="modal-phone-line">📞 {s.phone}</p>
                        <div className="modal-badges">
                            <StatusBadge status={s.status} />
                            <span className="status-badge badge-completed">{paymentLabel(s.paymentMethod)}</span>
                        </div>
                    </div>
                </div>

                <div className="modal-section">
                    <h4 className="modal-section-title">📋 Personal &amp; Contact</h4>
                    <div className="modal-detail-row"><span>Student ID</span><span>{s.studentId || "—"}</span></div>
                    <div className="modal-detail-row"><span>Address</span><span>{s.streetAddress}</span></div>
                    <div className="modal-detail-row"><span>Suburb</span><span>{s.city}</span></div>
                    <div className="modal-detail-row"><span>State</span><span>{s.state}</span></div>
                    <div className="modal-detail-row"><span>Postcode</span><span>{s.postcode}</span></div>
                </div>

                <div className="modal-section">
                    <h4 className="modal-section-title">📘 Courses ({s.courses?.length || 0})</h4>
                    {(s.courses || []).map((c, i) => (
                        <div className="modal-detail-row" key={i}>
                            <span>{c.name}</span>
                            <span>{c.date}</span>
                        </div>
                    ))}
                    <div className="modal-detail-row" style={{ fontWeight: 600 }}>
                        <span>Total</span><span>{fmtCurrency(s.amount)}</span>
                    </div>
                </div>

                <div className="modal-section">
                    <h4 className="modal-section-title">💲 Payment</h4>
                    <div className="modal-detail-row"><span>Method</span><span>{paymentLabel(s.paymentMethod)}</span></div>
                    {(s.gatewayTransactionId || s.ewayTransactionId) && (
                        <div className="modal-detail-row">
                            <span>Transaction ID</span>
                            <span style={{ fontFamily: "monospace", fontSize: 13 }}>{s.gatewayTransactionId || s.ewayTransactionId}</span>
                        </div>
                    )}
                    {s.paymentMethod === "card" && (
                        <>
                            <div className="modal-detail-row"><span>Cardholder</span><span>{s.card?.name || "—"}</span></div>
                            <div className="modal-detail-row"><span>Card</span><span>•••• •••• •••• {s.card?.last4 || "----"}</span></div>
                            <div className="modal-detail-row"><span>Expiry</span><span>{s.card?.expiryMonth || "--"}/{s.card?.expiryYear || "--"}</span></div>
                        </>
                    )}
                    {s.paymentMethod === "bank" && (
                        <>
                            <div className="modal-detail-row"><span>Reference ID</span><span>{s.bank?.refId || "—"}</span></div>
                            <div className="modal-detail-row">
                                <span>Receipt</span>
                                {s.bank?.proofUrl
                                    ? <a href={s.bank.proofUrl} target="_blank" rel="noreferrer">View receipt</a>
                                    : <span>—</span>}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Delete Confirm ─────────────────────────────────────────────────────────
function DeleteModal({ submission, onClose, onConfirm, deleting }) {
    if (!submission) return null
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box modal-delete-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Delete VOC submission?</h2>
                        <p className="modal-subtitle">
                            This will permanently remove the submission from <strong>{submission.firstName} {submission.lastName}</strong>.
                        </p>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>
                <div className="modal-actions">
                    <button className="modal-cancel-btn" onClick={onClose} disabled={deleting}>Cancel</button>
                    <button className="modal-delete-confirm-btn" onClick={() => onConfirm(submission._id)} disabled={deleting}>
                        {deleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function VocSubmissions() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("All Status")
    const [currentPage, setCurrentPage] = useState(1)

    const [viewItem,   setViewItem]   = useState(null)
    const [deleteItem, setDeleteItem] = useState(null)
    const [deleting,   setDeleting]   = useState(false)
    const [acting,     setActing]     = useState(null) // id currently being verified/rejected

    const fetchAll = async () => {
        try {
            setLoading(true)
            const res = await fetch(`${API_URL}/api/voc`)
            if (!res.ok) throw new Error("Failed to fetch VOC submissions.")
            const data = await res.json()
            setItems(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAll() }, [])

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return items.filter((s) => {
            const matchSearch = !q ||
                `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
                (s.email     || "").toLowerCase().includes(q) ||
                (s.studentId || "").toLowerCase().includes(q)
            const matchStatus = statusFilter === "All Status" || s.status === statusFilter
            return matchSearch && matchStatus
        })
    }, [items, search, statusFilter])

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
    const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const counts = useMemo(() => ({
        total:    items.length,
        pending:  items.filter(i => i.status === "Pending").length,
        verified: items.filter(i => i.status === "Verified").length,
        rejected: items.filter(i => i.status === "Rejected").length,
    }), [items])

    const handleStatusChange = async (id, status) => {
        try {
            setActing(id)
            const res = await fetch(`${API_URL}/api/voc/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            })
            if (!res.ok) throw new Error("Failed to update status.")
            const updated = await res.json()
            setItems((prev) => prev.map((it) => (it._id === id ? { ...it, ...updated } : it)))
        } catch (err) {
            alert(err.message)
        } finally {
            setActing(null)
        }
    }

    const handleDelete = async (id) => {
        try {
            setDeleting(true)
            const res = await fetch(`${API_URL}/api/voc/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete submission.")
            setItems((prev) => prev.filter((it) => it._id !== id))
            setDeleteItem(null)
        } catch (err) {
            alert(err.message)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="sm-page">
            {/* Header */}
            <div className="sm-section-header">
                <div className="sm-page-header">
                    <h1 className="sm-page-title">VOC Submissions</h1>
                    <p className="sm-page-subtitle">Manage all VOC renewal applications</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="sm-card sm-search-card">
                <h3 className="sm-card-title">Search &amp; Filter</h3>
                <p className="sm-card-subtitle">Find submissions by name, email or student ID</p>
                <div className="sm-search-row">
                    <div className="sm-search-input-wrap">
                        <span className="sm-search-icon">🔍</span>
                        <input
                            className="sm-search-input"
                            type="text"
                            placeholder="Search by name, email, or student ID..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                        />
                    </div>
                    <select
                        className="sm-status-select"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                    >
                        <option>All Status</option>
                        <option>Pending</option>
                        <option>Verified</option>
                        <option>Rejected</option>
                    </select>
                    <button className="sm-search-btn" onClick={() => setCurrentPage(1)}>🔍 Search</button>
                </div>
            </div>

            {/* Table */}
            <div className="sm-card sm-table-card">
                <div className="sm-table-header">
                    <h3 className="sm-card-title">VOC Submissions ({filtered.length})</h3>
                    <p className="sm-card-subtitle">
                        {counts.pending} pending · {counts.verified} verified · {counts.rejected} rejected · {counts.total} total
                    </p>
                </div>

                {loading && <p className="sm-loading">Loading VOC submissions...</p>}
                {error   && <p className="sm-error">Error: {error}</p>}

                {!loading && !error && (
                    <div className="sm-table-scroll">
                        <table className="sm-table">
                            <thead>
                                <tr>
                                    <th>Submitted</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Student ID</th>
                                    <th>Courses</th>
                                    <th>Booking Date</th>
                                    <th>Amount</th>
                                    <th>Transaction ID</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} style={{ textAlign: "center", padding: "2rem", color: colors.textIcon }}>
                                            No VOC submissions found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((s) => (
                                        <tr key={s._id}>
                                            <td>
                                                <div className="sm-date">{formatDate(s.createdAt)}</div>
                                            </td>
                                            <td>
                                                <div className="sm-student-cell">
                                                    <div className="sm-avatar"><span className="sm-avatar-icon">🛡️</span></div>
                                                    <div>
                                                        <div className="sm-student-name">{s.firstName} {s.lastName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="sm-email">{s.email}</td>
                                            <td>{s.phone}</td>
                                            <td>{s.studentId || "—"}</td>
                                            <td className="sm-course">
                                                <div style={{ fontWeight: 500 }}>
                                                    {s.courses?.length || 0} course{(s.courses?.length || 0) !== 1 ? "s" : ""}
                                                </div>
                                                {s.courses?.[0]?.name && (
                                                    <div style={{ fontSize: "0.75rem", color: colors.textIcon }}>{s.courses[0].name}</div>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ fontSize: "0.85rem", color: "#555" }}>
                                                    {s.courses?.map(c => c.date).filter(Boolean).join(", ") || "—"}
                                                </div>
                                            </td>
                                            <td>{fmtCurrency(s.amount)}</td>
                                            <td style={{ fontFamily: "monospace", fontSize: 11 }}>{s.gatewayTransactionId || s.ewayTransactionId || "—"}</td>
                                            <td>{paymentLabel(s.paymentMethod)}</td>
                                            <td><StatusBadge status={s.status} /></td>
                                            <td>
                                                <div className="sm-actions">
                                                    <button
                                                        className="sm-icon-btn"
                                                        title="View"
                                                        onClick={() => setViewItem(s)}
                                                    >👁</button>
                                                    {s.status !== "Verified" && (
                                                        <button
                                                            className="sm-icon-btn"
                                                            title="Verify"
                                                            disabled={acting === s._id}
                                                            onClick={() => handleStatusChange(s._id, "Verified")}
                                                        >✓</button>
                                                    )}
                                                    {s.status !== "Rejected" && (
                                                        <button
                                                            className="sm-icon-btn"
                                                            title="Reject"
                                                            disabled={acting === s._id}
                                                            onClick={() => handleStatusChange(s._id, "Rejected")}
                                                        >✕</button>
                                                    )}
                                                    <button
                                                        className="sm-icon-btn"
                                                        title="Delete"
                                                        onClick={() => setDeleteItem(s)}
                                                    >🗑</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && filtered.length > 0 && (
                    <div className="sm-pagination">
                        <span className="sm-pagination-info">
                            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} results
                        </span>
                        <div className="sm-pagination-controls">
                            <button
                                className="sm-page-btn"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                            >Previous</button>
                            <span className="sm-page-indicator">Page {currentPage} of {totalPages}</span>
                            <button
                                className="sm-page-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                            >Next</button>
                        </div>
                    </div>
                )}
            </div>

            {viewItem   && <ViewModal   submission={viewItem}   onClose={() => setViewItem(null)} />}
            {deleteItem && <DeleteModal submission={deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} deleting={deleting} />}
        </div>
    )
}