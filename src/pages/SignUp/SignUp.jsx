
// import "./SignUp.css";
// import { useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { registerUser } from "../../services/authServices";

// function SignUp() {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSignUp = async () => {
//     if (!email || !password || !confirmPassword) {
//       alert("Please fill in all fields");
//       return;
//     }
//     if (password !== confirmPassword) {
//       alert("Passwords do not match");
//       return;
//     }
//     setLoading(true);
//     const result = await registerUser(email, password);
//     setLoading(false);
//     if (result.id) {
//       alert("Account created successfully!");
//       navigate("/login");
//     } else {
//       alert("Something went wrong. Please try again.");
//     }
//   };

//   return (
//     <div className="signup-page">
//       <div className="signup-box">
//         <div className="signup-brand">
//           <h1>Create Account</h1>
//           <p className="signup-subtext">Join ORION — Fill in your details to get started.</p>
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
//           <label>Create Password</label>
//           <input
//             type="password"
//             placeholder="Minimum 8 characters"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//         </div>

//         <div className="input-group">
//           <label>Confirm Password</label>
//           <input
//             type="password"
//             placeholder="Re-enter your password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//           />
//         </div>

//         <button className={`signup-btn ${loading ? "loading" : ""}`} onClick={handleSignUp} disabled={loading}>
//           {loading ? <span className="btn-spinner"></span> : "Create Account →"}
//         </button>

//         <p className="back-to-login">
//           Already have an account? <span onClick={() => navigate("/login")}>Sign In</span>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default SignUp;


import "./SignUp.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerUser } from "../../services/apiServices";

function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    const result = await registerUser(email, password);
    setLoading(false);
    if (result.id) {
      alert("Account created successfully!");
      navigate("/login");
    } else {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-box">
        <div className="signup-brand">
          <h1>Create Account</h1>
          <p className="signup-subtext">Join ORION — Fill in your details to get started.</p>
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
          <label>Create Password</label>
          <input
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button className={`signup-btn ${loading ? "loading" : ""}`} onClick={handleSignUp} disabled={loading}>
          {loading ? <span className="btn-spinner"></span> : "Create Account →"}
        </button>

        <p className="back-to-login">
          Already have an account? <span onClick={() => navigate("/login")}>Sign In</span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
