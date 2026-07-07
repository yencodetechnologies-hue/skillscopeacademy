import { colors } from '../../constants/theme';
// import { useState, useEffect } from "react";
// import "../../styles/LlndResults.css";
// import { useSearchParams } from "react-router-dom";
// import { API_URL } from "../../data/service";

// const PAGE_SIZE = 10;

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function StatCard({ label, value, valueClass }) {
//   return (
//     <div className="lln-stat-card">
//       <span className="lln-stat-label">{label}</span>
//       <span className={`lln-stat-value ${valueClass || ""}`}>{value}</span>
//     </div>
//   );
// }

// function ResultBadge({ result }) {
//   return (
//     <span className={`lln-badge lln-badge-result lln-badge-${result.toLowerCase()}`}>
//       <span className="lln-badge-dot" />
//       {result}
//     </span>
//   );
// }

// function StatusBadge({ status }) {
//   return (
//     <span className={`lln-badge lln-badge-status lln-badge-status-${status.toLowerCase().replace(" ", "-")}`}>
//       {status}
//     </span>
//   );
// }

// function SectionBar({ section }) {
//   return (
//     <div className={`lln-section-bar ${section.score >= 67 ? "lln-section-pass" : "lln-section-fail"}`}>
//       <div className="lln-section-bar-header">
//         <span className="lln-section-icon">{section.score >= 67 ? "✓" : "✗"}</span>
//         <span className="lln-section-name">{section.name}</span>
//         <span className="lln-section-pct">{section.score}%</span>
//       </div>
//       <div className="lln-progress-track">
//         <div className="lln-progress-fill" style={{ width: `${section.score}%` }} />
//       </div>
//       <div className="lln-section-bar-footer">
//         <span>{section.correct}/{section.total} correct</span>
//         <span>Passed (Passing: 67%)</span>
//       </div>
//     </div>
//   );
// }

// function AssessmentModal({ record, onClose, onRefresh }) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [newDate, setNewDate] = useState(record.completedDate || record.date);
//   const [saving, setSaving] = useState(false);

//   if (!record) return null;

//   const handleSaveDate = async () => {
//     try {
//       setSaving(true);
//       const res = await fetch(`${API_URL}/api/flow/llnd-date`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ flowId: record.id, newDate })
//       });
//       if (res.ok) {
//         setIsEditing(false);
//         if (onRefresh) onRefresh();
//         alert("Date updated successfully!");
//       } else {
//         alert("Failed to update date.");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error updating date.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const totalCorrect = record.sections.reduce((a, s) => a + s.correct, 0);
//   const totalQ = record.sections.reduce((a, s) => a + s.total, 0);
//   const wrong = totalQ - totalCorrect;

//   return (
//     <div className="lln-modal-backdrop" onClick={onClose}>
//       <div className="lln-modal" onClick={(e) => e.stopPropagation()}>
//         <div className="lln-modal-header">
//           <div>
//             <h2 className="lln-modal-title">Assessment Details</h2>
//             <p className="lln-modal-subtitle">Detailed results for {record.student}</p>
//           </div>
//           <button className="lln-modal-close" onClick={onClose}>✕</button>
//         </div>

//         <div className="lln-modal-body">
//           <div className="lln-modal-info-grid">
//             <span className="lln-info-label">Student Name:</span>
//             <span className="lln-info-value lln-info-bold">{record.student}</span>
//             <span className="lln-info-label">Email:</span>
//             <span className="lln-info-value">{record.email}</span>
//             <span className="lln-info-label">Phone:</span>
//             <span className="lln-info-value">{record.phone || "+61400000000"}</span>
            
//             <span className="lln-info-label">Completed Date:</span>
//             <div className="lln-info-value" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//               {isEditing ? (
//                 <>
//                   <input 
//                     type="datetime-local" 
//                     value={newDate} 
//                     onChange={(e) => setNewDate(e.target.value)}
//                     className="lln-date-input"
//                   />
//                   <button 
//                     className="lln-btn lln-btn-sm" 
//                     onClick={handleSaveDate}
//                     disabled={saving}
//                   >
//                     {saving ? "..." : "Save"}
//                   </button>
//                   <button 
//                     className="lln-btn lln-btn-outline lln-btn-sm" 
//                     onClick={() => setIsEditing(false)}
//                   >
//                     Cancel
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <span>{record.completedDate || `${record.date}, 2:05:36 AM`}</span>
//                   <button 
//                     className="lln-edit-link" 
//                     onClick={() => setIsEditing(true)}
//                     style={{ background: "none", border: "none", color: colors.brandPrimary, cursor: "pointer", fontSize: "12px", textDecoration: "underline" }}
//                   >
//                     Change Date
//                   </button>
//                 </>
//               )}
//             </div>

//             <span className="lln-info-label">Status:</span>
//             <span className="lln-info-value"><StatusBadge status={record.status} /></span>
//           </div>

//           <div className="lln-modal-score-section">
//             <div className="lln-modal-score-row">
//               <span className="lln-modal-score-label">Overall Score</span>
//               <span className="lln-modal-score-value">{record.score}%</span>
//             </div>
//             <div className="lln-progress-track">
//               <div className="lln-progress-fill lln-progress-overall" style={{ width: `${record.score}%` }} />
//             </div>
//             <div className="lln-modal-score-meta">
//               <span>Correct: {totalCorrect}/{totalQ}</span>
//               <span>Wrong: {wrong}</span>
//             </div>
//           </div>

//           <div className="lln-sections-list">
//             <p className="lln-sections-title">Section Results:</p>
//             {record.sections.map((s) => (
//               <SectionBar key={s.name} section={s} />
//             ))}
//           </div>
//         </div>

//         <div className="lln-modal-footer">
//           <button className="lln-btn lln-btn-outline" onClick={onClose}>Close</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export default function LlndResults() {
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All Status");
//   const [page, setPage] = useState(1);
//   const [selectedRecord, setSelectedRecord] = useState(null);
//   const [data, setData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [searchParams] = useSearchParams();
//   const [stats, setStats] = useState({
//     totalAssessments: 34,
//     passed: 0,
//     failed: 0,
//     pendingReview: 0,
//     averageScore: 0,
//     passRate: 0
//   });

//   useEffect(() => {
//     fetch(`${API_URL}/api/flow/llnd-results`)
//       .then(res => res.json())
//       .then(res => {
//         // ✅ Sort by rawDate descending - Latest first
//         const sorted = [...res].sort((a, b) => {
//           const dateA = new Date(a.rawDate || a.completedDate || a.date);
//           const dateB = new Date(b.rawDate || b.completedDate || b.date);
//           return dateB - dateA;
//         });

//         setData(sorted);
//         setFilteredData(sorted);

//         // 🔥 CALCULATE STATS
//         const total = sorted.length;
//         const passed = sorted.filter(r => r.result === "Passed").length;
//         const failed = sorted.filter(r => r.result === "Failed").length;
//         const pending = sorted.filter(r => r.status !== "Approved").length;

//         const avgScore =
//           total > 0
//             ? (sorted.reduce((sum, r) => sum + (r.score || 0), 0) / total).toFixed(2)
//             : 0;

//         const passRate =
//           total > 0 ? ((passed / total) * 100).toFixed(2) : 0;

//         setStats({
//           totalAssessments: total,
//           passed,
//           failed,
//           pendingReview: pending,
//           averageScore: avgScore,
//           passRate,
//         });
//       })
//       .catch(err => console.error(err));
//   }, []);



//   useEffect(() => {
//     let temp = [...data];

//     if (search.trim()) {
//       const q = search.toLowerCase();
//       temp = temp.filter(
//         (r) =>
//           r.student?.toLowerCase().includes(q) ||
//           r.email?.toLowerCase().includes(q)
//       );
//     }

//     if (statusFilter !== "All Status") {
//       temp = temp.filter(
//         (r) => r.status === statusFilter || r.result === statusFilter
//       );
//     }

//     setFilteredData(temp);
//     setPage(1);

//   }, [search, statusFilter, data]);

//   useEffect(() => {
//   const studentId = searchParams.get("studentId");
//   const openModal = searchParams.get("openModal");

//   if (!studentId || !openModal || data.length === 0) return;

//   const record = data.find(r => r.id === studentId || String(r.id) === studentId);
//   if (record) {
//     setSelectedRecord(record);
//   }
// }, [data, searchParams]);

//   const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
//   const pageData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   return (
//     <div className="lln-root">
//       {/* Page Header */}
//       <div className="lln-page-header">
//         <h1 className="lln-page-title">Quiz Results Management</h1>
//         <p className="lln-page-sub">Review and manage student pre-enrollment assessment results</p>
//       </div>

//       {/* Stats Row 1 */}
//       <div className="lln-stats-grid lln-stats-grid-4">
//         <StatCard label="Total Assessments" value={stats.totalAssessments} />
//         <StatCard label="Passed" value={stats.passed} valueClass="lln-val-green" />
//         <StatCard label="Failed" value={stats.failed} valueClass="lln-val-red" />
//         <StatCard label="Pending Review" value={stats.pendingReview} valueClass="lln-val-amber" />
//       </div>

//       {/* Stats Row 2 */}
//       <div className="lln-stats-grid lln-stats-grid-3">
//         {/* <StatCard label="Admin Bypasses" value={stats.adminBypasses} valueClass="lln-val-blue" /> */}
//         <StatCard label="Average Score" value={`${stats.averageScore}%`} valueClass="lln-val-purple" />
//         <StatCard label="Pass Rate" value={`${stats.passRate}%`} />
//       </div>

//       {/* Table Card */}
//       <div className="lln-card">
//         <div className="lln-card-header">
//           <div>
//             <h2 className="lln-card-title">Assessment Results</h2>
//             <p className="lln-card-sub">View and manage all student assessment results</p>
//           </div>
//         </div>

//         {/* Toolbar */}
//         <div className="lln-toolbar">
//           <div className="lln-search-wrap">
//             <span className="lln-search-icon">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
//             </span>
//             <input
//               className="lln-search-input"
//               placeholder="Search by student name or email..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//           <div className="lln-toolbar-right">
//             <select
//               className="lln-select"
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//             >
//               <option>All Status</option>
//               <option>Passed</option>
//               <option>Failed</option>
//               <option>Approved</option>
//               <option>Pending Review</option>
//             </select>
//             <button className="lln-btn lln-btn-outline lln-btn-icon">
//               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
//               Search
//             </button>
//             <button className="lln-btn lln-btn-outline lln-btn-icon" onClick={() => { setSearch(""); setStatusFilter("All Status"); }}>
//               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
//               Refresh
//             </button>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="lln-table-wrap">
//           <table className="lln-table">
//             <thead>
//               <tr>
//                 <th>Date</th>
//                 <th>Student</th>
//                 <th>Course</th>
//                 <th>Course booking date</th>
//                 <th>Individual/Company</th>
//                 <th>Overall Score</th>
//                 <th>Result</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {pageData.map((row) => {
//                 // ✅ Helper to format date and time nicely
//                 const formatDateTime = (dateStr) => {
//                   if (!dateStr) return { d: "N/A", t: "" };
//                   const d = new Date(dateStr);
//                   if (isNaN(d.getTime())) return { d: dateStr, t: "" };
//                   return {
//                     d: d.toLocaleDateString("en-AU", { day: '2-digit', month: '2-digit', year: 'numeric' }),
//                     t: d.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true })
//                   };
//                 };
//                 const { d, t } = formatDateTime(row.completedDate || row.date);

//                 return (
//                   <tr key={row.id}>
//                     <td className="lln-td-date">
//                       <div style={{ fontWeight: '600', color: '#334155' }}>{d}</div>
//                       <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{t}</div>
//                     </td>
//                     <td>
//                       <span className="lln-student-name">{row.student}</span>
//                       <span className="lln-student-email">{row.email}</span>
//                     </td>
//                     <td className="lln-td-course">{row.course}</td>
//                     <td>{row.bookingDate}</td>
//                     <td>{row.type}</td>
//                     <td>
//                       <span className={`lln-score ${row.score >= 80 ? "lln-score-high" : row.score >= 67 ? "lln-score-mid" : "lln-score-low"}`}>
//                         {row.score}%
//                       </span>
//                     </td>
//                     <td><ResultBadge result={row.result} /></td>
//                     <td><StatusBadge status={row.status} /></td>
//                     <td>
//                       <button
//                         className="lln-btn-view"
//                         onClick={() => setSelectedRecord(row)}
//                       >
//                         <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
//                         View Details
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="lln-pagination">
//           <span className="lln-pagination-info">
//             Showing {filteredData.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredData.length)} of {filteredData.length} results
//           </span>
//           <div className="lln-pagination-controls">
//             <button
//               className="lln-btn lln-btn-outline"
//               disabled={page === 1}
//               onClick={() => setPage((p) => p - 1)}
//             >
//               Previous
//             </button>
//             <span className="lln-page-label">Page {page} of {totalPages || 1}</span>
//             <button
//               className="lln-btn lln-btn-outline"
//               disabled={page >= totalPages}
//               onClick={() => setPage((p) => p + 1)}
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Modal */}
//       {selectedRecord && (
//         <AssessmentModal 
//           record={selectedRecord} 
//           onClose={() => setSelectedRecord(null)} 
//           onRefresh={() => {
//             // Re-fetch data to reflect date change
//             fetch(`${API_URL}/api/flow/llnd-results`)
//               .then(res => res.json())
//               .then(res => {
//                 const sorted = [...res].sort((a, b) => {
//                   const dateA = new Date(a.rawDate || a.completedDate || a.date);
//                   const dateB = new Date(b.rawDate || b.completedDate || b.date);
//                   return dateB - dateA;
//                 });
//                 setData(sorted);
//                 setFilteredData(sorted);
//               });
//           }}
//         />
//       )}
//     </div>
//   );
// }

