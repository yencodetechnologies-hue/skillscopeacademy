import { API_URL } from "../data/service";

export async function openPdf(url) {
  if (!url) return;

  // Only sign Cloudinary URLs — local/other URLs open directly
  if (url.includes("res.cloudinary.com")) {
    try {
      const res = await fetch(
        `${API_URL}/api/files/pdf-url?url=${encodeURIComponent(url)}`
      );
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
        return;
      }
    } catch {
      // fall through to direct open
    }
  }

  window.open(url, "_blank");
}
