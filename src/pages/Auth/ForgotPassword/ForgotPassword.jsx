import "./ForgotPassword.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetLink = () => {
    if (email === "") {
      alert("Please enter your email address");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      console.log("Reset link requested for:", email);
    }, 1200);
  };

  return (
    <div className="forgot-page">
      <div className="forgot-box">

        <div className="forgot-brand">
          <h1>Reset Password</h1>
          <p className="forgot-subtext">
            Enter your registered email and we'll send you a secure reset link.
          </p>
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

        <button
          className={`forgot-btn ${loading ? "loading" : ""} ${sent ? "sent" : ""}`}
          onClick={handleResetLink}
          disabled={loading || sent}
        >
          {loading
            ? <span className="btn-spinner"></span>
            : sent
            ? "✓ Link Sent!"
            : "Send Reset Link →"
          }
        </button>

        <p className="back-to-login">
          Remember your password? <span onClick={() => navigate("/login")}>Back to Login</span>
        </p>

      </div>
    </div>
  );
}

export default ForgotPassword;
