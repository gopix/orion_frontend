


import "./SignUp.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { registerUser, getOrganizations } from "../../../services/apiServices";

// ── Password strength helper ────────────────────────────────
const getPasswordStrength = (pwd) => {
  if (!pwd) return { label: "", score: 0 };

  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (pwd.length < 6 || score <= 1) return { label: "Weak", score: 1 };
  if (score === 2 || score === 3) return { label: "Medium", score: 2 };
  return { label: "Strong", score: 3 };
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function SignUp() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organizationId, setOrganizationId] = useState("");

  const [organizations, setOrganizations] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [orgsError, setOrgsError] = useState("");

  const [loading, setLoading] = useState(false);

  // ── Fetch organizations for the dropdown ──────────────────
  useEffect(() => {
    const loadOrganizations = async () => {
      setOrgsLoading(true);
      setOrgsError("");
      try {
        const data = await getOrganizations();
        const list = Array.isArray(data) ? data : (data?.data ?? data?.organizations ?? []);
        setOrganizations(Array.isArray(list) ? list : []);
      } catch (err) {
        setOrgsError("Could not load organizations. Is the backend running?");
      } finally {
        setOrgsLoading(false);
      }
    };
    loadOrganizations();
  }, []);

  // ── Field-level validation ─────────────────────────────────
  const isUsernameValid = userName.trim().length >= 3;
  const isEmailValid = isValidEmail(email);
  const isPasswordValid = password.length >= 8;
  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === password;
  const isOrganizationValid = organizationId !== "";

  const isFormValid =
    isUsernameValid && isEmailValid && isPasswordValid && isConfirmValid && isOrganizationValid;

  const passwordStrength = getPasswordStrength(password);

  const borderClass = (touched, valid) => {
    if (!touched) return "";
    return valid ? "input-valid" : "input-invalid";
  };

  const resetForm = () => {
    setUserName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setOrganizationId("");
  };

  const handleSignUp = async () => {
    if (!isFormValid) {
      alert("Please fill in all fields correctly before continuing.");
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser(userName.trim(), email, password, organizationId);

      if (result?.id) {
        // Success response: { id, user_name, email, role_name, organization_name, created_at, updated_at }
        alert("Account created successfully!");
        resetForm();
        navigate("/login");
      } else if (Array.isArray(result?.detail)) {
        // 422 Validation Error: { detail: [{ loc, msg, type }, ...] }
        const messages = result.detail.map((d) => d.msg).filter(Boolean);
        alert(messages.length ? messages.join("\n") : "Please check your details and try again.");
      } else {
        alert(result?.message || result?.detail || "Something went wrong. Please try again.");
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
          <label>Username</label>
          <input
            type="text"
            placeholder="Choose a username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className={borderClass(userName.length > 0, isUsernameValid)}
          />
        </div>

        <div className="input-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={borderClass(email.length > 0, isEmailValid)}
          />
        </div>

        <div className="input-group">
          <label>Organization</label>
          <select
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            className={borderClass(organizationId !== "", isOrganizationValid)}
          >
            <option value="">
              {orgsLoading ? "Loading organizations…" : "— Select an organization —"}
            </option>
            {organizations.map((org, idx) => {
              const id = org.id ?? org.organization_id ?? org.org_id ?? idx;
              const name = org.name ?? org.organization_name ?? org.org_name ?? `Organization ${id}`;
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              );
            })}
          </select>
          {orgsError && <p className="field-error-hint">{orgsError}</p>}
        </div>

        <div className="input-group">
          <label>Create Password</label>
          <input
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={borderClass(password.length > 0, isPasswordValid)}
          />
          {password.length > 0 && (
            <div className="password-strength-wrap">
              <div className={`strength-bar strength-${passwordStrength.score}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className={`strength-label strength-label-${passwordStrength.score}`}>
                {passwordStrength.label}
              </span>
            </div>
          )}
        </div>

        <div className="input-group">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={borderClass(confirmPassword.length > 0, isConfirmValid)}
          />
          {confirmPassword.length > 0 && (
            <p className={`match-hint ${isConfirmValid ? "match-ok" : "match-bad"}`}>
              {isConfirmValid ? "Passwords match" : "Passwords do not match"}
            </p>
          )}
        </div>

        <button
          className={`signup-btn ${loading ? "loading" : ""}`}
          onClick={handleSignUp}
          disabled={loading || !isFormValid}
        >
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
