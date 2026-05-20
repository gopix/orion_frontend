

import "./ServiceCard.css";

function ServiceCard({ title, description, icon, onClick }) {
  return (
    <div className="service-card" onClick={onClick}>
      <div className="service-icon-wrap">{icon}</div>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="card-cta">Get Started <span>→</span></div>
    </div>
  );
}

export default ServiceCard;
