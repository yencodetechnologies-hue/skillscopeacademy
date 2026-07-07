import { useState, useEffect } from "react";
import "./StudentSchedule.css";
import { API_URL } from "../../data/service";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const typeConfig = {
  theory:    { label: "Theory Class",      color: "#02afef", bg: "#eef2ff" },
  practical: { label: "Practical Session", color: "#02afef", bg: "#f0faff" },
  exam:      { label: "Exam",              color: "#10b981", bg: "#d1fae5" },
  general:   { label: "General",           color: "#94a3b8", bg: "#f1f5f9" },
};

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDay(year, month) { return new Date(year, month, 1).getDay(); }
function pad(n) { return String(n).padStart(2, "0"); }
function toKey(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

export default function StudentSchedule() {
  const today = new Date();
  const [view, setView] = useState("month");
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Dashboard API-லிருந்து booked sessions fetch
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const studentId = user?.id;
        if (!studentId) return;

        const res = await fetch(`${API_URL}/api/student/dashboard/${studentId}`);
        const data = await res.json();

        // ✅ enrolledCourses-லிருந்து events build பண்ணு
        const builtEvents = (data.enrolledCourses || [])
          .filter(c => c.sessionDate)
          .map((c, i) => ({
            id: i + 1,
            date: new Date(c.sessionDate).toISOString().split("T")[0],
            title: c.courseName,
            type: "general",
            time: c.startTime && c.endTime ? `${c.startTime} – ${c.endTime}` : "Time not set",
            location: "Face to Face",
            meeting: ""
          }));

        setEvents(builtEvents);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const eventsByDate = {};
  events.forEach(e => {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date].push(e);
  });

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const listDays = Array.from({ length: getDaysInMonth(year, month) }, (_, i) => {
    const key = toKey(year, month, i + 1);
    return { day: i + 1, key, events: eventsByDate[key] || [] };
  });

  const dayEvents = selectedDay ? (eventsByDate[selectedDay] || []) : [];

  if (loading) return <div>Loading...</div>;

  return (
    <div className="sc-wrapper">
      <div className="sc-header">
        <h1 className="sc-title">My Schedule</h1>
        <p className="sc-subtitle">View your class and exam schedule for enrolled courses</p>
      </div>

      <div className="sc-info-banner">
        <span className="sc-info-icon">ℹ</span>
        <p><strong>Schedule Information:</strong> This calendar shows all scheduled events for your enrolled courses with verified payments. Click on any event to view details including location and meeting links.</p>
      </div>

      <div className="sc-controls">
        <div className="sc-nav">
          <button className="sc-nav-btn sc-today-btn" onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}>today</button>
          <button className="sc-nav-btn sc-arrow" onClick={prevMonth}>‹</button>
          <button className="sc-nav-btn sc-arrow" onClick={nextMonth}>›</button>
          <span className="sc-period">
            {view === "week"
              ? `${weekDays[0].toLocaleDateString("en-AU",{month:"short",day:"numeric"})} – ${weekDays[6].toLocaleDateString("en-AU",{month:"short",day:"numeric",year:"numeric"})}`
              : view === "day" && selectedDay
              ? new Date(selectedDay + "T00:00:00").toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"})
              : `${MONTHS[month]} ${year}`}
          </span>
        </div>
        <div className="sc-view-tabs">
          {["month","week","day","list"].map(v => (
            <button key={v} className={`sc-view-btn ${view === v ? "sc-view-btn--active" : ""}`} onClick={() => setView(v)}>{v}</button>
          ))}
        </div>
      </div>

      <div className="sc-legend">
        <span className="sc-legend-label">Event Types:</span>
        {Object.entries(typeConfig).map(([k, v]) => (
          <span key={k} className="sc-legend-item">
            <span className="sc-legend-dot" style={{ background: v.color }} />
            {v.label}
          </span>
        ))}
      </div>

      {/* Month View */}
      {view === "month" && (
        <div className="sc-calendar">
          <div className="sc-cal-header">
            {DAYS.map(d => <div key={d} className="sc-cal-day-name">{d}</div>)}
          </div>
          <div className="sc-cal-grid">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="sc-cal-cell sc-cal-cell--empty" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const key = toKey(year, month, d);
              const dayEvs = eventsByDate[key] || [];
              const isToday = key === todayKey;
              const isSelected = key === selectedDay;
              return (
                <div
                  key={d}
                  className={`sc-cal-cell ${isToday ? "sc-cal-cell--today" : ""} ${isSelected ? "sc-cal-cell--selected" : ""}`}
                  onClick={() => { setSelectedDay(key); setView("day"); }}
                >
                  <span className="sc-cal-num">{d}</span>
                  <div className="sc-cal-events">
                    {dayEvs.slice(0, 2).map(e => (
                      <div key={e.id} className="sc-cal-event-dot" style={{ background: typeConfig[e.type].color }} title={e.title} />
                    ))}
                    {dayEvs.length > 2 && <span className="sc-cal-more">+{dayEvs.length - 2}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {view === "week" && (
        <div className="sc-calendar">
          <div className="sc-week-grid">
            {weekDays.map((d, i) => {
              const key = toKey(d.getFullYear(), d.getMonth(), d.getDate());
              const dayEvs = eventsByDate[key] || [];
              const isToday = key === todayKey;
              return (
                <div key={i} className={`sc-week-col ${isToday ? "sc-week-col--today" : ""}`}>
                  <div className="sc-week-header">
                    <span className="sc-week-dayname">{DAYS[i]}</span>
                    <span className={`sc-week-date ${isToday ? "sc-week-date--today" : ""}`}>{d.getDate()}</span>
                  </div>
                  <div className="sc-week-events">
                    {dayEvs.map(e => (
                      <div key={e.id} className="sc-week-event"
                        style={{ background: typeConfig[e.type].bg, borderLeft: `3px solid ${typeConfig[e.type].color}` }}
                        onClick={() => setSelectedEvent(e)}>
                        <span className="sc-week-event-title">{e.title}</span>
                        <span className="sc-week-event-time">{e.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {view === "day" && (
        <div className="sc-calendar sc-day-view">
          {selectedDay ? (
            <>
              <div className="sc-day-header">
                <div className="sc-day-label">
                  {new Date(selectedDay + "T00:00:00").toLocaleDateString("en-AU", { weekday: "long" })}
                </div>
                <div className={`sc-day-num ${selectedDay === todayKey ? "sc-day-num--today" : ""}`}>
                  {new Date(selectedDay + "T00:00:00").getDate()}
                </div>
                <div className="sc-day-month">
                  {new Date(selectedDay + "T00:00:00").toLocaleDateString("en-AU", { month: "long", year: "numeric" })}
                </div>
              </div>
              <div className="sc-day-events">
                {dayEvents.length === 0
                  ? <div className="sc-empty"><span>📅</span><p>No events scheduled for this day</p></div>
                  : dayEvents.map(e => (
                    <div key={e.id} className="sc-day-event"
                      style={{ borderLeft: `4px solid ${typeConfig[e.type].color}`, background: typeConfig[e.type].bg }}
                      onClick={() => setSelectedEvent(e)}>
                      <div className="sc-day-event-type" style={{ color: typeConfig[e.type].color }}>{typeConfig[e.type].label}</div>
                      <div className="sc-day-event-title">{e.title}</div>
                      <div className="sc-day-event-meta">
                        <span>⏱ {e.time}</span>
                        <span>📍 {e.location}</span>
                        {e.meeting && <a href={e.meeting} target="_blank" rel="noreferrer" className="sc-meeting-link">🔗 Join Meeting</a>}
                      </div>
                    </div>
                  ))
                }
              </div>
            </>
          ) : (
            <div className="sc-empty"><span>📅</span><p>Click a date on the month view to see events</p></div>
          )}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="sc-calendar">
          <div className="sc-list">
            <div className="sc-list-header">
              <span>Date</span>
              <span>Events</span>
            </div>
            {listDays.map(({ day, key, events: dayEvs }) => {
              const isToday = key === todayKey;
              return (
                <div key={day} className={`sc-list-row ${isToday ? "sc-list-row--today" : ""}`}>
                  <div className="sc-list-date">
                    <span className="sc-list-dayname">
                      {new Date(key + "T00:00:00").toLocaleDateString("en-AU", { weekday: "short" })}, {day} {MONTHS[month].slice(0, 3)}
                    </span>
                    {isToday && <span className="sc-today-tag">Today</span>}
                  </div>
                  <div className="sc-list-events">
                    {dayEvs.length === 0
                      ? <span className="sc-no-events">No events</span>
                      : dayEvs.map(e => (
                        <div key={e.id} className="sc-list-event"
                          style={{ borderLeft: `3px solid ${typeConfig[e.type].color}`, background: typeConfig[e.type].bg }}
                          onClick={() => setSelectedEvent(e)}>
                          <span className="sc-list-event-title">{e.title}</span>
                          <span className="sc-list-event-time">{e.time}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="sc-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="sc-modal" onClick={e => e.stopPropagation()}>
            <div className="sc-modal-bar" style={{ background: typeConfig[selectedEvent.type].color }} />
            <button className="sc-modal-close" onClick={() => setSelectedEvent(null)}>✕</button>
            <div className="sc-modal-type" style={{ color: typeConfig[selectedEvent.type].color }}>{typeConfig[selectedEvent.type].label}</div>
            <h3 className="sc-modal-title">{selectedEvent.title}</h3>
            <div className="sc-modal-details">
              <div className="sc-modal-row"><span>📅</span><span>{selectedEvent.date}</span></div>
              <div className="sc-modal-row"><span>⏱</span><span>{selectedEvent.time}</span></div>
              <div className="sc-modal-row"><span>📍</span><span>{selectedEvent.location}</span></div>
              {selectedEvent.meeting && (
                <div className="sc-modal-row">
                  <span>🔗</span>
                  <a href={selectedEvent.meeting} target="_blank" rel="noreferrer" className="sc-meeting-link">Join Meeting</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}