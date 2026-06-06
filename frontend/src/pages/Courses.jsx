// import { useState } from 'react'
// import { useQuery } from '@tanstack/react-query'
// import MainLayout    from '../layouts/MainLayout'
// import CourseCard    from '../components/home/CourseCard'
// import { getCourses }    from '../services/courseService'
// import { getCategories } from '../services/categoryServices'
// import './courses.css'

// // ── Skeleton: category tab bar ────────────────────────────────
// const TabSkeleton = () => (
//   <div className="cat-tabs">
//     {[110, 160, 200, 140, 170, 130, 150].map((w, i) => (
//       <div key={i} className="crs-tab-skel" style={{ width: w }} />
//     ))}
//   </div>
// )

// // ── Skeleton: course card grid ────────────────────────────────
// const CardSkeletons = ({ count = 8 }) => (
//   <div className="course-grid">
//     {Array.from({ length: count }, (_, i) => (
//       <div key={i} className="crs-card-skel">
//         <div className="crs-skel-img" />
//         <div className="crs-skel-body">
//           <div className="crs-skel-line" style={{ width: '55%' }} />
//           <div className="crs-skel-line" style={{ width: '80%', height: 18 }} />
//           <div className="crs-skel-line" style={{ width: '40%' }} />
//         </div>
//       </div>
//     ))}
//   </div>
// )

// // ══════════════════════════════════════════════════════════════
// // Courses page
// // ══════════════════════════════════════════════════════════════
// function Courses() {
//   const [activeCatId, setActiveCatId] = useState('all')
//   const [search, setSearch]           = useState('')

//   // ── Data fetching ────────────────────────────────────────
//   // useCourses hook returns axios response; data is in data.data.courses
//   const { data: cRes, isLoading: coursesLoading } = useQuery({
//     queryKey: ['courses'],
//     queryFn:  getCourses,
//   })
//   const courses = cRes?.data?.courses || []

//   const { data: catRes, isLoading: catsLoading } = useQuery({
//     queryKey: ['categories'],
//     queryFn:  getCategories,
//   })
//   const categories = catRes?.data?.categories || []

//   // ── Filter: category + search ────────────────────────────
//   const filtered = courses.filter(c => {
//     const inCat =
//       activeCatId === 'all' ||
//       (c.category?._id || c.category) === activeCatId

//     const q = search.toLowerCase()
//     const matchSearch =
//       !search ||
//       c.title?.toLowerCase().includes(q) ||
//       (c.code || c.urlSlug || '').toLowerCase().includes(q)

//     return inCat && matchSearch
//   })

//   // Course count per category for the badge
//   const countMap = categories.reduce((acc, cat) => {
//     acc[cat._id] = courses.filter(
//       c => (c.category?._id || c.category) === cat._id
//     ).length
//     return acc
//   }, {})

//   return (
//     <MainLayout>

//       {/* ── Hero Banner ──────────────────────────────────── */}
//       <div className="crs-hero">
//         <div className="container">
//           <p className="crs-hero-sub">BROWSE ALL</p>
//           <h1 className="crs-hero-title">All Courses</h1>
//           <p className="crs-hero-desc">
//             Nationally recognised training. Certificate issued same day.
//             Same-week sessions available.
//           </p>

//           {/* Search */}
//           <div className="crs-search-wrap">
//             <span className="crs-search-icon">🔍</span>
//             <input
//               className="crs-search"
//               placeholder="Search by course name or code…"
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//             />
//             {search && (
//               <button className="crs-search-clear" onClick={() => setSearch('')}>
//                 ✕
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ── Main content ─────────────────────────────────── */}
//       <section className="crs-section">
//         <div className="container">

//           {/* Category tabs */}
//           {catsLoading ? <TabSkeleton /> : (
//             <div className="cat-tabs">
//               {/* "All" tab */}
//               <button
//                 className={`cat-tab${activeCatId === 'all' ? ' active' : ''}`}
//                 onClick={() => setActiveCatId('all')}
//               >
//                 All Courses
//                 <span className="cat-count">{courses.length}</span>
//               </button>

//               {categories.map(cat => (
//                 <button
//                   key={cat._id}
//                   className={`cat-tab${activeCatId === cat._id ? ' active' : ''}`}
//                   onClick={() => setActiveCatId(cat._id)}
//                 >
//                   {cat.name}
//                   <span className="cat-count">{countMap[cat._id] ?? 0}</span>
//                 </button>
//               ))}
//             </div>
//           )}

//           {/* Result count */}
//           {!coursesLoading && (
//             <p className="crs-result-count">
//               {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
//               {search && <> for "<strong>{search}</strong>"</>}
//             </p>
//           )}

//           {/* Grid */}
//           {coursesLoading
//             ? <CardSkeletons />
//             : filtered.length > 0
//               ? (
//                 <div className="course-grid">
//                   {filtered.map(c => <CourseCard key={c._id} course={c} />)}
//                 </div>
//               )
//               : (
//                 <div className="crs-empty">
//                   <div className="crs-empty-icon">🔍</div>
//                   <h3>No courses found</h3>
//                   <p>
//                     {search
//                       ? `No results for "${search}". Try a different search.`
//                       : 'No courses in this category yet.'
//                     }
//                   </p>
//                   <button
//                     className="crs-reset-btn"
//                     onClick={() => { setSearch(''); setActiveCatId('all') }}
//                   >
//                     Show all courses
//                   </button>
//                 </div>
//               )
//           }

//         </div>
//       </section>

