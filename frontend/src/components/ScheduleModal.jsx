import "../styles/ScheduleModal.css"
import { useFormik } from "formik"
import axios from "axios"
import { useState, useEffect } from "react"
import { API_URL } from "../data/service"

function authHeaders() {
  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function jsonAuthHeaders() {
  return { ...authHeaders(), "Content-Type": "application/json" }
}


// ─── helpers ───────────────────────────────────────────────────────
const toYMD = (d) => new Date(d).toISOString().split("T")[0]
const todayYMD = toYMD(new Date())

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Generate all dates in [start, end] that fall on selectedDays
const generateDates = (start, end, selectedDays) => {
  if (!start || !end || selectedDays.length === 0) return []
  const result = []
  const cur = new Date(start)
  const last = new Date(end)
  while (cur <= last) {
    if (selectedDays.includes(cur.getDay())) {
      result.push(toYMD(cur))
    }
    cur.setDate(cur.getDate() + 1)
  }
  return result
}

// ─── EditSessionModal ───────────────────────────────────────────────
function EditSessionModal({ session, scheduleDate, onClose, onSaved }) {
  const [startTime, setStartTime] = useState(session.startTime || "")
  const [endTime, setEndTime] = useState(session.endTime || "")
  const [availableSlots, setAvailableSlots] = useState(session.availableSlots || 0)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.patch(
        `${API_URL}/api/schedules/session/${session._id}/edit`,
        {
          startTime,
          endTime,
          availableSlots: Number(availableSlots),
        },
        { headers: jsonAuthHeaders() }
      )
      onSaved()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="csm-edit-overlay">
      <div className="csm-edit-modal">
        <div className="csm-edit-header">
          <div>
            <h3>Edit Session</h3>
            <p>Update the start/end time and capacity for this scheduled session.</p>
          </div>
          <button className="csm-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="csm-edit-field">
          <label>Date</label>
          <p className="csm-edit-date-val">{formatDate(scheduleDate)}</p>
        </div>

        <div className="csm-grid-2">
          <div className="csm-field">
            <label>Start Time</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="csm-field">
            <label>End Time</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>

        <div className="csm-field">
          <label>Active Slots</label>
          <input
            type="number"
            value={availableSlots}
            onChange={(e) => setAvailableSlots(e.target.value)}
          />
        </div>

        <div className="csm-edit-footer">
          <button className="csm-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="csm-save-changes-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Modal ─────────────────────────────────────────────────────
function CourseScheduleModal({ course, close }) {
  const [schedules, setSchedules] = useState([])           // from backend
  const [localSessions, setLocalSessions] = useState([])   // unsaved [{date, session}]
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedDays, setSelectedDays] = useState([])
  const [editTarget, setEditTarget] = useState(null)       // {session, scheduleDate}
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [filterType, setFilterType] = useState("All")

  // ── fetch ──────────────────────────────────────────────────────
  const fetchSchedules = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/schedules/course/${course._id}?includeInactive=true`
      )
      setSchedules(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (course?._id) fetchSchedules()
  }, [course])

  // ── delete / toggle ────────────────────────────────────────────
  const deleteSession = async (id) => {
    if (!window.confirm("Delete this session?")) return
    try {
      await axios.delete(`${API_URL}/api/schedules/session/${id}`, {
        headers: authHeaders(),
      })
      fetchSchedules()
    } catch (err) { console.error(err) }
  }

  const toggleSession = async (id) => {
    if (togglingId) return
    setTogglingId(id)

    // Optimistic update: toggle status only (hide/show), never remove from list
    setSchedules((prev) =>
      prev.map((schedule) => ({
        ...schedule,
        sessions: (schedule.sessions || []).map((s) =>
          s._id === id
            ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" }
            : s
        ),
      }))
    )

    try {
      await axios.patch(`${API_URL}/api/schedules/session/${id}`, null, {
        headers: authHeaders(),
      })
      await fetchSchedules()
    } catch (err) {
      console.error(err)
      await fetchSchedules()
      alert("Could not update session status. Please try again.")
    } finally {
      setTogglingId(null)
    }
  }

  const deleteLocalSession = (index) => {
    setLocalSessions((prev) => prev.filter((_, i) => i !== index))
  }

  // ── formik (single date) ───────────────────────────────────────
  const formik = useFormik({
    initialValues: {
      date: "",
      sessionType: "General",
      startTime: "",
      endTime: "",
      location: "",
      availableSlots: "",
    },
    onSubmit: (values) => {
      if (!values.date) return
      const session = {
        sessionType: values.sessionType,
        startTime: values.startTime,
        endTime: values.endTime,
        location: values.location,
        availableSlots: values.availableSlots,
      }
      setLocalSessions((prev) => [...prev, { date: values.date, session }])
      formik.resetForm()
    },
  })

  // ── formik (bulk) ──────────────────────────────────────────────
  const bulkFormik = useFormik({
    initialValues: {
      startDate: "",
      endDate: "",
      sessionType: "General",
      startTime: "",
      endTime: "",
      location: "Face to Face",
      availableSlots: "",
    },
    onSubmit: (values) => {
      const dates = generateDates(values.startDate, values.endDate, selectedDays)
      const newSessions = dates.map((date) => ({
        date,
        session: {
          sessionType: values.sessionType,
          startTime: values.startTime,
          endTime: values.endTime,
          location: values.location,
          availableSlots: values.availableSlots,
        },
      }))
      // avoid duplicates with already-local sessions
      setLocalSessions((prev) => {
        const merged = [...prev]
        newSessions.forEach((ns) => {
          const exists = merged.some(
            (m) => m.date === ns.date &&
              m.session.startTime === ns.session.startTime &&
              m.session.endTime === ns.session.endTime
          )
          if (!exists) merged.push(ns)
        })
        return merged
      })
    },
  })

  // Dates in bulk range (for blur logic)
  const bulkRangeDates = generateDates(
    bulkFormik.values.startDate,
    bulkFormik.values.endDate,
    selectedDays
  )

  // ── Save New Dates → backend ───────────────────────────────────
  const saveNewDates = async () => {
    if (localSessions.length === 0) return
    setSaving(true)
    try {
      await Promise.all(
        localSessions.map(({ date, session }) =>
          axios.post(
            `${API_URL}/api/schedules/session`,
            {
              course: course._id,
              date,
              session: { ...session },
            },
            { headers: jsonAuthHeaders() }
          )
        )
      )
      setLocalSessions([])
      fetchSchedules()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const unsavedCount = localSessions.length

  // ── Filter tabs ────────────────────────────────────────────────
  const sessionTypes = ["All", "General", "Theory", "Practical", "Exam"]

  const sessionMatchesFilter = (session) =>
    filterType === "All" || session.sessionType === filterType

  const allDates = Array.from(
    new Set([
      ...schedules
        .filter((s) => (s.sessions || []).some(sessionMatchesFilter))
        .map((s) => toYMD(s.date)),
      ...localSessions
        .filter((l) => sessionMatchesFilter(l.session))
        .map((l) => l.date),
    ])
  ).sort()

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="csm-overlay">

      {/* Edit sub-modal */}
      {editTarget && (
        <EditSessionModal
          session={editTarget.session}
          scheduleDate={editTarget.scheduleDate}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); fetchSchedules() }}
        />
      )}

      <div className="csm-container">

        {/* HEADER */}
        <div className="csm-header">
          <div className="csm-header-icon"></div>
          <div className="csm-header-text">
            <h2 className="csm-title">Manage Course Dates</h2>
            <p className="csm-subtitle">{course?.title}</p>
          </div>
          <button type="button" className="csm-close-btn" onClick={close}>✕</button>
        </div>

        {/* ADD FORM */}
        <div className="csm-form-card">
          <div className="csm-add-header">
            <span className="csm-add-title">+ Add New Date</span>
            <label className="csm-bulk-toggle">
              <input
                type="checkbox"
                checked={bulkMode}
                onChange={(e) => { setBulkMode(e.target.checked); setSelectedDays([]) }}
              />
              <span className="csm-bulk-check"></span>
              Bulk Upload
            </label>
          </div>

          {/* ── SINGLE MODE ── */}
          {!bulkMode && (
            <form onSubmit={formik.handleSubmit}>
              <div className="csm-grid">
                <div className="csm-field">
                  <label>Date *</label>
                  <input type="date" name="date"
                    min={todayYMD}
                    value={formik.values.date}
                    onChange={formik.handleChange}
                  />
                </div>

                <div className="csm-field">
                  <label>Session Type</label>
                  <select name="sessionType" value={formik.values.sessionType} onChange={formik.handleChange}>
                    <option>General</option>
                    <option>Theory</option>
                    <option>Practical</option>
                    <option>Exam</option>
                  </select>
                </div>

                <div className="csm-field">
                  <label>Start Time</label>
                  <input type="time" name="startTime" value={formik.values.startTime} onChange={formik.handleChange} />
                </div>

                <div className="csm-field">
                  <label>End Time</label>
                  <input type="time" name="endTime"
                    min={formik.values.startTime || undefined}
                    value={formik.values.endTime}
                    onChange={formik.handleChange}
                  />
                </div>

                <div className="csm-field">
                  <label>Location (Optional)</label>
                  <select name="location" value={formik.values.location} onChange={formik.handleChange}>
                    <option value="">Select</option>
                    <option>Online</option>
                    <option>Face to Face</option>
                  </select>
                </div>

                <div className="csm-field">
                  <label>Active Slots *</label>
                  <input type="number" name="availableSlots" placeholder="e.g., 20"
                    value={formik.values.availableSlots}
                    onChange={formik.handleChange}
                  />
                </div>

                <div className="csm-field csm-field-full">
                  <label>🎓 Assign Teacher (Optional)</label>
                  <input type="text" placeholder="Search teachers by name or email…" />
                  <span className="csm-hint">Search and select a teacher to conduct this session</span>
                </div>
              </div>
              <button type="submit" className="csm-add-date-btn">+ Add Date</button>
            </form>
          )}

          {/* ── BULK MODE ── */}
          {bulkMode && (
            <form onSubmit={bulkFormik.handleSubmit}>
              <div className="csm-grid">
                <div className="csm-field">
                  <label>Start Date *</label>
                  <input type="date" name="startDate" min={todayYMD}
                    value={bulkFormik.values.startDate}
                    onChange={bulkFormik.handleChange}
                  />
                </div>

                <div className="csm-field">
                  <label>End Date *</label>
                  <input type="date" name="endDate"
                    min={bulkFormik.values.startDate || todayYMD}
                    value={bulkFormik.values.endDate}
                    onChange={bulkFormik.handleChange}
                  />
                </div>
              </div>

              {/* Day selector */}
              <div className="csm-day-picker-wrap">
                <label>Select Days of the Week *</label>
                <div className="csm-day-picker">
                  {DAYS.map((day, idx) => {
                    // blur logic: if range selected, only days that produce dates are active
                    const rangeActive = bulkFormik.values.startDate && bulkFormik.values.endDate
                    const datesForThisDay = rangeActive
                      ? generateDates(bulkFormik.values.startDate, bulkFormik.values.endDate, [idx])
                      : [1] // always show when no range
                    const disabled = rangeActive && datesForThisDay.length === 0
                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={disabled}
                        className={`csm-day-btn ${selectedDays.includes(idx) ? "active" : ""} ${disabled ? "blurred" : ""}`}
                        onClick={() =>
                          setSelectedDays((prev) =>
                            prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
                          )
                        }
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
                <span className="csm-hint">Select the days on which sessions should be scheduled</span>
              </div>

              <div className="csm-grid">
                <div className="csm-field">
                  <label>Session Type *</label>
                  <select name="sessionType" value={bulkFormik.values.sessionType} onChange={bulkFormik.handleChange}>
                    <option>General</option>
                    <option>Theory</option>
                    <option>Practical</option>
                    <option>Exam</option>
                  </select>
                </div>
              </div>

              <div className="csm-grid">
                <div className="csm-field">
                  <label>Start Time</label>
                  <input type="time" name="startTime" value={bulkFormik.values.startTime} onChange={bulkFormik.handleChange} />
                </div>
                <div className="csm-field">
                  <label>End Time</label>
                  <input type="time" name="endTime" value={bulkFormik.values.endTime} onChange={bulkFormik.handleChange} />
                </div>
                <div className="csm-field">
                  <label>Location (Optional)</label>
                  <select name="location" value={bulkFormik.values.location} onChange={bulkFormik.handleChange}>
                    <option value="">Select</option>
                    <option>Online</option>
                    <option>Face to Face</option>
                  </select>
                </div>
                <div className="csm-field">
                  <label>Active Slots *</label>
                  <input type="number" name="availableSlots" placeholder="e.g., 20"
                    value={bulkFormik.values.availableSlots}
                    onChange={bulkFormik.handleChange}
                  />
                </div>
                <div className="csm-field csm-field-full">
                  <label>🎓 Assign Teacher (Optional)</label>
                  <input type="text" placeholder="Search teachers by name or email…" />
                  <span className="csm-hint">Search and select a teacher to conduct this session</span>
                </div>
              </div>

              <button type="submit" className="csm-add-date-btn">+ Add Bulk Dates</button>
            </form>
          )}
        </div>

        {/* SCHEDULE LIST */}
        <div className="csm-schedule-section">
          <div className="csm-section-top">
            <h3 className="csm-section-title">
              Scheduled Dates ({schedules.length + (localSessions.length > 0 ? ` +${localSessions.length} unsaved` : "")})
            </h3>
            <div className="csm-filter-row">
              <div className="csm-filter-tabs">
                {sessionTypes.map((t) => (
                  <button
                    key={t}
                    className={`csm-filter-tab ${filterType === t ? "active" : ""} ${t === "Exam" ? "exam" : ""}`}
                    onClick={() => setFilterType(t)}
                  >
                    {t === "Exam" && <span className="csm-dot green"></span>}
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {allDates.length === 0 && (
            <div className="csm-no-session">No session available</div>
          )}

          {allDates.map((dateStr) => {
            const backendSchedule = schedules.find((s) => toYMD(s.date) === dateStr)
            const localForDate = localSessions
              .map((l, idx) => ({ ...l, _localIdx: idx }))
              .filter((l) => l.date === dateStr)

            const backendSessions = (backendSchedule?.sessions || []).filter(sessionMatchesFilter)
            const localSessionsFiltered = localForDate.filter((l) => sessionMatchesFilter(l.session))

            if (backendSessions.length === 0 && localSessionsFiltered.length === 0) return null

            const totalSessions = backendSessions.length + localSessionsFiltered.length

            return (
              <div key={dateStr} className="csm-date-block">
                {/* DATE HEADER */}
                <div className="csm-date-header">
                  <span>
                    <span className="csm-cal-icon"></span>
                    {formatDate(dateStr)}
                  </span>
                  <span className="csm-session-count">{totalSessions} session available</span>
                  <button className="csm-add-slot-btn">+ Add slot</button>
                </div>

                {/* BACKEND sessions */}
                {backendSessions.map((session) => {
                  const slotsLeft = (session.maxCapacity || 0) - (session.enrolledStudents || 0)
                  return (
                    <div
                      key={session._id}
                      className={`csm-session-card ${session.status === "Inactive" ? "csm-session-inactive" : ""}`}
                    >
                      <div className="csm-session-left">
                        <span className="csm-tag">{session.sessionType}</span>
                        <span className="csm-time">⏱ {session.startTime} - {session.endTime}</span>
                      </div>
                      <div className="csm-avl-slot">{session.availableSlots}<br /><span>Active slots</span></div>
                      <div className="csm-session-right">
                        <button
                          type="button"
                          className="csm-edit-btn"
                          onClick={() => setEditTarget({ session, scheduleDate: dateStr })}
                        >
                          Edit
                        </button>
                        <label
                          className={`csm-status-switch ${session.status === "Active" ? "is-on" : ""} ${togglingId === session._id ? "is-loading" : ""}`}
                          title={session.status === "Active" ? "Click to deactivate" : "Click to activate"}
                        >
                          <input
                            type="checkbox"
                            checked={session.status === "Active"}
                            onChange={() => toggleSession(session._id)}
                            disabled={togglingId === session._id}
                          />
                          <span className="csm-status-slider" />
                          <span className="csm-status-label">
                            {session.status === "Active" ? "Active" : "Deactivate"}
                          </span>
                        </label>
                        <button
                          type="button"
                          className="csm-delete"
                          onClick={() => deleteSession(session._id)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  )
                })}

                {/* LOCAL (unsaved) sessions */}
                {localSessionsFiltered.map((l) => (
                  <div key={l._localIdx} className="csm-session-card csm-session-unsaved">
                    <div className="csm-session-left">
                      <span className="csm-tag">{l.session.sessionType}</span>
                      <span className="csm-time">⏱ {l.session.startTime} - {l.session.endTime}</span>
                    </div>
                    <div className="csm-avl-slot csm-unsaved-badge">Unsaved</div>
                    <div className="csm-session-right">
                      <button
                        type="button"
                        className="csm-delete"
                        onClick={() => deleteLocalSession(l._localIdx)}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* FOOTER */}
        <div className="csm-footer">
          <button
            type="button"
            className={`csm-save-dates-btn ${unsavedCount > 0 ? "active" : ""}`}
            onClick={saveNewDates}
            disabled={unsavedCount === 0 || saving}
          >
            Save New Dates ({unsavedCount})
          </button>
          <button type="button" className="csm-cancel-btn" onClick={close}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default CourseScheduleModal