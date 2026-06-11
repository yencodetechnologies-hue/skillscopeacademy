// import { useEffect, useState, useCallback, useRef } from 'react'
// import {
//   getAllSchedules, getCourses, createSchedule,
//   updateSchedule, deleteSchedule, toggleScheduleStatus,
// } from '../../services/adminService'

// // ── Icons ─────────────────────────────────────────────────────
// const EditIcon = () => (
//   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
//     <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
//   </svg>
// )
// const TrashIcon = () => (
//   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <polyline points="3 6 5 6 21 6"/>
//     <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
//     <path d="M10 11v6"/><path d="M14 11v6"/>
//     <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
//   </svg>
// )
// const ChevLeft  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
// const ChevRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>

// // ── Constants ────────────────────────────────────────────────
// const LOCATIONS     = ['Online', 'Face to Face']
// const SESSION_TYPES = ['General', 'Theory', 'Practical', 'Exam']
// const DAYS_SHORT    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
// const MONTHS        = ['January','February','March','April','May','June','July','August','September','October','November','December']

// // Event colors — one per course (cycle through palette)
// const EVENT_PALETTE = [
//   '#E74C3C','#3498DB','#2ECC71','#F39C12','#9B59B6',
//   '#1ABC9C','#E67E22','#34495E','#E91E63','#00BCD4',
//   '#8BC34A','#FF5722','#607D8B','#795548','#FF9800',
// ]

// // ── Helpers ──────────────────────────────────────────────────
// const today = () => {
//   const d = new Date(); d.setHours(0,0,0,0); return d
// }
// const sameDay = (a,b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
// const addDays = (d, n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r }
// const startOfWeek = d => { const r=new Date(d); r.setDate(r.getDate()-r.getDay()); r.setHours(0,0,0,0); return r }
// const startOfMonth = d => new Date(d.getFullYear(), d.getMonth(), 1)
// const daysInMonth = d => new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()

// const fmtTime = t => {
//   if (!t) return ''
//   const [h,m] = t.split(':')
//   const hr = parseInt(h)
//   return `${hr%12||12}:${m}${hr<12?'am':'pm'}`
// }
// const fmtDateLabel = d => d.toLocaleDateString('en-AU',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})
// const fmtMonthYear = d => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
// const fmtWeekRange = d => {
//   const s = startOfWeek(d)
//   const e = addDays(s,6)
//   return `${MONTHS[s.getMonth()].slice(0,3)} ${s.getDate()} – ${s.getMonth()!==e.getMonth()?MONTHS[e.getMonth()].slice(0,3)+' ':''}${e.getDate()}, ${e.getFullYear()}`
// }

// // ── Add Event Modal ──────────────────────────────────────────
// const AddEventModal = ({
//   courses,
//   prefillDate,
//   prefillType,
//   onClose,
//   onSaved
// }) => {
//   const [form, setForm] = useState({
//   eventTitle: prefillType || 'General',
//   eventType: prefillType || 'General',
//   courseId: '',
//   date: prefillDate || new Date().toISOString().substring(0,10),
//   startTime: '09:00',
//   endTime: '17:00',
//   location: 'Face to Face',
//   activeSlots: 20,
//   teacher: '',
// })
//   const [saving, setSaving] = useState(false)
//   const setF = (k,v) => setForm(f=>({...f,[k]:v}))

//   const handleSubmit = async () => {
//     if (!form.courseId) { alert('Please select a course.'); return }
//     if (!form.date || !form.startTime || !form.endTime) { alert('Date, Start Time and End Time are required.'); return }
//     setSaving(true)
//     try {
//       await createSchedule({
//         courseId: form.courseId,
//         date: form.date,
//         sessionType: form.eventType,
//         startTime: form.startTime,
//         endTime: form.endTime,
//         location: form.location,
//         activeSlots: Number(form.activeSlots),
//         teacher: form.teacher || undefined,
//       })
//       onSaved(); onClose()
//     } catch(e){ console.error(e); alert('Failed to schedule event.') }
//     finally { setSaving(false) }
//   }

//   return (
//     <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
//       <div className="add-event-modal">
//         <div className="add-event-header">
//           <div>
//             <h2>Add New Event</h2>
//             <p>Schedule an event</p>
//           </div>
//           <button className="add-event-close" onClick={onClose}>✕</button>
//         </div>
//         <div className="add-event-body">
//           <div className="ae-row">
//             <div className="sched-field">
//               <label>EVENT TITLE</label>
//               <input value={form.eventTitle} onChange={e=>setF('eventTitle',e.target.value)} placeholder="e.g., General"/>
//             </div>
//             <div className="sched-field">
//               <label>EVENT TYPE</label>
//               <select value={form.eventType} onChange={e=>setF('eventType',e.target.value)}>
//                 {SESSION_TYPES.map(t=><option key={t}>{t}</option>)}
//               </select>
//             </div>
//           </div>
//           <div className="sched-field" style={{marginBottom:12}}>
//             <label>COURSE *</label>
//             <select value={form.courseId} onChange={e=>setF('courseId',e.target.value)}>
//               <option value="">Select a course</option>
//               {courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}
//             </select>
//           </div>
//           <div className="ae-row">
//             <div className="sched-field">
//               <label>DATE</label>
//               <input type="date" value={form.date} onChange={e=>setF('date',e.target.value)}/>
//             </div>
//             <div className="sched-field">
//               <label>START TIME</label>
//               <input type="time" value={form.startTime} onChange={e=>setF('startTime',e.target.value)}/>
//             </div>
//             <div className="sched-field">
//               <label>END TIME</label>
//               <input type="time" value={form.endTime} onChange={e=>setF('endTime',e.target.value)}/>
//             </div>
//           </div>
//           <div className="sched-field" style={{marginBottom:12}}>
//             <label>LOCATION</label>
//             <select value={form.location} onChange={e=>setF('location',e.target.value)}>
//               {LOCATIONS.map(l=><option key={l}>{l}</option>)}
//             </select>
//           </div>
//           <div className="sched-field" style={{marginBottom:12}}>
//             <label>ACTIVE SLOTS *</label>
//             <input type="number" value={form.activeSlots} onChange={e=>setF('activeSlots',e.target.value)} min="1"/>
//           </div>
//           <div className="sched-field" style={{marginBottom:12}}>
//             <label>🎓 ASSIGN TEACHER (OPTIONAL)</label>
//             <button type="button" className="assign-teacher-btn">🎓 Assign Teacher</button>
//           </div>
//         </div>
//         <div className="add-event-footer">
//           <button className="schedule-btn" onClick={handleSubmit} disabled={saving}>
//             {saving?'Scheduling…':'+ Schedule Event'}
//           </button>
//           <button className="cancel-btn" onClick={onClose}>Cancel</button>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ── Edit Session Modal ───────────────────────────────────────
// const EditSessionModal = ({ session, onClose, onSaved }) => {
//   const [form, setForm] = useState({
//     startTime: session.startTime||'',
//     endTime: session.endTime||'',
//     activeSlots: session.activeSlots||'',
//   })
//   const [saving, setSaving] = useState(false)

//   const handleSave = async () => {
//     setSaving(true)
//     try {
//       await updateSchedule(session._id, {
//         startTime: form.startTime, endTime: form.endTime,
//         activeSlots: Number(form.activeSlots),
//       })
//       onSaved(); onClose()
//     } catch(e){ console.error(e); alert('Failed to update session.') }
//     finally { setSaving(false) }
//   }