//     </MainLayout>
//   )
// }

// export default Courses

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import MainLayout    from '../layouts/MainLayout'
import CourseCard    from '../components/home/CourseCard'
import { getCourses }    from '../services/courseService'
import { getCategories } from '../services/categoryServices'
import './courses.css'

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

function Courses() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch]             = useState('')
  const [priceMin, setPriceMin]         = useState(0)
  const [priceMax, setPriceMax]         = useState(99999)
  const [maxPrice, setMaxPrice]         = useState(99999)

  // Read ?category= from URL (set by Categories component)
  const urlCat = searchParams.get('category') || 'all'
  const [activeCatId, setActiveCatId] = useState(urlCat)

  // Sync URL → state when user navigates from Home
  useEffect(() => {
    setActiveCatId(searchParams.get('category') || 'all')
  }, [searchParams])

  const setCategory = (id) => {
    setActiveCatId(id)
    if (id === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: id })
    }
  }

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

  // Compute price range from real data
  useEffect(() => {
    if (courses.length > 0) {
      const max = Math.max(...courses.map(c => Number(c.price) || 0))
      setMaxPrice(max || 99999)
      setPriceMax(max || 99999)
    }
  }, [courses])

  // Filter: category + search + price
  const filtered = courses.filter(c => {
    const inCat =
      activeCatId === 'all' ||
      (c.category?._id || c.category) === activeCatId

    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      c.title?.toLowerCase().includes(q) ||
      (c.code || c.urlSlug || '').toLowerCase().includes(q)

    const price = Number(c.price) || 0
    const inPrice = price >= priceMin && price <= priceMax

    return inCat && matchSearch && inPrice
  })

  const countMap = categories.reduce((acc, cat) => {
    acc[cat._id] = courses.filter(
      c => (c.category?._id || c.category) === cat._id
    ).length
    return acc
  }, {})

  return (
    <MainLayout>

      {/* ── Hero ──────────────────────────────────────── */}
      <div className="crs-hero">
        <div className="container">
          <p className="crs-hero-sub">ALL COURSES</p>
          <h1 className="crs-hero-title">Browse &amp; Book</h1>
          <p className="crs-hero-desc">
            Nationally recognised training. Certificate issued same day.
            Same-week sessions available.
          </p>
        </div>
      </div>

      {/* ── Body: sidebar + grid ─────────────────────── */}
      <div className="crs-body">
        <div className="container crs-body-inner">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="crs-sidebar">

            {/* Search */}
            <div className="crs-sidebar-block">
              <h4 className="crs-sidebar-label">Search</h4>
              <div className="crs-search-wrap">
                <span className="crs-search-icon">🔍</span>
                <input
                  className="crs-search"
                  placeholder="Course name…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className="crs-search-clear" onClick={() => setSearch('')}>✕</button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="crs-sidebar-block">
              <h4 className="crs-sidebar-label">Categories</h4>
              {catsLoading ? (
                <div className="crs-sidebar-skel-wrap">
                  {[1,2,3,4].map(i => <div key={i} className="crs-sidebar-skel" />)}
                </div>
              ) : (
                <ul className="crs-sidebar-cats">
                  <li>
                    <label className="crs-cat-radio">
                      <input
                        type="radio"
                        name="category"
                        checked={activeCatId === 'all'}
                        onChange={() => setCategory('all')}
                      />
                      <span>All Categories</span>
                      <span className="crs-cat-count">{courses.length}</span>
                    </label>
                  </li>
                  {categories.map(cat => (
                    <li key={cat._id}>
                      <label className="crs-cat-radio">
                        <input
                          type="radio"
                          name="category"
                          checked={activeCatId === cat._id}
                          onChange={() => setCategory(cat._id)}
                        />
                        <span>{cat.name}</span>
                        <span className="crs-cat-count">{countMap[cat._id] ?? 0}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Price Range */}
            {!coursesLoading && maxPrice > 0 && (
              <div className="crs-sidebar-block">
                <h4 className="crs-sidebar-label">Price Range</h4>
                <div className="crs-price-range">
                  <div className="crs-price-labels">
                    <span>Min: ${priceMin.toLocaleString()}</span>
                    <span>Max: ${priceMax === 99999 ? '—' : priceMax.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={priceMax}
                    onChange={e => setPriceMax(Number(e.target.value))}
                    className="crs-range-slider"
                  />
                </div>
              </div>
            )}

            {/* Clear filters */}
            {(search || activeCatId !== 'all' || priceMax < maxPrice) && (
              <button
                className="crs-clear-btn"
                onClick={() => {
                  setSearch('')
                  setCategory('all')
                  setPriceMax(maxPrice)
                }}
              >
                Clear All Filters
              </button>
            )}

          </aside>

          {/* ── RIGHT: results ── */}
          <div className="crs-results">

            {/* Top bar */}
            <div className="crs-results-topbar">
              {!coursesLoading && (
                <p className="crs-result-count">
                  Showing <strong>{filtered.length}</strong> of <strong>{courses.length}</strong> courses
                  {search && <> for "<strong>{search}</strong>"</>}
                </p>
              )}
            </div>

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
                        : 'No courses in this category yet.'}
                    </p>
                    <button
                      className="crs-reset-btn"
                      onClick={() => { setSearch(''); setCategory('all'); setPriceMax(maxPrice) }}
                    >
                      Show all courses
                    </button>
                  </div>
                )
            }

          </div>
        </div>
      </div>

    </MainLayout>
  )
}

export default Courses