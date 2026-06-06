// const categories = [
//   {
//     image:
//       'https://images.unsplash.com/photo-1504307651254-35680f356dfd',

//     title: 'Earthmoving Courses',
//   },

//   {
//     image:
//       'https://images.unsplash.com/photo-1517048676732-d65bc937f952',

//     title: 'Confined Space Courses',
//   },

//   {
//     image:
//       'https://images.unsplash.com/photo-1503387762-592deb58ef4e',

//     title: 'Demolition Courses',
//   },

//   {
//     image:
//       'https://images.unsplash.com/photo-1521791136064-7986c2920216',

//     title: 'First Aid Courses',
//   },
// ]

// function CourseCategories() {
//   return (
//     <section className='course-categories'>
//       <div className='section-title'>
//         <h2>Popular Categories</h2>
//       </div>

//       <div className='categories-grid'>
//         {categories.map((item, index) => (
//           <div className='category-card' key={index}>
//             <img src={item.image} alt={item.title} />

//             <h3>{item.title}</h3>
//           </div>
//         ))}
//       </div>
//     </section>
//   )
// }

// export default CourseCategories

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories } from '../../services/adminService'
import './categories.css'

const FALLBACK_ICONS = ['🏗️', '⚗️', '🔧', '🚑', '🏋️', '📐', '🔬', '🧲']

function CourseCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getCategories()
      .then(r => setCategories(r.data?.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleCategoryClick = (catId) => {
    navigate(`/courses?category=${catId}`)
  }

  const handleViewAll = () => {
    navigate('/courses')
  }

  return (
    <section className="course-categories">
      <div className="container">

        {/* Header */}
        <div className="cat-section-header">
          <div>
            <p className="cat-section-sub">EXPLORE</p>
            <h2 className="cat-section-title">Popular Categories</h2>
            <p className="cat-section-desc">
              Find the right course for your career — browse by category.
            </p>
          </div>
          <button className="cat-view-all-btn" onClick={handleViewAll}>
            View All Categories →
          </button>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="categories-grid">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="category-card category-card-skel" />
            ))}
          </div>
        )}

        {/* Categories */}
        {!loading && (
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <div
                key={cat._id}
                className="category-card"
                onClick={() => handleCategoryClick(cat._id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleCategoryClick(cat._id)}
              >
                <div className="category-img-wrap">
                  {cat.image
                    ? <img src={cat.image} alt={cat.name} loading="lazy" />
                    : <span className="category-icon">{FALLBACK_ICONS[i % FALLBACK_ICONS.length]}</span>
                  }
                  <div className="category-overlay" />
                </div>
                <div className="category-info">
                  <h3>{cat.name}</h3>
                  <span className="category-arrow">→</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && categories.length === 0 && (
          <p className="cat-empty">No categories available yet.</p>
        )}

        {/* Mobile view all */}
        <div className="cat-view-all-mobile">
          <button className="cat-view-all-btn" onClick={handleViewAll}>
            View All Categories →
          </button>
        </div>

      </div>
    </section>
  )
}

export default CourseCategories