import { useEffect, useState, useCallback } from 'react'
import { getBanners, createBanner, deleteBanner, toggleBanner } from '../../services/adminService'

const AdminBanner = () => {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState({ title: '', subtitle: '', link: '', image: null })
  const [saving, setSaving]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getBanners()
      setBanners(data.data || data.banners || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async () => {
    if (!form.title) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('subtitle', form.subtitle)
      fd.append('link', form.link)
      if (form.image) fd.append('image', form.image)
      await createBanner(fd)
      setForm({ title: '', subtitle: '', link: '', image: null })
      load()
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return
    await deleteBanner(id)
    load()
  }

  const handleToggle = async (id) => {
    await toggleBanner(id)
    load()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Banner Management</h2>
          <p className="page-sub">Manage homepage banners and promotional slides</p>
        </div>
      </div>

      {/* Create banner */}
      <div className="section-card" style={{ marginBottom: 24 }}>
        <div className="section-header"><h2>Add New Banner</h2></div>
        <div style={{ padding: '18px 22px' }}>
          <div className="course-form-grid">
            <div className="sched-field">
              <label>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Banner title" />
            </div>
            <div className="sched-field">
              <label>Subtitle</label>
              <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Banner subtitle" />
            </div>
            <div className="sched-field">
              <label>Link (Optional)</label>
              <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://…" />
            </div>
            <div className="sched-field">
              <label>Banner Image</label>
              <input type="file" accept="image/*" onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))} />
            </div>
          </div>
          <button className="red-btn" style={{ marginTop: 14 }} onClick={handleAdd} disabled={saving}>
            {saving ? 'Saving…' : '+ Add Banner'}
          </button>
        </div>
      </div>

      {/* Banner list */}
      <div className="section-card">
        <div className="section-header"><h2>Active Banners</h2><span className="section-count">{banners.length} total</span></div>
        {loading
          ? <p className="loading-text">Loading banners…</p>
          : banners.length === 0
            ? <p className="empty-row">No banners yet</p>
            : banners.map(b => (
              <div key={b._id} className="banner-row">
                {b.image && <img src={b.image} alt={b.title} className="banner-thumb" />}
                <div className="banner-info">
                  <p className="banner-title">{b.title}</p>
                  {b.subtitle && <p className="td-muted">{b.subtitle}</p>}
                  {b.link && <a href={b.link} target="_blank" rel="noreferrer" className="td-muted" style={{ fontSize: 12 }}>{b.link}</a>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`status-pill ${b.isActive !== false ? 'status-active' : 'status-inactive'}`}>
                    {b.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                  <button className="icon-action-btn" onClick={() => handleToggle(b._id)}>
                    {b.isActive !== false ? '⏸' : '▶'}
                  </button>
                  <button className="icon-action-btn danger" onClick={() => handleDelete(b._id)}>🗑</button>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  )
}

export default AdminBanner