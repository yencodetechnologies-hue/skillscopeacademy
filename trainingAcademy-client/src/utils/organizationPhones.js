/** Organisation contact lines — display as 4-3-3 (e.g. 1300 976 097, 0483 878 887). */

export function formatAuPhoneDisplay(digits) {
    const d = String(digits).replace(/\D/g, "")
    if (d.length === 10) {
        return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`
    }
    return d
}

export const ORG_PHONE_1300 = {
    digits: "1300976097",
    display: formatAuPhoneDisplay("1300976097"),
    tel: "tel:1300976097",
    wa: "https://wa.me/611300976097",
}

export const ORG_PHONE_MOBILE = {
    digits: "0483878887",
    display: formatAuPhoneDisplay("0483878887"),
    tel: "tel:0483878887",
    wa: "https://wa.me/61483878887",
}
