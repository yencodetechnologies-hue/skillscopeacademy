import React, { useState, useEffect } from "react";
import { colors } from '../constants/theme';
import "../styles/Companies.css";
import axios from "axios";
import { API_URL } from "../data/service";
const PAGE_SIZE = 10;

/* ── Icons ── */
const EyeIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const EyeOffIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);
const EditIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const TrashIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
);
const SearchIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const BuildingIcon = () => (
    <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);
const PlusIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const CloseIcon = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const MailIcon = () => (
    <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);
const PhoneIcon = () => (
    <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.34 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);
const LockIcon = () => (
    <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const LinkIcon = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
);

/* ── Links Modal ── */
function LinksModal({ company, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openToken, setOpenToken] = useState(null);
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get(`${API_URL}/api/companies/${company._id}/details`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setData(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [company._id]);

    const handleCopy = (linkToken) => {
        const url = `${window.location.origin}/book-now?token=${linkToken}`;
        navigator.clipboard.writeText(url);
        setCopied(linkToken);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

    const links = data?.courseLinks || [];
    const students = data?.students || [];

    return (
        <div className="modal-backdrop" onClick={handleBackdrop}>
            <div className="modal-box" style={{ maxWidth: 820 }}>
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Course Links — {company.companyName || company.name}</h2>
                        <p className="modal-subtitle">{links.length} link{links.length !== 1 ? "s" : ""} generated</p>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    {loading ? (
                        <p style={{ color: colors.textIcon, padding: 20 }}>Loading...</p>
                    ) : links.length === 0 ? (
                        <p style={{ color: colors.textIcon, textAlign: "center", padding: 40 }}>No links generated for this company yet.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid #e5e7eb", background: colors.bg }}>
                                    <th style={{ padding: "10px 12px", textAlign: "left", color: colors.textMuted, fontWeight: 600 }}>#</th>
                                    <th style={{ padding: "10px 12px", textAlign: "left", color: colors.textMuted, fontWeight: 600 }}>Course</th>
                                    <th style={{ padding: "10px 12px", textAlign: "left", color: colors.textMuted, fontWeight: 600 }}>Session Date</th>
                                    <th style={{ padding: "10px 12px", textAlign: "center", color: colors.textMuted, fontWeight: 600 }}>Used / Max</th>
                                    <th style={{ padding: "10px 12px", textAlign: "center", color: colors.textMuted, fontWeight: 600 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {links.map((link, i) => {
                                    const linkStudents = students.filter(s => s.sourceToken === link.token);
                                    const isOpen = openToken === link.token;
                                    const isExpired = link.usedCount >= link.maxUses;
                                    return (
                                        <React.Fragment key={link._id}>
                                            <tr style={{ borderBottom: "1px solid #f0f0f0", background: isOpen ? "#faf8ff" : "white" }}>
                                                <td style={{ padding: "12px", color: "#9ca3af" }}>{i + 1}</td>
                                                <td style={{ padding: "12px", fontWeight: 600, color: "#1a1a2e" }}>{link.courseName || "—"}</td>
                                                <td style={{ padding: "12px", color: "#555" }}>
                                                    {link.sessionDate ? new Date(link.sessionDate).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }) : "—"}
                                                </td>
                                                <td style={{ padding: "12px", textAlign: "center" }}>
                                                    <span style={{
                                                        fontWeight: 700,
                                                        color: isExpired ? "#e53e3e" : link.usedCount > 0 ? "#f59e0b" : colors.success,
                                                        background: isExpired ? "#fff5f5" : link.usedCount > 0 ? "#fffbeb" : "#f0fdf4",
                                                        padding: "2px 10px", borderRadius: 12, fontSize: 12
                                                    }}>
                                                        {link.usedCount} / {link.maxUses}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "12px", textAlign: "center" }}>
                                                    <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
                                                        <button
                                                            style={{ padding: "4px 10px", border: "1px solid #ddd", borderRadius: 6, background: colors.white, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}
                                                            onClick={() => handleCopy(link.token)}
                                                        >
                                                            {copied === link.token ? "✓ Copied" : "Copy Link"}
                                                        </button>
                                                        <button
                                                            style={{ padding: "4px 8px", border: "none", background: "none", cursor: "pointer", color: isOpen ? colors.brandPrimary : "#9ca3af", display: "flex", alignItems: "center" }}
                                                            onClick={() => setOpenToken(isOpen ? null : link.token)}
                                                            title="View students"
                                                        >
                                                            <EyeIcon />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isOpen && (
                                                <tr>
                                                    <td colSpan={5} style={{ padding: "0 12px 14px 40px", background: "#faf8ff", borderBottom: "1px solid #ede9fe" }}>
                                                        {linkStudents.length === 0 ? (
                                                            <p style={{ color: "#9ca3af", fontSize: 12, margin: "10px 0 4px" }}>No students enrolled via this link yet.</p>
                                                        ) : (
                                                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginTop: 10 }}>
                                                                <thead>
                                                                    <tr style={{ color: "#9ca3af" }}>
                                                                        <th style={{ padding: "4px 8px", textAlign: "left", fontWeight: 600 }}>Name</th>
                                                                        <th style={{ padding: "4px 8px", textAlign: "left", fontWeight: 600 }}>Email</th>
                                                                        <th style={{ padding: "4px 8px", textAlign: "left", fontWeight: 600 }}>Course</th>
                                                                        <th style={{ padding: "4px 8px", textAlign: "left", fontWeight: 600 }}>Enrolled</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {linkStudents.map((s, si) => (
                                                                        <tr key={si} style={{ borderTop: "1px solid #ede9fe" }}>
                                                                            <td style={{ padding: "6px 8px", fontWeight: 600, color: "#1a1a2e" }}>{s.name}</td>
                                                                            <td style={{ padding: "6px 8px", color: "#555" }}>{s.email}</td>
                                                                            <td style={{ padding: "6px 8px", color: colors.textSecondary }}>{s.course}</td>
                                                                            <td style={{ padding: "6px 8px", color: "#9ca3af" }}>{s.enrolled}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Add / Edit Company Modal ── */
function AddCompanyModal({ onClose, onAdd, editData, onUpdate }) {
    const [form, setForm] = useState({ name: "", contactPerson: "", email: "", mobile: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Company name is required";
        if (!form.contactPerson.trim()) e.contactPerson = "Contact person is required";
        if (!form.email.trim()) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
        if (!editData) {
            if (!form.password) e.password = "Password is required";
            else if (form.password.length < 6) e.password = "Minimum 6 characters";
        }
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (editData) {
                const res = await axios.put(
                    `${API_URL}/api/companies/${editData._id}`,
                    {
                        companyName: form.name,
                        contactPerson: form.contactPerson,
                        email: form.email,
                        mobileNumber: form.mobile,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                onUpdate(res.data.data);
            } else {
                const res = await axios.post(
                    `${API_URL}/api/companies`,
                    {
                        companyName: form.name,
                        contactPerson: form.contactPerson,
                        email: form.email,
                        mobileNumber: form.mobile,
                        password: form.password,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                onAdd(res.data.data);
            }
            onClose();
        } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.message || (editData ? "Update failed" : "Create failed");
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setForm((f) => ({ ...f, [field]: value }));
        if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    };

    useEffect(() => {
        if (editData) {
            setForm({
                name: editData.companyName || "",
                contactPerson: editData.contactPerson || "",
                email: editData.email || "",
                mobile: editData.mobileNumber || "",
                password: "",
            });
        }
    }, [editData]);

    const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

    return (
        <div className="modal-backdrop" onClick={handleBackdrop}>
            <div className="modal-box">
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">{editData ? "Edit Company" : "Add Company"}</h2>
                        <p className="modal-subtitle">Fill in company name, email, and password to create a company account</p>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="modal-body">
                    <div className="field-group">
                        <label className="field-label">Company Name</label>
                        <div className={`field-input-wrap ${errors.name ? "field-error" : ""}`}>
                            <span className="field-icon"><BuildingIcon /></span>
                            <input className="field-input" placeholder="Acme Corp" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
                        </div>
                        {errors.name && <span className="error-msg">{errors.name}</span>}
                    </div>
                    <div className="field-group">
                        <label className="field-label">Contact Person</label>
                        <div className={`field-input-wrap ${errors.contactPerson ? "field-error" : ""}`}>
                            <span className="field-icon"><BuildingIcon /></span>
                            <input
                                className="field-input"
                                placeholder="Primary contact name"
                                value={form.contactPerson}
                                onChange={(e) => handleChange("contactPerson", e.target.value)}
                            />
                        </div>
                        {errors.contactPerson && <span className="error-msg">{errors.contactPerson}</span>}
                    </div>
                    <div className="field-group">
                        <label className="field-label">Email</label>
                        <div className={`field-input-wrap ${errors.email ? "field-error" : ""}`}>
                            <span className="field-icon"><MailIcon /></span>
                            <input className="field-input" type="email" placeholder="company@example.com" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
                        </div>
                        {errors.email && <span className="error-msg">{errors.email}</span>}
                    </div>
                    <div className="field-group">
                        <label className="field-label">Mobile Number</label>
                        <div className="field-input-wrap">
                            <span className="field-icon"><PhoneIcon /></span>
                            <input className="field-input" placeholder="0400 000 000" value={form.mobile} onChange={(e) => handleChange("mobile", e.target.value)} />
                        </div>
                    </div>
                    {!editData && (
                        <div className="field-group">
                            <label className="field-label">Password</label>
                            <div className={`field-input-wrap ${errors.password ? "field-error" : ""}`}>
                                <span className="field-icon"><LockIcon /></span>
                                <input
                                    className="field-input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••"
                                    value={form.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                />
                                <button className="pwd-toggle" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            {errors.password && <span className="error-msg">{errors.password}</span>}
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-add-modal" onClick={handleSubmit}>
                        {loading ? "Processing..." : editData ? "Update Company" : "Add Company"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Delete Company Modal ── */
function DeleteCompanyModal({ company, onClose, onConfirm }) {
    const [deleting, setDeleting] = useState(false);
    const companyName = company.companyName || company.name || "this company";

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await onConfirm(company._id);
            onClose();
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Delete failed");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} role="alertdialog">
            <div className="modal-box modal-box-sm" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                            <h2 className="modal-title">Delete Company?</h2>
                            <p className="modal-subtitle">
                                Are you sure you want to delete the company <strong>{companyName}</strong>? This action cannot be undone.
                            </p>
                        </div>
                    <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Close">
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-delete-body">
                    <p><strong>Email:</strong> {company.email}</p>
                    {company.contactPerson && (
                        <p><strong>Contact:</strong> {company.contactPerson}</p>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={deleting} type="button">
                        Cancel
                    </button>
                    <button className="btn-delete-company" onClick={handleDelete} disabled={deleting} type="button">
                        {deleting ? "Deleting..." : "Delete Company"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── View All Details Modal (email group + enrolled students) ──
   Simplified: only shows the General Enrolment Link and the
   Course Booking Links, each expandable to the students who
   enrolled through that specific link. */
function ViewAllDetailsModal({ records, onClose, onPayLaterToggle }) {
    const [detailsByCompany, setDetailsByCompany] = useState({});
    const [loading, setLoading] = useState(true);
    const [openToken, setOpenToken] = useState({}); // { [companyId]: token }
    const [copied, setCopied] = useState(null); // key of whatever was just copied
    const email = records?.[0]?.email || "";

    useEffect(() => {
        let cancelled = false;
        const token = localStorage.getItem("token");
        const fetchAll = async () => {
            try {
                const results = await Promise.all(
                    records.map((r) =>
                        axios
                            .get(`${API_URL}/api/companies/${r._id}/details`, {
                                headers: { Authorization: `Bearer ${token}` },
                            })
                            .then((res) => ({
                                id: r._id,
                                students: res.data?.data?.students || [],
                                courseLinks: res.data?.data?.courseLinks || [],
                            }))
                            .catch(() => ({ id: r._id, students: [], courseLinks: [] }))
                    )
                );
                if (cancelled) return;
                const map = {};
                results.forEach((r) => { map[r.id] = r; });
                setDetailsByCompany(map);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchAll();
        return () => { cancelled = true; };
    }, [records]);

    const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

    const handleCopy = (key, text) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdrop}>
            <div className="modal-box" style={{ maxWidth: 920 }}>
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Company Details — {email}</h2>
                        <p className="modal-subtitle">{records.length} record{records.length !== 1 ? "s" : ""} for this email</p>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="modal-body" style={{ maxHeight: "72vh", overflowY: "auto" }}>
                    {/* ── Company name shown once ── */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                        <div className="company-icon"><BuildingIcon /></div>
                        <div>
                            <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 15 }}>
                                {records[0]?.companyName || records[0]?.name || "—"}
                            </div>
                            <span className={`badge ${records[0]?.status === "Active" ? "badge-active" : "badge-inactive"}`}>
                                {records[0]?.status}
                            </span>
                        </div>
                    </div>

                    {/* ── Enrolment Links (separate section, one per record) ── */}
                    <div style={{ background: "#f7f6fd", border: "1px solid #ece9fb", borderRadius: 10, padding: 14, marginBottom: 16 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Enrolment Links</h4>
                        <p style={{ fontSize: 12, color: colors.textMuted, margin: "4px 0 12px" }}>
                            Share this link with employees. They can select any course and enroll themselves under your company account.
                        </p>
                        {records.map((r) => {
                            const enrolmentLink = `${window.location.origin}/book-now/company/${r._id}`;
                            return (
                                <div key={r._id} style={{ marginBottom: 10 }}>
                                    <div style={{
                                        background: "white", border: "1px solid #e5e7eb", borderRadius: 8,
                                        padding: "8px 12px", fontSize: 12, color: "#555", marginBottom: 8,
                                        overflowX: "auto", whiteSpace: "nowrap",
                                    }}>
                                        {enrolmentLink}
                                    </div>
                                    <button
                                        style={{
                                            border: "none", background: colors.brandPrimary, color: "white",
                                            fontWeight: 700, fontSize: 13, borderRadius: 8, padding: "8px 16px",
                                            cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                                        }}
                                        onClick={() => handleCopy(`enrol-${r._id}`, enrolmentLink)}
                                    >
                                        <LinkIcon /> {copied === `enrol-${r._id}` ? "Copied!" : "Copy Enrolment Link"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Course Booking Links (separate section, all records) ── */}
                    <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 10, padding: 14 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Course Booking Links</h4>
                        <p style={{ fontSize: 12, color: colors.textMuted, margin: "4px 0 12px" }}>
                            Each link was generated for a specific course. Click "View Students" to see who enrolled via that link.
                        </p>

                        {loading ? (
                            <p style={{ color: colors.textIcon, fontSize: 12 }}>Loading links...</p>
                        ) : (
                            (() => {
                                const allCourseLinks = records.flatMap((r) => {
                                    const detail = detailsByCompany[r._id] || { students: [], courseLinks: [] };
                                    return detail.courseLinks.map((link) => ({ link, recordId: r._id, students: detail.students }));
                                });

                                if (allCourseLinks.length === 0) {
                                    return <p style={{ color: "#9ca3af", fontSize: 12 }}>No course-specific links generated yet.</p>;
                                }

                                return allCourseLinks.map(({ link, recordId, students }) => {
                                    const linkStudents = students.filter((s) => s.sourceToken === link.token);
                                    const isOpen = openToken[recordId] === link.token;
                                    const isExpired = link.usedCount >= link.maxUses;
                                    const linkUrl = `${window.location.origin}/book-now?token=${link.token}`;
                                    const statusLabel = isExpired
                                        ? `${link.usedCount}/${link.maxUses} used · Full`
                                        : `${link.usedCount}/${link.maxUses} used`;

                                    return (
                                        <div
                                            key={link._id}
                                            style={{
                                                background: "white", border: "1px solid #eee", borderRadius: 10,
                                                padding: 14, marginBottom: 10,
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 14 }}>
                                                        {link.courseName || "—"}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                                                        {[
                                                            link.courseCode,
                                                            link.sessionDate
                                                                ? new Date(link.sessionDate).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" })
                                                                : null,
                                                            link.startTime && link.endTime ? `${link.startTime} – ${link.endTime}` : null,
                                                        ].filter(Boolean).join(" · ")}
                                                    </div>
                                                </div>
                                                <span style={{
                                                    fontWeight: 700, fontSize: 11, whiteSpace: "nowrap",
                                                    color: isExpired ? "#e53e3e" : link.usedCount > 0 ? "#f59e0b" : colors.success,
                                                    background: isExpired ? "#fff5f5" : link.usedCount > 0 ? "#fffbeb" : "#f0fdf4",
                                                    padding: "4px 10px", borderRadius: 12,
                                                }}>
                                                    {statusLabel}
                                                </span>
                                            </div>

                                            <div style={{
                                                background: "#f9fafb", border: "1px solid #eee", borderRadius: 8,
                                                padding: "8px 12px", fontSize: 12, color: "#555", margin: "10px 0",
                                                overflowX: "auto", whiteSpace: "nowrap",
                                            }}>
                                                {linkUrl}
                                            </div>

                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button
                                                    style={{
                                                        border: "1px solid #ddd", background: "#f3f4f6", color: "#6b7280",
                                                        fontWeight: 700, fontSize: 12, borderRadius: 8, padding: "6px 14px",
                                                        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                                                    }}
                                                    onClick={() => handleCopy(link.token, linkUrl)}
                                                >
                                                    <LinkIcon /> {copied === link.token ? "Copied!" : "Copy Link"}
                                                </button>
                                                <button
                                                    style={{
                                                        border: `1px solid ${colors.brandPrimary}33`, background: "white",
                                                        color: colors.brandPrimary, fontWeight: 700, fontSize: 12,
                                                        borderRadius: 8, padding: "6px 14px", cursor: "pointer",
                                                    }}
                                                    onClick={() => setOpenToken((prev) => ({
                                                        ...prev,
                                                        [recordId]: isOpen ? null : link.token,
                                                    }))}
                                                >
                                                    {isOpen ? "Hide Students" : `View Students (${linkStudents.length})`}
                                                </button>
                                                <a
                                                    href={linkUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{
                                                        border: `1px solid ${colors.brandPrimary}33`, background: "white",
                                                        color: colors.brandPrimary, fontWeight: 700, fontSize: 12,
                                                        borderRadius: 8, padding: "6px 14px", textDecoration: "none",
                                                        display: "inline-flex", alignItems: "center",
                                                    }}
                                                >
                                                    Open Link ↗
                                                </a>
                                            </div>

                                            {isOpen && (
                                                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f0f0f0" }}>
                                                    {linkStudents.length === 0 ? (
                                                        <p style={{ color: "#9ca3af", fontSize: 12, margin: 0 }}>No students enrolled via this link yet.</p>
                                                    ) : (
                                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                                            <thead>
                                                                <tr style={{ color: "#9ca3af" }}>
                                                                    <th style={{ padding: "4px 8px", textAlign: "left", fontWeight: 600 }}>Name</th>
                                                                    <th style={{ padding: "4px 8px", textAlign: "left", fontWeight: 600 }}>Email</th>
                                                                    <th style={{ padding: "4px 8px", textAlign: "left", fontWeight: 600 }}>Enrolled</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {linkStudents.map((s, si) => (
                                                                    <tr key={si} style={{ borderTop: "1px solid #f5f5f5" }}>
                                                                        <td style={{ padding: "6px 8px", fontWeight: 600, color: "#1a1a2e" }}>{s.name}</td>
                                                                        <td style={{ padding: "6px 8px", color: "#555" }}>{s.email}</td>
                                                                        <td style={{ padding: "6px 8px", color: "#9ca3af" }}>{s.enrolled}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Grouped Records Modal (same email) ── */
function GroupedRecordsModal({ records, onClose, onView, onEdit, onToggle, onDeleteRequest, onOpenLinks, onPayLaterToggle }) {
    const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };
    const email = records?.[0]?.email || "";
    
    return (
        <div className="modal-backdrop" onClick={handleBackdrop}>
            <div className="modal-box" style={{ maxWidth: 1100 }}>
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">All Records — {email}</h2>
                        <p className="modal-subtitle">{records.length} record{records.length !== 1 ? "s" : ""} for this email</p>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #e5e7eb", background: colors.bg }}>
                                <th style={{ padding: "10px 12px", textAlign: "left", color: colors.textMuted, fontWeight: 600 }}>#</th>
                                <th style={{ padding: "10px 12px", textAlign: "left", color: colors.textMuted, fontWeight: 600 }}>Date</th>
                                <th style={{ padding: "10px 12px", textAlign: "left", color: colors.textMuted, fontWeight: 600 }}>Company</th>
                                <th style={{ padding: "10px 12px", textAlign: "left", color: colors.textMuted, fontWeight: 600 }}>Contact Person</th>
                                <th style={{ padding: "10px 12px", textAlign: "left", color: colors.textMuted, fontWeight: 600 }}>Mobile</th>
                                <th style={{ padding: "10px 12px", textAlign: "center", color: colors.textMuted, fontWeight: 600 }}>Links</th>
                                <th style={{ padding: "10px 12px", textAlign: "center", color: colors.textMuted, fontWeight: 600 }}>Enrolments</th>
                                <th style={{ padding: "10px 12px", textAlign: "center", color: colors.textMuted, fontWeight: 600 }}>Status</th>
                                <th style={{ padding: "10px 12px", textAlign: "center", color: colors.textMuted, fontWeight: 600 }}>Pay Later</th>
                                <th style={{ padding: "10px 12px", textAlign: "left", color: colors.textMuted, fontWeight: 600 }}>Last Login</th>
                                <th style={{ padding: "10px 12px", textAlign: "center", color: colors.textMuted, fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((r, i) => (
                                <tr key={r._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                    <td style={{ padding: "10px 12px", color: "#9ca3af" }}>{i + 1}</td>
                                    <td style={{ padding: "10px 12px", color: "#555", whiteSpace: "nowrap" }}>
                                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }) : "—"}
                                    </td>
                                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "#1a1a2e" }}>
                                        {r.companyName || r.name || "—"}
                                    </td>
                                    <td style={{ padding: "10px 12px", color: "#555" }}>{r.contactPerson || "—"}</td>
                                    <td style={{ padding: "10px 12px", color: "#555" }}>{r.mobileNumber || "—"}</td>
                                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                                            <span style={{ fontWeight: 700, color: r.linkCount > 0 ? colors.brandPrimary : "#9ca3af" }}>
                                                {r.linkCount ?? 0}
                                            </span>
                                            {r.linkCount > 0 && (
                                                <button
                                                    style={{ border: "none", background: "none", cursor: "pointer", color: colors.brandPrimary, display: "flex", alignItems: "center", padding: 2 }}
                                                    title="View links"
                                                    onClick={() => onOpenLinks(r)}
                                                >
                                                    <LinkIcon />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                                        <span style={{ fontWeight: 700, color: r.enrollmentCount > 0 ? "#0d9488" : "#9ca3af" }}>
                                            {r.enrollmentCount ?? 0}
                                        </span>
                                    </td>
                                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                                        <span className={`badge ${r.status === "Active" ? "badge-active" : "badge-inactive"}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                                        <label
                                            className={`pay-later-switch ${r.payLater ? "is-on" : ""}`}
                                            title={r.payLater ? "Pay Later enabled — click to disable" : "Pay Later disabled — click to enable"}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={!!r.payLater}
                                                onChange={() => onPayLaterToggle(r._id)}
                                            />
                                            <span className="pay-later-slider" />
                                            <span className="pay-later-label">{r.payLater ? "On" : "Off"}</span>
                                        </label>
                                    </td>
                                    <td style={{ padding: "10px 12px", color: "#555", whiteSpace: "nowrap" }}>{r.lastLogin || "Never"}</td>
                                    <td style={{ padding: "10px 12px" }}>
                                        <div className="actions-cell">
                                            {/* <button className="btn-icon btn-icon-view" title="View" onClick={() => onView(r)}>
                                                <EyeIcon />
                                            </button> */}
                                            <button className="btn-icon btn-icon-edit" title="Edit" onClick={() => onEdit(r)}>
                                                <EditIcon />
                                            </button>
                                            <button className="btn-deactivate" onClick={() => onToggle(r._id)}>
                                                {r.status === "Active" ? "Deactivate" : "Activate"}
                                            </button>
                                            <button className="btn-icon btn-icon-delete" title="Delete" onClick={() => onDeleteRequest(r)}>
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/* ── Main Component ── */
export default function Companies() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [page, setPage] = useState(1);
    const [companies, setCompanies] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editCompany, setEditCompany] = useState(null);
    const [viewCompany, setViewCompany] = useState(null); // records array for View All Details modal
    const [linksModalCompany, setLinksModalCompany] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [groupedRecordsFor, setGroupedRecordsFor] = useState(null); // holds the group (array of companies) to show in popup

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return; // ⛔ important

                const res = await axios.get(`${API_URL}/api/companies`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setCompanies(res.data.data || []);
            } catch (err) {
                console.error("Fetch error:", err);
                setCompanies([]); // fallback
            }
        };

        fetchCompanies();
    }, []);

    const filtered = companies.filter((c) => {
        const name  = c.companyName || c.name || "";
        const email = c.email || "";
        const matchSearch =
            search === "" ||
            name.toLowerCase().includes(search.toLowerCase()) ||
            email.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "All Status" || c.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // ── Group filtered companies by email (frontend only) ──
    const groupedByEmail = React.useMemo(() => {
        const map = new Map();
        filtered.forEach((c) => {
            const key = (c.email || "").trim().toLowerCase() || `__no-email-${c._id}`;
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(c);
        });
        // Each group: use the most recently created record as the "primary" row shown in the table
        return Array.from(map.values()).map((records) => {
            const sorted = [...records].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            return { primary: sorted[0], records: sorted };
        });
    }, [filtered]);

    const totalPages = Math.ceil(groupedByEmail.length / PAGE_SIZE);
    const paginatedGroups = groupedByEmail.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleToggle = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.patch(
                `${API_URL}/api/companies/${id}/toggle-status`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCompanies((prev) =>
                prev.map((c) => c._id === id ? { ...c, status: res.data.data.status } : c)
            );
        } catch (err) {
            console.error(err);
        }
    };

    const handlePayLaterToggle = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.patch(
                `${API_URL}/api/companies/${id}/toggle-pay-later`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCompanies((prev) =>
                prev.map((c) => c._id === id ? { ...c, payLater: res.data.data.payLater } : c)
            );
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Failed to update Pay Later");
        }
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/api/companies/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setCompanies((prev) => prev.filter((c) => c._id !== id));
    };

    const handleAddCompany = (company) => {
        setCompanies((prev) => [company, ...prev]);
    };

    return (
        <div className="companies-wrapper">

            {/* ── Add / Edit Modal ── */}
            {showModal && (
                <AddCompanyModal
                    onClose={() => { setShowModal(false); setEditCompany(null); }}
                    onAdd={handleAddCompany}
                    editData={editCompany}
                    onUpdate={(updated) => {
                        setCompanies(prev => prev.map(c => c._id === updated._id ? updated : c));
                    }}
                />
            )}

            {/* ── View All Details Modal ── */}
            {viewCompany && (
                <ViewAllDetailsModal
                    records={companies.filter((c) => viewCompany.some((v) => v._id === c._id))}
                    onClose={() => setViewCompany(null)}
                    onPayLaterToggle={handlePayLaterToggle}
                />
            )}

            {/* ── Links Modal ── */}
            {linksModalCompany && (
                <LinksModal
                    company={linksModalCompany}
                    onClose={() => setLinksModalCompany(null)}
                />
            )}

            {/* ── Delete Confirm Modal ── */}
            {deleteTarget && (
                <DeleteCompanyModal
                    company={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                />
            )}

            {/* ── Grouped Records Modal (email view-all) ── */}
            {groupedRecordsFor && (
                <GroupedRecordsModal
                    records={companies.filter((c) => groupedRecordsFor.some((g) => g._id === c._id))}
                    onClose={() => setGroupedRecordsFor(null)}
                    onView={() => { setGroupedRecordsFor(null); setViewCompany(groupedRecordsFor); }}
                    onEdit={(r) => { setGroupedRecordsFor(null); setEditCompany(r); setShowModal(true); }}
                    onToggle={handleToggle}
                    onDeleteRequest={(r) => { setGroupedRecordsFor(null); setDeleteTarget(r); }}
                    onOpenLinks={(r) => { setGroupedRecordsFor(null); setLinksModalCompany(r); }}
                    onPayLaterToggle={handlePayLaterToggle}
                />
            )}

            {/* Header */}
            <div className="companies-header">
                <div>
                    <h1 className="companies-title">Companies</h1>
                    <p className="companies-subtitle">Manage company accounts</p>
                </div>
                <button className="btn-add-company" onClick={() => { setEditCompany(null); setShowModal(true); }}>
                    <PlusIcon /> Add Company
                </button>
            </div>

            {/* Search & Filter */}
            <div className="search-card">
                <h3 className="search-card-title">Search & Filter</h3>
                <p className="search-card-subtitle">Find companies by name or email</p>
                <div className="search-row">
                    <div className="search-input-wrap">
                        <span className="search-input-icon"><SearchIcon /></span>
                        <input
                            className="search-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && setPage(1)}
                            placeholder="Search companies..."
                        />
                    </div>
                    <select
                        className="status-select"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                    <button className="btn-search" onClick={() => setPage(1)}>
                        <SearchIcon /> Search
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-card">
                <div className="table-card-header">
                    <h3 className="table-card-title">Company Accounts ({groupedByEmail.length})</h3>
                    <p className="table-card-subtitle">Manage company registrations</p>
                </div>

                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Company</th>
                                <th>Contact Person</th> 
                                <th>Email</th>
                                <th>Company mobile number</th>
                                <th>Links</th>
                                <th>Enrolments</th>
                                <th>Status</th>
                                <th>Pay Later</th>
                                <th>Last Login</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedGroups.map(({ primary: company, records }) => (
                                <tr key={company._id}>
                                    <td>
                                        <div className="cell-date-main">
                                            {new Date(company.createdAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" })}
                                        </div>
                                        <div className="cell-date-time">
                                            {new Date(company.createdAt).toLocaleTimeString("en-AU", {
                                                hour: "2-digit", minute: "2-digit", hour12: true,
                                                timeZone: "Australia/Sydney"
                                            })}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="company-cell">
                                            <div className="company-icon"><BuildingIcon /></div>
                                            <span className="company-name">{company.companyName || company.name}</span>
                                        </div>
                                    </td>
                                    <td>{company.contactPerson ? company.contactPerson : <span className="dash">—</span>}</td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <span>{company.email}</span>
                                            {/* <button
                                                style={{
                                                    border: "none",
                                                    background: records.length > 1 ? colors.brandPrimary : "#f3f4f6",
                                                    color: records.length > 1 ? "white" : "#6b7280",
                                                    borderRadius: 10,
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    padding: "2px 8px",
                                                    cursor: "pointer",
                                                    whiteSpace: "nowrap",
                                                }}
                                                title="View all details"
                                                onClick={() => setGroupedRecordsFor(records)}
                                            >
                                                {records.length > 1 ? `View All (${records.length})` : "View All"}
                                            </button> */}
                                        </div>
                                    </td>
                                    <td>{company.mobileNumber ? company.mobileNumber : <span className="dash">—</span>}</td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <span style={{ fontWeight: 700, color: company.linkCount > 0 ? colors.brandPrimary : "#9ca3af" }}>
                                                {company.linkCount ?? 0}
                                            </span>
                                            {company.linkCount > 0 && (
                                                <button
                                                    style={{ border: "none", background: "none", cursor: "pointer", color: colors.brandPrimary, display: "flex", alignItems: "center", padding: 2 }}
                                                    title="View links"
                                                    onClick={() => setLinksModalCompany(company)}
                                                >
                                                    <LinkIcon />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: company.enrollmentCount > 0 ? "#0d9488" : "#9ca3af" }}>
                                            {company.enrollmentCount ?? 0}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${company.status === "Active" ? "badge-active" : "badge-inactive"}`}>
                                            {company.status}
                                        </span>
                                    </td>
                                    <td>
                                        <label
                                            className={`pay-later-switch ${company.payLater ? "is-on" : ""}`}
                                            title={company.payLater ? "Pay Later enabled — click to disable" : "Pay Later disabled — click to enable"}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={!!company.payLater}
                                                onChange={() => handlePayLaterToggle(company._id)}
                                            />
                                            <span className="pay-later-slider" />
                                            <span className="pay-later-label">{company.payLater ? "On" : "Off"}</span>
                                        </label>
                                    </td>
                                    <td><span className="last-login">{company.lastLogin || "Never"}</span></td>
                                    <td>
                                        <div className="actions-cell">
                                            {/* ← Eye icon opens CompanyViewModal */}
                                            <button
                                                className="btn-icon btn-icon-view"
                                                title="View"
                                                onClick={() => setViewCompany(records)}
                                            >
                                                <EyeIcon />
                                            </button>
                                            <button
                                                className="btn-icon btn-icon-edit"
                                                title="Edit"
                                                onClick={() => { setEditCompany(company); setShowModal(true); }}
                                            >
                                                <EditIcon />
                                            </button>
                                            <button
                                                className="btn-deactivate"
                                                onClick={() => handleToggle(company._id)}
                                            >
                                                {company.status === "Active" ? "Deactivate" : "Activate"}
                                            </button>
                                            <button
                                                className="btn-icon btn-icon-delete"
                                                title="Delete"
                                                onClick={() => setDeleteTarget(company)}
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="pagination-row">
                    <span className="pagination-info">
                        Showing {Math.min((page - 1) * PAGE_SIZE + 1, groupedByEmail.length)} to{" "}
                        {Math.min(page * PAGE_SIZE, groupedByEmail.length)} of {groupedByEmail.length} results
                    </span>
                    <div className="pagination-controls">
                        <button className="btn-page" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                            Previous
                        </button>
                        <span className="page-label">Page {page} of {totalPages}</span>
                        <button className="btn-page" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
