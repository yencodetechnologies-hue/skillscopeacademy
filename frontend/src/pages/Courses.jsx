import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import MainLayout    from '../layouts/MainLayout'
import CourseCard    from '../components/home/CourseCard'
import { getCourses }    from '../services/courseService'
import { getCategories } from '../services/categoryServices'
import './courses.css'

// ── Skeleton: category tab bar ────────────────────────────────
const TabSkeleton = () => (
  <div className="cat-tabs">
    {[110, 160, 200, 140, 170, 130, 150].map((w, i) => (
      <div key={i} className="crs-tab-skel" style={{ width: w }} />
    ))}
  </div>
)

// ── Skeleton: course card grid ────────────────────────────────
const CardSkeletons = ({ count = 8 }) => (
  <div className="course-grid">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="crs-card-skel">
        <div className="crs-skel-img" />
        <div className="crs-skel-body">
          <div className="crs-skel-line" style={{ width: '55%' }} />
          <div className="crs-skel-line" style={{ width: '80%', height: 18 }} />
          <div className="crs-skel-line" style={{ width: '40%' }} />
        </div>
      </div>
    ))}
  </div>
)

// ══════════════════════════════════════════════════════════════
// Courses page
// ══════════════════════════════════════════════════════════════
function Courses() {
  const [activeCatId, setActiveCatId] = useState('all')
  const [search, setSearch]           = useState('')

  // ── Data fetching ────────────────────────────────────────
  // useCourses hook returns axios response; data is in data.data.courses
  const { data: cRes, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn:  getCourses,
  })
  const courses = cRes?.data?.courses || []

  const { data: catRes, isLoading: catsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn:  getCategories,
  })
  const categories = catRes?.data?.categories || []

  // ── Filter: category + search ────────────────────────────
  const filtered = courses.filter(c => {
    const inCat =
      activeCatId === 'all' ||
      (c.category?._id || c.category) === activeCatId

    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      c.title?.toLowerCase().includes(q) ||
      (c.code || c.urlSlug || '').toLowerCase().includes(q)

    return inCat && matchSearch
  })

  // Course count per category for the badge
  const countMap = categories.reduce((acc, cat) => {
    acc[cat._id] = courses.filter(
      c => (c.category?._id || c.category) === cat._id
    ).length
    return acc
  }, {})

  return (
    <MainLayout>

      {/* ── Hero Banner ──────────────────────────────────── */}
      <div className="crs-hero">
        <div className="container">
          <p className="crs-hero-sub">BROWSE ALL</p>
          <h1 className="crs-hero-title">All Courses</h1>
          <p className="crs-hero-desc">
            Nationally recognised training. Certificate issued same day.
            Same-week sessions available.
          </p>

          {/* Search */}
          <div className="crs-search-wrap">
            <span className="crs-search-icon">🔍</span>
            <input
              className="crs-search"
              placeholder="Search by course name or code…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="crs-search-clear" onClick={() => setSearch('')}>
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <section className="crs-section">
        <div className="container">

          {/* Category tabs */}
          {catsLoading ? <TabSkeleton /> : (
            <div className="cat-tabs">
              {/* "All" tab */}
              <button
                className={`cat-tab${activeCatId === 'all' ? ' active' : ''}`}
                onClick={() => setActiveCatId('all')}
              >
                All Courses
                <span className="cat-count">{courses.length}</span>
              </button>

              {categories.map(cat => (
                <button
                  key={cat._id}
                  className={`cat-tab${activeCatId === cat._id ? ' active' : ''}`}
                  onClick={() => setActiveCatId(cat._id)}
                >
                  {cat.name}
                  <span className="cat-count">{countMap[cat._id] ?? 0}</span>
                </button>
              ))}
            </div>
          )}

          {/* Result count */}
          {!coursesLoading && (
            <p className="crs-result-count">
              {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
              {search && <> for "<strong>{search}</strong>"</>}
            </p>
          )}

          {/* Grid */}
          {coursesLoading
            ? <CardSkeletons />
            : filtered.length > 0
              ? (
                <div className="course-grid">
                  {filtered.map(c => <CourseCard key={c._id} course={c} />)}
                </div>
              )
              : (
                <div className="crs-empty">
                  <div className="crs-empty-icon">🔍</div>
                  <h3>No courses found</h3>
                  <p>
                    {search
                      ? `No results for "${search}". Try a different search.`
                      : 'No courses in this category yet.'
                    }
                  </p>
                  <button
                    className="crs-reset-btn"
                    onClick={() => { setSearch(''); setActiveCatId('all') }}
                  >
                    Show all courses
                  </button>
                </div>
              )
          }

        </div>
      </section>

    </MainLayout>
  )
}

export default Courses