//   return (
//     <div className="modal-backdrop inner-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
//       <div className="modal" style={{width:420}}>
//         <div className="modal-top">
//           <div><h2>Edit Session</h2><p className="page-sub">Update the start/end time and capacity.</p></div>
//           <button className="modal-close-btn" onClick={onClose}>✕</button>
//         </div>
//         <div style={{padding:'16px 0'}}>
//           <p style={{fontSize:12,color:'#888',marginBottom:2}}>Date</p>
//           <p style={{fontWeight:600,marginBottom:14}}>{fmtDateLabel(new Date(session.date))}</p>
//           {session.courseId?.title && <p style={{fontSize:13,color:'#555',marginBottom:14}}>{session.courseId.title}</p>}
//           <div className="sched-form-grid">
//             <div className="sched-field">
//               <label>Start Time</label>
//               <input type="time" value={form.startTime} onChange={e=>setForm(f=>({...f,startTime:e.target.value}))}/>
//             </div>
//             <div className="sched-field">
//               <label>End Time</label>
//               <input type="time" value={form.endTime} onChange={e=>setForm(f=>({...f,endTime:e.target.value}))}/>
//             </div>
//           </div>
//           <div className="sched-field" style={{marginTop:12}}>
//             <label>Active Slots</label>
//             <input type="number" value={form.activeSlots} onChange={e=>setForm(f=>({...f,activeSlots:e.target.value}))}/>
//           </div>
//         </div>
//         <div className="modal-footer">
//           <button className="cancel-btn" onClick={onClose}>Cancel</button>
//           <button className="red-btn" onClick={handleSave} disabled={saving}>{saving?'Saving…':'Save Changes'}</button>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ══════════════════════════════════════════════════════════════
// // MAIN AdminSchedule PAGE
// // ══════════════════════════════════════════════════════════════
// const AdminSchedule = () => {
//     const [draggedSessionType, setDraggedSessionType] = useState(null)
//   const [schedules, setSchedules]     = useState([])
//   const [courses, setCourses]         = useState([])
//   const [loading, setLoading]         = useState(true)
//   const [view, setView]               = useState('month')   // month | week | day | list
//   const [currentDate, setCurrentDate] = useState(today())
//   const [courseFilter, setCourseFilter] = useState('all')
//   const [editSession, setEdit]        = useState(null)
//   const [addEventDate, setAddEventDate] = useState(null)   // date string for modal
//   const [showAddEvent, setShowAddEvent] = useState(false)
// const [draggedType, setDraggedType] = useState('General')
//   // Course color map
//   const courseColorMap = useRef({})
//   const getColor = (courseId) => {
//     if (!courseColorMap.current[courseId]) {
//       const keys = Object.keys(courseColorMap.current)
//       courseColorMap.current[courseId] = EVENT_PALETTE[keys.length % EVENT_PALETTE.length]
//     }
//     return courseColorMap.current[courseId]
//   }

//   const load = useCallback(async () => {
//     setLoading(true)
//     try {
//       const [sRes, cRes] = await Promise.all([getAllSchedules(), getCourses()])
//       const sched = sRes.data.schedules || sRes.data.data || []
//       const crses = cRes.data.courses || []
//       setSchedules(sched)
//       setCourses(crses)
//     } catch(e){ console.error(e) }
//     finally { setLoading(false) }
//   }, [])

//   useEffect(() => { load() }, [load])

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this session?')) return
//     try { await deleteSchedule(id); load() } catch(e){ console.error(e) }
//   }

//   const handleToggle = async (id) => { try { await toggleScheduleStatus(id); load() } catch(e){ console.error(e) } }

//   // Filter by course
//   const filtered = courseFilter === 'all'
//     ? schedules
//     : schedules.filter(s => (s.courseId?._id || s.courseId) === courseFilter)

//   // Build date → events map
//   const eventsMap = filtered.reduce((acc, s) => {
//     const d = s.date?.substring(0,10)
//     if (!d) return acc
//     if (!acc[d]) acc[d] = []
//     acc[d].push(s)
//     return acc
//   }, {})

//   const getEventsForDate = (d) => {
//     const key = d.toISOString().substring(0,10)
//     return eventsMap[key] || []
//   }

//   // Navigation
//   const nav = (dir) => {
//     const d = new Date(currentDate)
//     if (view==='month')     { d.setMonth(d.getMonth()+dir) }
//     else if (view==='week') { d.setDate(d.getDate()+dir*7) }
//     else if (view==='day')  { d.setDate(d.getDate()+dir) }
//     setCurrentDate(d)
//   }

//   const viewLabel = () => {
//     if (view==='month') return fmtMonthYear(currentDate)
//     if (view==='week')  return fmtWeekRange(currentDate)
//     if (view==='day')   return fmtDateLabel(currentDate)
//     return fmtMonthYear(currentDate)
//   }

//   // ── Event chip component ──
//   const EventChip = ({ s, short }) => {
//     const courseId = s.courseId?._id || s.courseId || ''
//     const color    = getColor(courseId)
//     const title    = s.courseId?.title || s.courseTitle || 'Course'
//     return (
//       <div
//         className="cal-event-chip"
//         style={{background: color}}
//         title={`${title} | ${s.sessionType} | ${s.startTime}–${s.endTime} | ${s.activeSlots} slots`}
//       >
//         {short
//           ? <span className="chip-short">{title.slice(0,10)}{title.length>10?'…':''} {fmtTime(s.startTime)}</span>
//           : <span>{title} | {s.sessionType} {fmtTime(s.startTime)}</span>
//         }
//       </div>
//     )
//   }

//   // ── MONTH VIEW ──
//   const MonthView = () => {
//     const first = startOfMonth(currentDate)
//     const firstDow = first.getDay()
//     const dim = daysInMonth(currentDate)
//     const cells = []
//     for (let i=0; i<firstDow; i++) cells.push(null)
//     for (let i=1; i<=dim; i++) cells.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))

//     return (
//       <div className="cal-month">
//         <div className="cal-month-header">
//           {DAYS_SHORT.map(d=><div key={d} className="cal-month-dow">{d}</div>)}
//         </div>
//         <div className="cal-month-grid">
//           {cells.map((d, idx) => {
//             if (!d) return <div key={`e${idx}`} className="cal-month-cell cal-month-cell--empty"/>
//             const events = getEventsForDate(d)
//             const isToday = sameDay(d, today())
//             const MAX_SHOW = 3
//             return (
//        <div
//   key={d.toISOString()}
//   className={`cal-month-cell`}
//   onDragOver={(e) => e.preventDefault()}
//   onDrop={() => handleCalendarDrop(d)}
//   onClick={() => {
//     setCurrentDate(d)
//     setView('day')
//   }}
// >
//                 <div className={`cal-month-num ${isToday?'cal-month-num--today':''}`}>{d.getDate()}</div>
//                 <div className="cal-month-events">
//                   {events.slice(0, MAX_SHOW).map(s => <EventChip key={s._id} s={s} short/>)}
//                   {events.length > MAX_SHOW && (
//                     <div className="cal-more-link">+{events.length-MAX_SHOW} more</div>
//                   )}
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     )
//   }

//   // ── WEEK VIEW ──
//   const WeekView = () => {
//     const ws = startOfWeek(currentDate)
//     const days = Array.from({length:7}, (_,i) => addDays(ws,i))
//     const hours = Array.from({length:24}, (_,i) => i)