// import { useState, useEffect } from "react";
// import "../../styles/LlndResults.css";
// import { useSearchParams } from "react-router-dom";
// import { API_URL } from "../../data/service";

// const PAGE_SIZE = 10;

// function StatCard({ label, value, valueClass }) {
//   return (
//     <div className="lln-stat-card">
//       <span className="lln-stat-label">{label}</span>
//       <span className={`lln-stat-value ${valueClass || ""}`}>{value}</span>
//     </div>
//   );
// }

// function ResultBadge({ result }) {
//   return (
//     <span className={`lln-badge lln-badge-result lln-badge-${result.toLowerCase()}`}>
//       <span className="lln-badge-dot" />
//       {result}
//     </span>
//   );
// }

// function StatusBadge({ status }) {
//   return (
//     <span className={`lln-badge lln-badge-status lln-badge-status-${status.toLowerCase().replace(" ", "-")}`}>
//       {status}
//     </span>
//   );
// }

// function SectionBar({ section }) {
//   return (
//     <div className={`lln-section-bar ${section.score >= 67 ? "lln-section-pass" : "lln-section-fail"}`}>
//       <div className="lln-section-bar-header">
//         <span className="lln-section-icon">{section.score >= 67 ? "✓" : "✗"}</span>
//         <span className="lln-section-name">{section.name}</span>
//         <span className="lln-section-pct">{section.score}%</span>
//       </div>
//       <div className="lln-progress-track">
//         <div className="lln-progress-fill" style={{ width: `${section.score}%` }} />
//       </div>
//       <div className="lln-section-bar-footer">
//         <span>{section.correct}/{section.total} correct</span>
//         <span>Passed (Passing: 67%)</span>
//       </div>
//     </div>
//   );
// }

