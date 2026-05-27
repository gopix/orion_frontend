
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
    const result = await loginUser(email, password);
    setLoading(false);

    if (result.id) {
      // ── Card 4 (index "3") — Accessibility Remediation ──────
      // Save the token in sessionStorage (NOT localStorage).
      //
      // KEY CONCEPT — sessionStorage vs localStorage:
      //   • localStorage   → survives tab close, browser close,
      //                       even system restart. Stays forever
      //                       until you manually clear it.
      //   • sessionStorage → lives ONLY for the current browser
      //                       tab/session. The moment the user
      //                       closes the tab or the browser, the
      //                       token is automatically deleted.
      //                       They must log in again next visit.
      //
      // This is exactly the behaviour asked for: card 4 requires
      // login every time the app is opened fresh.
      if (cardIndex === "3") {
        sessionStorage.setItem("token", result.id);
        navigate("/template");

      // ── Cards 1, 2, 3 — Other services ──────────────────────
      // Credentials are correct but no dashboard exists yet.
      // Show the alert, then stay on the login page.
      // We do NOT save any token so the user is not "logged in"
      // for the purpose of accessing protected pages.
      } else {
        alert("Dashboard coming soon!");
        // navigate back to home so they can pick another card
        navigate("/");
      }
    } else {
      alert("Invalid email or password");
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
