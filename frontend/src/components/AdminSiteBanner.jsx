import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { API_URL } from "../data/service"
import { cdnImage } from "../utils/cdnImage"
import "../styles/SiteBannerAdmin.css"

const blankForm = {
  title: "",
  link: "",
  mode: "file",
  file: null,
  imageUrl: "",
}

function authHeaders() {
  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function apiErrorMessage(err, action = "save") {
  const status = err.response?.status
  const data = err.response?.data
  const msg =
    (typeof data === "object" && data?.message) ||
    (typeof data === "string" && data.includes("Cannot")
      ? data
      : null)

  if (status === 404) {
    return `Banner API not found on the server (404). Deploy the latest backend code, then try again.`
  }
  if (!err.response) {
    return `Cannot reach the API at ${API_URL}. Is the backend running?`
  }
  return msg || `Failed to ${action} banner (${status || "error"}).`
}

export default function AdminSiteBanner() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blankForm)
  const [submitting, setSubmitting] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)

  const sorted = useMemo(
    () => [...banners].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [banners]
  )

  const load = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await axios.get(`${API_URL}/api/site-banner`, {
        headers: authHeaders(),
      })
      setBanners(res.data?.data || [])
    } catch (err) {
      setError(apiErrorMessage(err, "load"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(blankForm)
    setSaveError("")
    setShowModal(true)
  }

  const openEdit = (b) => {
    setEditing(b)
    setForm({
      title: b.title || "",
      link: b.link || "",
      mode: "keep",
      file: null,
      imageUrl: "",
    })
    setSaveError("")
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setForm(blankForm)
  }

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!editing) {
      if (form.mode === "file" && !form.file) {
        alert("Please choose an image file.")
        return
      }
      if (form.mode === "url" && !form.imageUrl.trim()) {
        alert("Please enter an image URL.")
        return
      }
    } else if (form.mode === "file" && !form.file) {
      alert("Please choose an image file.")
      return
    } else if (form.mode === "url" && !form.imageUrl.trim()) {
      alert("Please enter an image URL.")
      return
    }

    try {
      setSubmitting(true)
      setSaveError("")
      const fd = new FormData()
      fd.append("title", form.title.trim())
      fd.append("link", form.link.trim())
      if (form.mode === "file" && form.file) {
        fd.append("image", form.file)
      } else if (form.mode === "url" && form.imageUrl.trim()) {
        fd.append("imageUrl", form.imageUrl.trim())
      }

      if (editing) {
        await axios.put(`${API_URL}/api/site-banner/${editing._id}`, fd, {
          headers: authHeaders(),
        })
      } else {
        await axios.post(`${API_URL}/api/site-banner`, fd, {
          headers: authHeaders(),
        })
      }
      closeModal()
      load()
    } catch (err) {
      setSaveError(apiErrorMessage(err, "save"))
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (b) => {
    try {
      await axios.patch(
        `${API_URL}/api/site-banner/${b._id}/toggle-active`,
        {},
        { headers: authHeaders() }
      )
      setBanners((prev) =>
        prev.map((x) =>
          x._id === b._id ? { ...x, active: !x.active } : x
        )
      )
    } catch {
      alert("Toggle failed.")
    }
  }

  const moveOrder = async (b, dir) => {
    const list = sorted
    const idx = list.findIndex((x) => x._id === b._id)
    const swap = dir === "up" ? idx - 1 : idx + 1
    if (swap < 0 || swap >= list.length) return

    const payload = list.map((item, i) => {
      if (i === idx) return { id: item._id, order: swap + 1 }
      if (i === swap) return { id: item._id, order: idx + 1 }
      return { id: item._id, order: i + 1 }
    })

    try {
      await axios.put(
        `${API_URL}/api/site-banner/reorder/all`,
        { banners: payload },
        { headers: authHeaders() }
      )
      load()
    } catch {
      alert("Reorder failed.")
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await axios.delete(`${API_URL}/api/site-banner/${deleteTarget._id}`, {
        headers: authHeaders(),
      })
      setDeleteTarget(null)
      load()
    } catch {
      alert("Delete failed.")
    }
  }

  const previewSrc =
    form.mode === "file" && form.file
      ? URL.createObjectURL(form.file)
      : form.mode === "url" && form.imageUrl
        ? form.imageUrl
        : form.mode === "keep" && editing
          ? cdnImage(editing.imageUrl, { w: 400 })
          : ""

  return (
    <div className="sba-page">
      <div className="sba-shell">
        <div className="sba-main">
          <div className="sba-main-head">
            <div>
              <h1 className="sba-title">Site Banners</h1>
              <p className="sba-sub">
                Home page popups show in order (1, 2, 3…). Visitors see the
                first active banner they have not closed yet.
              </p>
            </div>
          </div>

          {error && <div className="sba-error">{error}</div>}

          {loading ? (
            <div className="sba-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="sba-card sba-card--skeleton" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="sba-empty">
              No banners yet. Click <strong>Add Banner</strong> on the right to
              upload your first one.
            </div>
          ) : (
            <div className="sba-grid">
              {sorted.map((b, index) => (
                <article
                  key={b._id}
                  className={`sba-card ${!b.active ? "sba-card--off" : ""}`}
                >
                  <span className="sba-order">{index + 1}</span>
                  <div className="sba-thumb-wrap">
                    <img
                      src={cdnImage(b.imageUrl, { w: 320 })}
                      alt={b.title || "Banner"}
                      className="sba-thumb"
                      loading="lazy"
                    />
                    {!b.active && (
                      <span className="sba-off-pill">Hidden</span>
                    )}
                  </div>
                  <div className="sba-card-body">
                    <h3 className="sba-card-title">
                      {b.title?.trim() || (
                        <em className="sba-untitled">Untitled</em>
                      )}
                    </h3>
                    {b.link?.trim() && (
                      <p className="sba-card-link" title={b.link}>
                        {b.link}
                      </p>
                    )}
                    <div className="sba-card-actions">
                      <button
                        type="button"
                        className="sba-btn sba-btn--icon"
                        title="Move up"
                        disabled={index === 0}
                        onClick={() => moveOrder(b, "up")}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="sba-btn sba-btn--icon"
                        title="Move down"
                        disabled={index === sorted.length - 1}
                        onClick={() => moveOrder(b, "down")}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="sba-btn"
                        onClick={() => toggleActive(b)}
                      >
                        {b.active ? "Hide" : "Show"}
                      </button>
                      <button
                        type="button"
                        className="sba-btn"
                        onClick={() => openEdit(b)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="sba-btn sba-btn--danger"
                        onClick={() => setDeleteTarget(b)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="sba-aside">
          <button type="button"  className="sba-add-btn" onClick={openAdd}>
            + Add Banner
          </button>
          <p className="sba-aside-note">
            Banners appear on the public home page in the numbered order shown
            in the grid.
          </p>
          <div className="sba-aside-list">
            <h4>Display order</h4>
            {sorted.length === 0 ? (
              <p className="sba-aside-empty">None yet</p>
            ) : (
              <ol>
                {sorted.map((b, i) => (
                  <li key={b._id}>
                    <span className="sba-aside-num">{i + 1}</span>
                    <span>{b.title?.trim() || "Untitled"}</span>
                    {!b.active && (
                      <span className="sba-aside-hidden">off</span>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>

      {showModal && (
        <>
          <div className="sba-backdrop" onClick={closeModal} />
          <div className="sba-modal" role="dialog" aria-modal="true">
            <div className="sba-modal-head">
              <h3>{editing ? "Edit Banner" : "Add Banner"}</h3>
              <button
                type="button"
                className="sba-modal-close"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
            <div className="sba-modal-body">
              {saveError && (
                <div className="sba-modal-error">{saveError}</div>
              )}
              <label className="sba-label">Title</label>
              <input
                className="sba-input"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="e.g. Sunday classes now open"
              />

              <label className="sba-label">Link URL (optional)</label>
              <input
                className="sba-input"
                type="url"
                value={form.link}
                onChange={(e) => setField("link", e.target.value)}
                placeholder="https://safeticks.com.au/..."
              />

              <label className="sba-label">
                Image<span className="sba-req">*</span>
              </label>
              <div className="sba-img-toggle">
                {editing && (
                  <button
                    type="button"
                    className={`sba-img-btn ${
                      form.mode === "keep" ? "is-active" : ""
                    }`}
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        mode: "keep",
                        file: null,
                        imageUrl: "",
                      }))
                    }
                  >
                    Keep current
                  </button>
                )}
                <button
                  type="button"
                  className={`sba-img-btn ${
                    form.mode === "file" ? "is-active" : ""
                  }`}
                  onClick={() =>
                    setForm((p) => ({ ...p, mode: "file", imageUrl: "" }))
                  }
                >
                  Upload
                </button>
                <button
                  type="button"
                  className={`sba-img-btn ${
                    form.mode === "url" ? "is-active" : ""
                  }`}
                  onClick={() =>
                    setForm((p) => ({ ...p, mode: "url", file: null }))
                  }
                >
                  URL
                </button>
              </div>

              {form.mode === "file" && (
                <input
                  type="file"
                  accept="image/*"
                  className="sba-file"
                  onChange={(e) =>
                    setField("file", e.target.files?.[0] || null)
                  }
                />
              )}
              {form.mode === "url" && (
                <input
                  className="sba-input"
                  type="url"
                  placeholder="https://example.com/banner.jpg"
                  value={form.imageUrl}
                  onChange={(e) => setField("imageUrl", e.target.value)}
                />
              )}

              {previewSrc && (
                <div className="sba-preview">
                  <img src={previewSrc} alt="Preview" />
                </div>
              )}
            </div>
            <div className="sba-modal-foot">
              <button
                type="button"
                className="sba-btn"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="sba-btn sba-btn--primary"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : "Add banner"}
              </button>
            </div>
          </div>
        </>
      )}

      {deleteTarget && (
        <>
          <div className="sba-backdrop" />
          <div className="sba-confirm" role="alertdialog">
            <h3>Delete banner?</h3>
            <p>
              Remove &ldquo;{deleteTarget.title || "Untitled"}&rdquo; from the
              site. Remaining banners will be renumbered.
            </p>
            <div className="sba-confirm-actions">
              <button
                type="button"
                className="sba-btn"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="sba-btn sba-btn--danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
