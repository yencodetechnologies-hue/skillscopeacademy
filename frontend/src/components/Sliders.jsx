import { useEffect, useState } from "react"
import axios from "axios"
import { API_URL } from "../data/service"
import "../styles/Sliders.css"
import { cdnImage } from "../utils/cdnImage"

const blankForm = {
    title: "",
    link: "",
    mode: "file", // "file" | "url"
    file: null,
    imageUrl: "",
}

function Sliders() {
    const [sliders, setSliders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null) // slider being edited or null
    const [form, setForm] = useState(blankForm)
    const [submitting, setSubmitting] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState(null)

    const load = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${API_URL}/api/sliders`)
            setSliders(res.data?.data || [])
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load sliders.")
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

    const openEdit = (s) => {
        setEditing(s)
        setForm({
            title:    s.title || "",
            link:     s.link  || "",
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
            // Validation: must have an image source (unless editing and keeping the existing one).
            if (!editing) {
                if (form.mode === "file" && !form.file) { alert("Please choose an image file."); return }
                if (form.mode === "url"  && !form.imageUrl.trim()) { alert("Please enter an image URL."); return }
            } else {
                if (form.mode === "file" && !form.file) { alert("Please choose an image file."); return }
                if (form.mode === "url"  && !form.imageUrl.trim()) { alert("Please enter an image URL."); return }
            }

            const fd = new FormData()
            fd.append("title", form.title.trim())
            fd.append("link",  form.link.trim())
            if (form.mode === "file" && form.file) {
                fd.append("image", form.file)
            } else if (form.mode === "url" && form.imageUrl.trim()) {
                fd.append("imageUrl", form.imageUrl.trim())
            }
            // For "keep" we send nothing — backend preserves existing image.

            setSubmitting(true)
            if (editing) {
                await axios.put(`${API_URL}/api/sliders/${editing._id}`, fd)
            } else {
                await axios.post(`${API_URL}/api/sliders`, fd)
            }
            closeModal()
            load()
        } catch (err) {
            alert(err.response?.data?.message || "Save failed.")
        } finally {
            setSubmitting(false)
        }
    }

    const toggleActive = async (s) => {
        try {
            await axios.patch(`${API_URL}/api/sliders/${s._id}/toggle-active`)
            setSliders(prev => prev.map(x => x._id === s._id ? { ...x, active: !x.active } : x))
        } catch (err) {
            alert("Toggle failed.")
        }
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return
        try {
            await axios.delete(`${API_URL}/api/sliders/${deleteTarget._id}`)
            setSliders(prev => prev.filter(x => x._id !== deleteTarget._id))
        } catch (err) {
            alert("Delete failed.")
        } finally {
            setDeleteTarget(null)
        }
    }

    const previewSrc = form.mode === "file" && form.file
        ? URL.createObjectURL(form.file)
        : form.mode === "url" && form.imageUrl
            ? form.imageUrl
            : (form.mode === "keep" && editing ? editing.imageUrl : "")

    return (
        <div className="sl-page">
            <div className="sl-header">
                <div>
                    <h1 className="sl-title">Sliders</h1>
                    <p className="sl-sub">
                        Manage hero slider images shown on desktop and mobile home pages.
                    </p>
                </div>
                <button className="sl-add-btn" onClick={openAdd}>+ Add Slider</button>
            </div>

            {error && <div className="sl-error">{error}</div>}

            {loading ? (
                <div className="sl-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="sl-card sl-card-skeleton" />
                    ))}
                </div>
            ) : sliders.length === 0 ? (
                <div className="sl-empty">
                    No sliders yet. Click <strong>+ Add Slider</strong> to upload your first one.
                </div>
            ) : (
                <div className="sl-grid">
                    {sliders.map(s => (
                        <div key={s._id} className={`sl-card ${!s.active ? "sl-card--inactive" : ""}`}>
                            <div className="sl-thumb-wrap">
                                <img
                                    src={cdnImage(s.imageUrl, { w: 200 })}
                                    alt={s.title || "slider"}
                                    className="sl-thumb"
                                    loading="lazy"
                                    decoding="async"
                                    width="200"
                                    height="120"
                                />
                                {!s.active && <span className="sl-inactive-pill">Hidden</span>}
                            </div>
                            <div className="sl-card-body">
                                <div className="sl-card-title">{s.title || <em style={{ color: "#94a3b8" }}>Untitled</em>}</div>
                                {s.link && <div className="sl-card-link" title={s.link}>{s.link}</div>}
                                <div className="sl-card-actions">
                                    <button className="sl-btn sl-btn--ghost" onClick={() => toggleActive(s)}>
                                        {s.active ? "Hide" : "Show"}
                                    </button>
                                    <button className="sl-btn" onClick={() => openEdit(s)}>Edit</button>
                                    <button className="sl-btn sl-btn--danger" onClick={() => setDeleteTarget(s)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── ADD / EDIT MODAL ── */}
            {showModal && (
                <>
                    <div className="sl-backdrop" onClick={closeModal} />
                    <div className="sl-modal" role="dialog" aria-modal="true">
                        <div className="sl-modal-header">
                            <h3>{editing ? "Edit Slider" : "Add Slider"}</h3>
                            <button className="sl-modal-close" onClick={closeModal}>✕</button>
                        </div>

                        <div className="sl-modal-body">
                            <label className="sl-label">Title (optional)</label>
                            <input
                                className="sl-input"
                                value={form.title}
                                onChange={(e) => setField("title", e.target.value)}
                                placeholder="e.g., Summer enrolment campaign"
                            />

                            <label className="sl-label">Link URL (optional)</label>
                            <input
                                className="sl-input"
                                value={form.link}
                                onChange={(e) => setField("link", e.target.value)}
                                placeholder="https://example.com/landing"
                            />

                            <label className="sl-label">Image *</label>
                            <div className="sl-img-toggle">
                                {editing && (
                                    <button
                                        type="button"
                                        className={`sl-img-toggle-btn ${form.mode === "keep" ? "is-active" : ""}`}
                                        onClick={() => setForm(p => ({ ...p, mode: "keep", file: null, imageUrl: "" }))}
                                    >Keep current</button>
                                )}
                                <button
                                    type="button"
                                    className={`sl-img-toggle-btn ${form.mode === "file" ? "is-active" : ""}`}
                                    onClick={() => setForm(p => ({ ...p, mode: "file", imageUrl: "" }))}
                                >Upload</button>
                                <button
                                    type="button"
                                    className={`sl-img-toggle-btn ${form.mode === "url" ? "is-active" : ""}`}
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
                                    className="sl-input"
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={form.imageUrl}
                                    onChange={(e) => setField("imageUrl", e.target.value)}
                                />
                            )}

                            {previewSrc && (
                                <div className="sl-preview-wrap">
                                    <img src={previewSrc} alt="preview" className="sl-preview" />
                                </div>
                            )}
                        </div>

                        <div className="sl-modal-footer">
                            <button className="sl-btn sl-btn--ghost" onClick={closeModal}>Cancel</button>
                            <button className="sl-btn sl-btn--primary" disabled={submitting} onClick={handleSubmit}>
                                {submitting ? "Saving..." : (editing ? "Save changes" : "Add slider")}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ── DELETE CONFIRM ── */}
            {deleteTarget && (
                <>
                    <div className="sl-backdrop" />
                    <div className="sl-confirm" role="alertdialog">
                        <h3>Delete slider?</h3>
                        <p>
                            This will permanently remove the image from public sliders.
                        </p>
                        <div className="sl-confirm-actions">
                            <button className="sl-btn sl-btn--ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
                            <button className="sl-btn sl-btn--danger" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Sliders
