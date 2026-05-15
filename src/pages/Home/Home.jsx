import Navbar from "../../components/common/Navbar/Navbar";
import ServiceCard from "../../components/common/ServiceCard/ServiceCard";

import { services } from "../../constants/serviceData";

import "./Home.css";

function Home() {
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
          />
        ))}

      </div>

    </div>
  );
}

export default Home;