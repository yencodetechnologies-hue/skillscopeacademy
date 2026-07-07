// Cloudinary URL transformer.
//
// Our backend stores raw Cloudinary URLs like:
//   https://res.cloudinary.com/<cloud>/image/upload/v123.../folder/file.jpg
//
// Without transformations Cloudinary serves the *original* upload — often
// 2–4 MB JPGs from a phone. By injecting the transformation segment we
// get on-the-fly resize + format negotiation + quality compression:
//
//   /upload/f_auto,q_auto,w_<width>/v123.../folder/file.jpg
//
//   • f_auto  → WebP/AVIF when the browser supports it (≈70% smaller)
//   • q_auto  → best quality/size tradeoff per image
//   • w_<n>   → resize to the slot width, never serve oversize bytes
//   • dpr_auto+ c_limit → respect retina, never upscale beyond the original
//
// Inputs that aren't Cloudinary URLs are returned unchanged so the same
// helper can be used everywhere safely (e.g. local /assets imports or
// any third-party image URL).

const CLOUDINARY_HOST = "res.cloudinary.com"
const UPLOAD_TOKEN    = "/upload/"

/**
 * @param {string} url        Original image URL.
 * @param {object} [opts]
 * @param {number} [opts.w]   Target width in CSS pixels (we add dpr_auto for retina).
 * @param {number} [opts.h]   Optional target height (paired with c_fill).
 * @param {string} [opts.crop] Crop mode (default "limit" — never upscale).
 * @returns {string}          Transformed URL, or the input URL unchanged.
 */
export function cdnImage(url, opts = {}) {
    if (!url || typeof url !== "string") return url
    if (!url.includes(CLOUDINARY_HOST))   return url

    const idx = url.indexOf(UPLOAD_TOKEN)
    if (idx === -1) return url

    // If the URL already has a transformation segment, leave it alone —
    // the admin (or another helper call) has already chosen one.
    const tail = url.slice(idx + UPLOAD_TOKEN.length)
    const firstSegment = tail.split("/")[0] || ""
    const looksTransformed =
        /^[a-z]_/.test(firstSegment) || // e.g. "f_auto", "w_800"
        firstSegment.includes(",")
    if (looksTransformed) return url

    const parts = ["f_auto", "q_auto"]
    if (opts.w) parts.push(`w_${Math.round(opts.w)}`)
    if (opts.h) parts.push(`h_${Math.round(opts.h)}`)
    parts.push(opts.crop ? `c_${opts.crop}` : "c_limit")
    parts.push("dpr_auto")

    return url.slice(0, idx + UPLOAD_TOKEN.length) + parts.join(",") + "/" + tail
}

export default cdnImage
