
// // import "./SignUp.css";
// // import logo from "../../assets/images/orion-logo.png";
// // import { useNavigate } from "react-router-dom";
// // import { useState } from "react";
// // import { registerUser } from "../../services/authServices";

// // function SignUp() {

// //   const navigate = useNavigate();

// //   const [formData, setFormData] = useState({
// //     firstName: "",
// //     lastName: "",
// //     email: "",
// //     phone: "",
// //     organization: "",
// //     role: "",
// //     password: "",
// //     confirmPassword: "",
// //   });

// //   const handleChange = (e) => {
// //     setFormData({ ...formData, [e.target.name]: e.target.value });
// //   };

// //   const handleSignUp = async () => {
// //     if (
// //       formData.firstName === "" ||
// //       formData.lastName === "" ||
// //       formData.email === "" ||
// //       formData.phone === "" ||
// //       formData.organization === "" ||
// //       formData.role === "" ||
// //       formData.password === "" ||
// //       formData.confirmPassword === ""
// //     ) {
// //       alert("Please fill in all fields");
// //       return;
// //     }

// //     if (formData.password !== formData.confirmPassword) {
// //       alert("Passwords do not match");
// //       return;
// //     }

// //     const result = await registerUser(formData.email, formData.password);

// //     if (result.id) {
// //       alert("Account created successfully!");
// //       navigate("/login");
// //     } else {
// //       alert("Something went wrong. Please try again.");
// //     }
// //   };

// //   return (
// //     <div className="signup-page">
// //       <div className="signup-box">

// //         <img src={logo} alt="orion" className="signup-logo" />

// //         <h1>Create Account</h1>

// //         <p className="signup-subtext">
// //           Join ORION — Fill in your details to get started.
// //         </p>

// //         <div className="signup-row">
// //           <input
// //             type="text"
// //             placeholder="First Name"
// //             name="firstName"
// //             value={formData.firstName}
// //             onChange={handleChange}
// //           />
// //           <input
// //             type="text"
// //             placeholder="Last Name"
// //             name="lastName"
// //             value={formData.lastName}
// //             onChange={handleChange}
// //           />
// //         </div>

// //         <input
// //           type="email"
// //           placeholder="Email Address"
// //           name="email"
// //           value={formData.email}
// //           onChange={handleChange}
// //         />

// //         <input
// //           type="tel"
// //           placeholder="Phone Number"
// //           name="phone"
// //           value={formData.phone}
// //           onChange={handleChange}
// //         />

// //         <input
// //           type="text"
// //           placeholder="Organization / Company Name"
// //           name="organization"
// //           value={formData.organization}
// //           onChange={handleChange}
// //         />

// //         <select
// //           name="role"
// //           value={formData.role}
// //           onChange={handleChange}
// //         >
// //           <option value="" disabled>Select Your Role</option>
// //           <option value="editor">Editor</option>
// //           <option value="publisher">Publisher</option>
// //           <option value="author">Author</option>
// //           <option value="reviewer">Reviewer</option>
// //         </select>

// //         <input
// //           type="password"
// //           placeholder="Create Password"
// //           name="password"
// //           value={formData.password}
// //           onChange={handleChange}
// //         />

// //         <input
// //           type="password"
// //           placeholder="Confirm Password"
// //           name="confirmPassword"
// //           value={formData.confirmPassword}
// //           onChange={handleChange}
// //         />

// //         <button onClick={handleSignUp}>Create Account</button>

// //         <p className="back-to-login">
// //           Already have an account? <span onClick={() => navigate("/login")}>Back to Login</span>
// //         </p>

// //       </div>
// //     </div>
// //   );
// // }

// // export default SignUp;


// // import "./SignUp.css";
// // import logo from "../../assets/images/orion-logo.png";
// // import { useNavigate } from "react-router-dom";
// // import { useState } from "react";
// // import { registerUser } from "../../services/authServices";

// // function SignUp() {

// //   const navigate = useNavigate();

// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [confirmPassword, setConfirmPassword] = useState("");

// //   const handleSignUp = async () => {

// //     if (email === "" || password === "" || confirmPassword === "") {
// //       alert("Please fill in all fields");
// //       return;
// //     }

// //     if (password !== confirmPassword) {
// //       alert("Passwords do not match");
// //       return;
// //     }

// //     const result = await registerUser(email, password);

// //     if (result.id) {
// //       alert("Account created successfully!");
// //       navigate("/login");
// //     } else {
// //       alert("Something went wrong. Please try again.");
// //     }
// //   };

// //   return (
// //     <div className="signup-page">
// //       <div className="signup-box">

// //         <img src={logo} alt="orion" className="signup-logo" />

// //         <h1>Create Account</h1>

