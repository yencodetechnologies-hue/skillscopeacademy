const API_URL = "https://api.octosofttechnologies.in"; // ✅ Production API URL

async function loadForm() {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id")
    if (!id) return

    try {
        const res = await fetch(`${API_URL}/api/enrollment-form/${id}`)
        const data = await res.json()
        fillForm(data)
    } catch (err) {
        console.error("Failed to load form:", err)
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const shouldPrint = new URLSearchParams(window.location.search).get("print") === "true"
    
    loadForm().then(() => {
        if (shouldPrint) {
            // Images load ஆக கொஞ்சம் wait பண்ணு
            setTimeout(() => window.print(), 1200)
        }
    })
})

function fillForm(data) {
    const p = data.personalDetails || {}
    const addr = data.address?.residential || {}
    const postal = data.address?.postal || {}
    const emg = data.emergencyContact || {}
    const usi = data.usi || {}                        // ✅ data.usiDetails → data.usi
    const edu = data.education || {}                  // ✅ data.educationDetails → data.education
    const emp = data.employment?.details || {}        // ✅ NEW
    const lang = data.language || {}                  // ✅ NEW
    const qual = data.qualifications || {}            // ✅ NEW
    const needs = data.specialNeeds || {}             // ✅ NEW

    // ── DOB fix ──────────────────────────────────────────
    let dobDMY = ""
    if (p.dob) {                                      // ✅ p.dateOfBirth → p.dob
        const d = new Date(p.dob)
        dobDMY = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
    }

    // ── TEXT FIELDS ───────────────────────────────────────
    const fields = {
        surname: p.surname,
        givenName: p.givenName,
        middleName: p.middleName,
        preferredName: p.preferredName,
        dobDMY,
        email: p.email,
        homePhone: p.homePhone,
        workPhone: p.workPhone,
        mobilePhone: p.mobilePhone,
        resAddress: addr.address,
        resSuburb: addr.suburb,
        resState: addr.state,
        resPostcode: addr.postcode,
        postalAddress: postal.address,
        postalSuburb: postal.suburb,
        postalState: postal.state,
        postalPostcode: postal.postcode,
        emgName: emg.name,
        emgRelation: emg.relationship,
        emgContact: emg.contactNumber,
        p3EmployerName: emp.employerName,             // ✅ fixed
        p3SupervisorName: emp.supervisorName,         // ✅ NEW
        p3EmployerAddress: emp.address,               // ✅ NEW
        p3EmployerEmail: emp.email,                   // ✅ fixed
        p3EmployerPhone: emp.phone,                   // ✅ fixed
        p13StudentName: data.studentName,             // ✅ fixed
    }

    Object.entries(fields).forEach(([key, value]) => {
        document.querySelectorAll(`[data-field="${key}"]`).forEach(el => {
            el.textContent = value || ""
        })
    })

    // ── DATA-LINE FIELDS ──────────────────────────────────
    const lines = {
        usiApplyName: usi.staAuthoriseName || "",     // ✅ fixed
        townCityBirth: usi.staTownOfBirth || "",      // ✅ fixed
        p3YearCompleted: edu.yearCompleted || "",      // ✅ NEW
        p3SchoolName: edu.schoolName || "",            // ✅ NEW
        p3SchoolState: edu.schoolState || "",          // ✅ NEW
        p3SchoolPostcode: edu.schoolPostcode || "",    // ✅ NEW
        p3SchoolCountry: edu.schoolCountry || "",      // ✅ NEW
        p4ReasonOther: data.trainingReasonOther || "", // ✅ NEW
        p4SpecialOther: needs.other || "",             // ✅ NEW
        p4CountryBirthOther: lang.countryOfBirth !== "Australia" ? lang.countryOfBirth : "",
        p4LangHomeOther: lang.otherLanguage || "",     // ✅ NEW
        p13StudentName: data.studentName || "",        // ✅ fixed
        p13StudentDate: data.declarationDate
            ? new Date(data.declarationDate).toLocaleDateString("en-AU")
            : new Date().toLocaleDateString("en-AU"),
    }

    Object.entries(lines).forEach(([key, value]) => {
        document.querySelectorAll(`[data-line="${key}"] .fillVal`).forEach(el => {
            el.textContent = value || ""
        })
    })

    // ── CHECKBOXES ────────────────────────────────────────

    // Education level map
    const priorEduMap = {
        "12": "12",
        "11": "11",
        "10": "10",
        "09": "09",
        "08": "08",
        "never": "02"
    }

    // Training reason map
    const reasonMap = {
        "get-job": "01",
        "promotion": "05",
        "extra-skills": "07",
        "entry-course": "08",
        "personal-dev": "12",
        "other": "11",
    }

    // Employment status map
    const empMap = {
        "full-time": "01",
        "part-time": "02",
        "self-employed": "03",
        "casual": "05",
        "unemployed-seeking": "06",
        "not-employed": "08",
    }

    // Qualification type map
    const qualMap = {
        "Bachelor Degree or Higher": "008",
        "Advanced Diploma / Associate Degree": "410",
        "Diploma": "420",
        "Certificate IV": "511",
        "Certificate III": "514",
        "Certificate II": "521",
        "Certificate I": "524",
        "Other / Overseas": "990",
    }

    // Disability type map
    const disabilityMap = {
        "Hearing / deafness": "11",
        "Physical": "12",
        "Intellectual": "13",
        "Learning": "14",
        "Mental illness": "15",
        "Acquired brain impairment": "16",
        "Vision": "17",
        "Medical condition": "18",
    }

    const checks = {
        title: p.title,
        gender: p.gender,
        emgConsent: emg.consent ? "Yes" : "No",
        usiPermission: usi.permission ? "true" : "",
        usiApplyConsent: usi.staConsent ? "true" : "",
        priorEdu: priorEduMap[edu.highestLevel] || "", // ✅ fixed map
        empStatus: empMap[data.employment?.status] || "",  // ✅ fixed
        qualHave: qual.hasQualification ? "Yes" : "No",   // ✅ NEW
        reasonTrain: reasonMap[data.trainingReason] || "", // ✅ fixed
        specialNeedsYN: needs.hasDisability ? "Yes" : "No", // ✅ NEW
        countryBirth: lang.countryOfBirth === "Australia" ? "Australia" : "Other", // ✅ fixed
        langHome: lang.speaksOtherLanguage === "yes" ? "Other" : "EnglishOnly",    // ✅ fixed
        atsi: (() => {                                // ✅ NEW - indigenous status map
            const s = lang.indigenousStatus || ""
            if (s.includes("Both")) return "Both"
            if (s.includes("Torres")) return "Torres"
            if (s.includes("Aboriginal")) return "Aboriginal"
            return "No"
        })(),
    }

    Object.entries(checks).forEach(([checkName, value]) => {
    document.querySelectorAll(`[data-check="${checkName}"]`).forEach(el => {
        el.textContent = el.dataset.value === value ? "✓" : ""
        el.style.color = el.dataset.value === value ? "red" : ""  // ✅ red tick
        el.style.fontWeight = "bold"
    })
})

    // ── QUALIFICATION TYPES (multiple checkboxes) ─────────
    const qualTypes = qual.types || []
    qualTypes.forEach(type => {
    const code = qualMap[type]
    if (!code) return
    document.querySelectorAll(`[data-check="qualType"][data-value="${code}"]`).forEach(el => {
        el.textContent = "✓"
        el.style.color = "red"      // ✅
        el.style.fontWeight = "bold"
    })
})

    // ── DISABILITY TYPES (multiple checkboxes) ────────────
    const disTypes = needs.types || []
    disTypes.forEach(type => {
        const code = disabilityMap[type]
        if (!code) return
        document.querySelectorAll(`[data-check="specialNeedType"][data-value="${code}"]`).forEach(el => {
            el.textContent = "✓"
            el.style.color = "red"      // ✅
            el.style.fontWeight = "bold"
        })
    })

    // ── USI BOXES ─────────────────────────────────────────
    const usiNum = usi.number || ""                   // ✅ usi.usiNumber → usi.number
    const usiBoxes = document.querySelectorAll("#usiBoxes span:not(:first-child)")
    usiBoxes.forEach((box, i) => {
        box.textContent = usiNum[i] || ""
    })

    // ── SIGNATURE ─────────────────────────────────────────
    if (data.signatureUrl) {                          // ✅ fixed
        const sigLine = document.querySelector(`[data-line="p13StudentSignature"] .fillVal`)
        if (sigLine) {
            const img = document.createElement("img")
            img.src = data.signatureUrl
            img.style.height = "40px"
            img.style.display = "block"
            sigLine.appendChild(img)
        }
    }

    // ── PHOTOS ────────────────────────────────────────────
    const primaryId = document.querySelector('[data-photo="primaryId"]')
    if (primaryId && data.idDocumentUrl) {            // ✅ NEW
        primaryId.innerHTML = `<img src="${data.idDocumentUrl}" style="width:100%;height:100%;object-fit:contain;" />`
    }

    const secondaryId = document.querySelector('[data-photo="secondaryId"]')
    if (secondaryId && data.photoDocumentUrl) {       // ✅ NEW
        secondaryId.innerHTML = `<img src="${data.photoDocumentUrl}" style="width:100%;height:100%;object-fit:contain;" />`
    }

    // ── QUALIFICATION CERTIFICATES APPENDIX ───────────────
    // Section 3 ல upload பண்ண qualification evidence files ஐ
    // print output ல appendix pages ஆ render பண்ணும்.
    renderQualificationCertificates(qual)
}

