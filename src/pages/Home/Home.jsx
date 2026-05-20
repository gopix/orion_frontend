// import { useNavigate } from "react-router-dom";
// import Navbar from "../../components/common/Navbar/Navbar";
// import ServiceCard from "../../components/common/ServiceCard/ServiceCard";
// import { services } from "../../constants/serviceData";
// import "./Home.css";

// function Home() {
//   const navigate = useNavigate();

//   const handleCardClick = (index) => {
//     const token = localStorage.getItem("token");

//     if (token) {
//       localStorage.removeItem("token"); // clear token so next click requires login again
//       if (index === 3) {
//         navigate("/template");
//       } else {
//         navigate("/login"); // other cards go to login for now
//       }
//     } else {
//       navigate("/login");
//     }
//   };

//   return (
//     <div className="home-container">
//       <Navbar />
//       <div className="services-section">
//         {services.map((item, index) => (
//           <ServiceCard
//             key={index}
//             title={item.title}
//             description={item.description}
//             icon={item.icon}
//             onClick={() => handleCardClick(index)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// export default Home;

import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar/Navbar";
import ServiceCard from "../../components/common/ServiceCard/ServiceCard";
import { services } from "../../constants/serviceData";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const handleCardClick = (index) => {
    const token = localStorage.getItem("token");
    if (token) {
      localStorage.removeItem("token");
      if (index === 3) {
        navigate("/template");
      } else {
        navigate("/login");
      }
    } else {
      navigate(`/login?card=${index}`); // pass which card was clicked
    }
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