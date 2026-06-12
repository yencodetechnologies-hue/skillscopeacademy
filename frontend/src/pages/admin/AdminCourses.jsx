// // import { useEffect, useState, useCallback, useRef } from 'react'
// // import {
// //   getCourses, createCourse, updateCourse, deleteCourse, toggleCourseStatus,
// //   getCategories, createCategory, updateCategory, deleteCategory,
// //   getSchedulesByCourse, createSchedule, createBulkSchedules,
// //   updateSchedule, deleteSchedule, toggleScheduleStatus,
// // } from '../../services/adminService'
// // import API from '../../services/api'

// // const SESSION_TYPES = ['General', 'Theory', 'Practical', 'Exam']
// // const LOCATIONS     = ['Online', 'Face to Face']
// // const DAYS_OF_WEEK  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// // const fmtDate = iso => {
// //   if (!iso) return ''
// //   return new Date(iso).toLocaleDateString('en-AU', {
// //     weekday: 'short', day: '2-digit', month: 'long', year: 'numeric',
// //   })
// // }

// // // ── SVG Icons ─────────────────────────────────────────────────
// // const CalendarIcon = () => (
// //   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
// //     <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
// //     <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
// //     <line x1="3" y1="10" x2="21" y2="10"/>
// //   </svg>
// // )
// // const EditIcon = () => (
// //   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
// //     <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
// //     <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
// //   </svg>
// // )
// // const TrashIcon = () => (
// //   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
// //     <polyline points="3 6 5 6 21 6"/>
// //     <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
// //     <path d="M10 11v6"/><path d="M14 11v6"/>
// //     <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
// //   </svg>
// // )
// // const DragIcon = () => (
// //   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
// //     <circle cx="9"  cy="5"  r="1.5"/><circle cx="15" cy="5"  r="1.5"/>
// //     <circle cx="9"  cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
// //     <circle cx="9"  cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
// //   </svg>
// // )

// // const Toggle = ({ active, onChange }) => (
// //   <button className={`toggle-btn ${active ? 'toggle-on' : 'toggle-off'}`} onClick={onChange}
// //     title={active ? 'Active — click to deactivate' : 'Inactive — click to activate'}>
// //     <span className="toggle-thumb"/>
// //   </button>
// // )

// // const TableSkeleton = ({ cols, rows = 4 }) => (
// //   <tbody>
// //     {Array.from({ length: rows }, (_, i) => (
// //       <tr key={i}>{Array.from({ length: cols }, (_, j) => (
// //         <td key={j}><div className="skeleton-cell"/></td>
// //       ))}</tr>
// //     ))}
// //   </tbody>
// // )

// // // Shared field wrapper — ensures consistent label + input styling everywhere
// // const Field = ({ label, children, hint, className = '' }) => (
// //   <div className={`cm-field ${className}`}>
// //     {label && <label className="cm-label">{label}</label>}
// //     {children}
// //     {hint && <p className="cm-hint">{hint}</p>}
// //   </div>
// // )

// // // ══════════════════════════════════════════════════════════════
// // // SCHEDULE MODAL
// // // ══════════════════════════════════════════════════════════════
// // const ScheduleModal = ({ course, onClose }) => {
// //   const [schedules, setSchedules]   = useState([])
// //   const [loading, setLoading]       = useState(true)
// //   const [saving, setSaving]         = useState(false)
// //   const [filterType, setFilterType] = useState('All')
// //   const [editSession, setEdit]      = useState(null)
// //   const [isBulk, setIsBulk]        = useState(false)
// //   const [formError, setFormError]   = useState('')

// //   const emptyForm = { date:'', sessionType:'General', startTime:'', endTime:'', location:'', activeSlots:'', teacherSearch:'' }
// //   const emptyBulk = { startDate:'', endDate:'', selectedDays:[], sessionType:'General', startTime:'', endTime:'', location:'', activeSlots:'', teacherSearch:'' }
// //   const [form, setForm]         = useState(emptyForm)
// //   const [bulkForm, setBulkForm] = useState(emptyBulk)

// //   const load = useCallback(async () => {
// //     setLoading(true)
// //     try {
// //       const { data } = await getSchedulesByCourse(course._id)
// //       setSchedules(data.schedules || data.data || [])
// //     } catch (e) { console.error(e); setSchedules([]) }
// //     finally { setLoading(false) }
// //   }, [course._id])

// //   useEffect(() => { load() }, [load])

// //   const toggleDay = idx => setBulkForm(f => ({
// //     ...f,
// //     selectedDays: f.selectedDays.includes(idx)
// //       ? f.selectedDays.filter(d => d !== idx)
// //       : [...f.selectedDays, idx],
// //   }))

// //   const generateDates = (start, end, days) => {
// //     const result = []; const cur = new Date(start); const e = new Date(end)
// //     while (cur <= e) {
// //       if (days.includes(cur.getDay())) result.push(cur.toISOString().substring(0, 10))
// //       cur.setDate(cur.getDate() + 1)
// //     }
// //     return result
// //   }

// //   const handleAddSingle = async () => {
// //     setFormError('')
// //     if (!form.date)        { setFormError('Date is required.'); return }
// //     if (!form.startTime)   { setFormError('Start Time is required.'); return }
// //     if (!form.endTime)     { setFormError('End Time is required.'); return }
// //     if (!form.activeSlots) { setFormError('Active Slots is required.'); return }
// //     setSaving(true)
// //     try {
// //       await createSchedule({ courseId: course._id, date: form.date, sessionType: form.sessionType, startTime: form.startTime, endTime: form.endTime, location: form.location, activeSlots: Number(form.activeSlots), teacher: form.teacherSearch || undefined })
// //       setForm(emptyForm); load()
// //     } catch (e) { console.error(e); setFormError('Failed to add date.') }
// //     finally { setSaving(false) }
// //   }

// //   const handleAddBulk = async () => {
// //     setFormError('')
// //     if (!bulkForm.startDate)           { setFormError('Start Date is required.'); return }
// //     if (!bulkForm.endDate)             { setFormError('End Date is required.'); return }
// //     if (!bulkForm.selectedDays.length) { setFormError('Select at least one day.'); return }
// //     if (!bulkForm.startTime)           { setFormError('Start Time is required.'); return }
// //     if (!bulkForm.endTime)             { setFormError('End Time is required.'); return }
// //     if (!bulkForm.activeSlots)         { setFormError('Active Slots is required.'); return }
// //     if (new Date(bulkForm.endDate) < new Date(bulkForm.startDate)) { setFormError('End Date must be after Start Date.'); return }
// //     const dates = generateDates(bulkForm.startDate, bulkForm.endDate, bulkForm.selectedDays)
// //     if (!dates.length) { setFormError('No matching dates found.'); return }
// //     setSaving(true)
// //     try {
// //       await createBulkSchedules({ courseId: course._id, dates, sessionType: bulkForm.sessionType, startTime: bulkForm.startTime, endTime: bulkForm.endTime, location: bulkForm.location, activeSlots: Number(bulkForm.activeSlots), teacher: bulkForm.teacherSearch || undefined })
// //       setBulkForm(emptyBulk); setIsBulk(false); load()
// //     } catch (e) { console.error(e); setFormError('Failed to add bulk dates.') }
// //     finally { setSaving(false) }
// //   }

// //   const handleToggle  = async id => { try { await toggleScheduleStatus(id); load() } catch (e) { console.error(e) } }
// //   const handleDelete  = async id => { if (!window.confirm('Delete this session?')) return; try { await deleteSchedule(id); load() } catch (e) { console.error(e) } }
// //   const handleEditSave = async () => {
// //     if (!editSession) return
// //     try { await updateSchedule(editSession._id, { startTime: editSession.startTime, endTime: editSession.endTime, activeSlots: Number(editSession.activeSlots) }); setEdit(null); load() }
// //     catch (e) { console.error(e) }
// //   }

// //   const grouped = schedules
// //     .filter(s => filterType === 'All' || s.sessionType === filterType)
// //     .reduce((acc, s) => { const d = s.date?.substring(0, 10) || 'Unknown'; if (!acc[d]) acc[d] = []; acc[d].push(s); return acc }, {})

// //   const bulkPreviewCount = bulkForm.startDate && bulkForm.endDate && bulkForm.selectedDays.length
// //     ? generateDates(bulkForm.startDate, bulkForm.endDate, bulkForm.selectedDays).length : 0

// //   return (
// //     <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
// //       <div className="schedule-modal">
// //         <div className="sched-modal-head">
// //           <div><h2>Manage Course Dates</h2><p className="sched-course-name">{course.title}</p></div>
// //           <button className="modal-close-btn" onClick={onClose}>✕</button>
// //         </div>

// //         <div className="sched-modal-body">
// //           <div className="add-date-section">
// //             <div className="add-date-header">
// //               <span className="add-date-title">+ Add New Date</span>
// //               <label className="bulk-check">
// //                 <input type="checkbox" checked={isBulk} onChange={e => { setIsBulk(e.target.checked); setFormError('') }}/>
// //                 Bulk Upload
// //               </label>
// //             </div>

// //             {/* Single date form */}
// //             {!isBulk && (
// //               <>
// //                 <div className="sched-form-grid">
// //                   <div className="sched-field"><label>Date *</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}/></div>
// //                   <div className="sched-field"><label>Session Type</label><select value={form.sessionType} onChange={e => setForm(f => ({ ...f, sessionType: e.target.value }))}>{SESSION_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
// //                   <div className="sched-field"><label>Start Time</label><input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}/></div>
// //                   <div className="sched-field"><label>End Time</label><input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}/></div>
// //                   <div className="sched-field"><label>Location (Optional)</label><select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}><option value="">Select</option>{LOCATIONS.map(l => <option key={l}>{l}</option>)}</select></div>
// //                   <div className="sched-field"><label>Active Slots *</label><input type="number" min="1" value={form.activeSlots} placeholder="e.g., 20" onChange={e => setForm(f => ({ ...f, activeSlots: e.target.value }))}/></div>
// //                 </div>
// //                 <div className="sched-field" style={{ marginTop: 12 }}>
// //                   <label>🎓 Assign Teacher (Optional)</label>
// //                   <input value={form.teacherSearch} onChange={e => setForm(f => ({ ...f, teacherSearch: e.target.value }))} placeholder="Search teachers by name or email…"/>
// //                   <p className="field-hint">Search and select a teacher to conduct this session</p>
// //                 </div>
// //                 {formError && <p className="sched-form-error">{formError}</p>}
// //                 <button className="red-btn" style={{ marginTop: 14 }} onClick={handleAddSingle} disabled={saving}>{saving ? 'Adding…' : '+ Add Date'}</button>
// //               </>
// //             )}

// //             {/* Bulk upload form */}
// //             {isBulk && (
// //               <>
// //                 <div className="sched-form-grid">
// //                   <div className="sched-field"><label>Start Date *</label><input type="date" value={bulkForm.startDate} onChange={e => setBulkForm(f => ({ ...f, startDate: e.target.value }))}/></div>
// //                   <div className="sched-field"><label>End Date *</label><input type="date" value={bulkForm.endDate} onChange={e => setBulkForm(f => ({ ...f, endDate: e.target.value }))}/></div>
// //                 </div>
// //                 <div className="bulk-days-section">
// //                   <label className="sched-field-label">Select Days of the Week *</label>
// //                   <div className="bulk-days-row">
// //                     {DAYS_OF_WEEK.map((d, idx) => (
// //                       <button key={d} type="button" className={`day-pill${bulkForm.selectedDays.includes(idx) ? ' day-pill--on' : ''}`} onClick={() => toggleDay(idx)}>{d}</button>
// //                     ))}
// //                   </div>
// //                   <p className="field-hint">Select the days on which sessions should be scheduled</p>
// //                 </div>
// //                 <div className="sched-form-grid" style={{ marginTop: 12 }}>
// //                   <div className="sched-field"><label>Session Type *</label><select value={bulkForm.sessionType} onChange={e => setBulkForm(f => ({ ...f, sessionType: e.target.value }))}>{SESSION_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
// //                   <div className="sched-field"/>
// //                   <div className="sched-field"><label>Start Time</label><input type="time" value={bulkForm.startTime} onChange={e => setBulkForm(f => ({ ...f, startTime: e.target.value }))}/></div>
// //                   <div className="sched-field"><label>End Time</label><input type="time" value={bulkForm.endTime} onChange={e => setBulkForm(f => ({ ...f, endTime: e.target.value }))}/></div>
// //                   <div className="sched-field"><label>Location (Optional)</label><select value={bulkForm.location} onChange={e => setBulkForm(f => ({ ...f, location: e.target.value }))}><option value="">Select</option>{LOCATIONS.map(l => <option key={l}>{l}</option>)}</select></div>
// //                   <div className="sched-field"><label>Active Slots *</label><input type="number" min="1" value={bulkForm.activeSlots} placeholder="e.g., 20" onChange={e => setBulkForm(f => ({ ...f, activeSlots: e.target.value }))}/></div>
// //                 </div>
// //                 <div className="sched-field" style={{ marginTop: 12 }}>
// //                   <label>🎓 Assign Teacher (Optional)</label>
// //                   <input value={bulkForm.teacherSearch} onChange={e => setBulkForm(f => ({ ...f, teacherSearch: e.target.value }))} placeholder="Search teachers by name or email…"/>
// //                   <p className="field-hint">Search and select a teacher to conduct this session</p>
// //                 </div>
// //                 {bulkPreviewCount > 0 && <p className="bulk-preview-count">📅 {bulkPreviewCount} session{bulkPreviewCount > 1 ? 's' : ''} will be created</p>}
// //                 {formError && <p className="sched-form-error">{formError}</p>}
// //                 <button className="red-btn" style={{ marginTop: 14 }} onClick={handleAddBulk} disabled={saving}>{saving ? 'Creating…' : '+ Add Bulk Dates'}</button>
// //               </>
// //             )}
// //           </div>

