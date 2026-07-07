// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import PublicNavbar from './landingPage/Navbar';
// import Footer from './landingPage/Footer';
// import '../styles/PublicForms.css';

// const formsData = [
//   {
//     category: "Student Enrollment",
//     items: [
//       {
//         title: "Online Enrollment Form",
//         desc: "Complete your enrollment details online to secure your spot.",
//         icon: "fa-solid fa-file-signature",
//         type: "Online",
//         link: "/book-now"
//       },
//       {
//         title: "Student Handbook",
//         desc: "Essential information about your rights, responsibilities, and training details.",
//         icon: "fa-solid fa-book-open",
//         type: "PDF",
//         link: "#"
//       }
//     ]
//   },
//   {
//     category: "Policies & Procedures",
//     items: [
//       {
//         title: "Fees & Refund Policy",
//         desc: "Detailed information about course fees, payment terms, and refund eligibility.",
//         icon: "fa-solid fa-money-check-dollar",
//         type: "PDF",
//         link: "#"
//       },
//       {
//         title: "Complaints & Appeals",
//         desc: "Our formal process for handling student grievances and assessment appeals.",
//         icon: "fa-solid fa-scale-balanced",
//         type: "PDF",
//         link: "#"
//       }
//     ]
//   },
//   {
//     category: "Technical Support",
//     items: [
//       {
//         title: "Code of Practice",
//         desc: "Our commitment to providing high-quality, professional training services.",
//         icon: "fa-solid fa-gavel",
//         type: "PDF",
//         link: "#"
//       }
//     ]
//   }
// ];

// export default function PublicForms({ courses }) {
//   const navigate = useNavigate();

//   return (
//     <div className="pf-root">
//       <PublicNavbar courses={courses} />
      
//       <div className="pf-hero">
//         <div className="pf-container">
//           <h1>Resources & Forms</h1>
//           <p>Access essential documents, student guides, and policy information to support your training journey.</p>
//         </div>
//       </div>

//       <div className="pf-content">
//         <div className="pf-container">
//           {formsData.map((section, idx) => (
//             <div key={idx} className="pf-section">
//               <h2 className="pf-section-title">{section.category}</h2>
//               <div className="pf-grid">
//                 {section.items.map((item, i) => (
//                   <div key={i} className="pf-card">
//                     <div className="pf-card-icon">
//                       <i className={item.icon}></i>
//                     </div>
//                     <div className="pf-card-body">
//                       <h3>{item.title}</h3>
//                       <p>{item.desc}</p>
//                       <div className="pf-card-footer">
//                         <span className={`pf-badge pf-badge-${item.type.toLowerCase()}`}>
//                           {item.type}
//                         </span>
//                         <button 
//                           className="pf-action-btn"
//                           onClick={() => {
//                             if (item.link.startsWith('http')) {
//                               window.open(item.link, '_blank');
//                             } else if (item.link !== '#') {
//                               navigate(item.link);
//                             }
//                           }}
//                         >
//                           {item.type === 'Online' ? 'Start Online' : 'View Document'}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import PublicNavbar from './PublicNavbar';
import Footer from './landingPage/Footer';
import { API_URL } from '../data/service';
import { openPdf } from '../utils/openPdf';
import { cdnImage } from '../utils/cdnImage';
import logo from '../assets/SafeTrickslogo.png';
import '../styles/PublicForms.css';

export default function PublicForms({ courses }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_URL}/api/form-documents/public`);
        const data = await res.json();
        if (mounted) setDocuments(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        console.error('Forms fetch error:', err);
        if (mounted) setError('Unable to load documents right now. Please try again shortly.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const featured = documents.filter((d) => d.section === 'featured');
  const listDocs = documents.filter((d) => d.section === 'list');

  const handleOpen = (doc) => {
    if (!doc?.fileUrl) return;
    openPdf(doc.fileUrl);
  };

  return (
    <div className="pf-root">
      <PublicNavbar courses={courses} />

      <div className="pf-page">
        <div className="pf-container">
          <h1 className="pf-page-title">Forms</h1>
          <div className="pf-title-bar" />

          {error && <div className="pf-error">{error}</div>}

          <div className="pf-layout">
            {/* LEFT — featured document (e.g. Participant Handbook) */}
            <div className="pf-featured-col">
              {loading ? (
                <div className="pf-handbook-card pf-skeleton" />
              ) : featured.length === 0 ? (
                <div className="pf-empty-card">
                  <i className="fa-solid fa-book-open"></i>
                  <p>No featured document has been added yet.</p>
                </div>
              ) : (
                featured.map((doc) => (
                  <button
                    key={doc._id}
                    type="button"
                    className="pf-handbook-card"
                    onClick={() => handleOpen(doc)}
                  >
                    <div className="pf-handbook-banner">
                      {doc.bannerImage ? (
                        <img src={cdnImage(doc.bannerImage, { w: 500 })} alt={doc.title} />
                      ) : (
                        <div className="pf-handbook-fallback">
                          <img src={logo} alt="SafeTricks" className="pf-handbook-logo" />
                        </div>
                      )}
                    </div>
                    <div className="pf-handbook-body">
                      <h2>{doc.title}</h2>
                      <p>{doc.description || `Click to download the ${doc.title} [PDF]`}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* RIGHT — policies, processes & other downloadable PDFs */}
            <div className="pf-list-col">
              {loading ? (
                <ul className="pf-doc-list">
                  {[1, 2, 3].map((i) => (
                    <li key={i} className="pf-doc-item pf-skeleton" />
                  ))}
                </ul>
              ) : listDocs.length === 0 ? (
                <div className="pf-empty-card">
                  <i className="fa-solid fa-file-circle-question"></i>
                  <p>No documents have been added yet.</p>
                </div>
              ) : (
                <ul className="pf-doc-list">
                  {listDocs.map((doc) => (
                    <li key={doc._id}>
                      <button
                        type="button"
                        className="pf-doc-item"
                        onClick={() => handleOpen(doc)}
                      >
                        <span className="pf-doc-icon">
                          <i className="fa-solid fa-file-pdf"></i>
                        </span>
                        <span className="pf-doc-title">{doc.title}</span>
                        <span className="pf-doc-arrow">
                          <i className="fa-solid fa-download"></i>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}