// function formatDateTime(dateStr) {
//   if (!dateStr) return { d: "N/A", t: "" };
//   const d = new Date(dateStr);
//   if (isNaN(d.getTime())) return { d: dateStr, t: "" };
//   return {
//     d: d.toLocaleDateString("en-AU", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric"
//     }),
//     t: d.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true
//     })
//   };
// }

// function toInputValue(dateStr) {
//   const d = new Date(dateStr);
//   if (!dateStr || isNaN(d.getTime())) return "";
//   const pad = (n) => String(n).padStart(2, "0");
//   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
// }

// function AssessmentModal({ record, onClose, onRefresh }) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [newDate, setNewDate] = useState("");
//   const [displayDate, setDisplayDate] = useState("");

//   useEffect(() => {
//     if (record) {
//       const completedAt = record.llnd?.completedAt || record.completedDate || record.date;
//       setNewDate(toInputValue(completedAt));
//       setDisplayDate(completedAt || "");
//       setIsEditing(false);
//     }
//   }, [record]);

//   if (!record) return null;

//   const handleSaveDate = async () => {
//     try {
//       setSaving(true);

//       const res = await fetch(`${API_URL}/api/flow/llnd-date`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           flowId: record.id || record._id,
//           newDate
//         })
//       });

//       const data = await res.json();

//       if (res.ok) {
//         const updatedDate = data?.updated?.llnd?.completedAt || newDate;
//         setDisplayDate(updatedDate);
//         setIsEditing(false);

//         if (onRefresh) {
//           onRefresh(record.id || record._id, updatedDate);
//         }

//         alert("Date updated successfully!");
//       } else {
//         alert(data?.error || "Failed to update date.");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error updating date.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const totalCorrect = record.sections.reduce((a, s) => a + s.correct, 0);
//   const totalQ = record.sections.reduce((a, s) => a + s.total, 0);
//   const wrong = totalQ - totalCorrect;

//   return (
//     <div className="lln-modal-backdrop" onClick={onClose}>
//       <div className="lln-modal" onClick={(e) => e.stopPropagation()}>
//         <div className="lln-modal-header">
//           <div>
//             <h2 className="lln-modal-title">Assessment Details</h2>
//             <p className="lln-modal-subtitle">Detailed results for {record.student}</p>
//           </div>
//           <button className="lln-modal-close" onClick={onClose}>✕</button>
//         </div>

//         <div className="lln-modal-body">
//           <div className="lln-modal-info-grid">
//             <span className="lln-info-label">Student Name:</span>
//             <span className="lln-info-value lln-info-bold">{record.student}</span>

//             <span className="lln-info-label">Email:</span>
//             <span className="lln-info-value">{record.email}</span>

//             <span className="lln-info-label">Phone:</span>
//             <span className="lln-info-value">{record.phone || "+61400000000"}</span>

//             <span className="lln-info-label">Completed Date:</span>
//             <div className="lln-info-value" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//               {isEditing ? (
//                 <>
//                   <input
//                     type="datetime-local"
//                     value={newDate}
//                     onChange={(e) => setNewDate(e.target.value)}
//                     className="lln-date-input"
//                   />
//                   <button
//                     className="lln-btn lln-btn-sm"
//                     onClick={handleSaveDate}
//                     disabled={saving}
//                   >
//                     {saving ? "..." : "Save"}
//                   </button>
//                   <button
//                     className="lln-btn lln-btn-outline lln-btn-sm"
//                     onClick={() => setIsEditing(false)}
//                   >
//                     Cancel
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <span>
//                     {displayDate
//                       ? formatDateTime(displayDate).d + " " + formatDateTime(displayDate).t
//                       : "N/A"}
//                   </span>
//                   <button
//                     className="lln-edit-link"
//                     onClick={() => setIsEditing(true)}
//                     style={{
//                       background: "none",
//                       border: "none",
//                       color: colors.brandPrimary,
//                       cursor: "pointer",
//                       fontSize: "12px",
//                       textDecoration: "underline"
//                     }}
//                   >
//                     Change Date
//                   </button>
//                 </>
//               )}
//             </div>

//             <span className="lln-info-label">Status:</span>
//             <span className="lln-info-value">
//               <StatusBadge status={record.status} />
//             </span>
//           </div>

