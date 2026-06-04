import { useState, useEffect } from 'react'
import {
  getAbout, updateAbout,
  getContact, updateContact,
  getAllFaqs, createFaq, updateFaq, deleteFaq,
  getFooter, updateFooter,
} from '../../services/siteContentServices'

// ── Shared UI helpers ──────────────────────────────────────────────────────
const card  = { background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'24px', marginBottom:20 }
const label = { display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }
const inp   = { width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, color:'#111827', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }
const textarea = { ...inp, minHeight:90, resize:'vertical' }
const btn   = (variant='primary') => ({
  padding:'9px 20px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
  background: variant==='primary' ? '#4f46e5' : variant==='danger' ? '#ef4444' : '#f1f5f9',
  color: variant==='secondary' ? '#374151' : '#fff', marginRight:8,
})
const sectionTitle = { fontSize:18, fontWeight:700, color:'#0f172a', marginBottom:4 }
const sectionSub   = { fontSize:13, color:'#64748b', marginBottom:20 }

function Toast({ msg, type }) {
  if (!msg) return null
  return (
    <div style={{ position:'fixed', top:24, right:24, zIndex:9999, padding:'12px 20px', borderRadius:10, background: type==='error'?'#fef2f2':'#f0fdf4', color: type==='error'?'#b91c1c':'#15803d', border:`1px solid ${type==='error'?'#fecaca':'#bbf7d0'}`, fontSize:13, fontWeight:600, boxShadow:'0 4px 16px rgba(0,0,0,0.10)' }}>
      {msg}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// TAB: ABOUT
// ══════════════════════════════════════════════════════════════════
function AboutTab({ toast }) {
  const [form, setForm] = useState({ heading:'', subheading:'', description:'', mission:'', vision:'', stats:[], highlights:[] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getAbout().then(d => { setForm(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setStat = (i, k, v) => { const s=[...form.stats]; s[i]={...s[i],[k]:v}; set('stats',s) }
  const addStat = () => set('stats', [...form.stats, {value:'',label:''}])
  const delStat = i => set('stats', form.stats.filter((_,idx)=>idx!==i))
  const setHL = (i,k,v) => { const h=[...form.highlights]; h[i]={...h[i],[k]:v}; set('highlights',h) }
  const addHL = () => set('highlights', [...form.highlights, {icon:'🏢',title:'',subtitle:''}])
  const delHL = i => set('highlights', form.highlights.filter((_,idx)=>idx!==i))

const save = async () => {
  setSaving(true)

  try {
    const payload = {
      heading: form.heading,
      subheading: form.subheading,
      description: form.description,
      mission: form.mission,
      vision: form.vision,
      stats: form.stats,
      highlights: form.highlights
    }

    await updateAbout(payload)

    toast('About section saved!', 'success')
  } catch (e) {
    toast(e.message || 'Save failed', 'error')
  } finally {
    setSaving(false)
  }
}

  if (loading) return <div style={{padding:40,color:'#94a3b8',fontSize:14}}>Loading…</div>

  return (
    <div>
      <div style={card}>
        <div style={sectionTitle}>About Page Content</div>
        <div style={sectionSub}>Shown on the About page — heading, description, mission & vision.</div>

        {[['heading','Heading'],['subheading','Subheading']].map(([k,l]) => (
          <div key={k} style={{marginBottom:14}}>
            <label style={label}>{l}</label>
            <input style={inp} value={form[k]||''} onChange={e=>set(k,e.target.value)} />
          </div>
        ))}
        {[['description','Description'],['mission','Mission'],['vision','Vision']].map(([k,l]) => (
          <div key={k} style={{marginBottom:14}}>
            <label style={label}>{l}</label>
            <textarea style={textarea} value={form[k]||''} onChange={e=>set(k,e.target.value)} />
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={card}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <span style={{fontSize:15,fontWeight:700,color:'#0f172a'}}>Stats</span>
          <button style={btn('secondary')} onClick={addStat}>+ Add Stat</button>
        </div>
        {form.stats.map((s,i) => (
          <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:10,marginBottom:10}}>
            <input style={inp} placeholder="Value (e.g. 10,000+)" value={s.value||''} onChange={e=>setStat(i,'value',e.target.value)} />
            <input style={inp} placeholder="Label (e.g. Students Trained)" value={s.label||''} onChange={e=>setStat(i,'label',e.target.value)} />
            <button style={{...btn('danger'),padding:'9px 14px'}} onClick={()=>delStat(i)}>✕</button>
          </div>
        ))}
        {form.stats.length===0 && <div style={{fontSize:13,color:'#94a3b8'}}>No stats yet. Click + Add Stat.</div>}
      </div>

      {/* Highlights */}
      <div style={card}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <span style={{fontSize:15,fontWeight:700,color:'#0f172a'}}>Highlights / Feature Boxes</span>
          <button style={btn('secondary')} onClick={addHL}>+ Add Highlight</button>
        </div>
        {form.highlights.map((h,i) => (
          <div key={i} style={{display:'grid',gridTemplateColumns:'60px 1fr 1fr auto',gap:10,marginBottom:10}}>
            <input style={inp} placeholder="Icon" value={h.icon||''} onChange={e=>setHL(i,'icon',e.target.value)} />
            <input style={inp} placeholder="Title" value={h.title||''} onChange={e=>setHL(i,'title',e.target.value)} />
            <input style={inp} placeholder="Subtitle" value={h.subtitle||''} onChange={e=>setHL(i,'subtitle',e.target.value)} />
            <button style={{...btn('danger'),padding:'9px 14px'}} onClick={()=>delHL(i)}>✕</button>
          </div>
        ))}
        {form.highlights.length===0 && <div style={{fontSize:13,color:'#94a3b8'}}>No highlights. Click + Add Highlight.</div>}
      </div>

      <button style={btn('primary')} onClick={save} disabled={saving}>{saving?'Saving…':'Save About'}</button>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// TAB: CONTACT
// ══════════════════════════════════════════════════════════════════
function ContactTab({ toast }) {
  const [form, setForm] = useState({ phone1:'', phone2:'', email:'', address:'', mapEmbed:'', hours:'', social:{facebook:'',instagram:'',linkedin:''} })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getContact().then(d => { setForm(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const setSocial = (k,v) => setForm(f=>({...f, social:{...f.social,[k]:v}}))

  const save = async () => {
    setSaving(true)
    try { await updateContact(form); toast('Contact info saved!','success') }
    catch(e) { toast(e.message||'Save failed','error') }
    finally { setSaving(false) }
  }

  if (loading) return <div style={{padding:40,color:'#94a3b8'}}>Loading…</div>

  return (
    <div>
      <div style={card}>
        <div style={sectionTitle}>Contact Information</div>
        <div style={sectionSub}>Shown on the Contact page, Footer, and Topbar.</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          {[['phone1','Phone 1'],['phone2','Phone 2'],['email','Email'],['hours','Office Hours']].map(([k,l])=>(
            <div key={k}>
              <label style={label}>{l}</label>
              <input style={inp} value={form[k]||''} onChange={e=>set(k,e.target.value)} />
            </div>
          ))}
        </div>
        <div style={{marginTop:14}}>
          <label style={label}>Address</label>
          <input style={inp} value={form.address||''} onChange={e=>set('address',e.target.value)} />
        </div>
        <div style={{marginTop:14}}>
          <label style={label}>Google Maps Embed URL</label>
          <input style={inp} placeholder="https://maps.google.com/maps?..." value={form.mapEmbed||''} onChange={e=>set('mapEmbed',e.target.value)} />
        </div>
      </div>

      <div style={card}>
        <div style={{fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:14}}>Social Media Links</div>
        {[['facebook','Facebook URL'],['instagram','Instagram URL'],['linkedin','LinkedIn URL']].map(([k,l])=>(
          <div key={k} style={{marginBottom:12}}>
            <label style={label}>{l}</label>
            <input style={inp} value={(form.social||{})[k]||''} onChange={e=>setSocial(k,e.target.value)} />
          </div>
        ))}
      </div>

      <button style={btn('primary')} onClick={save} disabled={saving}>{saving?'Saving…':'Save Contact'}</button>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// TAB: FAQ
// ══════════════════════════════════════════════════════════════════
function FaqTab({ toast }) {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ question:'', answer:'', order:0, active:true })
  const [saving, setSaving] = useState(false)

  const load = () => getAllFaqs().then(d=>{ setFaqs(d); setLoading(false) }).catch(()=>setLoading(false))
  useEffect(() => { load() }, [])

  const openEdit = (faq) => { setEditId(faq._id); setForm({ question:faq.question, answer:faq.answer, order:faq.order, active:faq.active }) }
  const openNew  = ()    => { setEditId('new'); setForm({ question:'', answer:'', order:0, active:true }) }
  const close    = ()    => { setEditId(null) }

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) { toast('Question and Answer are required','error'); return }
    setSaving(true)
    try {
      if (editId==='new') await createFaq(form)
      else await updateFaq(editId, form)
      await load()
      close()
      toast('FAQ saved!','success')
    } catch(e) { toast(e.message||'Save failed','error') }
    finally { setSaving(false) }
  }

  const del = async (id) => {
    if (!confirm('Delete this FAQ?')) return
    try { await deleteFaq(id); await load(); toast('FAQ deleted','success') }
    catch(e) { toast(e.message||'Delete failed','error') }
  }

  const toggle = async (faq) => {
    try { await updateFaq(faq._id, { active: !faq.active }); await load() }
    catch(e) { toast(e.message,'error') }
  }

  if (loading) return <div style={{padding:40,color:'#94a3b8'}}>Loading…</div>

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div>
          <div style={sectionTitle}>FAQ Management</div>
          <div style={sectionSub}>Shown in the FAQ section on the Home page and Contact page.</div>
        </div>
        <button style={btn('primary')} onClick={openNew}>+ Add FAQ</button>
      </div>

      {/* Edit / Add form */}
      {editId && (
        <div style={{...card, border:'1px solid #c4b5fd', background:'#faf5ff'}}>
          <div style={{fontSize:15,fontWeight:700,color:'#4f46e5',marginBottom:14}}>
            {editId==='new'?'New FAQ':'Edit FAQ'}
          </div>
          <div style={{marginBottom:12}}>
            <label style={label}>Question</label>
            <input style={inp} value={form.question} onChange={e=>setForm(f=>({...f,question:e.target.value}))} placeholder="Enter question..." />
          </div>
          <div style={{marginBottom:12}}>
            <label style={label}>Answer</label>
            <textarea style={textarea} value={form.answer} onChange={e=>setForm(f=>({...f,answer:e.target.value}))} placeholder="Enter answer..." />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
            <div>
              <label style={label}>Display Order</label>
              <input style={inp} type="number" value={form.order} onChange={e=>setForm(f=>({...f,order:Number(e.target.value)}))} />
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginTop:22}}>
              <input type="checkbox" id="faq-active" checked={form.active} onChange={e=>setForm(f=>({...f,active:e.target.checked}))} style={{width:16,height:16,accentColor:'#4f46e5'}} />
              <label htmlFor="faq-active" style={{fontSize:13,fontWeight:600,color:'#374151',cursor:'pointer'}}>Active (visible on site)</label>
            </div>
          </div>
          <button style={btn('primary')} onClick={save} disabled={saving}>{saving?'Saving…':'Save FAQ'}</button>
          <button style={btn('secondary')} onClick={close}>Cancel</button>
        </div>
      )}

      {/* FAQ list */}
      {faqs.length===0 ? (
        <div style={{...card,textAlign:'center',padding:40,color:'#94a3b8'}}>No FAQs yet. Click + Add FAQ.</div>
      ) : faqs.map(faq => (
        <div key={faq._id} style={{...card, marginBottom:12, opacity: faq.active ? 1 : 0.55}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                <span style={{fontSize:14,fontWeight:700,color:'#0f172a'}}>{faq.question}</span>
                {!faq.active && <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:'#fef3c7',color:'#b45309'}}>HIDDEN</span>}
              </div>
              <div style={{fontSize:13,color:'#64748b',lineHeight:1.6}}>{faq.answer}</div>
              <div style={{fontSize:11,color:'#94a3b8',marginTop:4}}>Order: {faq.order}</div>
            </div>
            <div style={{display:'flex',gap:6,flexShrink:0}}>
              <button style={{...btn('secondary'),padding:'6px 12px'}} onClick={()=>toggle(faq)}>
                {faq.active?'Hide':'Show'}
              </button>
              <button style={{...btn('secondary'),padding:'6px 12px'}} onClick={()=>openEdit(faq)}>Edit</button>
              <button style={{...btn('danger'),padding:'6px 12px'}} onClick={()=>del(faq._id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// TAB: FOOTER
// ══════════════════════════════════════════════════════════════════
function FooterTab({ toast }) {
  const [form, setForm] = useState({ courses:[], quickLinks:[], accreditation:[], copyright:'', abn:'', rto:'', website:'' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getFooter().then(d=>{ setForm(d); setLoading(false) }).catch(()=>setLoading(false))
  }, [])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  // Array helpers
  const addItem  = (k)    => set(k, [...(form[k]||[]), ''])
  const setItem  = (k,i,v)=> { const a=[...(form[k]||[])]; a[i]=v; set(k,a) }
  const delItem  = (k,i)  => set(k, (form[k]||[]).filter((_,idx)=>idx!==i))

  const save = async () => {
    setSaving(true)
    try { await updateFooter(form); toast('Footer saved!','success') }
    catch(e) { toast(e.message||'Save failed','error') }
    finally { setSaving(false) }
  }

  if (loading) return <div style={{padding:40,color:'#94a3b8'}}>Loading…</div>

  const ArraySection = ({ title, field }) => (
    <div style={card}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <span style={{fontSize:15,fontWeight:700,color:'#0f172a'}}>{title}</span>
        <button style={btn('secondary')} onClick={()=>addItem(field)}>+ Add</button>
      </div>
      {(form[field]||[]).map((item,i)=>(
        <div key={i} style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8,marginBottom:8}}>
          <input style={inp} value={item} onChange={e=>setItem(field,i,e.target.value)} />
          <button style={{...btn('danger'),padding:'9px 14px'}} onClick={()=>delItem(field,i)}>✕</button>
        </div>
      ))}
      {!(form[field]||[]).length && <div style={{fontSize:13,color:'#94a3b8'}}>No items. Click + Add.</div>}
    </div>
  )

  return (
    <div>
      <div style={card}>
        <div style={sectionTitle}>Footer Info</div>
        <div style={sectionSub}>Bottom bar copyright, RTO, ABN, website.</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          {[['abn','ABN'],['rto','RTO Number'],['website','Website'],].map(([k,l])=>(
            <div key={k}>
              <label style={label}>{l}</label>
              <input style={inp} value={form[k]||''} onChange={e=>set(k,e.target.value)} />
            </div>
          ))}
        </div>
        <div style={{marginTop:14}}>
          <label style={label}>Copyright Text</label>
          <input style={inp} value={form.copyright||''} onChange={e=>set('copyright',e.target.value)} />
        </div>
      </div>

      <ArraySection title="Footer — Course Links" field="courses" />
      <ArraySection title="Footer — Quick Links" field="quickLinks" />
      <ArraySection title="Footer — Accreditation" field="accreditation" />

      <button style={btn('primary')} onClick={save} disabled={saving}>{saving?'Saving…':'Save Footer'}</button>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// MAIN CMS PAGE
// ══════════════════════════════════════════════════════════════════
const TABS = [
  { id:'about',   label:'About' },
  { id:'contact', label:'Contact' },
  { id:'faq',     label:'FAQ' },
  { id:'footer',  label:'Footer' },
]

export default function CMS() {
  const [activeTab, setActiveTab] = useState('about')
  const [toast, setToast] = useState({ msg:'', type:'' })

  const showToast = (msg, type='success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg:'', type:'' }), 3500)
  }

  return (
    <div style={{ fontFamily:'inherit', padding:'0 0 40px' }}>
      <Toast msg={toast.msg} type={toast.type} />

      {/* Header */}
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:700,color:'#0f172a',margin:0}}>CMS — Site Content</h1>
        <p style={{fontSize:13,color:'#64748b',marginTop:4}}>
          Manage About, Contact, FAQ and Footer content. Changes reflect live on the site.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{display:'flex',gap:0,borderBottom:'2px solid #e2e8f0',marginBottom:28}}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
            padding:'10px 24px', border:'none', background:'transparent',
            fontSize:14, fontWeight: activeTab===t.id ? 700 : 500,
            color: activeTab===t.id ? '#4f46e5' : '#64748b',
            borderBottom: activeTab===t.id ? '2.5px solid #4f46e5' : '2.5px solid transparent',
            marginBottom:-2, cursor:'pointer', transition:'all 0.14s', fontFamily:'inherit',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab==='about'   && <AboutTab   toast={showToast} />}
      {activeTab==='contact' && <ContactTab toast={showToast} />}
      {activeTab==='faq'     && <FaqTab     toast={showToast} />}
      {activeTab==='footer'  && <FooterTab  toast={showToast} />}
    </div>
  )
}