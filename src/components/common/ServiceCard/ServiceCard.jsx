import "./ServiceCard.css";
import { useNavigate } from "react-router-dom";

function ServiceCard({ title, description, icon }) {
  const navigate = useNavigate();
  return (
    <div className="service-card" onClick={() => navigate("/login")}>
      <div className="service-icon-wrap">{icon}</div>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="card-cta">Get Started <span>→</span></div>
    </div>
  );
}

export default ServiceCard;