//     return (
//       <div className="cal-week">
//         <div className="cal-week-header">
//           <div className="cal-time-gutter"/>
//           {days.map(d => {
//             const isToday = sameDay(d, today())
//             return (
//               <div key={d.toISOString()} className={`cal-week-col-head ${isToday?'cal-week-col-head--today':''}`}>
//                 <div className="cal-week-dow">{DAYS_SHORT[d.getDay()]} {d.getDate()}/{d.getMonth()+1}</div>
//               </div>
//             )
//           })}
//         </div>
//         <div className="cal-week-body">
//           <div className="cal-week-times">
//             {hours.map(h => (
//               <div key={h} className="cal-week-hour-cell">
//                 <span className="cal-time-label">{h===0?'12am':h<12?`${h}am`:h===12?'12pm':`${h-12}pm`}</span>
//               </div>
//             ))}
//           </div>
//           {days.map(d => {
//             const events = getEventsForDate(d)
//             return (
//               <div
//   key={d.toISOString()}
//   className="cal-week-day-col"
//   onDragOver={(e) => e.preventDefault()}
//   onDrop={() => handleCalendarDrop(d)}
// >
//                 {hours.map(h => <div key={h} className="cal-week-day-hour-cell"/>)}
//                 {events.map(s => {
//                   const [sh,sm] = (s.startTime||'08:00').split(':').map(Number)
//                   const [eh,em] = (s.endTime||'17:00').split(':').map(Number)
//                   const top  = (sh + sm/60) * 60
//                   const height = ((eh+em/60) - (sh+sm/60)) * 60
//                   const color = getColor(s.courseId?._id||s.courseId||'')
//                   const title = s.courseId?.title || 'Course'
//                   return (
//                     <div
//                       key={s._id}
//                       className="cal-week-event"
//                       style={{top:top, height:Math.max(height,24), background:color}}
//                       title={`${title}\n${s.sessionType} | ${s.startTime}–${s.endTime}\n${s.activeSlots} slots`}
//                     >
//                       <span className="cal-week-event-title">{title.slice(0,14)}{title.length>14?'…':''}</span>
//                       <span className="cal-week-event-time">{fmtTime(s.startTime)}</span>
//                     </div>
//                   )
//                 })}
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     )
//   }

//   // ── DAY VIEW ──
//   const DayView = () => {
//     const events = getEventsForDate(currentDate)
//     const hours  = Array.from({length:24}, (_,i) => i)

//     return (
//       <div className="cal-day">
//         <div className="cal-day-header">
//           <div className="cal-time-gutter"/>
//           <div className="cal-day-col-head">
//             <strong>{DAYS_SHORT[currentDate.getDay()]}, {currentDate.getDate()} {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</strong>
//           </div>
//         </div>
//         <div className="cal-day-body">
//           <div className="cal-week-times">
//             {hours.map(h => (
//               <div key={h} className="cal-week-hour-cell">
//                 <span className="cal-time-label">{h===0?'12am':h<12?`${h}am`:h===12?'12pm':`${h-12}pm`}</span>
//               </div>
//             ))}
//           </div>
//           <div
//   className="cal-day-col"
//   style={{ position:'relative', flex:1 }}
//   onDragOver={(e) => e.preventDefault()}
//   onDrop={() => handleCalendarDrop(currentDate)}
// >
//             {hours.map(h => <div key={h} className="cal-week-day-hour-cell"/>)}
//             {events.map(s => {
//               const [sh,sm] = (s.startTime||'08:00').split(':').map(Number)
//               const [eh,em] = (s.endTime||'17:00').split(':').map(Number)
//               const top    = (sh + sm/60) * 60
//               const height = ((eh+em/60) - (sh+sm/60)) * 60
//               const color  = getColor(s.courseId?._id||s.courseId||'')
//               const title  = s.courseId?.title || 'Course'
//               return (
//                 <div key={s._id} className="cal-week-event cal-day-event"
//                   style={{top, height:Math.max(height,40), background:color}}
//                   title={`${title} | ${s.sessionType} | ${s.startTime}–${s.endTime}`}>
//                   <div className="cal-day-event-title">{title}</div>
//                   <div className="cal-day-event-sub">{s.sessionType} · {fmtTime(s.startTime)} – {fmtTime(s.endTime)}</div>
//                   <div className="cal-day-event-sub">{s.activeSlots} slots · {s.location||''}</div>
//                   <div className="cal-day-event-actions">
//                     <button onClick={e=>{e.stopPropagation();setEdit(s)}} title="Edit"><EditIcon/></button>
//                     <button onClick={e=>{e.stopPropagation();handleDelete(s._id)}} title="Delete"><TrashIcon/></button>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // ── LIST VIEW ──
//   const ListView = () => {
//     // Show events for the month
//     const monthStart = startOfMonth(currentDate)
//     const monthEnd   = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0)
//     const listDays   = []
//     const cur = new Date(monthStart)
//     while (cur <= monthEnd) { listDays.push(new Date(cur)); cur.setDate(cur.getDate()+1) }

//     const hasAny = listDays.some(d => getEventsForDate(d).length > 0)
//     if (!hasAny) return <div className="cal-list-empty">No events this month.</div>

//     return (
//       <div className="cal-list">
//         {listDays.map(d => {
//           const events = getEventsForDate(d)
//           if (!events.length) return null
//           const isToday = sameDay(d, today())
//           return (
//             <div key={d.toISOString()} className="cal-list-day">
//               <div className={`cal-list-date ${isToday?'cal-list-date--today':''}`}>
//                 {d.toLocaleDateString('en-AU',{weekday:'short',day:'2-digit',month:'long',year:'numeric'}).toUpperCase()}
//               </div>
//               {events.map(s => {
//                 const color = getColor(s.courseId?._id||s.courseId||'')
//                 const title = s.courseId?.title || 'Course'
//                 return (
//                   <div key={s._id} className="cal-list-row">
//                     <div className="cal-list-time">{fmtTime(s.startTime)} - {fmtTime(s.endTime)}</div>
//                     <div className="cal-list-info">
//                       <div className="cal-list-dot" style={{background:color}}/>
//                       <div>
//                         <strong>{title.split('|')[0].trim()}</strong>
//                         <span className="cal-list-sub"> | {title.split('|').slice(1).join('|').trim() || s.sessionType}</span>
//                       </div>
//                     </div>
//                     <div className="cal-list-actions">
//                       <button className="action-icon-btn action-edit" title="Edit" onClick={()=>setEdit(s)}><EditIcon/></button>
//                       <button className="action-icon-btn action-delete" title="Delete" onClick={()=>handleDelete(s._id)}><TrashIcon/></button>
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
//           )
//         })}
//       </div>
//     )
//   }

//  const handleCalendarDrop = (date) => {
//   if (!draggedSessionType) return

//   setDraggedType(draggedSessionType)

//   setAddEventDate(date.toISOString().substring(0, 10))

//   setShowAddEvent(true)

//   setDraggedSessionType(null)
// }

// const handleDeleteOld = async () => {
//   if (!window.confirm('Delete all expired schedules?')) return

//   await deleteOldSchedules()

//   load()
// }
//   const totalActive   = schedules.filter(s=>s.isActive!==false).length
//   const totalInactive = schedules.filter(s=>s.isActive===false).length