//           <div className="lln-modal-score-section">
//             <div className="lln-modal-score-row">
//               <span className="lln-modal-score-label">Overall Score</span>
//               <span className="lln-modal-score-value">{record.score}%</span>
//             </div>
//             <div className="lln-progress-track">
//               <div className="lln-progress-fill lln-progress-overall" style={{ width: `${record.score}%` }} />
//             </div>
//             <div className="lln-modal-score-meta">
//               <span>Correct: {totalCorrect}/{totalQ}</span>
//               <span>Wrong: {wrong}</span>
//             </div>
//           </div>

//           <div className="lln-sections-list">
//             <p className="lln-sections-title">Section Results:</p>
//             {record.sections.map((s) => (
//               <SectionBar key={s.name} section={s} />
//             ))}
//           </div>
//         </div>

//         <div className="lln-modal-footer">
//           <button className="lln-btn lln-btn-outline" onClick={onClose}>Close</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function LlndResults() {
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All Status");
//   const [page, setPage] = useState(1);
//   const [selectedRecord, setSelectedRecord] = useState(null);
//   const [data, setData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [searchParams] = useSearchParams();
//   const [stats, setStats] = useState({
//     totalAssessments: 34,
//     passed: 0,
//     failed: 0,
//     pendingReview: 0,
//     averageScore: 0,
//     passRate: 0
//   });

//   const fetchResults = async () => {
//     try {
//       const res = await fetch(`${API_URL}/api/flow/llnd-results`);
//       const result = await res.json();

//       const sorted = [...result].sort((a, b) => {
//         const dateA = new Date(a.llnd?.completedAt || a.rawDate || a.completedDate || a.date);
//         const dateB = new Date(b.llnd?.completedAt || b.rawDate || b.completedDate || b.date);
//         return dateB - dateA;
//       });

//       setData(sorted);
//       setFilteredData(sorted);

//       const total = sorted.length;
//       const passed = sorted.filter(r => r.result === "Passed").length;
//       const failed = sorted.filter(r => r.result === "Failed").length;
//       const pending = sorted.filter(r => r.status !== "Approved").length;

//       const avgScore =
//         total > 0
//           ? (sorted.reduce((sum, r) => sum + (r.score || 0), 0) / total).toFixed(2)
//           : 0;

//       const passRate =
//         total > 0 ? ((passed / total) * 100).toFixed(2) : 0;

//       setStats({
//         totalAssessments: total,
//         passed,
//         failed,
//         pendingReview: pending,
//         averageScore: avgScore,
//         passRate
//       });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchResults();
//   }, []);

//   useEffect(() => {
//     let temp = [...data];

//     if (search.trim()) {
//       const q = search.toLowerCase();
//       temp = temp.filter(
//         (r) =>
//           r.student?.toLowerCase().includes(q) ||
//           r.email?.toLowerCase().includes(q)
//       );
//     }

//     if (statusFilter !== "All Status") {
//       temp = temp.filter(
//         (r) => r.status === statusFilter || r.result === statusFilter
//       );
//     }

//     setFilteredData(temp);
//     setPage(1);
//   }, [search, statusFilter, data]);

//   useEffect(() => {
//     const studentId = searchParams.get("studentId");
//     const openModal = searchParams.get("openModal");

//     if (!studentId || !openModal || data.length === 0) return;

//     const record = data.find(r => String(r.id || r._id) === studentId);
//     if (record) {
//       setSelectedRecord(record);
//     }
//   }, [data, searchParams]);

//   const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
//   const pageData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   return (
//     <div className="lln-root">
//       <div className="lln-page-header">
//         <h1 className="lln-page-title">Quiz Results Management</h1>
//         <p className="lln-page-sub">Review and manage student pre-enrollment assessment results</p>
//       </div>

//       <div className="lln-stats-grid lln-stats-grid-4">
//         <StatCard label="Total Assessments" value={stats.totalAssessments} />
//         <StatCard label="Passed" value={stats.passed} valueClass="lln-val-green" />
//         <StatCard label="Failed" value={stats.failed} valueClass="lln-val-red" />
//         <StatCard label="Pending Review" value={stats.pendingReview} valueClass="lln-val-amber" />
//       </div>

//       <div className="lln-stats-grid lln-stats-grid-3">
//         <StatCard label="Average Score" value={`${stats.averageScore}%`} valueClass="lln-val-purple" />
//         <StatCard label="Pass Rate" value={`${stats.passRate}%`} />
//       </div>

//       <div className="lln-card">
//         <div className="lln-card-header">
//           <div>
//             <h2 className="lln-card-title">Assessment Results</h2>
//             <p className="lln-card-sub">View and manage all student assessment results</p>
//           </div>
//         </div>

//         <div className="lln-toolbar">
//           <div className="lln-search-wrap">
//             <span className="lln-search-icon">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <circle cx="11" cy="11" r="8" />
//                 <path d="m21 21-4.35-4.35" />
//               </svg>
//             </span>
//             <input
//               className="lln-search-input"
//               placeholder="Search by student name or email..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>

//           <div className="lln-toolbar-right">
//             <select
//               className="lln-select"
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//             >
//               <option>All Status</option>
//               <option>Passed</option>
//               <option>Failed</option>
//               <option>Approved</option>
//               <option>Pending Review</option>
//             </select>

//             <button className="lln-btn lln-btn-outline lln-btn-icon">
//               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <circle cx="11" cy="11" r="8" />
//                 <path d="m21 21-4.35-4.35" />
//               </svg>
//               Search
//             </button>

//             <button
//               className="lln-btn lln-btn-outline lln-btn-icon"
//               onClick={() => {
//                 setSearch("");
//                 setStatusFilter("All Status");
//               }}
//             >
//               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
//                 <path d="M3 3v5h5" />
//               </svg>
//               Refresh
//             </button>
//           </div>
//         </div>

//         <div className="lln-table-wrap">
//           <table className="lln-table">
//             <thead>
//               <tr>
//                 <th>Date</th>
//                 <th>Student</th>
//                 <th>Course</th>
//                 <th>Course booking date</th>
//                 <th>Individual/Company</th>
//                 <th>Overall Score</th>
//                 <th>Result</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {pageData.map((row) => {
//                 const dateSource = row.llnd?.completedAt || row.completedDate || row.date;
//                 const { d, t } = formatDateTime(dateSource);