// //           <div className="sched-list-section">
// //             <div className="sched-list-header">
// //               <strong>Scheduled Dates ({schedules.length})</strong>
// //               <div className="sched-filter-tabs">
// //                 {['All', ...SESSION_TYPES].map(t => (
// //                   <button key={t} className={`sched-filter-tab${filterType === t ? ' active' : ''}`} onClick={() => setFilterType(t)}>{t}</button>
// //                 ))}
// //               </div>
// //             </div>
// //             {loading ? <p className="loading-text">Loading schedules…</p>
// //               : Object.keys(grouped).length === 0
// //                 ? <p style={{ padding: '24px 0', color: '#888', textAlign: 'center', fontSize: 13 }}>No sessions scheduled yet.</p>
// //                 : Object.keys(grouped).sort().map(date => (
// //                   <div key={date} className="sched-date-group">
// //                     <div className="sched-date-row">
// //                       <strong>{fmtDate(date)}</strong>
// //                       <span className="sched-session-count">{grouped[date].length} session{grouped[date].length > 1 ? 's' : ''} available</span>
// //                       <button className="add-slot-btn">+ Add slot</button>
// //                     </div>
// //                     {grouped[date].map(s => (
// //                       <div key={s._id} className="sched-slot-row">
// //                         <span className={`session-type-badge type-${(s.sessionType || 'general').toLowerCase()}`}>{s.sessionType || 'General'}</span>
// //                         <span className="sched-time">🕐 {s.startTime} - {s.endTime}</span>
// //                         <span className="sched-slots">{s.activeSlots}<br/><span className="sched-slots-label">Active slots</span></span>
// //                         <button className="sched-edit-btn" onClick={() => setEdit({ ...s })}>Edit</button>
// //                         <Toggle active={s.isActive !== false} onChange={() => handleToggle(s._id)}/>
// //                         <span className={`status-pill ${s.isActive !== false ? 'status-active' : 'status-inactive'}`}>{s.isActive !== false ? 'Active' : 'Inactive'}</span>
// //                         <button className="sched-delete-btn" title="Delete session" onClick={() => handleDelete(s._id)}><TrashIcon/></button>
// //                       </div>
// //                     ))}
// //                   </div>
// //                 ))
// //             }
// //           </div>
// //         </div>

// //         <div className="modal-footer">
// //           <button className="cancel-btn" onClick={onClose}>Close</button>
// //         </div>
// //       </div>

// //       {editSession && (
// //         <div className="modal-backdrop inner-backdrop" onClick={e => e.target === e.currentTarget && setEdit(null)}>
// //           <div className="modal edit-session-modal">
// //             <div className="modal-top">
// //               <div><h2>Edit Session</h2><p className="page-sub">Update the start/end time and capacity for this session.</p></div>
// //               <button className="modal-close-btn" onClick={() => setEdit(null)}>✕</button>
// //             </div>
// //             <div className="edit-session-body">
// //               <p className="edit-date-label">Date</p>
// //               <p className="edit-date-val">{fmtDate(editSession.date)}</p>
// //               <div className="sched-form-grid" style={{ marginTop: 16 }}>
// //                 <div className="sched-field"><label>Start Time</label><input type="time" value={editSession.startTime} onChange={e => setEdit(s => ({ ...s, startTime: e.target.value }))}/></div>
// //                 <div className="sched-field"><label>End Time</label><input type="time" value={editSession.endTime} onChange={e => setEdit(s => ({ ...s, endTime: e.target.value }))}/></div>
// //               </div>
// //               <div className="sched-field" style={{ marginTop: 12 }}><label>Active Slots</label><input type="number" value={editSession.activeSlots} onChange={e => setEdit(s => ({ ...s, activeSlots: e.target.value }))}/></div>
// //             </div>
// //             <div className="modal-footer">
// //               <button className="cancel-btn" onClick={() => setEdit(null)}>Cancel</button>
// //               <button className="red-btn" onClick={handleEditSave}>Save Changes</button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   )
// // }

// // // ══════════════════════════════════════════════════════════════
// // // CATEGORY MODAL — drag reorder + edit + delete
// // // ══════════════════════════════════════════════════════════════
// // const CategoryModal = ({ onClose, categories: initCats, onRefresh }) => {
// //   const [cats, setCats]         = useState(initCats)
// //   const [name, setName]         = useState('')
// //   const [img, setImg]           = useState(null)
// //   const [editId, setEditId]     = useState(null)
// //   const [editName, setEditName] = useState('')
// //   const [editImg, setEditImg]   = useState(null)
// //   const [saving, setSaving]     = useState(false)

// //   useEffect(() => { setCats(initCats) }, [initCats])

// //   // ── Drag state ──
// //   const dragIdx = useRef(null)
// //   const overIdx = useRef(null)

// //   const onDragStart = idx => { dragIdx.current = idx }
// //   const onDragEnter = idx => { overIdx.current = idx }
// //   const onDragEnd   = async () => {
// //     const from = dragIdx.current
// //     const to   = overIdx.current
// //     if (from === null || to === null || from === to) { dragIdx.current = null; overIdx.current = null; return }

// //     const updated = [...cats]
// //     const [moved] = updated.splice(from, 1)
// //     updated.splice(to, 0, moved)
// //     dragIdx.current = null; overIdx.current = null
// //     setCats(updated)

// //     // Persist new order to backend
// //     try {
// //       await API.post('/categories/reorder', { orderedIds: updated.map(c => c._id) })
// //     } catch (e) { console.error('reorder failed', e) }
// //   }

// //   const handleAdd = async () => {
// //     if (!name.trim()) return
// //     setSaving(true)
// //     try {
// //       const fd = new FormData(); fd.append('name', name); if (img) fd.append('image', img)
// //       await createCategory(fd); setName(''); setImg(null); onRefresh()
// //     } catch (e) { console.error(e) }
// //     finally { setSaving(false) }
// //   }

// //   const handleEditSave = async id => {
// //     if (!editName.trim()) return
// //     setSaving(true)
// //     try {
// //       const fd = new FormData(); fd.append('name', editName); if (editImg) fd.append('image', editImg)
// //       await updateCategory(id, fd); setEditId(null); setEditName(''); setEditImg(null); onRefresh()
// //     } catch (e) { console.error(e) }
// //     finally { setSaving(false) }
// //   }

// //   const handleDelete = async id => {
// //     if (!window.confirm('Delete this category? All courses in it will be uncategorised.')) return
// //     try { await deleteCategory(id); onRefresh() } catch (e) { console.error(e) }
// //   }

// //   return (
// //     <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
// //       <div className="modal cat-modal">
// //         <div className="modal-top">
// //           <div><h2>Manage Course Categories</h2><p className="page-sub">Add, edit, or remove course categories</p></div>
// //           <button className="modal-close-btn" onClick={onClose}>✕</button>
// //         </div>

// //         <div className="cat-add-row">
// //           <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter new category name"
// //             style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && handleAdd()}/>
// //           <button className="red-btn" onClick={handleAdd} disabled={saving}>+ Add</button>
// //         </div>
// //         <div className="cat-img-upload">
// //           <span className="upload-tab active">Upload</span>
// //           <label className="choose-img-btn">
// //             <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setImg(e.target.files[0])}/>
// //             📤 {img ? img.name : 'Choose image'}
// //           </label>
// //         </div>

// //         <div className="cat-list">
// //           {cats.length === 0
// //             ? <p className="empty-row">No categories yet.</p>
// //             : cats.map((cat, idx) => (
// //               <div
// //                 key={cat._id}
// //                 className="cat-list-row"
// //                 draggable
// //                 onDragStart={() => onDragStart(idx)}
// //                 onDragEnter={() => onDragEnter(idx)}
// //                 onDragEnd={onDragEnd}
// //                 onDragOver={e => e.preventDefault()}
// //               >
// //                 <span className="drag-handle cat-drag-handle" title="Drag to reorder"><DragIcon/></span>

// //                 {cat.image
// //                   ? <img src={cat.image} alt={cat.name} className="cat-thumb"/>
// //                   : <div className="cat-thumb-placeholder">📷</div>
// //                 }

// //                 {editId === cat._id ? (
// //                   <div className="cat-edit-row">
// //                     <input value={editName} onChange={e => setEditName(e.target.value)}
// //                       className="cat-edit-input" autoFocus
// //                       onKeyDown={e => { if (e.key === 'Enter') handleEditSave(cat._id); if (e.key === 'Escape') { setEditId(null); setEditName('') } }}/>
// //                     <label className="cat-edit-img-btn">
// //                       <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setEditImg(e.target.files[0])}/>
// //                       📤 {editImg ? editImg.name : 'Change image'}
// //                     </label>
// //                     <button className="red-btn" style={{ padding: '5px 12px', fontSize: 12 }}
// //                       onClick={() => handleEditSave(cat._id)} disabled={saving}>Save</button>
// //                     <button className="cancel-btn" style={{ padding: '5px 12px', fontSize: 12 }}
// //                       onClick={() => { setEditId(null); setEditName(''); setEditImg(null) }}>✕</button>
// //                   </div>
// //                 ) : (
// //                   <>
// //                     <span className="cat-name">{cat.name}</span>
// //                     <span className="cat-course-count">{cat.courseCount ?? 0} courses</span>
// //                     <button className="icon-action-btn action-edit" title="Edit category"
// //                       onClick={() => { setEditId(cat._id); setEditName(cat.name); setEditImg(null) }}>
// //                       <EditIcon/>
// //                     </button>
// //                     <button className="icon-action-btn danger" title="Delete category" onClick={() => handleDelete(cat._id)}>
// //                       <TrashIcon/>
// //                     </button>
// //                   </>
// //                 )}
// //               </div>
// //             ))
// //           }
// //         </div>
// //         <p className="cat-footer-note">Total Categories: {cats.length} • Drag to reorder (order appears on front page)</p>
// //       </div>
// //     </div>
// //   )
// // }

// // // ══════════════════════════════════════════════════════════════
// // // COURSE MODAL — consistent styling on both tabs
// // // ══════════════════════════════════════════════════════════════
// // const CourseModal = ({ course, categories, onClose, onSaved }) => {
// //   const isEdit = !!course
// //   const [form, setForm] = useState({
// //     title: course?.title || '', description: course?.description || '',
// //     category: course?.category?._id || course?.category || '',
// //     instructor: course?.instructor || '', price: course?.price || '',
// //     courseType: course?.courseType || 'single', comboEnabled: course?.comboEnabled || false,
// //     comboPrice: course?.comboPrice || '', comboDescription: course?.comboDescription || '',
// //     comboDuration: course?.comboDuration || '', urlSlug: course?.urlSlug || '',
// //     duration: course?.duration || '', certificateValidity: course?.certificateValidity || '',
// //     pricingType: course?.pricingType || 'Standard',
// //   })
// //   const [thumbnail, setThumb]     = useState(null)
// //   const [activeTab, setActiveTab] = useState('course')
// //   const [saving, setSaving]       = useState(false)
// //   const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

// //   const handleSave = async () => {
// //     if (!form.title?.trim()) { alert('Course title is required.'); return }
// //     setSaving(true)
// //     try {
// //       const fd = new FormData()
// //       Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v) })
// //       if (thumbnail) fd.append('thumbnail', thumbnail)
// //       if (isEdit) await updateCourse(course._id, fd)
// //       else        await createCourse(fd)
// //       onSaved(); onClose()
// //     } catch (e) { console.error(e); alert('Failed to save course.') }
// //     finally { setSaving(false) }
// //   }

// //   return (
// //     <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
// //       <div className="course-modal-full">
// //         <div className="modal-top" style={{ padding: '20px 28px 0' }}>
// //           <h2>{isEdit ? 'Edit Course' : 'Create New Course'}</h2>
// //           <button className="modal-close-btn" onClick={onClose}>✕</button>
// //         </div>

// //         <div className="course-tabs">
// //           <button className={activeTab === 'course' ? 'tab-btn active' : 'tab-btn'}
// //             onClick={() => { setActiveTab('course'); setF('courseType', 'single'); setF('comboEnabled', false) }}>
// //             Course Details
// //           </button>
// //           <button className={activeTab === 'combo' ? 'tab-btn active' : 'tab-btn'}
// //             onClick={() => { setActiveTab('combo'); setF('courseType', 'combo'); setF('comboEnabled', true) }}>
// //             Combo Package
// //           </button>
// //         </div>

// //         <div className="course-content">

// //           {/* ── Course Details Tab ── */}
// //           {activeTab === 'course' && (
// //             <div className="course-form-grid">
// //               <Field label="Select Category *" className="span-2">
// //                 <select className="cm-input" value={form.category} onChange={e => setF('category', e.target.value)}>
// //                   <option value="">Select Category</option>
// //                   {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
// //                 </select>
// //               </Field>

// //               <Field label="Course Title *">
// //                 <input className="cm-input" value={form.title} onChange={e => setF('title', e.target.value)} placeholder="e.g., Work Safely at Heights"/>
// //               </Field>
// //               <Field label="Course Code / URL Slug" hint={`Page URL: /course/${form.urlSlug || 'your-slug'}`}>
// //                 <input className="cm-input" value={form.urlSlug} onChange={e => setF('urlSlug', e.target.value)} placeholder="e.g., forklift-licence"/>
// //               </Field>

// //               <Field label="Instructor">
// //                 <input className="cm-input" value={form.instructor} onChange={e => setF('instructor', e.target.value)} placeholder="Instructor Name"/>
// //               </Field>
// //               <Field label="Course Price (₹)">
// //                 <input className="cm-input" type="number" value={form.price} onChange={e => setF('price', e.target.value)} placeholder="0"/>
// //               </Field>

// //               <Field label="Duration">
// //                 <input className="cm-input" value={form.duration} onChange={e => setF('duration', e.target.value)} placeholder="e.g., 1 Day Course"/>
// //               </Field>
// //               <Field label="Certificate Validity">
// //                 <input className="cm-input" value={form.certificateValidity} onChange={e => setF('certificateValidity', e.target.value)} placeholder="e.g., 3 years"/>
// //               </Field>

// //               <Field label="Pricing Type" className="span-2">
// //                 <div className="pricing-type-row">
// //                   {['Standard', 'Experience-Based', 'SL or BL'].map(t => (
// //                     <label key={t} className={`pricing-radio ${form.pricingType === t ? 'selected' : ''}`}>
// //                       <input type="radio" name="pricingType" value={t} checked={form.pricingType === t} onChange={() => setF('pricingType', t)}/>{t}
// //                     </label>
// //                   ))}
// //                 </div>
// //               </Field>

// //               <Field label="Description" className="span-2">
// //                 <textarea className="cm-input" rows="3" value={form.description}
// //                   onChange={e => setF('description', e.target.value)} placeholder="Course Description" style={{ resize: 'vertical' }}/>
// //               </Field>

// //               <Field label="Course Thumbnail" className="span-2">
// //                 <input className="cm-input" type="file" accept="image/*"
// //                   onChange={e => setThumb(e.target.files[0])} style={{ padding: '6px 10px' }}/>
// //                 {(thumbnail || course?.thumbnail) && (
// //                   <img className="thumb-preview"
// //                     src={thumbnail ? URL.createObjectURL(thumbnail) : course.thumbnail} alt="preview"/>
// //                 )}
// //               </Field>
// //             </div>
// //           )}

