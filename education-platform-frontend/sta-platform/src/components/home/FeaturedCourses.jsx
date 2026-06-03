import { useCourses } from '../../hooks/useCourse'

function FeaturedCourses() {
  const { data } = useCourses()

  return (
    <section className='featured-section'>
      <div className='section-title'>
        <h2>Upcoming Courses</h2>
      </div>

      <div className='featured-grid'>
        {data?.courses?.map((course) => (
          <div className='featured-card' key={course._id}>
            <div className='featured-date'>
              <h3>23</h3>
              <span>MAY</span>
            </div>

            <div className='featured-content'>
              <h3>{course.title}</h3>

              <p>
                08:00 - ${course.price}
              </p>
            </div>

            <button>Book</button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FeaturedCourses