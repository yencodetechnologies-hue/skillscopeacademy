import { useState } from "react";
import "../styles/QuickActions.css";
import { useNavigate } from "react-router-dom";

const HomeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const actions = [
  { label: "Go to Landing Page",   icon: <HomeIcon />, key: "landing", route: "/"},
  { label: "Walk-in Registration", icon: null,         key: "walkin",  route: "/book-now"},
  { label: "Add New Course",       icon: null,         key: "course",  route: "/admin/courses", state: { openCreateModal: true } },
  { label: "Generate Report",      icon: null,         key: "report",  route: "/admin/reports"},
];

export default function QuickActions({ onAction }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();

  const handleClick = (action) => {
    onAction && onAction(action.key);
    navigate(action.route, action.state ? { state: action.state } : {});
  };

  return (
    <div className="qa__wrapper">
      <div className="qa__title">Quick Actions</div>
      <div className="qa__list">
        {actions.map((action, i) => (
          <button
            key={i}
            className={`qa__btn ${hoveredIndex === i ? "qa__btn--hovered" : ""}`}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => handleClick(action)}
          >
            <div className="qa__btn-left">
              {action.icon && (
                <span className="qa__btn-icon">{action.icon}</span>
              )}
              <span className="qa__btn-label">{action.label}</span>
            </div>
            <span className="qa__btn-chevron">
              <ChevronRight />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}