//   return (
//     <div className="sched-page-layout">
//       {/* ── Left Sidebar ── */}
//       <aside className="sched-sidebar">
//         <div className="sched-sidebar-section">
//           <p className="sched-sidebar-label">Drag-n-Drop Events</p>
//           <p className="sched-sidebar-hint">Drag these onto the calendar:</p>
//           {SESSION_TYPES.map(t => (
//             <div
//   key={t}
//   className="sched-drag-chip"
//   draggable
//   onDragStart={() => setDraggedSessionType(t)}
// >

//               <span className="drag-dots">⠿</span> {t}
//             </div>
//           ))}
//         </div>

//         <button className="add-event-manually-btn" onClick={() => setShowAddEvent(true)}>
//           + Add Event Manually
//         </button>

//         <div className="sched-sidebar-section" style={{marginTop:20}}>
//           <p className="sched-sidebar-label">Event Status:</p>
//           <div className="event-status-list">
//             <div className="event-status-item"><span className="event-status-dot dot-scheduled"/><span>Scheduled</span></div>
//             <div className="event-status-item"><span className="event-status-dot dot-completed"/><span>Completed</span></div>
//             <div className="event-status-item"><span className="event-status-dot dot-cancelled"/><span>Cancelled</span></div>
//           </div>
//         </div>

//         {!loading && (
//           <div className="sched-sidebar-section" style={{marginTop:16}}>
//             <p className="sched-sidebar-label">Stats</p>
//             <div className="sched-stat-row"><span>Total</span><strong>{schedules.length}</strong></div>
//             <div className="sched-stat-row" style={{color:'#2E7D32'}}><span>Active</span><strong>{totalActive}</strong></div>
//             <div className="sched-stat-row" style={{color:'#E65100'}}><span>Inactive</span><strong>{totalInactive}</strong></div>
//           </div>
//         )}
//       </aside>

//       {/* ── Main Calendar Area ── */}
//       <div className="sched-main">
//         {/* ── Toolbar ── */}
//         <div className="cal-toolbar">
//           <div className="cal-toolbar-left">
//             <button className="cal-today-btn" onClick={() => setCurrentDate(today())}>today</button>
//             <button className="cal-nav-btn" onClick={() => nav(-1)}><ChevLeft/></button>
//             <button className="cal-nav-btn" onClick={() => nav(1)}><ChevRight/></button>
//             <span className="cal-view-label">{viewLabel()}</span>
//           </div>
//           <div className="cal-toolbar-right">
//          <button
//   className="cal-delete-old-btn"
//   onClick={handleDeleteOld}
// >
//   🗑 Delete old schedules
// </button>
//             <div className="cal-course-filter">
//               <select value={courseFilter} onChange={e=>setCourseFilter(e.target.value)}>
//                 <option value="all">All courses</option>
//                 {courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}
//               </select>
//             </div>
//             {['month','week','day','list'].map(v => (
//               <button key={v} className={`cal-view-btn ${view===v?'active':''}`} onClick={()=>setView(v)}>{v}</button>
//             ))}
//           </div>
//         </div>

//         {loading ? (
//           <div className="cal-loading">
//             {Array.from({length:5},(_,i)=><div key={i} className="skeleton-cell" style={{height:80,marginBottom:8,borderRadius:8}}/>)}
//           </div>
//         ) : (
//           <>
//             {view==='month' && <MonthView/>}
//             {view==='week'  && <WeekView/>}
//             {view==='day'   && <DayView/>}
//             {view==='list'  && <ListView/>}
//           </>
//         )}
//       </div>

//       {/* ── Modals ── */}
//       {showAddEvent && (
//    <AddEventModal
//   courses={courses}
//   prefillDate={addEventDate}
//   prefillType={draggedType}
//   onClose={() => {
//     setShowAddEvent(false)
//     setAddEventDate(null)
//   }}
//   onSaved={load}
// />
//       )}
//       {editSession && (
//         <EditSessionModal session={editSession} onClose={() => setEdit(null)} onSaved={load}/>
//       )}
//     </div>
//   )
// }

// export default AdminSchedule

// import { useEffect, useState, useCallback } from 'react'
// import {
//   getAllSchedules,
//   updateSchedule,
//   deleteSchedule,
//   toggleScheduleStatus,
// } from '../../services/adminService'

// // ── Icons ─────────────────────────────────────────────────────
// const EditIcon = () => (
//   <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
//     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
//     <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
//   </svg>
// )

// const TrashIcon = () => (
//   <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
//     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <polyline points="3 6 5 6 21 6" />
//     <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
//     <path d="M10 11v6" /><path d="M14 11v6" />
//     <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
//   </svg>
// )

// // ── Toggle ────────────────────────────────────────────────────
// const Toggle = ({ active, onChange }) => (
//   <button
//     className={`toggle-btn ${active ? 'toggle-on' : 'toggle-off'}`}
//     onClick={onChange}
//     title={active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
//   >
//     <span className="toggle-thumb" />
//   </button>
// )

// // ── Date formatter ────────────────────────────────────────────
// const fmtDate = iso => {
//   if (!iso) return 'Unknown date'
//   return new Date(iso).toLocaleDateString('en-AU', {
//     weekday: 'short', day: '2-digit', month: 'long', year: 'numeric',
//   })
// }

// // ── Edit Session Modal ────────────────────────────────────────
// const EditSessionModal = ({ session, onClose, onSaved }) => {
//   const [form, setForm] = useState({
//     startTime:   session.startTime   || '',
//     endTime:     session.endTime     || '',
//     activeSlots: session.activeSlots || '',
//   })
//   const [saving, setSaving] = useState(false)

//   const handleSave = async () => {
//     if (!form.startTime || !form.endTime || !form.activeSlots) {
//       alert('Please fill in all fields.')
//       return
//     }
//     setSaving(true)
//     try {
//       await updateSchedule(session._id, {
//         startTime:   form.startTime,
//         endTime:     form.endTime,
//         activeSlots: Number(form.activeSlots),
//       })
//       onSaved()
//       onClose()
//     } catch (e) {
//       console.error('updateSchedule:', e)
//       alert('Failed to update session. Please try again.')
//     } finally {
//       setSaving(false)
//     }
//   }

//   return (
//     <div className="modal-backdrop inner-backdrop"
//       onClick={e => e.target === e.currentTarget && onClose()}>
//       <div className="modal edit-session-modal">

//         <div className="modal-top">
//           <div>
//             <h2>Edit Session</h2>
//             <p className="page-sub">
//               Update the start/end time and capacity for this scheduled session.
//             </p>
//           </div>
//           <button className="modal-close-btn" onClick={onClose}>✕</button>
//         </div>

//         <div className="edit-session-body">
//           <p className="edit-date-label">Date</p>
//           <p className="edit-date-val">{fmtDate(session.date)}</p>

//           {session.courseId?.title && (
//             <>
//               <p className="edit-date-label" style={{ marginTop: 8 }}>Course</p>
//               <p className="edit-date-val" style={{ fontSize: 14 }}>
//                 {session.courseId.title}
//               </p>
//             </>
//           )}

//           <div className="sched-form-grid" style={{ marginTop: 16 }}>
//             <div className="sched-field">
//               <label>Start Time</label>
//               <input
//                 type="time"
//                 value={form.startTime}
//                 onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
//               />
//             </div>
//             <div className="sched-field">
//               <label>End Time</label>
//               <input
//                 type="time"
//                 value={form.endTime}
//                 onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
//               />
//             </div>
//           </div>

