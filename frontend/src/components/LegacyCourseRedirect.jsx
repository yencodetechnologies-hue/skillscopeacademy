import { useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"

// Old course URLs looked like /course/forklift-licence-65a1f2…  (24-char hex
// ObjectId tail). The new clean URL is just /course/forklift-licence.
// This shim spots the legacy tail and rewrites the URL in place so:
//   • Google's cached links keep resolving (302 effect via replace).
//   • Anyone who bookmarked the old URL lands on the new clean one.
// When the param has no legacy tail, the wrapper is a no-op and renders
// the child page as normal.
const OBJECT_ID_RE = /^([a-z0-9-]+)-([a-f0-9]{24})$/i

function LegacyCourseRedirect({ children, bookNow = false }) {
    const navigate = useNavigate()
    const { slug } = useParams()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        if (!slug) return
        const match = slug.match(OBJECT_ID_RE)
        if (!match) return

        const cleanSlug = match[1]
        const base = bookNow ? "/book-now/course/" : "/course/"
        const qs = searchParams.toString()
        const target = qs ? `${base}${cleanSlug}?${qs}` : `${base}${cleanSlug}`

        navigate(target, { replace: true })
    }, [slug, bookNow, navigate, searchParams])

    return children
}

export default LegacyCourseRedirect