//                 return (
//                   <tr key={row.id || row._id}>
//                     <td className="lln-td-date">
//                       <div style={{ fontWeight: "600", color: "#334155" }}>{d}</div>
//                       <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{t}</div>
//                     </td>
//                     <td>
//                       <span className="lln-student-name">{row.student}</span>
//                       <span className="lln-student-email">{row.email}</span>
//                     </td>
//                     <td className="lln-td-course">{row.course}</td>
//                     <td>{row.bookingDate}</td>
//                     <td>{row.type}</td>
//                     <td>
//                       <span className={`lln-score ${row.score >= 80 ? "lln-score-high" : row.score >= 67 ? "lln-score-mid" : "lln-score-low"}`}>
//                         {row.score}%
//                       </span>
//                     </td>
//                     <td><ResultBadge result={row.result} /></td>
//                     <td><StatusBadge status={row.status} /></td>
//                     <td>
//                       <button
//                         className="lln-btn-view"
//                         onClick={() => setSelectedRecord(row)}
//                       >
//                         <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                           <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
//                           <circle cx="12" cy="12" r="3" />
//                         </svg>
//                         View Details
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         <div className="lln-pagination">
//           <span className="lln-pagination-info">
//             Showing {filteredData.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredData.length)} of {filteredData.length} results
//           </span>
//           <div className="lln-pagination-controls">
//             <button
//               className="lln-btn lln-btn-outline"
//               disabled={page === 1}
//               onClick={() => setPage((p) => p - 1)}
//             >
//               Previous
//             </button>
//             <span className="lln-page-label">Page {page} of {totalPages || 1}</span>
//             <button
//               className="lln-btn lln-btn-outline"
//               disabled={page >= totalPages}
//               onClick={() => setPage((p) => p + 1)}
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>

//       {selectedRecord && (
//         <AssessmentModal
//           record={selectedRecord}
//           onClose={() => setSelectedRecord(null)}
//           onRefresh={(updatedId) => {
//             fetchResults().then(() => {
//               const updatedRecord = data.find(r => String(r.id || r._id) === String(updatedId));
//               if (updatedRecord) setSelectedRecord(updatedRecord);
//             });
//           }}
//         />
//       )}
//     </div>
//   );
// }

// import { useState, useEffect } from "react";
// import "../../styles/LlndResults.css";
// import { useSearchParams } from "react-router-dom";
// import { API_URL } from "../../data/service";

