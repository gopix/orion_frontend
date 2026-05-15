

import "./Login.css";
import logo from "../../assets/images/orion-logo.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../../services/authServices";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (email === "" || password === "") {
      alert("Please fill in all fields");
      return;
    }

    const result = await loginUser(email, password);

    if (result.id) {
  alert("Login successful!");
  navigate("/");
} else {
  alert("Invalid email or password");
}
  };

  return (
    <div className="login-page">
      <div className="login-box">

        <img src={logo} alt="orion" className="login-logo" />

        <h1>Welcome to ORION</h1>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>

        <p className="forgot-password" onClick={() => navigate("/forgot-password")}>
          Forgot Password?
        </p>

        <p className="signup-link">
          New User? <span onClick={() => navigate("/signup")}>Sign Up</span>
        </p>

      </div>
    </div>
  );
}

export default Login;