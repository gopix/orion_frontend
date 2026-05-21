


import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../Template/Template.css";

const BASE_URL = "http://localhost:8000/api/v1";

export default function ValidatePdf() {
  const navigate = useNavigate();
  const [pdfFile, setPdfFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState("");
  const pdfInputRef = useRef(null);

  const handlePdfSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) return alert("Please upload a PDF file");
    setPdfFile(file);
    setValidationResult(null);
    setError("");
  };

  // ────────────────────────────────────────────────────────────
  // API 3 — POST /api/v1/accessibility/run-checks
  // Sends the PDF file to the backend as FormData
  // Backend runs all active accessibility checks and returns results
  // ────────────────────────────────────────────────────────────
  const handleValidate = async () => {
    if (!pdfFile) return alert("Please upload a PDF first");

    setValidating(true);
    setValidationResult(null);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      const response = await fetch(`${BASE_URL}/accessibility/run-checks`, {
        method: "POST",
        body: formData,
        // Do NOT set Content-Type manually — browser sets it automatically for FormData
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setValidationResult(data);

    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setValidating(false);
    }
  };

  // Helper — get the list of checks from whatever shape backend returns
  const getChecks = () => {
    if (!validationResult) return [];
    if (Array.isArray(validationResult)) return validationResult;
    if (Array.isArray(validationResult.checks)) return validationResult.checks;
    if (Array.isArray(validationResult.results)) return validationResult.results;
    return [];
  };

  return (
    <div className="tp-page">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="tp-sidebar">
        <div className="tp-logo">
          <span>Orion</span>
        </div>
        <nav className="tp-nav">
          <p className="tp-nav-section">Accessibility & Remediation</p>
          <div className="tp-nav-item" onClick={() => navigate("/template")}>
            <span className="tp-nav-icon">📋</span> Template
            <span className="tp-chevron">▸</span>
          </div>
          <div className="tp-nav-item active">
            <span className="tp-nav-icon">✅</span> Validate PDF
          </div>
        </nav>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="tp-main">
        <div className="tp-topbar">
          <div className="tp-breadcrumb">
            <span>Accessibility & Remediation</span>
            <span className="tp-sep">›</span>
            <span className="tp-active">Validate PDF</span>
          </div>
        </div>

        <div className="tp-content">
          <section className="tp-validate-section">
            <h2 className="tp-section-title" style={{ marginBottom: 6 }}>Validate PDF</h2>
            <p className="tp-section-sub" style={{ marginBottom: 20 }}>
              Upload a PDF to run all active accessibility checks on it.
            </p>

            <input ref={pdfInputRef} type="file" accept=".pdf"
              style={{ display: "none" }} onChange={handlePdfSelect} />

            <div className="tp-drop-zone" onClick={() => pdfInputRef.current.click()}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
              <p>{pdfFile ? `✅ ${pdfFile.name}` : "Click to upload PDF"}</p>
              <small>Only .pdf files accepted</small>
            </div>

            {error && (
              <p style={{ color: "#dc2626", fontSize: 13, marginTop: 10 }}>⚠ {error}</p>
            )}

            {pdfFile && (
              <button className="tp-btn tp-btn-primary"
                style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
                onClick={handleValidate}
                disabled={validating}>
                {validating ? "Running checks..." : "✅ Validate PDF"}
              </button>
            )}

            {/* Results from backend */}
            {validationResult && (
              <div className="tp-validation-result" style={{ marginTop: 20 }}>
                <p className="tp-result-title">
                  Validation Results — {getChecks().length} checks run
                </p>

                {getChecks().map((check, i) => (
                  <div key={i} className={`tp-check-row ${check.passed ? "passed" : "failed"}`}>
                    <span>
                      {check.passed ? "✅" : "❌"} {check.check_name || check.name || `Check ${i + 1}`}
                    </span>
                    {check.remediation_guidance && (
                      <span className="tp-check-note">{check.remediation_guidance}</span>
                    )}
                  </div>
                ))}

                {/* Overall message if backend sends one */}
                {validationResult.message && (
                  <div style={{ padding: "10px 14px", fontSize: 13, color: "#166534", borderTop: "1px solid #dbeafe" }}>
                    {validationResult.message}
                  </div>
                )}

                {/* If backend sends no recognizable structure */}
                {getChecks().length === 0 && (
                  <div style={{ padding: "10px 14px", fontSize: 13, color: "#64748b" }}>
                    Validation complete. Raw response: {JSON.stringify(validationResult)}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
