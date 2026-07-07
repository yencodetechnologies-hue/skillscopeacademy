// EnrollmentLinks.jsx
import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import "../styles/EnrollmentLinks.css";
import { API_URL } from "../data/service";
import { authHeaders } from "../utils/authHeaders";



// ── Helpers ───────────────────────────────────────────────────────────────────
const enrollUrl = (id) =>
  `${window.location.origin}/enroll/${id}`;

const formatDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }) + " " + d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
};

// ── Real QR Code (canvas → img) ───────────────────────────────────────────────
function QRImage({ value, size = 168 }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(value, { width: size, margin: 2, color: { dark: "#000", light: "#fff" } })
      .then(setSrc)
      .catch(console.error);
  }, [value, size]);
  return src ? (
    <img src={src} alt="QR Code" width={size} height={size} style={{ display: "block" }} />
  ) : (
    <div style={{ width: size, height: size, background: "#f0f0f0", borderRadius: 8 }} />
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message }) {
  return (
    <div className="el-toast">
      <span className="check">✓</span>
      {message}
    </div>
  );
}

function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "", description: "", payLater: true, agent: true,
    course: "", maxUses: "", expires: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);  // ✅ Add this

  // ✅ Add this - API-லிருந்து courses fetch பண்ணு
  useEffect(() => {
    fetch(`${API_URL}/api/courses`)
      .then((r) => r.json())
      .then((d) => {
        // உன் API response structure-க்கு ஏத்தமாரி adjust பண்ணு
        const list = Array.isArray(d) ? d : d.data || []
        setCourses(list)
      })
      .catch(console.error)
  }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.name.trim()) { setError("Link name is required"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/enrollment-links`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          course: form.course || "Any course",
          maxUses: form.maxUses || null,
          expires: form.expires || null,
          payLater: form.payLater,
          agent: form.agent,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onCreate(data.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="el-overlay" onClick={onClose}>
      <div className="el-modal" onClick={(e) => e.stopPropagation()}>
        <div className="el-modal-head">
          <div>
            <h3>Create Enrollment Link</h3>
            <p>Generate a new enrollment link with optional QR code</p>
          </div>
          <button className="el-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="el-modal-body">
          {error && <div className="el-error">{error}</div>}
          <div className="el-field">
            <label>Link Name <span className="req">*</span></label>
            <input className="el-input" placeholder="e.g., January 2025 Batch"
              value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="el-field">
            <label>Description</label>
            <textarea className="el-textarea" placeholder="Optional description..."
              value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="el-toggles">
            <label className="el-toggle-item">
              <input type="checkbox" checked={form.payLater}
                onChange={(e) => set("payLater", e.target.checked)} />
              🕐 Pay Later
            </label>
            <label className="el-toggle-item">
              <input type="checkbox" checked={form.agent}
                onChange={(e) => set("agent", e.target.checked)} />
              👤 Agent
            </label>
          </div>
          <p className="el-toggle-hint">
            Pay Later: complete enrollment without payment (name, email, mobile, LLN, enrollment form).
            Agent: course list shows course names only—no prices in the dropdown.
          </p>
          <div className="el-field">
            <label>Pre-select Course (Optional)</label>
            {/* ✅ dummy data போய் API data வந்துச்சு */}
            <select className="el-select" value={form.course}
              onChange={(e) => set("course", e.target.value)}>
              <option value="">Any course</option>
              {courses.map((c) => (
                <option key={c._id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="el-row-2">
            <div className="el-field">
              <label>Max Uses</label>
              <input className="el-input" placeholder="Unlimited" type="number"
                value={form.maxUses} onChange={(e) => set("maxUses", e.target.value)} />
            </div>
            <div className="el-field">
              <label>Expires At</label>
              <input className="el-input" type="date" value={form.expires}
                onChange={(e) => set("expires", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="el-modal-footer">
          <button className="el-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="el-btn-primary" onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "+ Create Link"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ link, onClose }) {
  const url = enrollUrl(link._id);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadQR = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(url, { width: 512, margin: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `qr-${link._id}.png`;
      a.click();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="el-overlay" onClick={onClose}>
      <div className="el-modal" onClick={(e) => e.stopPropagation()}>
        <div className="el-modal-head">
          <div>
            <h3>{link.name}</h3>
            <p>Enrollment link details and QR code</p>
          </div>
          <button className="el-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="el-modal-body">
          <div className="el-qr-wrap">
            <div className="el-qr-box" ref={qrRef}>
              <QRImage value={url} size={168} />
            </div>
          </div>
          <div className="el-url-block">
            <div className="el-url-label">Enrollment URL</div>
            <div className="el-url-row">
              <div className="el-url-text">{url}</div>
              <button className="el-icon-btn" title="Copy" onClick={handleCopy}>
                {copied ? "✓" : "⧉"}
              </button>
              <button className="el-icon-btn" title="Open" onClick={() => window.open(url, "_blank")}>↗</button>
            </div>
            <div className="el-url-created">Created at: {formatDate(link.createdAt)}</div>
          </div>
          <div className="el-info-grid">
            <div className="el-info-item">
              <label>Unique Code:</label>
              <span style={{ fontFamily: "monospace" }}>{link._id}</span>
            </div>
            <div className="el-info-item">
              <label>Status:</label>
              <span><span className={`el-badge ${link.status === "Active" ? "active" : "inactive"}`}>{link.status}</span></span>
            </div>
            <div className="el-info-item">
              <label>Usage:</label>
              <span>{link.usage}{link.maxUses ? `/${link.maxUses}` : " (unlimited)"}</span>
            </div>
            <div className="el-info-item">
              <label>Expires:</label>
              <span>{link.expires || "N/A"}</span>
            </div>
          </div>
          {link.description && (
            <div className="el-field" style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Description:</label>
              <p style={{ fontSize: 13.5, color: "var(--gray-700)", marginTop: 4, lineHeight: 1.5 }}>{link.description}</p>
            </div>
          )}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {link.payLater && <span className="el-badge pay-later">Pay Later</span>}
            {link.agent    && <span className="el-badge agent">Agent</span>}
          </div>
          <div className="el-enrolled-head">👥 Enrolled Students ({link.students.length})</div>
          {link.students.length === 0 ? (
            <div className="el-empty-students">
              <div className="el-empty-icon">👥</div>
              No one has enrolled via this link yet
            </div>
          ) : (
            <table className="el-table">
              <thead><tr><th>Name</th><th>Email</th><th>Booking ID</th><th>Date</th></tr></thead>
              <tbody>
                {link.students.map((s, i) => (
                  <tr key={i}>
                    <td>{s.name}</td>
                    <td style={{ color: "var(--gray-500)" }}>{s.email}</td>
                    <td style={{ color: "#29b6e8", fontWeight: 600 }}>{s.bookingId ? s.bookingId.slice(-8).toUpperCase() : "—"}</td>
                    <td style={{ color: "var(--gray-500)" }}>{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="el-modal-footer">
          <button className="el-btn-cancel" onClick={onClose}>Close</button>
          <button className="el-btn-dark" onClick={handleDownloadQR}>⬇ Download QR</button>
        </div>
      </div>
    </div>
  );
}

// ── Students Modal ────────────────────────────────────────────────────────────
function StudentsModal({ link, onClose }) {
  return (
    <div className="el-overlay" onClick={onClose}>
      <div className="el-modal el-students-modal" onClick={(e) => e.stopPropagation()}>
        <div className="el-modal-head">
          <div>
            <h3>👥 Students – {link.name}</h3>
            <p>{link.students.length} student(s) registered via this link</p>
          </div>
          <button className="el-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="el-modal-body">
          {link.students.length === 0 ? (
            <div className="el-empty-students">
              <div className="el-empty-icon">👥</div>
              No students have joined via this link yet.
            </div>
          ) : (
            <table className="el-table">
              <thead><tr><th>Name</th><th>Email</th><th>Booking ID</th><th>Enrolled</th></tr></thead>
              <tbody>
                {link.students.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: "var(--gray-500)" }}>{s.email}</td>
                    <td style={{ color: "#29b6e8", fontWeight: 600 }}>{s.bookingId ? s.bookingId.slice(-8).toUpperCase() : "—"}</td>
                    <td style={{ color: "var(--gray-500)" }}>{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="el-modal-footer">
          <button className="el-btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ link, onClose, onSave }) {
  const [expires, setExpires]  = useState(link.expires || "");
  const [maxUses, setMaxUses]  = useState(link.maxUses ? String(link.maxUses) : "");
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState("");

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/enrollment-links/${link._id}`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ expires: expires || null, maxUses: maxUses || null }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onSave(data.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="el-overlay" onClick={onClose}>
      <div className="el-modal" onClick={(e) => e.stopPropagation()}>
        <div className="el-modal-head">
          <div>
            <h3><span className="el-edit-icon">✏️</span> Edit Link: {link.name}</h3>
            <p>Update the expiry date or max uses. A new unique URL and QR code will be generated.</p>
          </div>
          <button className="el-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="el-modal-body">
          {error && <div className="el-error">{error}</div>}
          <div className="el-field">
            <label>Expiry Date</label>
            <input className="el-input" type="date" value={expires}
              onChange={(e) => setExpires(e.target.value)} />
            <p style={{ fontSize: 11.5, color: "var(--gray-400)", marginTop: 4 }}>Leave blank for no expiry.</p>
          </div>
          <div className="el-field">
            <label>Max Uses</label>
            <input className="el-input" type="number" placeholder="Unlimited"
              value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
          </div>
        </div>
        <div className="el-modal-footer">
          <button className="el-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="el-btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "✏️ Save & Regenerate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({ link, onClose, onDelete }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/enrollment-links/${link._id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onDelete(link._id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="el-overlay" onClick={onClose}>
      <div className="el-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="el-modal-head">
          <h3>Delete Enrollment Link</h3>
          <button className="el-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="el-modal-body">
          <p style={{ fontSize: 13.5, color: "var(--gray-600)", lineHeight: 1.6 }}>
            Are you sure you want to delete <strong>{link.name}</strong>? This action cannot be undone.
          </p>
        </div>
        <div className="el-modal-footer">
          <button className="el-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="el-btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "🗑 Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function EnrollmentLinks() {
  const [links,   setLinks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [toast,   setToast]   = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const openModal  = (type, link = null) => setModal({ type, link });
  const closeModal = () => setModal(null);

  // ── Fetch all ──
  useEffect(() => {
    fetch(`${API_URL}/api/enrollment-links`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setLinks(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Handlers ──
  const handleCreate = (newLink) => {
    setLinks((prev) => [newLink, ...prev]);
    showToast("Enrollment link created successfully");
  };

  const handleDelete = (id) => {
    setLinks((prev) => prev.filter((l) => l._id !== id));
    showToast("Enrollment link deleted");
  };

  const handleToggleStatus = async (id) => {
    try {
      const res  = await fetch(`${API_URL}/api/enrollment-links/${id}/toggle-status`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setLinks((prev) => prev.map((l) => (l._id === id ? data.data : l)));
      showToast("Link status updated");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (updatedLink) => {
    setLinks((prev) => prev.map((l) => (l._id === updatedLink._id ? updatedLink : l)));
    showToast("Link updated successfully");
  };

  const handleCopyUrl = (id) => {
    navigator.clipboard.writeText(enrollUrl(id)).catch(() => {});
    showToast("URL copied to clipboard");
  };

  // ── Stats ──
  const totalLinks  = links.length;
  const activeLinks = links.filter((l) => l.status === "Active").length;
  const totalUsage  = links.reduce((sum, l) => sum + l.usage, 0);

  const usageDisplay = (link) =>
    link.maxUses ? `${link.usage} / ${link.maxUses}` : String(link.usage);

  if (loading) {
    return (
      <div className="el-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <p style={{ color: "var(--gray-400)" }}>Loading enrollment links…</p>
      </div>
    );
  }

  return (
    <div className="el-page">
      {/* Header */}
      <div className="el-header">
        <div className="el-header-text">
          <h1>Enrollment Links</h1>
          <p>Generate and manage enrollment links with QR codes for bulk student enrollment.</p>
        </div>
        <button className="el-btn-primary" onClick={() => openModal("create")}>
          + Create New Link
        </button>
      </div>

      {/* Stats */}
      <div className="el-stats">
        <div className="el-stat-card">
          <div>
            <div className="label">Total Links</div>
            <div className="value">{totalLinks}</div>
          </div>
          <div className="el-stat-icon blue">🔗</div>
        </div>
        <div className="el-stat-card">
          <div>
            <div className="label">Active Links</div>
            <div className="value" style={{ color: "var(--green)" }}>{activeLinks}</div>
          </div>
          <div className="el-stat-icon green">✅</div>
        </div>
        <div className="el-stat-card">
          <div>
            <div className="label">Total Usage</div>
            <div className="value">{totalUsage}</div>
          </div>
          <div className="el-stat-icon blue">👥</div>
        </div>
      </div>

      {/* Table */}
      <div className="el-table-card">
        <div className="el-table-header">
          <h2>Enrollment Links ({totalLinks})</h2>
          <p>Manage your enrollment links and QR codes.</p>
        </div>
        {links.length === 0 ? (
          <div className="el-empty-students" style={{ padding: "40px 0" }}>
            <div className="el-empty-icon">🔗</div>
            No enrollment links yet. Create one to get started.
          </div>
        ) : (
          <table className="el-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Course</th>
                <th>Usage</th>
                <th>Expires</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link._id}>
                  <td>
                    <div className="el-link-name">{link.name}</div>
                    <div className="el-link-code">{link._id}</div>
                  </td>
                  <td><span className="el-course-text">{link.course}</span></td>
                  <td>{usageDisplay(link)}</td>
                  <td>{link.expires || "N/A"}</td>
                  <td>
                    <span className={`el-badge ${link.status === "Active" ? "active" : "inactive"}`}>
                      {link.status}
                    </span>
                    {link.payLater && <span className="el-badge pay-later">Pay Later</span>}
                    {link.agent    && <span className="el-badge agent">Agent</span>}
                  </td>
                  <td>
                    <div className="el-actions">
                      <button className="el-icon-btn" title="View"      onClick={() => openModal("view",     link)}>👁</button>
                      <button className="el-icon-btn purple-icon" title="Students" onClick={() => openModal("students", link)}>👥</button>
                      <button className="el-icon-btn" title="Copy URL"  onClick={() => handleCopyUrl(link._id)}>⧉</button>
                      <button className="el-icon-btn" title="Download QR" onClick={async () => {
                        const url = enrollUrl(link._id);
                        const dataUrl = await QRCode.toDataURL(url, { width: 512, margin: 2 });
                        const a = document.createElement("a");
                        a.href = dataUrl; a.download = `qr-${link._id}.png`; a.click();
                      }}>⬇</button>
                      <button className="el-icon-btn" title="Edit"      onClick={() => openModal("edit",     link)}>✏️</button>
                      <button
                        className={`el-icon-btn ${link.status === "Active" ? "red" : "purple-icon"}`}
                        title={link.status === "Active" ? "Deactivate" : "Activate"}
                        onClick={() => handleToggleStatus(link._id)}
                      >
                        {link.status === "Active" ? "⊗" : "✓"}
                      </button>
                      <button className="el-icon-btn red" title="Delete" onClick={() => openModal("delete", link)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {modal?.type === "create"   && <CreateModal  onClose={closeModal} onCreate={handleCreate} />}
      {modal?.type === "view"     && <ViewModal     link={modal.link} onClose={closeModal} />}
      {modal?.type === "students" && <StudentsModal link={modal.link} onClose={closeModal} />}
      {modal?.type === "edit"     && <EditModal     link={modal.link} onClose={closeModal} onSave={handleEdit} />}
      {modal?.type === "delete"   && <DeleteModal   link={modal.link} onClose={closeModal} onDelete={handleDelete} />}

      {/* Toast */}
      {toast && <Toast message={toast} />}
    </div>
  );
}