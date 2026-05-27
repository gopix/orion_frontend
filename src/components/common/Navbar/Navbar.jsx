
import "./Navbar.css";
import logo from "../../../assets/images/orion-logo.png";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="ORION" className="logo" />
      </div>
      <div className="navbar-center">
        <h1>ORION</h1>
        <p>AI, Automation & Content Engineering Solutions</p>
      </div>
    </nav>
  );
}

export default Navbar;