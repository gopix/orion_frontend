
import "./ForgotPassword.css";
import logo from "../../assets/images/orion-logo.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const handleResetLink = () => {
    if (email === "") {
      alert("Please enter your email address");
      return;
    }
    console.log("Reset link requested for:", email);
    alert("Reset link sent! API will be connected here.");
  };

  return (
    <div className="forgot-page">
      <div className="forgot-box">

        <img src={logo} alt="orion" className="forgot-logo" />

        <h1>Reset Password</h1>

        <p className="forgot-subtext">
          Enter your registered email address and we'll send you a reset link.
        </p>

        <input
          type="email"
          placeholder="Enter your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={handleResetLink}>Send Reset Link</button>

        <p className="back-to-login">
          Remember your password? <span onClick={() => navigate("/login")}>Back to Login</span>
        </p>

      </div>
    </div>
  );
}

export default ForgotPassword;