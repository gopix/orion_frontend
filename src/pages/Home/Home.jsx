
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar/Navbar";
import ServiceCard from "../../components/common/ServiceCard/ServiceCard";
import { services } from "../../constants/serviceData";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const handleCardClick = (index) => {
    // Every card click always goes to the login page first.
    // We pass which card was clicked so Login knows what to do
    // after the user successfully signs in.
    navigate(`/login?card=${index}`);
  };

  return (
    <div className="home-container">
      <Navbar />
      <div className="services-section">
        {services.map((item, index) => (
          <ServiceCard
            key={index}
            title={item.title}
            description={item.description}
            icon={item.icon}
            onClick={() => handleCardClick(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;
