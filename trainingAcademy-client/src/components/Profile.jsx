import { useState, useEffect, useContext } from "react"
import "../styles/Profile.css"
import { API_URL } from "../data/service"
import { AuthContext } from "../context/AuthContext"

function Field({ label, value, fieldKey, type = "text", editing, form, onSet }) {
  return (
    <div className="sp-field">
      <label className="sp-label">{label}</label>
      {editing ? (
        type === "textarea" ? (
          <textarea
            className="sp-input sp-textarea"
            value={form[fieldKey] || ""}
            onChange={e => onSet(fieldKey, e.target.value)}
          />
        ) : (
          <input
            className="sp-input"
            type={type}
            value={form[fieldKey] || ""}
            onChange={e => onSet(fieldKey, e.target.value)}
          />
        )
      ) : (
        <div className="sp-value">{value || "—"}</div>
      )}
    </div>
  )
}

export default function Profile() {
  const { user, setUser } = useContext(AuthContext)
  const [profile, setProfile] = useState(null)
  const [enrollDoc, setEnrollDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const studentId = user?.id || user?._id || localStorage.getItem("studentId")

  // ── Fetch both APIs ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!studentId) {
      setError("Student ID not found. Please login again.")
      setLoading(false)
      return
    }

    const fetchAll = async () => {
      try {
        const [profileRes, enrollRes] = await Promise.all([
          fetch(`${API_URL}/api/student/profile/${studentId}`),
          fetch(`${API_URL}/api/enrollment-form?studentId=${studentId}`)
        ])

        const profileData = await profileRes.json()
        if (profileData.message) throw new Error(profileData.message)
        setProfile(profileData)

        let enroll = null
        if (enrollRes.ok) {
          const enrollArr = await enrollRes.json()
          if (Array.isArray(enrollArr) && enrollArr.length > 0) {
            enroll = enrollArr[0]
            setEnrollDoc(enroll)
          }
        }

        setForm(buildForm(profileData, enroll))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [studentId])

  // ── Flatten both API responses → flat form ─────────────────────────────────
  const buildForm = (p, e) => ({
    // Personal
    givenName: e?.personalDetails?.givenName || p?.name || "",
    surname: e?.personalDetails?.surname || "",
    middleName: e?.personalDetails?.middleName || "",
    preferredName: e?.personalDetails?.preferredName || "",
    dob: e?.personalDetails?.dob
      ? e.personalDetails.dob.split("T")[0]
      : (p?.dob || ""),
    gender: e?.personalDetails?.gender || "",
    email: e?.personalDetails?.email || p?.email || "",
    mobilePhone: e?.personalDetails?.mobilePhone || p?.phone || "",
    homePhone: e?.personalDetails?.homePhone || "",
    workPhone: e?.personalDetails?.workPhone || "",
    bio: p?.bio || "",

    // Address — all from enrollment form residential
    residentialAddress: e?.address?.residential?.address || "",
    suburb: e?.address?.residential?.suburb || "",
    state: e?.address?.residential?.state || "",
    postcode: e?.address?.residential?.postcode || "",

    // Emergency
    emergencyName: e?.emergencyContact?.name || "",
    emergencyRelationship: e?.emergencyContact?.relationship || "",
    emergencyPhone: e?.emergencyContact?.contactNumber || "",
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ── Save → enrollment form section 1 (same as EnrollmentRegister) ──────────
  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      // Build section 1 payload — exact same structure as EnrollmentRegister saveSectionToBackend(1)
      const payload = {
        studentId,
        section: 1,
        personalDetails: {
          title: form.title || enrollDoc?.personalDetails?.title || "",
          surname: form.surname,
          givenName: form.givenName,
          middleName: form.middleName,
          preferredName: form.preferredName,
          dob: form.dob,
          gender: form.gender,
          email: form.email,
          homePhone: form.homePhone,
          workPhone: form.workPhone,
          mobilePhone: form.mobilePhone,
        },
        address: {
          residential: {
            address: form.residentialAddress,
            suburb: form.suburb,
            state: form.state,
            postcode: form.postcode,
          },
          // keep existing postal as-is
          postal: {
            address: enrollDoc?.address?.postal?.address || "",
            suburb: enrollDoc?.address?.postal?.suburb || "",
            state: enrollDoc?.address?.postal?.state || "",
            postcode: enrollDoc?.address?.postal?.postcode || "",
          }
        },
        emergencyContact: {
          name: form.emergencyName,
          relationship: form.emergencyRelationship,
          contactNumber: form.emergencyPhone,
          consent: enrollDoc?.emergencyContact?.consent ?? false,
        }
      }

      const res = await fetch(`${API_URL}/api/enrollment-form/section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Save failed")

      // Refresh enrollment doc and student account (login email lives on StudentMain)
      const [refreshRes, profileRes] = await Promise.all([
        fetch(`${API_URL}/api/enrollment-form?studentId=${studentId}`),
        fetch(`${API_URL}/api/student/profile/${studentId}`),
      ])
      if (refreshRes.ok) {
        const arr = await refreshRes.json()
        if (arr.length > 0) setEnrollDoc(arr[0])
      }
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData)
        if (user) {
          const displayName = [form.givenName, form.surname].filter(Boolean).join(" ").trim()
          const updatedUser = {
            ...user,
            email: data.student?.email || form.email || user.email,
            phone: data.student?.phone || form.mobilePhone || user.phone,
            name: data.student?.name || displayName || user.name,
          }
          localStorage.setItem("user", JSON.stringify(updatedUser))
          setUser(updatedUser)
        }
      }

      setEditing(false)
      setSuccess("Profile updated successfully")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm(buildForm(profile, enrollDoc))
    setEditing(false)
    setError("")
  }

  if (loading) return <div className="sp-loading">Loading profile…</div>
  if (!profile && error) return <div className="sp-error-msg">{error}</div>

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-AU", {
      day: "numeric", month: "short", year: "numeric"
    })
    : "—"

  const p = profile
  const e = enrollDoc

  const displayName = [e?.personalDetails?.givenName, e?.personalDetails?.surname]
    .filter(Boolean).join(" ") || p?.name || "Student"
  const displayEmail = e?.personalDetails?.email || p?.email || "—"
  const displayPhone = e?.personalDetails?.mobilePhone || p?.phone || "—"
  const displayDob = e?.personalDetails?.dob
    ? new Date(e.personalDetails.dob).toLocaleDateString("en-AU")
    : "—"
  const displayGender = e?.personalDetails?.gender || "—"
  const displayPreferred = e?.personalDetails?.preferredName || "—"
  const displayStreet = e?.address?.residential?.address || "—"
  const displaySuburb = e?.address?.residential?.suburb || "—"
  const displayState = e?.address?.residential?.state || "—"
  const displayPostcode = e?.address?.residential?.postcode || "—"
  const displayEName = e?.emergencyContact?.name || "—"
  const displayERel = e?.emergencyContact?.relationship || "—"
  const displayEPhone = e?.emergencyContact?.contactNumber || "—"

  return (
    <div className="sp-page">

      <div className="sp-page-header">
        <div>
          <h1 className="sp-page-title">My Profile</h1>
          <p className="sp-page-sub">Manage your personal information and account settings</p>
        </div>
        <div className="sp-header-actions">
          {editing ? (
            <>
              <button className="sp-btn-save" onClick={handleSave} disabled={saving}>
                <i className="fa-regular fa-floppy-disk" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button className="sp-btn-cancel" onClick={handleCancel}>
                <i className="fa-solid fa-xmark" /> Cancel
              </button>
            </>
          ) : (
            <button className="sp-btn-edit" onClick={() => setEditing(true)}>
              <i className="fa-solid fa-pencil" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {success && <div className="sp-toast sp-toast-success">✓ {success}</div>}
      {error && <div className="sp-toast sp-toast-error">⚠ {error}</div>}

      <div className="sp-layout">

        {/* Left Card */}
        <div className="sp-card-wrap">
          <div className="sp-profile-card">
            <div className="sp-avatar-wrap">
              <div className="sp-avatar">
                {p?.profileImage ? (
                  <img src={p.profileImage} alt="Profile" className="sp-avatar-img" />
                ) : (
                  <i className="fa-solid fa-user" />
                )}
              </div>
            </div>
            <h2 className="sp-card-name">{displayName}</h2>
            <p className="sp-card-id">{p?.studentId || "—"}</p>
            <div className="sp-card-info">
              <div className="sp-card-row"><i className="fa-regular fa-envelope" /><span>{displayEmail}</span></div>
              <div className="sp-card-row"><i className="fa-solid fa-phone" /><span>{displayPhone}</span></div>
              <div className="sp-card-row"><i className="fa-regular fa-calendar" /><span>Joined {joinedDate}</span></div>
            </div>
          </div>
        </div>

        {/* Right Sections */}
        <div className="sp-sections">

          {/* Personal Information */}
          <div className="sp-section">
            <div className="sp-section-header">
              <h3>Personal Information</h3>
              <p>Your basic personal details</p>
            </div>
            <div className="sp-grid-2">
              <Field label="Given Name" value={e?.personalDetails?.givenName || p?.name} fieldKey="givenName"
                editing={editing} form={form} onSet={set} />
              <Field label="Surname" value={e?.personalDetails?.surname} fieldKey="surname"
                editing={editing} form={form} onSet={set} />
              <Field label="Preferred Name" value={displayPreferred} fieldKey="preferredName"
                editing={editing} form={form} onSet={set} />
              <Field label="Gender" value={displayGender} fieldKey="gender"
                editing={editing} form={form} onSet={set} />
              <Field label="Email Address" value={displayEmail} fieldKey="email" type="email"
                editing={editing} form={form} onSet={set} />
              <Field label="Mobile Phone" value={displayPhone} fieldKey="mobilePhone" type="tel"
                editing={editing} form={form} onSet={set} />
              <Field label="Date of Birth" value={displayDob} fieldKey="dob" type="date"
                editing={editing} form={form} onSet={set} />
              <Field label="Home Phone" value={e?.personalDetails?.homePhone || "—"} fieldKey="homePhone" type="tel"
                editing={editing} form={form} onSet={set} />
            </div>
            <div className="sp-grid-1">
              <Field label="Bio" value={p?.bio || "—"} fieldKey="bio" type="textarea"
                editing={editing} form={form} onSet={set} />
            </div>
          </div>

          {/* Address */}
          <div className="sp-section">
            <div className="sp-section-header">
              <h3>Address Information</h3>
              <p>Your residential address</p>
            </div>
            <div className="sp-grid-1">
              <Field label="Street Address" value={displayStreet} fieldKey="residentialAddress"
                editing={editing} form={form} onSet={set} />
            </div>
            <div className="sp-grid-3">
              <Field label="Suburb" value={displaySuburb} fieldKey="suburb"
                editing={editing} form={form} onSet={set} />
              <Field label="State" value={displayState} fieldKey="state"
                editing={editing} form={form} onSet={set} />
              <Field label="Postcode" value={displayPostcode} fieldKey="postcode"
                editing={editing} form={form} onSet={set} />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="sp-section">
            <div className="sp-section-header">
              <h3>Emergency Contact</h3>
              <p>Person to contact in case of emergency</p>
            </div>
            <div className="sp-grid-2">
              <Field label="Contact Name" value={displayEName} fieldKey="emergencyName"
                editing={editing} form={form} onSet={set} />
              <Field label="Relationship" value={displayERel} fieldKey="emergencyRelationship"
                editing={editing} form={form} onSet={set} />
              <Field label="Contact Phone" value={displayEPhone} fieldKey="emergencyPhone" type="tel"
                editing={editing} form={form} onSet={set} />
            </div>
          </div>

          {/* Enrollment Statistics */}
          <div className="sp-section">
            <div className="sp-section-header">
              <h3>Enrollment Statistics</h3>
              <p>Your learning journey at a glance</p>
            </div>
            <div className="sp-stats-grid">
              <div className="sp-stat-card sp-stat-purple">
                <span className="sp-stat-label">Total Courses</span>
                <span className="sp-stat-value">{p?.stats?.total ?? 0}</span>
              </div>
              <div className="sp-stat-card sp-stat-blue">
                <span className="sp-stat-label">Active</span>
                <span className="sp-stat-value">{p?.stats?.active ?? 0}</span>
              </div>
              <div className="sp-stat-card sp-stat-green">
                <span className="sp-stat-label">Completed</span>
                <span className="sp-stat-value">{p?.stats?.completed ?? 0}</span>
              </div>
              <div className="sp-stat-card sp-stat-orange">
                <span className="sp-stat-label">Certificates</span>
                <span className="sp-stat-value">{p?.stats?.certificates ?? 0}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}