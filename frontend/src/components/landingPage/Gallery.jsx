import { useState, useEffect, useRef } from "react";
import "../../styles/Gallery.css";
import { API_URL } from "../../data/service";
import { cdnImage } from "../../utils/cdnImage";



export default function Gallery() {
  const [images,       setImages]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [showModal,    setShowModal]    = useState(false);
  const [editItem,     setEditItem]     = useState(null);
  const [formData,     setFormData]     = useState({
    title: "", category: "", courseName: "", imageUrl: "",
  });
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadMode,   setUploadMode]   = useState("url"); // "url" | "file"
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const fileInputRef = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────
  useEffect(() => { fetchImages(); }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/gallery`);
      const data = await res.json();
      if (data.success) setImages(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = images.filter((img) =>
    img.title.toLowerCase().includes(search.toLowerCase())
  );

  // ── Reset modal state ──────────────────────────────────────────
  const resetModal = () => {
    setEditItem(null);
    setFormData({ title: "", category: "", courseName: "", imageUrl: "" });
    setImageFile(null);
    setImagePreview("");
    setUploadMode("url");
    setError("");
  };

  // ── Open handlers ──────────────────────────────────────────────
  const handleAddClick = () => {
    resetModal();
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      title:      item.title,
      category:   item.category,
      courseName: item.courseName,
      imageUrl:   item.imageUrl,
    });
    setImageFile(null);
    setImagePreview(item.imageUrl);
    setUploadMode("url");
    setError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetModal();
  };

  // ── File select ────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormData((f) => ({ ...f, imageUrl: "" }));
  };

  // ── CRUD ───────────────────────────────────────────────────────
  const handleRefresh = () => {
    setSearch("");
    fetchImages();
  };

  const handleDeactivate = async (id) => {
    try {
      const res  = await fetch(`${API_URL}/api/gallery/${id}/toggle-active`, { method: "PATCH" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setImages((prev) => prev.map((img) => img._id === id ? data.data : img));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      const res  = await fetch(`${API_URL}/api/gallery/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setImages((prev) => prev.filter((img) => img._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleModalSave = async () => {
    // Validation
    if (!formData.title.trim())      { setError("Title is required");         return; }
    if (!formData.category.trim())   { setError("Category is required");      return; }
    if (!formData.courseName.trim()) { setError("Course Name is required");   return; }
    if (uploadMode === "url" && !formData.imageUrl.trim()) {
      setError("Image URL is required"); return;
    }
    if (uploadMode === "file" && !imageFile && !editItem) {
      setError("Please select an image file"); return;
    }

    setSaving(true);
    setError("");

    try {
      const body = new FormData();
      body.append("title",      formData.title.trim());
      body.append("category",   formData.category.trim());
      body.append("courseName", formData.courseName.trim());

      if (uploadMode === "file" && imageFile) {
        body.append("image", imageFile);       // multer field name: "image"
      } else if (uploadMode === "url") {
        body.append("imageUrl", formData.imageUrl.trim());
      }

      const url    = editItem ? `${API_URL}/api/gallery/${editItem._id}` : `${API_URL}/api/gallery`;
      const method = editItem ? "PUT" : "POST";

      const res  = await fetch(url, { method, body });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      if (editItem) {
        setImages((prev) => prev.map((img) => img._id === editItem._id ? data.data : img));
      } else {
        setImages((prev) => [data.data, ...prev]);
      }

      setShowModal(false);
      resetModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="gallery-page">

      {/* Page Header */}
      <div className="gallery-page-header">
        <h1 className="gallery-page-title">Gallery</h1>
        <p className="gallery-page-subtitle">
          Manage images displayed on the Gallery page
        </p>
      </div>

      {/* Stats Card */}
      <div className="gallery-stats-card">
        <p className="stats-label">Total Images</p>
        <p className="stats-value">{images.length}</p>
      </div>

      {/* Gallery Panel */}
      <div className="gallery-panel">

        {/* Panel Header */}
        <div className="gallery-panel-header">
          <div className="gallery-panel-title-group">
            <h2 className="gallery-panel-title">Gallery Images</h2>
            <p className="gallery-panel-subtitle">
              Add images with titles to display on the public Gallery page
            </p>
          </div>
          <div className="gallery-panel-actions">
            <button className="btn-refresh" onClick={handleRefresh}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Refresh
            </button>
            <button className="btn-add" onClick={handleAddClick}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Gallery
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="gallery-search-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="gallery-search"
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Grid */}
        <div className="gallery-grid">
          {loading && <p className="gallery-empty">Loading images…</p>}
          {!loading && filtered.length === 0 && (
            <p className="gallery-empty">No images found.</p>
          )}
          {!loading && filtered.map((img) => (
            <div className={`gallery-card ${!img.active ? "inactive" : ""}`} key={img._id}>
              <div className="gallery-card-image-wrap">
                <img
                  src={cdnImage(img.imageUrl, { w: 600 })}
                  alt={img.title}
                  className="gallery-card-image"
                  loading="lazy"
                  decoding="async"
                />
                <div className="gallery-card-overlay">
                  <span className="overlay-category">{img.category}</span>
                  <span className="overlay-course">{img.courseName}</span>
                </div>
                {!img.active && (
                  <div className="gallery-card-inactive-badge">Inactive</div>
                )}
              </div>
              <div className="gallery-card-footer">
                <p className="gallery-card-title">{img.title}</p>
                <div className="gallery-card-btns">
                  <button className="card-btn edit" onClick={() => handleEdit(img)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                  <button className="card-btn deactivate" onClick={() => handleDeactivate(img._id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                    {img.active ? "Deactivate" : "Activate"}
                  </button>
                  <button className="card-btn delete" onClick={() => handleDelete(img._id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? "Edit Image" : "Add Gallery Image"}</h3>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>

            <div className="modal-body">

              {/* Error */}
              {error && <div className="modal-error">{error}</div>}

              {/* Title */}
              <div className="modal-field">
                <label className="modal-label">Title</label>
                <input
                  className="modal-input"
                  type="text"
                  placeholder="Enter title..."
                  value={formData.title}
                  onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              {/* Category + Course Name — side by side */}
              <div className="modal-row-2">
                <div className="modal-field">
                  <label className="modal-label">Category <span className="modal-req">*</span></label>
                  <input
                    className="modal-input"
                    type="text"
                    placeholder="e.g. COURSE, EVENT..."
                    value={formData.category}
                    onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value }))}
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Course Name <span className="modal-req">*</span></label>
                  <input
                    className="modal-input"
                    type="text"
                    placeholder="e.g. Work Safely at Heights"
                    value={formData.courseName}
                    onChange={(e) => setFormData((f) => ({ ...f, courseName: e.target.value }))}
                  />
                </div>
              </div>

              {/* Image — URL or File upload */}
              <div className="modal-field">
                <label className="modal-label">Image <span className="modal-req">*</span></label>

                {/* Toggle */}
                <div className="modal-upload-toggle">
                  <button
                    type="button"
                    className={`modal-toggle-btn ${uploadMode === "url" ? "active" : ""}`}
                    onClick={() => {
                      setUploadMode("url");
                      setImageFile(null);
                      setImagePreview(formData.imageUrl || "");
                    }}
                  >
                    🔗 URL
                  </button>
                  <button
                    type="button"
                    className={`modal-toggle-btn ${uploadMode === "file" ? "active" : ""}`}
                    onClick={() => {
                      setUploadMode("file");
                      setFormData((f) => ({ ...f, imageUrl: "" }));
                      setImagePreview(imageFile ? URL.createObjectURL(imageFile) : "");
                    }}
                  >
                    📁 Upload File
                  </button>
                </div>

                {/* URL input */}
                {uploadMode === "url" && (
                  <input
                    className="modal-input"
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData((f) => ({ ...f, imageUrl: e.target.value }));
                      setImagePreview(e.target.value);
                    }}
                  />
                )}

                {/* File upload drop zone */}
                {uploadMode === "file" && (
                  <div
                    className="modal-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                    {imageFile ? (
                      <div className="modal-dropzone-selected">
                        <span className="modal-dropzone-filename">📎 {imageFile.name}</span>
                        <span className="modal-dropzone-hint">Click to change</span>
                      </div>
                    ) : (
                      <div className="modal-dropzone-empty">
                        <span className="modal-dropzone-icon">☁️</span>
                        <span className="modal-dropzone-text">Click to select an image</span>
                        <span className="modal-dropzone-hint">JPEG, PNG, WEBP, SVG — max 5 MB</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Preview */}
                {imagePreview && (
                  <div className="modal-preview">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="modal-preview-img"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer-gallery">
              <button className="modal-btn cancel" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="modal-btn save" onClick={handleModalSave} disabled={saving}>
                {saving ? "Saving..." : editItem ? "Save Changes" : "Add Image"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}