// const PAGE_SIZE = 10;

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function StatCard({ label, value, valueClass }) {
//   return (
//     <div className="lln-stat-card">
//       <span className="lln-stat-label">{label}</span>
//       <span className={`lln-stat-value ${valueClass || ""}`}>{value}</span>
//     </div>
//   );
// }

// function ResultBadge({ result }) {
//   return (
//     <span className={`lln-badge lln-badge-result lln-badge-${result.toLowerCase()}`}>
//       <span className="lln-badge-dot" />
//       {result}
//     </span>
//   );
// }

// function StatusBadge({ status }) {
//   return (
//     <span className={`lln-badge lln-badge-status lln-badge-status-${status.toLowerCase().replace(" ", "-")}`}>
//       {status}
//     </span>
//   );
// }

// function SectionBar({ section }) {
//   return (
//     <div className={`lln-section-bar ${section.score >= 67 ? "lln-section-pass" : "lln-section-fail"}`}>
//       <div className="lln-section-bar-header">
//         <span className="lln-section-icon">{section.score >= 67 ? "✓" : "✗"}</span>
//         <span className="lln-section-name">{section.name}</span>
//         <span className="lln-section-pct">{section.score}%</span>
//       </div>
//       <div className="lln-progress-track">
//         <div className="lln-progress-fill" style={{ width: `${section.score}%` }} />
//       </div>
//       <div className="lln-section-bar-footer">
//         <span>{section.correct}/{section.total} correct</span>
//         <span>Passed (Passing: 67%)</span>
//       </div>
//     </div>
//   );
// }

// function AssessmentModal({ record, onClose, onRefresh }) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [newDate, setNewDate] = useState(record.completedDate || record.date);
//   const [saving, setSaving] = useState(false);

//   if (!record) return null;

//   const handleSaveDate = async () => {
//     try {
//       setSaving(true);
//       const res = await fetch(`${API_URL}/api/flow/llnd-date`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ flowId: record.id, newDate })
//       });
//       if (res.ok) {
//         setIsEditing(false);
//         if (onRefresh) onRefresh();
//         alert("Date updated successfully!");
//       } else {
//         alert("Failed to update date.");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error updating date.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const totalCorrect = record.sections.reduce((a, s) => a + s.correct, 0);
//   const totalQ = record.sections.reduce((a, s) => a + s.total, 0);
//   const wrong = totalQ - totalCorrect;

//   return (
//     <div className="lln-modal-backdrop" onClick={onClose}>
//       <div className="lln-modal" onClick={(e) => e.stopPropagation()}>
//         <div className="lln-modal-header">
//           <div>
//             <h2 className="lln-modal-title">Assessment Details</h2>
//             <p className="lln-modal-subtitle">Detailed results for {record.student}</p>
//           </div>
//           <button className="lln-modal-close" onClick={onClose}>✕</button>
//         </div>

//         <div className="lln-modal-body">
//           <div className="lln-modal-info-grid">
//             <span className="lln-info-label">Student Name:</span>
//             <span className="lln-info-value lln-info-bold">{record.student}</span>
//             <span className="lln-info-label">Email:</span>
//             <span className="lln-info-value">{record.email}</span>
//             <span className="lln-info-label">Phone:</span>
//             <span className="lln-info-value">{record.phone || "+61400000000"}</span>
            
//             <span className="lln-info-label">Completed Date:</span>
//             <div className="lln-info-value" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//               {isEditing ? (
//                 <>
//                   <input 
//                     type="datetime-local" 
//                     value={newDate} 
//                     onChange={(e) => setNewDate(e.target.value)}
//                     className="lln-date-input"
//                   />
//                   <button 
//                     className="lln-btn lln-btn-sm" 
//                     onClick={handleSaveDate}
//                     disabled={saving}
//                   >
//                     {saving ? "..." : "Save"}
//                   </button>
//                   <button 
//                     className="lln-btn lln-btn-outline lln-btn-sm" 
//                     onClick={() => setIsEditing(false)}
//                   >
//                     Cancel
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <span>{record.completedDate || `${record.date}, 2:05:36 AM`}</span>
//                   <button 
//                     className="lln-edit-link" 
//                     onClick={() => setIsEditing(true)}
//                     style={{ background: "none", border: "none", color: colors.brandPrimary, cursor: "pointer", fontSize: "12px", textDecoration: "underline" }}
//                   >
//                     Change Date
//                   </button>
//                 </>
//               )}
//             </div>

//             <span className="lln-info-label">Status:</span>
//             <span className="lln-info-value"><StatusBadge status={record.status} /></span>
//           </div>

//           <div className="lln-modal-score-section">
//             <div className="lln-modal-score-row">
//               <span className="lln-modal-score-label">Overall Score</span>
//               <span className="lln-modal-score-value">{record.score}%</span>
//             </div>
//             <div className="lln-progress-track">
//               <div className="lln-progress-fill lln-progress-overall" style={{ width: `${record.score}%` }} />
//             </div>
//             <div className="lln-modal-score-meta">
//               <span>Correct: {totalCorrect}/{totalQ}</span>
//               <span>Wrong: {wrong}</span>
//             </div>
//           </div>

//           <div className="lln-sections-list">
//             <p className="lln-sections-title">Section Results:</p>
//             {record.sections.map((s) => (
//               <SectionBar key={s.name} section={s} />
//             ))}
//           </div>
//         </div>

//         <div className="lln-modal-footer">
//           <button className="lln-btn lln-btn-outline" onClick={onClose}>Close</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export default function LlndResults() {
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All Status");
//   const [page, setPage] = useState(1);
//   const [selectedRecord, setSelectedRecord] = useState(null);
//   const [data, setData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [searchParams] = useSearchParams();
//   const [stats, setStats] = useState({
//     totalAssessments: 34,
//     passed: 0,
//     failed: 0,
//     pendingReview: 0,
//     averageScore: 0,
//     passRate: 0
//   });

//   useEffect(() => {
//     fetch(`${API_URL}/api/flow/llnd-results`)
//       .then(res => res.json())
//       .then(res => {
//         // ✅ Sort by rawDate descending - Latest first
//         const sorted = [...res].sort((a, b) => {
//           const dateA = new Date(a.rawDate || a.completedDate || a.date);
//           const dateB = new Date(b.rawDate || b.completedDate || b.date);
//           return dateB - dateA;
//         });

//         setData(sorted);
//         setFilteredData(sorted);

//         // 🔥 CALCULATE STATS
//         const total = sorted.length;
//         const passed = sorted.filter(r => r.result === "Passed").length;
//         const failed = sorted.filter(r => r.result === "Failed").length;
//         const pending = sorted.filter(r => r.status !== "Approved").length;

//         const avgScore =
//           total > 0
//             ? (sorted.reduce((sum, r) => sum + (r.score || 0), 0) / total).toFixed(2)
//             : 0;

//         const passRate =
//           total > 0 ? ((passed / total) * 100).toFixed(2) : 0;

//         setStats({
//           totalAssessments: total,
//           passed,
//           failed,
//           pendingReview: pending,
//           averageScore: avgScore,
//           passRate,
//         });
//       })
//       .catch(err => console.error(err));
//   }, []);



//   useEffect(() => {
//     let temp = [...data];

//     if (search.trim()) {
//       const q = search.toLowerCase();
//       temp = temp.filter(
//         (r) =>
//           r.student?.toLowerCase().includes(q) ||
//           r.email?.toLowerCase().includes(q)
//       );
//     }

//     if (statusFilter !== "All Status") {
//       temp = temp.filter(
//         (r) => r.status === statusFilter || r.result === statusFilter
//       );
//     }

//     setFilteredData(temp);
//     setPage(1);

//   }, [search, statusFilter, data]);

//   useEffect(() => {
//   const studentId = searchParams.get("studentId");
//   const openModal = searchParams.get("openModal");

//   if (!studentId || !openModal || data.length === 0) return;

//   const record = data.find(r => r.id === studentId || String(r.id) === studentId);
//   if (record) {
//     setSelectedRecord(record);
//   }
// }, [data, searchParams]);

//   const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
//   const pageData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   return (
//     <div className="lln-root">
//       {/* Page Header */}
//       <div className="lln-page-header">
//         <h1 className="lln-page-title">Quiz Results Management</h1>
//         <p className="lln-page-sub">Review and manage student pre-enrollment assessment results</p>
//       </div>

//       {/* Stats Row 1 */}
//       <div className="lln-stats-grid lln-stats-grid-4">
//         <StatCard label="Total Assessments" value={stats.totalAssessments} />
//         <StatCard label="Passed" value={stats.passed} valueClass="lln-val-green" />
//         <StatCard label="Failed" value={stats.failed} valueClass="lln-val-red" />
//         <StatCard label="Pending Review" value={stats.pendingReview} valueClass="lln-val-amber" />
//       </div>

//       {/* Stats Row 2 */}
//       <div className="lln-stats-grid lln-stats-grid-3">
//         {/* <StatCard label="Admin Bypasses" value={stats.adminBypasses} valueClass="lln-val-blue" /> */}
//         <StatCard label="Average Score" value={`${stats.averageScore}%`} valueClass="lln-val-purple" />
//         <StatCard label="Pass Rate" value={`${stats.passRate}%`} />
//       </div>

//       {/* Table Card */}
//       <div className="lln-card">
//         <div className="lln-card-header">
//           <div>
//             <h2 className="lln-card-title">Assessment Results</h2>
//             <p className="lln-card-sub">View and manage all student assessment results</p>
//           </div>
//         </div>

//         {/* Toolbar */}
//         <div className="lln-toolbar">
//           <div className="lln-search-wrap">
//             <span className="lln-search-icon">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
//             </span>
//             <input
//               className="lln-search-input"
//               placeholder="Search by student name or email..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//           <div className="lln-toolbar-right">
//             <select
//               className="lln-select"
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//             >
//               <option>All Status</option>
//               <option>Passed</option>
//               <option>Failed</option>
//               <option>Approved</option>
//               <option>Pending Review</option>
//             </select>
//             <button className="lln-btn lln-btn-outline lln-btn-icon">
//               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
//               Search
//             </button>
//             <button className="lln-btn lln-btn-outline lln-btn-icon" onClick={() => { setSearch(""); setStatusFilter("All Status"); }}>
//               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
//               Refresh
//             </button>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="lln-table-wrap">
//           <table className="lln-table">
//             <thead>
//               <tr>
//                 <th>Date</th>
//                 <th>Student</th>
//                 <th>Course</th>
//                 <th>Course booking date</th>
//                 <th>Individual/Company</th>
//                 <th>Overall Score</th>
//                 <th>Result</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {pageData.map((row) => {
//                 // ✅ Helper to format date and time nicely
//                 const formatDateTime = (dateStr) => {
//                   if (!dateStr) return { d: "N/A", t: "" };
//                   const d = new Date(dateStr);
//                   if (isNaN(d.getTime())) return { d: dateStr, t: "" };
//                   return {
//                     d: d.toLocaleDateString("en-AU", { day: '2-digit', month: '2-digit', year: 'numeric' }),
//                     t: d.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true })
//                   };
//                 };
//                 const { d, t } = formatDateTime(row.completedDate || row.date);

//                 return (
//                   <tr key={row.id}>
//                     <td className="lln-td-date">
//                       <div style={{ fontWeight: '600', color: '#334155' }}>{d}</div>
//                       <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{t}</div>
//                     </td>
//                     <td>
//                       <span className="lln-student-name">{row.student}</span>
//                       <span className="lln-student-email">{row.email}</span>
//                     </td>
//                     <td className="lln-td-course">{row.course}</td>
//                     <td>{row.bookingDate}</td>
//                     <td>{row.type}</td>
//                     <td>
//                       <span className={`lln-score ${row.score >= 80 ? "lln-score-high" : row.score >= 67 ? "lln-score-mid" : "lln-score-low"}`}>
//                         {row.score}%
//                       </span>
//                     </td>
//                     <td><ResultBadge result={row.result} /></td>
//                     <td><StatusBadge status={row.status} /></td>
//                     <td>
//                       <button
//                         className="lln-btn-view"
//                         onClick={() => setSelectedRecord(row)}
//                       >
//                         <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
//                         View Details
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="lln-pagination">
//           <span className="lln-pagination-info">
//             Showing {filteredData.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredData.length)} of {filteredData.length} results
//           </span>
//           <div className="lln-pagination-controls">
//             <button
//               className="lln-btn lln-btn-outline"
//               disabled={page === 1}
//               onClick={() => setPage((p) => p - 1)}
//             >
//               Previous
//             </button>
//             <span className="lln-page-label">Page {page} of {totalPages || 1}</span>
//             <button
//               className="lln-btn lln-btn-outline"
//               disabled={page >= totalPages}
//               onClick={() => setPage((p) => p + 1)}
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Modal */}
//       {selectedRecord && (
//         <AssessmentModal 
//           record={selectedRecord} 
//           onClose={() => setSelectedRecord(null)} 
//           onRefresh={() => {
//             // Re-fetch data to reflect date change
//             fetch(`${API_URL}/api/flow/llnd-results`)
//               .then(res => res.json())
//               .then(res => {
//                 const sorted = [...res].sort((a, b) => {
//                   const dateA = new Date(a.rawDate || a.completedDate || a.date);
//                   const dateB = new Date(b.rawDate || b.completedDate || b.date);
//                   return dateB - dateA;
//                 });
//                 setData(sorted);
//                 setFilteredData(sorted);
//               });
//           }}
//         />
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import "../../styles/LlndResults.css";
import { useSearchParams } from "react-router-dom";
import { API_URL } from "../../data/service";

