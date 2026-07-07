import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { API_URL } from "../data/service"
import { cdnImage } from "../utils/cdnImage"
import "../styles/FormDocumentsAdmin.css"

const blankForm = {
  title: "",
  description: "",
  section: "list",
  fileMode: "file",
  file: null,
  fileUrl: "",
  bannerMode: "none",
  banner: null,
  bannerImage: "",
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
    return `Forms API not found on the server (404). Deploy the latest backend code, then try again.`
  }
  if (!err.response) {
    return `Cannot reach the API at ${API_URL}. Is the backend running?`
  }
  return msg || `Failed to ${action} document (${status || "error"}).`
}

export default function AdminFormDocuments() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blankForm)
  const [submitting, setSubmitting] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)

  const featured = useMemo(
    () => docs.filter((d) => d.section === "featured").sort((a, b) => (a.order || 0) - (b.order || 0)),
    [docs]
  )
  const list = useMemo(
    () => docs.filter((d) => d.section !== "featured").sort((a, b) => (a.order || 0) - (b.order || 0)),
    [docs]
  )

  const load = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await axios.get(`${API_URL}/api/form-documents`, {
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
      section: d.section === "featured" ? "featured" : "list",
      fileMode: "keep",
      file: null,
      fileUrl: "",
      bannerMode: d.bannerImage ? "keep" : "none",
      banner: null,
      bannerImage: "",
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
    if (form.fileMode === "file" && !form.file && editing) {
      // ok — file mode chosen but nothing picked yet only matters if not editing
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
      fd.append("section", form.section)

      if (form.fileMode === "file" && form.file) {
        fd.append("file", form.file)
      } else if (form.fileMode === "url" && form.fileUrl.trim()) {
        fd.append("fileUrl", form.fileUrl.trim())
      }

      if (form.section === "featured") {
        if (form.bannerMode === "file" && form.banner) {
          fd.append("banner", form.banner)
        } else if (form.bannerMode === "url" && form.bannerImage.trim()) {
          fd.append("bannerImage", form.bannerImage.trim())
        } else if (form.bannerMode === "none") {
          fd.append("bannerImage", "")
        }
      }

      if (editing) {
        await axios.put(`${API_URL}/api/form-documents/${editing._id}`, fd, {
          headers: authHeaders(),
        })
      } else {
        await axios.post(`${API_URL}/api/form-documents`, fd, {
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
        `${API_URL}/api/form-documents/${d._id}/toggle-active`,
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
      await axios.delete(`${API_URL}/api/form-documents/${deleteTarget._id}`, {
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
      <span className={`fda-section-tag ${d.section === "featured" ? "fda-section-tag--featured" : ""}`}>
        {d.section === "featured" ? "Featured (left card)" : "List item"}
      </span>
      <div className="fda-card-icon">
        <i className="fa-solid fa-file-pdf"></i>
      </div>
      <div className="fda-card-body">
        <h3 className="fda-card-title">{d.title}</h3>
        {d.description && <p className="fda-card-desc">{d.description}</p>}
        <a
          className="fda-card-link"
          href={d.fileUrl}
          target="_blank"
          rel="noreferrer"
          title={d.fileUrl}
        >
          View current PDF <i className="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
        {d.section === "featured" && d.bannerImage && (
          <img
            src={cdnImage(d.bannerImage, { w: 200 })}
            alt=""
            className="fda-banner-thumb"
          />
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
              <h1 className="fda-title">Forms & Resources</h1>
              <p className="fda-sub">
                Manage the PDFs shown on the public Forms page — the
                "Featured" document appears as the big card on the left
                (e.g. Participant Handbook), and "List" documents appear as
                rows on the right (e.g. Fees & Refund Policy, WHS Act).
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
          ) : (
            <>
              <h2 className="fda-group-title">Featured document</h2>
              {featured.length === 0 ? (
                <div className="fda-empty">
                  No featured document yet. Click <strong>Add Document</strong>{" "}
                  and choose "Featured" to add one (e.g. Participant Handbook).
                </div>
              ) : (
                <div className="fda-grid">{featured.map(renderCard)}</div>
              )}

              <h2 className="fda-group-title">List documents</h2>
              {list.length === 0 ? (
                <div className="fda-empty">
                  No list documents yet. Click <strong>Add Document</strong> on
                  the right to add your first one.
                </div>
              ) : (
                <div className="fda-grid">{list.map(renderCard)}</div>
              )}
            </>
          )}
        </div>

        <aside className="fda-aside">
          <button type="button" className="fda-add-btn" onClick={openAdd}>
            + Add Document
          </button>
          <p className="fda-aside-note">
            Upload a PDF here and it appears immediately on the public{" "}
            <strong>/forms</strong> page.
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
                placeholder="e.g. WHS Act"
              />

              <label className="fda-label">Description (optional)</label>
              <input
                className="fda-input"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Shown as a subtitle on the featured card"
              />

              <label className="fda-label">Display position</label>
              <div className="fda-img-toggle">
                <button
                  type="button"
                  className={`fda-img-btn ${form.section === "list" ? "is-active" : ""}`}
                  onClick={() => setField("section", "list")}
                >
                  List item (right)
                </button>
                <button
                  type="button"
                  className={`fda-img-btn ${form.section === "featured" ? "is-active" : ""}`}
                  onClick={() => setField("section", "featured")}
                >
                  Featured (left card)
                </button>
              </div>

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

              {form.section === "featured" && (
                <>
                  <label className="fda-label">Cover image (optional)</label>
                  <div className="fda-img-toggle">
                    <button
                      type="button"
                      className={`fda-img-btn ${form.bannerMode === "none" ? "is-active" : ""}`}
                      onClick={() => setForm((p) => ({ ...p, bannerMode: "none", banner: null, bannerImage: "" }))}
                    >
                      None (use logo)
                    </button>
                    {editing?.bannerImage && (
                      <button
                        type="button"
                        className={`fda-img-btn ${form.bannerMode === "keep" ? "is-active" : ""}`}
                        onClick={() => setForm((p) => ({ ...p, bannerMode: "keep", banner: null, bannerImage: "" }))}
                      >
                        Keep current
                      </button>
                    )}
                    <button
                      type="button"
                      className={`fda-img-btn ${form.bannerMode === "file" ? "is-active" : ""}`}
                      onClick={() => setForm((p) => ({ ...p, bannerMode: "file", bannerImage: "" }))}
                    >
                      Upload
                    </button>
                  </div>
                  {form.bannerMode === "file" && (
                    <input
                      type="file"
                      accept="image/*"
                      className="fda-file"
                      onChange={(e) => setField("banner", e.target.files?.[0] || null)}
                    />
                  )}
                </>
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
              Remove &ldquo;{deleteTarget.title}&rdquo; from the public Forms
              page. This cannot be undone.
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