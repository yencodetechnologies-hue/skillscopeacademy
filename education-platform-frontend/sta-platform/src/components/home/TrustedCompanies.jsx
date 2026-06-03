import { trustedClients } from '../../services/mockData'
import './trusted.css'

const TrustedCompanies = () => {
  return (
    <section className='trusted'>
      <div className='container'>
        <p className='trusted-label'>OUR TRUSTED CLIENTS</p>
        <div className='trusted-grid'>
          {trustedClients.map((c, i) => (
            <div key={i} className='client-card'>
              <img src={c.logo} alt={c.name} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustedCompanies
