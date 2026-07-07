import { useState } from "react";
import "./StudentCertificate.css";


export default function StudentCertificate() {
  return (
    <div className="uc-page">
      <div className="uc-bg-grid" aria-hidden="true" />

      <div className="uc-content">
        <div className="uc-scene" aria-hidden="true">

          <div className="uc-crane">
            <div className="uc-crane-mast" />
            <div className="uc-crane-jib" />
            <div className="uc-crane-cable" />
            <div className="uc-crane-sign">
              <svg width="38" height="34" viewBox="0 0 38 34">
                <polygon points="19,3 35,31 3,31" fill="#f97316" stroke="#fff" strokeWidth="2" />
                <text x="19" y="26" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff">!</text>
              </svg>
            </div>
          </div>

          <div className="uc-phone">
            <div className="uc-phone-notch" />
            <div className="uc-phone-screen">
              {[90,60,80,50,70,85,55,75,65,90,45,70].map((w, i) => (
                <div key={i} className={`uc-line uc-line-${i % 3}`} style={{ width: `${w}%` }} />
              ))}
            </div>
            <div className="uc-tape" />
          </div>

          <div className="uc-gears" aria-hidden="true">
            <div className="uc-gear uc-gear-lg" />
            <div className="uc-gear uc-gear-sm" />
          </div>

          <div className="uc-wrench">🔧</div>
          <div className="uc-cone">🚧</div>
          <div className="uc-alert">!</div>
        </div>

        <div className="uc-text">
          <div className="uc-badge">
            <span className="uc-badge-dot" />
            In progress
          </div>
          <h1 className="uc-title">Page under<br />construction</h1>
          <p className="uc-desc">
            We're building something great here.<br />
            This feature will be live very soon.
          </p>
        </div>
      </div>
    </div>
  )
}