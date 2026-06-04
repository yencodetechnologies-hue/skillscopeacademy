import { useEffect, useState, useCallback } from 'react'
import { getGallery, uploadGallery, deleteGallery } from '../../services/adminService'

const AdminGallery = () => {
  const [images, setImages]   = useState([])
  const [loading, setLoading] = useState(true)
  const [file, setFile]       = useState(null)
  const [altText, setAlt]     = useState('')
  const [uploading, setUpl]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getGallery()
      setImages(data.data || data.images || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleUpload = async () => {
    if (!file) return
    setUpl(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('altText', altText)
      await uploadGallery(fd)
      setFile(null); setAlt('')
      load()
    } catch (e) { console.error(e) }
    finally { setUpl(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return
    await deleteGallery(id)
    load()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Gallery</h2>
          <p className="page-sub">Upload and manage gallery images shown on the website</p>
        </div>
      </div>

      {/* Upload card */}
      <div className="section-card" style={{ marginBottom: 24 }}>
        <div className="section-header"><h2>Upload New Image</h2></div>
        <div style={{ padding: '18px 22px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="sched-field" style={{ flex: 1, minWidth: 200 }}>
            <label>Image File *</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
          </div>
          <div className="sched-field" style={{ flex: 2, minWidth: 200 }}>
            <label>Alt Text (Optional)</label>
            <input value={altText} onChange={e => setAlt(e.target.value)} placeholder="Describe the image…" />
          </div>
          <button className="red-btn" onClick={handleUpload} disabled={uploading || !file}>
            {uploading ? 'Uploading…' : '📤 Upload'}
          </button>
        </div>
      </div>

      {/* Image grid */}
      {loading
        ? <p className="loading-text">Loading gallery…</p>
        : images.length === 0
          ? <div className="section-card"><p className="empty-row">No images uploaded yet</p></div>
          : <div className="gallery-grid">
              {images.map(img => (
                <div key={img._id} className="gallery-card">
                  <img src={img.url || img.image} alt={img.altText || ''} />
                  <div className="gallery-card-overlay">
                    <button className="gallery-delete-btn" onClick={() => handleDelete(img._id)}>🗑</button>
                  </div>
                  {img.altText && <p className="gallery-alt">{img.altText}</p>}
                </div>
              ))}
            </div>
      }
    </div>
  )
}

export default AdminGallery