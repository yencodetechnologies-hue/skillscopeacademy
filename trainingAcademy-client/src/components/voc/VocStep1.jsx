import "./VocStep1.css"

const STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]

function VocStep1({ data, setData, onNext }) {

    const set = (k, v) => setData(p => ({ ...p, [k]: v }))

    const handleNext = () => {
        const req = ["firstName", "lastName", "email", "phone", "streetAddress", "city", "state", "postcode"]
        for (const f of req) {
            if (!data[f]?.trim()) {
                alert("Please fill in all required fields.")
                return
            }
        }
        onNext()
    }

    return (
        <div className="v1-wrap">

            {/* Dark header */}
            <div className="v1-header">
                <h2 className="v1-header-title">VOC Renewal Form</h2>
                <p className="v1-header-sub">Personal &amp; Contact Information</p>
            </div>

            {/* Form body */}
            <div className="v1-body">

                {/* First / Last */}
                <div className="v1-row-2">
                    <div className="v1-field">
                        <label className="v1-label">FIRST NAME</label>
                        <div className="v1-input-wrap">
                            <span className="v1-icon">👤</span>
                            <input className="v1-input" placeholder="John" value={data.firstName || ""} onChange={e => set("firstName", e.target.value)} />
                        </div>
                    </div>
                    <div className="v1-field">
                        <label className="v1-label">LAST NAME</label>
                        <div className="v1-input-wrap">
                            <span className="v1-icon">👤</span>
                            <input className="v1-input" placeholder="Smith" value={data.lastName || ""} onChange={e => set("lastName", e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Email */}
                <div className="v1-field">
                    <label className="v1-label">EMAIL ADDRESS</label>
                    <div className="v1-input-wrap">
                        <span className="v1-icon">✉️</span>
                        <input className="v1-input" type="email" placeholder="you@example.com" value={data.email || ""} onChange={e => set("email", e.target.value)} />
                    </div>
                </div>

                {/* Phone / Student ID */}
                <div className="v1-row-2">
                    <div className="v1-field">
                        <label className="v1-label">PHONE NUMBER</label>
                        <div className="v1-input-wrap">
                            <span className="v1-icon">📞</span>
                            <input className="v1-input" placeholder="0400 000 000" value={data.phone || ""} onChange={e => set("phone", e.target.value)} />
                        </div>
                    </div>
                    <div className="v1-field">
                        <label className="v1-label">STUDENT ID / LICENSE #</label>
                        <div className="v1-input-wrap">
                            <span className="v1-icon">🛡️</span>
                            <input className="v1-input" placeholder="AUS-123456" value={data.studentId || ""} onChange={e => set("studentId", e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Street Address */}
                <div className="v1-field">
                    <label className="v1-label">STREET ADDRESS</label>
                    <div className="v1-input-wrap">
                        <span className="v1-icon">📍</span>
                        <input className="v1-input" placeholder="123 Example St" value={data.streetAddress || ""} onChange={e => set("streetAddress", e.target.value)} />
                    </div>
                </div>

                {/* City / State / Postcode */}
                <div className="v1-row-3">
                    <div className="v1-field">
                        <label className="v1-label">CITY/SUBURB</label>
                        <div className="v1-input-wrap">
                            <input className="v1-input" value={data.city || ""} onChange={e => set("city", e.target.value)} />
                        </div>
                    </div>
                    <div className="v1-field">
                        <label className="v1-label">STATE</label>
                        <div className="v1-input-wrap v1-select-wrap">
                            <select className="v1-select" value={data.state || ""} onChange={e => set("state", e.target.value)}>
                                <option value="">Select</option>
                                {STATES.map(s => <option key={s}>{s}</option>)}
                            </select>
                            <span className="v1-chevron">▾</span>
                        </div>
                    </div>
                    <div className="v1-field">
                        <label className="v1-label">POSTCODE</label>
                        <div className="v1-input-wrap">
                            <input className="v1-input" value={data.postcode || ""} onChange={e => set("postcode", e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <button className="v1-cta-btn" onClick={handleNext}>
                    SELECT COURSES &nbsp;›
                </button>

            </div>
        </div>
    )
}

export default VocStep1