const PAGE_SIZE = 10;

function StatCard({ label, value, valueClass }) {
  return (
    <div className="lln-stat-card">
      <span className="lln-stat-label">{label}</span>
      <span className={`lln-stat-value ${valueClass || ""}`}>{value}</span>
    </div>
  );
}

function ResultBadge({ result }) {
  return (
    <span className={`lln-badge lln-badge-result lln-badge-${result.toLowerCase()}`}>
      <span className="lln-badge-dot" />
      {result}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`lln-badge lln-badge-status lln-badge-status-${status.toLowerCase().replace(" ", "-")}`}>
      {status}
    </span>
  );
}

function SectionBar({ section }) {
  return (
    <div className={`lln-section-bar ${section.score >= 67 ? "lln-section-pass" : "lln-section-fail"}`}>
      <div className="lln-section-bar-header">
        <span className="lln-section-icon">{section.score >= 67 ? "✓" : "✗"}</span>
        <span className="lln-section-name">{section.name}</span>
        <span className="lln-section-pct">{section.score}%</span>
      </div>
      <div className="lln-progress-track">
        <div className="lln-progress-fill" style={{ width: `${section.score}%` }} />
      </div>
      <div className="lln-section-bar-footer">
        <span>{section.correct}/{section.total} correct</span>
        <span>Passed (Passing: 67%)</span>
      </div>
    </div>
  );
}

function formatDateTime(dateStr) {
  if (!dateStr) return { d: "N/A", t: "" };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { d: dateStr, t: "" };
  return {
    d: d.toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }),
    t: d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
  };
}

