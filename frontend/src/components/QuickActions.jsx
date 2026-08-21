import React from "react";
import "../styles/QuickActions.css";
import { useNavigate } from "react-router-dom";

/* Icons */
const LightningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const UserPlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="17" y1="11" x2="23" y2="11" />
  </svg>
);

const BookOpenIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const GraduationCapIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/* Config */
const actions = [
  {
    title: "Go to Landing Page",
    subtitle: "View website",
    icon: <GlobeIcon />,
    key: "landing",
    route: "/",
    themeClass: "qa__card--purple",
  },
  {
    title: "Walk-in Registration",
    subtitle: "Register student",
    icon: <UserPlusIcon />,
    key: "walkin",
    route: "/book-now",
    themeClass: "qa__card--green",
  },
  {
    title: "Add New Course",
    subtitle: "Create course",
    icon: <BookOpenIcon />,
    key: "course",
    route: "/admin/courses",
    state: { openCreateModal: true },
    themeClass: "qa__card--orange",
  },
  {
    title: "Add New Student",
    subtitle: "Enroll student",
    icon: <GraduationCapIcon />,
    key: "student",
    route: "/admin/students",
    themeClass: "qa__card--blue",
  },
  {
    title: "Create Schedule",
    subtitle: "New schedule",
    icon: <CalendarIcon />,
    key: "schedule",
    route: "/admin/schedule",
    themeClass: "qa__card--pink",
  },
];

export default function QuickActions({ onAction }) {
  const navigate = useNavigate();

  const handleClick = (action) => {
    onAction && onAction(action.key);
    navigate(action.route, action.state ? { state: action.state } : {});
  };

  return (
    <div className="qa__container">
      <div className="qa__header">
        <span className="qa__header-icon">
          <LightningIcon />
        </span>
        <h3 className="qa__title">Quick Actions</h3>
      </div>

      <div className="qa__grid">
        {actions.map((action, i) => (
          <button
            key={i}
            className={`qa__card ${action.themeClass}`}
            onClick={() => handleClick(action)}
          >
            <div className="qa__icon-wrapper">{action.icon}</div>
            <div className="qa__card-title">{action.title}</div>
            <div className="qa__card-footer">
              <span>{action.subtitle}</span>
              <ArrowRightIcon />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}