import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { API_URL } from "../data/service"
import { authHeaders } from "../utils/authHeaders"
import "../styles/AdminActivityLogs.css"

const MODULE_OPTIONS = [
  { value: "", label: "All modules" },
  { value: "student", label: "Students" },
  { value: "company", label: "Companies" },
  { value: "company_payment", label: "Company payments" },
  { value: "payment", label: "Payments" },
  { value: "site_banner", label: "Site banner" },
  { value: "course", label: "Courses" },
  { value: "category", label: "Categories" },
  { value: "slider", label: "Sliders" },
  { value: "partner", label: "Partners" },
  { value: "gallery", label: "Gallery" },
  { value: "enrollment_form", label: "Enrollment forms" },
  { value: "enrollment_link", label: "Enrollment links" },
  { value: "schedule", label: "Schedule" },
  { value: "llnd", label: "LLND" },
  { value: "result", label: "Results" },
  { value: "voc", label: "VOC" },
  { value: "review", label: "Reviews" },
]

const ACTION_OPTIONS = [
  { value: "", label: "All actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "book", label: "Book" },
  { value: "complete", label: "Complete" },
  { value: "delete", label: "Delete" },
  { value: "toggle", label: "Toggle" },
  { value: "reorder", label: "Reorder" },
  { value: "confirm", label: "Confirm" },
  { value: "status_change", label: "Status change" },
]

function formatModule(module) {
  return String(module || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatAction(action) {
  return String(action || "").replace(/_/g, " ")
}

function formatPerformer(log) {
  const p = log.performedBy || {}
  const role = p.role ? String(p.role) : "Public"
  const isPublic = !role || role === "Public"

  if (p.name && p.email) {
    return `${p.name} — ${p.email} (${role})`
  }
  if (p.name) return `${p.name} (${role})`
  if (p.email) return `${p.email} (${role})`
  if (!isPublic) return role
  if (log.display?.isLegacyPublic) return "Public"
  if (log.clientIp) return `Guest (${log.clientIp})`
  return "Public"
}

function formatSubjectEmail(log) {
  const display = log.display || {}
  if (display.subjectEmail) {
    return display.subjectName
      ? `${display.subjectName} — ${display.subjectEmail}`
      : display.subjectEmail
  }

  const subject = log.subject || {}
  if (subject.email) {
    return subject.name ? `${subject.name} — ${subject.email}` : subject.email
  }
  const meta = log.metadata || {}
  if (meta.studentEmail) {
    return meta.studentName
      ? `${meta.studentName} — ${meta.studentEmail}`
      : meta.studentEmail
  }
  if (display.subjectName) return display.subjectName
  return "—"
}

function formatCompany(log) {
  const display = log.display || {}
  if (display.companyName) return display.companyName

  const subject = log.subject || {}
  if (subject.companyName) return subject.companyName
  const meta = log.metadata || {}
  return meta.companyName || "—"
}

function formatChangeDetail(change) {
  if (!change?.field) return ""
  const label =
    change.field === "availableSlots"
      ? "slots"
      : change.field === "startTime"
        ? "start"
        : change.field === "endTime"
          ? "end"
          : change.field
  return `${label}: ${change.from ?? "—"} → ${change.to ?? "—"}`
}

function formatMetadataDetails(log) {
  const parts = []
  const changes = log.metadata?.changes
  if (Array.isArray(changes) && changes.length > 0) {
    parts.push(changes.map(formatChangeDetail).join(" · "))
  }
  const subjectEmail = formatSubjectEmail(log)
  const company = formatCompany(log)
  if (subjectEmail !== "—" && !log.summary?.includes(subjectEmail.split(" — ").pop())) {
    parts.push(`Student: ${subjectEmail}`)
  }
  if (company !== "—" && !log.summary?.includes(company)) {
    parts.push(`Company: ${company}`)
  }
  return parts.length ? parts.join(" · ") : null
}

function formatDate(iso) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Australia/Sydney",
  })
}

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [module, setModule] = useState("")
  const [action, setAction] = useState("")
  const [search, setSearch] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const params = { page, limit: 25 }
      if (module) params.module = module
      if (action) params.action = action
      if (search.trim()) params.search = search.trim()
      if (from) params.from = from
      if (to) params.to = to

      const res = await axios.get(`${API_URL}/api/admin-logs`, {
        params,
        headers: authHeaders(),
      })

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to load logs")
      }

      setLogs(res.data.data.logs || [])
      setTotal(res.data.data.total || 0)
      setPages(res.data.data.pages || 1)
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        err.message ||
        "Failed to load activity logs"
      setError(msg)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [page, module, action, search, from, to])

  useEffect(() => {
    load()
  }, [load])

  const applyFilters = (e) => {
    e.preventDefault()
    if (page !== 1) {
      setPage(1)
    } else {
      load()
    }
  }

  return (
    <div className="activity-logs-page">
      <header className="activity-logs-header">
        <h1>Activity Logs</h1>
        <p>Track add, update, delete, and other changes across the site.</p>
      </header>

      <form className="activity-logs-filters" onSubmit={applyFilters}>
        <input
          type="search"
          placeholder="Search summary, name, email, IP, company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={module} onChange={(e) => setModule(e.target.value)}>
          {MODULE_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          {ACTION_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} title="From date" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} title="To date" />
        <button type="submit">Apply</button>
      </form>

      <div className="activity-logs-table-wrap">
        <div className="activity-logs-meta">
          {loading ? "Loading…" : `${total} log${total === 1 ? "" : "s"}`}
        </div>

        {error && <p className="activity-logs-error">{error}</p>}

        {!error && (
          <table className="activity-logs-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Module</th>
                <th>Summary</th>
                <th>Performed by</th>
                <th>Student</th>
                <th>Company</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={8} className="activity-logs-empty">
                    No activity logs yet. Changes will appear here as they happen.
                  </td>
                </tr>
              )}
              {logs.map((log) => {
                const changeDetail = formatMetadataDetails(log)
                return (
                  <tr key={log._id}>
                    <td className="col-date">{formatDate(log.createdAt)}</td>
                    <td>
                      <span className={`action-badge action-${log.action}`}>
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td>{formatModule(log.module)}</td>
                    <td className="col-summary">
                      <div>{log.summary}</div>
                      {changeDetail && (
                        <div className="activity-log-details">{changeDetail}</div>
                      )}
                    </td>
                    <td className="col-performer">{formatPerformer(log)}</td>
                    <td className="col-subject">{formatSubjectEmail(log)}</td>
                    <td className="col-company">{formatCompany(log)}</td>
                    <td className="col-ip">{log.clientIp || "—"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {pages > 1 && (
          <div className="activity-logs-pagination">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span>
              Page {page} of {pages}
            </span>
            <button
              type="button"
              disabled={page >= pages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