function toInputValue(dateStr) {
  const d = new Date(dateStr);
  if (!dateStr || isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AssessmentModal({ record, onClose, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [displayDate, setDisplayDate] = useState("");

  useEffect(() => {
    if (record) {
      const completedAt = record.llnd?.completedAt || record.completedDate || record.date;
      setNewDate(toInputValue(completedAt));
      setDisplayDate(completedAt || "");
      setIsEditing(false);
    }
  }, [record]);

  if (!record) return null;

  const handleSaveDate = async () => {
    try {
      setSaving(true);

      // datetime-local value ("2026-06-16T12:53") is in the browser's local timezone.
      // new Date() correctly parses it as local time in the browser.
      // .toISOString() converts to UTC so the backend receives an unambiguous timestamp —
      // this prevents the date shifting by +1 day when the server is in a different timezone.
      const localDate = new Date(newDate);
      const utcIso = localDate.toISOString();

      const res = await fetch(`${API_URL}/api/flow/llnd-date`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flowId: record.id || record._id,
          newDate: utcIso
        })
      });

      const data = await res.json();

      if (res.ok) {
        const updatedDate = data?.updated?.llnd?.completedAt || newDate;
        setDisplayDate(updatedDate);
        setIsEditing(false);

        if (onRefresh) {
          onRefresh(record.id || record._id, updatedDate);
        }

        alert("Date updated successfully!");
      } else {
        alert(data?.error || "Failed to update date.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating date.");
    } finally {
      setSaving(false);
    }
  };

  const totalCorrect = record.sections.reduce((a, s) => a + s.correct, 0);
  const totalQ = record.sections.reduce((a, s) => a + s.total, 0);
  const wrong = totalQ - totalCorrect;

  return (
    <div className="lln-modal-backdrop" onClick={onClose}>
      <div className="lln-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lln-modal-header">
          <div>
            <h2 className="lln-modal-title">Assessment Details</h2>
            <p className="lln-modal-subtitle">Detailed results for {record.student}</p>
          </div>
          <button className="lln-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="lln-modal-body">
          <div className="lln-modal-info-grid">
            <span className="lln-info-label">Student Name:</span>
            <span className="lln-info-value lln-info-bold">{record.student}</span>

            <span className="lln-info-label">Email:</span>
            <span className="lln-info-value">{record.email}</span>

            <span className="lln-info-label">Phone:</span>
            <span className="lln-info-value">{record.phone || "+61400000000"}</span>

            <span className="lln-info-label">Completed Date:</span>
            <div className="lln-info-value" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {isEditing ? (
                <>
                  <input
                    type="datetime-local"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="lln-date-input"
                  />
                  <button
                    className="lln-btn lln-btn-sm"
                    onClick={handleSaveDate}
                    disabled={saving}
                  >
                    {saving ? "..." : "Save"}
                  </button>
                  <button
                    className="lln-btn lln-btn-outline lln-btn-sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span>
                    {displayDate
                      ? formatDateTime(displayDate).d + " " + formatDateTime(displayDate).t
                      : "N/A"}
                  </span>
                  <button
                    className="lln-edit-link"
                    onClick={() => setIsEditing(true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: colors.brandPrimary,
                      cursor: "pointer",
                      fontSize: "12px",
                      textDecoration: "underline"
                    }}
                  >
                    Change Date
                  </button>
                </>
              )}
            </div>

            <span className="lln-info-label">Status:</span>
            <span className="lln-info-value">
              <StatusBadge status={record.status} />
            </span>
          </div>

          <div className="lln-modal-score-section">
            <div className="lln-modal-score-row">
              <span className="lln-modal-score-label">Overall Score</span>
              <span className="lln-modal-score-value">{record.score}%</span>
            </div>
            <div className="lln-progress-track">
              <div className="lln-progress-fill lln-progress-overall" style={{ width: `${record.score}%` }} />
            </div>
            <div className="lln-modal-score-meta">
              <span>Correct: {totalCorrect}/{totalQ}</span>
              <span>Wrong: {wrong}</span>
            </div>
          </div>

          <div className="lln-sections-list">
            <p className="lln-sections-title">Section Results:</p>
            {record.sections.map((s) => (
              <SectionBar key={s.name} section={s} />
            ))}
          </div>
        </div>

        <div className="lln-modal-footer">
          <button className="lln-btn lln-btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function LlndResults() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState({
    totalAssessments: 34,
    passed: 0,
    failed: 0,
    pendingReview: 0,
    averageScore: 0,
    passRate: 0
  });

  const fetchResults = async () => {
    try {
      const res = await fetch(`${API_URL}/api/flow/llnd-results`);
      const result = await res.json();

      const sorted = [...result].sort((a, b) => {
        const dateA = new Date(a.llnd?.completedAt || a.rawDate || a.completedDate || a.date);
        const dateB = new Date(b.llnd?.completedAt || b.rawDate || b.completedDate || b.date);
        return dateB - dateA;
      });

      setData(sorted);
      setFilteredData(sorted);

      const total = sorted.length;
      const passed = sorted.filter(r => r.result === "Passed").length;
      const failed = sorted.filter(r => r.result === "Failed").length;
      const pending = sorted.filter(r => r.status !== "Approved").length;

      const avgScore =
        total > 0
          ? (sorted.reduce((sum, r) => sum + (r.score || 0), 0) / total).toFixed(2)
          : 0;

      const passRate =
        total > 0 ? ((passed / total) * 100).toFixed(2) : 0;

      setStats({
        totalAssessments: total,
        passed,
        failed,
        pendingReview: pending,
        averageScore: avgScore,
        passRate
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    let temp = [...data];

    if (search.trim()) {
      const q = search.toLowerCase();
      temp = temp.filter(
        (r) =>
          r.student?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "All Status") {
      temp = temp.filter(
        (r) => r.status === statusFilter || r.result === statusFilter
      );
    }

    setFilteredData(temp);
    setPage(1);
  }, [search, statusFilter, data]);

  useEffect(() => {
    const studentId = searchParams.get("studentId");
    const openModal = searchParams.get("openModal");

    if (!studentId || !openModal || data.length === 0) return;

    const record = data.find(r => String(r.id || r._id) === studentId);
    if (record) {
      setSelectedRecord(record);
    }
  }, [data, searchParams]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const pageData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="lln-root">
      <div className="lln-page-header">
        <h1 className="lln-page-title">Quiz Results Management</h1>
        <p className="lln-page-sub">Review and manage student pre-enrollment assessment results</p>
      </div>

      <div className="lln-stats-grid lln-stats-grid-4">
        <StatCard label="Total Assessments" value={stats.totalAssessments} />
        <StatCard label="Passed" value={stats.passed} valueClass="lln-val-green" />
        <StatCard label="Failed" value={stats.failed} valueClass="lln-val-red" />
        <StatCard label="Pending Review" value={stats.pendingReview} valueClass="lln-val-amber" />
      </div>

      <div className="lln-stats-grid lln-stats-grid-3">
        <StatCard label="Average Score" value={`${stats.averageScore}%`} valueClass="lln-val-blue" />
        <StatCard label="Pass Rate" value={`${stats.passRate}%`} />
      </div>

      <div className="lln-card">
        <div className="lln-card-header">
          <div>
            <h2 className="lln-card-title">Assessment Results</h2>
            <p className="lln-card-sub">View and manage all student assessment results</p>
          </div>
        </div>

        <div className="lln-toolbar">
          <div className="lln-search-wrap">
            <span className="lln-search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              className="lln-search-input"
              placeholder="Search by student name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="lln-toolbar-right">
            <select
              className="lln-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Passed</option>
              <option>Failed</option>
              <option>Approved</option>
              <option>Pending Review</option>
            </select>

            <button className="lln-btn lln-btn-outline lln-btn-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Search
            </button>

            <button
              className="lln-btn lln-btn-outline lln-btn-icon"
              onClick={() => {
                setSearch("");
                setStatusFilter("All Status");
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <div className="lln-table-wrap">
          <table className="lln-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Course</th>
                <th>Course booking date</th>
                <th>Individual/Company</th>
                <th>Overall Score</th>
                <th>Result</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((row) => {
                const dateSource = row.llnd?.completedAt || row.completedDate || row.date;
                const { d, t } = formatDateTime(dateSource);

                return (
                  <tr key={row.id || row._id}>
                    <td className="lln-td-date">
                      <div style={{ fontWeight: "600", color: "#334155" }}>{d}</div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{t}</div>
                    </td>
                    <td>
                      <span className="lln-student-name">{row.student}</span>
                      <span className="lln-student-email">{row.email}</span>
                    </td>
                    <td className="lln-td-course">{row.course}</td>
                    <td>{row.bookingDate}</td>
                    <td>{row.type}</td>
                    <td>
                      <span className={`lln-score ${row.score >= 80 ? "lln-score-high" : row.score >= 67 ? "lln-score-mid" : "lln-score-low"}`}>
                        {row.score}%
                      </span>
                    </td>
                    <td><ResultBadge result={row.result} /></td>
                    <td><StatusBadge status={row.status} /></td>
                    <td>
                      <button
                        className="lln-btn-view"
                        onClick={() => setSelectedRecord(row)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="lln-pagination">
          <span className="lln-pagination-info">
            Showing {filteredData.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredData.length)} of {filteredData.length} results
          </span>
          <div className="lln-pagination-controls">
            <button
              className="lln-btn lln-btn-outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span className="lln-page-label">Page {page} of {totalPages || 1}</span>
            <button
              className="lln-btn lln-btn-outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedRecord && (
        <AssessmentModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onRefresh={(updatedId) => {
            fetchResults().then(() => {
              const updatedRecord = data.find(r => String(r.id || r._id) === String(updatedId));
              if (updatedRecord) setSelectedRecord(updatedRecord);
            });
          }}
        />
      )}
    </div>
  );
}