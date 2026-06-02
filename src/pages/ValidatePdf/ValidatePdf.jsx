

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { validatePdf } from "../../services/apiServices";
import "./ValidatePdf.css";

export default function ValidatePdf() {
  const navigate = useNavigate();

  // ── Section states ─────────────────────────────────────────
  const [pdfFile, setPdfFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitError, setSubmitError] = useState("");

  const pdfInputRef = useRef(null);

  // ── File handling ──────────────────────────────────────────
  const handlePdfSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please upload a PDF file (.pdf)");
      return;
    }
    setPdfFile(file);
    setSubmitResult(null);
    setSubmitError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please drop a PDF file (.pdf)");
      return;
    }
    setPdfFile(file);
    setSubmitResult(null);
    setSubmitError("");
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!pdfFile) {
      alert("Please upload a PDF file first.");
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);
    setSubmitError("");

    try {
      const response = await validatePdf(pdfFile);

      if (!response.ok) {
        let errMsg = `Server error: ${response.status}`;
        try {
          const errBody = await response.json();
          errMsg = errBody.detail || errBody.message || errBody.error || JSON.stringify(errBody);
        } catch {
          try {
            const errText = await response.text();
            if (errText) errMsg = errText;
          } catch { /* ignore */ }
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      setSubmitResult(data);
    } catch (err) {
      setSubmitError(err.message || "Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Result helpers ─────────────────────────────────────────
  const getChecks = () => {
    if (!submitResult) return [];
    if (Array.isArray(submitResult)) return submitResult;
    if (Array.isArray(submitResult.checks)) return submitResult.checks;
    if (Array.isArray(submitResult.results)) return submitResult.results;
    if (Array.isArray(submitResult.violations)) return submitResult.violations;
    return [];
  };

  const getSummary = () => {
    if (!submitResult) return null;
    const checks = getChecks();
    const passed = checks.filter((c) => c.passed === true || c.status === "pass" || c.status === "PASS").length;
    const failed = checks.filter((c) => c.passed === false || c.status === "fail" || c.status === "FAIL").length;
    const total = checks.length;
    return { passed, failed, total, passRate: total ? Math.round((passed / total) * 100) : 0 };
  };

  const summary = getSummary();
  const checks = getChecks();

  // Determine overall compliance level
  const getComplianceLevel = () => {
    if (!summary || summary.total === 0) return null;
    if (summary.passRate === 100) return { label: "Fully Compliant", color: "#15803d", bg: "#f0fdf4", border: "#86efac", icon: "✅" };
    if (summary.passRate >= 80)   return { label: "Mostly Compliant", color: "#b45309", bg: "#fffbeb", border: "#fcd34d", icon: "⚠️" };
    return { label: "Non-Compliant", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", icon: "❌" };
  };

  const compliance = getComplianceLevel();

  return (
    <div className="tp-page">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="tp-sidebar">
        <div className="tp-logo">
          <span>Orion</span>
          <small>Accessibility & Remediation</small>
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
            <span>Accessibility &amp; Remediation</span>
            <span className="tp-sep">›</span>
            <span className="tp-active">Validate PDF</span>
          </div>
          {pdfFile && !submitting && (
            <div className="tp-topbar-badge">
              <span className="tp-badge-dot"></span>
              PDF Ready
            </div>
          )}
          {submitting && (
            <div className="tp-topbar-badge tp-topbar-badge--running">
              <span className="tp-badge-spin"></span>
              Validating…
            </div>
          )}
        </div>

        <div className="tp-content">

          {/* ══════════════════════════════════════════════════
              SECTION 1 — Upload PDF
          ══════════════════════════════════════════════════ */}
          <div className="vp-section-card">
            <div className="vp-section-number">1</div>
            <div className="vp-section-inner">
              <div className="vp-section-header">
                <h2 className="vp-section-title">Upload PDF</h2>
                <p className="vp-section-sub">Select or drag-and-drop your PDF file for accessibility validation (VeraPDF / WCAG / PDF/UA).</p>
              </div>

              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={handlePdfSelect}
              />

              <div
                className={`vp-drop-zone ${dragOver ? "drag-over" : ""} ${pdfFile ? "has-file" : ""}`}
                onClick={() => pdfInputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {pdfFile ? (
                  <div className="vp-file-preview">
                    <div className="vp-file-icon">📄</div>
                    <div className="vp-file-info">
                      <span className="vp-file-name">{pdfFile.name}</span>
                      <span className="vp-file-size">{formatBytes(pdfFile.size)}</span>
                    </div>
                    <button
                      className="vp-file-remove"
                      onClick={(e) => { e.stopPropagation(); setPdfFile(null); setSubmitResult(null); setSubmitError(""); }}
                      title="Remove file"
                    >✕</button>
                  </div>
                ) : (
                  <div className="vp-drop-content">
                    <div className="vp-drop-icon">☁</div>
                    <p className="vp-drop-title">Drag &amp; drop your PDF here</p>
                    <p className="vp-drop-sub">or <span className="vp-drop-link">browse to upload</span></p>
                    <p className="vp-drop-hint">Only .pdf files · Max recommended: 50MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              SECTION 2 — Submit / Validate
          ══════════════════════════════════════════════════ */}
          <div className={`vp-section-card ${!pdfFile ? "vp-section-disabled" : ""}`}>
            <div className="vp-section-number">2</div>
            <div className="vp-section-inner">
              <div className="vp-section-header">
                <h2 className="vp-section-title">Run Validation</h2>
                <p className="vp-section-sub">Submit your PDF to run VeraPDF accessibility checks against WCAG 2.1 and PDF/UA standards.</p>
              </div>

              <div className="vp-submit-row">
                <div className="vp-check-tags">
                  <span className="vp-tag">🔍 VeraPDF</span>
                  <span className="vp-tag">📋 PDF/UA</span>
                  <span className="vp-tag">♿ WCAG 2.1</span>
                  <span className="vp-tag">🏷 Tagged PDF</span>
                </div>

                <button
                  className="tp-btn tp-btn-primary vp-submit-btn"
                  onClick={handleSubmit}
                  disabled={!pdfFile || submitting}
                >
                  {submitting ? (
                    <>
                      <span className="vp-btn-spinner"></span>
                      Validating PDF…
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      Run Accessibility Checks
                    </>
                  )}
                </button>
              </div>

              {submitError && (
                <div className="vp-error-box">
                  <span className="vp-error-icon">⚠</span>
                  <div>
                    <p className="vp-error-title">Validation Failed</p>
                    <p className="vp-error-msg">{submitError}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              SECTION 3 — Results
          ══════════════════════════════════════════════════ */}
          <div className={`vp-section-card ${!submitResult ? "vp-section-disabled" : ""}`}>
            <div className="vp-section-number">3</div>
            <div className="vp-section-inner">
              <div className="vp-section-header">
                <h2 className="vp-section-title">Validation Report</h2>
                <p className="vp-section-sub">Detailed accessibility check results for your PDF document.</p>
              </div>

              {!submitResult && !submitting && (
                <div className="vp-results-placeholder">
                  <div className="vp-placeholder-icon">📊</div>
                  <p className="vp-placeholder-title">No results yet</p>
                  <p className="vp-placeholder-sub">Upload a PDF and run validation to see the report here.</p>
                </div>
              )}

              {submitting && (
                <div className="vp-results-placeholder">
                  <div className="vp-scanning-anim">
                    <div className="vp-scan-bar"></div>
                    <div className="vp-pdf-mock">
                      <div></div><div></div><div></div><div></div><div></div>
                    </div>
                  </div>
                  <p className="vp-placeholder-title" style={{ marginTop: 16 }}>Scanning PDF…</p>
                  <p className="vp-placeholder-sub">Running VeraPDF accessibility checks</p>
                </div>
              )}

              {submitResult && !submitting && (
                <>
                  {/* Compliance banner */}
                  {compliance && (
                    <div className="vp-compliance-banner" style={{ background: compliance.bg, borderColor: compliance.border }}>
                      <span className="vp-compliance-icon">{compliance.icon}</span>
                      <div>
                        <p className="vp-compliance-label" style={{ color: compliance.color }}>{compliance.label}</p>
                        <p className="vp-compliance-sub">
                          {summary.passed} passed · {summary.failed} failed · {summary.total} total checks
                        </p>
                      </div>
                      <div className="vp-pass-rate" style={{ color: compliance.color }}>
                        {summary.passRate}%
                        <span>Pass Rate</span>
                      </div>
                    </div>
                  )}

                  {/* Summary stats */}
                  {summary && summary.total > 0 && (
                    <div className="vp-stats-row">
                      <div className="vp-stat-box vp-stat-total">
                        <span className="vp-stat-number">{summary.total}</span>
                        <span className="vp-stat-label">Total Checks</span>
                      </div>
                      <div className="vp-stat-box vp-stat-passed">
                        <span className="vp-stat-number">{summary.passed}</span>
                        <span className="vp-stat-label">Passed</span>
                      </div>
                      <div className="vp-stat-box vp-stat-failed">
                        <span className="vp-stat-number">{summary.failed}</span>
                        <span className="vp-stat-label">Failed</span>
                      </div>
                      <div className="vp-stat-box vp-stat-rate">
                        <span className="vp-stat-number">{summary.passRate}%</span>
                        <span className="vp-stat-label">Compliance</span>
                      </div>
                    </div>
                  )}

                  {/* Checks table */}
                  {checks.length > 0 ? (
                    <div className="vp-results-table-wrap">
                      <table className="vp-results-table">
                        <thead>
                          <tr>
                            <th style={{ width: 60 }}>Status</th>
                            <th>Check / Rule</th>
                            <th>Category</th>
                            <th>Details / Remediation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {checks.map((check, i) => {
                            const isPassed = check.passed === true || check.status === "pass" || check.status === "PASS";
                            const name = check.check_name || check.name || check.rule || `Check ${i + 1}`;
                            const category = check.category || check.type || check.clause || "—";
                            const detail = check.remediation_guidance || check.description || check.message || check.detail || "";
                            return (
                              <tr key={i} className={isPassed ? "vp-row-pass" : "vp-row-fail"}>
                                <td>
                                  <span className={`vp-status-badge ${isPassed ? "pass" : "fail"}`}>
                                    {isPassed ? "✓ Pass" : "✗ Fail"}
                                  </span>
                                </td>
                                <td className="vp-check-name">{name}</td>
                                <td className="vp-check-cat">{category}</td>
                                <td className="vp-check-detail">{detail || "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Raw JSON fallback if checks array is empty but result exists */
                    <div className="vp-raw-result">
                      <p className="vp-raw-label">Raw API Response</p>
                      <pre className="vp-raw-json">{JSON.stringify(submitResult, null, 2)}</pre>
                    </div>
                  )}

                  {/* Success note if fully passed */}
                  {summary && summary.total > 0 && summary.passRate === 100 && (
                    <div className="vp-success-note">
                      🎉 Excellent! Your PDF is fully accessible and meets all checked standards.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
