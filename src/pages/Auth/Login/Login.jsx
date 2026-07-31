
// import "./Login.css";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { useState } from "react";
// import { loginUser } from "../../../services/apiServices";
// import {
//   SHOW_SUBMIT_PLUS,
//   SHOW_EDITOR_PLUS,
//   SHOW_PUBLISH_PLUS,
//   SHOW_ACCESSIBILITY_PLUS,
// } from "../../../constants/featureFlags";

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
//       sessionStorage.setItem("userRole", result.role_name || "USER");
      
//       // Route based on card selection
//       if (cardIndex === "0" && SHOW_SUBMIT_PLUS) {
//         // Card 0 (BookForge) goes to submit page
//         navigate("/submit");
//       } else if (cardIndex === "1" && SHOW_EDITOR_PLUS) {
//         // Card 1 (Editor+) goes to editor page
//         navigate("/editor");
//       } else if (cardIndex === "2" && SHOW_PUBLISH_PLUS) {
//         // Card 2 (Publish+) goes to publish dashboard
//         navigate("/publish");
//       } else if (cardIndex === "3" && SHOW_ACCESSIBILITY_PLUS) {
//         // Card 3 (Accessibility Remediation) goes to remediate-pdf
//         navigate("/remediate-pdf");
//       } else {
//         // No card selected, or the selected card's module is currently
//         // disabled via feature flag — send the user back to the
//         // dashboard instead of a dead/hidden route.
//         navigate("/");
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
import { loginUser } from "../../../services/apiServices";
import {
  SHOW_SUBMIT_PLUS,
  SHOW_EDITOR_PLUS,
  SHOW_PUBLISH_PLUS,
  SHOW_ACCESSIBILITY_PLUS,
} from "../../../constants/featureFlags";

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
      sessionStorage.setItem("userRole", result.role_name || "USER");
      
      // Route based on card selection
      if (cardIndex === "0" && SHOW_SUBMIT_PLUS) {
        // Card 0 (BookForge) goes to submit page
        navigate("/submit");
      } else if (cardIndex === "1" && SHOW_EDITOR_PLUS) {
        // Card 1 (Editor+) goes to editor page
        navigate("/editor");
      } else if (cardIndex === "2" && SHOW_PUBLISH_PLUS) {
        // Card 2 (Publish+) goes to publish dashboard
        navigate("/publish");
      } else if (cardIndex === "3" && SHOW_ACCESSIBILITY_PLUS) {
        // Card 3 (Accessibility Remediation) goes to the file type
        // and action selection screen
        navigate("/accessibility");
      } else {
        // No card selected, or the selected card's module is currently
        // disabled via feature flag — send the user back to the
        // dashboard instead of a dead/hidden route.
        navigate("/");
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