import { upcomingCourses } from '../../services/mockData'
import './upcoming.css'

const UpcomingCourses = () => {
  return (
    <section className='upcoming'>
      <div className='container'>
        <div className='upcoming-ticker-wrap'>
          <span className='upcoming-label'>DON&apos;T MISS OUT</span>
          <div className='upcoming-ticker'>
            {[...upcomingCourses, ...upcomingCourses].map((c, i) => (
              <div key={i} className='upcoming-item'>
                <div className='upcoming-date'>
                  <span className='date-day'>{c.day}</span>
                  <span className='date-month'>{c.month}</span>
                </div>
                <div className='upcoming-info'>
                  <p className='upcoming-title'>{c.title}</p>
                  <p className='upcoming-meta'>{c.time} · {c.price}</p>
                </div>
                <button className={`upcoming-book ${c.status === 'Full' ? 'btn-full' : 'btn-available'}`}>
                  {c.status === 'Full' ? 'Full' : 'Book'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default UpcomingCourses
