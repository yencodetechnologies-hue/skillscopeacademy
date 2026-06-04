import { statsData, featureBoxes } from '../../services/mockData'
import './stats.css'

const StatsStrip = () => {
  return (
    <>
      {/* Stats Banner */}
      <div className='stats-banner'>
        <div className='container stats-banner-inner'>
          {statsData.map((s, i) => (
            <div key={i} className='stat-item'>
              <span className='stat-icon'>{s.icon}</span>
              <div>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Boxes Strip */}
      <div className='features-strip'>
        <div className='container features-grid'>
          {featureBoxes.map((box, i) => (
            <div key={i} className='feature-box'>
              <span className='feature-icon'>{box.icon}</span>
              <div>
                <h4>{box.title}</h4>
                <p>{box.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default StatsStrip