//           <div className="sched-field" style={{ marginTop: 12 }}>
//             <label>Active Slots</label>
//             <input
//               type="number"
//               value={form.activeSlots}
//               onChange={e => setForm(f => ({ ...f, activeSlots: e.target.value }))}
//               placeholder="e.g., 20"
//             />
//           </div>
//         </div>

//         <div className="modal-footer">
//           <button className="cancel-btn" onClick={onClose}>Cancel</button>
//           <button className="red-btn" onClick={handleSave} disabled={saving}>
//             {saving ? 'Saving…' : 'Save Changes'}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ── Main AdminSchedule Page ───────────────────────────────────
// const AdminSchedule = () => {
//   const [schedules, setSchedules]   = useState([])
//   const [loading, setLoading]       = useState(true)
//   const [error, setError]           = useState(null)
//   const [filterType, setFilterType] = useState('All')
//   const [editSession, setEdit]      = useState(null)

//   const load = useCallback(async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       const { data } = await getAllSchedules()
//       // Backend returns { success: true, schedules: [...] }
//       setSchedules(data.schedules || data.data || [])
//     } catch (e) {
//       console.error('loadSchedules:', e)
//       setError('Failed to load schedules.')
//       setSchedules([])
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   useEffect(() => { load() }, [load])

//   const handleToggle = async (id) => {
//     try { await toggleScheduleStatus(id); load() }
//     catch (e) { console.error('toggleSchedule:', e) }
//   }

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this session? This cannot be undone.')) return
//     try { await deleteSchedule(id); load() }
//     catch (e) { console.error('deleteSchedule:', e) }
//   }

//   // Filter by session type
//   const SESSION_TYPES = ['All', 'General', 'Theory', 'Practical', 'Exam']
//   const filtered = filterType === 'All'
//     ? schedules
//     : schedules.filter(s => s.sessionType === filterType)

//   // Group by date
//   const grouped = filtered.reduce((acc, s) => {
//     const d = s.date?.substring(0, 10) || 'Unknown'
//     if (!acc[d]) acc[d] = []
//     acc[d].push(s)
//     return acc
//   }, {})

//   const totalActive   = schedules.filter(s => s.isActive !== false).length
//   const totalInactive = schedules.filter(s => s.isActive === false).length

//   return (
//     <div>
//       {/* ── Page Header ── */}
//       <div className="page-header">
//         <div>
//           <h2 className="page-title">Schedule</h2>
//           <p className="page-sub">All upcoming and past course sessions</p>
//         </div>
//         <div className="section-header-right">
//           {!loading && (
//             <>
//               <span className="section-count">{schedules.length} total</span>
//               <span className="section-count" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
//                 {totalActive} active
//               </span>
//               <span className="section-count" style={{ background: '#FFF3E0', color: '#E65100' }}>
//                 {totalInactive} inactive
//               </span>
//             </>
//           )}
//           <button className="icon-btn" onClick={load} title="Refresh">↻</button>
//         </div>
//       </div>

//       {/* ── Session Type Filter ── */}
//       <div className="sched-page-filter">
//         {SESSION_TYPES.map(t => (
//           <button
//             key={t}
//             className={`sched-filter-tab${filterType === t ? ' active' : ''}`}
//             onClick={() => setFilterType(t)}
//           >{t}</button>
//         ))}
//       </div>

//       {/* ── Error ── */}
//       {error && (
//         <div className="error-banner">
//           {error}
//           <button onClick={load}>Retry</button>
//         </div>
//       )}

//       {/* ── Loading skeletons ── */}
//       {loading && (
//         <div className="section-card">
//           {Array.from({ length: 3 }, (_, i) => (
//             <div key={i} style={{ padding: '14px 22px', borderBottom: '1px solid #f0f0f0' }}>
//               <div className="skeleton-cell" style={{ width: '40%', marginBottom: 10 }} />
//               <div className="skeleton-cell" style={{ width: '80%' }} />
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ── Schedule Groups by Date ── */}
//       {!loading && Object.keys(grouped).length === 0 && !error && (
//         <div className="section-card">
//           <p className="empty-row">No sessions scheduled yet.</p>
//         </div>
//       )}

//       {!loading && Object.keys(grouped).sort().map(date => (
//         <div key={date} className="section-card" style={{ marginBottom: 16 }}>

//           {/* Date Header */}
//           <div className="section-header">
//             <div>
//               <strong style={{ fontSize: 15 }}>{fmtDate(date)}</strong>
//               <span className="section-count" style={{ marginLeft: 12 }}>
//                 {grouped[date].length} session{grouped[date].length > 1 ? 's' : ''}
//               </span>
//             </div>
//           </div>

//           {/* Sessions for this date */}
//           {grouped[date].map(s => (
//             <div key={s._id} className="sched-page-slot-row">

//               {/* Session Type Badge */}
//               <span className={`session-type-badge type-${(s.sessionType || 'general').toLowerCase()}`}>
//                 {s.sessionType || 'General'}
//               </span>

//               {/* Course name */}
//               <span className="sched-page-course">
//                 {s.courseId?.title || 'Unknown Course'}
//               </span>

//               {/* Time */}
//               <span className="sched-time">
//                 🕐 {s.startTime} – {s.endTime}
//               </span>

//               {/* Location */}
//               {s.location && (
//                 <span className="td-muted" style={{ fontSize: 12 }}>
//                   📍 {s.location}
//                 </span>
//               )}

//               {/* Slots */}
//               <span className="sched-slots">
//                 {s.activeSlots}
//                 <br />
//                 <span className="sched-slots-label">Slots</span>
//               </span>

//               {/* Teacher */}
//               {s.teacher && (
//                 <span className="td-muted" style={{ fontSize: 12 }}>
//                   🎓 {s.teacher}
//                 </span>
//               )}

//               {/* Actions */}
//               <div className="sched-page-actions">
//                 {/* Toggle */}
//                 <Toggle
//                   active={s.isActive !== false}
//                   onChange={() => handleToggle(s._id)}
//                 />

//                 {/* Status label */}
//                 <span className={`status-pill ${s.isActive !== false ? 'status-active' : 'status-inactive'}`}>
//                   {s.isActive !== false ? 'Active' : 'Inactive'}
//                 </span>

//                 {/* Edit button */}
//                 <button
//                   className="action-icon-btn action-edit"
//                   title="Edit Session"
//                   onClick={() => setEdit(s)}
//                 >
//                   <EditIcon />
//                 </button>

//                 {/* Delete button */}
//                 <button
//                   className="action-icon-btn action-delete"
//                   title="Delete Session"
//                   onClick={() => handleDelete(s._id)}
//                 >
//                   <TrashIcon />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       ))}

//       {/* ── Edit Session Modal ── */}
//       {editSession && (
//         <EditSessionModal
//           session={editSession}
//           onClose={() => setEdit(null)}
//           onSaved={load}
//         />
//       )}
//     </div>
//   )
// }

// export default AdminSchedule

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  getAllSchedules, getCourses, createSchedule,
  updateSchedule, deleteSchedule, toggleScheduleStatus,
} from '../../services/adminService'

// ── Icons ─────────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)
const ChevLeft  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
const ChevRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>

// ── Constants ────────────────────────────────────────────────
const LOCATIONS     = ['Online', 'Face to Face']
const SESSION_TYPES = ['General', 'Theory', 'Practical', 'Exam']
const DAYS_SHORT    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS        = ['January','February','March','April','May','June','July','August','September','October','November','December']

