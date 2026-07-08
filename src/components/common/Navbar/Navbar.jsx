

import "./Navbar.css";
import logo from "../../../assets/images/orion-logo.png";

function Navbar() {
  const token = sessionStorage.getItem("token");

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="ORION" className="logo" />
      </div>
      <div className="navbar-center">
        <h1>ORION</h1>
        <p>AI-Powered Accessibility & Publishing Automation
</p>
      </div>
      {token && (
        <div className="navbar-right">
          <button
            className="navbar-logout-btn"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <span className="logout-icon-wrap">
              <svg
                className="logout-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="logout-icon-door"
                  d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  className="logout-icon-arrow"
                  d="M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="logout-label">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;