// ── HELPERS ────────────────────────────────────────────────
function escapeHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

function isPdfUrl(url) {
    if (!url) return false
    try {
        const clean = url.split("?")[0].split("#")[0].toLowerCase()
        return clean.endsWith(".pdf")
    } catch { return false }
}

// Build one ".photoIdCard" element identical in style to the
// "Primary Photo ID" / "Photo" cards in the PHOTO AND ID CARD section,
// so qualification certificates inherit the same 35mm bordered look.
function buildQualCertCard({ level, url }) {
    const safeLevel = escapeHtml(level || "Qualification")
    const safeUrl   = escapeHtml(url   || "")

    const inner = isPdfUrl(url)
        ? `<a href="${safeUrl}" target="_blank" rel="noopener" class="photoIdPlaceholder" style="font-style:normal;color:#0000cc;">PDF — click to view</a>`
        : `<img src="${safeUrl}" alt="${safeLevel} certificate" />`

    return `
        <div class="photoIdCard">
            <div class="fw-bold p2BlueText mb-2">${safeLevel}</div>
            <div class="photoIdContainer">${inner}</div>
        </div>
    `
}

function renderQualificationCertificates(qual) {
    const inlineSection = document.getElementById("qualCertSection")
    const inlineTable   = document.getElementById("qualCertTable")
    const overflow      = document.getElementById("qualCertOverflow")
    if (!inlineSection || !overflow) return

    inlineSection.innerHTML = ""
    overflow.innerHTML = ""

    // Build a deduped list of {level, url} from both the new
    // (evidenceUrls[]) and legacy (evidenceUrl) fields.
    const items = []
    const seen = new Set()

    const list = Array.isArray(qual?.evidenceUrls) ? qual.evidenceUrls : []
    list.forEach(item => {
        if (item && item.url && !seen.has(item.url)) {
            seen.add(item.url)
            items.push({ level: item.level || "Qualification", url: item.url })
        }
    })

    if (qual?.evidenceUrl && !seen.has(qual.evidenceUrl)) {
        seen.add(qual.evidenceUrl)
        items.push({ level: "Qualification Evidence", url: qual.evidenceUrl })
    }

    // No certificates → keep the inline table hidden, leave page 14 untouched.
    if (items.length === 0) {
        if (inlineTable) inlineTable.style.display = "none"
        return
    }

    if (inlineTable) inlineTable.style.display = ""

    // Page 14 already contains the PHOTO AND ID CARD section above us, plus
    // payment + application submission blocks, so we limit the inline section
    // to a small number of cards (2 rows of 2 = 4) before spilling onto a
    // dedicated overflow page that uses the same compact layout.
    const INLINE_MAX = 4   // 2 rows × 2 cards
    const PER_PAGE   = 6   // 3 rows × 2 cards on each overflow page

    const inlineItems   = items.slice(0, INLINE_MAX)
    const overflowItems = items.slice(INLINE_MAX)

    inlineSection.innerHTML = inlineItems.map(buildQualCertCard).join("")

    if (overflowItems.length === 0) return

    const overflowPages = Math.ceil(overflowItems.length / PER_PAGE)
    for (let p = 0; p < overflowPages; p++) {
        const chunk = overflowItems.slice(p * PER_PAGE, (p + 1) * PER_PAGE)
        const suffix = String.fromCharCode(97 + p) // a, b, c, ...

        const sheet = document.createElement("div")
        sheet.className = "sheet"
        sheet.id = `qualCertOverflow${suffix}`
        sheet.innerHTML = `
            <div class="row g-0 align-items-start mb-2">
                <div class="col-3">
                    <img class="sta-logo" src="./assets/staLogo.png" alt="STA logo">
                </div>
                <div class="col-6 text-center">
                    <div class="fw-black sta-title">SAFETY TRAINING ACADEMY</div>
                    <div class="fw-black sta-subtitle">ENROLMENT FORM</div>
                    <div class="fw-black sta-rto">RTO : 45234</div>
                </div>
                <div class="col-3"></div>
            </div>

            <table class="sta-table mb-3">
                <tr>
                    <td class="sta-bar">QUALIFICATION CERTIFICATES (Section 3 evidence) — continued</td>
                </tr>
                <tr>
                    <td class="p7Body">
                        <div class="photoIdSection qualCertOverflowSection">
                            ${chunk.map(buildQualCertCard).join("")}
                        </div>
                    </td>
                </tr>
            </table>

            <div class="footerCompany">
                Australian International Education and Training Pty Ltd Trading as Safety Training Academy<br/>
                14- 16 Marjorie Street Sefton NSW 2162 &nbsp;--&nbsp; Ph: 1300 976 097
            </div>
            <div class="footerHr"></div>
            <div class="footerLine">
                <div>Form 36.</div>
                <div>Page 14${suffix} of 14</div>
                <div>230802</div>
            </div>
        `
        overflow.appendChild(sheet)
    }
}
