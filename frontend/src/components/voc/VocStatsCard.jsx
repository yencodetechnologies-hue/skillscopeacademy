import React from "react";
import "./VocStatsCard.css";

/* =========================================================
   ICONS
========================================================= */

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12l3 3 5-5" />
  </svg>
);

const CheckMarkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DocumentPendingIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <circle cx="12" cy="14" r="3" />
    <polyline points="12 12.5 12 14 13 15" />
  </svg>
);

const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

/* =========================================================
   COMPONENT
========================================================= */

export default function VOCStatsCard({
  adminName = "Admin",
  pending = 0,
  verified = 1,
  sydney = 2,
  adelaide = 2,
}) {
  const cards = [
    {
      title: "VOC Pending",
      value: pending,
      subtitle: "Pending verification",
      leftIcon: <DocumentPendingIcon />,
      rightIcon: <InfoIcon />,
      themeClass: "vsc__card--pending",
    },
    {
      title: "VOC Verified",
      value: verified,
      subtitle: "Ready for next steps",
      leftIcon: <CheckMarkIcon />,
      rightIcon: <CheckCircleIcon />,
      themeClass: "vsc__card--verified",
    },
    {
      title: "Today's Sydney",
      value: sydney,
      subtitle: "Preferred city students",
      leftIcon: <LocationIcon />,
      rightIcon: null,
      themeClass: "vsc__card--sydney",
    },
    {
      title: "Today's Adelaide",
      value: adelaide,
      subtitle: "Preferred city students",
      leftIcon: <LocationIcon />,
      rightIcon: null,
      themeClass: "vsc__card--adelaide",
    },
  ];

  return (
    <div className="vsc__container">
      {/* Top Header Section */}
      <div className="vsc__welcome-header">
        <h1 className="vsc__welcome-title">Welcome back, {adminName}!</h1>
        <p className="vsc__welcome-subtitle">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="vsc__grid">
        {cards.map((card, i) => (
          <div className={`vsc__card ${card.themeClass}`} key={i}>
            <div className="vsc__badge">{card.leftIcon}</div>

            <div className="vsc__content">
              <div className="vsc__header">
                <span className="vsc__title">{card.title}</span>
                {card.rightIcon && (
                  <span className="vsc__status-icon">{card.rightIcon}</span>
                )}
              </div>

              <div className="vsc__value">{card.value}</div>
              <div className="vsc__subtitle">{card.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}