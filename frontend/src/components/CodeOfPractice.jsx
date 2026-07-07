import React, { useEffect, useState } from 'react';
import PublicNavbar from './PublicNavbar';
import Footer from './landingPage/Footer';
import { API_URL } from '../data/service';
import { openPdf } from '../utils/openPdf';
import '../styles/PublicForms.css';

export default function CodeOfPractice({ courses }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_URL}/api/code-of-practice/public`);
        const data = await res.json();
        if (mounted) setDocuments(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        console.error('Code of Practice fetch error:', err);
        if (mounted) setError('Unable to load documents right now. Please try again shortly.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleOpen = (doc) => {
    if (!doc?.fileUrl) return;
    openPdf(doc.fileUrl);
  };

  return (
    <div className="pf-root">
      <PublicNavbar courses={courses} />

      <div className="pf-page">
        <div className="pf-container">
          <h1 className="pf-page-title">Code of Practice</h1>
          <div className="pf-title-bar" />

          {error && <div className="pf-error">{error}</div>}

          <div className="pf-list-col">
            {loading ? (
              <ul className="pf-doc-list">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="pf-doc-item pf-skeleton" />
                ))}
              </ul>
            ) : documents.length === 0 ? (
              <div className="pf-empty-card">
                <i className="fa-solid fa-file-circle-question"></i>
                <p>No Code of Practice documents have been added yet.</p>
              </div>
            ) : (
              <ul className="pf-doc-list">
                {documents.map((doc) => (
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

      <Footer />
    </div>
  );
}