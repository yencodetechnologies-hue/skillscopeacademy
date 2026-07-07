import { useEffect, useState } from "react"
import axios from "axios"
import { API_URL } from "../data/service"
import "../styles/FormDocumentsAdmin.css"

const blankForm = {
  title: "",
  description: "",
  fileMode: "file",
  file: null,
  fileUrl: "",
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
    (typeof data === "string" && data.includes("Cannot") ? data : null)

  if (status === 404) {
    return `Code of Practice API not found on the server (404). Deploy the latest backend code, then try again.`
  }
  if (!err.response) {
    return `Cannot reach the API at ${API_URL}. Is the backend running?`
  }
  return msg || `Failed to ${action} document (${status || "error"}).`
}

export default function AdminCodeOfPractice() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blankForm)
  const [submitting, setSubmitting] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)

  const sorted = [...docs].sort((a, b) => (a.order || 0) - (b.order || 0))

  const load = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await axios.get(`${API_URL}/api/code-of-practice`, {
        headers: authHeaders(),
      })
      setDocs(res.data?.data || [])
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

  const openEdit = (d) => {
    setEditing(d)
    setForm({
      title: d.title || "",
      description: d.description || "",
      fileMode: "keep",
      file: null,
      fileUrl: "",
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
    if (!form.title.trim()) {
      alert("Please enter a title.")
      return
    }
    if (form.fileMode === "file" && !form.file && !editing) {
      alert("Please choose a PDF file.")
      return
    }
    if (form.fileMode === "url" && !form.fileUrl.trim()) {
      alert("Please enter a PDF URL.")
      return
    }

    try {
      setSubmitting(true)
      setSaveError("")
      const fd = new FormData()
      fd.append("title", form.title.trim())
      fd.append("description", form.description.trim())

      if (form.fileMode === "file" && form.file) {
        fd.append("file", form.file)
      } else if (form.fileMode === "url" && form.fileUrl.trim()) {
        fd.append("fileUrl", form.fileUrl.trim())
      }

      if (editing) {
        await axios.put(`${API_URL}/api/code-of-practice/${editing._id}`, fd, {
          headers: authHeaders(),
        })
      } else {
        await axios.post(`${API_URL}/api/code-of-practice`, fd, {
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

  const toggleActive = async (d) => {
    try {
      await axios.patch(
        `${API_URL}/api/code-of-practice/${d._id}/toggle-active`,
        {},
        { headers: authHeaders() }
      )
      setDocs((prev) =>
        prev.map((x) => (x._id === d._id ? { ...x, active: !x.active } : x))
      )
    } catch {
      alert("Toggle failed.")
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await axios.delete(`${API_URL}/api/code-of-practice/${deleteTarget._id}`, {
        headers: authHeaders(),
      })
      setDeleteTarget(null)
      load()
    } catch {
      alert("Delete failed.")
    }
  }
const renderCard = (d) => (
  <article key={d._id} className={`fda-card ${!d.active ? "fda-card--off" : ""}`}>
    <div className="fda-card-icon">
      <i className="fa-solid fa-file-pdf"></i>
    </div>

    <div className="fda-card-body">
      <h3 className="fda-card-title">{d.title}</h3>

      {d.description && (
        <p className="fda-card-desc">{d.description}</p>
      )}

      {d.fileUrl && (
        <a
          className="fda-card-link"
          href={d.fileUrl}
          target="_blank"
          rel="noreferrer"
          title={d.fileUrl}
        >
          View current PDF{" "}
          <i className="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      )}

      <div className="fda-card-actions">
        <button type="button" className="fda-btn" onClick={() => toggleActive(d)}>
          {d.active ? "Hide" : "Show"}
        </button>

        <button type="button" className="fda-btn" onClick={() => openEdit(d)}>
          Edit
        </button>

        <button
          type="button"
          className="fda-btn fda-btn--danger"
          onClick={() => setDeleteTarget(d)}
        >
          Delete
        </button>
      </div>
    </div>
  </article>
)

  return (
    <div className="fda-page">
      <div className="fda-shell">
        <div className="fda-main">
          <div className="fda-main-head">
            <div>
              <h1 className="fda-title">Code of Practice</h1>
              <p className="fda-sub">
                Manage the PDFs shown in the public Resources ▸ Code of
                Practice menu (e.g. Working at Heights, Asbestos Removal,
                Confined Space). Each one you add here appears instantly as
                a clickable item in that menu and on the /code-of-practice
                page — visitors can view it and download it straight from
                their browser.
              </p>
            </div>
          </div>

          {error && <div className="fda-error">{error}</div>}

          {loading ? (
            <div className="fda-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="fda-card fda-card--skeleton" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="fda-empty">
              No Code of Practice documents yet. Click <strong>Add Document</strong>{" "}
              on the right to upload your first one (e.g. "Working at Heights").
            </div>
          ) : (
            <div className="fda-grid">{sorted.map(renderCard)}</div>
          )}
        </div>

        <aside className="fda-aside">
          <button type="button" className="fda-add-btn" onClick={openAdd}>
            + Add Document
          </button>
          <p className="fda-aside-note">
            Upload a PDF here and it appears immediately in the{" "}
            <strong>Code of Practice</strong> menu and on the{" "}
            <strong>/code-of-practice</strong> page.
          </p>
        </aside>
      </div>

      {showModal && (
        <>
          <div className="fda-backdrop" onClick={closeModal} />
          <div className="fda-modal" role="dialog" aria-modal="true">
            <div className="fda-modal-head">
              <h3>{editing ? "Edit Document" : "Add Document"}</h3>
              <button type="button" className="fda-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className="fda-modal-body">
              {saveError && <div className="fda-modal-error">{saveError}</div>}

              <label className="fda-label">
                Title<span className="fda-req">*</span>
              </label>
              <input
                className="fda-input"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="e.g. Working at Heights"
              />

              <label className="fda-label">Description (optional)</label>
              <input
                className="fda-input"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Shown on the admin card only"
              />

              <label className="fda-label">
                PDF File<span className="fda-req">*</span>
              </label>
              <div className="fda-img-toggle">
                {editing && (
                  <button
                    type="button"
                    className={`fda-img-btn ${form.fileMode === "keep" ? "is-active" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, fileMode: "keep", file: null, fileUrl: "" }))}
                  >
                    Keep current
                  </button>
                )}
                <button
                  type="button"
                  className={`fda-img-btn ${form.fileMode === "file" ? "is-active" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, fileMode: "file", fileUrl: "" }))}
                >
                  Upload
                </button>
                <button
                  type="button"
                  className={`fda-img-btn ${form.fileMode === "url" ? "is-active" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, fileMode: "url", file: null }))}
                >
                  URL
                </button>
              </div>
              {form.fileMode === "file" && (
                <input
                  type="file"
                  accept="application/pdf"
                  className="fda-file"
                  onChange={(e) => setField("file", e.target.files?.[0] || null)}
                />
              )}
              {form.fileMode === "url" && (
                <input
                  className="fda-input"
                  type="url"
                  placeholder="https://example.com/document.pdf"
                  value={form.fileUrl}
                  onChange={(e) => setField("fileUrl", e.target.value)}
                />
              )}
            </div>
            <div className="fda-modal-foot">
              <button type="button" className="fda-btn" onClick={closeModal}>
                Cancel
              </button>
              <button
                type="button"
                className="fda-btn fda-btn--primary"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Saving…" : editing ? "Save changes" : "Add document"}
              </button>
            </div>
          </div>
        </>
      )}

      {deleteTarget && (
        <>
          <div className="fda-backdrop" />
          <div className="fda-confirm" role="alertdialog">
            <h3>Delete document?</h3>
            <p>
              Remove &ldquo;{deleteTarget.title}&rdquo; from the Code of
              Practice menu. This cannot be undone.
            </p>
            <div className="fda-confirm-actions">
              <button type="button" className="fda-btn" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="fda-btn fda-btn--danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}