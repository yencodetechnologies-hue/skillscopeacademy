import { useEffect } from "react"
import { useLocation } from "react-router-dom"

// Resets the page to the top on:
//   1. Route changes (SPA navigation) — covered by the [pathname] effect.
//   2. Hard refreshes — covered by setting history.scrollRestoration = "manual"
//      so the browser stops auto-restoring the previous scroll position.
//
// The hash check (`#section`) lets anchor links keep working — e.g.
// /about#contact will still jump to that section instead of being forced
// back to the top.
function ScrollToTop() {
    const { pathname, hash } = useLocation()

    useEffect(() => {
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual"
        }
    }, [])

    useEffect(() => {
        if (hash) return
        window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    }, [pathname, hash])

    return null
}

export default ScrollToTop