// //           {/* ── Combo Package Tab — identical input styling ── */}
// //           {activeTab === 'combo' && (
// //             <div className="course-form-grid">
// //               <Field className="span-2" label="">
// //                 <label className="combo-check">
// //                   <input type="checkbox" checked={form.comboEnabled} onChange={e => setF('comboEnabled', e.target.checked)}/>
// //                   Enable Combo Package Offer
// //                 </label>
// //               </Field>

// //               {form.comboEnabled && (
// //                 <>
// //                   <Field label="Combo Description" className="span-2">
// //                     <input className="cm-input" value={form.comboDescription}
// //                       onChange={e => setF('comboDescription', e.target.value)} placeholder="Describe combo package"/>
// //                   </Field>

// //                   <Field label="Combo Price (₹)">
// //                     <input className="cm-input" type="number" value={form.comboPrice}
// //                       onChange={e => setF('comboPrice', e.target.value)} placeholder="78"/>
// //                   </Field>

// //                   <Field label="Combo Duration (days)">
// //                     <input className="cm-input" type="number" value={form.comboDuration}
// //                       onChange={e => setF('comboDuration', e.target.value)} placeholder="1"/>
// //                   </Field>

// //                   <div className="span-2">
// //                     <div className="combo-preview">
// //                       <h3>Combo Preview</h3>
// //                       <p><strong>Package:</strong> {form.comboDescription || '—'}</p>
// //                       <p><strong>Price:</strong> ₹{form.comboPrice || '0'}</p>
// //                       <p><strong>Duration:</strong> {form.comboDuration || '0'} days</p>
// //                     </div>
// //                   </div>
// //                 </>
// //               )}
// //             </div>
// //           )}
// //         </div>

// //         <div className="modal-footer">
// //           <button className="cancel-btn" onClick={onClose}>Cancel</button>
// //           <button className="red-btn" onClick={handleSave} disabled={saving}>
// //             {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Course'}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }

// // // ══════════════════════════════════════════════════════════════
// // // MAIN AdminCourses PAGE
// // // Course drag fix: track by _id, not by index in filtered/grouped
// // // ══════════════════════════════════════════════════════════════
// // const AdminCourses = () => {
// //   const [courses, setCourses]         = useState([])
// //   const [categories, setCategories]   = useState([])
// //   const [loading, setLoading]         = useState(true)
// //   const [search, setSearch]           = useState('')
// //   const [statusFilter, setStatus]     = useState('All Status')
// //   const [showCatModal, setCatModal]   = useState(false)
// //   const [showCourseModal, setCModal]  = useState(false)
// //   const [editCourse, setEditCourse]   = useState(null)
// //   const [schedCourse, setSchedCourse] = useState(null)

// //   // Drag state tracked by course _id (not fragile index)
// //   const dragId   = useRef(null)   // _id of dragged course
// //   const dragCat  = useRef(null)   // category group it belongs to
// //   const overId   = useRef(null)   // _id of the course being hovered over

// //   const loadAll = useCallback(async () => {
// //     setLoading(true)
// //     try {
// //       const [cRes, catRes] = await Promise.all([getCourses(), getCategories()])
// //       setCourses(cRes.data.courses || [])
// //       setCategories(catRes.data.categories || [])
// //     } catch (e) { console.error(e) }
// //     finally { setLoading(false) }
// //   }, [])

// //   useEffect(() => { loadAll() }, [loadAll])

// //   const handleToggleStatus = async id => { try { await toggleCourseStatus(id); loadAll() } catch (e) { console.error(e) } }
// //   const handleDelete = async id => {
// //     if (!window.confirm('Delete this course? This cannot be undone.')) return
// //     try { await deleteCourse(id); loadAll() } catch (e) { console.error(e) }
// //   }

// //   // ── Course drag handlers — use _id to find positions ──────
// //   const onCourseDragStart = (id, catName) => {
// //     dragId.current  = id
// //     dragCat.current = catName
// //   }
// //   const onCourseDragEnter = id => {
// //     overId.current = id
// //   }
// //   const onCourseDragEnd = () => {
// //     const fromId  = dragId.current
// //     const toId    = overId.current
// //     const catName = dragCat.current

// //     dragId.current = null; dragCat.current = null; overId.current = null

// //     if (!fromId || !toId || fromId === toId) return

// //     setCourses(prev => {
// //       // Get all courses in this category in current order
// //       const inCat  = prev.filter(c => (c.category?.name || 'Uncategorised') === catName)
// //       const others = prev.filter(c => (c.category?.name || 'Uncategorised') !== catName)

// //       const fromIdx = inCat.findIndex(c => c._id === fromId)
// //       const toIdx   = inCat.findIndex(c => c._id === toId)
// //       if (fromIdx === -1 || toIdx === -1) return prev

// //       const reordered = [...inCat]
// //       const [moved]   = reordered.splice(fromIdx, 1)
// //       reordered.splice(toIdx, 0, moved)

// //       return [...others, ...reordered]
// //     })
// //   }

// //   // ── Filter + group ────────────────────────────────────────
// //   const filtered = courses.filter(c => {
// //     const q = search.toLowerCase()
// //     const matchSearch = !search || c.title?.toLowerCase().includes(q) || (c.code || c.urlSlug || '').toLowerCase().includes(q)
// //     const matchStatus = statusFilter === 'All Status' || (statusFilter === 'Active' ? c.isActive !== false : c.isActive === false)
// //     return matchSearch && matchStatus
// //   })

// //   const grouped = filtered.reduce((acc, c) => {
// //     const key = c.category?.name || 'Uncategorised'
// //     if (!acc[key]) acc[key] = []
// //     acc[key].push(c)
// //     return acc
// //   }, {})

// //   return (
// //     <div>
// //       {/* Page Header */}
// //       <div className="page-header">
// //         <div>
// //           <h2 className="page-title" style={{ color: '#C0392B' }}>Course Management</h2>
// //           <p className="page-sub">Create and manage courses with detailed information</p>
// //         </div>
// //         <div className="page-header-actions">
// //           <button className="outline-btn" onClick={() => setCatModal(true)}>🏷 Manage Categories</button>
// //           <button className="red-btn" onClick={() => { setEditCourse(null); setCModal(true) }}>+ Create New Course</button>
// //         </div>
// //       </div>

// //       {/* Search & Filter */}
// //       <div className="section-card" style={{ marginBottom: 20 }}>
// //         <div style={{ padding: '18px 22px' }}>
// //           <p style={{ fontWeight: 600, marginBottom: 4 }}>Search &amp; Filter</p>
// //           <p className="page-sub" style={{ marginBottom: 14 }}>Find courses by name or course code</p>
// //           <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
// //             <input className="search-input" value={search} onChange={e => setSearch(e.target.value)}
// //               placeholder="Search courses by name or code…" style={{ flex: 1, minWidth: 200 }}/>
// //             <select className="filter-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
// //               <option>All Status</option><option>Active</option><option>Inactive</option>
// //             </select>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Course Groups */}
// //       {loading ? (
// //         <div className="section-card">
// //           <table className="admin-table">
// //             <thead><tr><th>Code</th><th>Title</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
// //             <TableSkeleton cols={6}/>
// //           </table>
// //         </div>
// //       ) : Object.keys(grouped).length === 0 ? (
// //         <div className="section-card"><p className="empty-row">No courses found.</p></div>
// //       ) : (
// //         Object.keys(grouped).sort().map(catName => (
// //           <div key={catName} style={{ marginBottom: 28 }}>
// //             <h3 className="cat-group-title">{catName}</h3>

// //             {grouped[catName].map(course => (
// //               <div
// //                 key={course._id}
// //                 className="course-list-card"
// //                 draggable
// //                 onDragStart={() => onCourseDragStart(course._id, catName)}
// //                 onDragEnter={() => onCourseDragEnter(course._id)}
// //                 onDragEnd={onCourseDragEnd}
// //                 onDragOver={e => e.preventDefault()}
// //               >
// //                 {/* Drag handle */}
// //                 <div className="course-list-drag" style={{ cursor: 'grab', color: '#bbb' }}>
// //                   <DragIcon/>
// //                 </div>

// //                 {/* Thumbnail */}
// //                 {course.thumbnail
// //                   ? <img src={course.thumbnail} alt={course.title} className="course-list-thumb"/>
// //                   : <div className="course-list-thumb-placeholder">📖</div>
// //                 }

// //                 {/* Info */}
// //                 <div className="course-list-body">
// //                   <div className="course-list-code">{course.code || course.urlSlug || '—'}</div>
// //                   <div className="course-list-title">{course.title}</div>
// //                   <div className="course-list-meta">
// //                     {course.category?.name || catName}
// //                     {course.duration ? ` · ${course.duration}` : ''}
// //                     {course.price != null && <> · <span style={{ color: '#C0392B', fontWeight: 700 }}>₹{course.price}</span></>}
// //                   </div>
// //                   {course.enrolledStudents !== undefined && (
// //                     <div className="course-list-enrolled">{course.enrolledStudents} students enrolled</div>
// //                   )}
// //                 </div>

// //                 {/* Actions */}
// //                 <div className="course-list-actions">
// //                   <span className={`status-pill ${course.isActive !== false ? 'status-active' : 'status-inactive'}`}>
// //                     {course.isActive !== false ? 'Active' : 'Inactive'}
// //                   </span>
// //                   <button className="action-icon-btn action-schedule" title="Manage Dates" onClick={() => setSchedCourse(course)}><CalendarIcon/></button>
// //                   <button className="action-icon-btn action-edit" title="Edit Course" onClick={() => { setEditCourse(course); setCModal(true) }}><EditIcon/></button>
// //                   <button className="action-icon-btn action-delete" title="Delete Course" onClick={() => handleDelete(course._id)}><TrashIcon/></button>
// //                   <Toggle active={course.isActive !== false} onChange={() => handleToggleStatus(course._id)}/>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         ))
// //       )}

// //       {/* Modals */}
// //       {showCatModal && <CategoryModal categories={categories} onClose={() => setCatModal(false)} onRefresh={loadAll}/>}
// //       {showCourseModal && <CourseModal course={editCourse} categories={categories} onClose={() => { setCModal(false); setEditCourse(null) }} onSaved={loadAll}/>}
// //       {schedCourse && <ScheduleModal course={schedCourse} onClose={() => setSchedCourse(null)}/>}
// //     </div>
// //   )
// // }

// // export default AdminCourses

// import { useEffect, useState, useCallback, useRef } from 'react'
// import {
//   getCourses, createCourse, updateCourse, deleteCourse, toggleCourseStatus,
//   getCategories, createCategory, updateCategory, deleteCategory,
//   getSchedulesByCourse, createSchedule, createBulkSchedules,
//   updateSchedule, deleteSchedule, toggleScheduleStatus,
// } from '../../services/adminService'
// import API from '../../services/api'

// const SESSION_TYPES = ['General', 'Theory', 'Practical', 'Exam']
// const LOCATIONS     = ['Online', 'Face to Face']
// const DAYS_OF_WEEK  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// const fmtDate = iso => {
//   if (!iso) return ''
//   return new Date(iso).toLocaleDateString('en-AU', {
//     weekday: 'short', day: '2-digit', month: 'long', year: 'numeric',
//   })
// }

// // ── SVG Icons ─────────────────────────────────────────────────
// const CalendarIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
//     <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
//     <line x1="3" y1="10" x2="21" y2="10"/>
//   </svg>
// )
// const EditIcon = () => (
//   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
//     <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
//   </svg>
// )
// const TrashIcon = () => (
//   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <polyline points="3 6 5 6 21 6"/>
//     <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
//     <path d="M10 11v6"/><path d="M14 11v6"/>
//     <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
//   </svg>
// )
// const DragIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
//     <circle cx="9"  cy="5"  r="1.5"/><circle cx="15" cy="5"  r="1.5"/>
//     <circle cx="9"  cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
//     <circle cx="9"  cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
//   </svg>
// )

// const Toggle = ({ active, onChange }) => (
//   <button className={`toggle-btn ${active ? 'toggle-on' : 'toggle-off'}`} onClick={onChange}
//     title={active ? 'Active — click to deactivate' : 'Inactive — click to activate'}>
//     <span className="toggle-thumb"/>
//   </button>
// )

// const TableSkeleton = ({ cols, rows = 4 }) => (
//   <tbody>
//     {Array.from({ length: rows }, (_, i) => (
//       <tr key={i}>{Array.from({ length: cols }, (_, j) => (
//         <td key={j}><div className="skeleton-cell"/></td>
//       ))}</tr>
//     ))}
//   </tbody>
// )

// // Shared field wrapper — ensures consistent label + input styling everywhere
// const Field = ({ label, children, hint, className = '' }) => (
//   <div className={`cm-field ${className}`}>
//     {label && <label className="cm-label">{label}</label>}
//     {children}
//     {hint && <p className="cm-hint">{hint}</p>}
//   </div>
// )

// // ══════════════════════════════════════════════════════════════
// // SCHEDULE MODAL
// // ══════════════════════════════════════════════════════════════
// const ScheduleModal = ({ course, onClose }) => {
//   const [schedules, setSchedules]   = useState([])
//   const [loading, setLoading]       = useState(true)
//   const [saving, setSaving]         = useState(false)
//   const [filterType, setFilterType] = useState('All')
//   const [editSession, setEdit]      = useState(null)
//   const [isBulk, setIsBulk]        = useState(false)
//   const [formError, setFormError]   = useState('')

//   const emptyForm = { date:'', sessionType:'General', startTime:'', endTime:'', location:'', activeSlots:'', teacherSearch:'' }
//   const emptyBulk = { startDate:'', endDate:'', selectedDays:[], sessionType:'General', startTime:'', endTime:'', location:'', activeSlots:'', teacherSearch:'' }
//   const [form, setForm]         = useState(emptyForm)
//   const [bulkForm, setBulkForm] = useState(emptyBulk)

//   const load = useCallback(async () => {
//     setLoading(true)
//     try {
//       const { data } = await getSchedulesByCourse(course._id)
//       setSchedules(data.schedules || data.data || [])
//     } catch (e) { console.error(e); setSchedules([]) }
//     finally { setLoading(false) }
//   }, [course._id])

//   useEffect(() => { load() }, [load])