// Event colors — one per course (cycle through palette)
const EVENT_PALETTE = [
  '#E74C3C','#3498DB','#2ECC71','#F39C12','#9B59B6',
  '#1ABC9C','#E67E22','#34495E','#E91E63','#00BCD4',
  '#8BC34A','#FF5722','#607D8B','#795548','#FF9800',
]

// ── Helpers ──────────────────────────────────────────────────
const today = () => {
  const d = new Date(); d.setHours(0,0,0,0); return d
}
const sameDay = (a,b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
const addDays = (d, n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r }
const startOfWeek = d => { const r=new Date(d); r.setDate(r.getDate()-r.getDay()); r.setHours(0,0,0,0); return r }
const startOfMonth = d => new Date(d.getFullYear(), d.getMonth(), 1)
const daysInMonth = d => new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()

const fmtTime = t => {
  if (!t) return ''
  const [h,m] = t.split(':')
  const hr = parseInt(h)
  return `${hr%12||12}:${m}${hr<12?'am':'pm'}`
}
const fmtDateLabel = d => d.toLocaleDateString('en-AU',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})
const fmtMonthYear = d => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
const fmtWeekRange = d => {
  const s = startOfWeek(d)
  const e = addDays(s,6)
  return `${MONTHS[s.getMonth()].slice(0,3)} ${s.getDate()} – ${s.getMonth()!==e.getMonth()?MONTHS[e.getMonth()].slice(0,3)+' ':''}${e.getDate()}, ${e.getFullYear()}`
}

