import { useEffect, useState } from "react"
import axios from "axios"
import { API_URL } from "../data/service"
import "../styles/Partners.css"
import { cdnImage } from "../utils/cdnImage"

const blankForm = {
    name: "",
    link: "",
    mode: "file", // "file" | "url" | "keep" (edit only)
    file: null,
    imageUrl: "",
}

// Single source of truth for the upload-size guidance the admin sees in
// the Add/Edit modal. Mirrors the dimensions of `.mlp-brand-logo` on the
// public site (160 x 80, 16px padding) so what the admin uploads matches
// what the visitor sees.
const SIZE_HINT = (
    <div className="pt-size-hint">
        Recommended upload: <strong>600 × 300 px</strong> (2:1 ratio),
        PNG with transparent background, ideally under <strong>200 KB</strong>.
        <br />
        The site fits the logo with <em>contain</em> (no cropping), so other
        ratios will work too — they just won't fill the whole card. The public
        site applies a grayscale filter that turns full colour on hover.
    </div>
)

function Partners() {
    const [partners, setPartners] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null) // partner being edited or null
    const [form, setForm] = useState(blankForm)
    const [submitting, setSubmitting] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState(null)

    const load = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${API_URL}/api/partners`)
            setPartners(res.data?.data || [])
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load partners.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const openAdd = () => {
        setEditing(null)
        setForm(blankForm)
        setShowModal(true)
    }

    const openEdit = (p) => {
        setEditing(p)
        setForm({
            name:     p.name || "",
            link:     p.link || "",
            // On edit we default to "keep" so the admin can change just the
            // text fields without re-uploading the logo.
            mode:     "keep",
            file:     null,
            imageUrl: "",
        })
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditing(null)
        setForm(blankForm)
    }

    const setField = (k, v) => setForm(p => ({ ...p, [k]: v }))

    const handleSubmit = async () => {
        try {
            // For Add and for Edit-with-replacement we require an image
            // source. Edit + "keep" sends nothing and the backend reuses
            // the existing imageUrl.
            if (form.mode === "file" && !form.file) {
                alert("Please choose an image file.")
                return
            }
            if (form.mode === "url" && !form.imageUrl.trim()) {
                alert("Please enter an image URL.")
                return
            }

            const fd = new FormData()
            fd.append("name", form.name.trim())
            fd.append("link", form.link.trim())
            if (form.mode === "file" && form.file) {
                fd.append("image", form.file)
            } else if (form.mode === "url" && form.imageUrl.trim()) {
                fd.append("imageUrl", form.imageUrl.trim())
            }

            setSubmitting(true)
            if (editing) {
                await axios.put(`${API_URL}/api/partners/${editing._id}`, fd)
            } else {
                await axios.post(`${API_URL}/api/partners`, fd)
            }
            closeModal()
            load()
        } catch (err) {
            alert(err.response?.data?.message || "Save failed.")
        } finally {
            setSubmitting(false)
        }
    }

    const toggleActive = async (p) => {
        try {
            await axios.patch(`${API_URL}/api/partners/${p._id}/toggle-active`)
            // Optimistic local flip — the server returns the same state and
            // a refetch would just thrash the grid.
            setPartners(prev => prev.map(x => x._id === p._id ? { ...x, active: !x.active } : x))
        } catch {
            alert("Toggle failed.")
        }
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return
        try {
            await axios.delete(`${API_URL}/api/partners/${deleteTarget._id}`)
            setPartners(prev => prev.filter(x => x._id !== deleteTarget._id))
        } catch {
            alert("Delete failed.")
        } finally {
            setDeleteTarget(null)
        }
    }

    // Local preview while the modal is open. URL.createObjectURL leaks
    // memory if not revoked, but the size is small (one image at a time)
    // and the URL is GC'd when the modal closes, so we don't bother
    // wiring revoke into a useEffect cleanup here.
    const previewSrc = form.mode === "file" && form.file
        ? URL.createObjectURL(form.file)
        : form.mode === "url" && form.imageUrl
            ? form.imageUrl
            : (form.mode === "keep" && editing ? editing.imageUrl : "")

    return (
        <div className="pt-page">
            <div className="pt-header">
                <div>
                    <h1 className="pt-title">Trusted Clients / Partners</h1>
                    <p className="pt-sub">
                        Manage the company logos shown in the “Our Trusted Clients”
                        marquee on the home page (desktop &amp; mobile).
                    </p>
                </div>
                <button className="pt-add-btn" onClick={openAdd}>+ Add Partner</button>
            </div>

            {error && <div className="pt-error">{error}</div>}

            {loading ? (
                <div className="pt-grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="pt-card pt-card-skeleton" />
                    ))}
                </div>
            ) : partners.length === 0 ? (
                <div className="pt-empty">
                    No partners yet. Click <strong>+ Add Partner</strong> to upload your first logo.
                </div>
            ) : (
                <div className="pt-grid">
                    {partners.map(p => (
                        <div key={p._id} className={`pt-card ${!p.active ? "pt-card--inactive" : ""}`}>
                            <div className="pt-thumb-wrap">
                                <img
                                    src={cdnImage(p.imageUrl, { w: 400 })}
                                    alt={p.name || "partner"}
                                    className="pt-thumb"
                                    loading="lazy"
                                    decoding="async"
                                />
                                {!p.active && <span className="pt-inactive-pill">Hidden</span>}
                            </div>
                            <div className="pt-card-body">
                                <div className="pt-card-title">
                                    {p.name || <em style={{ color: "#94a3b8" }}>Untitled</em>}
                                </div>
                                {p.link && <div className="pt-card-link" title={p.link}>{p.link}</div>}
                                <div className="pt-card-actions">
                                    <button className="pt-btn pt-btn--ghost" onClick={() => toggleActive(p)}>
                                        {p.active ? "Hide" : "Show"}
                                    </button>
                                    <button className="pt-btn" onClick={() => openEdit(p)}>Edit</button>
                                    <button className="pt-btn pt-btn--danger" onClick={() => setDeleteTarget(p)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── ADD / EDIT MODAL ── */}
            {showModal && (
                <>
                    <div className="pt-backdrop" onClick={closeModal} />
                    <div className="pt-modal" role="dialog" aria-modal="true">
                        <div className="pt-modal-header">
                            <h3>{editing ? "Edit Partner" : "Add Partner"}</h3>
                            <button className="pt-modal-close" onClick={closeModal}>✕</button>
                        </div>

                        <div className="pt-modal-body">
                            <label className="pt-label">Company name</label>
                            <input
                                className="pt-input"
                                value={form.name}
                                onChange={(e) => setField("name", e.target.value)}
                                placeholder="e.g., Accenture"
                            />

                            <label className="pt-label">Link URL (optional)</label>
                            <input
                                className="pt-input"
                                value={form.link}
                                onChange={(e) => setField("link", e.target.value)}
                                placeholder="https://example.com"
                            />

                            <label className="pt-label">Logo *</label>
                            {SIZE_HINT}

                            <div className="pt-img-toggle">
                                {editing && (
                                    <button
                                        type="button"
                                        className={`pt-img-toggle-btn ${form.mode === "keep" ? "is-active" : ""}`}
                                        onClick={() => setForm(p => ({ ...p, mode: "keep", file: null, imageUrl: "" }))}
                                    >Keep current</button>
                                )}
                                <button
                                    type="button"
                                    className={`pt-img-toggle-btn ${form.mode === "file" ? "is-active" : ""}`}
                                    onClick={() => setForm(p => ({ ...p, mode: "file", imageUrl: "" }))}
                                >Upload</button>
                                <button
                                    type="button"
                                    className={`pt-img-toggle-btn ${form.mode === "url" ? "is-active" : ""}`}
                                    onClick={() => setForm(p => ({ ...p, mode: "url", file: null }))}
                                >URL</button>
                            </div>

                            {form.mode === "file" && (
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setField("file", e.target.files?.[0] || null)}
                                />
                            )}
                            {form.mode === "url" && (
                                <input
                                    className="pt-input"
                                    type="url"
                                    placeholder="https://example.com/logo.png"
                                    value={form.imageUrl}
                                    onChange={(e) => setField("imageUrl", e.target.value)}
                                />
                            )}

                            {previewSrc && (
                                <div className="pt-preview-wrap">
                                    <img src={previewSrc} alt="preview" className="pt-preview" />
                                </div>
                            )}
                        </div>

                        <div className="pt-modal-footer">
                            <button className="pt-btn pt-btn--ghost" onClick={closeModal}>Cancel</button>
                            <button className="pt-btn pt-btn--primary" disabled={submitting} onClick={handleSubmit}>
                                {submitting ? "Saving..." : (editing ? "Save changes" : "Add partner")}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ── DELETE CONFIRM ── */}
            {deleteTarget && (
                <>
                    <div className="pt-backdrop" />
                    <div className="pt-confirm" role="alertdialog">
                        <h3>Delete partner?</h3>
                        <p>This will permanently remove the logo from the public Trusted Clients strip.</p>
                        <div className="pt-confirm-actions">
                            <button className="pt-btn pt-btn--ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
                            <button className="pt-btn pt-btn--danger" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Partners
