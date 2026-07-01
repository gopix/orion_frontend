
import "./Navbar.css";
import logo from "../../../assets/images/orion-logo.png";

function Navbar() {
  const userEmail = sessionStorage.getItem("userEmail");
  const token = sessionStorage.getItem("token");

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="ORION" className="logo" />
      </div>
      <div className="navbar-center">
        <h1>ORION</h1>
        <p>AI, Automation & Content Engineering Solutions</p>
      </div>
      {token && userEmail && (
        <div className="navbar-right">
          <span className="navbar-user-dot"></span>
          <span className="navbar-user-email">{userEmail}</span>
        </div>
      )}
    </nav>
  );
}

export default Navbar;