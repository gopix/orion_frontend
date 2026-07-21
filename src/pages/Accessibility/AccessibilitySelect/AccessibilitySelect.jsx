import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AccessibilitySelect.css";

const FILE_TYPES = [
  { id: "pdf", label: "PDF", icon: "📄", desc: "Portable Document Format" },
  { id: "epub", label: "EPUB", icon: "📘", desc: "eBook Publication" },
  { id: "ppt", label: "PPT", icon: "📽️", desc: "PowerPoint Presentation" },
];

const ACTIONS = [
  { id: "remediate", label: "Remediate", icon: "🛠️", desc: "Automatically fix accessibility issues" },
  { id: "validate", label: "Validate", icon: "✅", desc: "Check compliance against accessibility standards" },
];

// Where each (fileType, action) combination should go.
// "ppt" isn't wired up yet, so it isn't listed here — it's handled
// separately with a "coming soon" alert.
const ROUTES = {
  "pdf-remediate": "/remediate-pdf",
  "pdf-validate": "/validate-pdf",
  "epub-remediate": "/remediate-epub",
  "epub-validate": "/validate-epub",
};

export default function AccessibilitySelect() {
  const navigate = useNavigate();

  const [fileType, setFileType] = useState(null);   // "pdf" | "epub" | "ppt"
  const [action, setAction]     = useState(null);   // "remediate" | "validate"

  const handleFileTypeSelect = (id) => {
    setFileType(id);
    setAction(null);
  };

  const handleProceed = () => {
    if (!fileType || !action) return;

    if (fileType === "ppt") {
      alert("This dashboard is coming soon.");
      return;
    }

    const route = ROUTES[`${fileType}-${action}`];
    if (route) navigate(route);
  };

  return (
    <div className="as-page">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="as-sidebar">
        <div className="as-logo">
          <div className="as-logo-mark">O</div>
          <div className="as-logo-text">
            <span>ORION</span>
            <small>Accessibility & Remediation</small>
          </div>
        </div>

        <div className="as-sidebar-footer">
          <div className="as-user-section">
            <p className="as-user-email">{sessionStorage.getItem("userEmail")}</p>
            <button
              className="as-back-btn"
              onClick={() => navigate("/")}
              title="Back to Home"
            >
              ← Back
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="as-main">
        <div className="as-container">
          <div className="as-intro">
            <h1 className="as-title">Accessibility & Remediation</h1>
            <p className="as-subtitle">
              Select a file type and an action to get started.
            </p>
          </div>

          <section className="as-step">
            <p className="as-step-label">Step 1 · File Type</p>
            <div className="as-option-grid as-option-grid-3">
              {FILE_TYPES.map((type) => (
                <label
                  key={type.id}
                  className={`as-option-card${fileType === type.id ? " as-option-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="as-file-type"
                    value={type.id}
                    checked={fileType === type.id}
                    onChange={() => handleFileTypeSelect(type.id)}
                    className="as-radio"
                  />
                  <span className="as-option-icon">{type.icon}</span>
                  <span className="as-option-label">{type.label}</span>
                  <span className="as-option-desc">{type.desc}</span>
                </label>
              ))}
            </div>
          </section>

          {fileType && (
            <section className="as-step">
              <p className="as-step-label">Step 2 · Action</p>
              <div className="as-option-grid as-option-grid-2">
                {ACTIONS.map((act) => (
                  <label
                    key={act.id}
                    className={`as-option-card${action === act.id ? " as-option-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="as-action"
                      value={act.id}
                      checked={action === act.id}
                      onChange={() => setAction(act.id)}
                      className="as-radio"
                    />
                    <span className="as-option-icon">{act.icon}</span>
                    <span className="as-option-label">{act.label}</span>
                    <span className="as-option-desc">{act.desc}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          <button
            className="as-proceed-btn"
            onClick={handleProceed}
            disabled={!fileType || !action}
          >
            Proceed →
          </button>
        </div>
      </main>
    </div>
  );
}