import { useEffect, useMemo, useRef, useState } from "react"
import "./VocStep3.css"
import { API_URL } from "../../data/service"

function luhnCheck(value) {
    const digits = value.replace(/\D/g, "")
    if (digits.length < 13 || digits.length > 19) return false
    let sum = 0, isEven = false
    for (let i = digits.length - 1; i >= 0; i--) {
        let d = parseInt(digits[i], 10)
        if (isEven) { d *= 2; if (d > 9) d -= 9 }
        sum += d
        isEven = !isEven
    }
    return sum % 10 === 0
}

const MONTHS = ["01","02","03","04","05","06","07","08","09","10","11","12"]
const YEARS = Array.from({ length: 12 }, (_, i) => String(new Date().getFullYear() + i).slice(-2))

function VocStep3({ details = {}, courses, onBack, onComplete }) {

    const total = courses.reduce((sum, c) => sum + (Number(c.price) || 150), 0)

    const [method, setMethod] = useState("card") // "card" | "bank"

    const [card, setCard] = useState({ name: "", number: "", month: "", year: "", cvv: "" })
    const setC = (k, v) => setCard(p => ({ ...p, [k]: v }))

    const [bank, setBank] = useState({ refId: "", proof: null })
    const setB = (k, v) => setBank(p => ({ ...p, [k]: v }))

    // True when the uploaded proof is an image (jpg/png/webp/gif/etc.).
    const isImageProof = useMemo(
        () => !!(bank.proof && bank.proof.type && bank.proof.type.startsWith("image/")),
        [bank.proof]
    )

    // Preview URL for the uploaded image. Revoked on change/unmount to avoid
    // memory leaks (object URLs stay alive until you release them explicitly).
    const [previewUrl, setPreviewUrl] = useState("")
    useEffect(() => {
        if (!isImageProof) { setPreviewUrl(""); return }
        const url = URL.createObjectURL(bank.proof)
        setPreviewUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [bank.proof, isImageProof])

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const processingRef = useRef(false)

    const formatCard = (val) => {
        return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()
    }

    const handleSubmit = async () => {
        if (processingRef.current) return
        setError("")

        if (method === "card") {
            if (!card.name || !card.number || !card.month || !card.year || !card.cvv) {
                setError("Please fill in all card details.")
                return
            }
            const digits = card.number.replace(/\D/g, "")
            if (digits.length < 13 || digits.length > 19) {
                setError("Card number must be 13–19 digits.")
                return
            }
            if (!luhnCheck(card.number)) {
                setError("Invalid card number. Please check and try again.")
                return
            }
            if (!/^\d{3,4}$/.test(card.cvv)) {
                setError("CVV must be 3 or 4 digits.")
                return
            }
        } else {
            if (!bank.refId.trim()) {
                setError("Please enter your Transaction / Reference ID.")
                return
            }
            if (!bank.proof) {
                setError("Please upload your payment receipt.")
                return
            }
        }

        processingRef.current = true
        try {
            setSubmitting(true)

            let ewayTransactionId = ""

            // ── Step 1: charge card via eWay (same endpoint as main booking) ──
            if (method === "card") {
                let payRes
                try {
                    payRes = await fetch(`${API_URL}/api/payment/pay`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            cardName:    card.name,
                            cardNumber:  card.number.replace(/\s/g, ""),
                            expiryMonth: card.month,
                            expiryYear:  card.year,
                            cvv:         card.cvv,
                            amount:      total,
                            email:       details.email,
                            name:        `${details.firstName} ${details.lastName}`.trim(),
                            phone:       details.phone,
                            userId:      details.phone,
                            description: `VOC Assessment Payment`,
                        }),
                    })
                } catch {
                    setError("Network error. Please check your connection and try again.")
                    return
                }

                const payResult = await payRes.json().catch(() => ({}))

                if (!payRes.ok || !payResult.success) {
                    setError(payResult.message || "Your card was declined. Please check your card details or try a different card.")
                    return
                }

                // Prefer the REAL gateway ID for emails and admin tracking.
                ewayTransactionId = (payResult.gatewayTransactionId !== undefined && payResult.gatewayTransactionId !== "")
                    ? String(payResult.gatewayTransactionId)
                    : (payResult.transactionId || "")

                if (!ewayTransactionId) {
                    setError("Payment processing error. Please try again.")
                    return
                }
            }

            // ── Step 2: submit VOC record ──
            const fd = new FormData()
            fd.append("firstName",     details.firstName     || "")
            fd.append("lastName",      details.lastName      || "")
            fd.append("email",         details.email         || "")
            fd.append("phone",         details.phone         || "")
            fd.append("studentId",     details.studentId     || "")
            fd.append("streetAddress", details.streetAddress || "")
            fd.append("city",          details.city          || "")
            fd.append("state",         details.state         || "")
            fd.append("postcode",      details.postcode      || "")
            fd.append("courses",       JSON.stringify(courses))
            fd.append("paymentMethod", method)

            if (method === "card") {
                fd.append("card", JSON.stringify({
                    name:        card.name,
                    last4:       card.number.replace(/\s/g, "").slice(-4),
                    expiryMonth: card.month,
                    expiryYear:  card.year,
                }))
                fd.append("ewayTransactionId", ewayTransactionId)
            } else {
                fd.append("bank",  JSON.stringify({ refId: bank.refId.trim() }))
                fd.append("proof", bank.proof)
            }

            const res = await fetch(`${API_URL}/api/voc`, { method: "POST", body: fd })
            if (!res.ok) {
                const payload = await res.json().catch(() => ({}))
                throw new Error(payload.error || "Submission failed.")
            }
            onComplete()
        } catch (err) {
            setError(err.message || "Submission failed. Please try again.")
        } finally {
            processingRef.current = false
            setSubmitting(false)
        }
    }

    return (
        <div className="v3-wrap">

            {/* Dark header */}
            <div className="v3-header">
                <h2 className="v3-header-title">Secure Payment</h2>
                <p className="v3-header-sub">Choose your preferred payment method</p>
            </div>

            <div className="v3-body">

                {/* Payment method cards */}
                <div
                    className={`v3-method-card ${method === "card" ? "v3-method-active" : ""}`}
                    onClick={() => setMethod("card")}
                >
                    <div className="v3-method-left">
                        <span className="v3-method-icon">💳</span>
                        <div>
                            <p className="v3-method-title">Credit / Debit Card</p>
                            <p className="v3-method-sub">Pay securely with card</p>
                        </div>
                    </div>
                    <div className={`v3-radio-dot ${method === "card" ? "v3-radio-active" : ""}`} />
                </div>

                <div
                    className={`v3-method-card ${method === "bank" ? "v3-method-active" : ""}`}
                    onClick={() => setMethod("bank")}
                >
                    <div className="v3-method-left">
                        <span className="v3-method-icon">🏦</span>
                        <div>
                            <p className="v3-method-title">Bank Transfer</p>
                            <p className="v3-method-sub">Upload proof of payment</p>
                        </div>
                    </div>
                    <div className={`v3-radio-dot ${method === "bank" ? "v3-radio-active" : ""}`} />
                </div>

                {/* ── CARD DETAILS ── */}
                {method === "card" && (
                    <div className="v3-details-box">
                        <div className="v3-details-header">
                            <span>🔒</span>
                            <span className="v3-details-title">CARD DETAILS — Encrypted &amp; Secure</span>
                        </div>

                        <div className="v3-field">
                            <label className="v3-label">NAME ON CARD *</label>
                            <input className="v3-input" placeholder="FULL NAME AS ON CARD" value={card.name} onChange={e => setC("name", e.target.value)} />
                        </div>

                        <div className="v3-field">
                            <label className="v3-label">CARD NUMBER *</label>
                            <input className="v3-input" placeholder="4111 1111 1111 1111" value={card.number} onChange={e => setC("number", formatCard(e.target.value))} />
                        </div>

                        <div className="v3-field">
                            <label className="v3-label">MONTH *</label>
                            <div className="v3-select-wrap">
                                <select className="v3-select" value={card.month} onChange={e => setC("month", e.target.value)}>
                                    <option value="">MM</option>
                                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                                </select>
                                <span className="v3-chevron">▾</span>
                            </div>
                        </div>

                        <div className="v3-field">
                            <label className="v3-label">YEAR *</label>
                            <div className="v3-select-wrap">
                                <select className="v3-select" value={card.year} onChange={e => setC("year", e.target.value)}>
                                    <option value="">YY</option>
                                    {YEARS.map(y => <option key={y}>{y}</option>)}
                                </select>
                                <span className="v3-chevron">▾</span>
                            </div>
                        </div>

                        <div className="v3-field">
                            <label className="v3-label">CVV *</label>
                            <div className="v3-cvv-wrap">
                                <input className="v3-input v3-cvv-input" placeholder="···" maxLength={4} value={card.cvv} onChange={e => setC("cvv", e.target.value.replace(/\D/g, ""))} />
                                <span className="v3-lock">🔒</span>
                            </div>
                        </div>

                        <p className="v3-accept-text">
                            We accept:&nbsp;
                            <span className="v3-visa">VISA</span>
                            <span className="v3-mc">MC</span>
                        </p>
                    </div>
                )}

                {/* ── BANK TRANSFER ── */}
                {method === "bank" && (
                    <div className="v3-details-box">
                        <div className="v3-details-header">
                            <span>ℹ️</span>
                            <span className="v3-details-title">BANK TRANSFER INSTRUCTIONS</span>
                        </div>

                        <div className="v3-bank-table">
                            <p className="v3-bank-transfer-heading">TRANSFER ${total.toFixed(2)} TO:</p>
                            <div className="v3-bank-row">
                                <span>Bank:</span><strong>Commonwealth Bank</strong>
                            </div>
                            <div className="v3-bank-row">
                                <span>Account Name:</span><strong>AIET College</strong>
                            </div>
                            <div className="v3-bank-row">
                                <span>BSB:</span><strong>062 141</strong>
                            </div>
                            <div className="v3-bank-row">
                                <span>Account Number:</span><strong>10490235</strong>
                            </div>
                        </div>

                        <p className="v3-bank-ref-note">
                            Use <strong>your name + date</strong> as your payment reference.
                        </p>

                        <div className="v3-steps-box">
                            <p className="v3-steps-title">STEPS:</p>
                            <ol className="v3-steps-list">
                                <li>Make the bank transfer using the details above</li>
                                <li>Save your receipt/screenshot</li>
                                <li>Enter your transaction/reference ID below</li>
                                <li>Upload your payment proof</li>
                            </ol>
                        </div>

                        <div className="v3-field">
                            <label className="v3-label">TRANSACTION / REFERENCE ID *</label>
                            <input
                                className="v3-input v3-ref-input"
                                placeholder="ENTER YOUR TRANSACTION / REFERENCE ID"
                                value={bank.refId}
                                onChange={e => setB("refId", e.target.value)}
                            />
                            <p className="v3-field-hint">Found on your bank receipt or online banking confirmation</p>
                        </div>

                        <div className="v3-field">
                            <label className="v3-label">PAYMENT RECEIPT / PROOF *</label>
                            {bank.proof ? (
                                <div className="v3-file-preview">
                                    {isImageProof && previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Payment receipt preview"
                                            className="v3-file-thumb"
                                        />
                                    ) : (
                                        <span className="v3-file-icon">📄</span>
                                    )}
                                    <div className="v3-file-meta">
                                        <p className="v3-file-name">{bank.proof.name}</p>
                                        <p className="v3-file-size">{(bank.proof.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <button className="v3-change-btn" onClick={() => setB("proof", null)}>Change File</button>
                                </div>
                            ) : (
                                <div className="v3-upload-zone" onClick={() => document.getElementById("v3-proof-input").click()}>
                                    <span className="v3-upload-arrow">↑</span>
                                    <p className="v3-upload-text">Click to upload payment receipt</p>
                                    <p className="v3-upload-hint">JPG, PNG or PDF — max 5MB</p>
                                </div>
                            )}
                            <input
                                id="v3-proof-input"
                                type="file"
                                style={{ display: "none" }}
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={e => setB("proof", e.target.files[0])}
                            />
                            <p className="v3-field-hint">* Your submission will be processed once we confirm receipt of funds.</p>
                        </div>
                    </div>
                )}

            </div>

            {/* Dark footer */}
            <div className="v3-footer">
                <div className="v3-total-block">
                    <p className="v3-total-label">
                        TOTAL PAYABLE &nbsp;
                        <span className={method === "card" ? "v3-badge-card" : "v3-badge-bank"}>
                            {method === "card" ? "CREDIT CARD" : "BANK TRANSFER"}
                        </span>
                    </p>
                    <p className="v3-total-amount">${total.toFixed(2)}</p>
                    <p className="v3-total-sub">{courses.length} COURSE{courses.length !== 1 ? "S" : ""} SELECTED</p>
                </div>
                <div className="v3-footer-btns">
                    <button className="v3-back-btn" onClick={onBack} disabled={submitting}>‹ &nbsp; BACK</button>
                    <button className="v3-complete-btn" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? "SUBMITTING..." : "COMPLETE REGISTRATION"}
                    </button>
                </div>
                {error && (
                    <p style={{ marginTop: 8, color: "#fee2e2", fontSize: 13, textAlign: "right" }}>
                        ⚠ {error}
                    </p>
                )}
            </div>

        </div>
    )
}

export default VocStep3