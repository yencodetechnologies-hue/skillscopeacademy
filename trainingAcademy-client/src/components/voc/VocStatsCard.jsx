import "./VocStatsCard.css";

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const SigmaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 7H6l7 5-7 5h12"/>
  </svg>
);

export default function VOCStatsCard({ pending = 0, verified = 0, total = 0 }) {
  const cards = [
    {
      title: "VOC Pending",
      value: pending,
      subtitle: "Pending verification",
      icon: <AlertIcon />,
      iconClass: "vsc__icon--warning",
    },
    {
      title: "VOC Verified",
      value: verified,
      subtitle: "Ready for next steps",
      icon: <CheckIcon />,
      iconClass: "vsc__icon--success",
    },
    {
      title: "Total VOC",
      value: total,
      subtitle: "All time renewals",
      icon: <SigmaIcon />,
      iconClass: "vsc__icon--purple",
    },
  ];

  return (
    <div className="vsc__grid">
      {cards.map((card, i) => (
        <div className="vsc__card" key={i}>
          <div className="vsc__card-header">
            <span className="vsc__card-title">{card.title}</span>
            <span className={`vsc__card-icon ${card.iconClass}`}>
              {card.icon}
            </span>
          </div>
          <div className="vsc__card-value">{card.value}</div>
          <div className="vsc__card-subtitle">{card.subtitle}</div>
        </div>
      ))}
    </div>
  );
}