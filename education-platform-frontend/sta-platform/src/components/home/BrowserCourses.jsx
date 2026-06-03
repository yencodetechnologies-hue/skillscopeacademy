// import { useState } from 'react'
// import { coursesData, courseCategories } from '../../services/mockData'
// import CourseCard from './CourseCard'
// import './browser.css'

// const BrowseCourses = () => {
//   const [activeCategory, setActiveCategory] = useState('Short Courses')

//   const filtered = coursesData.filter(c => c.category === activeCategory)

//   return (
//     <section className='browse'>
//       <div className='container'>

//         <div className='browse-header'>
//           <p className='browse-subtitle'>ALL COURSES</p>
//           <h2>Browse &amp; Book</h2>
//           <p className='browse-desc'>Nationally recognised training. Certificate issued same day. Same-week sessions available.</p>
//         </div>

//         {/* Category Tabs */}
//         <div className='cat-tabs'>
//           {courseCategories.map(cat => (
//             <button
//               key={cat.label}
//               className={`cat-tab ${activeCategory === cat.label ? 'active' : ''}`}
//               onClick={() => setActiveCategory(cat.label)}
//             >
//               {cat.label} <span className='cat-count'>{cat.count}</span>
//             </button>
//           ))}
//         </div>

//         {/* Course Grid */}
//         <div className='course-grid'>
//           {filtered.length > 0
//             ? filtered.map(c => <CourseCard key={c.id} course={c} />)
//             : <p className='no-courses'>No courses in this category yet.</p>
//           }
//         </div>

//         <div className='browse-footer'>
//           <button className='see-more-btn'>See More {activeCategory} →</button>
//         </div>

//       </div>
//     </section>
//   )
// }

// export default BrowseCourses


import { useEffect, useState, useCallback } from 'react'
import { getCategories } from '../../services/adminService'
import { getCourses }    from '../../services/adminService'
import CourseCard        from './CourseCard'
import './browser.css'

// Skeleton for tab bar while loading
const TabSkeleton = () => (
  <div className="cat-tabs">
    {[140, 160, 200, 120, 170, 150, 130, 180].map((w, i) => (
      <div key={i} className="cat-tab-skel" style={{ width: w }}/>
    ))}
  </div>
)

// Skeleton for course cards while loading
const GridSkeleton = () => (
  <div className="course-grid">
    {Array.from({ length: 4 }, (_, i) => (
      <div key={i} className="course-card-skel">
        <div className="course-card-skel-img"/>
        <div className="course-card-skel-body">
          <div className="skel-line" style={{ width: '55%' }}/>
          <div className="skel-line" style={{ width: '80%', height: 18 }}/>
          <div className="skel-line" style={{ width: '40%' }}/>
        </div>
      </div>
    ))}
  </div>
)

const BrowseCourses = () => {
  const [categories, setCategories]   = useState([])
  const [courses, setCourses]         = useState([])
  const [activeCatId, setActiveCatId] = useState(null)
  const [catsLoading, setCatsLoading] = useState(true)
  const [coursesLoading, setCoLoading] = useState(true)
  const [error, setError]             = useState(null)

  // Load categories
  const loadCategories = useCallback(async () => {
    setCatsLoading(true)
    try {
      const { data } = await getCategories()
      const cats = data.categories || []
      setCategories(cats)
      if (cats.length > 0) setActiveCatId(cats[0]._id)
    } catch (e) {
      console.error(e)
      setError('Failed to load categories.')
    } finally {
      setCatsLoading(false)
    }
  }, [])

  // Load all courses once — filter client-side (instant tab switching)
  const loadCourses = useCallback(async () => {
    setCoLoading(true)
    try {
      const { data } = await getCourses()
      setCourses(data.courses || [])
    } catch (e) {
      console.error(e)
    } finally {
      setCoLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
    loadCourses()
  }, [loadCategories, loadCourses])

  // Filter courses for active category
  const filtered = activeCatId
    ? courses.filter(c => (c.category?._id || c.category) === activeCatId)
    : []

  // Count per category for badge numbers
  const countMap = categories.reduce((acc, cat) => {
    acc[cat._id] = courses.filter(
      c => (c.category?._id || c.category) === cat._id
    ).length
    return acc
  }, {})

  const activeCatName = categories.find(c => c._id === activeCatId)?.name || ''

  return (
    <section className="browse">
      <div className="container">

        {/* Header */}
        <div className="browse-header">
          <p className="browse-subtitle">ALL COURSES</p>
          <h2>Browse &amp; Book</h2>
          <p className="browse-desc">
            Nationally recognised training. Certificate issued same day. Same-week sessions available.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="browse-error">
            {error}
            <button onClick={() => { loadCategories(); loadCourses() }}>Retry</button>
          </div>
        )}

        {/* Category tabs */}
        {catsLoading
          ? <TabSkeleton/>
          : (
            <div className="cat-tabs">
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
          )
        }

        {/* Course grid */}
        {coursesLoading
          ? <GridSkeleton/>
          : (
            <div className="course-grid">
              {filtered.length > 0
                ? filtered.map(c => <CourseCard key={c._id} course={c}/>)
                : (
                  <p className="no-courses">
                    No courses in this category yet.
                  </p>
                )
              }
            </div>
          )
        }

        {/* See more */}
        {!coursesLoading && filtered.length > 0 && (
          <div className="browse-footer">
            <button className="see-more-btn">
              See More {activeCatName} →
            </button>
          </div>
        )}

      </div>
    </section>
  )
}

export default BrowseCourses