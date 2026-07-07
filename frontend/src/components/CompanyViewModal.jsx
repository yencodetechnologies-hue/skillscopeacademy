import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CompanyViewModal.css"
import { API_URL } from "../data/service";

/* ── Icons ── */
const CloseIcon = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const BuildingIcon = ({ size = 22, color = "white" }) => (
    <svg width={size} height={size} fill={color} viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);
const MailIcon = () => (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);
const CalendarIcon = () => (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const CourseLinkIcon = () => (
    <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);
const EnrolmentIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const LinkIcon = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
);

/* ── Course Link Card with students toggle ── */
function LinkCard({ link, students }) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const url = `${window.location.origin}/book-now?token=${link.token}`;
    const navigate = useNavigate();
    const isFull = link.usedCount >= link.maxUses;
    const linkStudents = students.filter(s => s.sourceToken === link.token);

    const handleCopy = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const payBg = (p) => {
        if (p === "Paid") return { background: "#ecfdf5", color: "#059669" };
        if (p === "Failed") return { background: "#fef2f2", color: "#dc2626" };
        return { background: "#fef3c7", color: "#b45309" };
    };
    const llndBg = (l) => l === "Completed"
        ? { background: "#ecfdf5", color: "#059669" }
        : { background: "#f3f4f6", color: "#6b7280" };
    const formBg = (f) => f === "Submitted"
        ? { background: "#e0f2fe", color: "#0369a1" }
        : { background: "#fef2f2", color: "#dc2626" };

    return (
        <div className="cvm-link-card" style={{ opacity: isFull ? 0.85 : 1 }}>
            {/* Card top row */}
            <div className="cvm-link-card-top">
                <div className="cvm-link-card-info">
                    <p className="cvm-link-course-name">{link.courseName || "—"}</p>
                    <p className="cvm-link-course-meta">
                        {link.courseCode || ""}
                        {link.sessionDate ? ` · ${new Date(link.sessionDate).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" })}` : ""}
                        {link.startTime ? ` · ${link.startTime}${link.endTime ? ` – ${link.endTime}` : ""}` : ""}
                    </p>
                </div>
                <span className={`cvm-link-badge ${isFull ? "cvm-link-badge-full" : "cvm-link-badge-avail"}`}>
                    {link.usedCount}/{link.maxUses} used · {isFull ? "Full" : "Available"}
                </span>
            </div>

            {/* URL box */}
            <div className="cvm-link-url-box">{url}</div>

            {/* Buttons */}
            <div className="cvm-link-btns">
                <button
                    className={`cvm-link-btn-copy ${isFull ? "cvm-link-btn-copy--disabled" : ""}`}
                    onClick={handleCopy}
                    disabled={isFull}
                >
                    <LinkIcon /> {copied ? "Copied!" : "Copy Link"}
                </button>
                <button
                    className={`cvm-link-btn-students ${open ? "cvm-link-btn-students--active" : ""}`}
                    onClick={() => setOpen(v => !v)}
                >
                    {open ? "Hide Students" : `View Students${linkStudents.length > 0 ? ` (${linkStudents.length})` : ""}`}
                </button>
                <button
                    className="cvm-link-btn-students"
                    style={{ background: "#f5f3ff", color: "#cc0000", border: "1px solid#cc000033" }}
                    onClick={() => window.open(url, "_blank")}
                >
                    Open Link ↗
                </button>
            </div>

            {/* Students panel */}
            {open && (
                <div className="cvm-link-students-panel">
                    <div className="cvm-link-students-header">
                        👥 Students enrolled via this link
                    </div>
                    {linkStudents.length === 0 ? (
                        <p className="cvm-link-students-empty">No students enrolled via this link yet.</p>
                    ) : (
                        <div className="cvm-table-scroll">
                            <table className="cvm-student-table" style={{ minWidth: 600 }}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>STUDENT</th>
                                        <th>COURSE</th>
                                        <th>PAYMENT</th>
                                        <th>LLN</th>
                                        <th>FORM</th>
                                        <th>ENROLLED</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {linkStudents.map((s, i) => (
                                        <tr key={i}>
                                            <td>{i + 1}</td>
                                            <td>
                                                <div className="cvm-stu-name">{s.name}</div>
                                                <div className="cvm-stu-meta">{s.email}</div>
                                                {s.phone && <div className="cvm-stu-meta">{s.phone}</div>}
                                            </td>
                                            <td>{s.course}</td>
                                            <td>
                                                <span style={{ ...payBg(s.payment), padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                                                    {s.payment}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ ...llndBg(s.llnd), padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                                                    {s.llnd}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ ...formBg(s.form), padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                                                    {s.form}
                                                </span>
                                            </td>
                                            <td className="cvm-stu-date">{s.enrolled}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function formatPurchaseDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-AU", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "Australia/Sydney",
    });
}

function formatSessionDate(d) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" });
}

function purchaseStatusLabel(p) {
    if (p.status === "success" || p.confirmed) return "Paid";
    if (p.status === "failed") return "Failed";
    return "Pending";
}

function PurchasesSection({ purchases }) {
    const orders = purchases || [];
    return (
        <div className="cvm-section cvm-purchases-section">
            <div className="cvm-section-header">
                <h3 className="cvm-section-title">Purchased courses</h3>
                <p className="cvm-section-sub">
                    Course orders paid by this company (from company payment records).
                </p>
            </div>
            {orders.length === 0 ? (
                <p className="cvm-purchases-empty">No course purchases recorded yet.</p>
            ) : (
                <div className="cvm-purchases-list">
                    {orders.map((order) => {
                        const status = purchaseStatusLabel(order);
                        const statusClass =
                            status === "Paid" ? "cvm-purchase-badge-paid" :
                            status === "Failed" ? "cvm-purchase-badge-failed" : "cvm-purchase-badge-pending";
                        return (
                            <div key={order._id} className="cvm-purchase-card">
                                <div className="cvm-purchase-card-top">
                                    <div>
                                        <p className="cvm-purchase-order">
                                            Order {order.orderId || "—"}
                                        </p>
                                        <p className="cvm-purchase-meta">
                                            {formatPurchaseDate(order.createdAt)}
                                            {order.paymentMethod ? ` · ${order.paymentMethod}` : ""}
                                        </p>
                                    </div>
                                    <div className="cvm-purchase-right">
                                        <span className={`cvm-purchase-badge ${statusClass}`}>{status}</span>
                                        <span className="cvm-purchase-amount">
                                            ${Number(order.amount || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                {order.gatewayTransactionId && (
                                    <p className="cvm-purchase-txn">Txn: {order.gatewayTransactionId}</p>
                                )}
                                {(order.courses || []).length > 0 ? (
                                    <ul className="cvm-purchase-courses">
                                        {(order.courses || []).map((c, i) => (
                                            <li key={i}>
                                                <strong>{c.courseName || "Course"}</strong>
                                                {c.courseCode ? ` (${c.courseCode})` : ""}
                                                {" · "}Qty {c.quantity || 1}
                                                {c.pricePerPerson ? ` · $${Number(c.pricePerPerson).toFixed(2)}/person` : ""}
                                                {c.sessionDate && (
                                                    <span className="cvm-purchase-session">
                                                        {" · "}
                                                        {formatSessionDate(c.sessionDate)}
                                                        {c.startTime ? ` ${c.startTime}` : ""}
                                                        {c.endTime ? ` – ${c.endTime}` : ""}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="cvm-purchase-no-courses">No course line items on this order.</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ── Main Modal ── */
export default function CompanyViewModal({ company, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!company) return;
        const fetchDetail = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `${API_URL}/api/companies/${company._id}/details`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setData(res.data.data);
            } catch (err) {
                console.error(err);
                setData(company);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [company]);

    const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

    const formatJoined = (dateStr) => {
        if (!dateStr) return { date: "—", time: "" };
        const d = new Date(dateStr);
        return {
            date: d.toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }),
            time: d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Australia/Sydney" }),
        };
    };

    const joined = formatJoined(data?.createdAt);
    const links = data?.courseLinks || [];
    const students = data?.students || [];
    const linkCount = data?.courseLinksCount ?? links.length ?? data?.linkCount ?? 0;
    const enrolCount = data?.enrolmentsCount ?? students.length ?? data?.enrollmentCount ?? 0;
    const purchases = data?.purchases || [];

    const [linkCopied, setLinkCopied] = useState(false);
    const enrolmentUrl = `${window.location.origin}/book-now/company/${data?._id}`;

    const handleCopyEnrolmentLink = () => {
        navigator.clipboard.writeText(enrolmentUrl).then(() => {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        });
    };

    return (
        <div className="cvm-backdrop" onClick={handleBackdrop}>
            <div className="cvm-modal">
                {/* ── Header ── */}
                <div className="cvm-header">
                    <div className="cvm-header-left">
                        <div className="cvm-company-avatar">
                            <BuildingIcon size={22} color="white" />
                        </div>
                        <div>
                            <h2 className="cvm-company-name">{data?.companyName || data?.name || "Company"}</h2>
                            <p className="cvm-company-tagline">Course links, enrolled students & enrolment status</p>
                        </div>
                    </div>
                    <button className="cvm-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>

                {/* ── Body ── */}
                <div className="cvm-body">
                    {loading ? (
                        <div className="cvm-loading">Loading...</div>
                    ) : (
                        <>
                            {/* Profile bar */}
                            <div className="cvm-profile-card">
                                <a href={`mailto:${data?.email}`} className="cvm-profile-email">
                                    <MailIcon />
                                    <span>{data?.email}</span>
                                </a>
                                <div className="cvm-profile-divider" />
                                <div className="cvm-profile-joined">
                                    <CalendarIcon />
                                    <div>
                                        <span className="cvm-joined-label">Joined</span>
                                        <span className="cvm-joined-date">{joined.date}</span>
                                        <span className="cvm-joined-time">{joined.time}</span>
                                    </div>
                                </div>
                                <div className="cvm-profile-right">
                                    <span className={`cvm-account-badge ${data?.status === "Active" ? "cvm-badge-active" : "cvm-badge-inactive"}`}>
                                        {data?.status === "Active" ? "Active account" : "Inactive account"}
                                    </span>
                                    {data?.payLater && (
                                        <span className="cvm-account-badge cvm-badge-paylater">
                                            Pay Later enabled
                                        </span>
                                    )}
                                    <span className="cvm-last-login">Last login: {data?.lastLogin || "Never"}</span>
                                </div>
                            </div>

                            {/* Contact person & mobile row */}
                            {(data?.contactPerson || data?.mobileNumber) && (
                                <div className="cvm-meta-row">
                                    {data?.contactPerson && (
                                        <div className="cvm-meta-item">
                                            <span className="cvm-meta-label">Contact Person</span>
                                            <span className="cvm-meta-value">{data.contactPerson}</span>
                                        </div>
                                    )}
                                    {data?.mobileNumber && (
                                        <div className="cvm-meta-item">
                                            <span className="cvm-meta-label">Mobile</span>
                                            <span className="cvm-meta-value">{data.mobileNumber}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Stat Cards */}
                            <div className="cvm-stats-row">
                                <div className="cvm-stat-card cvm-stat-blue">
                                    <div className="cvm-stat-icon cvm-icon-blue"><CourseLinkIcon /></div>
                                    <div>
                                        <div className="cvm-stat-num">{linkCount}</div>
                                        <div className="cvm-stat-label">Course links</div>
                                    </div>
                                </div>
                                <div className="cvm-stat-card cvm-stat-gray">
                                    <div className="cvm-stat-icon cvm-icon-gray"><EnrolmentIcon /></div>
                                    <div>
                                        <div className="cvm-stat-num">{enrolCount}</div>
                                        <div className="cvm-stat-label">Company enrolments</div>
                                    </div>
                                </div>
                            </div>

                            <PurchasesSection purchases={purchases} />

                            {/* ── General Enrolment Link ── */}
                            <div className="cvm-section" style={{ border: "1px solid#cc000033", background: "#f5f3ff44" }}>
                                <div className="cvm-section-header" style={{ background: "#f5f3ff88" }}>
                                    <h3 className="cvm-section-title" style={{ color: "#cc0000" }}>General Enrolment Link</h3>
                                    <p className="cvm-section-sub">
                                        Share this link with employees. They can select any course and enroll themselves under your company account.
                                    </p>
                                </div>
                                <div style={{ padding: "14px 16px" }}>
                                    <div className="cvm-link-url-box" style={{ background: "white", border: "1px solid #e0e7ff", marginBottom: 12 }}>
                                        {enrolmentUrl}
                                    </div>
                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                        <button 
                                            className="cvm-link-btn-copy" 
                                            onClick={handleCopyEnrolmentLink}
                                            style={{ width: "fit-content" }}
                                        >
                                            <LinkIcon /> {linkCopied ? "Copied URL!" : "Copy Enrolment Link"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* ── Course Booking Links ── */}
                            {links.length > 0 && (
                                <div className="cvm-section">
                                    <div className="cvm-section-header">
                                        <h3 className="cvm-section-title">Course Booking Links</h3>
                                        <p className="cvm-section-sub">
                                            Each link was generated for a specific course. Click "View Students" to see who enrolled via that link.
                                        </p>
                                    </div>
                                    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                                        {links.map(link => (
                                            <LinkCard key={link._id} link={link} students={students} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {links.length === 0 && (
                                <div style={{ textAlign: "center", padding: "24px", color: "#9ca3af", fontSize: 13, border: "1px dashed #e5e7eb", borderRadius: 12 }}>
                                    No course links generated for this company yet.
                                </div>
                            )}

                            {/* ── All Enrolled Students ── */}
                            <div className="cvm-section">
                                <div className="cvm-section-header">
                                    <h3 className="cvm-section-title">All Enrolled Students ({students.length})</h3>
                                    <p className="cvm-section-sub">
                                        Every student enrolled under this company — across all links and booking types.
                                    </p>
                                </div>
                                {students.length === 0 ? (
                                    <p style={{ padding: "20px 18px", color: "#9ca3af", fontSize: 13, margin: 0 }}>
                                        No students enrolled yet.
                                    </p>
                                ) : (
                                    <div className="cvm-table-scroll">
                                        <table className="cvm-main-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>STUDENT</th>
                                                    <th>COURSE</th>
                                                    <th>AMOUNT</th>
                                                    <th>PAYMENT</th>
                                                    <th>LLN</th>
                                                    <th>FORM</th>
                                                    <th>TRAINING</th>
                                                    <th>ENROLLED</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students.map((s, i) => (
                                                    <tr key={i}>
                                                        <td>{i + 1}</td>
                                                        <td>
                                                            <div className="cvm-stu-name">{s.name}</div>
                                                            <div className="cvm-stu-meta">{s.email}</div>
                                                            {s.phone && <div className="cvm-stu-meta">{s.phone}</div>}
                                                        </td>
                                                        <td>{s.course}</td>
                                                        <td>{s.amount}</td>
                                                        <td><span className={`cvm-tag cvm-tag-${s.payment?.toLowerCase()}`}>{s.payment}</span></td>
                                                        <td><span className={`cvm-tag cvm-tag-${s.llnd?.toLowerCase().replace(/ /g, "-")}`}>{s.llnd}</span></td>
                                                        <td><span className={`cvm-tag cvm-tag-${s.form?.toLowerCase().replace(/ /g, "-")}`}>{s.form}</span></td>
                                                        <td><span className={`cvm-tag cvm-tag-${s.training?.toLowerCase().replace(/ /g, "-")}`}>{s.training}</span></td>
                                                        <td><div className="cvm-stu-date">{s.enrolled}</div></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