// ── Add Event Modal ──────────────────────────────────────────
const AddEventModal = ({
  courses,
  prefillDate,
  prefillType,
  onClose,
  onSaved
}) => {
  const [form, setForm] = useState({
  eventTitle: prefillType || 'General',
  eventType: prefillType || 'General',
  courseId: '',
  date: prefillDate || new Date().toISOString().substring(0,10),
  startTime: '09:00',
  endTime: '17:00',
  location: 'Face to Face',
  activeSlots: 20,
  teacher: '',
})
  const [saving, setSaving] = useState(false)
  const setF = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleSubmit = async () => {
    if (!form.courseId) { alert('Please select a course.'); return }
    if (!form.date || !form.startTime || !form.endTime) { alert('Date, Start Time and End Time are required.'); return }
    setSaving(true)
    try {
      await createSchedule({
        courseId: form.courseId,
        date: form.date,
        sessionType: form.eventType,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location,
        activeSlots: Number(form.activeSlots),
        teacher: form.teacher || undefined,
      })
      onSaved(); onClose()
    } catch(e){ console.error(e); alert('Failed to schedule event.') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.stopPropagation()}>
      <div className="add-event-modal">
        <div className="add-event-header">
          <div>
            <h2>Add New Event</h2>
            <p>Schedule an event</p>
          </div>
          <button className="add-event-close" onClick={onClose}>✕</button>
        </div>
        <div className="add-event-body">
          <div className="ae-row">
            <div className="sched-field">
              <label>EVENT TITLE</label>
              <input value={form.eventTitle} onChange={e=>setF('eventTitle',e.target.value)} placeholder="e.g., General"/>
            </div>
            <div className="sched-field">
              <label>EVENT TYPE</label>
              <select value={form.eventType} onChange={e=>setF('eventType',e.target.value)}>
                {SESSION_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="sched-field" style={{marginBottom:12}}>
            <label>COURSE *</label>
            <select value={form.courseId} onChange={e=>setF('courseId',e.target.value)}>
              <option value="">Select a course</option>
              {courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
          <div className="ae-row">
            <div className="sched-field">
              <label>DATE</label>
              <input type="date" value={form.date} onChange={e=>setF('date',e.target.value)}/>
            </div>
            <div className="sched-field">
              <label>START TIME</label>
              <input type="time" value={form.startTime} onChange={e=>setF('startTime',e.target.value)}/>
            </div>
            <div className="sched-field">
              <label>END TIME</label>
              <input type="time" value={form.endTime} onChange={e=>setF('endTime',e.target.value)}/>
            </div>
          </div>
          <div className="sched-field" style={{marginBottom:12}}>
            <label>LOCATION</label>
            <select value={form.location} onChange={e=>setF('location',e.target.value)}>
              {LOCATIONS.map(l=><option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="sched-field" style={{marginBottom:12}}>
            <label>ACTIVE SLOTS *</label>
            <input type="number" value={form.activeSlots} onChange={e=>setF('activeSlots',e.target.value)} min="1"/>
          </div>
          <div className="sched-field" style={{marginBottom:12}}>
            <label>🎓 ASSIGN TEACHER (OPTIONAL)</label>
            <button type="button" className="assign-teacher-btn">🎓 Assign Teacher</button>
          </div>
        </div>
        <div className="add-event-footer">
          <button className="schedule-btn" onClick={handleSubmit} disabled={saving}>
            {saving?'Scheduling…':'+ Schedule Event'}
          </button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ── Edit Session Modal ───────────────────────────────────────
const EditSessionModal = ({ session, onClose, onSaved }) => {
  const [form, setForm] = useState({
    startTime: session.startTime||'',
    endTime: session.endTime||'',
    activeSlots: session.activeSlots||'',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSchedule(session._id, {
        startTime: form.startTime, endTime: form.endTime,
        activeSlots: Number(form.activeSlots),
      })
      onSaved(); onClose()
    } catch(e){ console.error(e); alert('Failed to update session.') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-backdrop inner-backdrop" onClick={e => e.stopPropagation()}>
      <div className="modal" style={{width:420}}>
        <div className="modal-top">
          <div><h2>Edit Session</h2><p className="page-sub">Update the start/end time and capacity.</p></div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div style={{padding:'16px 0'}}>
          <p style={{fontSize:12,color:'#888',marginBottom:2}}>Date</p>
          <p style={{fontWeight:600,marginBottom:14}}>{fmtDateLabel(new Date(session.date))}</p>
          {session.courseId?.title && <p style={{fontSize:13,color:'#555',marginBottom:14}}>{session.courseId.title}</p>}
          <div className="sched-form-grid">
            <div className="sched-field">
              <label>Start Time</label>
              <input type="time" value={form.startTime} onChange={e=>setForm(f=>({...f,startTime:e.target.value}))}/>
            </div>
            <div className="sched-field">
              <label>End Time</label>
              <input type="time" value={form.endTime} onChange={e=>setForm(f=>({...f,endTime:e.target.value}))}/>
            </div>
          </div>
          <div className="sched-field" style={{marginTop:12}}>
            <label>Active Slots</label>
            <input type="number" value={form.activeSlots} onChange={e=>setForm(f=>({...f,activeSlots:e.target.value}))}/>
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="red-btn" onClick={handleSave} disabled={saving}>{saving?'Saving…':'Save Changes'}</button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN AdminSchedule PAGE
// ══════════════════════════════════════════════════════════════
const AdminSchedule = () => {
    const [draggedSessionType, setDraggedSessionType] = useState(null)
  const [schedules, setSchedules]     = useState([])
  const [courses, setCourses]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [view, setView]               = useState('month')   // month | week | day | list
  const [currentDate, setCurrentDate] = useState(today())
  const [courseFilter, setCourseFilter] = useState('all')
  const [editSession, setEdit]        = useState(null)
  const [addEventDate, setAddEventDate] = useState(null)   // date string for modal
  const [showAddEvent, setShowAddEvent] = useState(false)
const [draggedType, setDraggedType] = useState('General')
  // Course color map
  const courseColorMap = useRef({})
  const getColor = (courseId) => {
    if (!courseColorMap.current[courseId]) {
      const keys = Object.keys(courseColorMap.current)
      courseColorMap.current[courseId] = EVENT_PALETTE[keys.length % EVENT_PALETTE.length]
    }
    return courseColorMap.current[courseId]
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, cRes] = await Promise.all([getAllSchedules(), getCourses()])
      const sched = sRes.data.schedules || sRes.data.data || []
      const crses = cRes.data.courses || []
      setSchedules(sched)
      setCourses(crses)
    } catch(e){ console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session?')) return
    try { await deleteSchedule(id); load() } catch(e){ console.error(e) }
  }

  const handleToggle = async (id) => { try { await toggleScheduleStatus(id); load() } catch(e){ console.error(e) } }

  // Filter by course
  const filtered = courseFilter === 'all'
    ? schedules
    : schedules.filter(s => (s.courseId?._id || s.courseId) === courseFilter)

  // Build date → events map
  const eventsMap = filtered.reduce((acc, s) => {
    const d = s.date?.substring(0,10)
    if (!d) return acc
    if (!acc[d]) acc[d] = []
    acc[d].push(s)
    return acc
  }, {})

  const getEventsForDate = (d) => {
    const key = d.toISOString().substring(0,10)
    return eventsMap[key] || []
  }

  // Navigation
  const nav = (dir) => {
    const d = new Date(currentDate)
    if (view==='month')     { d.setMonth(d.getMonth()+dir) }
    else if (view==='week') { d.setDate(d.getDate()+dir*7) }
    else if (view==='day')  { d.setDate(d.getDate()+dir) }
    setCurrentDate(d)
  }

  const viewLabel = () => {
    if (view==='month') return fmtMonthYear(currentDate)
    if (view==='week')  return fmtWeekRange(currentDate)
    if (view==='day')   return fmtDateLabel(currentDate)
    return fmtMonthYear(currentDate)
  }

  // ── Event chip component ──
  const EventChip = ({ s, short }) => {
    const courseId = s.courseId?._id || s.courseId || ''
    const color    = getColor(courseId)
    const title    = s.courseId?.title || s.courseTitle || 'Course'
    return (
      <div
        className="cal-event-chip"
        style={{background: color}}
        title={`${title} | ${s.sessionType} | ${s.startTime}–${s.endTime} | ${s.activeSlots} slots`}
      >
        {short
          ? <span className="chip-short">{title.slice(0,10)}{title.length>10?'…':''} {fmtTime(s.startTime)}</span>
          : <span>{title} | {s.sessionType} {fmtTime(s.startTime)}</span>
        }
      </div>
    )
  }

  // ── MONTH VIEW ──
  const MonthView = () => {
    const first = startOfMonth(currentDate)
    const firstDow = first.getDay()
    const dim = daysInMonth(currentDate)
    const cells = []
    for (let i=0; i<firstDow; i++) cells.push(null)
    for (let i=1; i<=dim; i++) cells.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))

    return (
      <div className="cal-month">
        <div className="cal-month-header">
          {DAYS_SHORT.map(d=><div key={d} className="cal-month-dow">{d}</div>)}
        </div>
        <div className="cal-month-grid">
          {cells.map((d, idx) => {
            if (!d) return <div key={`e${idx}`} className="cal-month-cell cal-month-cell--empty"/>
            const events = getEventsForDate(d)
            const isToday = sameDay(d, today())
            const MAX_SHOW = 3
            return (
       <div
  key={d.toISOString()}
  className={`cal-month-cell`}
  onDragOver={(e) => e.preventDefault()}
  onDrop={() => handleCalendarDrop(d)}
  onClick={() => {
    setCurrentDate(d)
    setView('day')
  }}
>
                <div className={`cal-month-num ${isToday?'cal-month-num--today':''}`}>{d.getDate()}</div>
                <div className="cal-month-events">
                  {events.slice(0, MAX_SHOW).map(s => <EventChip key={s._id} s={s} short/>)}
                  {events.length > MAX_SHOW && (
                    <div className="cal-more-link">+{events.length-MAX_SHOW} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── WEEK VIEW ──
  const WeekView = () => {
    const ws = startOfWeek(currentDate)
    const days = Array.from({length:7}, (_,i) => addDays(ws,i))
    const hours = Array.from({length:24}, (_,i) => i)

    return (
      <div className="cal-week">
        <div className="cal-week-header">
          <div className="cal-time-gutter"/>
          {days.map(d => {
            const isToday = sameDay(d, today())
            return (
              <div key={d.toISOString()} className={`cal-week-col-head ${isToday?'cal-week-col-head--today':''}`}>
                <div className="cal-week-dow">{DAYS_SHORT[d.getDay()]} {d.getDate()}/{d.getMonth()+1}</div>
              </div>
            )
          })}
        </div>
        <div className="cal-week-body">
          <div className="cal-week-times">
            {hours.map(h => (
              <div key={h} className="cal-week-hour-cell">
                <span className="cal-time-label">{h===0?'12am':h<12?`${h}am`:h===12?'12pm':`${h-12}pm`}</span>
              </div>
            ))}
          </div>
          {days.map(d => {
            const events = getEventsForDate(d)
            return (
              <div
  key={d.toISOString()}
  className="cal-week-day-col"
  onDragOver={(e) => e.preventDefault()}
  onDrop={() => handleCalendarDrop(d)}
>
                {hours.map(h => <div key={h} className="cal-week-day-hour-cell"/>)}
                {events.map(s => {
                  const [sh,sm] = (s.startTime||'08:00').split(':').map(Number)
                  const [eh,em] = (s.endTime||'17:00').split(':').map(Number)
                  const top  = (sh + sm/60) * 60
                  const height = ((eh+em/60) - (sh+sm/60)) * 60
                  const color = getColor(s.courseId?._id||s.courseId||'')
                  const title = s.courseId?.title || 'Course'
                  return (
                    <div
                      key={s._id}
                      className="cal-week-event"
                      style={{top:top, height:Math.max(height,24), background:color}}
                      title={`${title}\n${s.sessionType} | ${s.startTime}–${s.endTime}\n${s.activeSlots} slots`}
                    >
                      <span className="cal-week-event-title">{title.slice(0,14)}{title.length>14?'…':''}</span>
                      <span className="cal-week-event-time">{fmtTime(s.startTime)}</span>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── DAY VIEW ──
  const DayView = () => {
    const events = getEventsForDate(currentDate)
    const hours  = Array.from({length:24}, (_,i) => i)

    return (
      <div className="cal-day">
        <div className="cal-day-header">
          <div className="cal-time-gutter"/>
          <div className="cal-day-col-head">
            <strong>{DAYS_SHORT[currentDate.getDay()]}, {currentDate.getDate()} {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</strong>
          </div>
        </div>
        <div className="cal-day-body">
          <div className="cal-week-times">
            {hours.map(h => (
              <div key={h} className="cal-week-hour-cell">
                <span className="cal-time-label">{h===0?'12am':h<12?`${h}am`:h===12?'12pm':`${h-12}pm`}</span>
              </div>
            ))}
          </div>
          <div
  className="cal-day-col"
  style={{ position:'relative', flex:1 }}
  onDragOver={(e) => e.preventDefault()}
  onDrop={() => handleCalendarDrop(currentDate)}
>
            {hours.map(h => <div key={h} className="cal-week-day-hour-cell"/>)}
            {events.map(s => {
              const [sh,sm] = (s.startTime||'08:00').split(':').map(Number)
              const [eh,em] = (s.endTime||'17:00').split(':').map(Number)
              const top    = (sh + sm/60) * 60
              const height = ((eh+em/60) - (sh+sm/60)) * 60
              const color  = getColor(s.courseId?._id||s.courseId||'')
              const title  = s.courseId?.title || 'Course'
              return (
                <div key={s._id} className="cal-week-event cal-day-event"
                  style={{top, height:Math.max(height,40), background:color}}
                  title={`${title} | ${s.sessionType} | ${s.startTime}–${s.endTime}`}>
                  <div className="cal-day-event-title">{title}</div>
                  <div className="cal-day-event-sub">{s.sessionType} · {fmtTime(s.startTime)} – {fmtTime(s.endTime)}</div>
                  <div className="cal-day-event-sub">{s.activeSlots} slots · {s.location||''}</div>
                  <div className="cal-day-event-actions">
                    <button onClick={e=>{e.stopPropagation();setEdit(s)}} title="Edit"><EditIcon/></button>
                    <button onClick={e=>{e.stopPropagation();handleDelete(s._id)}} title="Delete"><TrashIcon/></button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── LIST VIEW ──
  const ListView = () => {
    // Show events for the month
    const monthStart = startOfMonth(currentDate)
    const monthEnd   = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0)
    const listDays   = []
    const cur = new Date(monthStart)
    while (cur <= monthEnd) { listDays.push(new Date(cur)); cur.setDate(cur.getDate()+1) }

    const hasAny = listDays.some(d => getEventsForDate(d).length > 0)
    if (!hasAny) return <div className="cal-list-empty">No events this month.</div>

    return (
      <div className="cal-list">
        {listDays.map(d => {
          const events = getEventsForDate(d)
          if (!events.length) return null
          const isToday = sameDay(d, today())
          return (
            <div key={d.toISOString()} className="cal-list-day">
              <div className={`cal-list-date ${isToday?'cal-list-date--today':''}`}>
                {d.toLocaleDateString('en-AU',{weekday:'short',day:'2-digit',month:'long',year:'numeric'}).toUpperCase()}
              </div>
              {events.map(s => {
                const color = getColor(s.courseId?._id||s.courseId||'')
                const title = s.courseId?.title || 'Course'
                return (
                  <div key={s._id} className="cal-list-row">
                    <div className="cal-list-time">{fmtTime(s.startTime)} - {fmtTime(s.endTime)}</div>
                    <div className="cal-list-info">
                      <div className="cal-list-dot" style={{background:color}}/>
                      <div>
                        <strong>{title.split('|')[0].trim()}</strong>
                        <span className="cal-list-sub"> | {title.split('|').slice(1).join('|').trim() || s.sessionType}</span>
                      </div>
                    </div>
                    <div className="cal-list-actions">
                      <button className="action-icon-btn action-edit" title="Edit" onClick={()=>setEdit(s)}><EditIcon/></button>
                      <button className="action-icon-btn action-delete" title="Delete" onClick={()=>handleDelete(s._id)}><TrashIcon/></button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

 const handleCalendarDrop = (date) => {
  if (!draggedSessionType) return

  setDraggedType(draggedSessionType)

  setAddEventDate(date.toISOString().substring(0, 10))

  setShowAddEvent(true)

  setDraggedSessionType(null)
}

const handleDeleteOld = async () => {
  if (!window.confirm('Delete all expired schedules?')) return

  await deleteOldSchedules()

  load()
}
  const totalActive   = schedules.filter(s=>s.isActive!==false).length
  const totalInactive = schedules.filter(s=>s.isActive===false).length

  return (
    <div className="sched-page-layout">
      {/* ── Left Sidebar ── */}
      <aside className="sched-sidebar">
        <div className="sched-sidebar-section">
          <p className="sched-sidebar-label">Drag-n-Drop Events</p>
          <p className="sched-sidebar-hint">Drag these onto the calendar:</p>
          {SESSION_TYPES.map(t => (
            <div
  key={t}
  className="sched-drag-chip"
  draggable
  onDragStart={() => setDraggedSessionType(t)}
>

              <span className="drag-dots">⠿</span> {t}
            </div>
          ))}
        </div>

        <button className="add-event-manually-btn" onClick={() => setShowAddEvent(true)}>
          + Add Event Manually
        </button>

        <div className="sched-sidebar-section" style={{marginTop:20}}>
          <p className="sched-sidebar-label">Event Status:</p>
          <div className="event-status-list">
            <div className="event-status-item"><span className="event-status-dot dot-scheduled"/><span>Scheduled</span></div>
            <div className="event-status-item"><span className="event-status-dot dot-completed"/><span>Completed</span></div>
            <div className="event-status-item"><span className="event-status-dot dot-cancelled"/><span>Cancelled</span></div>
          </div>
        </div>

        {!loading && (
          <div className="sched-sidebar-section" style={{marginTop:16}}>
            <p className="sched-sidebar-label">Stats</p>
            <div className="sched-stat-row"><span>Total</span><strong>{schedules.length}</strong></div>
            <div className="sched-stat-row" style={{color:'#2E7D32'}}><span>Active</span><strong>{totalActive}</strong></div>
            <div className="sched-stat-row" style={{color:'#E65100'}}><span>Inactive</span><strong>{totalInactive}</strong></div>
          </div>
        )}
      </aside>

      {/* ── Main Calendar Area ── */}
      <div className="sched-main">
        {/* ── Toolbar ── */}
        <div className="cal-toolbar">
          <div className="cal-toolbar-left">
            <button className="cal-today-btn" onClick={() => setCurrentDate(today())}>today</button>
            <button className="cal-nav-btn" onClick={() => nav(-1)}><ChevLeft/></button>
            <button className="cal-nav-btn" onClick={() => nav(1)}><ChevRight/></button>
            <span className="cal-view-label">{viewLabel()}</span>
          </div>
          <div className="cal-toolbar-right">
         <button
  className="cal-delete-old-btn"
  onClick={handleDeleteOld}
>
  🗑 Delete old schedules
</button>
            <div className="cal-course-filter">
              <select value={courseFilter} onChange={e=>setCourseFilter(e.target.value)}>
                <option value="all">All courses</option>
                {courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
            {['month','week','day','list'].map(v => (
              <button key={v} className={`cal-view-btn ${view===v?'active':''}`} onClick={()=>setView(v)}>{v}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="cal-loading">
            {Array.from({length:5},(_,i)=><div key={i} className="skeleton-cell" style={{height:80,marginBottom:8,borderRadius:8}}/>)}
          </div>
        ) : (
          <>
            {view==='month' && <MonthView/>}
            {view==='week'  && <WeekView/>}
            {view==='day'   && <DayView/>}
            {view==='list'  && <ListView/>}
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {showAddEvent && (
   <AddEventModal
  courses={courses}
  prefillDate={addEventDate}
  prefillType={draggedType}
  onClose={() => {
    setShowAddEvent(false)
    setAddEventDate(null)
  }}
  onSaved={load}
/>
      )}
      {editSession && (
        <EditSessionModal session={editSession} onClose={() => setEdit(null)} onSaved={load}/>
      )}
    </div>
  )
}

export default AdminSchedule