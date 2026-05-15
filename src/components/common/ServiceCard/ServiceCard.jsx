import "./ServiceCard.css";

import { useNavigate } from "react-router-dom";

function ServiceCard({ title, description, icon }) {

  const navigate = useNavigate();

  return (
    <div
      className="service-card"

      onClick={() => navigate("/login")}
    >

      <div className="service-icon">
        {icon}
      </div>

      <h2>{title}</h2>

      <p>{description}</p>

    </div>
  );
}

export default ServiceCard;