//   const toggleDay = idx => setBulkForm(f => ({
//     ...f,
//     selectedDays: f.selectedDays.includes(idx)
//       ? f.selectedDays.filter(d => d !== idx)
//       : [...f.selectedDays, idx],
//   }))

//   const generateDates = (start, end, days) => {
//     const result = []; const cur = new Date(start); const e = new Date(end)
//     while (cur <= e) {
//       if (days.includes(cur.getDay())) result.push(cur.toISOString().substring(0, 10))
//       cur.setDate(cur.getDate() + 1)
//     }
//     return result
//   }

//   const handleAddSingle = async () => {
//     setFormError('')
//     if (!form.date)        { setFormError('Date is required.'); return }
//     if (!form.startTime)   { setFormError('Start Time is required.'); return }
//     if (!form.endTime)     { setFormError('End Time is required.'); return }
//     if (!form.activeSlots) { setFormError('Active Slots is required.'); return }
//     setSaving(true)
//     try {
//       await createSchedule({ courseId: course._id, date: form.date, sessionType: form.sessionType, startTime: form.startTime, endTime: form.endTime, location: form.location, activeSlots: Number(form.activeSlots), teacher: form.teacherSearch || undefined })
//       setForm(emptyForm); load()
//     } catch (e) { console.error(e); setFormError('Failed to add date.') }
//     finally { setSaving(false) }
//   }

//   const handleAddBulk = async () => {
//     setFormError('')
//     if (!bulkForm.startDate)           { setFormError('Start Date is required.'); return }
//     if (!bulkForm.endDate)             { setFormError('End Date is required.'); return }
//     if (!bulkForm.selectedDays.length) { setFormError('Select at least one day.'); return }
//     if (!bulkForm.startTime)           { setFormError('Start Time is required.'); return }
//     if (!bulkForm.endTime)             { setFormError('End Time is required.'); return }
//     if (!bulkForm.activeSlots)         { setFormError('Active Slots is required.'); return }
//     if (new Date(bulkForm.endDate) < new Date(bulkForm.startDate)) { setFormError('End Date must be after Start Date.'); return }
//     const dates = generateDates(bulkForm.startDate, bulkForm.endDate, bulkForm.selectedDays)
//     if (!dates.length) { setFormError('No matching dates found.'); return }
//     setSaving(true)
//     try {
//       await createBulkSchedules({ courseId: course._id, dates, sessionType: bulkForm.sessionType, startTime: bulkForm.startTime, endTime: bulkForm.endTime, location: bulkForm.location, activeSlots: Number(bulkForm.activeSlots), teacher: bulkForm.teacherSearch || undefined })
//       setBulkForm(emptyBulk); setIsBulk(false); load()
//     } catch (e) { console.error(e); setFormError('Failed to add bulk dates.') }
//     finally { setSaving(false) }
//   }

//   const handleToggle  = async id => { try { await toggleScheduleStatus(id); load() } catch (e) { console.error(e) } }
//   const handleDelete  = async id => { if (!window.confirm('Delete this session?')) return; try { await deleteSchedule(id); load() } catch (e) { console.error(e) } }
//   const handleEditSave = async () => {
//     if (!editSession) return
//     try { await updateSchedule(editSession._id, { startTime: editSession.startTime, endTime: editSession.endTime, activeSlots: Number(editSession.activeSlots) }); setEdit(null); load() }
//     catch (e) { console.error(e) }
//   }

//   const grouped = schedules
//     .filter(s => filterType === 'All' || s.sessionType === filterType)
//     .reduce((acc, s) => { const d = s.date?.substring(0, 10) || 'Unknown'; if (!acc[d]) acc[d] = []; acc[d].push(s); return acc }, {})

//   const bulkPreviewCount = bulkForm.startDate && bulkForm.endDate && bulkForm.selectedDays.length
//     ? generateDates(bulkForm.startDate, bulkForm.endDate, bulkForm.selectedDays).length : 0

//   return (
//     <div className="modal-backdrop" onClick={e => e.stopPropagation()}>
//       <div className="schedule-modal">
//         <div className="sched-modal-head">
//           <div><h2>Manage Course Dates</h2><p className="sched-course-name">{course.title}</p></div>
//           <button className="modal-close-btn" onClick={onClose}>✕</button>
//         </div>

//         <div className="sched-modal-body">
//           <div className="add-date-section">
//             <div className="add-date-header">
//               <span className="add-date-title">+ Add New Date</span>
//               <label className="bulk-check">
//                 <input type="checkbox" checked={isBulk} onChange={e => { setIsBulk(e.target.checked); setFormError('') }}/>
//                 Bulk Upload
//               </label>
//             </div>

//             {/* Single date form */}
//             {!isBulk && (
//               <>
//                 <div className="sched-form-grid">
//                   <div className="sched-field"><label>Date *</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}/></div>
//                   <div className="sched-field"><label>Session Type</label><select value={form.sessionType} onChange={e => setForm(f => ({ ...f, sessionType: e.target.value }))}>{SESSION_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
//                   <div className="sched-field"><label>Start Time</label><input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}/></div>
//                   <div className="sched-field"><label>End Time</label><input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}/></div>
//                   <div className="sched-field"><label>Location (Optional)</label><select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}><option value="">Select</option>{LOCATIONS.map(l => <option key={l}>{l}</option>)}</select></div>
//                   <div className="sched-field"><label>Active Slots *</label><input type="number" min="1" value={form.activeSlots} placeholder="e.g., 20" onChange={e => setForm(f => ({ ...f, activeSlots: e.target.value }))}/></div>
//                 </div>
//                 <div className="sched-field" style={{ marginTop: 12 }}>
//                   <label>🎓 Assign Teacher (Optional)</label>
//                   <input value={form.teacherSearch} onChange={e => setForm(f => ({ ...f, teacherSearch: e.target.value }))} placeholder="Search teachers by name or email…"/>
//                   <p className="field-hint">Search and select a teacher to conduct this session</p>
//                 </div>
//                 {formError && <p className="sched-form-error">{formError}</p>}
//                 <button className="red-btn" style={{ marginTop: 14 }} onClick={handleAddSingle} disabled={saving}>{saving ? 'Adding…' : '+ Add Date'}</button>
//               </>
//             )}

//             {/* Bulk upload form */}
//             {isBulk && (
//               <>
//                 <div className="sched-form-grid">
//                   <div className="sched-field"><label>Start Date *</label><input type="date" value={bulkForm.startDate} onChange={e => setBulkForm(f => ({ ...f, startDate: e.target.value }))}/></div>
//                   <div className="sched-field"><label>End Date *</label><input type="date" value={bulkForm.endDate} onChange={e => setBulkForm(f => ({ ...f, endDate: e.target.value }))}/></div>
//                 </div>
//                 <div className="bulk-days-section">
//                   <label className="sched-field-label">Select Days of the Week *</label>
//                   <div className="bulk-days-row">
//                     {DAYS_OF_WEEK.map((d, idx) => (
//                       <button key={d} type="button" className={`day-pill${bulkForm.selectedDays.includes(idx) ? ' day-pill--on' : ''}`} onClick={() => toggleDay(idx)}>{d}</button>
//                     ))}
//                   </div>
//                   <p className="field-hint">Select the days on which sessions should be scheduled</p>
//                 </div>
//                 <div className="sched-form-grid" style={{ marginTop: 12 }}>
//                   <div className="sched-field"><label>Session Type *</label><select value={bulkForm.sessionType} onChange={e => setBulkForm(f => ({ ...f, sessionType: e.target.value }))}>{SESSION_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
//                   <div className="sched-field"/>
//                   <div className="sched-field"><label>Start Time</label><input type="time" value={bulkForm.startTime} onChange={e => setBulkForm(f => ({ ...f, startTime: e.target.value }))}/></div>
//                   <div className="sched-field"><label>End Time</label><input type="time" value={bulkForm.endTime} onChange={e => setBulkForm(f => ({ ...f, endTime: e.target.value }))}/></div>
//                   <div className="sched-field"><label>Location (Optional)</label><select value={bulkForm.location} onChange={e => setBulkForm(f => ({ ...f, location: e.target.value }))}><option value="">Select</option>{LOCATIONS.map(l => <option key={l}>{l}</option>)}</select></div>
//                   <div className="sched-field"><label>Active Slots *</label><input type="number" min="1" value={bulkForm.activeSlots} placeholder="e.g., 20" onChange={e => setBulkForm(f => ({ ...f, activeSlots: e.target.value }))}/></div>
//                 </div>
//                 <div className="sched-field" style={{ marginTop: 12 }}>
//                   <label>🎓 Assign Teacher (Optional)</label>
//                   <input value={bulkForm.teacherSearch} onChange={e => setBulkForm(f => ({ ...f, teacherSearch: e.target.value }))} placeholder="Search teachers by name or email…"/>
//                   <p className="field-hint">Search and select a teacher to conduct this session</p>
//                 </div>
//                 {bulkPreviewCount > 0 && <p className="bulk-preview-count">📅 {bulkPreviewCount} session{bulkPreviewCount > 1 ? 's' : ''} will be created</p>}
//                 {formError && <p className="sched-form-error">{formError}</p>}
//                 <button className="red-btn" style={{ marginTop: 14 }} onClick={handleAddBulk} disabled={saving}>{saving ? 'Creating…' : '+ Add Bulk Dates'}</button>
//               </>
//             )}
//           </div>

//           <div className="sched-list-section">
//             <div className="sched-list-header">
//               <strong>Scheduled Dates ({schedules.length})</strong>
//               <div className="sched-filter-tabs">
//                 {['All', ...SESSION_TYPES].map(t => (
//                   <button key={t} className={`sched-filter-tab${filterType === t ? ' active' : ''}`} onClick={() => setFilterType(t)}>{t}</button>
//                 ))}
//               </div>
//             </div>
//             {loading ? <p className="loading-text">Loading schedules…</p>
//               : Object.keys(grouped).length === 0
//                 ? <p style={{ padding: '24px 0', color: '#888', textAlign: 'center', fontSize: 13 }}>No sessions scheduled yet.</p>
//                 : Object.keys(grouped).sort().map(date => (
//                   <div key={date} className="sched-date-group">
//                     <div className="sched-date-row">
//                       <strong>{fmtDate(date)}</strong>
//                       <span className="sched-session-count">{grouped[date].length} session{grouped[date].length > 1 ? 's' : ''} available</span>
//                       <button className="add-slot-btn">+ Add slot</button>
//                     </div>
//                     {grouped[date].map(s => (
//                       <div key={s._id} className="sched-slot-row">
//                         <span className={`session-type-badge type-${(s.sessionType || 'general').toLowerCase()}`}>{s.sessionType || 'General'}</span>
//                         <span className="sched-time">🕐 {s.startTime} - {s.endTime}</span>
//                         <span className="sched-slots">{s.activeSlots}<br/><span className="sched-slots-label">Active slots</span></span>
//                         <button className="sched-edit-btn" onClick={() => setEdit({ ...s })}>Edit</button>
//                         <Toggle active={s.isActive !== false} onChange={() => handleToggle(s._id)}/>
//                         <span className={`status-pill ${s.isActive !== false ? 'status-active' : 'status-inactive'}`}>{s.isActive !== false ? 'Active' : 'Inactive'}</span>
//                         <button className="sched-delete-btn" title="Delete session" onClick={() => handleDelete(s._id)}><TrashIcon/></button>
//                       </div>
//                     ))}
//                   </div>
//                 ))
//             }
//           </div>
//         </div>

//         <div className="modal-footer">
//           <button className="cancel-btn" onClick={onClose}>Close</button>
//         </div>
//       </div>

//       {editSession && (
//         <div className="modal-backdrop inner-backdrop" onClick={e => e.stopPropagation()}>
//           <div className="modal edit-session-modal">
//             <div className="modal-top">
//               <div><h2>Edit Session</h2><p className="page-sub">Update the start/end time and capacity for this session.</p></div>
//               <button className="modal-close-btn" onClick={() => setEdit(null)}>✕</button>
//             </div>
//             <div className="edit-session-body">
//               <p className="edit-date-label">Date</p>
//               <p className="edit-date-val">{fmtDate(editSession.date)}</p>
//               <div className="sched-form-grid" style={{ marginTop: 16 }}>
//                 <div className="sched-field"><label>Start Time</label><input type="time" value={editSession.startTime} onChange={e => setEdit(s => ({ ...s, startTime: e.target.value }))}/></div>
//                 <div className="sched-field"><label>End Time</label><input type="time" value={editSession.endTime} onChange={e => setEdit(s => ({ ...s, endTime: e.target.value }))}/></div>
//               </div>
//               <div className="sched-field" style={{ marginTop: 12 }}><label>Active Slots</label><input type="number" value={editSession.activeSlots} onChange={e => setEdit(s => ({ ...s, activeSlots: e.target.value }))}/></div>
//             </div>
//             <div className="modal-footer">
//               <button className="cancel-btn" onClick={() => setEdit(null)}>Cancel</button>
//               <button className="red-btn" onClick={handleEditSave}>Save Changes</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// // ══════════════════════════════════════════════════════════════
// // CATEGORY MODAL — drag reorder + edit + delete
// // ══════════════════════════════════════════════════════════════
// const CategoryModal = ({ onClose, categories: initCats, onRefresh }) => {
//   const [cats, setCats]         = useState(initCats)
//   const [name, setName]         = useState('')
//   const [img, setImg]           = useState(null)
//   const [editId, setEditId]     = useState(null)
//   const [editName, setEditName] = useState('')
//   const [editImg, setEditImg]   = useState(null)
//   const [saving, setSaving]     = useState(false)

//   useEffect(() => { setCats(initCats) }, [initCats])

//   // ── Drag state ──
//   const dragIdx = useRef(null)
//   const overIdx = useRef(null)

//   const onDragStart = idx => { dragIdx.current = idx }
//   const onDragEnter = idx => { overIdx.current = idx }
//   const onDragEnd   = async () => {
//     const from = dragIdx.current
//     const to   = overIdx.current
//     if (from === null || to === null || from === to) { dragIdx.current = null; overIdx.current = null; return }

//     const updated = [...cats]
//     const [moved] = updated.splice(from, 1)
//     updated.splice(to, 0, moved)
//     dragIdx.current = null; overIdx.current = null
//     setCats(updated)

//     // Persist new order to backend
//     try {
//       await API.post('/categories/reorder', { orderedIds: updated.map(c => c._id) })
//     } catch (e) { console.error('reorder failed', e) }
//   }

