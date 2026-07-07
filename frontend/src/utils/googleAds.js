// Google Ads conversion + enhanced conversions (in-page code).
// IDs match GTM container GTM-P9KDNLPB (AW conversion tag).
const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID || "AW-449315365"
const PURCHASE_LABEL =
    import.meta.env.VITE_GOOGLE_ADS_PURCHASE_LABEL || "PtVoCOCLgKkcEKWEoNYB"

function ensureGtag() {
    window.dataLayer = window.dataLayer || []
    window.gtag =
        window.gtag ||
        function gtag() {
            window.dataLayer.push(arguments)
        }
}

export function initGoogleAds() {
    if (typeof window === "undefined" || !GOOGLE_ADS_ID) return

    ensureGtag()

    const src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`
    if (document.querySelector(`script[src="${src}"]`)) return

    const script = document.createElement("script")
    script.async = true
    script.src = src
    document.head.appendChild(script)
    window.gtag("js", new Date())
    window.gtag("config", GOOGLE_ADS_ID)
}

function parseName(fullName) {
    const trimmed = (fullName || "").trim()
    if (!trimmed) return { first_name: "", last_name: "" }
    const parts = trimmed.split(/\s+/)
    return {
        first_name: parts[0] || "",
        last_name: parts.slice(1).join(" ") || "",
    }
}

function normalizePhone(phone) {
    if (!phone) return ""
    let p = String(phone).replace(/[\s\-().]/g, "")
    if (p.startsWith("00")) p = "+" + p.slice(2)
    if (p.startsWith("0")) p = "+61" + p.slice(1)
    if (p.startsWith("61") && !p.startsWith("+")) p = "+" + p
    if (!p.startsWith("+") && /^\d{9,}$/.test(p)) p = "+61" + p
    return p
}

function buildUserData({ email, phone, name }) {
    const { first_name, last_name } = parseName(name)
    const userData = {}

    if (email) userData.email = String(email).trim().toLowerCase()

    const phone_number = normalizePhone(phone)
    if (phone_number) userData.phone_number = phone_number

    if (first_name || last_name) {
        userData.address = { first_name, last_name }
    }

    return userData
}

/**
 * Fires Google Ads purchase conversion with enhanced conversion user_data.
 * Also pushes a GTM-friendly purchase event (ecommerce.* keys).
 */
export function trackPurchaseConversion({
    email,
    phone,
    name,
    value,
    currency = "AUD",
    transactionId,
    courseName,
    courseId,
    paymentMethod,
    enrollmentType,
}) {
    if (typeof window === "undefined") return

    ensureGtag()

    const txId = transactionId || `enrol_${Date.now()}`
    const amount = parseFloat(value) || 0
    const sendTo = `${GOOGLE_ADS_ID}/${PURCHASE_LABEL}`
    const userData = buildUserData({ email, phone, name })
    const { first_name, last_name } = parseName(name)

    // In-page enhanced conversions (required by Google Ads alongside Automatic)
    if (Object.keys(userData).length > 0) {
        window.gtag("set", "user_data", userData)
    }

    window.gtag("event", "conversion", {
        send_to: sendTo,
        value: amount,
        currency,
        transaction_id: txId,
    })

    // GTM Google Ads tag reads ecommerce.* on the purchase event
    window.dataLayer.push({
        event: "purchase",
        enhanced_conversion_data: {
            email: userData.email,
            phone_number: userData.phone_number,
            first_name,
            last_name,
        },
        ecommerce: {
            transaction_id: txId,
            value: amount,
            currency,
            items: [
                {
                    item_id: courseId || "",
                    item_name: courseName || "",
                    quantity: 1,
                    price: amount,
                },
            ],
        },
        course_name: courseName || "",
        course_id: courseId || "",
        enrollment_type: enrollmentType || "individual",
        payment_method: paymentMethod || "",
    })
}