// //         <p className="signup-subtext">
// //           Join ORION — Fill in your details to get started.
// //         </p>

// //         <input
// //           type="email"
// //           placeholder="Email Address"
// //           value={email}
// //           onChange={(e) => setEmail(e.target.value)}
// //         />

// //         <input
// //           type="password"
// //           placeholder="Create Password"
// //           value={password}
// //           onChange={(e) => setPassword(e.target.value)}
// //         />

// //         <input
// //           type="password"
// //           placeholder="Confirm Password"
// //           value={confirmPassword}
// //           onChange={(e) => setConfirmPassword(e.target.value)}
// //         />

// //         <button onClick={handleSignUp}>Create Account</button>

// //         <p className="back-to-login">
// //           Already have an account? <span onClick={() => navigate("/login")}>Back to Login</span>
// //         </p>

// //       </div>
// //     </div>
// //   );
// // }

// // export default SignUp;









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
//           <div className="brand-icon">
//             <span></span>
//           </div>
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



// import "./SignUp.css";
// import logo from "../../assets/images/orion-logo.png";
// import { useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { registerUser } from "../../services/authServices";

// function SignUp() {

//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     organization: "",
//     role: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSignUp = async () => {
//     if (
//       formData.firstName === "" ||
//       formData.lastName === "" ||
//       formData.email === "" ||
//       formData.phone === "" ||
//       formData.organization === "" ||
//       formData.role === "" ||
//       formData.password === "" ||
//       formData.confirmPassword === ""
//     ) {
//       alert("Please fill in all fields");
//       return;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       alert("Passwords do not match");
//       return;
//     }

//     const result = await registerUser(formData.email, formData.password);

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

//         <img src={logo} alt="orion" className="signup-logo" />

//         <h1>Create Account</h1>

//         <p className="signup-subtext">
//           Join ORION — Fill in your details to get started.
//         </p>

//         <div className="signup-row">
//           <input
//             type="text"
//             placeholder="First Name"
//             name="firstName"
//             value={formData.firstName}
//             onChange={handleChange}
//           />
//           <input
//             type="text"
//             placeholder="Last Name"
//             name="lastName"
//             value={formData.lastName}
//             onChange={handleChange}
//           />
//         </div>

//         <input
//           type="email"
//           placeholder="Email Address"
//           name="email"
//           value={formData.email}
//           onChange={handleChange}
//         />

//         <input
//           type="tel"
//           placeholder="Phone Number"
//           name="phone"
//           value={formData.phone}
//           onChange={handleChange}
//         />

//         <input
//           type="text"
//           placeholder="Organization / Company Name"
//           name="organization"
//           value={formData.organization}
//           onChange={handleChange}
//         />

//         <select
//           name="role"
//           value={formData.role}
//           onChange={handleChange}
//         >
//           <option value="" disabled>Select Your Role</option>
//           <option value="editor">Editor</option>
//           <option value="publisher">Publisher</option>
//           <option value="author">Author</option>
//           <option value="reviewer">Reviewer</option>
//         </select>

//         <input
//           type="password"
//           placeholder="Create Password"
//           name="password"
//           value={formData.password}
//           onChange={handleChange}
//         />

//         <input
//           type="password"
//           placeholder="Confirm Password"
//           name="confirmPassword"
//           value={formData.confirmPassword}
//           onChange={handleChange}
//         />

//         <button onClick={handleSignUp}>Create Account</button>

//         <p className="back-to-login">
//           Already have an account? <span onClick={() => navigate("/login")}>Back to Login</span>
//         </p>

//       </div>
//     </div>
//   );
// }

// export default SignUp;


// import "./SignUp.css";
// import logo from "../../assets/images/orion-logo.png";
// import { useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { registerUser } from "../../services/authServices";

// function SignUp() {

//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const handleSignUp = async () => {

//     if (email === "" || password === "" || confirmPassword === "") {
//       alert("Please fill in all fields");
//       return;
//     }

//     if (password !== confirmPassword) {
//       alert("Passwords do not match");
//       return;
//     }

//     const result = await registerUser(email, password);

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

//         <img src={logo} alt="orion" className="signup-logo" />

//         <h1>Create Account</h1>

//         <p className="signup-subtext">
//           Join ORION — Fill in your details to get started.
//         </p>

//         <input
//           type="email"
//           placeholder="Email Address"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <input
//           type="password"
//           placeholder="Create Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <input
//           type="password"
//           placeholder="Confirm Password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//         />

//         <button onClick={handleSignUp}>Create Account</button>

//         <p className="back-to-login">
//           Already have an account? <span onClick={() => navigate("/login")}>Back to Login</span>
//         </p>

//       </div>
//     </div>
//   );
// }

// export default SignUp;









import "./SignUp.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerUser } from "../../services/authServices";

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
