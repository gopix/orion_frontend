
// import "./Login.css";
// import { useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { loginUser } from "../../services/authServices";

// function Login() {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     if (email === "" || password === "") {
//       alert("Please fill in all fields");
//       return;
//     }
//     setLoading(true);
//     const result = await loginUser(email, password);
//     setLoading(false);
//     if (result.id) {
//   localStorage.removeItem("token");         // clear old session first
//   localStorage.setItem("token", result.id); // save fresh token
//   alert("Login successful!");
//   navigate("/");

//     } else {
//       alert("Invalid email or password");
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="login-box">
//         <div className="login-brand">
//           <h1>Welcome to ORION</h1>
//           <p className="login-subtitle">Sign in to your account to continue</p>
//         </div>

//         <div className="input-group">
//           <label>Email Address</label>
//           <input
//             type="email"
//             placeholder="you@company.com"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//         </div>

//         <div className="input-group">
//           <label>Password</label>
//           <input
//             type="password"
//             placeholder="Enter your password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//         </div>

//         <button className={`login-btn ${loading ? "loading" : ""}`} onClick={handleLogin} disabled={loading}>
//           {loading ? <span className="btn-spinner"></span> : "Sign In →"}
//         </button>

//         <p className="forgot-password" onClick={() => navigate("/forgot-password")}>
//           Forgot Password?
//         </p>

//         <div className="divider"><span>or</span></div>

//         <p className="signup-link">
//           New User? <span onClick={() => navigate("/signup")}>Create an Account</span>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;


import "./Login.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../../services/authServices";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cardIndex = searchParams.get("card"); // which card triggered login

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (email === "" || password === "") {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    const result = await loginUser(email, password);
    setLoading(false);

    if (result.id) {
      localStorage.setItem("token", result.id);
      alert("Login successful!");

      // redirect directly to the right page
      if (cardIndex === "3") {
        localStorage.removeItem("token");
        navigate("/template");
      } else {
        localStorage.removeItem("token");
        navigate("/"); // other cards go home for now
      }
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-brand">
          <h1>Welcome to ORION</h1>
          <p className="login-subtitle">Sign in to your account to continue</p>
        </div>

        <div className="input-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className={`login-btn ${loading ? "loading" : ""}`}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <span className="btn-spinner"></span> : "Sign In →"}
        </button>

        <p className="forgot-password" onClick={() => navigate("/forgot-password")}>
          Forgot Password?
        </p>

        <div className="divider"><span>or</span></div>

        <p className="signup-link">
          New User? <span onClick={() => navigate("/signup")}>Create an Account</span>
        </p>
      </div>
    </div>
  );
}

export default Login;