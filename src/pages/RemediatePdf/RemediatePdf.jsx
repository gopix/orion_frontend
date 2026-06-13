import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./RemediatePdf.css";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export default function RemediatePdf() {
  const navigate = useNavigate();

  const [pdfFile, setPdfFile]       = useState(null);
  const [dragOver, setDragOver]     = useState(false);
  const [mode, setMode]             = useState("auto");   // "auto" | "manual"
  const [standard, setStandard]     = useState("wcag");   // "wcag" | "pdfua"
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [rawResult, setRawResult]   = useState(null);

  const pdfInputRef = useRef(null);

  // ── File validation ──────────────────────────────────────────
  const validateFile = (file) => {
    if (!file) return null;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setSubmitError("Only .pdf files are supported.");
      return null;
    }
    if (file.size > MAX_FILE_SIZE) {
      setSubmitError("File exceeds the 50 MB limit. Please upload a smaller PDF.");
      return null;
    }
    return file;
  };

  const applyFile = (file) => {
    const valid = validateFile(file);
    if (!valid) return;
    setPdfFile(valid);
    setRawResult(null);
    setSubmitError("");
  };

  // ── Handlers ─────────────────────────────────────────────────
  const handlePdfSelect = (e) => {
    const file = e.target.files[0];
    if (file) applyFile(file);
    // reset input so re-selecting same file still fires onChange
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) applyFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPdfFile(null);
    setRawResult(null);
    setSubmitError("");
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // ── Submit ───────────────────────────────────────────────────
  // NOTE: Replace this stub with the real orionRemediatePdf() API call
  // once Gopal Sir exposes the remediate-pdf endpoint.
  const handleSubmit = async () => {
    if (!pdfFile) {
      setSubmitError("Please upload a PDF file first.");
      return;
    }
    setSubmitting(true);
    setRawResult(null);
    setSubmitError("");

    try {
      // TODO: replace with actual API call, e.g.:
      // const orgId     = sessionStorage.getItem("organization_id") || 1;
      // const projectId = sessionStorage.getItem("project_id")      || 1;
      // const response  = await orionRemediatePdf(pdfFile, orgId, projectId, mode, standard);
      // if (!response.ok) { ... handle error ... }
      // const data = await response.json();
      // setRawResult(data);

      // Temporary: simulate a short delay so the loading state is visible
      await new Promise((r) => setTimeout(r, 1500));
      setSubmitError("Remediation API not yet connected. Please check with Gopal Sir.");
    } catch (err) {
      setSubmitError(err.message || "Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived ──────────────────────────────────────────────────
  const statusLabel = () => {
    if (submitting)        return { cls: "chip-running", dot: "dot-amber", text: "Remediating…" };
    if (rawResult)         return { cls: "chip-pass",    dot: "dot-green", text: "Done" };
    if (pdfFile)           return { cls: "chip-ready",   dot: "dot-green", text: "PDF Ready" };
    return null;
  };
  const chip = statusLabel();

  return (
    <div className="rp-page">

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="rp-sidebar">
        <div className="rp-logo">
          <div className="rp-logo-mark">O</div>
          <div className="rp-logo-text">
            <span>ORION</span>
            <small>Accessibility &amp; Remediation</small>
          </div>
        </div>

        <nav className="rp-nav">
          <p className="rp-nav-label">Workspace</p>

          <div className="rp-nav-item" onClick={() => navigate("/template")}>
            <span className="rp-nav-icon">📋</span>
            <span>Template</span>
          </div>

          <div className="rp-nav-item" onClick={() => navigate("/validate-pdf")}>
            <span className="rp-nav-icon">✅</span>
            <span>Validate PDF</span>
          </div>

          <div className="rp-nav-item active">
            <span className="rp-nav-icon">🛠️</span>
            <span>Remediate PDF</span>
            <span className="rp-nav-dot"></span>
          </div>
        </nav>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="rp-main">

        {/* Topbar */}
        <div className="rp-topbar">
          <div className="rp-breadcrumb">
            <span className="rp-bc-root">Accessibility</span>
            <span className="rp-bc-sep">›</span>
            <span className="rp-bc-current">Remediate PDF</span>
          </div>

          <div className="rp-topbar-right">
            {chip && (
              <div className={`rp-status-chip ${chip.cls}`}>
                <span className={`rp-chip-dot ${chip.dot}`}></span>
                {chip.text}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="rp-content">

          {/* ══ STEP 1 — Upload ══ */}
          <section className="rp-step-card">
            <div className="rp-step-inner">
              <div className="rp-step-badge-col">
                <div className="rp-step-badge"><span>1</span></div>
              </div>

              <div className="rp-step-body">
                <div className="rp-step-head">
                  <div>
                    <h2 className="rp-step-title">Upload PDF</h2>
                    <p className="rp-step-desc">
                      Drop a validated PDF. Remediation agents will apply fixes based on your selected mode and compliance standard.
                    </p>
                  </div>
                  <div className="rp-header-pills">
                    <span
                      className="rp-header-pill"
                      style={{ "--pill-color": "#5b21b6", "--pill-bg": "#ede9fe" }}
                    >
                      🛠️ {mode === "auto" ? "Auto-fix" : "Manual"}
                    </span>
                    <span
                      className="rp-header-pill"
                      style={{ "--pill-color": "#065f46", "--pill-bg": "#ecfdf5" }}
                    >
                      🛡️ {standard === "wcag" ? "WCAG 2.1" : "PDF/UA"}
                    </span>
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={handlePdfSelect}
                />

                <div className="rp-upload-row">

                  {/* Drop zone */}
                  <div
                    className={`rp-dropzone${dragOver ? " drag-over" : ""}${pdfFile ? " has-file" : ""}`}
                    onClick={() => pdfInputRef.current.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    {pdfFile ? (
                      <div className="rp-file-preview">
                        <div className="rp-file-pdf-icon"><span>PDF</span></div>
                        <div className="rp-file-info">
                          <span className="rp-file-name">{pdfFile.name}</span>
                          <span className="rp-file-size">{formatBytes(pdfFile.size)}</span>
                          <span className="rp-file-ready">Ready to remediate</span>
                        </div>
                        <button
                          className="rp-remove-btn"
                          onClick={handleRemove}
                          title="Remove file"
                        >✕</button>
                      </div>
                    ) : (
                      <div className="rp-dropzone-content">
                        <div className="rp-drop-cloud">☁</div>
                        <p className="rp-drop-title">Drag &amp; drop your PDF here</p>
                        <p className="rp-drop-hint">
                          or <span className="rp-drop-link">click to browse</span>
                        </p>
                        <p className="rp-drop-note">Only .pdf files · Max 50 MB recommended</p>
                      </div>
                    )}
                  </div>

                  {/* Run panel */}
                  <div className="rp-run-panel">

                    {/* Mode toggle */}
                    <div className="rp-panel-section">
                      <p className="rp-panel-label">Remediation mode</p>
                      <div className="rp-toggle-grid">
                        <div
                          className={`rp-toggle-opt${mode === "auto" ? " sel" : ""}`}
                          onClick={() => setMode("auto")}
                        >
                          <span className="rp-toggle-tag">Mode</span>
                          <span className="rp-toggle-val">Auto-fix</span>
                        </div>
                        <div
                          className={`rp-toggle-opt${mode === "manual" ? " sel" : ""}`}
                          onClick={() => setMode("manual")}
                        >
                          <span className="rp-toggle-tag">Mode</span>
                          <span className="rp-toggle-val">Manual</span>
                        </div>
                      </div>
                    </div>

                    {/* Standard toggle */}
                    <div className="rp-panel-section">
                      <p className="rp-panel-label">Compliance standard</p>
                      <div className="rp-toggle-grid">
                        <div
                          className={`rp-toggle-opt${standard === "wcag" ? " sel" : ""}`}
                          onClick={() => setStandard("wcag")}
                        >
                          <span className="rp-toggle-tag">Standard</span>
                          <span className="rp-toggle-val">WCAG 2.1</span>
                        </div>
                        <div
                          className={`rp-toggle-opt${standard === "pdfua" ? " sel" : ""}`}
                          onClick={() => setStandard("pdfua")}
                        >
                          <span className="rp-toggle-tag">Standard</span>
                          <span className="rp-toggle-val">PDF/UA</span>
                        </div>
                      </div>
                    </div>

                    {/* Run button */}
                    <button
                      className="rp-run-btn"
                      onClick={handleSubmit}
                      disabled={!pdfFile || submitting}
                    >
                      {submitting ? (
                        <><span className="rp-btn-spin"></span> Remediating PDF…</>
                      ) : (
                        <><span className="rp-run-icon">🛠️</span> Start Remediation</>
                      )}
                    </button>

                    {/* Error banner */}
                    {submitError && (
                      <div className="rp-error-banner">
                        <span className="rp-error-ico">⚠</span>
                        <div>
                          <p className="rp-error-ttl">Remediation Failed</p>
                          <p className="rp-error-msg">{submitError}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══ STEP 2 — Report ══ */}
          <section className={`rp-step-card rp-step-card--2${!rawResult && !submitting ? " rp-step-locked" : ""}`}>
            <div className="rp-step-inner">
              <div className="rp-step-badge-col">
                <div className="rp-step-badge rp-step-badge--2"><span>2</span></div>
              </div>

              <div className="rp-step-body">
                <div className="rp-step-head">
                  <div>
                    <h2 className="rp-step-title">Remediation Report</h2>
                    <p className="rp-step-desc">
                      A full breakdown of every fix applied, what was auto-corrected, and what needs your review.
                    </p>
                  </div>
                </div>

                {/* Info tiles — always visible */}
                <div className="rp-info-row">
                  <div className="rp-info-tile">
                    <span className="rp-info-icon">🖼️</span>
                    <div>
                      <span className="rp-info-title">Images</span>
                      <span className="rp-info-desc">Alt-text applied to untagged images</span>
                    </div>
                  </div>
                  <div className="rp-info-tile">
                    <span className="rp-info-icon">🏗️</span>
                    <div>
                      <span className="rp-info-title">Structure</span>
                      <span className="rp-info-desc">Heading hierarchy rebuilt to spec</span>
                    </div>
                  </div>
                  <div className="rp-info-tile">
                    <span className="rp-info-icon">📊</span>
                    <div>
                      <span className="rp-info-title">Tables</span>
                      <span className="rp-info-desc">Scope &amp; summary tags applied</span>
                    </div>
                  </div>
                </div>

                {/* Empty state */}
                {!rawResult && !submitting && (
                  <div className="rp-empty-state">
                    <div className="rp-empty-lock">🔒</div>
                    <p className="rp-empty-title">No results yet</p>
                    <p className="rp-empty-sub">
                      Upload a PDF and start remediation to see the report here.
                    </p>
                  </div>
                )}

                {/* Loading state */}
                {submitting && (
                  <div className="rp-empty-state">
                    <div className="rp-scanning-wrap">
                      <div className="rp-scanning-doc">
                        <div className="rp-scan-beam"></div>
                        <div className="rp-s-line"></div>
                        <div className="rp-s-line short"></div>
                        <div className="rp-s-line"></div>
                        <div className="rp-s-line medium"></div>
                        <div className="rp-s-line"></div>
                      </div>
                    </div>
                    <p className="rp-empty-title" style={{ marginTop: 20 }}>Remediating PDF…</p>
                    <p className="rp-empty-sub">Applying fixes across all remediation agents</p>
                  </div>
                )}

                {/* Results — wire up once API is ready */}
                {rawResult && !submitting && (
                  <div className="rp-results-placeholder">
                    <pre>{JSON.stringify(rawResult, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