//   const handleAdd = async () => {
//     if (!name.trim()) return
//     setSaving(true)
//     try {
//       const fd = new FormData(); fd.append('name', name); if (img) fd.append('image', img)
//       await createCategory(fd); setName(''); setImg(null); onRefresh()
//     } catch (e) { console.error(e) }
//     finally { setSaving(false) }
//   }

//   const handleEditSave = async id => {
//     if (!editName.trim()) return
//     setSaving(true)
//     try {
//       const fd = new FormData(); fd.append('name', editName); if (editImg) fd.append('image', editImg)
//       await updateCategory(id, fd); setEditId(null); setEditName(''); setEditImg(null); onRefresh()
//     } catch (e) { console.error(e) }
//     finally { setSaving(false) }
//   }

//   const handleDelete = async id => {
//     if (!window.confirm('Delete this category? All courses in it will be uncategorised.')) return
//     try { await deleteCategory(id); onRefresh() } catch (e) { console.error(e) }
//   }

//   return (
//     <div className="modal-backdrop" onClick={e => e.stopPropagation()}>
//       <div className="modal cat-modal">
//         <div className="modal-top">
//           <div><h2>Manage Course Categories</h2><p className="page-sub">Add, edit, or remove course categories</p></div>
//           <button className="modal-close-btn" onClick={onClose}>✕</button>
//         </div>

//         <div className="cat-add-row">
//           <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter new category name"
//             style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && handleAdd()}/>
//           <button className="red-btn" onClick={handleAdd} disabled={saving}>+ Add</button>
//         </div>
//         <div className="cat-img-upload">
//           <span className="upload-tab active">Upload</span>
//           <label className="choose-img-btn">
//             <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setImg(e.target.files[0])}/>
//             📤 {img ? img.name : 'Choose image'}
//           </label>
//         </div>

//         <div className="cat-list">
//           {cats.length === 0
//             ? <p className="empty-row">No categories yet.</p>
//             : cats.map((cat, idx) => (
//               <div
//                 key={cat._id}
//                 className="cat-list-row"
//                 draggable
//                 onDragStart={() => onDragStart(idx)}
//                 onDragEnter={() => onDragEnter(idx)}
//                 onDragEnd={onDragEnd}
//                 onDragOver={e => e.preventDefault()}
//               >
//                 <span className="drag-handle cat-drag-handle" title="Drag to reorder"><DragIcon/></span>

//                 {cat.image
//                   ? <img src={cat.image} alt={cat.name} className="cat-thumb"/>
//                   : <div className="cat-thumb-placeholder">📷</div>
//                 }

//                 {editId === cat._id ? (
//                   <div className="cat-edit-row">
//                     <input value={editName} onChange={e => setEditName(e.target.value)}
//                       className="cat-edit-input" autoFocus
//                       onKeyDown={e => { if (e.key === 'Enter') handleEditSave(cat._id); if (e.key === 'Escape') { setEditId(null); setEditName('') } }}/>
//                     <label className="cat-edit-img-btn">
//                       <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setEditImg(e.target.files[0])}/>
//                       📤 {editImg ? editImg.name : 'Change image'}
//                     </label>
//                     <button className="red-btn" style={{ padding: '5px 12px', fontSize: 12 }}
//                       onClick={() => handleEditSave(cat._id)} disabled={saving}>Save</button>
//                     <button className="cancel-btn" style={{ padding: '5px 12px', fontSize: 12 }}
//                       onClick={() => { setEditId(null); setEditName(''); setEditImg(null) }}>✕</button>
//                   </div>
//                 ) : (
//                   <>
//                     <span className="cat-name">{cat.name}</span>
//                     <span className="cat-course-count">{cat.courseCount ?? 0} courses</span>
//                     <button className="icon-action-btn action-edit" title="Edit category"
//                       onClick={() => { setEditId(cat._id); setEditName(cat.name); setEditImg(null) }}>
//                       <EditIcon/>
//                     </button>
//                     <button className="icon-action-btn danger" title="Delete category" onClick={() => handleDelete(cat._id)}>
//                       <TrashIcon/>
//                     </button>
//                   </>
//                 )}
//               </div>
//             ))
//           }
//         </div>
//         <p className="cat-footer-note">Total Categories: {cats.length} • Drag to reorder (order appears on front page)</p>
//       </div>
//     </div>
//   )
// }

// // ══════════════════════════════════════════════════════════════
// // COURSE MODAL — consistent styling on both tabs
// // ══════════════════════════════════════════════════════════════
// const CourseModal = ({ course, categories, onClose, onSaved }) => {
//   const isEdit = !!course
//   const [form, setForm] = useState({
//     title: course?.title || '', description: course?.description || '',
//     category: course?.category?._id || course?.category || '',
//     instructor: course?.instructor || '', price: course?.price || '',
//     courseType: course?.courseType || 'single', comboEnabled: course?.comboEnabled || false,
//     comboPrice: course?.comboPrice || '', comboDescription: course?.comboDescription || '',
//     comboDuration: course?.comboDuration || '', urlSlug: course?.urlSlug || '',
//     duration: course?.duration || '', certificateValidity: course?.certificateValidity || '',
//     pricingType: course?.pricingType || 'Standard',
//   })
//   const [thumbnail, setThumb]     = useState(null)
//   const [activeTab, setActiveTab] = useState('course')
//   const [saving, setSaving]       = useState(false)
//   const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

//   const handleSave = async () => {
//     if (!form.title?.trim()) { alert('Course title is required.'); return }
//     setSaving(true)
//     try {
//       const fd = new FormData()
//       Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v) })
//       if (thumbnail) fd.append('thumbnail', thumbnail)
//       if (isEdit) await updateCourse(course._id, fd)
//       else        await createCourse(fd)
//       onSaved(); onClose()
//     } catch (e) { console.error(e); alert('Failed to save course.') }
//     finally { setSaving(false) }
//   }

//   return (
//     <div className="modal-backdrop" onClick={e => e.stopPropagation()}>
//       <div className="course-modal-full">
//         <div className="modal-top" style={{ padding: '20px 28px 0' }}>
//           <h2>{isEdit ? 'Edit Course' : 'Create New Course'}</h2>
//           <button className="modal-close-btn" onClick={onClose}>✕</button>
//         </div>

//         <div className="course-tabs">
//           <button className={activeTab === 'course' ? 'tab-btn active' : 'tab-btn'}
//             onClick={() => { setActiveTab('course'); setF('courseType', 'single'); setF('comboEnabled', false) }}>
//             Course Details
//           </button>
//           <button className={activeTab === 'combo' ? 'tab-btn active' : 'tab-btn'}
//             onClick={() => { setActiveTab('combo'); setF('courseType', 'combo'); setF('comboEnabled', true) }}>
//             Combo Package
//           </button>
//         </div>

//         <div className="course-content">

//           {/* ── Course Details Tab ── */}
//           {activeTab === 'course' && (
//             <div className="course-form-grid">
//               <Field label="Select Category *" className="span-2">
//                 <select className="cm-input" value={form.category} onChange={e => setF('category', e.target.value)}>
//                   <option value="">Select Category</option>
//                   {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
//                 </select>
//               </Field>

//               <Field label="Course Title *">
//                 <input className="cm-input" value={form.title} onChange={e => setF('title', e.target.value)} placeholder="e.g., Work Safely at Heights"/>
//               </Field>
//               <Field label="Course Code / URL Slug" hint={`Page URL: /course/${form.urlSlug || 'your-slug'}`}>
//                 <input className="cm-input" value={form.urlSlug} onChange={e => setF('urlSlug', e.target.value)} placeholder="e.g., forklift-licence"/>
//               </Field>

//               <Field label="Instructor">
//                 <input className="cm-input" value={form.instructor} onChange={e => setF('instructor', e.target.value)} placeholder="Instructor Name"/>
//               </Field>
//               <Field label="Course Price (₹)">
//                 <input className="cm-input" type="number" value={form.price} onChange={e => setF('price', e.target.value)} placeholder="0"/>
//               </Field>

//               <Field label="Duration">
//                 <input className="cm-input" value={form.duration} onChange={e => setF('duration', e.target.value)} placeholder="e.g., 1 Day Course"/>
//               </Field>
//               <Field label="Certificate Validity">
//                 <input className="cm-input" value={form.certificateValidity} onChange={e => setF('certificateValidity', e.target.value)} placeholder="e.g., 3 years"/>
//               </Field>

//               <Field label="Pricing Type" className="span-2">
//                 <div className="pricing-type-row">
//                   {['Standard', 'Experience-Based', 'SL or BL'].map(t => (
//                     <label key={t} className={`pricing-radio ${form.pricingType === t ? 'selected' : ''}`}>
//                       <input type="radio" name="pricingType" value={t} checked={form.pricingType === t} onChange={() => setF('pricingType', t)}/>{t}
//                     </label>
//                   ))}
//                 </div>
//               </Field>

//               <Field label="Description" className="span-2">
//                 <textarea className="cm-input" rows="3" value={form.description}
//                   onChange={e => setF('description', e.target.value)} placeholder="Course Description" style={{ resize: 'vertical' }}/>
//               </Field>

//               <Field label="Course Thumbnail" className="span-2">
//                 <input className="cm-input" type="file" accept="image/*"
//                   onChange={e => setThumb(e.target.files[0])} style={{ padding: '6px 10px' }}/>
//                 {(thumbnail || course?.thumbnail) && (
//                   <img className="thumb-preview"
//                     src={thumbnail ? URL.createObjectURL(thumbnail) : course.thumbnail} alt="preview"/>
//                 )}
//               </Field>
//             </div>
//           )}

//           {/* ── Combo Package Tab — identical input styling ── */}
//           {activeTab === 'combo' && (
//             <div className="course-form-grid">
//               <Field className="span-2" label="">
//                 <label className="combo-check">
//                   <input type="checkbox" checked={form.comboEnabled} onChange={e => setF('comboEnabled', e.target.checked)}/>
//                   Enable Combo Package Offer
//                 </label>
//               </Field>

//               {form.comboEnabled && (
//                 <>
//                   <Field label="Combo Description" className="span-2">
//                     <input className="cm-input" value={form.comboDescription}
//                       onChange={e => setF('comboDescription', e.target.value)} placeholder="Describe combo package"/>
//                   </Field>

//                   <Field label="Combo Price (₹)">
//                     <input className="cm-input" type="number" value={form.comboPrice}
//                       onChange={e => setF('comboPrice', e.target.value)} placeholder="78"/>
//                   </Field>

//                   <Field label="Combo Duration (days)">
//                     <input className="cm-input" type="number" value={form.comboDuration}
//                       onChange={e => setF('comboDuration', e.target.value)} placeholder="1"/>
//                   </Field>

//                   <div className="span-2">
//                     <div className="combo-preview">
//                       <h3>Combo Preview</h3>
//                       <p><strong>Package:</strong> {form.comboDescription || '—'}</p>
//                       <p><strong>Price:</strong> ₹{form.comboPrice || '0'}</p>
//                       <p><strong>Duration:</strong> {form.comboDuration || '0'} days</p>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           )}
//         </div>

//         <div className="modal-footer">
//           <button className="cancel-btn" onClick={onClose}>Cancel</button>
//           <button className="red-btn" onClick={handleSave} disabled={saving}>
//             {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Course'}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ══════════════════════════════════════════════════════════════
// // MAIN AdminCourses PAGE
// // Course drag fix: track by _id, not by index in filtered/grouped
// // ══════════════════════════════════════════════════════════════
// const AdminCourses = () => {
//   const [courses, setCourses]         = useState([])
//   const [categories, setCategories]   = useState([])
//   const [loading, setLoading]         = useState(true)
//   const [search, setSearch]           = useState('')
//   const [statusFilter, setStatus]     = useState('All Status')
//   const [showCatModal, setCatModal]   = useState(false)
//   const [showCourseModal, setCModal]  = useState(false)
//   const [editCourse, setEditCourse]   = useState(null)
//   const [schedCourse, setSchedCourse] = useState(null)

//   // Drag state tracked by course _id (not fragile index)
//   const dragId   = useRef(null)   // _id of dragged course
//   const dragCat  = useRef(null)   // category group it belongs to
//   const overId   = useRef(null)   // _id of the course being hovered over

//   const loadAll = useCallback(async () => {
//     setLoading(true)
//     try {
//       const [cRes, catRes] = await Promise.all([getCourses(), getCategories()])
//       setCourses(cRes.data.courses || [])
//       setCategories(catRes.data.categories || [])
//     } catch (e) { console.error(e) }
//     finally { setLoading(false) }
//   }, [])

//   useEffect(() => { loadAll() }, [loadAll])

//   const handleToggleStatus = async id => { try { await toggleCourseStatus(id); loadAll() } catch (e) { console.error(e) } }
//   const handleDelete = async id => {
//     if (!window.confirm('Delete this course? This cannot be undone.')) return
//     try { await deleteCourse(id); loadAll() } catch (e) { console.error(e) }
//   }

//   // ── Course drag handlers — use _id to find positions ──────
//   const onCourseDragStart = (id, catName) => {
//     dragId.current  = id
//     dragCat.current = catName
//   }
//   const onCourseDragEnter = id => {
//     overId.current = id
//   }
//   const onCourseDragEnd = async () => {
//     const fromId  = dragId.current
//     const toId    = overId.current
//     const catName = dragCat.current

//     dragId.current = null; dragCat.current = null; overId.current = null

//     if (!fromId || !toId || fromId === toId) return

//     let reorderedAll = []
//     setCourses(prev => {
//       const inCat  = prev.filter(c => (c.category?.name || 'Uncategorised') === catName)
//       const others = prev.filter(c => (c.category?.name || 'Uncategorised') !== catName)

//       const fromIdx = inCat.findIndex(c => c._id === fromId)
//       const toIdx   = inCat.findIndex(c => c._id === toId)
//       if (fromIdx === -1 || toIdx === -1) return prev

//       const reordered = [...inCat]
//       const [moved]   = reordered.splice(fromIdx, 1)
//       reordered.splice(toIdx, 0, moved)

//       reorderedAll = [...others, ...reordered]
//       return reorderedAll
//     })

//     // Persist new order to backend
//     try {
//       await API.post('/courses/reorder', { orderedIds: reorderedAll.map(c => c._id) })
//     } catch (e) { console.error('course reorder failed', e) }
//   }

//   // ── Filter + group ────────────────────────────────────────
//   const filtered = courses.filter(c => {
//     const q = search.toLowerCase()
//     const matchSearch = !search || c.title?.toLowerCase().includes(q) || (c.code || c.urlSlug || '').toLowerCase().includes(q)
//     const matchStatus = statusFilter === 'All Status' || (statusFilter === 'Active' ? c.isActive !== false : c.isActive === false)
//     return matchSearch && matchStatus
//   })

