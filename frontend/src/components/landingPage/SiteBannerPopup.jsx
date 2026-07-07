import { useEffect, useState } from "react"
import axios from "axios"
import { API_URL } from "../../data/service"
import { cdnImage } from "../../utils/cdnImage"
import "../../styles/SiteBannerPopup.css"

const DISMISS_KEY = "sta_site_banner_dismissed_ids"

function getDismissedIds() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function SiteBannerPopup() {
  const [banner, setBanner] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let alive = true

    const load = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/site-banner/public`)
        const list = res.data?.data
        if (!alive || !Array.isArray(list) || list.length === 0) return

        const dismissed = getDismissedIds()
        const next = list.find(
          (b) => b?.imageUrl?.trim() && !dismissed.includes(b._id)
        )
        if (!next) return

        setBanner(next)
        setVisible(true)
      } catch {
        /* silent */
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [visible])

  const dismiss = () => {
    if (banner?._id) {
      const dismissed = getDismissedIds()
      if (!dismissed.includes(banner._id)) {
        dismissed.push(banner._id)
        localStorage.setItem(DISMISS_KEY, JSON.stringify(dismissed))
      }
    }
    setVisible(false)
  }

  if (!visible || !banner?.imageUrl) return null

  return (
    <div
      className="sbp-backdrop"
      onClick={dismiss}
      role="presentation"
    >
      <div
        className="sbp-card"
        role="dialog"
        aria-modal="true"
        aria-label="Site announcement"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="sbp-close"
          onClick={dismiss}
          aria-label="Close"
        >
          <span className="sbp-close-icon" aria-hidden="true">
            ×
          </span>
        </button>

        <img
          className="sbp-image"
          src={cdnImage(banner.imageUrl, { w: 1200 })}
          srcSet={`${cdnImage(banner.imageUrl, { w: 480 })} 480w, ${cdnImage(banner.imageUrl, { w: 800 })} 800w, ${cdnImage(banner.imageUrl, { w: 1200 })} 1200w`}
          sizes="(max-width: 768px) 94vw, 70vw"
          alt=""
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  )
}
