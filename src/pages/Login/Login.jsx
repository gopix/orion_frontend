


// import "./Login.css";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { useState } from "react";
// import { loginUser } from "../../services/apiServices";

// function Login() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const cardIndex = searchParams.get("card"); // "0", "1", "2", or "3"

//   const [email, setEmail]       = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading]   = useState(false);

//   const handleLogin = async () => {
//     if (email === "" || password === "") {
//       alert("Please fill in all fields");
//       return;
//     }

//     setLoading(true);
//     let result;
//     try {
//       result = await loginUser(email, password);
//     } catch (err) {
//       // Network error (CORS, server down, no connection, etc.)
//       setLoading(false);
//       alert("Unable to connect. Please try again later.");
//       return;
//     }
//     setLoading(false);

//     if (result.id) {
//       sessionStorage.setItem("token", result.id);
//       sessionStorage.setItem("userEmail", result.email);
      
//       // Route based on card selection
//       if (cardIndex === "0") {
//         // Card 0 (Submit+) goes to submit page
//         navigate("/submit");
//       } else if (cardIndex === "1") {
//         // Card 1 (Editor+) goes to editor page
//         navigate("/editor");
//       } else if (cardIndex === "2") {
//         // Card 2 (Publish+) - feature not live yet
//         alert("Dashboard coming soon!");
//         navigate("/");
//       } else if (cardIndex === "3") {
//         // Card 3 (Accessibility Remediation) goes to remediate-pdf
//         navigate("/remediate-pdf");
//       } else {
//         // Default to template if no card selected
//         navigate("/template");
//       }
//     } else {
//       alert("Incorrect credentials");
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="login-box">
//         <div className="login-brand">
//           <h1>Welcome</h1>
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

//         <button
//           className={`login-btn ${loading ? "loading" : ""}`}
//           onClick={handleLogin}
//           disabled={loading}
//         >
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
import { loginUser } from "../../services/apiServices";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cardIndex = searchParams.get("card"); // "0", "1", "2", or "3"

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (email === "" || password === "") {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    let result;
    try {
      result = await loginUser(email, password);
    } catch (err) {
      // Network error (CORS, server down, no connection, etc.)
      setLoading(false);
      alert("Unable to connect. Please try again later.");
      return;
    }
    setLoading(false);

    if (result.id) {
      sessionStorage.setItem("token", result.id);
      sessionStorage.setItem("userEmail", result.email);
      
      // Route based on card selection
      if (cardIndex === "0") {
        // Card 0 (Submit+) goes to submit page
        navigate("/submit");
      } else if (cardIndex === "1") {
        // Card 1 (Editor+) goes to editor page
        navigate("/editor");
      } else if (cardIndex === "2") {
        // Card 2 (Publish+) goes to publish dashboard
        navigate("/publish");
      } else if (cardIndex === "3") {
        // Card 3 (Accessibility Remediation) goes to remediate-pdf
        navigate("/remediate-pdf");
      } else {
        // Default to template if no card selected
        navigate("/template");
      }
    } else {
      alert("Incorrect credentials");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-brand">
          <h1>Welcome</h1>
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