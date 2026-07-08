
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar/Navbar";
import ServiceCard from "../../components/common/ServiceCard/ServiceCard";
import { services } from "../../constants/serviceData";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const userEmail = sessionStorage.getItem("userEmail");

  const handleCardClick = (index) => {
    // Check if user is already logged in (token in sessionStorage)
    const token = sessionStorage.getItem("token");

    if (token) {
      // User is already logged in, skip login and go directly to card page
      if (index === 0) {
        navigate("/submit");
      } else if (index === 1) {
        navigate("/editor");
      } else if (index === 2) {
        navigate("/publish");
      } else if (index === 3) {
        navigate("/remediate-pdf");
      }
    } else {
      // User is not logged in, redirect to login page with card info
      // We pass which card was clicked so Login knows what to do
      // after the user successfully signs in.
      navigate(`/login?card=${index}`);
    }
  };

  return (
    <div className="home-container">
      <Navbar />
      {token && (
        <div className="welcome-banner" key={userEmail}>
          <span className="welcome-wave">👋</span>
          <p className="welcome-text">
            Welcome{userEmail ? "," : ""}{" "}
            {userEmail && <span className="welcome-email">{userEmail}</span>}
          </p>
        </div>
      )}
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