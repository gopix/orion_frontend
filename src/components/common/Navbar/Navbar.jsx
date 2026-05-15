import "./Navbar.css";
import logo from "../../../assets/images/orion-logo.png";

function Navbar() {
  return (
    <div className="navbar">
      
      <div className="navbar-left">
        <img src={logo} alt="ORION Logo" className="logo" />
      </div>

      <div className="navbar-right">
        <h1>ORION</h1>

        <p>
          Intelligent Digital Systems for the Publishing Industry
        </p>
      </div>

    </div>
  );
}

export default Navbar;