//   const grouped = filtered.reduce((acc, c) => {
//     const key = c.category?.name || 'Uncategorised'
//     if (!acc[key]) acc[key] = []
//     acc[key].push(c)
//     return acc
//   }, {})

//   return (
//     <div>
//       {/* Page Header */}
//       <div className="page-header">
//         <div>
//           <h2 className="page-title" style={{ color: '#C0392B' }}>Course Management</h2>
//           <p className="page-sub">Create and manage courses with detailed information</p>
//         </div>
//         <div className="page-header-actions">
//           <button className="outline-btn" onClick={() => setCatModal(true)}>🏷 Manage Categories</button>
//           <button className="red-btn" onClick={() => { setEditCourse(null); setCModal(true) }}>+ Create New Course</button>
//         </div>
//       </div>

//       {/* Search & Filter */}
//       <div className="section-card" style={{ marginBottom: 20 }}>
//         <div style={{ padding: '18px 22px' }}>
//           <p style={{ fontWeight: 600, marginBottom: 4 }}>Search &amp; Filter</p>
//           <p className="page-sub" style={{ marginBottom: 14 }}>Find courses by name or course code</p>
//           <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
//             <input className="search-input" value={search} onChange={e => setSearch(e.target.value)}
//               placeholder="Search courses by name or code…" style={{ flex: 1, minWidth: 200 }}/>
//             <select className="filter-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
//               <option>All Status</option><option>Active</option><option>Inactive</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Course Groups */}
//       {loading ? (
//         <div className="section-card">
//           <table className="admin-table">
//             <thead><tr><th>Code</th><th>Title</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
//             <TableSkeleton cols={6}/>
//           </table>
//         </div>
//       ) : Object.keys(grouped).length === 0 ? (
//         <div className="section-card"><p className="empty-row">No courses found.</p></div>
//       ) : (
//         Object.keys(grouped).sort().map(catName => (
//           <div key={catName} style={{ marginBottom: 28 }}>
//             <h3 className="cat-group-title">{catName}</h3>

//             {grouped[catName].map(course => (
//               <div
//                 key={course._id}
//                 className="course-list-card"
//                 draggable
//                 onDragStart={() => onCourseDragStart(course._id, catName)}
//                 onDragEnter={() => onCourseDragEnter(course._id)}
//                 onDragEnd={onCourseDragEnd}
//                 onDragOver={e => e.preventDefault()}
//               >
//                 {/* Drag handle */}
//                 <div className="course-list-drag" style={{ cursor: 'grab', color: '#bbb' }}>
//                   <DragIcon/>
//                 </div>

//                 {/* Thumbnail */}
//                 {course.thumbnail
//                   ? <img src={course.thumbnail} alt={course.title} className="course-list-thumb"/>
//                   : <div className="course-list-thumb-placeholder">📖</div>
//                 }

//                 {/* Info */}
//                 <div className="course-list-body">
//                   <div className="course-list-code">{course.code || course.urlSlug || '—'}</div>
//                   <div className="course-list-title">{course.title}</div>
//                   <div className="course-list-meta">
//                     {course.category?.name || catName}
//                     {course.duration ? ` · ${course.duration}` : ''}
//                     {course.price != null && <> · <span style={{ color: '#C0392B', fontWeight: 700 }}>₹{course.price}</span></>}
//                   </div>
//                   {course.enrolledStudents !== undefined && (
//                     <div className="course-list-enrolled">{course.enrolledStudents} students enrolled</div>
//                   )}
//                 </div>

//                 {/* Actions */}
//                 <div className="course-list-actions">
//                   <span className={`status-pill ${course.isActive !== false ? 'status-active' : 'status-inactive'}`}>
//                     {course.isActive !== false ? 'Active' : 'Inactive'}
//                   </span>
//                   <button className="action-icon-btn action-schedule" title="Manage Dates" onClick={() => setSchedCourse(course)}><CalendarIcon/></button>
//                   <button className="action-icon-btn action-edit" title="Edit Course" onClick={() => { setEditCourse(course); setCModal(true) }}><EditIcon/></button>
//                   <button className="action-icon-btn action-delete" title="Delete Course" onClick={() => handleDelete(course._id)}><TrashIcon/></button>
//                   <Toggle active={course.isActive !== false} onChange={() => handleToggleStatus(course._id)}/>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ))
//       )}

//       {/* Modals */}
//       {showCatModal && <CategoryModal categories={categories} onClose={() => setCatModal(false)} onRefresh={loadAll}/>}
//       {showCourseModal && <CourseModal course={editCourse} categories={categories} onClose={() => { setCModal(false); setEditCourse(null) }} onSaved={loadAll}/>}
//       {schedCourse && <ScheduleModal course={schedCourse} onClose={() => setSchedCourse(null)}/>}
//     </div>
//   )
// }

// export default AdminCourses

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  getCourses, createCourse, updateCourse, deleteCourse, toggleCourseStatus,
  getCategories, createCategory, updateCategory, deleteCategory,
  getSchedulesByCourse, createSchedule, createBulkSchedules,
  updateSchedule, deleteSchedule, toggleScheduleStatus,
} from '../../services/adminService'
import API from '../../services/api'

const SESSION_TYPES = ['General', 'Theory', 'Practical', 'Exam']
const LOCATIONS     = ['Online', 'Face to Face']
const DAYS_OF_WEEK  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const PRICING_TYPES = ['Standard', 'Experience-Based', 'SL or BL']

const fmtDate = iso => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-AU', {
    weekday: 'short', day: '2-digit', month: 'long', year: 'numeric',
  })
}

// ── SVG Icons ─────────────────────────────────────────────────
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)
const DragIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9"  cy="5"  r="1.5"/><circle cx="15" cy="5"  r="1.5"/>
    <circle cx="9"  cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
    <circle cx="9"  cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
  </svg>
)

const Toggle = ({ active, onChange }) => (
  <button className={`toggle-btn ${active ? 'toggle-on' : 'toggle-off'}`} onClick={onChange}
    title={active ? 'Active — click to deactivate' : 'Inactive — click to activate'}>
    <span className="toggle-thumb"/>
  </button>
)

const TableSkeleton = ({ cols, rows = 4 }) => (
  <tbody>
    {Array.from({ length: rows }, (_, i) => (
      <tr key={i}>{Array.from({ length: cols }, (_, j) => (
        <td key={j}><div className="skeleton-cell"/></td>
      ))}</tr>
    ))}
  </tbody>
)

const Field = ({ label, children, hint, className = '' }) => (
  <div className={`cm-field ${className}`}>
    {label && <label className="cm-label">{label}</label>}
    {children}
    {hint && <p className="cm-hint">{hint}</p>}
  </div>
)

