import { siteConfig } from '../../services/mockData'
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'

function Topbar() {
  return (
    <div className='topbar'>
      <div className='topbar-contact'>
        <span><FaPhone /> {siteConfig.phone1}</span>
        <span className='sep'>|</span>
        <span>{siteConfig.phone2}</span>
      </div>
      <div className='topbar-middle'>
        <span className='topbar-ticker'>{siteConfig.announcementBar}</span>
      </div>
      <div className='topbar-right'>
        <FaEnvelope /> <span>{siteConfig.email}</span>
        <span className='topbar-addr'><FaMapMarkerAlt /> {siteConfig.address}</span>
      </div>
    </div>
  )
}

export default Topbar
