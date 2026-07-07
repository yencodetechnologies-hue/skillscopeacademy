import React, { useState, useEffect, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import "../styles/Schedule.css";
import { API_URL } from "../data/service";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ─────────────────────────────────────────────────────────── */
/*  CONFIG                                                      */
/* ─────────────────────────────────────────────────────────── */


const COURSE_COLORS = [
  "#f97316","#02afef","#06b6d4","#10b981",
  "#f59e0b","#ef4444","#3b82f6","#ec4899",
  "#14b8a6","#02afef","#84cc16","#f43f5e",
];

const VIEWS = [
  { key: "dayGridMonth", label: "month" },
  { key: "timeGridWeek", label: "week"  },
  { key: "timeGridDay",  label: "day"   },
  { key: "listMonth",    label: "list"  },
];

const SESSION_TYPES = ["General","Theory","Practical","Exam"];
const LOCATIONS     = ["Face to Face","Online","Hybrid"];

const EMPTY_FORM = {
  title:     "General",
  eventType: "General",
  course:    "",
  date:      new Date().toISOString().split("T")[0],
  startTime: "09:00",
  endTime:   "17:00",
  location:  "Face to Face",
  availableSlots: 20,
};

/* ─────────────────────────────────────────────────────────── */
/*  HELPERS                                                     */
/* ─────────────────────────────────────────────────────────── */
function to24(t = "") {
  if (!t) return "08:00:00";
  if (/^\d{1,2}:\d{2}$/.test(t)) return t + ":00";
  const m = t.match(/(\d+):?(\d*)(am|pm)/i);
  if (!m) return "08:00:00";
  let h = parseInt(m[1]), min = m[2] ? parseInt(m[2]) : 0;
  if (m[3].toLowerCase() === "pm" && h !== 12) h += 12;
  if (m[3].toLowerCase() === "am" && h === 12) h = 0;
  return `${String(h).padStart(2,"0")}:${String(min).padStart(2,"0")}:00`;
}

/* ─────────────────────────────────────────────────────────── */
/*  EVENT RENDERERS                                             */
/* ─────────────────────────────────────────────────────────── */
function MonthEvent({ event }) {
  return (
    <div className="ev-month">
      <span className="ev-clock">⏰</span>
      <span className="ev-label">{event.extendedProps.code} {event.extendedProps.shortTime}</span>
    </div>
  );
}

function WeekEvent({ event, timeText }) {
  return (
    <div className="ev-week">
      <div className="ev-code">{event.extendedProps.code}</div>
      <div className="ev-desc">{event.extendedProps.description}</div>
      <div className="ev-time">⏰ {timeText}</div>
    </div>
  );
}

function DayEvent({ event, timeText }) {
  return (
    <div className="ev-day">
      <strong>{event.extendedProps.code}</strong>
      <span>{event.extendedProps.description}</span>
      <small>⏰ {timeText}</small>
    </div>
  );
}

function ListEvent({ event }) {
  return (
    <div className="ev-list-row">
      <strong>{event.extendedProps.code}</strong>
      <span className="ev-sep"> | </span>
      <span>{event.extendedProps.description}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                              */
/* ─────────────────────────────────────────────────────────── */
function Schedule() {
  const calRef          = useRef(null);
  const extRef          = useRef(null);
  const draggableInited = useRef(false);

  const [events,         setEvents]         = useState([]);
  const [courses,        setCourses]        = useState([]);
  const [colorMap,       setColorMap]       = useState({});
  const [currentView,    setCurrentView]    = useState("dayGridMonth");
  const [calTitle,       setCalTitle]       = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [courseOpen,     setCourseOpen]     = useState(false);
  const [showModal,      setShowModal]      = useState(false);
  const [form,           setForm]           = useState(EMPTY_FORM);
  const [loading,        setLoading]        = useState(false);
  const [toast,          setToast]          = useState(null);

  /* ── toast ── */
  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── update calendar title ── */
  const syncTitle = () => {
    const api = calRef.current?.getApi();
    if (api) setCalTitle(api.view.title);
  };

  /* ── fetch courses ── */
  useEffect(() => {
    fetch(`${API_URL}/api/courses`)
      .then(r => r.json())
      .then(data => {
        setCourses(data);
        const map = {};
        data.forEach((c, i) => { map[c._id] = COURSE_COLORS[i % COURSE_COLORS.length]; });
        setColorMap(map);
      })
      .catch(console.error);
  }, []);

  /* ── map schedule → FC event ── */
  const toFCEvent = useCallback((item) => {
    const dateStr = new Date(item.date).toISOString().split("T")[0];
    const color   = colorMap[item.course?.id] || "#02afef";
    return {
      id:              item.sessionId,
      title:           item.course?.title || "Course",
      start:           `${dateStr}T${to24(item.startTime)}`,
      end:             `${dateStr}T${to24(item.endTime)}`,
      backgroundColor: color,
      borderColor:     color,
      textColor:       "#fff",
      extendedProps: {
        code:        item.course?.title?.split(" ")[0] || "",
        description: item.course?.title || "",
        shortTime:   item.startTime || "",
        scheduleId:  item.scheduleId,
        sessionId:   item.sessionId,
        slots:       item.availableSlots,
        spotsType:   item.spotsType,
      },
    };
  }, [colorMap]);

  /* ── fetch all upcoming ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/schedules/upcoming?limit=1000`);
      const data = await res.json();
      setEvents(data.map(toFCEvent));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [toFCEvent]);

  useEffect(() => {
    if (Object.keys(colorMap).length > 0) fetchAll();
  }, [colorMap, fetchAll]);

  /* ── fetch by course ── */
  const fetchByCourse = async (courseId) => {
    setLoading(true);
    try {
      const res   = await fetch(`${API_URL}/api/schedules/course/${courseId}`);
      const data  = await res.json();
      const color = colorMap[courseId] || "#02afef";
      const fc    = [];
      data.forEach(schedule => {
        schedule.sessions?.forEach(s => {
          if (s.status !== "Active") return;
          const dateStr = new Date(schedule.date).toISOString().split("T")[0];
          const course  = courses.find(c => c._id === (schedule.course?._id || schedule.course));
          fc.push({
            id:              s._id,
            title:           course?.title || "Course",
            start:           `${dateStr}T${s.startTime}:00`,
            end:             `${dateStr}T${s.endTime}:00`,
            backgroundColor: color,
            borderColor:     color,
            textColor:       "#fff",
            extendedProps: {
              code:        course?.title?.split(" ")[0] || "",
              description: course?.title || "",
              shortTime:   s.startTime || "",
            },
          });
        });
      });
      setEvents(fc);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* ── external draggable ── */
  useEffect(() => {
    if (extRef.current && !draggableInited.current) {
      new Draggable(extRef.current, {
        itemSelector: ".ext-ev",
        eventData: el => ({ title: el.dataset.title || "General", duration: "08:00" }),
      });
      draggableInited.current = true;
    }
  }, []);

  /* ── nav helpers ── */
  const navToday = () => { calRef.current?.getApi().today(); setTimeout(syncTitle, 50); };
  const navPrev  = () => { calRef.current?.getApi().prev();  setTimeout(syncTitle, 50); };
  const navNext  = () => { calRef.current?.getApi().next();  setTimeout(syncTitle, 50); };

  /* ── view switch ── */
  const switchView = (key) => {
    calRef.current?.getApi().changeView(key);
    setCurrentView(key);
    setTimeout(syncTitle, 50);
  };

  /* ── course filter ── */
  const selectCourse = (id) => {
    setSelectedCourse(id);
    setCourseOpen(false);
    if (id === "all") fetchAll();
    else fetchByCourse(id);
  };

  /* ── date click → open modal ── */
  const onDateClick = (info) => {
    setForm({ ...EMPTY_FORM, date: info.dateStr });
    setShowModal(true);
  };

  /* ── external drop → open modal ── */
  const onExternalDrop = (info) => {
    setForm({ ...EMPTY_FORM, date: info.dateStr });
    setShowModal(true);
    info.revert();
  };

  /* ── submit new session ── */
  const handleSubmit = async () => {
    if (!form.course) { notify("Please select a course", "error"); return; }
    try {
      const res = await fetch(`${API_URL}/api/schedules/session`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          course: form.course,
          date:   form.date,
          session: {
            sessionType:    form.eventType,
            startTime:      form.startTime,
            endTime:        form.endTime,
            location:       form.location,
            availableSlots: Number(form.availableSlots),
            status:         "Active",
          },
        }),
      });
      if (res.ok) {
        setShowModal(false);
        notify("Event scheduled successfully!");
        fetchAll();
      } else {
        notify("Failed to schedule event", "error");
      }
    } catch { notify("Server error", "error"); }
  };

  /* ── delete old schedules ── */
  const deleteOld = () => {
    if (window.confirm("Delete all past schedules with no enrollments? This cannot be undone.")) {
      notify("Old schedules deleted");
      // call your DELETE endpoint here
    }
  };

  /* ── event content ── */
  const renderEvent = (info) => {
    const vt = info.view.type;
    const { event, timeText } = info;
    if (vt === "dayGridMonth")                     return <MonthEvent event={event} />;
    if (vt === "timeGridWeek")                     return <WeekEvent  event={event} timeText={timeText} />;
    if (vt === "timeGridDay")                      return <DayEvent   event={event} timeText={timeText} />;
    if (vt === "listMonth" || vt === "listWeek")   return <ListEvent  event={event} />;
    return null;
  };

  const courseName =
    selectedCourse === "all"
      ? "All courses"
      : (courses.find(c => c._id === selectedCourse)?.title?.slice(0, 28) || "All courses");

  /* ── JSX ─────────────────────────────────────────────────── */
  return (
    <div className="sch-page">

      {/* Toast */}
      {toast && <div className={`sch-toast sch-toast--${toast.type}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="sch-header">
        <h1>Class &amp; Exam Scheduling</h1>
        <p>Drag and drop events to schedule</p>
      </div>

      {/* Sync banner */}
      <div className="sch-banner">
        <span className="banner-icon">ℹ</span>
        <span>
          <strong>Synced with Course Dates:</strong> Events scheduled here are
          automatically synced with the "Manage Course Dates" feature in Course
          Management. Changes made in either place will reflect in both views.
        </span>
      </div>

      {/* Body */}
      <div className="sch-body">

        {/* ══ Sidebar ══ */}
        <aside className="sch-sidebar">
          <div className="sb-card">
            <h3 className="sb-head">Drag-n-Drop Events</h3>
            <p className="sb-sub">Drag these onto the calendar:</p>

            <div ref={extRef} className="ext-events-container">
              <div className="ext-ev" data-title="General">
                <span className="drag-dots">⠿</span>
                General
              </div>
            </div>

            <button
              className="btn-add-manual"
              onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}
            >
              <span className="plus-icon">+</span> Add Event Manually
            </button>

            <div className="legend">
              <h4>Event Status:</h4>
              <div className="legend-row"><span className="dot dot--scheduled"></span>Scheduled</div>
              <div className="legend-row"><span className="dot dot--completed"></span>Completed</div>
              <div className="legend-row"><span className="dot dot--cancelled"></span>Cancelled</div>
            </div>
          </div>
        </aside>

        {/* ══ Calendar ══ */}
        <div className="sch-cal">

          {/* Custom Toolbar */}
          <div className="cal-toolbar">
            <div className="tb-left">
              <button className="btn-today" onClick={navToday}>today</button>
              <button className="btn-arrow" onClick={navPrev}>‹</button>
              <button className="btn-arrow" onClick={navNext}>›</button>
              <span className="tb-title">{calTitle}</span>
            </div>

            <div className="tb-right">
              <button className="btn-del-old" onClick={deleteOld}>
                🗑 Delete old schedules
              </button>

              {/* Course dropdown */}
              <div
                className="course-dd"
                tabIndex={0}
                onBlur={() => setCourseOpen(false)}
              >
                <button
                  className="course-dd-btn"
                  onClick={() => setCourseOpen(o => !o)}
                >
                  📋 <span className="dd-label">{courseName}</span>
                  <span className="dd-caret">{courseOpen ? "▲" : "▼"}</span>
                </button>

                {courseOpen && (
                  <div className="course-dd-menu">
                    <div
                      className={`dd-opt ${selectedCourse === "all" ? "dd-opt--active" : ""}`}
                      onMouseDown={() => selectCourse("all")}
                    >
                      All courses
                      {selectedCourse === "all" && <span className="dd-check">✓</span>}
                    </div>
                    {courses.map(c => (
                      <div
                        key={c._id}
                        className={`dd-opt ${selectedCourse === c._id ? "dd-opt--active" : ""}`}
                        onMouseDown={() => selectCourse(c._id)}
                      >
                        {c.title}
                        {selectedCourse === c._id && <span className="dd-check">✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* View tabs */}
              <div className="view-tabs">
                {VIEWS.map(v => (
                  <button
                    key={v.key}
                    className={`view-tab ${currentView === v.key ? "view-tab--on" : ""}`}
                    onClick={() => switchView(v.key)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading bar */}
          {loading && <div className="loading-bar" />}

          {/* FullCalendar */}
          <FullCalendar
            ref={calRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false}
            events={events}
            editable={true}
            droppable={true}
            dayMaxEvents={3}
            moreLinkText={n => `+${n} more`}
            moreLinkClassNames="fc-more-link"
            dateClick={onDateClick}
            drop={onExternalDrop}
            eventContent={renderEvent}
            viewDidMount={syncTitle}
            datesSet={syncTitle}
            height="auto"
            nowIndicator={true}
            noEventsText="No events"
            listDayFormat={{ weekday: "short", month: "long", day: "numeric" }}
            listDaySideFormat={false}
          />
        </div>
      </div>

      {/* ══ Modal ══ */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>

            <div className="modal-head">
              <div>
                <h2>Add New Event</h2>
                <p>Schedule an event</p>
              </div>
              <button className="modal-x" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">

              <div className="f-row">
                <div className="f-group">
                  <label>Event Title</label>
                  <input
                    type="text"
                    placeholder="General"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="f-group">
                  <label>Event Type</label>
                  <select
                    value={form.eventType}
                    onChange={e => setForm({ ...form, eventType: e.target.value })}
                  >
                    {SESSION_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="f-group f-full">
                <label>Course <span className="req-star">*</span></label>
                <select
                  value={form.course}
                  onChange={e => setForm({ ...form, course: e.target.value })}
                >
                  <option value="">Select a course</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="f-row f-row--3">
                <div className="f-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="f-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                  />
                </div>
                <div className="f-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={e => setForm({ ...form, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="f-group f-full">
                <label>Location</label>
                <select
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                >
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              
              <div className="f-group f-full">
                <label>Active Slots *</label>
                <input
                  type="number"
                  placeholder="e.g. 20"
                  value={form.availableSlots}
                  onChange={e => setForm({ ...form, availableSlots: e.target.value })}
                />
              </div>

              <div className="f-group f-full">
                <label>🎓 Assign Teacher (Optional)</label>
                <button type="button" className="btn-assign">🎓 Assign Teacher</button>
              </div>

            </div>

            <div className="modal-foot">
              <button className="btn-schedule" onClick={handleSubmit}>
                + Schedule Event
              </button>
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Schedule;