// ══════════════════════════════════════════════════════════════
// SCHEDULE MODAL (unchanged)
// ══════════════════════════════════════════════════════════════
const ScheduleModal = ({ course, onClose }) => {
  const [schedules, setSchedules]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [filterType, setFilterType] = useState('All')
  const [editSession, setEdit]      = useState(null)
  const [isBulk, setIsBulk]        = useState(false)
  const [formError, setFormError]   = useState('')

  const emptyForm = { date:'', sessionType:'General', startTime:'', endTime:'', location:'', activeSlots:'', teacherSearch:'' }
  const emptyBulk = { startDate:'', endDate:'', selectedDays:[], sessionType:'General', startTime:'', endTime:'', location:'', activeSlots:'', teacherSearch:'' }
  const [form, setForm]         = useState(emptyForm)
  const [bulkForm, setBulkForm] = useState(emptyBulk)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getSchedulesByCourse(course._id)
      setSchedules(data.schedules || data.data || [])
    } catch (e) { console.error(e); setSchedules([]) }
    finally { setLoading(false) }
  }, [course._id])

  useEffect(() => { load() }, [load])

  const toggleDay = idx => setBulkForm(f => ({
    ...f,
    selectedDays: f.selectedDays.includes(idx)
      ? f.selectedDays.filter(d => d !== idx)
      : [...f.selectedDays, idx],
  }))

  const generateDates = (start, end, days) => {
    const result = []; const cur = new Date(start); const e = new Date(end)
    while (cur <= e) {
      if (days.includes(cur.getDay())) result.push(cur.toISOString().substring(0, 10))
      cur.setDate(cur.getDate() + 1)
    }
    return result
  }

  const handleAddSingle = async () => {
    setFormError('')
    if (!form.date)        { setFormError('Date is required.'); return }
    if (!form.startTime)   { setFormError('Start Time is required.'); return }
    if (!form.endTime)     { setFormError('End Time is required.'); return }
    if (!form.activeSlots) { setFormError('Active Slots is required.'); return }
    setSaving(true)
    try {
      await createSchedule({ courseId: course._id, date: form.date, sessionType: form.sessionType, startTime: form.startTime, endTime: form.endTime, location: form.location, activeSlots: Number(form.activeSlots), teacher: form.teacherSearch || undefined })
      setForm(emptyForm); load()
    } catch (e) { console.error(e); setFormError('Failed to add date.') }
    finally { setSaving(false) }
  }

  const handleAddBulk = async () => {
    setFormError('')
    if (!bulkForm.startDate)           { setFormError('Start Date is required.'); return }
    if (!bulkForm.endDate)             { setFormError('End Date is required.'); return }
    if (!bulkForm.selectedDays.length) { setFormError('Select at least one day.'); return }
    if (!bulkForm.startTime)           { setFormError('Start Time is required.'); return }
    if (!bulkForm.endTime)             { setFormError('End Time is required.'); return }
    if (!bulkForm.activeSlots)         { setFormError('Active Slots is required.'); return }
    if (new Date(bulkForm.endDate) < new Date(bulkForm.startDate)) { setFormError('End Date must be after Start Date.'); return }
    const dates = generateDates(bulkForm.startDate, bulkForm.endDate, bulkForm.selectedDays)
    if (!dates.length) { setFormError('No matching dates found.'); return }
    setSaving(true)
    try {
      await createBulkSchedules({ courseId: course._id, dates, sessionType: bulkForm.sessionType, startTime: bulkForm.startTime, endTime: bulkForm.endTime, location: bulkForm.location, activeSlots: Number(bulkForm.activeSlots), teacher: bulkForm.teacherSearch || undefined })
      setBulkForm(emptyBulk); setIsBulk(false); load()
    } catch (e) { console.error(e); setFormError('Failed to add bulk dates.') }
    finally { setSaving(false) }
  }

  const handleToggle  = async id => { try { await toggleScheduleStatus(id); load() } catch (e) { console.error(e) } }
  const handleDelete  = async id => { if (!window.confirm('Delete this session?')) return; try { await deleteSchedule(id); load() } catch (e) { console.error(e) } }
  const handleEditSave = async () => {
    if (!editSession) return
    try { await updateSchedule(editSession._id, { startTime: editSession.startTime, endTime: editSession.endTime, activeSlots: Number(editSession.activeSlots) }); setEdit(null); load() }
    catch (e) { console.error(e) }
  }

  const grouped = schedules
    .filter(s => filterType === 'All' || s.sessionType === filterType)
    .reduce((acc, s) => { const d = s.date?.substring(0, 10) || 'Unknown'; if (!acc[d]) acc[d] = []; acc[d].push(s); return acc }, {})

  const bulkPreviewCount = bulkForm.startDate && bulkForm.endDate && bulkForm.selectedDays.length
    ? generateDates(bulkForm.startDate, bulkForm.endDate, bulkForm.selectedDays).length : 0

  return (
    <div className="modal-backdrop" onClick={e => e.stopPropagation()}>
      <div className="schedule-modal">
        <div className="sched-modal-head">
          <div><h2>Manage Course Dates</h2><p className="sched-course-name">{course.title}</p></div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="sched-modal-body">
          <div className="add-date-section">
            <div className="add-date-header">
              <span className="add-date-title">+ Add New Date</span>
              <label className="bulk-check">
                <input type="checkbox" checked={isBulk} onChange={e => { setIsBulk(e.target.checked); setFormError('') }}/>
                Bulk Upload
              </label>
            </div>
            {!isBulk && (
              <>
                <div className="sched-form-grid">
                  <div className="sched-field"><label>Date *</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}/></div>
                  <div className="sched-field"><label>Session Type</label><select value={form.sessionType} onChange={e => setForm(f => ({ ...f, sessionType: e.target.value }))}>{SESSION_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                  <div className="sched-field"><label>Start Time</label><input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}/></div>
                  <div className="sched-field"><label>End Time</label><input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}/></div>
                  <div className="sched-field"><label>Location (Optional)</label><select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}><option value="">Select</option>{LOCATIONS.map(l => <option key={l}>{l}</option>)}</select></div>
                  <div className="sched-field"><label>Active Slots *</label><input type="number" min="1" value={form.activeSlots} placeholder="e.g., 20" onChange={e => setForm(f => ({ ...f, activeSlots: e.target.value }))}/></div>
                </div>
                <div className="sched-field" style={{ marginTop: 12 }}>
                  <label>🎓 Assign Teacher (Optional)</label>
                  <input value={form.teacherSearch} onChange={e => setForm(f => ({ ...f, teacherSearch: e.target.value }))} placeholder="Search teachers by name or email…"/>
                </div>
                {formError && <p className="sched-form-error">{formError}</p>}
                <button className="red-btn" style={{ marginTop: 14 }} onClick={handleAddSingle} disabled={saving}>{saving ? 'Adding…' : '+ Add Date'}</button>
              </>
            )}
            {isBulk && (
              <>
                <div className="sched-form-grid">
                  <div className="sched-field"><label>Start Date *</label><input type="date" value={bulkForm.startDate} onChange={e => setBulkForm(f => ({ ...f, startDate: e.target.value }))}/></div>
                  <div className="sched-field"><label>End Date *</label><input type="date" value={bulkForm.endDate} onChange={e => setBulkForm(f => ({ ...f, endDate: e.target.value }))}/></div>
                </div>
                <div className="bulk-days-section">
                  <label className="sched-field-label">Select Days *</label>
                  <div className="bulk-days-row">
                    {DAYS_OF_WEEK.map((d, idx) => (
                      <button key={d} type="button" className={`day-pill${bulkForm.selectedDays.includes(idx) ? ' day-pill--on' : ''}`} onClick={() => toggleDay(idx)}>{d}</button>
                    ))}
                  </div>
                </div>
                <div className="sched-form-grid" style={{ marginTop: 12 }}>
                  <div className="sched-field"><label>Session Type *</label><select value={bulkForm.sessionType} onChange={e => setBulkForm(f => ({ ...f, sessionType: e.target.value }))}>{SESSION_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                  <div className="sched-field"/>
                  <div className="sched-field"><label>Start Time</label><input type="time" value={bulkForm.startTime} onChange={e => setBulkForm(f => ({ ...f, startTime: e.target.value }))}/></div>
                  <div className="sched-field"><label>End Time</label><input type="time" value={bulkForm.endTime} onChange={e => setBulkForm(f => ({ ...f, endTime: e.target.value }))}/></div>
                  <div className="sched-field"><label>Location (Optional)</label><select value={bulkForm.location} onChange={e => setBulkForm(f => ({ ...f, location: e.target.value }))}><option value="">Select</option>{LOCATIONS.map(l => <option key={l}>{l}</option>)}</select></div>
                  <div className="sched-field"><label>Active Slots *</label><input type="number" min="1" value={bulkForm.activeSlots} onChange={e => setBulkForm(f => ({ ...f, activeSlots: e.target.value }))}/></div>
                </div>
                {bulkPreviewCount > 0 && <p className="bulk-preview-count">📅 {bulkPreviewCount} session{bulkPreviewCount > 1 ? 's' : ''} will be created</p>}
                {formError && <p className="sched-form-error">{formError}</p>}
                <button className="red-btn" style={{ marginTop: 14 }} onClick={handleAddBulk} disabled={saving}>{saving ? 'Creating…' : '+ Add Bulk Dates'}</button>
              </>
            )}
          </div>
          <div className="sched-list-section">
            <div className="sched-list-header">
              <strong>Scheduled Dates ({schedules.length})</strong>
              <div className="sched-filter-tabs">
                {['All', ...SESSION_TYPES].map(t => (
                  <button key={t} className={`sched-filter-tab${filterType === t ? ' active' : ''}`} onClick={() => setFilterType(t)}>{t}</button>
                ))}
              </div>
            </div>
            {loading ? <p className="loading-text">Loading schedules…</p>
              : Object.keys(grouped).length === 0
                ? <p style={{ padding: '24px 0', color: '#888', textAlign: 'center', fontSize: 13 }}>No sessions scheduled yet.</p>
                : Object.keys(grouped).sort().map(date => (
                  <div key={date} className="sched-date-group">
                    <div className="sched-date-row">
                      <strong>{fmtDate(date)}</strong>
                      <span className="sched-session-count">{grouped[date].length} session{grouped[date].length > 1 ? 's' : ''}</span>
                    </div>
                    {grouped[date].map(s => (
                      <div key={s._id} className="sched-slot-row">
                        <span className={`session-type-badge type-${(s.sessionType || 'general').toLowerCase()}`}>{s.sessionType || 'General'}</span>
                        <span className="sched-time">🕐 {s.startTime} - {s.endTime}</span>
                        <span className="sched-slots">{s.activeSlots}<br/><span className="sched-slots-label">slots</span></span>
                        <button className="sched-edit-btn" onClick={() => setEdit({ ...s })}>Edit</button>
                        <Toggle active={s.isActive !== false} onChange={() => handleToggle(s._id)}/>
                        <button className="sched-delete-btn" title="Delete" onClick={() => handleDelete(s._id)}><TrashIcon/></button>
                      </div>
                    ))}
                  </div>
                ))
            }
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Close</button>
        </div>
      </div>
      {editSession && (
        <div className="modal-backdrop inner-backdrop" onClick={e => e.stopPropagation()}>
          <div className="modal edit-session-modal">
            <div className="modal-top">
              <div><h2>Edit Session</h2></div>
              <button className="modal-close-btn" onClick={() => setEdit(null)}>✕</button>
            </div>
            <div className="edit-session-body">
              <p className="edit-date-label">Date: {fmtDate(editSession.date)}</p>
              <div className="sched-form-grid" style={{ marginTop: 16 }}>
                <div className="sched-field"><label>Start Time</label><input type="time" value={editSession.startTime} onChange={e => setEdit(s => ({ ...s, startTime: e.target.value }))}/></div>
                <div className="sched-field"><label>End Time</label><input type="time" value={editSession.endTime} onChange={e => setEdit(s => ({ ...s, endTime: e.target.value }))}/></div>
              </div>
              <div className="sched-field" style={{ marginTop: 12 }}><label>Active Slots</label><input type="number" value={editSession.activeSlots} onChange={e => setEdit(s => ({ ...s, activeSlots: e.target.value }))}/></div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setEdit(null)}>Cancel</button>
              <button className="red-btn" onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// CATEGORY MODAL — drag reorder persists to DB + reflects everywhere
// ══════════════════════════════════════════════════════════════
const CategoryModal = ({ onClose, categories: initCats, onRefresh }) => {
  const [cats, setCats]         = useState([...initCats])
  const [name, setName]         = useState('')
  const [img, setImg]           = useState(null)
  const [editId, setEditId]     = useState(null)
  const [editName, setEditName] = useState('')
  const [editImg, setEditImg]   = useState(null)
  const [saving, setSaving]     = useState(false)
  const [dragOver, setDragOver] = useState(null)

  useEffect(() => { setCats([...initCats]) }, [initCats])

  const dragIdx = useRef(null)
  const overIdx = useRef(null)

  const onDragStart = idx => { dragIdx.current = idx }
  const onDragEnter = idx => { overIdx.current = idx; setDragOver(idx) }
  const onDragLeave = ()  => setDragOver(null)
  const onDragEnd   = async () => {
    const from = dragIdx.current
    const to   = overIdx.current
    setDragOver(null)
    dragIdx.current = null; overIdx.current = null
    if (from === null || to === null || from === to) return

    const updated = [...cats]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    setCats(updated)

    // Persist reorder to backend — reflects in BrowserCourses + Categories section
    try {
      await API.post('/categories/reorder', { orderedIds: updated.map(c => c._id) })
      onRefresh() // reload so everywhere shows new order
    } catch (e) { console.error('reorder failed', e) }
  }

  const handleAdd = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', name)
      if (img) fd.append('image', img)
      await createCategory(fd)
      setName(''); setImg(null); onRefresh()
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const handleEditSave = async id => {
    if (!editName.trim()) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', editName)
      if (editImg) fd.append('image', editImg)
      await updateCategory(id, fd)
      setEditId(null); setEditName(''); setEditImg(null); onRefresh()
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this category? All courses in it will be uncategorised.')) return
    try { await deleteCategory(id); onRefresh() } catch (e) { console.error(e) }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.stopPropagation()}>
      <div className="modal cat-modal">
        <div className="modal-top">
          <div><h2>Manage Course Categories</h2><p className="page-sub">Add, edit, or remove course categories</p></div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="cat-add-row">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter new category name"
            style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && handleAdd()}/>
          <button className="red-btn" onClick={handleAdd} disabled={saving}>+ Add</button>
        </div>
        <div className="cat-img-upload">
          <span className="upload-tab active">Upload</span>
          <label className="choose-img-btn">
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setImg(e.target.files[0])}/>
            📤 {img ? img.name : 'Choose image'}
          </label>
        </div>

        <div className="cat-list">
          {cats.length === 0
            ? <p className="empty-row">No categories yet.</p>
            : cats.map((cat, idx) => (
              <div
                key={cat._id}
                className={`cat-list-row${dragOver === idx ? ' cat-drag-over' : ''}`}
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragEnter={() => onDragEnter(idx)}
                onDragLeave={onDragLeave}
                onDragEnd={onDragEnd}
                onDragOver={e => e.preventDefault()}
              >
                <span className="drag-handle cat-drag-handle" title="Drag to reorder"><DragIcon/></span>
                {cat.image
                  ? <img src={cat.image} alt={cat.name} className="cat-thumb"/>
                  : <div className="cat-thumb-placeholder">📷</div>
                }
                {editId === cat._id ? (
                  <div className="cat-edit-row">
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      className="cat-edit-input" autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleEditSave(cat._id); if (e.key === 'Escape') { setEditId(null); setEditName('') } }}/>
                    <label className="cat-edit-img-btn">
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setEditImg(e.target.files[0])}/>
                      📤 {editImg ? editImg.name : 'Change image'}
                    </label>
                    <button className="red-btn" style={{ padding: '5px 12px', fontSize: 12 }}
                      onClick={() => handleEditSave(cat._id)} disabled={saving}>Save</button>
                    <button className="cancel-btn" style={{ padding: '5px 12px', fontSize: 12 }}
                      onClick={() => { setEditId(null); setEditName(''); setEditImg(null) }}>✕</button>
                  </div>
                ) : (
                  <>
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-course-count">{cat.courseCount ?? 0} courses</span>
                    <button className="icon-action-btn action-edit" title="Edit"
                      onClick={() => { setEditId(cat._id); setEditName(cat.name); setEditImg(null) }}>
                      <EditIcon/>
                    </button>
                    <button className="icon-action-btn danger" title="Delete" onClick={() => handleDelete(cat._id)}>
                      <TrashIcon/>
                    </button>
                  </>
                )}
              </div>
            ))
          }
        </div>
        <p className="cat-footer-note">Total Categories: {cats.length} • Drag to reorder (order appears on front page)</p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// COURSE MODAL — 4 tabs: Basic Info | Details | Requirements | Combo Offer
// ══════════════════════════════════════════════════════════════
const TABS = ['Basic Info', 'Details', 'Requirements', 'Combo Offer']

