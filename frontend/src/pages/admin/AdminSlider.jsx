import { useEffect, useState, useCallback } from 'react'
import { getBanners, createBanner, deleteBanner, toggleBanner, updateBanner } from '../../services/adminService'

const AdminSlider = () => {
  const [slides, setSlides]   = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [preview, setPreview] = useState(null)
  const [form, setForm]       = useState({
    title: '', subtitle: '', link: '', linkText: 'Learn More', image: null
  })
  const [errors, setErrors]   = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getBanners()
      setSlides(data.data || data.banners || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.image) e.image = 'Please select an image'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm(f => ({ ...f, image: file }))
    setPreview(URL.createObjectURL(file))
  }

  const handleAdd = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('subtitle', form.subtitle)
      fd.append('link', form.link)
      fd.append('linkText', form.linkText)
      fd.append('image', form.image)
      await createBanner(fd)
      setForm({ title: '', subtitle: '', link: '', linkText: 'Learn More', image: null })
      setPreview(null)
      setErrors({})
      load()
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slider image?')) return
    await deleteBanner(id)
    load()
  }

  const handleToggle = async (id) => {
    await toggleBanner(id)
    load()
  }

  const activeCount   = slides.filter(s => s.isActive !== false).length
  const inactiveCount = slides.length - activeCount

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Hero Slider Management</h2>
          <p className="page-sub">Upload and manage the images shown in the homepage hero slider</p>
        </div>
        <div className="page-header-stats">
          <span className="ph-stat"><strong>{slides.length}</strong> Total</span>
          <span className="ph-stat active"><strong>{activeCount}</strong> Active</span>
          <span className="ph-stat inactive"><strong>{inactiveCount}</strong> Hidden</span>
        </div>
      </div>

      {/* ── Add new slide ── */}
      <div className="section-card" style={{ marginBottom: 24 }}>
        <div className="section-header"><h2>Add New Slide</h2></div>
        <div style={{ padding: '20px 24px' }}>
          <div className="course-form-grid">

            {/* Image upload with preview */}
            <div className="sched-field" style={{ gridColumn: '1 / -1' }}>
              <label>Slide Image <span style={{ color: '#cc0000' }}>*</span></label>
              <div className="slider-upload-area" onClick={() => document.getElementById('slider-img-input').click()}>
                {preview
                  ? <img src={preview} alt="Preview" className="slider-preview-img" />
                  : (
                    <div className="slider-upload-placeholder">
                      <span className="slider-upload-icon">🖼️</span>
                      <p>Click to upload image</p>
                      <small>Recommended: 1600 × 760px, JPG or PNG</small>
                    </div>
                  )
                }
                <input
                  id="slider-img-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
              </div>
              {errors.image && <span className="slider-field-error">⚠ {errors.image}</span>}
            </div>

            <div className="sched-field">
              <label>Title <span style={{ color: '#cc0000' }}>*</span></label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Nationally Recognised Training"
              />
              {errors.title && <span className="slider-field-error">⚠ {errors.title}</span>}
            </div>

            <div className="sched-field">
              <label>Subtitle</label>
              <input
                value={form.subtitle}
                onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                placeholder="e.g. Certificate issued same day"
              />
            </div>

            <div className="sched-field">
              <label>CTA Link (Optional)</label>
              <input
                value={form.link}
                onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                placeholder="https://…"
              />
            </div>

            <div className="sched-field">
              <label>CTA Button Text</label>
              <input
                value={form.linkText}
                onChange={e => setForm(f => ({ ...f, linkText: e.target.value }))}
                placeholder="Learn More"
              />
            </div>

          </div>

          <button
            className="red-btn"
            style={{ marginTop: 18 }}
            onClick={handleAdd}
            disabled={saving}
          >
            {saving ? '⏳ Uploading…' : '+ Add Slide'}
          </button>
        </div>
      </div>

      {/* ── Slides list ── */}
      <div className="section-card">
        <div className="section-header">
          <h2>Slider Images</h2>
          <span className="section-count">{slides.length} slide{slides.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <p className="loading-text">Loading slides…</p>
        ) : slides.length === 0 ? (
          <div className="slider-empty">
            <div className="slider-empty-icon">🖼️</div>
            <p>No slides yet. Add the first one above.</p>
          </div>
        ) : (
          <div className="slider-grid">
            {slides.map(slide => (
              <div key={slide._id} className={`slider-card${slide.isActive === false ? ' slider-card-inactive' : ''}`}>
                <div className="slider-card-img-wrap">
                  {slide.image
                    ? <img src={slide.image} alt={slide.title} />
                    : <div className="slider-card-no-img">No Image</div>
                  }
                  <div className="slider-card-overlay">
                    <button
                      className="slider-overlay-btn toggle"
                      onClick={() => handleToggle(slide._id)}
                      title={slide.isActive !== false ? 'Hide slide' : 'Show slide'}
                    >
                      {slide.isActive !== false ? '⏸ Hide' : '▶ Show'}
                    </button>
                    <button
                      className="slider-overlay-btn delete"
                      onClick={() => handleDelete(slide._id)}
                      title="Delete slide"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
                <div className="slider-card-info">
                  <div className="slider-card-title-row">
                    <strong className="slider-card-title">{slide.title || 'Untitled'}</strong>
                    <span className={`status-pill ${slide.isActive !== false ? 'status-active' : 'status-inactive'}`}>
                      {slide.isActive !== false ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  {slide.subtitle && <p className="slider-card-sub">{slide.subtitle}</p>}
                  {slide.link && (
                    <a href={slide.link} target="_blank" rel="noreferrer" className="slider-card-link">
                      🔗 {slide.link}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .page-header-stats { display: flex; gap: 16px; align-items: center; }
        .ph-stat { background: #f4f6f8; border-radius: 8px; padding: 6px 14px; font-size: 13px; color: #555; }
        .ph-stat.active strong { color: #2e7d32; }
        .ph-stat.inactive strong { color: #999; }

        .slider-upload-area {
          border: 2px dashed #ddd; border-radius: 12px;
          min-height: 160px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; transition: border-color 0.2s;
          background: #fafafa;
        }
        .slider-upload-area:hover { border-color: #cc0000; }
        .slider-preview-img { width: 100%; max-height: 260px; object-fit: cover; display: block; }
        .slider-upload-placeholder { text-align: center; padding: 32px; color: #aaa; }
        .slider-upload-icon { font-size: 40px; display: block; margin-bottom: 10px; }
        .slider-upload-placeholder p { font-size: 15px; font-weight: 600; color: #555; margin-bottom: 4px; }
        .slider-upload-placeholder small { font-size: 12px; color: #aaa; }
        .slider-field-error { color: #cc0000; font-size: 12px; margin-top: 4px; display: block; }

        .slider-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          padding: 20px 24px;
        }
        .slider-card {
          border-radius: 14px; overflow: hidden;
          border: 1.5px solid #e8e8e8;
          background: #fff;
          transition: box-shadow 0.2s;
        }
        .slider-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .slider-card-inactive { opacity: 0.55; }

        .slider-card-img-wrap {
          position: relative; height: 160px; background: #f0f0f0; overflow: hidden;
        }
        .slider-card-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .slider-card-no-img {
          height: 100%; display: flex; align-items: center; justify-content: center;
          font-size: 13px; color: #aaa;
        }
        .slider-card-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          gap: 10px;
          opacity: 0; transition: opacity 0.2s;
        }
        .slider-card:hover .slider-card-overlay { opacity: 1; }
        .slider-overlay-btn {
          padding: 8px 16px; border-radius: 8px; border: none;
          font-size: 13px; font-weight: 700; cursor: pointer; color: #fff;
          transition: opacity 0.15s;
        }
        .slider-overlay-btn:hover { opacity: 0.85; }
        .slider-overlay-btn.toggle { background: #111827; }
        .slider-overlay-btn.delete { background: #cc0000; }

        .slider-card-info { padding: 14px 16px; }
        .slider-card-title-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
        .slider-card-title { font-size: 14px; font-weight: 700; color: #111827; }
        .slider-card-sub { font-size: 13px; color: #777; margin-bottom: 6px; }
        .slider-card-link { font-size: 12px; color: #cc0000; word-break: break-all; }

        .slider-empty { text-align: center; padding: 60px 24px; color: #aaa; }
        .slider-empty-icon { font-size: 48px; margin-bottom: 12px; }
        .slider-empty p { font-size: 15px; }
      `}</style>
    </div>
  )
}

export default AdminSlider