const CourseModal = ({ course, categories, onClose, onSaved }) => {
  const isEdit = !!course

  const [form, setForm] = useState({
    // Basic Info
    code:                course?.code                || '',
    title:               course?.title               || '',
    category:            course?.category?._id       || course?.category || '',
    urlSlug:             course?.urlSlug             || '',
    pricingType:         course?.pricingType         || 'Standard',
    duration:            course?.duration            || '',
    certificateValidity: course?.certificateValidity || '',
    vocPrice:            course?.vocPrice            ?? 150,
    deliveryMethod:      course?.deliveryMethod      || '',
    location:            course?.location            || '',
    originalPrice:       course?.originalPrice       || '',
    price:               course?.price               || '',

    // Details
    description:         course?.description         || '',
    trainingOverview:    course?.trainingOverview     || '',
    vocationalOutcome:   course?.vocationalOutcome    || '',
    feesAndCharges:      course?.feesAndCharges       || '',
    optionalCharges:     course?.optionalCharges      || '',
    outcomePoint:        course?.outcomePoint         || '',
    metaTitle:           course?.metaTitle            || '',
    metaDescription:     course?.metaDescription      || '',

    // Requirements
    courseRequirement:   course?.courseRequirement    || '',
    codeOfPracticeTitle: course?.codeOfPracticeTitle  || '',

    // Combo Offer
    courseType:          course?.courseType           || 'single',
    comboEnabled:        course?.comboEnabled         || false,
    comboPrice:          course?.comboPrice           || '',
    comboDescription:    course?.comboDescription     || '',
    comboDuration:       course?.comboDuration        || '',

    // instructor kept for compat
    instructor:          course?.instructor           || '',
  })

  const [thumbnail,          setThumb]       = useState(null)
  const [codeOfPracticeFile, setCopFile]     = useState(null)
  const [syllabusFile,       setSyllabusFile]= useState(null)
  const [activeTab,          setActiveTab]   = useState('Basic Info')
  const [saving,             setSaving]      = useState(false)
  const [error,              setError]       = useState('')

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setError('')
    if (!form.title?.trim()) { setError('Course title is required.'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') fd.append(k, v)
      })
      if (thumbnail)          fd.append('thumbnail',          thumbnail)
      if (codeOfPracticeFile) fd.append('codeOfPracticeFile', codeOfPracticeFile)
      if (syllabusFile)       fd.append('syllabusFile',       syllabusFile)

      if (isEdit) await updateCourse(course._id, fd)
      else        await createCourse(fd)
      onSaved(); onClose()
    } catch (e) { console.error(e); setError('Failed to save course. Please try again.') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.stopPropagation()}>
      <div className="course-modal-full">
        <div className="modal-top" style={{ padding: '20px 28px 0' }}>
          <div>
            <h2>{isEdit ? 'Edit Course' : 'Create New Course'}</h2>
            <p className="page-sub">Set up a new course with comprehensive details</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Tab buttons */}
        <div className="course-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`tab-btn${activeTab === t ? ' active' : ''}`}
              onClick={() => setActiveTab(t)}
            >{t}</button>
          ))}
        </div>

        <div className="course-content">

          {/* ══ TAB 1: Basic Info ══ */}
          {activeTab === 'Basic Info' && (
            <div className="course-form-grid">
              <Field label="Course Code (Optional)">
                <input className="cm-input" value={form.code}
                  onChange={e => setF('code', e.target.value)} placeholder="e.g., RIIHAN309F"/>
              </Field>
              <Field label="Course Title (Optional)">
                <input className="cm-input" value={form.title}
                  onChange={e => setF('title', e.target.value)} placeholder="e.g., Conduct Telescopic mate"/>
              </Field>

              <Field label="Category (Optional)">
                <select className="cm-input" value={form.category} onChange={e => setF('category', e.target.value)}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="URL Slug *" hint={`Page URL: /course/${form.urlSlug || 'your-slug'}`}>
                <input className="cm-input" value={form.urlSlug}
                  onChange={e => setF('urlSlug', e.target.value)} placeholder="e.g., forklift-licence"/>
              </Field>

              <Field label="Pricing Type" className="span-2">
                <div className="pricing-type-row">
                  {PRICING_TYPES.map(t => (
                    <label key={t} className={`pricing-radio${form.pricingType === t ? ' selected' : ''}`}>
                      <input type="radio" name="pricingType" value={t}
                        checked={form.pricingType === t} onChange={() => setF('pricingType', t)}/>{t}
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="Duration (Optional)">
                <input className="cm-input" value={form.duration}
                  onChange={e => setF('duration', e.target.value)} placeholder="e.g., 1 Day Course"/>
              </Field>
              <Field label="Certificate Validity (Optional)">
                <input className="cm-input" value={form.certificateValidity}
                  onChange={e => setF('certificateValidity', e.target.value)} placeholder="e.g., 3 years"/>
              </Field>

              <Field label="VOC Price ($)">
                <input className="cm-input" type="number" value={form.vocPrice}
                  onChange={e => setF('vocPrice', e.target.value)} placeholder="150"/>
              </Field>
              <Field label="Delivery Method">
                <input className="cm-input" value={form.deliveryMethod}
                  onChange={e => setF('deliveryMethod', e.target.value)} placeholder="e.g., Online, Classroom"/>
              </Field>

              <Field label="Original Price / Strike Price ($)">
                <input className="cm-input" type="number" value={form.originalPrice}
                  onChange={e => setF('originalPrice', e.target.value)} placeholder="e.g., 1200"/>
              </Field>
              <Field label="Location">
                <input className="cm-input" value={form.location}
                  onChange={e => setF('location', e.target.value)} placeholder="e.g., New York, London"/>
              </Field>

              <Field label="Selling Price ($)">
                <input className="cm-input" type="number" value={form.price}
                  onChange={e => setF('price', e.target.value)} placeholder="e.g., 1050"/>
              </Field>

              <Field label="Course Image">
                <div className="cm-img-btns">
                  <label className="cm-upload-btn">
                    Upload Image
                    <input type="file" accept="image/*" style={{ display:'none' }}
                      onChange={e => setThumb(e.target.files[0])}/>
                  </label>
                  <button type="button" className="cm-url-btn">URL</button>
                </div>
                {thumbnail
                  ? <img className="thumb-preview" src={URL.createObjectURL(thumbnail)} alt="preview"/>
                  : course?.thumbnail
                    ? <img className="thumb-preview" src={course.thumbnail} alt="preview"/>
                    : <div className="cm-file-placeholder">Choose File &nbsp; No file chosen</div>
                }
              </Field>
            </div>
          )}

          {/* ══ TAB 2: Details ══ */}
          {activeTab === 'Details' && (
            <div className="course-form-grid">

              <Field label="Course Description" className="span-2">
                <textarea className="cm-input" rows="3" value={form.description}
                  onChange={e => setF('description', e.target.value)} placeholder="Course Description…"/>
                <button type="button" className="cm-add-field-btn">Add Course Description</button>
              </Field>

              <Field label="Training Overview" className="span-2">
                <textarea className="cm-input" rows="3" value={form.trainingOverview}
                  onChange={e => setF('trainingOverview', e.target.value)} placeholder="Training Overview…"/>
                <button type="button" className="cm-add-field-btn">Add Training Overview</button>
              </Field>

              <Field label="Vocational Outcome" className="span-2">
                <textarea className="cm-input" rows="3" value={form.vocationalOutcome}
                  onChange={e => setF('vocationalOutcome', e.target.value)} placeholder="Vocational Outcome…"/>
                <button type="button" className="cm-add-field-btn">Add Vocational Outcome</button>
              </Field>

              <Field label="Fees and Charges" className="span-2">
                <textarea className="cm-input" rows="2" value={form.feesAndCharges}
                  onChange={e => setF('feesAndCharges', e.target.value)} placeholder="Fees and Charges…"/>
                <button type="button" className="cm-add-field-btn">Add Fees and Charges</button>
              </Field>

              <Field label="Optional Charges" className="span-2">
                <textarea className="cm-input" rows="2" value={form.optionalCharges}
                  onChange={e => setF('optionalCharges', e.target.value)} placeholder="Optional Charges…"/>
                <button type="button" className="cm-add-field-btn">Add Optional Charges</button>
              </Field>

              <Field label="Outcome Point" className="span-2">
                <textarea className="cm-input" rows="2" value={form.outcomePoint}
                  onChange={e => setF('outcomePoint', e.target.value)} placeholder="Outcome Point…"/>
                <button type="button" className="cm-add-field-btn">Add Outcome Point</button>
              </Field>

              <div className="span-2 cm-seo-section">
                <h3 className="cm-seo-title">SEO Settings</h3>
                <Field label="Meta title">
                  <input className="cm-input" value={form.metaTitle}
                    onChange={e => setF('metaTitle', e.target.value)}
                    placeholder="e.g. EWP Licence Over 11m | Boom Lift Course NSW | Safety Training Academy"/>
                  <p className="cm-hint">{form.metaTitle.length} / 60 — Shown as the blue link title in Google search results. Keep under 60 characters.</p>
                </Field>
                <Field label="Meta description">
                  <textarea className="cm-input" rows="3" value={form.metaDescription}
                    onChange={e => setF('metaDescription', e.target.value)}
                    placeholder="e.g. Get your EWP over 11m licence in NSW. 3-day boom lift training..."/>
                  <p className="cm-hint">{form.metaDescription.length} / 160 — Shown as the grey snippet text below the title in Google. Keep under 160 characters.</p>
                </Field>
              </div>

            </div>
          )}

          {/* ══ TAB 3: Requirements ══ */}
          {activeTab === 'Requirements' && (
            <div className="course-form-grid">

              <Field label="Course Requirement" className="span-2">
                <textarea className="cm-input" rows="3" value={form.courseRequirement}
                  onChange={e => setF('courseRequirement', e.target.value)} placeholder="Course Requirement…"/>
                <button type="button" className="cm-add-field-btn">Add Course Requirement</button>
              </Field>

              <div className="span-2 cm-upload-card">
                <div className="cm-upload-card-head">
                  <span className="cm-upload-card-icon">📄</span>
                  <div>
                    <h4>Upload Code of Practice (Optional)</h4>
                    <p>Upload a PDF or enter a URL. This document is shown on the course details page with a view option.</p>
                  </div>
                </div>
                <Field label="Course of Practice title">
                  <input className="cm-input" value={form.codeOfPracticeTitle}
                    onChange={e => setF('codeOfPracticeTitle', e.target.value)}
                    placeholder="e.g., Code of Practice Managing the Risk..."/>
                </Field>
                <Field label="Upload Course of Practice">
                  <label className="cm-pdf-upload-btn">
                    <input type="file" accept=".pdf" style={{ display:'none' }}
                      onChange={e => setCopFile(e.target.files[0])}/>
                    ↑ {codeOfPracticeFile ? codeOfPracticeFile.name : 'Choose PDF'}
                  </label>
                  {course?.codeOfPracticeFile && !codeOfPracticeFile && (
                    <a href={course.codeOfPracticeFile} target="_blank" rel="noreferrer" className="cm-existing-file">
                      📄 View existing PDF
                    </a>
                  )}
                </Field>
              </div>

              <div className="span-2 cm-upload-card">
                <div className="cm-upload-card-head">
                  <span className="cm-upload-card-icon">🗂️</span>
                  <div>
                    <h4>Upload Course Syllabus (Optional)</h4>
                    <p>Upload the course syllabus [PDF]. This will be viewable by students on the course details page.</p>
                  </div>
                </div>
                <Field label="Upload Syllabus PDF">
                  <label className="cm-pdf-upload-btn">
                    <input type="file" accept=".pdf" style={{ display:'none' }}
                      onChange={e => setSyllabusFile(e.target.files[0])}/>
                    ↑ {syllabusFile ? syllabusFile.name : 'Choose Syllabus PDF'}
                  </label>
                  {course?.syllabusFile && !syllabusFile && (
                    <a href={course.syllabusFile} target="_blank" rel="noreferrer" className="cm-existing-file">
                      📄 View existing syllabus
                    </a>
                  )}
                </Field>
              </div>

            </div>
          )}

          {/* ══ TAB 4: Combo Offer ══ */}
          {activeTab === 'Combo Offer' && (
            <div className="course-form-grid">
              <Field className="span-2" label="">
                <label className="combo-check">
                  <input type="checkbox" checked={form.comboEnabled}
                    onChange={e => { setF('comboEnabled', e.target.checked); setF('courseType', e.target.checked ? 'combo' : 'single') }}/>
                  Enable Combo Package Offer
                </label>
              </Field>

              {form.comboEnabled && (
                <>
                  <Field label="Combo Description" className="span-2">
                    <input className="cm-input" value={form.comboDescription}
                      onChange={e => setF('comboDescription', e.target.value)} placeholder="Describe combo package"/>
                  </Field>
                  <Field label="Combo Price ($)">
                    <input className="cm-input" type="number" value={form.comboPrice}
                      onChange={e => setF('comboPrice', e.target.value)} placeholder="78"/>
                  </Field>
                  <Field label="Combo Duration (days)">
                    <input className="cm-input" type="number" value={form.comboDuration}
                      onChange={e => setF('comboDuration', e.target.value)} placeholder="1"/>
                  </Field>
                  <div className="span-2">
                    <div className="combo-preview">
                      <h3>Combo Preview</h3>
                      <p><strong>Package:</strong> {form.comboDescription || '—'}</p>
                      <p><strong>Price:</strong> ${form.comboPrice || '0'}</p>
                      <p><strong>Duration:</strong> {form.comboDuration || '0'} days</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {error && <p style={{ color: '#cc0000', padding: '0 28px', fontSize: 13 }}>⚠ {error}</p>}

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="red-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Course'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN AdminCourses PAGE
// ══════════════════════════════════════════════════════════════
const AdminCourses = () => {
  const [courses, setCourses]         = useState([])
  const [categories, setCategories]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatus]     = useState('All Status')
  const [showCatModal, setCatModal]   = useState(false)
  const [showCourseModal, setCModal]  = useState(false)
  const [editCourse, setEditCourse]   = useState(null)
  const [schedCourse, setSchedCourse] = useState(null)

  const dragId  = useRef(null)
  const dragCat = useRef(null)
  const overId  = useRef(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [cRes, catRes] = await Promise.all([getCourses(), getCategories()])
      setCourses(cRes.data.courses || [])
      setCategories(catRes.data.categories || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const handleToggleStatus = async id => { try { await toggleCourseStatus(id); loadAll() } catch (e) { console.error(e) } }
  const handleDelete = async id => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return
    try { await deleteCourse(id); loadAll() } catch (e) { console.error(e) }
  }

  const onCourseDragStart = (id, catName) => { dragId.current = id; dragCat.current = catName }
  const onCourseDragEnter = id => { overId.current = id }
  const onCourseDragEnd = async () => {
    const fromId  = dragId.current
    const toId    = overId.current
    const catName = dragCat.current
    dragId.current = null; dragCat.current = null; overId.current = null
    if (!fromId || !toId || fromId === toId) return

    let reorderedAll = []
    setCourses(prev => {
      const inCat  = prev.filter(c => (c.category?.name || 'Uncategorised') === catName)
      const others = prev.filter(c => (c.category?.name || 'Uncategorised') !== catName)
      const fromIdx = inCat.findIndex(c => c._id === fromId)
      const toIdx   = inCat.findIndex(c => c._id === toId)
      if (fromIdx === -1 || toIdx === -1) return prev
      const reordered = [...inCat]
      const [moved]   = reordered.splice(fromIdx, 1)
      reordered.splice(toIdx, 0, moved)
      reorderedAll = [...others, ...reordered]
      return reorderedAll
    })
    try {
      await API.post('/courses/reorder', { orderedIds: reorderedAll.map(c => c._id) })
    } catch (e) { console.error('course reorder failed', e) }
  }

  const filtered = courses.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !search || c.title?.toLowerCase().includes(q) || (c.code || c.urlSlug || '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'All Status' || (statusFilter === 'Active' ? c.isActive !== false : c.isActive === false)
    return matchSearch && matchStatus
  })

  const grouped = filtered.reduce((acc, c) => {
    const key = c.category?.name || 'Uncategorised'
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title" style={{ color: '#C0392B' }}>Course Management</h2>
          <p className="page-sub">Create and manage courses with detailed information</p>
        </div>
        <div className="page-header-actions">
          <button className="outline-btn" onClick={() => setCatModal(true)}>🏷 Manage Categories</button>
          <button className="red-btn" onClick={() => { setEditCourse(null); setCModal(true) }}>+ Create New Course</button>
        </div>
      </div>

      <div className="section-card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '18px 22px' }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Search &amp; Filter</p>
          <p className="page-sub" style={{ marginBottom: 14 }}>Find courses by name or course code</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input className="search-input" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search courses by name or code…" style={{ flex: 1, minWidth: 200 }}/>
            <select className="filter-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
              <option>All Status</option><option>Active</option><option>Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="section-card">
          <table className="admin-table">
            <thead><tr><th>Code</th><th>Title</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
            <TableSkeleton cols={6}/>
          </table>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="section-card"><p className="empty-row">No courses found.</p></div>
      ) : (
        Object.keys(grouped).sort().map(catName => (
          <div key={catName} style={{ marginBottom: 28 }}>
            <h3 className="cat-group-title">{catName}</h3>
            {grouped[catName].map(course => (
              <div
                key={course._id}
                className="course-list-card"
                draggable
                onDragStart={() => onCourseDragStart(course._id, catName)}
                onDragEnter={() => onCourseDragEnter(course._id)}
                onDragEnd={onCourseDragEnd}
                onDragOver={e => e.preventDefault()}
              >
                <div className="course-list-drag" style={{ cursor: 'grab', color: '#bbb' }}><DragIcon/></div>
                {course.thumbnail
                  ? <img src={course.thumbnail} alt={course.title} className="course-list-thumb"/>
                  : <div className="course-list-thumb-placeholder">📖</div>
                }
                <div className="course-list-body">
                  <div className="course-list-code">{course.code || course.urlSlug || '—'}</div>
                  <div className="course-list-title">{course.title}</div>
                  <div className="course-list-meta">
                    {course.category?.name || catName}
                    {course.duration ? ` · ${course.duration}` : ''}
                    {course.price != null && <> · <span style={{ color: '#C0392B', fontWeight: 700 }}>${course.price}</span></>}
                  </div>
                </div>
                <div className="course-list-actions">
                  <span className={`status-pill ${course.isActive !== false ? 'status-active' : 'status-inactive'}`}>
                    {course.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                  <button className="action-icon-btn action-schedule" title="Manage Dates" onClick={() => setSchedCourse(course)}><CalendarIcon/></button>
                  <button className="action-icon-btn action-edit" title="Edit Course" onClick={() => { setEditCourse(course); setCModal(true) }}><EditIcon/></button>
                  <button className="action-icon-btn action-delete" title="Delete Course" onClick={() => handleDelete(course._id)}><TrashIcon/></button>
                  <Toggle active={course.isActive !== false} onChange={() => handleToggleStatus(course._id)}/>
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      {showCatModal   && <CategoryModal categories={categories} onClose={() => setCatModal(false)} onRefresh={loadAll}/>}
      {showCourseModal && <CourseModal course={editCourse} categories={categories} onClose={() => { setCModal(false); setEditCourse(null) }} onSaved={loadAll}/>}
      {schedCourse    && <ScheduleModal course={schedCourse} onClose={() => setSchedCourse(null)}/>}
    </div>
  )
}

export default AdminCourses